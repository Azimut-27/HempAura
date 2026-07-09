import React from "react";
import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="bg-porcelain py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-lg bg-forest p-6 text-porcelain shadow-soft sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
              HempAura klub
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight">
              Prejmi novosti, vodiče in posebne ponudbe
            </h2>
            <p className="mt-4 text-sm leading-7 text-porcelain/72">
              Občasna sporočila o novih izdelkih, kakovosti in premišljenih
              wellness ritualih.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            {/* Hook this form to Shopify, Klaviyo, Stripe, or a custom checkout flow later. */}
            <label className="sr-only" htmlFor="email">
              E-poštni naslov
            </label>
            <div className="relative flex-1">
              <Mail
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/46"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                placeholder="tvoj@email.si"
                className="h-14 w-full rounded-lg border border-white/20 bg-porcelain pl-12 pr-4 text-sm font-medium text-forest outline-none transition focus:border-gold"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-gold px-7 text-sm font-bold text-forest transition duration-300 hover:-translate-y-0.5 hover:bg-porcelain"
            >
              Prijavi se
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
