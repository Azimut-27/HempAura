import { createClient } from "@supabase/supabase-js";
import { serverConfig } from "../config/serverConfig.js";

let client;

export function getSupabaseAdmin() {
  if (!serverConfig.supabaseUrl || !serverConfig.supabaseServiceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }
  if (!client) {
    client = createClient(serverConfig.supabaseUrl, serverConfig.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
