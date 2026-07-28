import dns from "node:dns/promises";
import { serverConfig } from "../../../server/config/serverConfig.js";
import { sendJson } from "../../../server/lib/http.js";
import { getSupabaseAdmin } from "../../../server/lib/supabase.js";

function hostFromUrl(value) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function keyKind(value) {
  if (!value) return "missing";
  if (value.startsWith("sb_secret_")) return "sb_secret";
  if (value.startsWith("eyJ")) return "jwt";
  return "unknown";
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { message: "Method not allowed." });
    return;
  }

  const host = hostFromUrl(serverConfig.supabaseUrl);
  const result = {
    supabaseUrlPresent: Boolean(serverConfig.supabaseUrl),
    supabaseHost: host,
    supabaseKeyPresent: Boolean(serverConfig.supabaseServiceRoleKey),
    supabaseKeyKind: keyKind(serverConfig.supabaseServiceRoleKey),
    dns: null,
    query: null,
  };

  if (host) {
    try {
      const addresses = await dns.lookup(host, { all: true });
      result.dns = {
        ok: true,
        addresses: addresses.map((entry) => entry.address),
      };
    } catch (error) {
      result.dns = {
        ok: false,
        message: error?.message || "DNS lookup failed.",
      };
    }
  }

  try {
    const query = await getSupabaseAdmin()
      .from("products")
      .select("id", { count: "exact", head: true });
    result.query = query.error
      ? { ok: false, message: query.error.message }
      : { ok: true, count: query.count };
  } catch (error) {
    result.query = {
      ok: false,
      message: error?.message || "Supabase query failed.",
    };
  }

  sendJson(response, 200, result);
}
