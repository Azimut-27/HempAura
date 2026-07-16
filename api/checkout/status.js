import { safeError, sendJson } from "../lib/http.js";
import { getPaymentProvider } from "../payments/index.js";
import { database } from "../repositories/database.js";

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
    const order = await database.getOrderByProviderSession(sessionId);

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
        status: "processing",
        message:
          "Plačilo je pri ponudniku označeno kot plačano, zapis naročila pa se še obdeluje.",
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
