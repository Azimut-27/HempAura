-- Promotional discount codes for HerbaGallus: -30%, -50%, -90%
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
values
  ('Promocija 30%', 'caj.plecnik@gmail.com', 'HERBA30', null, 30, 0, 0, 'active', now()),
  ('Popust 30%', 'caj.plecnik@gmail.com', 'POPUST30', null, 30, 0, 0, 'active', now()),
  ('Promo 30%', 'caj.plecnik@gmail.com', 'PROMO30', null, 30, 0, 0, 'active', now()),
  ('HerbaGallus 30%', 'caj.plecnik@gmail.com', 'HG30', null, 30, 0, 0, 'active', now()),
  ('Promocija 50%', 'caj.plecnik@gmail.com', 'HERBA50', null, 50, 0, 0, 'active', now()),
  ('Popust 50%', 'caj.plecnik@gmail.com', 'POPUST50', null, 50, 0, 0, 'active', now()),
  ('Promo 50%', 'caj.plecnik@gmail.com', 'PROMO50', null, 50, 0, 0, 'active', now()),
  ('HerbaGallus 50%', 'caj.plecnik@gmail.com', 'HG50', null, 50, 0, 0, 'active', now()),
  ('VIP 50%', 'caj.plecnik@gmail.com', 'VIP50', null, 50, 0, 0, 'active', now()),
  ('Promocija 90%', 'caj.plecnik@gmail.com', 'HERBA90', null, 90, 0, 0, 'active', now()),
  ('Popust 90%', 'caj.plecnik@gmail.com', 'POPUST90', null, 90, 0, 0, 'active', now()),
  ('Promo 90%', 'caj.plecnik@gmail.com', 'PROMO90', null, 90, 0, 0, 'active', now()),
  ('HerbaGallus 90%', 'caj.plecnik@gmail.com', 'HG90', null, 90, 0, 0, 'active', now()),
  ('VIP 90%', 'caj.plecnik@gmail.com', 'VIP90', null, 90, 0, 0, 'active', now())
on conflict (public_code) do update set
  customer_discount_percent = excluded.customer_discount_percent,
  status = 'active',
  updated_at = now();
