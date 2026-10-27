import { LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { getCheckoutStatus } from "../services/api.js";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({
    status: "loading",
    message: "Preverjanje plačila ...",
  });
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setState({
        status: "unconfirmed",
        message: "Ni varnega identifikatorja seje. Plačila ne moremo potrditi.",
      });
      return;
    }

    let active = true;
    let timer = null;

    getCheckoutStatus(sessionId)
      .then((result) => {
        if (!active) return;
        setState(result);

        // Če je status še v obdelavi ("processing"), poskusi ponovno čez 2.5 sekunde (do 5 poskusov)
        if (result.status === "processing" && checkCount < 5) {
          timer = setTimeout(() => {
            if (active) setCheckCount((prev) => prev + 1);
          }, 2500);
        }
      })
      .catch((error) => {
        if (!active) return;
        // Ob prehodni napaki med zaključevanjem plačila poskusi še 2-krat
        if (checkCount < 2) {
          timer = setTimeout(() => {
            if (active) setCheckCount((prev) => prev + 1);
          }, 2500);
        } else {
          setState({
            status: "unconfirmed",
            message:
              error?.message ||
              "Plačila trenutno ni mogoče potrditi. Ne oddajaj novega naročila brez preverjanja e-pošte ali podpore.",
          });
        }
      });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, checkCount]);

  return (
    <>
      <Seo
        title="Stanje plačila"
        description="Varno preverjanje stanja naročila HerbaGallus."
        path="/checkout/success"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl border border-forest/10 bg-white p-8 text-center sm:p-12 shadow-sm rounded-2xl">
          {state.status === "loading" && (
            <LoaderCircle
              className="mx-auto mb-4 animate-spin text-gold"
              size={36}
              aria-hidden="true"
            />
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
            <div className="mt-5 inline-block rounded-xl bg-forest/5 px-5 py-2.5 font-bold text-forest border border-forest/10">
              Naročilo: {state.orderNumber}
            </div>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {state.status !== "confirmed" && sessionId && (
              <button
                type="button"
                onClick={() => {
                  setState({ status: "loading", message: "Ponovno preverjanje ..." });
                  setCheckCount((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-5 py-2.5 text-xs font-bold text-forest hover:bg-forest/5 transition-colors"
              >
                <RefreshCw size={14} />
                <span>Osveži stanje</span>
              </button>
            )}
            <Link
              className="inline-flex font-bold text-forest underline text-sm"
              to="/contact"
            >
              Kontaktiraj podporo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
