import { Droplets, Package } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getProductImage } from "../data/products.js";

export default function ProductMedia({ product, className = "" }) {
  const { language } = useLanguage();
  const image = getProductImage(product, language);
  if (image?.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className={`h-full w-full bg-white object-contain p-4 sm:p-6 ${className}`}
      />
    );
  }

  const Icon = product.type === "balm" ? Package : Droplets;
  return (
    <div
      className={`relative grid h-full w-full place-items-center bg-sage ${className}`}
      role="img"
      aria-label={image?.alt || `Začasni prikaz izdelka ${product.name}`}
    >
      <div className="text-center text-forest">
        <Icon className="mx-auto text-gold" size={42} aria-hidden="true" />
        <p className="mt-4 font-display text-2xl font-semibold">{product.name}</p>
        <p className="mt-2 text-xs font-bold uppercase text-forest/60">
          Začasni prikaz
        </p>
      </div>
    </div>
  );
}
