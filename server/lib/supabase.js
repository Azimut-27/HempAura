import { createClient } from "@supabase/supabase-js";
import { serverConfig } from "../config/serverConfig.js";

let client;

function createDiagnosticFetch() {
  return async (input, init) => {
    try {
      return await fetch(input, init);
    } catch (error) {
      const rawUrl = typeof input === "string" ? input : input?.url;
      let host = "unknown";
      try {
        host = new URL(rawUrl).host;
      } catch {
        host = String(rawUrl || "unknown").slice(0, 120);
      }
      const cause = error?.cause?.message || error?.message || "fetch failed";
      throw new Error(`Supabase fetch failed for ${host}: ${cause}`);
    }
  };
}

export function getSupabaseAdmin() {
  if (!serverConfig.supabaseUrl || !serverConfig.supabaseServiceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }
  if (!client) {
    client = createClient(serverConfig.supabaseUrl, serverConfig.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: createDiagnosticFetch() },
    });
  }
  return client;
}
