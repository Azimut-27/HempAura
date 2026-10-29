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

function supabaseUrlEnv() {
  let value = stringEnv("SUPABASE_URL")
    .replace(/^SUPABASE_URL\s*=\s*/i, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
  if (!value) return "";
  const match = value.match(/https:\/\/[^/\s"']+\.supabase\.co/i);
  if (match) return match[0];
  try {
    const url = new URL(value);
    return `${url.origin}`;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

function supabaseSecretEnv() {
  return stringEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY")
    .replace(/^SUPABASE_(SECRET_KEY|SERVICE_ROLE_KEY)\s*=\s*/i, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

const legalCommerceConfigurationComplete = [
  process.env.LEGAL_ENTITY_NAME ||
    "HERBA GALLUS PROMOCIJA IN TRŽENJE STANISLAV BREGAR S.P.",
  process.env.BUSINESS_ADDRESS || "Prvomajska cesta 11, 8310 Šentjernej",
  process.env.REGISTRATION_NUMBER || "6079997000",
  process.env.TAX_NUMBER || "20543018",
  process.env.RETURN_ADDRESS || "Prvomajska cesta 11, 8310 Šentjernej",
  process.env.DELIVERY_PARTNER || "GLS Slovenija",
  stringEnv(
    "SUPPORT_EMAIL",
    "CONTACT_REPLY_TO_EMAIL",
    "VITE_SUPPORT_EMAIL",
    "CONTACT_TO_EMAIL"
  ) || "caj.plecnik@gmail.com",
  integerEnv("SHIPPING_SI_STANDARD_CENTS", 390),
  integerEnv("SHIPPING_SI_MIN_DAYS", 1),
  integerEnv("SHIPPING_SI_MAX_DAYS", 3),
].every((value) => value !== null && value !== undefined && String(value).trim().length > 0);

export const serverConfig = {
  adminDashboardToken: stringEnv("ADMIN_DASHBOARD_TOKEN"),
  siteUrl: process.env.VITE_SITE_URL || "http://localhost:5173",
  paymentsEnabled:
    process.env.VITE_PAYMENTS_ENABLED === "true" &&
    legalCommerceConfigurationComplete,
  paymentProvider: process.env.PAYMENT_PROVIDER || "stripe",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail: (() => {
    const configured = stringEnv("RESEND_FROM_EMAIL", "CONTACT_FROM_EMAIL");
    if (!configured || /@resend\.dev>?$/i.test(configured.trim())) {
      return "HerbaGallus <narocila@herbagallus.com>";
    }
    return configured;
  })(),
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || "",
  contactToEmail: stringEnv("CONTACT_TO_EMAIL") || "stakingforge@gmail.com",
  supportEmail:
    stringEnv("SUPPORT_EMAIL", "CONTACT_REPLY_TO_EMAIL", "VITE_SUPPORT_EMAIL") || "caj.plecnik@gmail.com",
  contactCustomerAckEnabled: booleanEnv("CONTACT_CUSTOMER_ACK_ENABLED", false),
  legalBusinessName:
    process.env.LEGAL_ENTITY_NAME ||
    "HERBA GALLUS PROMOCIJA IN TRŽENJE STANISLAV BREGAR S.P.",
  businessAddress:
    process.env.BUSINESS_ADDRESS || "Prvomajska cesta 11, 8310 Šentjernej",
  registrationNumber: process.env.REGISTRATION_NUMBER || "6079997000",
  taxNumber: process.env.TAX_NUMBER || "20543018",
  vatId: process.env.VAT_ID || "SI20543018",
  returnAddress:
    process.env.RETURN_ADDRESS || "Prvomajska cesta 11, 8310 Šentjernej",
  deliveryPartner: process.env.DELIVERY_PARTNER || "GLS Slovenija",
  supabaseUrl: supabaseUrlEnv(),
  supabaseServiceRoleKey: supabaseSecretEnv(),
  orderNumberPrefix: process.env.ORDER_NUMBER_PREFIX || "HA",
  businessCountry: process.env.BUSINESS_COUNTRY || "SI",
  pricesIncludeTax: process.env.PRICES_INCLUDE_TAX !== "false",
  taxLabel: process.env.DEFAULT_TAX_LABEL || "DDV vključen",
  taxCalculationMode: process.env.TAX_CALCULATION_MODE || "manual",
  shipping: {
    siStandardCents: integerEnv("SHIPPING_SI_STANDARD_CENTS", 390),
    siFreeThresholdCents: integerEnv("SHIPPING_SI_FREE_THRESHOLD_CENTS", 5000),
    siMinDays: integerEnv("SHIPPING_SI_MIN_DAYS", 1),
    siMaxDays: integerEnv("SHIPPING_SI_MAX_DAYS", 3),
  },
  gls: {
    baseUrl:
      stringEnv("GLS_BASE_URL") ||
      "https://api.mygls.si/ParcelService.svc/json/PrintLabels",
    username: stringEnv("GLS_USERNAME") || "caj.plecnik@gmail.com",
    clientNumber: integerEnv("GLS_CLIENT_NUMBER", 492380903),
    password: stringEnv("GLS_PASSWORD"),
    passwordHashAlgorithm:
      stringEnv("GLS_PASSWORD_HASH_ALGORITHM").toLowerCase() || "sha512",
    adminToken: stringEnv("GLS_ADMIN_TOKEN"),
    webshopEngine: stringEnv("GLS_WEBSHOP_ENGINE") || "HerbaGallus",
    printerType: stringEnv("GLS_PRINTER_TYPE") || "A4_2x2",
    printPosition: integerEnv("GLS_PRINT_POSITION", 1),
    hidePhoneNumberOnLabels: booleanEnv(
      "GLS_HIDE_PHONE_NUMBER_ON_LABELS",
      false
    ),
    timeoutMs: integerEnv("GLS_TIMEOUT_MS", 15_000),
    pickupAddress: {
      name:
        stringEnv("GLS_PICKUP_NAME") ||
        "HERBA GALLUS STANISLAV BREGAR S.P.",
      countryIsoCode: stringEnv("GLS_PICKUP_COUNTRY") || "SI",
      zipCode: stringEnv("GLS_PICKUP_ZIP") || "8310",
      city: stringEnv("GLS_PICKUP_CITY") || "Šentjernej",
      street: stringEnv("GLS_PICKUP_STREET") || "Prvomajska cesta",
      houseNumber: stringEnv("GLS_PICKUP_HOUSE_NUMBER") || "11",
      houseNumberInfo: stringEnv("GLS_PICKUP_HOUSE_NUMBER_INFO"),
      contactName:
        stringEnv("GLS_PICKUP_CONTACT_NAME") || "Stanislav Bregar",
      contactPhone: stringEnv("GLS_PICKUP_CONTACT_PHONE"),
      contactEmail:
        stringEnv("GLS_PICKUP_CONTACT_EMAIL") || "caj.plecnik@gmail.com",
    },
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
