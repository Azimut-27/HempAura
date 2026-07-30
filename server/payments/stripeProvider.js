import Stripe from "stripe";
import { serverConfig } from "../config/serverConfig.js";
import { readRawBody } from "../lib/http.js";
import { extractPromotionCodeReference } from "../referrals/referralProgram.js";
import { PaymentProvider } from "./PaymentProvider.js";

const SUPPORTED_CHECKOUT_LOCALES = new Set(["sl", "en", "de"]);

export class StripePaymentProvider extends PaymentProvider {
  constructor() {
    super();
    if (!serverConfig.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is missing.");
    this.stripe = new Stripe(serverConfig.stripeSecretKey);
  }

  async createCheckoutSession(orderDraft) {
    const referral = orderDraft.referral || null;
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: orderDraft.customerEmail || undefined,
      phone_number_collection: { enabled: true },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["SI"] },
      line_items: orderDraft.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.unitPriceCents,
          tax_behavior: item.taxBehavior,
          product_data: {
            name: item.name,
            ...(serverConfig.taxCalculationMode === "stripe" && item.taxCode
              ? { tax_code: item.taxCode }
              : {}),
            metadata: {
              product_id: item.productId,
              sku: item.sku,
              vat_rate_percent: String(item.taxRatePercent),
            },
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: orderDraft.shippingCents,
              currency: "eur",
            },
            display_name:
              orderDraft.shippingCents === 0
                ? "Brezplačna standardna dostava"
                : "Standardna dostava",
            delivery_estimate:
              Number.isInteger(serverConfig.shipping.siMinDays) &&
              Number.isInteger(serverConfig.shipping.siMaxDays)
                ? {
                    minimum: {
                      unit: "business_day",
                      value: serverConfig.shipping.siMinDays,
                    },
                    maximum: {
                      unit: "business_day",
                      value: serverConfig.shipping.siMaxDays,
                    },
                  }
                : undefined,
          },
        },
      ],
      success_url: `${serverConfig.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${serverConfig.siteUrl}/checkout/cancel`,
      client_reference_id: orderDraft.orderReference,
      metadata: {
        order_reference: orderDraft.orderReference,
        cart: JSON.stringify(
          orderDraft.items.map(({ productId, quantity }) => ({ productId, quantity }))
        ),
        ...(referral
          ? {
              referral_code: referral.code,
              referral_promotion_code_id: referral.stripePromotionCodeId,
            }
          : {}),
      },
      payment_intent_data: {
        metadata: {
          order_reference: orderDraft.orderReference,
          ...(referral ? { referral_code: referral.code } : {}),
        },
      },
      locale: SUPPORTED_CHECKOUT_LOCALES.has(orderDraft.locale)
        ? orderDraft.locale
        : "sl",
      ...(referral
        ? {
            discounts: [
              { promotion_code: referral.stripePromotionCodeId },
            ],
          }
        : { allow_promotion_codes: true }),
    });

    return { id: session.id, url: session.url };
  }

  async verifyWebhook(request) {
    if (!serverConfig.stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is missing.");
    }
    const signature = request.headers["stripe-signature"];
    if (!signature) throw new Error("Stripe signature is missing.");
    const rawBody = await readRawBody(request);
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      serverConfig.stripeWebhookSecret
    );
  }

  async retrievePayment(reference) {
    const session = await this.stripe.checkout.sessions.retrieve(reference, {
      expand: ["line_items", "payment_intent"],
    });
    const referenceFromDiscount = extractPromotionCodeReference(session);
    const promotionCodeId =
      referenceFromDiscount.id ||
      session.metadata?.referral_promotion_code_id ||
      "";
    if (promotionCodeId.startsWith("promo_")) {
      session._hempAuraPromotionCode =
        await this.stripe.promotionCodes.retrieve(promotionCodeId);
    }
    return session;
  }

  normalizePaymentEvent(event) {
    const session = event.data.object;
    const promotionCode = extractPromotionCodeReference(session);
    return {
      provider: "stripe",
      eventId: event.id,
      type: event.type,
      sessionId: session.id,
      paymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      paymentStatus: session.payment_status || "unknown",
      customerEmail: session.customer_details?.email || session.customer_email || null,
      customerName: session.customer_details?.name || null,
      shippingAddress: session.shipping_details?.address
        ? {
            ...session.shipping_details.address,
            name:
              session.shipping_details.name ||
              session.customer_details?.name ||
              null,
            phone:
              session.shipping_details.phone ||
              session.customer_details?.phone ||
              null,
            email:
              session.customer_details?.email ||
              session.customer_email ||
              null,
          }
        : null,
      billingAddress: session.customer_details?.address || null,
      currency: (session.currency || "eur").toUpperCase(),
      totalCents: session.amount_total,
      subtotalCents: session.amount_subtotal,
      discountCents: session.total_details?.amount_discount || 0,
      shippingCents: session.total_details?.amount_shipping || 0,
      taxCents: session.total_details?.amount_tax || 0,
      stripePromotionCodeId:
        promotionCode.id ||
        session.metadata?.referral_promotion_code_id ||
        null,
      promotionCode:
        promotionCode.code ||
        session.metadata?.referral_code ||
        null,
      orderReference:
        session.metadata?.order_reference || session.client_reference_id || null,
      cart: session.metadata?.cart ? JSON.parse(session.metadata.cart) : [],
    };
  }
}
