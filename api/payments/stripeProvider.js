import Stripe from "stripe";
import { serverConfig } from "../config/serverConfig.js";
import { readRawBody } from "../lib/http.js";
import { PaymentProvider } from "./PaymentProvider.js";

export class StripePaymentProvider extends PaymentProvider {
  constructor() {
    super();
    if (!serverConfig.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is missing.");
    this.stripe = new Stripe(serverConfig.stripeSecretKey);
  }

  async createCheckoutSession(orderDraft) {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: orderDraft.customerEmail || undefined,
      billing_address_collection: "required",
      consent_collection: { terms_of_service: "required" },
      shipping_address_collection: { allowed_countries: ["SI"] },
      line_items: orderDraft.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.unitPriceCents,
          product_data: {
            name: item.name,
            metadata: {
              product_id: item.productId,
              sku: item.sku,
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
      },
      payment_intent_data: {
        metadata: { order_reference: orderDraft.orderReference },
      },
      locale: "sl",
      allow_promotion_codes: false,
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
    return this.stripe.checkout.sessions.retrieve(reference, {
      expand: ["line_items", "payment_intent"],
    });
  }

  normalizePaymentEvent(event) {
    const session = event.data.object;
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
      shippingAddress: session.shipping_details?.address || null,
      billingAddress: session.customer_details?.address || null,
      currency: (session.currency || "eur").toUpperCase(),
      totalCents: session.amount_total,
      subtotalCents: session.amount_subtotal,
      shippingCents: session.total_details?.amount_shipping || 0,
      taxCents: session.total_details?.amount_tax || 0,
      orderReference:
        session.metadata?.order_reference || session.client_reference_id || null,
      cart: session.metadata?.cart ? JSON.parse(session.metadata.cart) : [],
    };
  }
}
