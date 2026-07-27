# Resend contact infrastructure

The public and operational support inbox is:

`stakingforge@gmail.com`

This address receives contact-form notifications and customer replies. It is not
the Resend sending identity. Resend requires the `from` address to use a domain
owned and verified by the merchant.

## Message flow

1. The customer submits `/contact`.
2. The server validates the same origin, rate limit, honeypot and consent.
3. The submission is stored in Supabase.
4. Resend queues:
   - an internal notification to `stakingforge@gmail.com`, with the customer as
     `replyTo`;
   - an acknowledgement to the customer, with `stakingforge@gmail.com` as
     `replyTo`.
5. Each send uses a submission-specific idempotency key and Resend tags.
6. Signed Resend webhooks update delivery, delay, bounce, complaint, suppression
   or failure status in Supabase.

## 1. Verify a sending domain

In Resend:

1. Open **Domains** and add a domain you own.
2. Prefer a subdomain such as `updates.example.si`.
3. Add the exact SPF and DKIM records shown by Resend to the DNS provider.
4. Wait until the domain status is **Verified**.
5. Add DMARC after SPF and DKIM are working.

Do not set `RESEND_FROM_EMAIL` to a Gmail address. A production example is:

`HempAura <noreply@updates.example.si>`

## 2. Run Supabase migrations

Run these in order:

1. `supabase/migrations/202607160001_initial_schema.sql`
2. `supabase/migrations/202607270001_resend_contact_infrastructure.sql`

The second migration adds Resend message IDs and delivery states to
`contact_submissions`, plus the idempotent `email_events` audit table. RLS remains
enabled and no browser-facing policy is created.

## 3. Configure Vercel

Add the following Production and Preview environment variables:

```text
VITE_SUPPORT_EMAIL=stakingforge@gmail.com
SUPPORT_EMAIL=stakingforge@gmail.com
CONTACT_TO_EMAIL=stakingforge@gmail.com
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=HempAura <noreply@updates.example.si>
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
RESPONSE_TIME=v dveh delovnih dneh
```

Also configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never prefix the
Resend key, webhook secret, or Supabase service-role key with `VITE_`.

## 4. Configure the Resend webhook

After the production domain is live, add this endpoint in Resend:

`https://YOUR_DOMAIN/api/webhooks/resend`

Subscribe to:

- `email.sent`
- `email.delivered`
- `email.delivery_delayed`
- `email.failed`
- `email.bounced`
- `email.complained`
- `email.suppressed`

Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`. The endpoint reads
the raw request body and verifies the Svix signature before processing. Duplicate
webhook deliveries are ignored using the unique `svix-id`.

## 5. Production test

1. Submit the contact form with a Gmail test address.
2. Confirm a row is created in `contact_submissions`.
3. Confirm `stakingforge@gmail.com` receives the internal notification.
4. Use Gmail's **Reply** action and verify the recipient is the customer.
5. Confirm the customer receives the acknowledgement.
6. Reply to the acknowledgement and verify it reaches `stakingforge@gmail.com`.
7. Confirm `internal_email_id` and `acknowledgement_email_id` are populated.
8. Confirm signed webhook rows appear in `email_events`.
9. Confirm the channel states progress from `sent` to `delivered`.
10. Use a Resend test/bounce address and confirm the submission changes to
    `email_attention_required`.

## 6. Operational notes

- Resend accepting a send request means the message was queued, not delivered.
  Delivery is confirmed only by `email.delivered`.
- Monitor bounces, complaints and suppressions in both Resend and Supabase.
- Contact content and email addresses are personal data. Limit dashboard access,
  define retention and support GDPR requests.
- Do not enable newsletter or order mail until their reply-to, unsubscribe,
  retention and retry behavior have also been tested.
