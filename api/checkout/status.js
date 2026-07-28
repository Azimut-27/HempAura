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
  const sessionId =
    typeof request.query.session_id === "string" ? request.query.session_id : "";
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    sendJson(response, 400, { message: "Identifikator seje ni veljaven." });
    return;
  }

  try {
    const provider = getPaymentProvider();
    const session = await provider.retrievePayment(sessionId);
    const order = serverConfig.supabaseUrl
      ? await database.getOrderByProviderSession(sessionId)
      : null;
    const orderReference =
      session.metadata?.order_reference || session.client_reference_id || null;

    if (session.payment_status === "paid" && order?.payment_status === "paid") {
      sendJson(response, 200, {
        status: "confirmed",
        message: "Plačilo je preverjeno, naročilo pa je zabeleženo.",
        orderNumber: order.public_order_number,
      });
      return;
    }
    if (session.payment_status === "paid") {
      sendJson(response, 200, {
        status: serverConfig.supabaseUrl ? "processing" : "confirmed",
        message:
          serverConfig.supabaseUrl
            ? "Plačilo je pri ponudniku označeno kot plačano, zapis naročila pa se še obdeluje."
            : "Plačilo je potrjeno v Stripe testnem okolju. Zapis naročila bomo povezali v naslednjem koraku s Supabase.",
        orderNumber: orderReference,
      });
      return;
    }
    sendJson(response, 200, {
      status: "unconfirmed",
      message: "Plačilo še ni potrjeno.",
    });
  } catch (error) {
    safeError(error, "checkout-status");
    sendJson(response, 500, { message: "Stanja trenutno ni mogoče preveriti." });
  }
}
