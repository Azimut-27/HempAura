# HempAura referral programme — setup and operations

The programme uses:

- Stripe Coupons and Promotion Codes for the customer discount;
- first-party referral attribution for the current browser tab;
- Supabase for partner records, conversions, commission status, and payout history;
- the verified Stripe webhook as the only source of paid conversions.

Influencer commission is a manual payout ledger in this version. It is not an
automatic Stripe Connect transfer.

## 1. Apply the Supabase migration

Run the complete contents of:

`supabase/migrations/202607290001_referral_program.sql`

in the Supabase SQL Editor. Confirm these tables exist:

- `referral_partners`
- `referral_conversions`

Also confirm the `orders` table contains:

- `discount_cents`
- `promotion_code`
- `stripe_promotion_code_id`
- `referral_partner_id`

The migration also creates `referral_partner_balances` for a quick Supabase
overview of pending, approved, and paid commission.

## 2. Create a Stripe test promotion code

In the HempAura Stripe test account:

1. Create a once-only percentage coupon, for example 10% off.
2. Create a customer-facing Promotion Code on that coupon.
3. Use the exact uppercase partner code, for example `ANA10`.
4. Set any redemption limit or expiry needed by the agreement.
5. Copy the Promotion Code ID beginning with `promo_`.

Stripe Checkout currently supports one coupon or promotion code per Checkout
Session.

Official reference:

https://docs.stripe.com/payments/checkout/discounts

## 3. Add the partner to Supabase

Replace every example value before running:

```sql
insert into public.referral_partners (
  display_name,
  contact_email,
  public_code,
  stripe_promotion_code_id,
  customer_discount_percent,
  commission_rate_bps,
  hold_days,
  status,
  terms_accepted_at
)
values (
  'Ana Example',
  'ana@example.com',
  'ANA10',
  'promo_REPLACE_WITH_STRIPE_ID',
  10,
  1500,
  30,
  'active',
  now()
);
```

`commission_rate_bps` uses basis points:

- `500` = 5%
- `1000` = 10%
- `1500` = 15%

The discount percentage in Supabase is informational. Stripe remains the
authoritative discount calculator.

## 4. Give the influencer a link

Example:

`https://hemp-aura.vercel.app/?ref=ANA10`

Replace the Vercel URL after the public domain is connected.

The browser keeps a valid-looking referral code in session storage for the
current tab. At checkout, the server confirms that the code belongs to an
active Supabase partner and automatically applies the matching Stripe
Promotion Code. Persistent cross-session attribution should be introduced only
with an appropriate consent and privacy design.

Customers without a referral link can still enter a general promotion code in
Stripe Checkout. A commission is recorded only when the Stripe Promotion Code
ID matches an active referral partner.

## 5. Test the full flow

1. Open a private browser window with the partner link.
2. Add a product to the cart.
3. Continue to Stripe Checkout.
4. Confirm that the discount is visible before paying.
5. Complete a Stripe test payment.
6. Confirm the Stripe webhook delivery returns `200 OK`.
7. Confirm the order has `discount_cents` and the Promotion Code.
8. Confirm one `referral_conversions` row exists with status `pending`.
9. Confirm the commission excludes shipping and tax.

## 6. Review and payout

List commissions that have passed their hold period:

```sql
select
  rp.display_name,
  rp.public_code,
  rc.currency,
  count(*) as conversions,
  sum(rc.commission_cents) as commission_cents
from public.referral_conversions rc
join public.referral_partners rp on rp.id = rc.partner_id
where rc.status = 'pending'
  and rc.available_at <= now()
group by rp.id, rp.display_name, rp.public_code, rc.currency
order by rp.display_name;
```

After checking refunds, disputes, returns, and abuse, approve individual rows.
After the payout is actually sent, mark the relevant rows `paid`, set `paid_at`,
and save a payout reference.

Do not mark commissions paid before money is actually sent.

## 7. Operating and legal controls

- Sign a partner agreement before activating a code.
- Collect only payout/tax data that is genuinely required.
- Keep payout details out of public tables and client code.
- Require a prominent advertising/affiliate disclosure.
- Prohibit medical, therapeutic, and guaranteed-effect claims.
- Reverse or cancel commission for refunded, disputed, returned, or abusive orders.
- Get Slovenian/EU legal and tax review before public launch.
