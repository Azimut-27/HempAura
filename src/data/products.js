const temporaryMedia = {
  oil: {
    kind: "placeholder",
    label: "Začasni prikaz olja",
    alt: "Začasni nevtralni prikaz embalaže CBD olja HempAura",
  },
  balm: {
    kind: "placeholder",
    label: "Začasni prikaz balzama",
    alt: "Začasni nevtralni prikaz embalaže CBD balzama HempAura",
  },
};

export const products = [
  {
    id: "cbd-oil-5",
    slug: "cbd-olje-5",
    name: "CBD olje 5%",
    subtitle: "Konopljin izdelek za premišljeno vsakodnevno rutino",
    type: "oil",
    status: "coming_soon",
    shortDescription:
      "Jasno predstavljen konopljin izdelek brez medicinskih obljub.",
    description:
      "Podrobnejši opis bo objavljen po potrditvi končne formule, označevanja in navodil za uporabo.",
    spectrum: null, // TODO(owner): provide the exact verified spectrum.
    cbdPercentage: 5,
    cbdAmountMg: null, // TODO(owner): provide verified total CBD amount.
    sizeMl: null, // TODO(owner): provide exact bottle size.
    ingredients: [], // TODO(owner): provide the exact label ingredients.
    usageText: "Upoštevaj navodila na končni embalaži.", // TODO(owner): replace with approved label text.
    warnings: [], // TODO(owner): provide product-specific warnings from the approved label.
    priceCents: null, // TODO(owner): provide the approved selling price.
    compareAtPriceCents: null,
    currency: "EUR",
    sku: "TODO-HA-OIL-5", // TODO(owner): replace with the operational SKU.
    stock: 0, // TODO(owner): connect approved launch stock.
    lowStockThreshold: 5,
    images: [temporaryMedia.oil],
    badge: null,
    featured: true,
    labReports: [],
    processorPriceId: null, // TODO(owner): set after payment-provider approval.
    shippingWeightGrams: null, // TODO(owner): provide packed shipping weight.
    taxCode: null, // TODO(accountant): approve tax treatment/code.
    metadata: {},
  },
  {
    id: "cbd-oil-10",
    slug: "cbd-olje-10",
    name: "CBD olje 10%",
    subtitle: "Bolj koncentrirana možnost v isti odgovorni rutini",
    type: "oil",
    status: "coming_soon",
    shortDescription:
      "Premium predstavitev z natančnimi podatki, ko jih potrdi lastnik.",
    description:
      "Končni opis izdelka čaka na potrjene podatke o sestavi, spektru, velikosti in uporabi.",
    spectrum: null,
    cbdPercentage: 10,
    cbdAmountMg: null,
    sizeMl: null,
    ingredients: [],
    usageText: "Upoštevaj navodila na končni embalaži.",
    warnings: [],
    priceCents: null,
    compareAtPriceCents: null,
    currency: "EUR",
    sku: "TODO-HA-OIL-10",
    stock: 0,
    lowStockThreshold: 5,
    images: [temporaryMedia.oil],
    badge: null,
    featured: true,
    labReports: [],
    processorPriceId: null,
    shippingWeightGrams: null,
    taxCode: null,
    metadata: {},
  },
  {
    id: "cbd-balm",
    slug: "cbd-balzam",
    name: "CBD balzam",
    subtitle: "Konopljina nega v preprostem ritualu",
    type: "balm",
    status: "coming_soon",
    shortDescription:
      "Izdelek za nego, pripravljen za dopolnitev s potrjeno deklaracijo.",
    description:
      "Končna predstavitev bo dodana po potrditvi sestavin, količine, opozoril in načina uporabe.",
    spectrum: null,
    cbdPercentage: null,
    cbdAmountMg: null,
    sizeMl: null,
    ingredients: [],
    usageText: "Upoštevaj navodila na končni embalaži.",
    warnings: [],
    priceCents: null,
    compareAtPriceCents: null,
    currency: "EUR",
    sku: "TODO-HA-BALM",
    stock: 0,
    lowStockThreshold: 5,
    images: [temporaryMedia.balm],
    badge: null,
    featured: true,
    labReports: [],
    processorPriceId: null,
    shippingWeightGrams: null,
    taxCode: null,
    metadata: {},
  },
];

export const getProductById = (id) => products.find((product) => product.id === id);
export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
export const activeProducts = products.filter((product) => product.status !== "archived");
