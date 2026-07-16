import crypto from "node:crypto";
import { safeError, sendJson } from "../lib/http.js";
import { database } from "../repositories/database.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { message: "Metoda ni dovoljena." });
    return;
  }
  const token = typeof request.query.token === "string" ? request.query.token : "";
  if (!/^[a-f0-9]{64}$/.test(token)) {
    sendJson(response, 400, { message: "Potrditvena povezava ni veljavna." });
    return;
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const subscriber = await database.confirmNewsletterSubscriber(tokenHash);
    if (!subscriber) {
      sendJson(response, 400, {
        message: "Povezava je potekla ali je bila že uporabljena.",
      });
      return;
    }
    sendJson(response, 200, { message: "E-poštni naslov je uspešno potrjen." });
  } catch (error) {
    safeError(error, "newsletter-confirm");
    sendJson(response, 500, { message: "Potrditve trenutno ni mogoče dokončati." });
  }
}
