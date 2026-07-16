export const serverProducts = [
  {
    id: "cbd-oil-5",
    name: "CBD olje 5%",
    sku: "TODO-HA-OIL-5",
    active: false, // TODO(owner): enable only after product and processor approval.
    priceCents: null, // TODO(owner): approved EUR price in cents.
    currency: "EUR",
    stock: 0, // TODO(owner): connect approved stock.
    processorPriceId: null,
    shippingWeightGrams: null,
  },
  {
    id: "cbd-oil-10",
    name: "CBD olje 10%",
    sku: "TODO-HA-OIL-10",
    active: false,
    priceCents: null,
    currency: "EUR",
    stock: 0,
    processorPriceId: null,
    shippingWeightGrams: null,
  },
  {
    id: "cbd-balm",
    name: "CBD balzam",
    sku: "TODO-HA-BALM",
    active: false,
    priceCents: null,
    currency: "EUR",
    stock: 0,
    processorPriceId: null,
    shippingWeightGrams: null,
  },
];

export const getServerProduct = (id) =>
  serverProducts.find((product) => product.id === id);
