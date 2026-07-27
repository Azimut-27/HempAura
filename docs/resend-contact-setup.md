# Resend contact infrastructure

The public and operational support inbox is:

`stakingforge@gmail.com`

This address receives contact-form notifications and customer replies. Without a
public domain, Resend can use its testing sender only for the email address on
the Resend account. After a real domain is verified, customer acknowledgements
can be enabled.

## Message flow

1. The customer submits `/contact`.
2. The server validates the same origin, rate limit, honeypot and consent.
3. Resend sends the internal notification to `CONTACT_TO_EMAIL`, with the
   customer as `replyTo`.
4. Customer acknowledgement is disabled by default.
5. When a verified sending domain exists, set `CONTACT_CUSTOMER_ACK_ENABLED=true`
   to also send the acknowledgement to the customer.

## 1. No-domain setup

Use this before buying or verifying a public domain:

```text
VITE_SUPPORT_EMAIL=stakingforge@gmail.com
CONTACT_REPLY_TO_EMAIL=stakingforge@gmail.com
CONTACT_TO_EMAIL=stakingforge@gmail.com
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_FROM_EMAIL=HempAura <onboarding@resend.dev>
CONTACT_CUSTOMER_ACK_ENABLED=false
RESPONSE_TIME=v dveh delovnih dneh
```

Important: Resend's `onboarding@resend.dev` sender can only send to the email
address associated with the Resend account. If the Resend account was created
with a different email, either set `CONTACT_TO_EMAIL` to that email or verify a
domain first.

Do not set `CONTACT_FROM_EMAIL` or `RESEND_FROM_EMAIL` to Gmail.

## 2. Verified-domain setup

After you own a domain:

1. Open **Domains** in Resend and add a domain or subdomain, for example
   `updates.example.si`.
2. Add the exact SPF and DKIM records shown by Resend to the DNS provider.
3. Wait until the domain status is **Verified**.
4. Add DMARC after SPF and DKIM are working.
5. Switch Vercel to:

```text
RESEND_FROM_EMAIL=HempAura <noreply@updates.example.si>
CONTACT_CUSTOMER_ACK_ENABLED=true
```

Keep:

```text
VITE_SUPPORT_EMAIL=stakingforge@gmail.com
CONTACT_REPLY_TO_EMAIL=stakingforge@gmail.com
CONTACT_TO_EMAIL=stakingforge@gmail.com
RESEND_API_KEY=re_xxxxxxxxx
```

`RESEND_FROM_EMAIL` takes priority over `CONTACT_FROM_EMAIL`.

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

1. Submit the contact form with a test address.
2. Confirm `CONTACT_TO_EMAIL` receives the internal notification.
3. Use the mail client's **Reply** action and verify the recipient is the
   customer.
4. After a verified domain is configured, enable customer acknowledgement and
   confirm the customer receives it.

## 5. Operational notes

- Resend accepting a send request means the message was queued, not delivered.
  Delivery is confirmed only by `email.delivered` when a webhook is configured.
- Monitor bounces, complaints and suppressions in Resend.
- Contact content and email addresses are personal data. Limit dashboard access,
  define retention and support GDPR requests.
- Do not enable newsletter or order mail until their reply-to, unsubscribe,
  retention and retry behavior have also been tested.
