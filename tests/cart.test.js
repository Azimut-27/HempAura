import { describe, expect, it } from "vitest";
import { cartReducer, getCartTotals, initialCartState, sanitizeCartItems } from "../src/lib/cart.js";

describe("cart", () => {
  it("drops stale and unavailable products during hydration", () => {
    expect(
      sanitizeCartItems([
        { productId: "missing", quantity: 2 },
      ])
    ).toEqual([]);
  });

  it("adds active products and caps quantity at available stock", () => {
    const state = cartReducer(initialCartState, {
      type: "add",
      productId: "hempaura-cbd-kapljice-5",
      quantity: 40,
    });
    expect(state.items).toEqual([
      { productId: "hempaura-cbd-kapljice-5", quantity: 20 },
    ]);
  });

  it("calculates totals from approved catalogue values only", () => {
    expect(
      getCartTotals([{ productId: "hempaura-cbd-kapljice-5", quantity: 1 }])
    ).toEqual({
      subtotalCents: 3100,
      shippingCents: null,
      totalCents: 3100,
    });
  });
});
