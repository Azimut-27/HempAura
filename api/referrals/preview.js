import { randomUUID } from "node:crypto";
import { serverConfig } from "../../server/config/serverConfig.js";
import {
  PartnerApplicationNotificationEmail,
  PartnerApplicationNotificationText,
} from "../../server/emails/templates.js";
import {
  getClientIp,
  safeError,
  sendJson,
  validateSameOrigin,
} from "../../server/lib/http.js";
import { rateLimit } from "../../server/lib/rateLimit.js";
import { partnerApplicationSchema } from "../../server/lib/validation.js";
import {
  calculateReferralDiscountCents,
  normalizeReferralCode,
} from "../../server/referrals/referralProgram.js";
import { database } from "../../server/repositories/database.js";
import { sendEmail } from "../../server/services/email.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    // Live promo code availability check for Ambassador Application
    if (request.query?.check_code !== undefined) {
      const checkCode = normalizeReferralCode(request.query.check_code || "");
      if (!checkCode) {
        sendJson(response, 200, {
          available: false,
          code: "",
          reason: "Koda mora vsebovati 3–32 znakov (črke A–Z, številke 0–9, _ ali -).",
        });
        return;
      }
      try {
        const taken = await database.isReferralCodeTaken(checkCode);
        sendJson(response, 200, {
          available: !taken,
          code: checkCode,
          ...(taken ? { reason: "Ta promocijska koda je že zasedena." } : {}),
        });
      } catch (error) {
        safeError(error, "referral-code-check");
        sendJson(response, 200, { available: true, code: checkCode });
      }
      return;
    }

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
        message: "Kodo za popust bomo ponovno preverili v varnem plačilnem koraku.",
      });
    }
    return;
  }

  if (request.method === "POST") {
    if (!validateSameOrigin(request)) {
      sendJson(response, 403, { message: "Zahteve ni mogoče obdelati." });
      return;
    }

    const ip = getClientIp(request);
    const limit = rateLimit(`partner-apply:${ip}`, serverConfig.contactRateLimit);
    if (!limit.allowed) {
      response.setHeader("Retry-After", limit.retryAfterSeconds);
      sendJson(response, 429, { message: "Preveč poskusov. Poskusi znova pozneje." });
      return;
    }

    const parsed = partnerApplicationSchema.safeParse(request.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues?.[0];
      const fieldMsg =
        firstIssue?.path?.[0] === "requestedPromoCode"
          ? "Želena promo koda mora imeti 3–32 znakov (samo črke A–Z, številke 0–9, _ ali - brez presledkov)."
          : "Preveri vsa obvezna polja in potrdi strinjanje s pravili.";
      sendJson(response, 400, { message: fieldMsg });
      return;
    }

    const data = parsed.data;
    try {
      const taken = await database.isReferralCodeTaken(data.requestedPromoCode);
      if (taken) {
        sendJson(response, 409, {
          message: `Promocijska koda ${data.requestedPromoCode} je že zasedena. Izberi drugo kodo.`,
        });
        return;
      }

      const structuredNotes = JSON.stringify({
        socialPlatform: data.socialPlatform,
        handle: data.handle,
        audienceSize: data.audienceSize,
        niche: data.niche,
        promotionPlan: data.promotionPlan || "",
      });

      let partner = null;
      try {
        partner = await database.createPartnerApplication({
          displayName: data.fullName,
          contactEmail: data.email,
          publicCode: data.requestedPromoCode,
          customerDiscountPercent: 10,
          commissionRateBps: 1500,
          status: "pending",
          notes: structuredNotes,
        });
      } catch (dbErr) {
        const msg = String(dbErr?.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
          sendJson(response, 409, {
            message: `Promocijska koda ${data.requestedPromoCode} je že zasedena. Izberi drugo kodo.`,
          });
          return;
        }
        throw dbErr;
      }

      // Send email notification to owner
      const submittedAt = new Date().toLocaleString("sl-SI", {
        timeZone: "Europe/Ljubljana",
      });
      const emailData = {
        ...data,
        submittedAt,
      };
      const applicationId = partner?.id || randomUUID();

      try {
        await sendEmail({
          to: serverConfig.contactToEmail,
          subject: `HerbaGallus ambasador prijava: ${data.fullName} (${data.requestedPromoCode})`,
          html: PartnerApplicationNotificationEmail(emailData),
          text: PartnerApplicationNotificationText(emailData),
          replyTo: data.email,
          tags: [
            { name: "category", value: "partner_application" },
            { name: "partner_id", value: String(applicationId) },
          ],
          idempotencyKey: `partner-app/${applicationId}`,
        });
      } catch (emailError) {
        safeError(emailError, "partner-application-email");
      }

      sendJson(response, 201, {
        success: true,
        partner: partner
          ? {
              id: partner.id,
              publicCode: partner.public_code,
              status: partner.status,
            }
          : null,
        message: `Prijava za kodo ${data.requestedPromoCode} je uspešno oddana! Pregledali jo bomo in te v kratkem kontaktirali po e-pošti.`,
      });
    } catch (error) {
      safeError(error, "partner-application");
      sendJson(response, 500, {
        message: "Prijave trenutno ni bilo mogoče oddati. Poskusi znova pozneje.",
      });
    }
    return;
  }

  response.setHeader("Allow", "GET, POST");
  sendJson(response, 405, { message: "Metoda ni dovoljena." });
}
