import { ArrowLeft, Check, FileText, Minus, Plus, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FaqList from "../components/FaqList.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductMedia from "../components/ProductMedia.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import Seo from "../components/Seo.jsx";
import { siteConfig } from "../config/siteConfig.js";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getProductBySlug, getProductImage, products } from "../data/products.js";
import { formatPrice, formatProductDetails } from "../lib/formatters.js";
import NotFoundPage from "./NotFoundPage.jsx";

const productFaqs = [
  {
    question: "Kje najdem navodila za uporabo?",
    answer:
      "Potrjena navodila bodo prikazana na tej strani in na končni embalaži. Vedno imajo prednost navodila na embalaži.",
  },
  {
    question: "Kje najdem poročilo za serijo?",
    answer:
      "Povezava bo prikazana v razdelku laboratorijskih poročil, ko bo lastnik naložil veljaven dokument za konkretno serijo.",
  },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const defaultVariant =
    product?.variants?.find((v) => v.default) || product?.variants?.[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id || null
  );

  const activeVariant =
    product?.variants?.find((v) => v.id === selectedVariantId) || defaultVariant;

  const targetProductId = activeVariant ? activeVariant.id : product?.id;
  const displayPriceCents = activeVariant
    ? activeVariant.priceCents
    : product?.priceCents;
  const displayCompareAtPriceCents = activeVariant
    ? activeVariant.compareAtPriceCents
    : product?.compareAtPriceCents;
  const displaySizeGrams = activeVariant
    ? activeVariant.sizeGrams
    : product?.sizeGrams;
  const displayCbdAmountLabel = activeVariant
    ? activeVariant.cbdAmountLabel
    : product?.cbdAmountLabel;
  const displayShippingWeightGrams = activeVariant
    ? activeVariant.shippingWeightGrams
    : product?.shippingWeightGrams;
  const displayStock = activeVariant ? activeVariant.stock : product?.stock;
  const displaySku = activeVariant ? activeVariant.sku : product?.sku;

  const jsonLd = useMemo(() => {
    if (!product) return null;
    const image = getProductImage(product, language);
    const data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription,
      sku: displaySku,
      brand: { "@type": "Brand", name: product.brand || "HerbaGallus" },
      image: image?.src
        ? new URL(image.src, window.location.origin).toString()
        : undefined,
    };
    if (Number.isInteger(displayPriceCents)) {
      data.offers = {
        "@type": "Offer",
        priceCurrency: product.currency,
        price: (displayPriceCents / 100).toFixed(2),
        availability:
          displayStock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      };
    }
    return data;
  }, [language, product, displaySku, displayPriceCents, displayStock]);

  if (!product) return <NotFoundPage />;

  const available =
    product.status === "active" &&
    displayStock > 0 &&
    Number.isInteger(displayPriceCents);

  const effectiveProductForDetails = activeVariant
    ? { ...product, ...activeVariant }
    : product;
  const details = formatProductDetails(effectiveProductForDetails);
  const related = products.filter((item) => item.id !== product.id).slice(0, 2);
  const facts = [
    ["SKU", displaySku],
    ["Status", product.status === "active" ? "Aktiven" : "Neaktiven"],
    ["Zaloga", displayStock === 1 ? "1 kos" : `${displayStock} kosov`],
    [
      "Velikost",
      product.sizeMl
        ? `${product.sizeMl} ml`
        : displaySizeGrams
          ? `${displaySizeGrams} g`
          : null,
    ],
    ["CBD", displayCbdAmountLabel],
    [
      "CBG",
      product.cbgAmountMg
        ? `${product.cbgAmountMg} mg (${product.cbgPercentage} %)`
        : null,
    ],
    ["THC", product.metadata?.thcContent],
    ["Transportna teža", `${displayShippingWeightGrams} g`],
    [
      "Davek",
      `${product.taxRatePercent} % DDV · ${
        product.taxBehavior === "inclusive" ? "vključen v ceno" : "dodan ob plačilu"
      }`,
    ],
  ].filter(([, value]) => value);

  return (
    <>
      <Seo
        title={product.name}
        description={product.shortDescription}
        path={`/products/${product.slug}`}
        jsonLd={jsonLd}
      />
      <section className="bg-porcelain py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-forest"
            to="/products"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Nazaj na izdelke
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream shadow-sm border border-forest/10">
              {activeVariant?.sizeBadge && (
                <span className="absolute bottom-4 right-4 z-10 rounded-xl bg-ink/85 px-3.5 py-1 text-sm font-bold text-white shadow-md">
                  {activeVariant.sizeBadge}
                </span>
              )}
              <ProductMedia product={product} fit="cover" className="h-full w-full object-cover" />
            </div>
            <div className="lg:py-4">
              <p className="text-xs font-bold uppercase text-clay">
                {details.join(" · ") || "Podatki v pripravi"}
              </p>
              <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
                {product.titleLines ? (
                  <>
                    <span className="block">{t(product.titleLines[0])}</span>
                    <span className="block">{t(product.titleLines[1])}</span>
                  </>
                ) : (
                  product.name
                )}
              </h1>
              <p className="mt-4 text-lg text-forest/70">
                {activeVariant
                  ? `${activeVariant.label} · zunanji cvetovi · sveža citrusna aroma`
                  : product.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <p className="font-display text-3xl font-bold text-forest sm:text-4xl">
                  {formatPrice(displayPriceCents)}
                </p>
                {displayCompareAtPriceCents && (
                  <span className="text-lg text-forest/40 line-through">
                    {formatPrice(displayCompareAtPriceCents)}
                  </span>
                )}
                {activeVariant?.pricePerGramLabel && (
                  <span className="rounded-full border border-forest/12 bg-cream px-3 py-1 text-xs font-bold text-forest/75">
                    {activeVariant.pricePerGramLabel}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-forest/60">
                {siteConfig.taxLabel}.{" "}
                {activeVariant?.freeShipping ? (
                  <span className="font-bold text-emerald-700">
                    ✓ To pakiranje vključuje brezplačno dostavo!
                  </span>
                ) : (
                  "Dostava se izračuna pred plačilom (brezplačna nad 50 €)."
                )}
              </p>
              <p className="mt-2 text-sm font-bold text-clay">
                {displayStock > 0
                  ? displayStock === 1
                    ? "Na zalogi · zadnji kos"
                    : `Na zalogi · ${displayStock} kosov`
                  : "Ni na zalogi"}
              </p>

              {/* Variant Selector Grid on Detail Page */}
              {product.variants?.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-forest/75">
                    <span>{t("Izberi pakiranje (teža)")}:</span>
                    {displayCbdAmountLabel && (
                      <span className="text-moss">{displayCbdAmountLabel}</span>
                    )}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {product.variants.map((variant) => {
                      const isSelected = variant.id === activeVariant?.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${
                            isSelected
                              ? "border-forest bg-forest text-porcelain shadow-[0_8px_20px_rgba(23,56,44,0.18)] scale-[1.02]"
                              : "border-forest/15 bg-white text-forest hover:border-forest/40 hover:bg-cream/50"
                          }`}
                        >
                          {variant.bestValue ? (
                            <span className="absolute -top-2.5 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                              {t("Najboljša vrednost")}
                            </span>
                          ) : variant.popular ? (
                            <span className="absolute -top-2.5 rounded-full bg-[#A84A28] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                              {t("Priljubljeno")}
                            </span>
                          ) : null}
                          <span className="font-display text-xl font-bold">
                            {variant.label}
                          </span>
                          <span
                            className={`mt-0.5 text-xs font-bold ${
                              isSelected ? "text-porcelain" : "text-forest"
                            }`}
                          >
                            {formatPrice(variant.priceCents)}
                          </span>
                          {variant.pricePerGramLabel && (
                            <span
                              className={`mt-0.5 text-[10px] ${
                                isSelected ? "text-porcelain/75" : "text-forest/55"
                              }`}
                            >
                              {variant.pricePerGramLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="mt-6 leading-8 text-forest/72">{product.description}</p>
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                {/* Compact Light Pill Quantity Stepper */}
                <div className="flex h-13 sm:h-14 items-center justify-between rounded-full border border-forest/15 bg-white/90 px-3 py-1.5 shadow-[0_2px_10px_rgba(23,56,44,0.03)] sm:w-36">
                  <button
                    type="button"
                    disabled={quantity <= 1 || !available}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="grid size-9 place-items-center rounded-full text-forest/70 transition-all hover:bg-forest/8 hover:text-forest active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
                    aria-label={`Zmanjšaj količino za ${product.name}`}
                  >
                    <Minus size={15} strokeWidth={2.2} />
                  </button>
                  <span className="font-display text-lg font-bold text-forest min-w-[28px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= (displayStock || 99) || !available}
                    onClick={() => setQuantity(quantity + 1)}
                    className="grid size-9 place-items-center rounded-full text-forest/70 transition-all hover:bg-forest/8 hover:text-forest active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
                    aria-label={`Povečaj količino za ${product.name}`}
                  >
                    <Plus size={15} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Dominant Conversion-Focused Primary CTA Button */}
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    if (!available) return;
                    addItem(targetProductId, quantity);
                    setIsAdded(true);
                    setTimeout(() => setIsAdded(false), 1500);
                  }}
                  className={`group relative flex h-13 sm:h-14 flex-1 items-center justify-center gap-3 rounded-full px-8 text-sm sm:text-[15px] font-bold tracking-wide transition-all duration-300 ${
                    isAdded
                      ? "bg-emerald-700 text-white shadow-[0_12px_30px_rgba(4,120,87,0.28)] scale-[1.01]"
                      : "bg-[#7C4828] text-porcelain shadow-[0_12px_30px_rgba(124,72,40,0.22)] hover:-translate-y-0.5 hover:bg-[#683b1f] hover:shadow-[0_18px_40px_rgba(124,72,40,0.32)] active:translate-y-0 active:scale-[0.98]"
                  } disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none disabled:transform-none`}
                >
                  {isAdded ? (
                    <>
                      <Check size={19} className="stroke-[2.5]" />
                      <span>{t("Dodano v košarico ✓")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
                      <span>
                        {available
                          ? `${t("Dodaj v košarico")} · ${formatPrice(displayPriceCents * quantity)}`
                          : t("Trenutno ni na zalogi")}
                      </span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-7 border-l-2 border-gold pl-4 text-sm leading-7 text-forest/68">
                {siteConfig.productWarning}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-forest/10 bg-porcelain py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-forest">
            Podatki o izdelku
          </h2>
          <dl className="mt-6 grid gap-px overflow-hidden border border-forest/10 bg-forest/10 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="bg-white p-5">
                <dt className="text-xs font-bold uppercase tracking-wide text-forest/55">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-forest">{value}</dd>
              </div>
            ))}
          </dl>
          {product.metadata?.shippingWeightNote && (
            <p className="mt-4 text-xs leading-6 text-forest/55">
              {product.metadata.shippingWeightNote}
            </p>
          )}
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest">Sestavine</h2>
            <p className="mt-4 text-sm leading-7 text-forest/68">
              {product.ingredients.length
                ? product.ingredients.join(", ")
                : "TODO: Lastnik mora dodati natančen seznam sestavin z odobrene deklaracije."}
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest">Uporaba</h2>
            <p className="mt-4 text-sm leading-7 text-forest/68">{product.usageText}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest">Opozorila</h2>
            <p className="mt-4 text-sm leading-7 text-forest/68">
              {product.warnings.length
                ? product.warnings.join(" ")
                : "TODO: Lastnik mora dodati potrjena opozorila z embalaže."}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <FileText className="text-gold" aria-hidden="true" />
              <h2 className="mt-4 font-display text-4xl font-semibold text-forest">
                Laboratorijska poročila
              </h2>
              <p className="mt-4 text-sm leading-7 text-forest/68">
                {product.labReports.length
                  ? "Poročila so povezana spodaj."
                  : "Poročilo za ta izdelek še ni objavljeno. Dokument ne bo prikazan, dokler ni na voljo pristna datoteka za ustrezno serijo."}
              </p>
              <Link className="mt-5 inline-flex font-bold text-forest underline" to="/lab-reports">
                Preveri vsa poročila
              </Link>
            </div>
            <div>
              <h2 className="font-display text-4xl font-semibold text-forest">
                Dostava in vračila
              </h2>
              <p className="mt-4 text-sm leading-7 text-forest/68">
                Rok, cena dostave, partner in pogoji vračila čakajo na potrditev
                lastnika. Pred nakupom bodo prikazani v košarici in pogojih poslovanja.
              </p>
              <Link
                className="mt-5 inline-flex font-bold text-forest underline"
                to="/shipping-and-returns"
              >
                Odpri informacije
              </Link>
            </div>
          </div>
          <div className="mt-14">
            <FaqList items={productFaqs} />
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-semibold text-forest">
            Sorodni izdelki
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 z-30 border-t border-forest/10 bg-porcelain p-3 shadow-2xl lg:hidden">
        <button
          type="button"
          disabled={!available}
          onClick={() => addItem(product.id, quantity)}
          className="min-h-12 w-full bg-forest px-5 text-sm font-bold text-porcelain disabled:bg-forest/35"
        >
          {available ? `Dodaj · ${formatPrice(product.priceCents)}` : "Prodaja še ni odprta"}
        </button>
      </div>
    </>
  );
}
