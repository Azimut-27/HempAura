import { describe, expect, it } from "vitest";
import { cartReducer, getCartTotals, initialCartState, sanitizeCartItems } from "../src/lib/cart.js";

describe("cart", () => {
  it("drops stale and unavailable products during hydration", () => {
    expect(
      sanitizeCartItems([
        { productId: "missing", quantity: 2 },
        { productId: "cbd-oil-5", quantity: 2 },
      ])
    ).toEqual([]);
  });

  it("does not add products that are not active", () => {
    const state = cartReducer(initialCartState, {
      type: "add",
      productId: "cbd-oil-5",
      quantity: 1,
    });
    expect(state.items).toEqual([]);
  });

  it("calculates totals from approved catalogue values only", () => {
    expect(getCartTotals([{ productId: "missing", quantity: 99 }])).toEqual({
      subtotalCents: 0,
      shippingCents: null,
      totalCents: 0,
    });
  });
});
