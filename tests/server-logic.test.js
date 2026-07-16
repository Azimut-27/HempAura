import { describe, expect, it } from "vitest";
import { getServerProduct } from "../api/data/serverProducts.js";
import { generateOrderNumber } from "../api/lib/orderNumber.js";
import { checkoutSchema } from "../api/lib/validation.js";
import { calculateShipping } from "../api/services/shipping.js";

describe("server catalogue and checkout validation", () => {
  it("looks up products by stable IDs", () => {
    expect(getServerProduct("cbd-oil-5")?.name).toBe("CBD olje 5%");
    expect(getServerProduct("unknown")).toBeUndefined();
  });

  it("rejects client-supplied prices", () => {
    const result = checkoutSchema.safeParse({
      items: [{ productId: "cbd-oil-5", quantity: 1, priceCents: 1 }],
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
});
