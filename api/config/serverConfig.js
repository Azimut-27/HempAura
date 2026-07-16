function integerEnv(name, fallback = null) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export const serverConfig = {
  siteUrl: process.env.VITE_SITE_URL || "http://localhost:5173",
  paymentsEnabled: process.env.VITE_PAYMENTS_ENABLED === "true",
  paymentProvider: process.env.PAYMENT_PROVIDER || "stripe",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "",
  contactToEmail: process.env.CONTACT_TO_EMAIL || "",
  supportEmail: process.env.SUPPORT_EMAIL || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
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
  responseTime: process.env.RESPONSE_TIME || "[RESPONSE_TIME]",
};

export function requireConfig(entries) {
  const missing = entries.filter((key) => !serverConfig[key]);
  if (missing.length) {
    throw new Error(`Missing server configuration: ${missing.join(", ")}`);
  }
}
