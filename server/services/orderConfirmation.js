import {
  NewOrderNotificationEmail,
  OrderConfirmationEmail,
} from "../emails/templates.js";
import { serverConfig } from "../config/serverConfig.js";
import { safeError } from "../lib/http.js";
import { database } from "../repositories/database.js";
import { isEmailConfigured, sendEmail } from "./email.js";

export async function deliverOrderEmail({
  order,
  kind,
  recipient,
  subject,
  html,
}) {
  if (!recipient) {
    throw new Error(`Missing recipient for ${kind}.`);
  }

  let delivery = null;
  try {
    delivery = await database.claimOrderEmailDelivery(
      order.id,
      kind,
      recipient
    );
    if (!delivery) return { skipped: true };
  } catch (error) {
    safeError(error, `claimOrderEmailDelivery-${kind}`);
  }

  try {
    const email = await sendEmail({
      to: recipient,
      subject,
      html,
      idempotencyKey: `hempaura-${kind}-${order.id}`,
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
    throw error;
  }
}

export async function sendPaidOrderConfirmationEmails(order) {
  if (!order || !isEmailConfigured()) return;
  const items = Array.isArray(order.order_items)
    ? order.order_items
    : order.order_items
    ? [order.order_items]
    : [];

  const formattedTotal = new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
  }).format((order.total_cents || 0) / 100);

  const formattedAddress = order.shipping_address_json
    ? `${order.shipping_address_json.line1}, ${order.shipping_address_json.postal_code} ${order.shipping_address_json.city}`
    : "Slovenija";

  const formattedShipping =
    order.shipping_cents === 0
      ? "Brezplačna dostava (GLS)"
      : `${((order.shipping_cents || 0) / 100).toFixed(2).replace(".", ",")} € (GLS)`;

  await Promise.allSettled([
    deliverOrderEmail({
      order,
      kind: "customer_confirmation",
      recipient: order.customer_email,
      subject: `Potrdilo plačila in naročila ${order.public_order_number} | HerbaGallus`,
      html: OrderConfirmationEmail({
        name: order.customer_name,
        orderNumber: order.public_order_number,
        items: items.map((i) => ({
          name: i.name_snapshot,
          quantity: i.quantity,
          price: ((i.unit_price_cents || 0) / 100).toFixed(2).replace(".", ","),
          total: (((i.unit_price_cents || 0) * (i.quantity || 1)) / 100).toFixed(2).replace(".", ","),
        })),
        shipping: formattedShipping,
        total: formattedTotal,
        currency: "EUR",
        paymentMethod: "card",
        deliveryAddress: formattedAddress,
        supportEmail: serverConfig.supportEmail,
      }),
    }),
    deliverOrderEmail({
      order,
      kind: "owner_notification",
      recipient: serverConfig.contactToEmail || serverConfig.supportEmail,
      subject: `Novo plačano naročilo (xMoney) ${order.public_order_number} | ${formattedTotal}`,
      html: NewOrderNotificationEmail({
        orderNumber: order.public_order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        items: items.map((i) => ({
          name: i.name_snapshot,
          quantity: i.quantity,
          price: ((i.unit_price_cents || 0) / 100).toFixed(2).replace(".", ","),
          total: (((i.unit_price_cents || 0) * (i.quantity || 1)) / 100).toFixed(2).replace(".", ","),
        })),
        shipping: formattedShipping,
        total: formattedTotal,
        currency: "EUR",
        paymentMethod: "card",
        deliveryAddress: formattedAddress,
        supportEmail: serverConfig.supportEmail,
      }),
    }),
  ]);
}
