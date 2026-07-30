const REFERRAL_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/;

export function normalizeReferralCode(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(normalized) ? normalized : "";
}

export function calculateCommissionCents({
  subtotalCents,
  discountCents,
  commissionRateBps,
}) {
  const qualifyingCents = Math.max(
    0,
    Number(subtotalCents || 0) - Number(discountCents || 0)
  );
  const safeRate = Math.min(10_000, Math.max(0, Number(commissionRateBps || 0)));
  return Math.round((qualifyingCents * safeRate) / 10_000);
}

export function calculateReferralDiscountCents(subtotalCents, discountPercent) {
  const subtotal = Math.max(0, Number(subtotalCents || 0));
  const percent = Math.min(100, Math.max(0, Number(discountPercent || 0)));
  return Math.round((subtotal * percent) / 100);
}

function promotionCodeFromDiscountEntry(entry) {
  const discount = entry?.discount || entry;
  const candidates = [
    discount?.promotion_code,
    discount?.promotionCode,
    discount?.source?.promotion_code,
    discount?.source?.promotionCode,
  ];
  return candidates.find(Boolean) || null;
}

export function extractPromotionCodeReference(session) {
  if (session?._hempAuraPromotionCode?.id) {
    return {
      id: session._hempAuraPromotionCode.id,
      code: normalizeReferralCode(session._hempAuraPromotionCode.code || ""),
    };
  }

  const entries = [
    ...(Array.isArray(session?.total_details?.breakdown?.discounts)
      ? session.total_details.breakdown.discounts
      : []),
    ...(Array.isArray(session?.discounts) ? session.discounts : []),
  ];

  for (const entry of entries) {
    const promotionCode = promotionCodeFromDiscountEntry(entry);
    if (!promotionCode) continue;
    if (typeof promotionCode === "string") {
      return { id: promotionCode, code: "" };
    }
    if (promotionCode.id) {
      return {
        id: promotionCode.id,
        code: normalizeReferralCode(promotionCode.code || ""),
      };
    }
  }

  return { id: "", code: "" };
}
