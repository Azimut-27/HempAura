import { Droplets, Package } from "lucide-react";

export default function ProductMedia({ product, className = "" }) {
  const image = product.images?.[0];
  if (image?.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
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
