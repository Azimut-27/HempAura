import React from "react";
import { Sparkles } from "lucide-react";
import lifestyleImage from "../assets/hemp-lifestyle.png";

export default function LifestyleSection() {
  return (
    <section id="o-znamki" className="bg-forest py-20 text-porcelain sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={lifestyleImage}
            alt="Premium konopljin wellness ritual z amber stekleničko in naravnimi materiali"
            className="h-full min-h-[420px] w-full object-cover"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/18 bg-forest/72 p-4 backdrop-blur-md">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={17} className="text-gold" aria-hidden="true" />
              Izbrano za premišljene dnevne rutine
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
            Vsakdanji ritual
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Naraven del tvoje dnevne rutine
          </h2>
          <p className="mt-6 text-lg leading-8 text-porcelain/76">
            HempAura je ustvarjena za trenutke, ko želiš rutino upočasniti in jo
            narediti bolj premišljeno: jutranja nega, večerni ritual, skrb za
            kožo ali preprost trenutek zase po aktivnem dnevu.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {["Jutranja nega", "Večerni ritual", "Nega kože", "Aktiven življenjski slog"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/14 bg-white/8 px-5 py-4 text-sm font-semibold text-porcelain/88"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
