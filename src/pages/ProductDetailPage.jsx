import { ArrowLeft, FileText, ShoppingBag } from "lucide-react";
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
  const { addItem } = useCart();
  const { language } = useLanguage();
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
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuantityControl
                  value={quantity}
                  min={1}
                  max={Math.max(1, product.stock)}
                  onChange={setQuantity}
                  label={product.name}
                />
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => addItem(product.id, quantity)}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-forest px-6 text-sm font-bold text-porcelain disabled:cursor-not-allowed disabled:bg-forest/30"
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  {available ? "Dodaj v košarico" : "Prodaja še ni odprta"}
                </button>
              </div>
              <button
                type="button"
                disabled={!available}
                onClick={() => {
                  addItem(product.id, quantity);
                  navigate("/cart");
                }}
                className="mt-3 min-h-12 w-full border border-forest/20 text-sm font-bold text-forest disabled:cursor-not-allowed disabled:opacity-40"
              >
                Kupi zdaj
              </button>
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
