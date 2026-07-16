export const siteConfig = {
  brandName: "HempAura",
  legalBusinessName: "[LEGAL_ENTITY_NAME]", // TODO(owner): provide the registered legal entity.
  domain: import.meta.env.VITE_SITE_URL || "http://localhost:5173",
  supportEmail: "[SUPPORT_EMAIL]", // TODO(owner): provide a monitored support address.
  responseTime: "[RESPONSE_TIME]", // TODO(owner): provide a realistic support response window.
  currency: "EUR",
  locale: "sl-SI",
  businessCountry: "SI",
  pricesIncludeTax: true,
  taxLabel: "DDV vključen",
  paymentsEnabled: import.meta.env.VITE_PAYMENTS_ENABLED === "true",
  supportedCountries: ["SI"],
  announcement: {
    enabled: false,
    text: "", // TODO(owner): add only verified shipping or launch information.
    linkLabel: "",
    linkTo: "/products",
  },
  shipping: {
    standardCents: null, // TODO(owner): mirror the approved server-side rate.
    freeThresholdCents: null, // TODO(owner): mirror the approved server-side threshold.
    deliveryEstimate: "[ROK_DOSTAVE]", // TODO(owner): provide approved delivery timing.
  },
  socialLinks: {
    instagram: "", // TODO(owner): provide verified profile URLs.
    facebook: "",
  },
  productWarning:
    "Pred uporabo preberi navodila na embalaži. Ob jemanju zdravil, nosečnosti, dojenju ali zdravstvenih vprašanjih se posvetuj z ustreznim strokovnjakom.",
};
