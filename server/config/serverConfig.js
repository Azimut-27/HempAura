function integerEnv(name, fallback = null) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function booleanEnv(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value === "true";
}

function stringEnv(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

const legalCommerceConfigurationComplete = [
  ["LEGAL_ENTITY_NAME"],
  ["BUSINESS_ADDRESS"],
  ["REGISTRATION_NUMBER"],
  ["TAX_NUMBER"],
  ["RETURN_ADDRESS"],
  ["DELIVERY_PARTNER"],
  ["SUPPORT_EMAIL", "CONTACT_REPLY_TO_EMAIL", "CONTACT_TO_EMAIL"],
  ["SHIPPING_SI_STANDARD_CENTS"],
  ["SHIPPING_SI_MIN_DAYS"],
  ["SHIPPING_SI_MAX_DAYS"],
].every((names) => names.some((name) => process.env[name]?.trim()));

export const serverConfig = {
  siteUrl: process.env.VITE_SITE_URL || "http://localhost:5173",
  paymentsEnabled:
    process.env.VITE_PAYMENTS_ENABLED === "true" &&
    legalCommerceConfigurationComplete,
  paymentProvider: process.env.PAYMENT_PROVIDER || "stripe",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail:
    stringEnv("RESEND_FROM_EMAIL", "CONTACT_FROM_EMAIL") ||
    "HempAura <onboarding@resend.dev>",
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || "",
  contactToEmail: stringEnv("CONTACT_TO_EMAIL") || "stakingforge@gmail.com",
  supportEmail:
    stringEnv("SUPPORT_EMAIL", "CONTACT_REPLY_TO_EMAIL", "VITE_SUPPORT_EMAIL", "CONTACT_TO_EMAIL") || "stakingforge@gmail.com",
  contactCustomerAckEnabled: booleanEnv("CONTACT_CUSTOMER_ACK_ENABLED", false),
  legalBusinessName: process.env.LEGAL_ENTITY_NAME || "",
  businessAddress: process.env.BUSINESS_ADDRESS || "",
  registrationNumber: process.env.REGISTRATION_NUMBER || "",
  taxNumber: process.env.TAX_NUMBER || "",
  vatId: process.env.VAT_ID || "",
  returnAddress: process.env.RETURN_ADDRESS || "",
  deliveryPartner: process.env.DELIVERY_PARTNER || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: stringEnv(
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
  ),
  orderNumberPrefix: process.env.ORDER_NUMBER_PREFIX || "HA",
  businessCountry: process.env.BUSINESS_COUNTRY || "SI",
  pricesIncludeTax: process.env.PRICES_INCLUDE_TAX !== "false",
  taxLabel: process.env.DEFAULT_TAX_LABEL || "DDV vključen",
  taxCalculationMode: process.env.TAX_CALCULATION_MODE || "manual",
  shipping: {
    siStandardCents: integerEnv("SHIPPING_SI_STANDARD_CENTS"),
    siFreeThresholdCents: integerEnv("SHIPPING_SI_FREE_THRESHOLD_CENTS"),
    siMinDays: integerEnv("SHIPPING_SI_MIN_DAYS"),
    siMaxDays: integerEnv("SHIPPING_SI_MAX_DAYS"),
  },
  contactRateLimit: {
    max: integerEnv("CONTACT_RATE_LIMIT_MAX", 5),
    windowSeconds: integerEnv("CONTACT_RATE_LIMIT_WINDOW_SECONDS", 900),
  },
  checkoutRateLimit: {
    max: integerEnv("CHECKOUT_RATE_LIMIT_MAX", 10),
    windowSeconds: integerEnv("CHECKOUT_RATE_LIMIT_WINDOW_SECONDS", 900),
  },
  newsletterRateLimit: {
    max: integerEnv("NEWSLETTER_RATE_LIMIT_MAX", 5),
    windowSeconds: integerEnv("NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS", 900),
  },
  newsletterTokenTtlHours: integerEnv("NEWSLETTER_TOKEN_TTL_HOURS", 48),
  responseTime: process.env.RESPONSE_TIME || "v dveh delovnih dneh",
};

export function requireConfig(entries) {
  const missing = entries.filter((key) => !serverConfig[key]);
  if (missing.length) {
    throw new Error(`Missing server configuration: ${missing.join(", ")}`);
  }
}
