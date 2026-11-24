import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactCta() {
  return (
    <section className="border-t border-forest/10 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Potrebuješ pomoč?
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.015em] text-forest">
            Piši ekipi HerbaGallus
          </h2>
        </div>
        <Link
          to="/contact"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-forest px-6 text-sm font-semibold tracking-[0.03em] text-porcelain transition-colors hover:bg-ink"
        >
          Odpri kontakt
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
