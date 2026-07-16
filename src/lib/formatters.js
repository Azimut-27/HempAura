export function formatPrice(priceCents, currency = "EUR") {
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    return "Cena bo objavljena";
  }

  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export function formatProductDetails(product) {
  return [
    product.cbdPercentage ? `${product.cbdPercentage} % CBD` : null,
    product.sizeMl ? `${product.sizeMl} ml` : null,
    product.spectrum || null,
  ].filter(Boolean);
}
