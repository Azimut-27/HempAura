import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function CheckoutCancelPage() {
  return (
    <>
      <Seo
        title="Plačilo preklicano"
        description="Plačilo HempAura je bilo preklicano in košarica je ohranjena."
        path="/checkout/cancel"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase text-clay">Plačilo ni bilo izvedeno</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-forest">
            Košarica je ostala shranjena
          </h1>
          <p className="mt-5 leading-7 text-forest/68">
            Plačilni postopek je bil preklican. Izdelke lahko pregledaš ali se vrneš
            v košarico.
          </p>
          <Link
            to="/cart"
            className="mt-7 inline-flex min-h-12 items-center bg-forest px-6 text-sm font-bold text-porcelain"
          >
            Nazaj v košarico
          </Link>
        </div>
      </section>
    </>
  );
}
