import { Eye, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatPrice } from "../lib/formatters.js";
import ProductMedia from "./ProductMedia.jsx";
import ProductQuickViewModal from "./ProductQuickViewModal.jsx";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const defaultVariant =
    product.variants?.find((v) => v.default) || product.variants?.[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id || null
  );

  const activeVariant =
    product.variants?.find((v) => v.id === selectedVariantId) || defaultVariant;

  const targetProductId = activeVariant ? activeVariant.id : product.id;
  const displayPriceCents = activeVariant
    ? activeVariant.priceCents
    : product.priceCents;
  const displayCompareAtPriceCents = activeVariant
    ? activeVariant.compareAtPriceCents
    : product.compareAtPriceCents;
  const displaySizeBadge = activeVariant
    ? activeVariant.sizeBadge
    : product.sizeBadge;
  const displayStock = activeVariant ? activeVariant.stock : product.stock;

  const available =
    product.status === "active" &&
    displayStock > 0 &&
    Number.isInteger(displayPriceCents);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addItem(targetProductId);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-forest/10 bg-porcelain shadow-[0_6px_24px_rgba(23,56,44,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-forest/18 hover:shadow-[0_18px_40px_rgba(23,56,44,0.09)]">
        {/* Top Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/40">
          {/* Single Quiet Top-Left Badge */}
          {product.badgeTop && (
            <div className="absolute left-3.5 top-3.5 z-10">
              <span className="inline-block rounded-md border border-forest/10 bg-porcelain/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest backdrop-blur-sm">
                {t(product.badgeTop)}
              </span>
            </div>
          )}

          {/* Subtle Bottom-Right Size Badge */}
          {displaySizeBadge && (
            <span className="absolute bottom-3 right-3 z-10 rounded-md bg-forest/85 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-porcelain backdrop-blur-sm transition-all">
              {displaySizeBadge}
            </span>
          )}

          {/* Product Image */}
          <Link
            to={`/products/${product.slug}`}
            className="block h-full w-full"
            aria-label={`Odpri ${product.name}`}
          >
            <ProductMedia
              product={product}
              fit="cover"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </Link>

          {/* Quiet Hover Quick View Pill */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="flex items-center gap-1.5 rounded-lg border border-forest/12 bg-porcelain/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-forest shadow-md backdrop-blur-md transition-colors hover:bg-forest hover:text-porcelain"
            >
              <Eye size={14} strokeWidth={1.8} />
              {t("HITRI OGLED")}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest/55">
              {t(product.categoryLabel || product.type || "CBD IZDELEK")}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-forest/80">
              <Star size={12} className="fill-gold text-gold" />
              <span>{product.rating || 4.9}</span>
              <span className="text-forest/40 font-normal">({product.reviewCount || 128})</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-2.5 font-display text-2xl font-semibold leading-snug text-forest">
            <Link
              to={`/products/${product.slug}`}
              className="hover:text-gold transition-colors"
            >
              {product.titleLines ? (
                <>
                  <span className="block">{t(product.titleLines[0])}</span>
                  <span className="block">{t(product.titleLines[1])}</span>
                </>
              ) : (
                product.name
              )}
            </Link>
          </h2>

          {/* Short Description */}
          <p className="mt-2.5 text-xs leading-relaxed text-forest/70 sm:text-sm">
            {t(product.shortDescription)}
          </p>

          {/* Interactive Weight Variant Pills (Option A) */}
          {product.variants?.length > 0 && (
            <div className="mt-3.5">
              <div
                className="grid grid-cols-4 gap-1.5"
                role="group"
                aria-label={t("Izbira pakiranja")}
              >
                {product.variants.map((variant) => {
                  const isSelected = variant.id === activeVariant?.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantId(variant.id);
                      }}
                      className={`rounded-lg border py-1.5 text-center text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-forest bg-forest text-porcelain"
                          : variant.stock === 0
                            ? "border-forest/10 bg-cream/20 text-forest/35 hover:border-forest/25"
                            : "border-forest/12 bg-cream/60 text-forest/75 hover:border-forest/35 hover:bg-cream"
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
              {activeVariant?.pricePerGramLabel && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-forest/55">
                  <span>{activeVariant.pricePerGramLabel}</span>
                  {activeVariant.freeShipping ? (
                    <span className="font-bold text-emerald-700">
                      ✓ {t("Brezplačna dostava")}
                    </span>
                  ) : activeVariant.savingsLabel ? (
                    <span className="font-bold text-clay">
                      {t("Prihranek")} {activeVariant.savingsLabel}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="my-4 border-t border-forest/8" />

          {/* Price & Action Row */}
          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-forest">
                {formatPrice(displayPriceCents)}
              </span>
              {displayCompareAtPriceCents && (
                <span className="text-sm text-forest/40 line-through">
                  {formatPrice(displayCompareAtPriceCents)}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!available}
              onClick={handleAddToCart}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold tracking-[0.04em] transition-all ${
                !available
                  ? "border border-forest/15 bg-forest/5 text-forest/45 cursor-not-allowed"
                  : isAdded
                    ? "bg-emerald-800 text-porcelain"
                    : "bg-forest text-porcelain hover:bg-ink active:scale-[0.98]"
              }`}
            >
              {!available ? (
                <span>
                  {product.status === "coming_soon"
                    ? t("PRIHAJA KMALU")
                    : t("NI NA VOLJO")}
                </span>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  <span>{isAdded ? t("DODANO ✓") : t("V KOŠARICO")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        initialVariantId={activeVariant?.id}
        onSelectVariant={setSelectedVariantId}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
