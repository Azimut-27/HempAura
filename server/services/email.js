import { Resend } from "resend";
import { serverConfig } from "../config/serverConfig.js";

let resend;

export function getResend() {
  if (!serverConfig.resendApiKey) {
    throw new Error("Resend API key is missing.");
  }
  resend ||= new Resend(serverConfig.resendApiKey);
  return resend;
}

export function isEmailConfigured() {
  return Boolean(serverConfig.resendApiKey && serverConfig.resendFromEmail);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  headers,
  tags,
  idempotencyKey,
}) {
  if (!serverConfig.resendFromEmail) {
    throw new Error("Resend sender address is missing.");
  }
  const result = await getResend().emails.send(
    {
      from: serverConfig.resendFromEmail,
      to,
      subject,
      html,
      text,
      replyTo,
      headers,
      tags,
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
