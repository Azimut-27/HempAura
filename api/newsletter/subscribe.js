import crypto from "node:crypto";
import { serverConfig } from "../config/serverConfig.js";
import { NewsletterConfirmationEmail } from "../emails/templates.js";
import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../lib/http.js";
import { rateLimit } from "../lib/rateLimit.js";
import { newsletterSubscribeSchema } from "../lib/validation.js";
import { database } from "../repositories/database.js";
import { sendEmail } from "../services/email.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, "POST")) return;
  if (!validateSameOrigin(request)) {
    sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
    return;
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`newsletter:${ip}`, serverConfig.newsletterRateLimit);
  if (!limit.allowed) {
    response.setHeader("Retry-After", limit.retryAfterSeconds);
    sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
    return;
  }

  const parsed = newsletterSubscribeSchema.safeParse(request.body);
  if (!parsed.success) {
    sendJson(response, 400, { message: "Preveri e-poštni naslov in privolitev." });
    return;
  }

  try {
    const existing = await database.getNewsletterSubscriber(parsed.data.email);
    if (existing?.status === "confirmed") {
      sendJson(response, 200, { message: "Ta naslov je že potrjeno prijavljen." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(
      Date.now() + serverConfig.newsletterTokenTtlHours * 60 * 60 * 1000
    ).toISOString();

    await database.upsertNewsletterSubscriber({
      email: parsed.data.email,
      status: "pending",
      consent_text_version: parsed.data.consentTextVersion,
      consent_at: new Date().toISOString(),
      source: "website",
      confirmation_token_hash: tokenHash,
      confirmation_token_expires_at: expiresAt,
      confirmed_at: null,
      unsubscribed_at: null,
    });

    const confirmationUrl = `${serverConfig.siteUrl}/newsletter/confirm?token=${token}`;
    await sendEmail({
      to: parsed.data.email,
      subject: "Potrdi prijavo | HempAura",
      html: NewsletterConfirmationEmail({ confirmationUrl }),
    });

    sendJson(response, 200, {
      message: "Preveri e-pošto in potrdi prijavo s povezavo.",
    });
  } catch (error) {
    safeError(error, "newsletter-subscribe");
    sendJson(response, 500, {
      message: "Prijave trenutno ni mogoče dokončati. Poskusi znova pozneje.",
    });
  }
}
