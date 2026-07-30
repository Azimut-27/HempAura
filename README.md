# HempAura

Production-oriented Slovenian Vite/React storefront for premium hemp/CBD products.
The application is intentionally launch-locked: products, payments, shipping,
legal identity, and laboratory documents remain inactive until the owner supplies
verified information and receives the required approvals.

## Architecture

- React 19, Vite, Tailwind CSS, React Router
- Product catalogue in `src/data/products.js`
- Persistent cart with React Context and `useReducer`
- Vercel serverless functions in `api/`
- Stripe Checkout behind a payment-provider abstraction
- Supabase Postgres repository layer and SQL migration
- Resend contact, acknowledgement, order, and newsletter email templates
- Zod validation, same-origin checks, rate limits, secure newsletter tokens
- Static SEO assets plus route-level metadata and structured data

## Routes

- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout/success`
- `/checkout/cancel`
- `/contact`
- `/faq`
- `/quality`
- `/lab-reports`
- `/shipping-and-returns`
- `/privacy`
- `/terms`
- `/cookies`
- `/responsible-use`
- `/newsletter/confirm`
- `/newsletter/unsubscribe`
- route-safe 404 fallback

## API routes

- `POST /api/checkout/create-session`
- `GET /api/checkout/status?session_id=...`
- `POST /api/webhooks/stripe`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `GET /api/newsletter/confirm?token=...`
- `POST /api/newsletter/unsubscribe`

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill only the services being tested.
4. Run all Supabase migrations in `supabase/migrations/` in filename order.
5. Run `npm run dev`.
6. Open `http://127.0.0.1:5173`.
7. Run `npm test`, `npm run lint`, and `npm run build` before deployment.

Vite alone serves the frontend locally. To exercise Vercel functions locally,
install the Vercel CLI and run `vercel dev`.

## Environment variables

Frontend-exposed:

- `VITE_SITE_URL`
- `VITE_PAYMENTS_ENABLED=false`
- `VITE_LEGAL_ENTITY_NAME`
- `VITE_BUSINESS_ADDRESS`
- `VITE_REGISTRATION_NUMBER`
- `VITE_TAX_NUMBER`
- `VITE_VAT_ID` when the merchant is identified for VAT
- `VITE_SUPPORT_EMAIL`
- `VITE_SUPPORT_PHONE`
- `VITE_RESPONSE_TIME`
- `VITE_RETURN_ADDRESS`
- `VITE_DELIVERY_PARTNER`
- `VITE_IRPS_PROVIDER`
- `VITE_SHIPPING_SI_STANDARD_CENTS`
- `VITE_SHIPPING_SI_FREE_THRESHOLD_CENTS`
- `VITE_SHIPPING_SI_DELIVERY_ESTIMATE`

Server-only:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WEBHOOK_SECRET`
- `CONTACT_TO_EMAIL`
- `SUPPORT_EMAIL`
- `PAYMENT_PROVIDER=stripe`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` for current Supabase projects
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `ORDER_NUMBER_PREFIX`
- `BUSINESS_COUNTRY`
- `PRICES_INCLUDE_TAX`
- `DEFAULT_TAX_LABEL`
- `TAX_CALCULATION_MODE`
- `SHIPPING_SI_STANDARD_CENTS`
- `SHIPPING_SI_FREE_THRESHOLD_CENTS`
- `SHIPPING_SI_MIN_DAYS`
- `SHIPPING_SI_MAX_DAYS`
- contact, checkout, and newsletter rate-limit variables from `.env.example`
- legal and operational placeholders from `.env.example`

Never prefix a secret with `VITE_`. The Supabase service-role key, Stripe secret
key, webhook secret, and Resend key must exist only in server environments.

## Owner configuration

Update both:

- `src/config/siteConfig.js` for public presentation
- `api/config/serverConfig.js` and environment variables for server behavior

Update product facts in both:

- `src/data/products.js`
- `api/data/serverProducts.js`

The server catalogue is authoritative for price, active status, stock, and
checkout. Never accept those fields from the browser.

## Supabase setup

1. Create a Supabase project in the intended region.
2. Open SQL Editor and run the migration file.
3. Keep row-level security enabled. The migration creates no public table policies.
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel server variables.
5. Do not expose the service-role key to the frontend.
6. Confirm the seeded product IDs match both catalogue files.

Tables:

- `products`
- `orders`
- `order_items`
- `payment_events`
- `order_email_deliveries`
- `contact_submissions`
- `newsletter_subscribers`

## Resend setup

1. Create a Resend account and API key.
2. Without a public domain, use Resend's testing sender:
   `CONTACT_FROM_EMAIL=HempAura <onboarding@resend.dev>`. This can only send to
   the email address on the Resend account, so set `CONTACT_TO_EMAIL` to that same
   address.
3. Add `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`,
   `CONTACT_REPLY_TO_EMAIL`, and `VITE_SUPPORT_EMAIL` to Vercel. The configured
   support inbox is `stakingforge@gmail.com`.
4. The contact form does not require Supabase. By default it sends only the
   internal owner notification through Resend. Customer acknowledgement is disabled
   until a real sending domain is verified.
5. After buying and verifying a domain or sending subdomain, set
   `RESEND_FROM_EMAIL=HempAura <noreply@updates.your-domain.si>` and
   `CONTACT_CUSTOMER_ACK_ENABLED=true`.
6. Optionally add a Resend webhook for
   `https://YOUR_DOMAIN/api/webhooks/resend` and subscribe to `email.sent`,
   `email.delivered`, `email.delivery_delayed`, `email.failed`, `email.bounced`,
   `email.complained`, and `email.suppressed` after Supabase persistence is
   enabled.
7. Set an honest `RESPONSE_TIME`.
8. Test internal contact email, customer acknowledgement, reply-to behavior,
   newsletter confirmation, paid-order confirmation, and owner new-order
   notification.
9. Monitor Resend for contact bounces. When Supabase persistence is enabled,
   monitor `contact_submissions`, `email_events`, `payment_events`, and
   `order_email_deliveries` for
   `email_retry_required` or `email_attention_required`. Add a scheduled retry
   worker before meaningful volume.

See `docs/resend-contact-setup.md` for the complete deployment checklist.
See `docs/order-confirmation-setup.md` for the paid-order email flow.

## Stripe setup

CBD/hemp acceptance is not assumed. Obtain written processor approval for the
exact products, countries, claims, and business model before enabling checkout.

1. Complete Stripe business verification and obtain product approval.
2. Start in test mode.
3. Add the Stripe secret key and webhook secret to Vercel.
4. Add the production Terms URL in Stripe Dashboard business/public details so
   hosted Checkout can collect terms consent.
5. Create a webhook endpoint at
   `https://YOUR_DOMAIN/api/webhooks/stripe`.
6. Subscribe to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
7. Set approved prices, active state, stock, SKU, and weights in the server catalogue.
8. Configure approved Slovenian shipping rates.
9. Test duplicate webhook delivery and delayed payment events.
10. Set `VITE_PAYMENTS_ENABLED=true` only after all checks pass.

## GLS Slovenia label integration

GLS label creation is server-only and uses the Slovenian MyGLS JSON
`PrintLabels` endpoint. A label is created only for a paid order, stored in the
private `gls_shipments` table, and returned as a PDF. Repeating the same request
returns the stored label instead of creating another GLS parcel.

The GLS test-account instructions supplied for HempAura require a SHA-256
password byte array, which is implemented in `getGlsPasswordHash`. The current
regional MyGLS manual describes SHA-512 instead. Confirm the assigned algorithm
with GLS Slovenia before changing from the test account to production.

1. Run `supabase/migrations/202607300001_gls_shipping.sql` in the Supabase SQL
   editor.
2. Add every `GLS_*` value from `.env.example` to Vercel Production and Preview.
   `GLS_PASSWORD` and `GLS_ADMIN_TOKEN` must be Sensitive variables.
3. Generate `GLS_ADMIN_TOKEN` locally with `openssl rand -hex 32`. It protects
   label creation and is not a GLS credential.
4. Set the pickup address exactly as approved in the GLS agreement. Keep the
   numeric house number in `GLS_PICKUP_HOUSE_NUMBER`; put letters, building, or
   unit details in `GLS_PICKUP_HOUSE_NUMBER_INFO`.
5. Set `DELIVERY_PARTNER=GLS` and `VITE_DELIVERY_PARTNER=GLS`.
6. Redeploy Vercel after saving the variables.

Create or download the label for a paid test order:

```bash
export GLS_ADMIN_TOKEN='paste-your-64-character-token'

curl --fail-with-body \
  -X POST 'https://hemp-aura.vercel.app/api/shipping/gls/labels' \
  -H "Authorization: Bearer $GLS_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"orderNumber":"HA-20260730-ABC123"}' \
  --output 'HA-20260730-ABC123-GLS-label.pdf'
```

If GLS rejected the first attempt, correct the address or configuration and use
`{"orderNumber":"HA-20260730-ABC123","retry":true}`. Never send the GLS password
or administrator token to React, browser storage, GitHub, screenshots, or
customer-facing APIs.

Stripe-hosted Checkout is used. This application never collects or stores raw card
data. Redirect success is not trusted; the webhook and server-side status check are
the source of truth.

## Vercel deployment

1. Import the GitHub repository.
2. Framework preset: Vite.
3. Root directory: `./`.
4. Install command: `npm install`.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Add every required environment variable for Preview and Production separately.
8. Deploy first with `VITE_PAYMENTS_ENABLED=false`.
9. Run the Supabase migration and configure the Stripe webhook using the final domain.
10. Confirm `public/robots.txt` and `public/sitemap.xml` use the final production domain.
11. Test all routes, forms, emails, webhook events, and mobile layouts before launch.

## Security

- Browser prices are ignored and rejected when supplied.
- Checkout line items are rebuilt from the server catalogue.
- Public payloads are validated with strict Zod schemas.
- Contact, newsletter, and checkout endpoints are rate limited.
- Same-origin checks are applied to browser POST endpoints.
- Stripe webhook bodies are read raw and signatures are verified.
- Payment events are claimed idempotently with a unique provider event ID.
- Orders snapshot names, SKUs, quantities, and server prices.
- User HTML is escaped in email templates.
- Newsletter confirmation uses `crypto.randomBytes`; only SHA-256 hashes are stored.
- Public errors are generic and server logs omit secrets and unnecessary personal data.

The in-memory rate limiter is appropriate as a first protective layer but is not
globally consistent across serverless instances. Before high traffic, replace it
with a managed shared limiter such as Vercel KV/Upstash.

## Information the owner must supply

- Legal entity, address, registration number, tax number
- Support and return addresses
- Real response time and business hours
- Final product names, classification, ingredients, sizes, concentrations, warnings,
  usage text, SKUs, stock, weights, prices, tax codes, and real product photographs
- Genuine laboratory reports, laboratories, dates, batches, and document URLs
- Approved shipping partner, rates, threshold, delivery range, return period
- Production domain and verified social profiles
- Resend sender domain and support mailbox
- Processor-approved Stripe configuration

## Professional review required

Before launch, obtain Slovenian/EU legal review of privacy, terms, cookie use,
withdrawal/returns, product classification, claims, age or sales restrictions,
labelling, marketing consent, and cross-border sales. Obtain accountant approval
for VAT display, tax mode, invoicing, and product tax treatment. Obtain payment
provider approval for the precise hemp/CBD catalogue.

The policy pages are complete operational drafts, not legal advice. They include
current consumer/privacy structure and a visible launch blocker while the real
merchant details are missing. Obtain written Slovenian/EU legal approval before
removing that blocker or enabling payment.

## Known limitations before launch

- Payments remain disabled until the public and server-side legal-commerce
  configuration is complete.
- The real merchant identity, return address, support mailbox, delivery terms, and
  IRPS statement still require owner-supplied verified values.
- EU shipping is disabled.
- No analytics or marketing cookies are installed.
- Email retries are recorded but require a scheduled retry worker.
- The rate limiter is per serverless instance.
- `robots.txt` and `sitemap.xml` use the current Vercel production domain.

See `docs/manual-test-checklist.md` for final manual verification.
