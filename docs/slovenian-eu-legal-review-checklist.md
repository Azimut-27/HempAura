# HempAura Slovenian/EU legal review checklist

Prepared: 27 July 2026

This is an implementation checklist for a qualified Slovenian/EU lawyer,
accountant, product-compliance specialist, and payment provider. It is not legal
advice or a substitute for their written approval.

## 1. Merchant identity

Confirm and provide:

- registered legal name;
- registered office and business address;
- registration number;
- tax number and, if applicable, VAT ID with the `SI` prefix;
- monitored support email and telephone number;
- physical return address;
- realistic response time;
- contractual delivery partner;
- statement identifying the recognised IRPS provider, or the legally appropriate
  statement that none is recognised.

Do not use Hemptouch d.o.o.'s identifiers unless that company is in fact the
contracting seller and has authorised this store.

## 2. Consumer terms

Review the exact contract-formation moment against the implemented Stripe flow
and order-confirmation emails. Confirm:

- required pre-contract information and the payment-obligation button;
- prices, VAT display, shipping price and invoicing;
- 14-day withdrawal instructions and model form;
- 14-day return deadline after withdrawal notice;
- refund timing, standard-delivery refund and lawful withholding;
- hygiene/health-seal exceptions for each exact SKU;
- conformity remedies under ZVPot-1;
- complaints and IRPS statement;
- absence of the discontinued EU ODR-platform link.

## 3. Privacy and cookies

Map the production configuration and sign processor agreements for:

- Vercel;
- Supabase;
- Stripe;
- Resend;
- the delivery provider;
- accounting and any customer-support provider.

Confirm controller/processor roles, hosting regions, international-transfer
mechanisms, security measures, retention periods, incident response and data
subject request handling. Re-run the cookie/storage audit after every analytics,
advertising or customer-support integration.

## 4. CBD/hemp product compliance

Review each SKU separately. Do not infer legal classification from the product
name, bottle type, CBD percentage or another retailer's page.

For every product confirm:

- legal classification and intended use;
- right to place it on the Slovenian market;
- responsible person/importer and traceability;
- ingredient source and cannabinoid profile;
- batch-specific laboratory report and document authenticity;
- label language and all mandatory warnings;
- allowed marketing and health claims;
- age restrictions and a workable age-verification process;
- THC limits and testing method;
- whether the withdrawal exception for an opened health/hygiene seal applies;
- shipping and payment-provider acceptance.

In particular, obtain a written novel-food/food-law opinion before marketing CBD
oil for ingestion. For cosmetics, verify the responsible person, safety report,
PIF/CPNP duties, claims and source of CBD. Technical or horticultural flower must
not be described or promoted for consumption, smoking or vaping.

## 5. Tax and operations

Have an accountant confirm:

- VAT registration status and displayed VAT ID;
- the 22% treatment currently configured for each SKU;
- Stripe Tax product codes and inclusive/exclusive mode;
- invoicing and Slovenian fiscal-confirmation obligations;
- ten-year invoice retention;
- stock, weight, shipping rates and free-shipping threshold.

## 6. Launch approval

Keep `VITE_PAYMENTS_ENABLED=false` until:

1. all public `VITE_*` legal and shipping variables are populated;
2. matching server-only variables are populated;
3. product and legal reviews are signed off in writing;
4. the payment provider has approved the exact CBD/hemp catalogue;
5. a full test order, refund, return, complaint, privacy request and age check have
   been completed.

## Primary reference points

- SPOT, Spletna prodaja: https://spot.gov.si/sl/teme/spletna-prodaja/
- SPOT, Trgovina na drobno po pošti ali po internetu:
  https://spot.gov.si/sl/dejavnosti-in-poklici/dejavnosti/trgovina-na-drobno-po-posti-ali-po-internetu/
- GOV.SI, Izvensodno reševanje potrošniških sporov:
  https://www.gov.si/teme/izvensodno-resevanje-potrosniskih-sporov/
- GDPR, Article 13:
  https://eur-lex.europa.eu/eli/reg/2016/679/art_13/oj
- Informacijski pooblaščenec: https://www.ip-rs.si/
- GOV.SI, Uporaba konoplje in kanabidiola v kozmetičnih izdelkih:
  https://www.gov.si/novice/2020-03-05-uporaba-konoplje-in-kanabidiola-v-kozmeticnih-izdelkih/
- European Commission, Novel Food status Catalogue:
  https://food.ec.europa.eu/food-safety/novel-food/novel-food-status-catalogue_en
- Regulation (EU) 2024/3228 discontinuing the ODR platform:
  https://eur-lex.europa.eu/eli/reg/2024/3228/oj
- Hemptouch terms, used only as a structural market example:
  https://www.hemptouch.hr/uvjeti-koristenja
