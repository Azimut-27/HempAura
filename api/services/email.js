import { Resend } from "resend";
import { serverConfig } from "../config/serverConfig.js";

let resend;

function getResend() {
  if (!serverConfig.resendApiKey || !serverConfig.resendFromEmail) {
    throw new Error("Resend server configuration is incomplete.");
  }
  resend ||= new Resend(serverConfig.resendApiKey);
  return resend;
}

export async function sendEmail({ to, subject, html, headers }) {
  const result = await getResend().emails.send({
    from: serverConfig.resendFromEmail,
    to,
    subject,
    html,
    headers,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
