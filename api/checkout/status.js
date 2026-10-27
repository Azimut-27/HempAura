import { serverConfig } from "../../server/config/serverConfig.js";
import { safeError, sendJson } from "../../server/lib/http.js";
import { getPaymentProvider } from "../../server/payments/index.js";
import { database } from "../../server/repositories/database.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { message: "Metoda ni dovoljena." });
    return;
  }

  let sessionId = "";
  if (typeof request.query?.session_id === "string") {
    sessionId = request.query.session_id.trim();
  } else if (typeof request.url === "string") {
    try {
      const url = new URL(request.url, "http://localhost");
      sessionId = String(url.searchParams.get("session_id") || "").trim();
    } catch {
      sessionId = "";
    }
  }

  if (!/^cs_(test_|live_)?[A-Za-z0-9_-]+$/.test(sessionId)) {
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

    if (session.payment_status === "paid" && order?.payment_status === "paid") {
      sendJson(response, 200, {
        status: "confirmed",
        message: "Plačilo je preverjeno, naročilo pa je zabeleženo.",
        orderNumber: order.public_order_number || orderReference,
      });
      return;
    }

    if (session.payment_status === "paid") {
      sendJson(response, 200, {
        status: order ? "confirmed" : "processing",
        message: order
          ? "Plačilo je preverjeno."
          : "Plačilo je bilo pri ponudniku uspešno izvedeno. Zapis naročila se obdeluje.",
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
