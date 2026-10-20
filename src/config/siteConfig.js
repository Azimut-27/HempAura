const legalEntityName =
  import.meta.env.VITE_LEGAL_ENTITY_NAME ||
  "HERBA GALLUS PROMOCIJA IN TRŽENJE STANISLAV BREGAR S.P.";
const businessAddress =
  import.meta.env.VITE_BUSINESS_ADDRESS ||
  "Prvomajska cesta 11, 8310 Šentjernej";
const registrationNumber =
  import.meta.env.VITE_REGISTRATION_NUMBER || "6079997000";
const taxNumber = import.meta.env.VITE_TAX_NUMBER || "20543018";
const vatId = import.meta.env.VITE_VAT_ID || "SI20543018";
const supportEmail =
  import.meta.env.VITE_SUPPORT_EMAIL || "caj.plecnik@gmail.com";
const returnAddress =
  import.meta.env.VITE_RETURN_ADDRESS ||
  "Prvomajska cesta 11, 8310 Šentjernej";
const deliveryPartner =
  import.meta.env.VITE_DELIVERY_PARTNER || "GLS Slovenija";
const irpsProvider =
  import.meta.env.VITE_IRPS_PROVIDER ||
  "Ponudnik ne priznava nobenega izvajalca IRPS kot pristojnega za reševanje potrošniških sporov.";
const shippingSiStandardCents =
  import.meta.env.VITE_SHIPPING_SI_STANDARD_CENTS || "390";
const shippingSiFreeThresholdCents =
  import.meta.env.VITE_SHIPPING_SI_FREE_THRESHOLD_CENTS || "5000";
const shippingSiDeliveryEstimate =
  import.meta.env.VITE_SHIPPING_SI_DELIVERY_ESTIMATE ||
  "predvidoma 1–3 delovne dni";

const requiredPublicLegalValues = [
  legalEntityName,
  businessAddress,
  registrationNumber,
  taxNumber,
  supportEmail,
  returnAddress,
  deliveryPartner,
  irpsProvider,
  shippingSiStandardCents,
  shippingSiDeliveryEstimate,
];

const publicLegalConfigurationComplete = requiredPublicLegalValues.every(
  (value) => typeof value === "string" && value.trim().length > 0
);

export const siteConfig = {
  brandName: "HerbaGallus",
  legalBusinessName: legalEntityName,
  businessAddress,
  registrationNumber,
  taxNumber,
  vatId,
  domain: import.meta.env.VITE_SITE_URL || "http://localhost:5173",
  supportEmail,
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || "",
  responseTime: import.meta.env.VITE_RESPONSE_TIME || "v dveh delovnih dneh",
  returnAddress,
  deliveryPartner,
  irpsProvider,
  legalLastUpdated: "20. oktober 2026",
  currency: "EUR",
  locale: "sl-SI",
  businessCountry: "SI",
  pricesIncludeTax: true,
  taxLabel: "DDV vključen",
  paymentsEnabled:
    import.meta.env.VITE_PAYMENTS_ENABLED === "true" &&
    publicLegalConfigurationComplete,
  supportedCountries: ["SI"],
  announcement: {
    enabled: false,
    text: "",
    linkLabel: "",
    linkTo: "/products",
  },
  shipping: {
    standardCents: Number.isFinite(
      Number.parseInt(shippingSiStandardCents, 10)
    )
      ? Number.parseInt(shippingSiStandardCents, 10)
      : 390,
    freeThresholdCents: Number.isFinite(
      Number.parseInt(shippingSiFreeThresholdCents, 10)
    )
      ? Number.parseInt(shippingSiFreeThresholdCents, 10)
      : 5000,
    deliveryEstimate: shippingSiDeliveryEstimate,
    returnPeriodDays: 14,
  },
  socialLinks: {
    instagram: "",
    facebook: "",
  },
  productWarning:
    "Pred uporabo preberi navodila na embalaži. Ob jemanju zdravil, nosečnosti, dojenju ali zdravstvenih vprašanjih se posvetuj z ustreznim strokovnjakom.",
};

export const requiredLegalDetails = [
  ["legalBusinessName", "registrirani naziv ponudnika"],
  ["businessAddress", "sedež in poslovni naslov"],
  ["registrationNumber", "matična številka"],
  ["taxNumber", "davčna številka"],
  ["supportEmail", "preverjen e-poštni naslov podpore"],
  ["returnAddress", "naslov za vračila"],
  ["deliveryPartner", "pogodbeni dostavni partner"],
  ["irpsProvider", "izjava o izvajalcu IRPS"],
];

export const missingLegalDetails = requiredLegalDetails
  .filter(([key]) => !siteConfig[key]?.trim())
  .map(([, label]) => label)
  .concat(
    siteConfig.shipping.standardCents === null ? ["cena standardne dostave"] : [],
    !siteConfig.shipping.deliveryEstimate?.trim()
      ? ["potrjen rok dostave"]
      : []
  );

export const legalIdentityComplete = missingLegalDetails.length === 0;
