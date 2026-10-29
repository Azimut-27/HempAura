import { serverConfig } from "../../server/config/serverConfig.js";
import { getServerProduct } from "../../server/data/serverProducts.js";
import {
  CodNewOrderNotificationEmail,
  CodOrderConfirmationEmail,
} from "../../server/emails/templates.js";
import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../../server/lib/http.js";
import { generateOrderNumber } from "../../server/lib/orderNumber.js";
import { rateLimit } from "../../server/lib/rateLimit.js";
import { directOrderSchema } from "../../server/lib/validation.js";
import {
  calculateReferralDiscountCents,
  normalizeReferralCode,
} from "../../server/referrals/referralProgram.js";
import { database } from "../../server/repositories/database.js";
import {
  isEmailConfigured,
  sendEmail,
} from "../../server/services/email.js";
import { calculateShipping } from "../../server/services/shipping.js";
import { splitGlsStreetAddress } from "../../server/shipping/glsShipment.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function deliverOrderEmail({
  order,
  kind,
  recipient,
  subject,
  html,
}) {
  if (!recipient) return { skipped: true };

  let delivery = null;
  const isUuid = typeof order?.id === "string" && UUID_REGEX.test(order.id);

  if (isUuid) {
    try {
      delivery = await database.claimOrderEmailDelivery(
        order.id,
        kind,
        recipient
      );
    } catch (error) {
      safeError(error, `claimOrderEmailDelivery-${kind}`);
    }
  }

  try {
    const email = await sendEmail({
      to: recipient,
      subject,
      html,
      replyTo: serverConfig.supportEmail || undefined,
    });
    if (delivery?.id) {
      try {
        await database.updateOrderEmailDelivery(delivery.id, {
          provider_email_id: email?.id,
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
        });
      } catch (updateError) {
        safeError(updateError, `updateOrderEmailDelivery-${kind}`);
      }
    }
    return { skipped: false, id: email?.id };
  } catch (error) {
    if (delivery?.id) {
      try {
        await database.updateOrderEmailDelivery(delivery.id, {
          status: "failed",
          last_error: String(error?.message || "Email delivery failed.").slice(0, 500),
        });
      } catch (updateError) {
        safeError(updateError, `updateOrderEmailDeliveryFail-${kind}`);
      }
    }
    safeError(error, `sendOrderEmail-${kind}`);
    return { skipped: true, error: error?.message };
  }
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, "POST")) return;
  if (!validateSameOrigin(request)) {
    sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
    return;
  }
  if (!serverConfig.paymentsEnabled) {
    sendJson(response, 503, {
      message: "Prodaja še ni odprta. Naročilo ni bilo oddano.",
    });
    return;
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`direct-order:${ip}`, serverConfig.checkoutRateLimit);
  if (!limit.allowed) {
    response.setHeader("Retry-After", limit.retryAfterSeconds);
    sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
    return;
  }

  const parsed = directOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Vneseni podatki niso veljavni.";
    sendJson(response, 400, { message: firstIssue });
    return;
  }

  const { customer, shippingAddress, notes, paymentMethod } = parsed.data;

  // Validate street address for GLS compatibility
  try {
    splitGlsStreetAddress(shippingAddress.line1, shippingAddress.line2 || "");
  } catch {
    sendJson(response, 400, {
      message:
        "Naslov za dostavo mora vsebovati ime ulice in hišno številko (npr. Slovenska cesta 15).",
    });
    return;
  }

  // Validate postal code for Slovenia
  const postalCode = shippingAddress.postalCode.trim();
  if (!/^\d{4}$/.test(postalCode)) {
    sendJson(response, 400, {
      message: "Vnesite veljavno 4-mestno poštno številko v Sloveniji (npr. 1000).",
    });
    return;
  }

  try {
    const items = parsed.data.items.map((line) => {
      const product = getServerProduct(line.productId);
      if (!product) throw new Error("Neznan izdelek v košarici.");
      if (!product.active) throw new Error("Izdelek trenutno ni na voljo.");
      if (!Number.isInteger(product.priceCents) || product.priceCents < 0) {
        throw new Error("Cena izdelka ni nastavljena.");
      }
      if (line.quantity > product.stock) {
        throw new Error(`Na zalogi ni dovolj kosov za izdelek ${product.name}.`);
      }
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: line.quantity,
        unitPriceCents: product.priceCents,
      };
    });

    const subtotalCents = items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );

    const shippingCents = calculateShipping({
      country: "SI",
      subtotalCents,
    });

    const referralCode = normalizeReferralCode(parsed.data.referralCode || "");
    let referralPartner = null;
    let discountCents = 0;

    if (referralCode) {
      try {
        referralPartner = await database.getActiveReferralPartnerByCode(referralCode);
        if (referralPartner && referralPartner.customer_discount_percent > 0) {
          discountCents = calculateReferralDiscountCents(
            subtotalCents,
            referralPartner.customer_discount_percent
          );
        }
      } catch (refError) {
        safeError(refError, "checkout-order-referral");
      }
    }

    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);
    const orderNumber = generateOrderNumber();
    const provider = paymentMethod || "cod";
    const providerSessionId = `${provider}_${orderNumber}`;
    const paymentStatus = provider === "cod" ? "cod_pending" : "proforma_pending";

    const orderItems = items.map((item) => ({
      product_id: item.productId,
      sku_snapshot: item.sku,
      name_snapshot: item.name,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      line_total_cents: item.unitPriceCents * item.quantity,
    }));

    const shippingAddressJson = {
      name: shippingAddress.name || customer.name,
      line1: shippingAddress.line1.trim(),
      line2: (shippingAddress.line2 || "").trim(),
      postal_code: postalCode,
      city: shippingAddress.city.trim(),
      country: "SI",
      phone: customer.phone.trim(),
      notes: (notes || "").trim(),
    };

    const billingAddressJson = {
      name: customer.name.trim(),
      line1: shippingAddress.line1.trim(),
      line2: (shippingAddress.line2 || "").trim(),
      postal_code: postalCode,
      city: shippingAddress.city.trim(),
      country: "SI",
      phone: customer.phone.trim(),
    };

    let order = null;
    try {
      order = await database.createOrderWithItems(
        {
          public_order_number: orderNumber,
          provider,
          provider_session_id: providerSessionId,
          provider_payment_id: null,
          customer_email: customer.email,
          customer_name: customer.name,
          currency: "EUR",
          subtotal_cents: subtotalCents,
          discount_cents: discountCents,
          shipping_cents: shippingCents,
          tax_cents: 0,
          total_cents: totalCents,
          payment_status: paymentStatus,
          fulfillment_status: "unfulfilled",
          promotion_code: referralPartner?.public_code || null,
          stripe_promotion_code_id: referralPartner?.stripe_promotion_code_id || null,
          shipping_address_json: shippingAddressJson,
          billing_address_json: billingAddressJson,
        },
        orderItems
      );
    } catch (dbError) {
      safeError(dbError, "createOrderWithItems-direct");
      throw new Error("Napaka pri shranjevanju naročila v bazo.");
    }

    if (referralPartner && order?.id) {
      try {
        await database.recordReferralConversion({
          orderId: order.id,
          providerSessionId,
          stripePromotionCodeId: referralPartner.stripe_promotion_code_id || "",
          promotionCode: referralPartner.public_code,
          currency: "EUR",
          grossSubtotalCents: subtotalCents,
          discountCents,
        });
      } catch (refConvError) {
        safeError(refConvError, "recordReferralConversion-direct");
      }
    }

    // Format strings for email notification
    const formattedAddress = `${shippingAddressJson.line1}${
      shippingAddressJson.line2 ? `, ${shippingAddressJson.line2}` : ""
    }, ${shippingAddressJson.postal_code} ${shippingAddressJson.city}`;
    const formattedShipping =
      shippingCents === 0
        ? "Brezplačna dostava (GLS)"
        : `${(shippingCents / 100).toFixed(2).replace(".", ",")} € (GLS)`;
    const formattedTotal = `${(totalCents / 100).toFixed(2).replace(".", ",")} €`;

    if (isEmailConfigured()) {
      let customerEmailNotice = null;

      // 1. Send confirmation to customer
      try {
        const customerResult = await deliverOrderEmail({
          order: order || { id: providerSessionId, public_order_number: orderNumber },
          kind: "customer_confirmation",
          recipient: customer.email,
          subject:
            provider === "proforma"
              ? `Predračun in podatki za UPN plačilo: ${orderNumber} | HerbaGallus`
              : `Potrdilo naročila ${orderNumber} | HerbaGallus`,
          html: CodOrderConfirmationEmail({
            name: customer.name,
            orderNumber,
            items,
            shipping: formattedShipping,
            total: formattedTotal,
            paymentMethod: provider,
            deliveryAddress: formattedAddress,
            phone: customer.phone,
            supportEmail: serverConfig.supportEmail,
          }),
        });
        if (customerResult.error) {
          customerEmailNotice = `OPOZORILO: Potrditveno e-sporočilo za kupca (${customer.email}) ni bilo dostavljeno: ${customerResult.error}`;
        }
      } catch (emailErr) {
        safeError(emailErr, "customer-order-email");
        customerEmailNotice = `OPOZORILO: Napaka pri pošiljanju potrdila kupcu (${customer.email}): ${emailErr.message}`;
      }

      // 2. Send alert to store owner (uses kind: "owner_notification" to match database constraint)
      try {
        const ownerEmail = serverConfig.contactToEmail || serverConfig.supportEmail;
        await deliverOrderEmail({
          order: order || { id: providerSessionId, public_order_number: orderNumber },
          kind: "owner_notification",
          recipient: ownerEmail,
          subject: `Novo naročilo ${orderNumber} (${
            provider === "cod" ? "Prevzem" : "Predračun"
          }) | ${formattedTotal}`,
          html: CodNewOrderNotificationEmail({
            orderNumber,
            customerName: customer.name,
            customerEmail: customer.email,
            phone: customer.phone,
            items,
            shipping: formattedShipping,
            total: formattedTotal,
            paymentMethod: provider,
            deliveryAddress: formattedAddress,
            notes,
            customerEmailNotice,
          }),
        });
      } catch (adminEmailErr) {
        safeError(adminEmailErr, "admin-order-email");
      }
    }

    sendJson(response, 200, {
      success: true,
      orderNumber,
      paymentMethod: provider,
      totalCents,
    });
  } catch (error) {
    safeError(error, "direct-order-create");
    sendJson(response, 400, {
      message:
        error.message ||
        "Naročila ni bilo mogoče oddati. Preverite vnesene podatke ali poskusite pozneje.",
    });
  }
}
