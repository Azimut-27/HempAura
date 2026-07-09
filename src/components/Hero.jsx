import React from "react";
import { ArrowRight, BadgeCheck, Beaker, Leaf } from "lucide-react";

const badges = [
  { icon: Beaker, label: "Laboratorijsko testirano" },
  { icon: BadgeCheck, label: "THC znotraj zakonskih mej" },
  { icon: Leaf, label: "Ustvarjeno za Slovenijo" },
];

export default function Hero() {
  return (
    <section id="top" className="relative bg-soft-radial pt-28 sm:pt-32">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl items-center gap-12 px-5 pb-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-lg border border-gold/35 bg-white/42 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest/78">
            Premium konopljini rituali
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-normal text-forest sm:text-6xl lg:text-7xl">
            Premium CBD izdelki za vsakdanji wellness ritual
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-forest/72 sm:text-xl">
            Visokokakovostni konopljini izdelki, razviti za ljudi, ki cenijo
            naravne sestavine, transparentnost in premium uporabniško izkušnjo.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#izdelki"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-6 py-4 text-sm font-semibold text-porcelain shadow-soft transition duration-300 hover:-translate-y-1 hover:bg-ink"
            >
              Poglej izdelke
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              href="#kakovost"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-forest/18 bg-white/55 px-6 py-4 text-sm font-semibold text-forest backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-forest/40"
            >
              Več o kakovosti
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:justify-self-end">
          <div className="absolute -left-4 top-10 hidden rounded-lg bg-clay/10 px-5 py-4 text-sm font-semibold text-forest shadow-soft backdrop-blur sm:block">
            Sledljivo poreklo
          </div>
          <div className="relative rounded-lg border border-white/70 bg-white/46 p-5 shadow-soft backdrop-blur-xl sm:p-7">
            <div className="rounded-lg border border-forest/10 bg-porcelain/82 p-6">
              <div className="flex items-end justify-center gap-6 pt-5">
                <ProductBottle label="CBD 10%" tall />
                <ProductBottle label="CBD 5%" />
              </div>
              <div className="mt-8 grid gap-3">
                {badges.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-forest/10 bg-white/58 px-4 py-3 text-sm font-semibold text-forest"
                  >
                    <Icon size={18} className="text-gold" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 right-5 rounded-lg bg-forest px-5 py-4 text-sm font-semibold text-porcelain shadow-glow">
            Premium konopljin ekstrakt
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductBottle({ label, tall = false }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-8 w-12 rounded-t-lg bg-gold" />
      <div
        className={`product-bottle relative w-24 rounded-lg shadow-glow ${
          tall ? "h-64 sm:h-72" : "h-56 sm:h-64"
        }`}
      >
        <div className="absolute left-1/2 top-20 w-16 -translate-x-1/2 rounded-lg bg-porcelain/92 px-2 py-4 text-center shadow-soft">
          <span className="block text-xs font-semibold text-forest">{label}</span>
          <span className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-forest/58">
            HempAura
          </span>
        </div>
      </div>
    </div>
  );
}
