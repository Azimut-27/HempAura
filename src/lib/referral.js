const STORAGE_KEY = "hempaura-referral";
const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/;

export function normalizeReferralCode(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toUpperCase();
  return CODE_PATTERN.test(normalized) ? normalized : "";
}

export function rememberReferralCode(value, now = Date.now()) {
  const code = normalizeReferralCode(value);
  if (!code) return "";
  const attribution = {
    code,
    capturedAt: new Date(now).toISOString(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Checkout continues without attribution when storage is unavailable.
  }
  return code;
}

export function clearReferralCode() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Checkout continues without attribution when storage is unavailable.
  }
}

export function getStoredReferralCode() {
  try {
    const attribution = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    const code = normalizeReferralCode(attribution?.code || "");
    if (!code) {
      sessionStorage.removeItem(STORAGE_KEY);
      return "";
    }
    return code;
  } catch {
    return "";
  }
}
