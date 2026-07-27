# Resend contact infrastructure

The public and operational support inbox is:

`stakingforge@gmail.com`

This address receives contact-form notifications and customer replies. It is not
the Resend sending identity. Resend requires the `from` address to use a domain
owned and verified by the merchant.

## Message flow

1. The customer submits `/contact`.
2. The server validates the same origin, rate limit, honeypot and consent.
3. Resend queues:
   - an internal notification to `stakingforge@gmail.com`, with the customer as
     `replyTo`;
   - an acknowledgement to the customer, with `stakingforge@gmail.com` as
     `replyTo`.
4. Each send uses a contact-specific idempotency key and Resend tags.
5. Contact does not require Supabase. Signed delivery webhooks can be enabled
   later if message persistence is added.

## 1. Verify a sending domain

In Resend:

1. Open **Domains** and add a domain you own.
2. Prefer a subdomain such as `updates.example.si`.
3. Add the exact SPF and DKIM records shown by Resend to the DNS provider.
4. Wait until the domain status is **Verified**.
5. Add DMARC after SPF and DKIM are working.

Do not set `RESEND_FROM_EMAIL` to a Gmail address. A production example is:

`HempAura <noreply@updates.example.si>`

## 2. Configure Vercel

Add the following Production and Preview environment variables for contact:

```text
VITE_SUPPORT_EMAIL=stakingforge@gmail.com
SUPPORT_EMAIL=stakingforge@gmail.com
CONTACT_TO_EMAIL=stakingforge@gmail.com
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=HempAura <noreply@updates.example.si>
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
RESPONSE_TIME=v dveh delovnih dneh
```

Never prefix the Resend key or webhook secret with `VITE_`. `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are not required for the contact form.

## 3. Optional Resend webhook

The contact form can work without a webhook. Add this endpoint only after
Supabase persistence is enabled:

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

## 4. Production test

1. Submit the contact form with a Gmail test address.
2. Confirm `stakingforge@gmail.com` receives the internal notification.
3. Use Gmail's **Reply** action and verify the recipient is the customer.
4. Confirm the customer receives the acknowledgement.
5. Reply to the acknowledgement and verify it reaches `stakingforge@gmail.com`.

## 5. Operational notes

- Resend accepting a send request means the message was queued, not delivered.
  Delivery is confirmed only by `email.delivered` when a webhook is configured.
- Monitor bounces, complaints and suppressions in Resend.
- Contact content and email addresses are personal data. Limit dashboard access,
  define retention and support GDPR requests.
- Do not enable newsletter or order mail until their reply-to, unsubscribe,
  retention and retry behavior have also been tested.
