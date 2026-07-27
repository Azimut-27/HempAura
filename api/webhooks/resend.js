import { serverConfig } from "../../server/config/serverConfig.js";
import { readRawBody, safeError, sendJson } from "../../server/lib/http.js";
import { database } from "../../server/repositories/database.js";
import { getResend } from "../../server/services/email.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handledTypes = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
]);

const failureTypes = new Set([
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { message: "Metoda ni dovoljena." });
    return;
  }

  if (!serverConfig.resendWebhookSecret) {
    safeError(new Error("Missing RESEND_WEBHOOK_SECRET"), "resend-webhook-config");
    sendJson(response, 503, { message: "Webhook ni konfiguriran." });
    return;
  }

  const svixId = request.headers["svix-id"];
  const svixTimestamp = request.headers["svix-timestamp"];
  const svixSignature = request.headers["svix-signature"];
  if (!svixId || !svixTimestamp || !svixSignature) {
    sendJson(response, 400, { message: "Manjkajo podpisne glave." });
    return;
  }

  let event;
  try {
    const payload = (await readRawBody(request)).toString("utf8");
    event = getResend().webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: serverConfig.resendWebhookSecret,
    });
  } catch (error) {
    safeError(error, "resend-webhook-signature");
    sendJson(response, 400, { message: "Neveljaven podpis." });
    return;
  }

  if (!handledTypes.has(event.type)) {
    sendJson(response, 200, { received: true, ignored: true });
    return;
  }

  try {
    const tags = event.data?.tags || {};
    const submissionId =
      typeof tags.submission_id === "string" && uuidPattern.test(tags.submission_id)
        ? tags.submission_id
        : null;
    const channel =
      tags.category === "contact_internal"
        ? "internal"
        : tags.category === "contact_ack"
          ? "acknowledgement"
          : null;
    const recipient = Array.isArray(event.data?.to)
      ? event.data.to[0]
      : event.data?.to || null;

    const claimed = await database.claimEmailEvent({
      provider: "resend",
      provider_event_id: svixId,
      provider_email_id: event.data?.email_id || null,
      type: event.type,
      recipient,
      contact_submission_id: submissionId,
      channel,
      provider_created_at: event.created_at || null,
      payload_summary_json: {
        subject: event.data?.subject || null,
        from: event.data?.from || null,
        bounce_type: event.data?.bounce?.type || null,
        bounce_subtype: event.data?.bounce?.subType || null,
      },
    });

    if (!claimed) {
      sendJson(response, 200, { received: true, duplicate: true });
      return;
    }

    if (submissionId && channel) {
      const emailStatus = event.type.replace("email.", "");
      const statusField =
        channel === "internal"
          ? "internal_email_status"
          : "acknowledgement_email_status";
      const values = {
        [statusField]: emailStatus,
        last_email_event_at: event.created_at || new Date().toISOString(),
      };
      if (failureTypes.has(event.type)) {
        values.status = "email_attention_required";
      }
      await database.updateContactSubmission(submissionId, values);

      if (event.type === "email.delivered") {
        const current = await database.getContactSubmissionEmailStatus(submissionId);
        if (
          current?.internal_email_status === "delivered" &&
          current?.acknowledgement_email_status === "delivered"
        ) {
          await database.updateContactSubmission(submissionId, {
            status: "emails_delivered",
          });
        }
      }
    }

    sendJson(response, 200, { received: true });
  } catch (error) {
    safeError(error, "resend-webhook");
    sendJson(response, 500, { message: "Dogodka trenutno ni bilo mogoče obdelati." });
  }
}
