import { describe, expect, it } from "vitest";
import { getServerProduct } from "../server/data/serverProducts.js";
import { generateOrderNumber } from "../server/lib/orderNumber.js";
import { checkoutSchema } from "../server/lib/validation.js";
import {
  calculateCommissionCents,
  calculateReferralDiscountCents,
  extractPromotionCodeReference,
  normalizeReferralCode,
} from "../server/referrals/referralProgram.js";
import { calculateShipping } from "../server/services/shipping.js";

describe("server catalogue and checkout validation", () => {
  it("looks up products by stable IDs", () => {
    expect(getServerProduct("hempaura-cbd-kapljice-5")?.name).toBe(
      "HempAura CBD kapljice 5%"
    );
    expect(getServerProduct("unknown")).toBeUndefined();
  });

  it("rejects client-supplied prices", () => {
    const result = checkoutSchema.safeParse({
      items: [
        {
          productId: "hempaura-cbd-kapljice-5",
          quantity: 1,
          priceCents: 1,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("generates a non-guessable public order reference", () => {
    const value = generateOrderNumber(new Date("2026-07-16T12:00:00Z"));
    expect(value).toMatch(/^HA-20260716-[A-F0-9]{6}$/);
  });

  it("rejects unsupported shipping countries", () => {
    expect(() => calculateShipping({ country: "AT", subtotalCents: 1000 })).toThrow(
      /ni podprta/
    );
  });

  it("normalizes referral codes and rejects unsafe values", () => {
    expect(normalizeReferralCode(" ana-10 ")).toBe("ANA-10");
    expect(normalizeReferralCode("x")).toBe("");
    expect(normalizeReferralCode("ANA 10")).toBe("");
  });

  it("accepts a referral code without accepting client prices", () => {
    const result = checkoutSchema.safeParse({
      items: [
        {
          productId: "hempaura-cbd-kapljice-5",
          quantity: 1,
        },
      ],
      referralCode: "ana10",
      language: "en",
    });
    expect(result.success).toBe(true);
    expect(result.data.referralCode).toBe("ANA10");
    expect(result.data.language).toBe("en");
  });

  it("calculates partner commission after the customer discount", () => {
    expect(
      calculateCommissionCents({
        subtotalCents: 10_000,
        discountCents: 1_000,
        commissionRateBps: 1_500,
      })
    ).toBe(1_350);
  });

  it("calculates a customer referral discount preview", () => {
    expect(calculateReferralDiscountCents(5990, 10)).toBe(599);
    expect(calculateReferralDiscountCents(5990, 150)).toBe(5990);
  });

  it("extracts an expanded Stripe promotion code", () => {
    expect(
      extractPromotionCodeReference({
        total_details: {
          breakdown: {
            discounts: [
              {
                discount: {
                  promotion_code: {
                    id: "promo_test",
                    code: "ana10",
                  },
                },
              },
            ],
          },
        },
      })
    ).toEqual({ id: "promo_test", code: "ANA10" });
  });
});
