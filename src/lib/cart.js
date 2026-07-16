import { getProductById } from "../data/products.js";

export const initialCartState = {
  items: [],
  drawerOpen: false,
  notice: "",
};

export function sanitizeCartItems(items) {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    const product = getProductById(item.productId);
    if (!product || product.status === "archived") return [];

    const maxQuantity = Math.max(0, product.stock);
    const quantity = Math.min(Math.max(1, Number(item.quantity) || 1), maxQuantity);
    return maxQuantity > 0 ? [{ productId: product.id, quantity }] : [];
  });
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { ...state, items: sanitizeCartItems(action.items) };
    case "add": {
      const product = getProductById(action.productId);
      if (!product || product.status !== "active" || product.stock < 1) return state;
      const existing = state.items.find((item) => item.productId === product.id);
      const requested = Math.max(1, Number(action.quantity) || 1);
      const quantity = Math.min((existing?.quantity || 0) + requested, product.stock);
      const items = existing
        ? state.items.map((item) =>
            item.productId === product.id ? { ...item, quantity } : item
          )
        : [...state.items, { productId: product.id, quantity }];
      return {
        ...state,
        items,
        drawerOpen: true,
        notice: `${product.name} je dodan v košarico.`,
      };
    }
    case "setQuantity": {
      const product = getProductById(action.productId);
      if (!product) return state;
      const quantity = Math.min(
        Math.max(1, Number(action.quantity) || 1),
        product.stock
      );
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity } : item
        ),
      };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.productId),
      };
    case "clear":
      return { ...state, items: [] };
    case "openDrawer":
      return { ...state, drawerOpen: true };
    case "closeDrawer":
      return { ...state, drawerOpen: false };
    case "clearNotice":
      return { ...state, notice: "" };
    default:
      return state;
  }
}

export function getCartTotals(items, shippingCents = null) {
  const subtotalCents = items.reduce((total, item) => {
    const product = getProductById(item.productId);
    if (!product || !Number.isInteger(product.priceCents)) return total;
    return total + product.priceCents * item.quantity;
  }, 0);

  return {
    subtotalCents,
    shippingCents,
    totalCents:
      shippingCents === null ? subtotalCents : subtotalCents + shippingCents,
  };
}
