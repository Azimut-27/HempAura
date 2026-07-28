import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice, formatProductDetails } from "../lib/formatters.js";
import ProductMedia from "./ProductMedia.jsx";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const available =
    product.status === "active" &&
    product.stock > 0 &&
    Number.isInteger(product.priceCents);

  return (
    <article className="group flex h-full flex-col border border-forest/10 bg-white">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <Link
          to={`/products/${product.slug}`}
          className="block aspect-[4/3] w-full overflow-hidden rounded-[3px] bg-cream"
          aria-label={`Odpri ${product.name}`}
        >
          <ProductMedia
            product={product}
            fit="cover"
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex min-h-5 items-start justify-between gap-4">
          <span className="text-xs font-bold uppercase text-clay">
            {product.badge || ""}
          </span>
          <p className="shrink-0 text-sm font-bold text-clay">
            {formatPrice(product.priceCents)}
          </p>
        </div>
        <h2 className="mt-2 min-h-[4.5rem] font-display text-3xl font-semibold text-forest">
          {product.name}
        </h2>
        <p className="mt-2 text-xs font-semibold uppercase text-moss">
          {formatProductDetails(product).join(" · ") || "Podatki v pripravi"}
        </p>
        <p className="mt-4 flex-1 text-sm leading-7 text-forest/68">
          {product.shortDescription}
        </p>
        <p className="mt-4 text-xs font-bold uppercase text-forest/55">
          {available
            ? product.stock === 1
              ? "Na zalogi · zadnji kos"
              : `Na zalogi · ${product.stock} kosov`
            : product.status === "active"
              ? "Ni na zalogi"
              : "Prodaja še ni odprta"}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!available}
            onClick={() => addItem(product.id)}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-forest px-3 text-sm font-bold text-porcelain disabled:cursor-not-allowed disabled:bg-forest/30"
          >
            <ShoppingBag size={17} aria-hidden="true" />
            V košarico
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-forest/18 px-3 text-sm font-bold text-forest hover:bg-sage"
          >
            Podrobnosti
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
