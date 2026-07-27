const requiredPublicLegalValues = [
  import.meta.env.VITE_LEGAL_ENTITY_NAME,
  import.meta.env.VITE_BUSINESS_ADDRESS,
  import.meta.env.VITE_REGISTRATION_NUMBER,
  import.meta.env.VITE_TAX_NUMBER,
  import.meta.env.VITE_SUPPORT_EMAIL,
  import.meta.env.VITE_RETURN_ADDRESS,
  import.meta.env.VITE_DELIVERY_PARTNER,
  import.meta.env.VITE_IRPS_PROVIDER,
  import.meta.env.VITE_SHIPPING_SI_STANDARD_CENTS,
  import.meta.env.VITE_SHIPPING_SI_DELIVERY_ESTIMATE,
];

const publicLegalConfigurationComplete = requiredPublicLegalValues.every(
  (value) => typeof value === "string" && value.trim().length > 0
);

export const siteConfig = {
  brandName: "HempAura",
  legalBusinessName: import.meta.env.VITE_LEGAL_ENTITY_NAME || "",
  businessAddress: import.meta.env.VITE_BUSINESS_ADDRESS || "",
  registrationNumber: import.meta.env.VITE_REGISTRATION_NUMBER || "",
  taxNumber: import.meta.env.VITE_TAX_NUMBER || "",
  vatId: import.meta.env.VITE_VAT_ID || "",
  domain: import.meta.env.VITE_SITE_URL || "http://localhost:5173",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "",
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || "",
  responseTime: import.meta.env.VITE_RESPONSE_TIME || "v dveh delovnih dneh",
  returnAddress: import.meta.env.VITE_RETURN_ADDRESS || "",
  deliveryPartner: import.meta.env.VITE_DELIVERY_PARTNER || "",
  irpsProvider: import.meta.env.VITE_IRPS_PROVIDER || "",
  legalLastUpdated: "27. julij 2026",
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
    text: "", // TODO(owner): add only verified shipping or launch information.
    linkLabel: "",
    linkTo: "/products",
  },
  shipping: {
    standardCents: Number.isFinite(
      Number.parseInt(import.meta.env.VITE_SHIPPING_SI_STANDARD_CENTS, 10)
    )
      ? Number.parseInt(import.meta.env.VITE_SHIPPING_SI_STANDARD_CENTS, 10)
      : null,
    freeThresholdCents: Number.isFinite(
      Number.parseInt(import.meta.env.VITE_SHIPPING_SI_FREE_THRESHOLD_CENTS, 10)
    )
      ? Number.parseInt(import.meta.env.VITE_SHIPPING_SI_FREE_THRESHOLD_CENTS, 10)
      : null,
    deliveryEstimate:
      import.meta.env.VITE_SHIPPING_SI_DELIVERY_ESTIMATE || "predvidoma 1–3 delovne dni",
    returnPeriodDays: 14,
  },
  socialLinks: {
    instagram: "", // TODO(owner): provide verified profile URLs.
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
    !import.meta.env.VITE_SHIPPING_SI_DELIVERY_ESTIMATE?.trim()
      ? ["potrjen rok dostave"]
      : []
  );

export const legalIdentityComplete = missingLegalDetails.length === 0;
