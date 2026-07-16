import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { getCheckoutStatus } from "../services/api.js";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ status: "loading", message: "Preverjanje plačila ..." });

  useEffect(() => {
    if (!sessionId) {
      setState({
        status: "unconfirmed",
        message: "Ni varnega identifikatorja seje. Plačila ne moremo potrditi.",
      });
      return;
    }
    let active = true;
    getCheckoutStatus(sessionId)
      .then((result) => {
        if (active) setState(result);
      })
      .catch(() => {
        if (active) {
          setState({
            status: "unconfirmed",
            message:
              "Plačila trenutno ni mogoče potrditi. Ne oddajaj novega naročila brez preverjanja e-pošte ali podpore.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <>
      <Seo
        title="Stanje plačila"
        description="Varno preverjanje stanja naročila HempAura."
        path="/checkout/success"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl border border-forest/10 bg-white p-8 text-center sm:p-12">
          {state.status === "loading" && (
            <LoaderCircle className="mx-auto animate-spin text-gold" aria-hidden="true" />
          )}
          <p className="text-xs font-bold uppercase text-clay">Stanje naročila</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-forest">
            {state.status === "confirmed"
              ? "Plačilo je potrjeno"
              : state.status === "processing"
                ? "Plačilo se obdeluje"
                : "Potrditev še ni na voljo"}
          </h1>
          <p className="mt-5 leading-7 text-forest/68">{state.message}</p>
          {state.orderNumber && (
            <p className="mt-4 font-bold text-forest">Naročilo: {state.orderNumber}</p>
          )}
          <Link className="mt-7 inline-flex font-bold text-forest underline" to="/contact">
            Kontaktiraj podporo
          </Link>
        </div>
      </section>
    </>
  );
}
