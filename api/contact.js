import { randomUUID } from "node:crypto";
import {
  ContactAcknowledgementEmail,
  ContactAcknowledgementText,
  ContactNotificationEmail,
  ContactNotificationText,
} from "../server/emails/templates.js";
import { serverConfig } from "../server/config/serverConfig.js";
import {
  getClientIp,
  requireMethod,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../server/lib/http.js";
import { rateLimit } from "../server/lib/rateLimit.js";
import { contactSchema } from "../server/lib/validation.js";
import { sendEmail } from "../server/services/email.js";

function isResendTestingSender(sender) {
  return /@resend\.dev>?$/i.test(sender.trim());
}

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

  const contactId = randomUUID();
  const emailData = {
    ...parsed.data,
    contactId,
    submittedAt: new Date().toLocaleString("sl-SI", { timeZone: "Europe/Ljubljana" }),
    responseTime: serverConfig.responseTime,
    supportEmail: serverConfig.supportEmail,
  };

  try {
    const sendCustomerAcknowledgement =
      serverConfig.contactCustomerAckEnabled &&
      !isResendTestingSender(serverConfig.resendFromEmail);
    const emailTasks = [
      sendEmail({
        to: serverConfig.contactToEmail,
        subject: `HerbaGallus kontakt: ${parsed.data.subject}`,
        html: ContactNotificationEmail(emailData),
        text: ContactNotificationText(emailData),
        replyTo: parsed.data.email,
        tags: [
          { name: "category", value: "contact_internal" },
          { name: "contact_id", value: contactId },
        ],
        idempotencyKey: `contact-internal/${contactId}`,
      }),
    ];

    if (sendCustomerAcknowledgement) {
      emailTasks.push(
        sendEmail({
          to: parsed.data.email,
          subject: "Prejeli smo tvoje sporočilo | HerbaGallus",
          html: ContactAcknowledgementEmail(emailData),
          text: ContactAcknowledgementText(emailData),
          replyTo: serverConfig.supportEmail,
          tags: [
            { name: "category", value: "contact_ack" },
            { name: "contact_id", value: contactId },
          ],
          idempotencyKey: `contact-ack/${contactId}`,
        })
      );
    }

    const [internal, acknowledgement] = await Promise.allSettled(emailTasks);

    if (internal.status === "rejected") {
      throw internal.reason;
    }

    sendJson(response, 200, {
      message:
        acknowledgement?.status === "fulfilled"
          ? "Sporočilo je prejeto. Potrdilo smo poslali na tvoj e-poštni naslov."
          : "Sporočilo je prejeto. Odgovor bomo poslali na vpisani e-poštni naslov.",
    });
  } catch (error) {
    safeError(error, "contact");
    sendJson(response, 500, {
      message: "Sporočila trenutno ni mogoče poslati. Poskusi znova pozneje.",
    });
  }
}
