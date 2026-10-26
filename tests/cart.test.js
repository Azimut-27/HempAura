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

  it("supports 3g, 5g, 10g, and 25g flower weight variants in the cart", () => {
    expect(
      getCartTotals([
        { productId: "hempaura-cbg-cvetovi-citrin-15-3g", quantity: 1 },
        { productId: "hempaura-cbg-cvetovi-citrin-15-5g", quantity: 1 },
        { productId: "hempaura-cbg-cvetovi-citrin-15-10g", quantity: 1 },
        { productId: "hempaura-cbg-cvetovi-citrin-15-25g", quantity: 1 },
      ])
    ).toEqual({
      subtotalCents: 1190 + 1890 + 3090 + 5590,
      shippingCents: null,
      totalCents: 11760,
    });
  });
});
