# Paid-order confirmation setup

The application now uses this server-side flow:

1. Stripe confirms the payment.
2. Stripe calls `POST /api/webhooks/stripe`.
3. The signed webhook creates the order and order items in Supabase.
4. Resend sends the customer confirmation and the owner notification.
5. Supabase records each email attempt so webhook retries do not create duplicate
   orders or duplicate messages.

The browser success page is only a status display. It does not send email and it
does not create the order.

## 1. Supabase

Create a Supabase project, open SQL Editor, and run these files in order:

1. `supabase/migrations/202607160001_initial_schema.sql`
2. `supabase/migrations/202607270001_resend_contact_infrastructure.sql`
3. `supabase/migrations/202607280001_order_email_infrastructure.sql`

If the first two files were already applied, run only the third file.

Add these server-only variables in Vercel for Production and Preview:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

For an older Supabase project, the legacy server key is also supported as
`SUPABASE_SERVICE_ROLE_KEY`. Use one server key, not both. Never prefix these
variables with `VITE_`.

## 2. Resend without a public domain

For temporary testing, use:

```text
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=HempAura <onboarding@resend.dev>
CONTACT_TO_EMAIL=stakingforge@gmail.com
SUPPORT_EMAIL=stakingforge@gmail.com
```

The Resend testing sender can normally send only to the email address belonging
to the Resend account. Until a domain is verified, enter that same email address
in Stripe Checkout when testing the customer confirmation.

After a domain is purchased and verified in Resend, replace
`RESEND_FROM_EMAIL` with an address on that domain.

## 3. Stripe webhook

In Stripe test mode, create a webhook destination:

```text
https://hemp-aura.vercel.app/api/webhooks/stripe
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

Copy the destination signing secret into Vercel:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

This is different from `STRIPE_SECRET_KEY`. Keep both server-only and use keys
from the same Stripe test account.

## 4. Deploy and test

Redeploy after saving the variables. Complete one Stripe test checkout using the
email address attached to the Resend account.

Confirm:

- the success page shows a confirmed order;
- `orders` contains one row;
- `order_items` contains the purchased products;
- `payment_events` has status `processed`;
- `order_email_deliveries` contains `customer_confirmation` and
  `owner_notification`, both with status `sent`;
- the customer and owner inboxes received their messages.

If an email fails, its delivery row is marked `failed`, and a replayed Stripe
event can safely retry it. Resend idempotency keys prevent duplicate sends.
