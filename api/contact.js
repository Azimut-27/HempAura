import {
  ContactAcknowledgementEmail,
  ContactNotificationEmail,
} from "./emails/templates.js";
import { serverConfig } from "./config/serverConfig.js";
import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "./lib/http.js";
import { rateLimit } from "./lib/rateLimit.js";
import { contactSchema } from "./lib/validation.js";
import { database } from "./repositories/database.js";
import { sendEmail } from "./services/email.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, "POST")) return;
  if (!validateSameOrigin(request)) {
    sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
    return;
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, serverConfig.contactRateLimit);
  if (!limit.allowed) {
    response.setHeader("Retry-After", limit.retryAfterSeconds);
    sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
    return;
  }

  const parsed = contactSchema.safeParse(request.body);
  if (!parsed.success) {
    sendJson(response, 400, { message: "Preveri vpisana polja in privolitev." });
    return;
  }

  let submission;
  try {
    submission = await database.createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      order_number: parsed.data.orderNumber || null,
      consent: true,
      status: "received",
    });

    const emailData = {
      ...parsed.data,
      submittedAt: new Date().toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana" }),
      responseTime: serverConfig.responseTime,
      supportEmail: serverConfig.supportEmail,
    };

    const [internal, acknowledgement] = await Promise.allSettled([
      sendEmail({
        to: serverConfig.contactToEmail,
        subject: `HempAura kontakt: ${parsed.data.subject}`,
        html: ContactNotificationEmail(emailData),
        headers: { "Reply-To": parsed.data.email },
      }),
      sendEmail({
        to: parsed.data.email,
        subject: "Prejeli smo tvoje sporočilo | HempAura",
        html: ContactAcknowledgementEmail(emailData),
      }),
    ]);

    const delivered =
      internal.status === "fulfilled" && acknowledgement.status === "fulfilled";
    await database.updateContactSubmission(submission.id, {
      status: delivered ? "emails_sent" : "email_retry_required",
    });

    sendJson(response, 200, {
      message: delivered
        ? "Sporočilo je prejeto. Potrdilo smo poslali na tvoj e-poštni naslov."
        : "Sporočilo je varno shranjeno. E-poštno potrdilo trenutno zamuja.",
    });
  } catch (error) {
    safeError(error, "contact");
    sendJson(response, 500, {
      message: submission
        ? "Sporočilo je shranjeno, vendar obvestila trenutno ni bilo mogoče poslati."
        : "Sporočila trenutno ni mogoče poslati. Poskusi znova pozneje.",
    });
  }
}
