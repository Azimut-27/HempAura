import {
  Clock,
  Droplets,
  Eye,
  Leaf,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatPrice } from "../lib/formatters.js";
import ProductMedia from "./ProductMedia.jsx";

const iconMap = {
  Leaf,
  Droplets,
  Sparkles,
  Clock,
  ShieldCheck,
  Package,
};

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActiveThumb(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product.id);
    }
    onClose();
  };

  const totalPriceCents = (product.priceCents || 0) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/65 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-5xl rounded-[28px] bg-porcelain shadow-[0_25px_70px_rgba(23,56,44,0.25)] border border-forest/10 p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-full bg-forest/5 text-forest transition-colors hover:bg-forest hover:text-white"
          aria-label={t("Zapri")}
        >
          <X size={20} />
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          {/* LEFT COLUMN: Main image + Thumbnails + Story Quote */}
          <div className="flex flex-col gap-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-forest/8">
              {product.badgeTop && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-porcelain shadow-md">
                  {t(product.badgeTop)}
                </span>
              )}
              <ProductMedia product={product} fit="contain" className="p-6 object-contain" />
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-3">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveThumb(index)}
                  className={`relative aspect-square size-18 overflow-hidden rounded-xl border-2 transition-all ${
                    activeThumb === index
                      ? "border-gold shadow-md scale-105"
                      : "border-forest/15 hover:border-forest/40 opacity-75"
                  }`}
                >
                  <ProductMedia product={product} fit="cover" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Story Quote Box */}
            {product.quote && (
              <div className="rounded-2xl border border-forest/10 bg-cream/70 p-5 shadow-sm">
                <p className="font-display text-sm italic leading-relaxed text-forest/85">
                  {t(product.quote)}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Weight + Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase text-moss">
                <span>
                  {t(product.categoryLabel || product.type || "CBD IZDELEK")}
                  {product.sizeBadge ? ` • ${product.sizeBadge}` : ""}
                </span>
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-forest/50 font-normal lowercase">
                    ({product.reviewCount || 128} {t("mnenj")})
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-forest sm:text-4xl">
                  {formatPrice(product.priceCents)}
                </span>
                {product.compareAtPriceCents && (
                  <span className="text-lg text-forest/40 line-through">
                    {formatPrice(product.compareAtPriceCents)}
                  </span>
                )}
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {t("Vključuje DDV")}
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed text-forest/75">
                {product.description || product.shortDescription}
              </p>

              {/* Composition Breakdown Table */}
              {product.compositionBreakdown?.length > 0 && (
                <div className="mt-6 rounded-2xl border border-forest/10 bg-white/80 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-forest">
                    <Sparkles size={14} className="text-gold" />
                    <span>{t("SESTAVINE & KANABINOIDNI PROFIL:")}</span>
                  </div>
                  <div className="mt-3 divide-y divide-forest/5">
                    {product.compositionBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 text-xs">
                        <span className="text-forest/80 font-medium">{t(item.name)}</span>
                        <span className="font-bold text-forest">{item.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parameter / Specs Boxes */}
              {product.specs?.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {product.specs.map((spec, idx) => {
                    const IconComponent = iconMap[spec.icon] || Leaf;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-forest/8 bg-cream/50 p-3.5"
                      >
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-forest/8 text-forest">
                          <IconComponent size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase text-moss">{t(spec.label)}</p>
                          <p className="truncate text-xs font-semibold text-forest">{t(spec.value)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-8 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center">
              {/* Quantity Selector */}
              <div className="flex h-13 items-center justify-between rounded-full border border-forest/20 bg-white px-4 py-2 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-forest/70 hover:text-forest transition-colors p-1"
                  aria-label={t("Zmanjšaj količino")}
                >
                  <Minus size={16} />
                </button>
                <span className="font-display text-lg font-bold text-forest">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-forest/70 hover:text-forest transition-colors p-1"
                  aria-label={t("Povečaj količino")}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add To Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-13 flex-1 items-center justify-center gap-3 rounded-full bg-[#7C4828] hover:bg-[#683b1f] px-8 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <ShoppingBag size={18} />
                <span>
                  {t("DODAJ V KOŠARICO")} • {formatPrice(totalPriceCents)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
