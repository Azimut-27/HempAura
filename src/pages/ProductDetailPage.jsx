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

  const jsonLd = useMemo(() => {
    if (!product) return null;
    const image = getProductImage(product, language);
    const data = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.shortDescription,
      sku: product.sku,
      brand: { "@type": "Brand", name: product.brand || "HerbaGallus" },
      image: image?.src
        ? new URL(image.src, window.location.origin).toString()
        : undefined,
    };
    if (Number.isInteger(product.priceCents)) {
      data.offers = {
        "@type": "Offer",
        priceCurrency: product.currency,
        price: (product.priceCents / 100).toFixed(2),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      };
    }
    return data;
  }, [language, product]);

  if (!product) return <NotFoundPage />;

  const available =
    siteConfig.paymentsEnabled &&
    product.status === "active" &&
    product.stock > 0 &&
    Number.isInteger(product.priceCents);
  const details = formatProductDetails(product);
  const related = products.filter((item) => item.id !== product.id).slice(0, 2);
  const facts = [
    ["SKU", product.sku],
    ["Status", product.status === "active" ? "Aktiven" : "Neaktiven"],
    ["Zaloga", product.stock === 1 ? "1 kos" : `${product.stock} kosov`],
    [
      "Velikost",
      product.sizeMl
        ? `${product.sizeMl} ml`
        : product.sizeGrams
          ? `${product.sizeGrams} g`
          : null,
    ],
    ["CBD", product.cbdAmountLabel],
    [
      "CBG",
      product.cbgAmountMg
        ? `${product.cbgAmountMg} mg (${product.cbgPercentage} %)`
        : null,
    ],
    ["THC", product.metadata?.thcContent],
    ["Transportna teža", `${product.shippingWeightGrams} g`],
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
            <div className="aspect-square overflow-hidden bg-sage">
              <ProductMedia product={product} />
            </div>
            <div className="lg:py-4">
              <p className="text-xs font-bold uppercase text-clay">
                {details.join(" · ") || "Podatki v pripravi"}
              </p>
              <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg text-forest/70">{product.subtitle}</p>
              <p className="mt-7 text-2xl font-bold text-forest">
                {formatPrice(product.priceCents)}
              </p>
              <p className="mt-2 text-sm text-forest/60">
                {siteConfig.taxLabel}. Dostava se izračuna pred plačilom.
              </p>
              <p className="mt-2 text-sm font-bold text-clay">
                {product.stock > 0
                  ? product.stock === 1
                    ? "Na zalogi · zadnji kos"
                    : `Na zalogi · ${product.stock} kosov`
                  : "Ni na zalogi"}
              </p>
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
                    disabled={quantity >= (product.stock || 99) || !available}
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
                    addItem(product.id, quantity);
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
                          ? `${t("Dodaj v košarico")} · ${formatPrice(product.priceCents * quantity)}`
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
