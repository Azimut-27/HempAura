import { Eye, ShoppingBag, Sparkles, Star } from "lucide-react";
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

  const available =
    product.status === "active" &&
    product.stock > 0 &&
    Number.isInteger(product.priceCents);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addItem(product.id);
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
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-forest/10 bg-white shadow-[0_10px_30px_rgba(27,59,43,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(27,59,43,0.1)]">
        {/* Top Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream/40 p-4">
          {/* Top Left Badges */}
          <div className="absolute left-3.5 top-3.5 z-10 flex flex-col gap-1.5 items-start">
            {product.badgeTop && (
              <span className="rounded-full bg-[#2A1D15]/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F7EFE8] shadow-sm backdrop-blur-sm">
                {t(product.badgeTop)}
              </span>
            )}
            {product.badgePopular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#A84A28] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                <Sparkles size={11} />
                {t(product.badgePopular.replace("✨ ", ""))}
              </span>
            )}
          </div>

          {/* Bottom Right Size Badge */}
          {product.sizeBadge && (
            <span className="absolute bottom-3.5 right-3.5 z-10 rounded-lg bg-ink/85 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              {product.sizeBadge}
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
              fit="contain"
              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Hover Quick View Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto bg-black/10 backdrop-blur-[1px]">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="flex items-center gap-2 rounded-full bg-[#C6A355] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105 active:scale-95 hover:bg-[#b59244]"
            >
              <Eye size={15} />
              {t("HITRI OGLED")}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-moss">
              {t(product.categoryLabel || product.type || "CBD IZDELEK")}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Star size={13} className="fill-amber-400 text-amber-400" />
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
              {product.name}
            </Link>
          </h2>

          {/* Short Description */}
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-forest/70 sm:text-sm">
            {product.shortDescription}
          </p>

          <div className="my-5 border-t border-forest/8" />

          {/* Price & Action Row */}
          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-forest">
                {formatPrice(product.priceCents)}
              </span>
              {product.compareAtPriceCents && (
                <span className="text-sm text-forest/40 line-through">
                  {formatPrice(product.compareAtPriceCents)}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!available}
              onClick={handleAddToCart}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                isAdded
                  ? "bg-emerald-700 text-white"
                  : "bg-[#7C4828] text-white hover:bg-[#683b1f] active:scale-95 shadow-md"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <ShoppingBag size={15} />
              <span>{isAdded ? t("DODANO ✓") : t("V KOŠARICO")}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
