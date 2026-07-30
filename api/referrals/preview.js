import { requireMethod, safeError, sendJson } from "../../server/lib/http.js";
import {
  calculateReferralDiscountCents,
  normalizeReferralCode,
} from "../../server/referrals/referralProgram.js";
import { database } from "../../server/repositories/database.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, "GET")) return;

  const code = normalizeReferralCode(request.query?.code || "");
  const subtotalCents = Number(request.query?.subtotal_cents || 0);
  if (!code || !Number.isInteger(subtotalCents) || subtotalCents < 0) {
    sendJson(response, 400, { message: "Koda za popust ni veljavna." });
    return;
  }

  try {
    const partner = await database.getActiveReferralPartnerByCode(code);
    if (!partner) {
      sendJson(response, 200, { active: false, code });
      return;
    }

    sendJson(response, 200, {
      active: true,
      code: partner.public_code,
      customerDiscountPercent: Number(partner.customer_discount_percent || 0),
      discountCents: calculateReferralDiscountCents(
        subtotalCents,
        partner.customer_discount_percent
      ),
    });
  } catch (error) {
    safeError(error, "referral-preview");
    sendJson(response, 200, {
      active: false,
      code,
      message: "Kodo za popust bomo ponovno preverili v varnem placilnem koraku.",
    });
  }
}
