import React from "react";
import { ArrowRight, Droplets, Package } from "lucide-react";

export default function ProductCard({ product }) {
  const isBalm = product.name.toLowerCase().includes("balzam");

  return (
    <article className="group flex h-full flex-col rounded-lg border border-forest/10 bg-white/62 p-4 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold/40">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-sage via-cream to-white">
        <div className="absolute left-5 top-5 rounded-lg bg-white/72 px-3 py-2 text-xs font-semibold text-forest shadow-sm">
          {product.tag}
        </div>
        {isBalm ? (
          <div className="product-balm grid size-32 place-items-center rounded-lg shadow-glow">
            <Package className="text-porcelain" size={38} aria-hidden="true" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-6 w-10 rounded-t-lg bg-gold" />
            <div className="product-bottle grid h-44 w-20 place-items-center rounded-lg shadow-glow">
              <div className="rounded-lg bg-porcelain/92 px-3 py-4 text-center">
                <Droplets className="mx-auto mb-2 text-gold" size={18} aria-hidden="true" />
                <span className="text-xs font-bold text-forest">{product.short}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-3xl font-semibold text-forest">{product.name}</h3>
          <p className="whitespace-nowrap text-sm font-bold text-clay">{product.price}</p>
        </div>
        <p className="mt-4 flex-1 text-sm leading-7 text-forest/68">{product.description}</p>
        <a
          href="#kontakt"
          className="mt-6 inline-flex items-center justify-between rounded-lg border border-forest/14 bg-porcelain px-4 py-3 text-sm font-semibold text-forest transition duration-300 group-hover:border-forest/28 group-hover:bg-forest group-hover:text-porcelain"
        >
          Ogled izdelka
          <ArrowRight size={17} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
