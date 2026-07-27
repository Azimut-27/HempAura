import { serverConfig } from "../config/serverConfig.js";

export function sendJson(response, status, payload) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

export function requireMethod(request, response, method) {
  if (request.method === method) return true;
  response.setHeader("Allow", method);
  sendJson(response, 405, { message: "Metoda ni dovoljena." });
  return false;
}

export function validateSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    const requestOrigin = new URL(origin).origin;
    const allowedOrigins = new Set([new URL(serverConfig.siteUrl).origin]);
    const host = request.headers["x-forwarded-host"] || request.headers.host;
    if (host) {
      const protocol = request.headers["x-forwarded-proto"] || "https";
      allowedOrigins.add(`${protocol}://${host}`);
    }
    return allowedOrigins.has(requestOrigin);
  } catch {
    return false;
  }
}

export function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return request.socket?.remoteAddress || "unknown";
}

export function safeError(error, context) {
  console.error(`[${context}]`, {
    name: error?.name,
    message: error?.message,
  });
}

export async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
