import { describe, expect, it } from "vitest";
import { formatPrice } from "../src/lib/formatters.js";

describe("formatPrice", () => {
  it("formats EUR cents for Slovenia", () => {
    expect(formatPrice(2990)).toContain("29,90");
  });

  it("does not invent a missing price", () => {
    expect(formatPrice(null)).toBe("Cena bo objavljena");
  });
});
