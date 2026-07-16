import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../../server/lib/http.js";
import { serverConfig } from "../../server/config/serverConfig.js";
import { rateLimit } from "../../server/lib/rateLimit.js";
import { newsletterUnsubscribeSchema } from "../../server/lib/validation.js";
import { database } from "../../server/repositories/database.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, "POST")) return;
  if (!validateSameOrigin(request)) {
    sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
    return;
  }
  const limit = rateLimit(
    `newsletter-unsubscribe:${getClientIp(request)}`,
    serverConfig.newsletterRateLimit
  );
  if (!limit.allowed) {
    response.setHeader("Retry-After", limit.retryAfterSeconds);
    sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
    return;
  }
  const parsed = newsletterUnsubscribeSchema.safeParse(request.body);
  if (!parsed.success) {
    sendJson(response, 400, { message: "Vpiši veljaven e-poštni naslov." });
    return;
  }
  try {
    await database.unsubscribeNewsletter(parsed.data.email);
    sendJson(response, 200, {
      message: "Če je bil naslov prijavljen, je odjava zabeležena.",
    });
  } catch (error) {
    safeError(error, "newsletter-unsubscribe");
    sendJson(response, 500, { message: "Odjave trenutno ni mogoče dokončati." });
  }
}
