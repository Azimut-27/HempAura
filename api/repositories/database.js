import { getSupabaseAdmin } from "../lib/supabase.js";

function assertResult(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

export const database = {
  async createContactSubmission(values) {
    const result = await getSupabaseAdmin()
      .from("contact_submissions")
      .insert(values)
      .select("id")
      .single();
    return assertResult(result, "Create contact submission");
  },

  async updateContactSubmission(id, values) {
    return assertResult(
      await getSupabaseAdmin().from("contact_submissions").update(values).eq("id", id),
      "Update contact submission"
    );
  },

  async getNewsletterSubscriber(email) {
    const result = await getSupabaseAdmin()
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    return assertResult(result, "Get newsletter subscriber");
  },

  async upsertNewsletterSubscriber(values) {
    const result = await getSupabaseAdmin()
      .from("newsletter_subscribers")
      .upsert(values, { onConflict: "email" })
      .select("id,email,status")
      .single();
    return assertResult(result, "Upsert newsletter subscriber");
  },

  async confirmNewsletterSubscriber(tokenHash) {
    const now = new Date().toISOString();
    const result = await getSupabaseAdmin()
      .from("newsletter_subscribers")
      .update({
        status: "confirmed",
        confirmed_at: now,
        confirmation_token_hash: null,
        confirmation_token_expires_at: null,
      })
      .eq("confirmation_token_hash", tokenHash)
      .gt("confirmation_token_expires_at", now)
      .select("id,email")
      .maybeSingle();
    return assertResult(result, "Confirm newsletter subscriber");
  },

  async unsubscribeNewsletter(email) {
    const result = await getSupabaseAdmin()
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("email", email)
      .select("id")
      .maybeSingle();
    return assertResult(result, "Unsubscribe newsletter subscriber");
  },

  async claimPaymentEvent(event) {
    const result = await getSupabaseAdmin()
      .from("payment_events")
      .insert(event)
      .select("id")
      .single();
    if (result.error?.code === "23505") {
      const existingResult = await getSupabaseAdmin()
        .from("payment_events")
        .select("id,status")
        .eq("provider_event_id", event.provider_event_id)
        .single();
      const existing = assertResult(existingResult, "Get existing payment event");
      if (existing.status !== "failed") return null;
      const retryResult = await getSupabaseAdmin()
        .from("payment_events")
        .update({ status: "processing", processed_at: null })
        .eq("id", existing.id)
        .select("id")
        .single();
      return assertResult(retryResult, "Retry payment event");
    }
    return assertResult(result, "Claim payment event");
  },

  async updatePaymentEvent(providerEventId, values) {
    return assertResult(
      await getSupabaseAdmin()
        .from("payment_events")
        .update(values)
        .eq("provider_event_id", providerEventId),
      "Update payment event"
    );
  },

  async createOrderWithItems(order, items) {
    const result = await getSupabaseAdmin()
      .rpc("create_order_with_items", {
        p_order: order,
        p_items: items,
      })
      .single();
    return assertResult(result, "Create order with items");
  },

  async getOrderByProviderSession(providerSessionId) {
    const result = await getSupabaseAdmin()
      .from("orders")
      .select("id,public_order_number,payment_status,fulfillment_status")
      .eq("provider_session_id", providerSessionId)
      .maybeSingle();
    return assertResult(result, "Get order");
  },

  async updateOrderPaymentStatus(providerSessionId, paymentStatus, providerPaymentId) {
    const result = await getSupabaseAdmin()
      .from("orders")
      .update({
        payment_status: paymentStatus,
        provider_payment_id: providerPaymentId,
      })
      .eq("provider_session_id", providerSessionId)
      .select("*")
      .maybeSingle();
    return assertResult(result, "Update order payment status");
  },
};
