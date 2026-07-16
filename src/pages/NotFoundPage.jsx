import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Stran ni najdena"
        description="Zahtevana stran HempAura ne obstaja."
        path="/404"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl text-center">
          <p className="text-xs font-bold uppercase text-clay">Napaka 404</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest">
            Te strani ni tukaj.
          </h1>
          <p className="mt-5 leading-7 text-forest/68">
            Povezava je morda zastarela ali pa je bil naslov napačno vpisan.
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex min-h-12 items-center bg-forest px-6 text-sm font-bold text-porcelain"
          >
            Nazaj na domov
          </Link>
        </div>
      </section>
    </>
  );
}
