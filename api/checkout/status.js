import { serverConfig } from "../../server/config/serverConfig.js";
import { safeError, sendJson } from "../../server/lib/http.js";
import { getPaymentProvider } from "../../server/payments/index.js";
import { database } from "../../server/repositories/database.js";
import { sendPaidOrderConfirmationEmails } from "../../server/services/orderConfirmation.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { message: "Metoda ni dovoljena." });
    return;
  }

  let sessionId = "";
  let orderNumber = "";
  if (typeof request.query?.session_id === "string") {
    sessionId = request.query.session_id.trim();
  }
  if (typeof request.query?.order_number === "string") {
    orderNumber = request.query.order_number.trim();
  }

  if (typeof request.url === "string") {
    try {
      const url = new URL(request.url, "http://localhost");
      if (!sessionId) {
        sessionId = String(url.searchParams.get("session_id") || "").trim();
      }
      if (!orderNumber) {
        orderNumber = String(url.searchParams.get("order_number") || "").trim();
      }
    } catch {}
  }

  // Handle direct order number lookup (xMoney or direct order status)
  if (orderNumber) {
    if (!/^[A-Za-z0-9_-]{5,32}$/.test(orderNumber)) {
      sendJson(response, 400, { message: "Številka naročila ni veljavna." });
      return;
    }

    try {
      let order = null;
      if (serverConfig.supabaseUrl && serverConfig.supabaseServiceRoleKey) {
        try {
          order = await database.getOrderByPublicNumber(orderNumber);
        } catch (dbError) {
          safeError(dbError, "checkout-status-db-order");
        }
      }

      if (order) {
        if (order.payment_status === "paid") {
          sendJson(response, 200, {
            status: "confirmed",
            message: "Plačilo je bilo uspešno izvedeno in potrjeno.",
            orderNumber: order.public_order_number,
          });
          return;
        }

        // If unpaid xMoney order, verify with xMoney API and trigger emails if confirmed
        if (order.provider === "xmoney" || order.payment_status === "unpaid") {
          try {
            const xMoneyModule = await import("@xmoney/api-sdk");
            const XMoneyClass = xMoneyModule.default?.default || xMoneyModule.default || xMoneyModule;
            const xmoneyClient = new XMoneyClass({ secretKey: serverConfig.xmoneySecretKey });
            const xmOrder = await xmoneyClient.getOrder(order.public_order_number);
            const xmStatus = xmOrder?.data?.orderStatus || xmOrder?.data?.status;

            if (xmStatus === "complete-ok") {
              try {
                await database.updateOrderPaymentStatusByOrderNumber(
                  order.public_order_number,
                  "paid",
                  String(xmOrder?.data?.id || "")
                );
                order.payment_status = "paid";
              } catch (dbUpdateErr) {
                safeError(dbUpdateErr, "checkout-status-xmoney-update");
              }

              try {
                await sendPaidOrderConfirmationEmails(order);
              } catch (emailErr) {
                safeError(emailErr, "checkout-status-email");
              }

              sendJson(response, 200, {
                status: "confirmed",
                message: "Plačilo s kartico je bilo uspešno potrjeno.",
                orderNumber: order.public_order_number,
              });
              return;
            }
          } catch (xmErr) {
            safeError(xmErr, "checkout-status-xmoney-check");
          }
        }

        sendJson(response, 200, {
          status: "unconfirmed",
          message: "Plačilo še ni potrjeno.",
          orderNumber: order.public_order_number,
        });
        return;
      }

      sendJson(response, 404, { message: "Naročilo ni bilo najdeno." });
      return;
    } catch (orderStatusErr) {
      safeError(orderStatusErr, "checkout-status-order");
      sendJson(response, 500, { message: "Stanja trenutno ni mogoče preveriti." });
      return;
    }
  }

  if (!sessionId || !/^cs_(test_|live_)?[A-Za-z0-9_-]+$/.test(sessionId)) {
    sendJson(response, 400, { message: "Identifikator seje ni veljaven." });
    return;
  }

  try {
    const provider = getPaymentProvider();
    const session = await provider.retrievePayment(sessionId);
    const orderReference =
      session.metadata?.order_reference || session.client_reference_id || null;

    let order = null;
    if (serverConfig.supabaseUrl && serverConfig.supabaseServiceRoleKey) {
      try {
        order = await database.getOrderByProviderSession(sessionId);
      } catch (dbError) {
        safeError(dbError, "checkout-status-db");
      }
    }

    if (session.payment_status === "paid") {
      sendJson(response, 200, {
        status: "confirmed",
        message: "Plačilo je bilo pri ponudniku uspešno izvedeno in potrjeno.",
        orderNumber: order?.public_order_number || orderReference,
      });
      return;
    }

    sendJson(response, 200, {
      status: "unconfirmed",
      message: "Plačilo še ni potrjeno.",
      orderNumber: orderReference,
    });
  } catch (error) {
    safeError(error, "checkout-status");
    sendJson(response, 500, { message: "Stanja trenutno ni mogoče preveriti." });
  }
}
