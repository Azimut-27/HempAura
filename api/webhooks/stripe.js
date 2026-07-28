import {
  NewOrderNotificationEmail,
  OrderConfirmationEmail,
} from "../../server/emails/templates.js";
import { serverConfig } from "../../server/config/serverConfig.js";
import { getServerProduct } from "../../server/data/serverProducts.js";
import { safeError, sendJson } from "../../server/lib/http.js";
import { getPaymentProvider } from "../../server/payments/index.js";
import { database } from "../../server/repositories/database.js";
import {
  isEmailConfigured,
  sendEmail,
} from "../../server/services/email.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handledTypes = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

async function deliverOrderEmail({
  order,
  kind,
  recipient,
  subject,
  html,
}) {
  if (!recipient) {
    throw new Error(`Missing recipient for ${kind}.`);
  }

  const delivery = await database.claimOrderEmailDelivery(
    order.id,
    kind,
    recipient
  );
  if (!delivery) return { skipped: true };

  try {
    const email = await sendEmail({
      to: recipient,
      subject,
      html,
      idempotencyKey: `hempaura-${kind}-${order.id}`,
    });
    await database.updateOrderEmailDelivery(delivery.id, {
      provider_email_id: email.id,
      status: "sent",
      sent_at: new Date().toISOString(),
      last_error: null,
    });
    return { skipped: false, id: email.id };
  } catch (error) {
    await database.updateOrderEmailDelivery(delivery.id, {
      status: "failed",
      last_error: String(error?.message || "Email delivery failed.").slice(0, 500),
    });
    throw error;
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { message: "Metoda ni dovoljena." });
    return;
  }

  let event;
  try {
    event = await getPaymentProvider().verifyWebhook(request);
  } catch (error) {
    safeError(error, "stripe-signature");
    sendJson(response, 400, { message: "Neveljaven podpis." });
    return;
  }

  if (!handledTypes.has(event.type)) {
    sendJson(response, 200, { received: true, ignored: true });
    return;
  }

  try {
    const claimed = await database.claimPaymentEvent({
      provider: "stripe",
      provider_event_id: event.id,
      type: event.type,
      processed_at: null,
      payload_summary_json: {
        object_id: event.data.object?.id,
        livemode: event.livemode,
      },
      status: "processing",
    });
    if (!claimed) {
      sendJson(response, 200, { received: true, duplicate: true });
      return;
    }

    const provider = getPaymentProvider();
    const session = await provider.retrievePayment(event.data.object.id);
    const payment = provider.normalizePaymentEvent({
      ...event,
      data: { object: session },
    });

    const orderItems = payment.cart.map((line) => {
      const product = getServerProduct(line.productId);
      if (!product?.active || !Number.isInteger(product.priceCents)) {
        throw new Error("Webhook contains an unavailable product.");
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
        throw new Error("Webhook contains an invalid quantity.");
      }
      return {
        product_id: product.id,
        sku_snapshot: product.sku,
        name_snapshot: product.name,
        quantity: line.quantity,
        unit_price_cents: product.priceCents,
        line_total_cents: product.priceCents * line.quantity,
      };
    });

    const calculatedSubtotal = orderItems.reduce(
      (sum, item) => sum + item.line_total_cents,
      0
    );
    const calculatedTotal =
      calculatedSubtotal + payment.shippingCents + payment.taxCents;
    if (
      calculatedSubtotal !== payment.subtotalCents ||
      calculatedTotal !== payment.totalCents
    ) {
      throw new Error("Provider totals do not match the server-side catalogue.");
    }

    const paymentStatus =
      event.type === "checkout.session.async_payment_failed"
        ? "failed"
        : payment.paymentStatus === "paid"
          ? "paid"
          : "pending";

    let order = await database.getOrderByProviderSession(payment.sessionId);
    if (!order) {
      order = await database.createOrderWithItems(
        {
          public_order_number: payment.orderReference,
          provider: "stripe",
          provider_session_id: payment.sessionId,
          provider_payment_id: payment.paymentId,
          customer_email: payment.customerEmail,
          customer_name: payment.customerName,
          currency: payment.currency,
          subtotal_cents: calculatedSubtotal,
          shipping_cents: payment.shippingCents,
          tax_cents: payment.taxCents,
          total_cents: calculatedTotal,
          payment_status: paymentStatus,
          fulfillment_status: "unfulfilled",
          shipping_address_json: payment.shippingAddress,
          billing_address_json: payment.billingAddress,
        },
        orderItems
      );
    } else {
      order = await database.updateOrderPaymentStatus(
        payment.sessionId,
        paymentStatus,
        payment.paymentId
      );
    }

    let eventStatus = "processed";
    if (paymentStatus === "paid") {
      if (!isEmailConfigured()) {
        eventStatus = "email_configuration_required";
      } else {
        const total = new Intl.NumberFormat("sl-SI", {
          style: "currency",
          currency: payment.currency,
        }).format(calculatedTotal / 100);
        const shipping = new Intl.NumberFormat("sl-SI", {
          style: "currency",
          currency: payment.currency,
        }).format(payment.shippingCents / 100);
        const emailItems = orderItems.map((item) => ({
          name: item.name_snapshot,
          quantity: item.quantity,
        }));
        const emailResults = await Promise.allSettled([
          deliverOrderEmail({
            order,
            kind: "customer_confirmation",
            recipient: payment.customerEmail,
            subject: `Potrditev naročila ${order.public_order_number} | HempAura`,
            html: OrderConfirmationEmail({
              name: payment.customerName,
              orderNumber: order.public_order_number,
              items: emailItems,
              shipping,
              total,
              supportEmail: serverConfig.supportEmail,
            }),
          }),
          deliverOrderEmail({
            order,
            kind: "owner_notification",
            recipient: serverConfig.contactToEmail,
            subject: `Novo plačano naročilo ${order.public_order_number}`,
            html: NewOrderNotificationEmail({
              orderNumber: order.public_order_number,
              customerEmail: payment.customerEmail,
              items: emailItems,
              shipping,
              total,
            }),
          }),
        ]);
        if (emailResults.some((result) => result.status === "rejected")) {
          eventStatus = "email_retry_required";
        }
      }
    }

    await database.updatePaymentEvent(event.id, {
      processed_at: new Date().toISOString(),
      status: eventStatus,
    });
    sendJson(response, 200, {
      received: true,
      emailStatus: eventStatus,
    });
  } catch (error) {
    safeError(error, "stripe-webhook");
    try {
      await database.updatePaymentEvent(event.id, {
        processed_at: new Date().toISOString(),
        status: "failed",
        payload_summary_json: {
          object_id: event.data.object?.id,
          error: error.message,
        },
      });
    } catch (updateError) {
      safeError(updateError, "stripe-webhook-event-update");
    }
    sendJson(response, 500, {
      message: "Dogodka trenutno ni bilo mogoče obdelati.",
    });
  }
}
