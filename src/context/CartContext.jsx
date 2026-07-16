import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { siteConfig } from "../config/siteConfig.js";
import { cartReducer, getCartTotals, initialCartState } from "../lib/cart.js";

const STORAGE_KEY = "hempaura-cart-v1";
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      dispatch({ type: "hydrate", items: saved });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo(() => {
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const baseTotals = getCartTotals(state.items);
    const configuredRate = siteConfig.shipping.standardCents;
    const threshold = siteConfig.shipping.freeThresholdCents;
    const estimatedShipping =
      Number.isInteger(configuredRate) && configuredRate >= 0
        ? Number.isInteger(threshold) && baseTotals.subtotalCents >= threshold
          ? 0
          : configuredRate
        : null;
    return {
      ...state,
      count,
      totals: getCartTotals(state.items, estimatedShipping),
      addItem: (productId, quantity = 1) =>
        dispatch({ type: "add", productId, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      clearCart: () => dispatch({ type: "clear" }),
      openDrawer: () => dispatch({ type: "openDrawer" }),
      closeDrawer: () => dispatch({ type: "closeDrawer" }),
      clearNotice: () => dispatch({ type: "clearNotice" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
