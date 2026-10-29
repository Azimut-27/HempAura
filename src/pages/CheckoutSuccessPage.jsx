import confetti from "canvas-confetti";
import { CheckCircle2, LoaderCircle, PackageCheck, RefreshCw, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { getCheckoutStatus } from "../services/api.js";

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const orderNumberParam = params.get("order_number");
  const methodParam = params.get("method") || "cod";
  const [state, setState] = useState(() => {
    if (orderNumberParam) {
      return {
        status: "confirmed",
        orderNumber: orderNumberParam,
        method: methodParam,
        message: "Vaše naročilo je bilo uspešno oddano in sprejeto v obdelavo.",
      };
    }
    return {
      status: "loading",
      message: "Preverjanje plačila ...",
    };
  });
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (orderNumberParam) return;
    if (!sessionId) {
      setState({
        status: "unconfirmed",
        message: "Ni varnega identifikatorja seje ali naročila.",
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

  // Proslavitvena animacija konfetov ob uspešni potrditvi
  useEffect(() => {
    if (state.status === "confirmed") {
      try {
        // Glavni izbruh konfetov
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#17382c", "#2d5e46", "#c69214", "#e8ba40", "#f4ecd8"],
          disableForReducedMotion: true,
        });

        // Dodatna stranska ognjemeta
        const timeout = setTimeout(() => {
          confetti({
            particleCount: 45,
            angle: 60,
            spread: 60,
            origin: { x: 0.05, y: 0.7 },
            colors: ["#17382c", "#c69214", "#2d5e46"],
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: 45,
            angle: 120,
            spread: 60,
            origin: { x: 0.95, y: 0.7 },
            colors: ["#17382c", "#c69214", "#2d5e46"],
            disableForReducedMotion: true,
          });
        }, 320);

        return () => clearTimeout(timeout);
      } catch {
        // Tiho prezri v okoljih brez podpore za canvas
      }
    }
  }, [state.status]);

  return (
    <>
      <Seo
        title="Stanje plačila"
        description="Varno preverjanje stanja naročila HerbaGallus."
        path="/checkout/success"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl w-full border border-forest/10 bg-white p-8 text-center sm:p-12 shadow-md rounded-3xl relative overflow-hidden">
          {state.status === "loading" && (
            <LoaderCircle
              className="mx-auto mb-4 animate-spin text-gold"
              size={42}
              aria-hidden="true"
            />
          )}

          {state.status === "confirmed" && (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-forest/10 text-forest shadow-inner ring-8 ring-forest/5 animate-in fade-in zoom-in duration-500">
              <CheckCircle2 size={44} className="stroke-[2.2] text-forest" />
            </div>
          )}

          <p className="text-xs font-bold uppercase tracking-wider text-clay">
            {state.status === "confirmed" ? "Hvala za vaše zaupanje" : "Stanje naročila"}
          </p>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-forest">
            {state.status === "confirmed"
              ? state.method === "cod"
                ? "Naročilo je uspešno oddano!"
                : state.method === "proforma"
                  ? "Predračun je pripravljen!"
                  : "Plačilo je potrjeno!"
              : state.status === "processing"
                ? "Plačilo se obdeluje"
                : "Potrditev še ni na voljo"}
          </h1>

          <p className="mt-4 leading-7 text-forest/75 text-sm sm:text-base">
            {state.status === "confirmed"
              ? state.method === "cod"
                ? "Hvala za vaše zaupanje. Naročilo je sprejeto v pripravo, znesek pa boste poravnali dostavljavcu GLS ob prevzemu paketa."
                : state.method === "proforma"
                  ? "Hvala za vaše naročilo. Podatke za UPN plačilo smo vam poslali na vaš e-poštni naslov."
                  : "Vaše naročilo je bilo uspešno oddano in sprejeto v pripravo. Potrditev in podrobnosti smo poslali na vaš e-poštni naslov."
              : state.message}
          </p>

          {state.orderNumber && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest/5 px-5 py-3 font-mono font-bold text-forest border border-forest/10 text-sm sm:text-base">
              <span>Številka naročila:</span>
              <span className="text-gold tracking-wide">{state.orderNumber}</span>
            </div>
          )}

          {state.status === "confirmed" && (
            <div className="mt-6 space-y-3 rounded-2xl bg-cream/80 p-4 text-left text-xs sm:text-sm text-forest/85 border border-forest/10">
              <div className="flex items-start gap-2.5">
                <PackageCheck size={18} className="text-forest shrink-0 mt-0.5" />
                <span><strong>Dostava z GLS Slovenija:</strong> Paket bo pripravljen in odposlan v 1–3 delovnih dneh.</span>
              </div>
              {state.method === "cod" && (
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-forest shrink-0 mt-0.5" />
                  <span><strong>Plačilo ob prevzemu:</strong> Znesek naročila poravnate dostavljavcu GLS ob izročitvi (z gotovino ali kartico).</span>
                </div>
              )}
              {state.method === "proforma" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-forest shrink-0 mt-0.5" />
                    <span><strong>Podatki za plačilo:</strong> Spodaj so podatki za bančno nakazilo (UPN nalog), ki smo vam jih poslali tudi na e-pošto.</span>
                  </div>

                  <div className="mt-3 rounded-xl border border-forest/20 bg-white p-4 text-left shadow-sm">
                    <div className="flex items-center justify-between border-b border-forest/10 pb-2 mb-3">
                      <span className="font-bold text-xs uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded">
                        UPN podatki za nakazilo
                      </span>
                      <span className="text-xs text-forest/60">Spletna ali mobilna banka</span>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm font-sans">
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">Prejemnik:</span>
                        <span className="font-bold text-forest text-right">HERBA GALLUS STANISLAV BREGAR S.P.</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">Naslov:</span>
                        <span className="text-forest text-right">Prvomajska cesta 11, 8310 Šentjernej</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">IBAN (TRR):</span>
                        <span className="font-mono font-bold text-forest text-right tracking-wide text-sm sm:text-base">SI56 0297 9025 9724 693</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">Banka:</span>
                        <span className="text-forest text-right">NLB d.d. (BIC: LJBASI2X)</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">Koda namena:</span>
                        <span className="font-mono font-semibold text-forest text-right">OTHR</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-dashed border-forest/10">
                        <span className="text-forest/60">Namen plačila:</span>
                        <span className="font-semibold text-forest text-right">Plačilo naročila {state.orderNumber}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                        <span className="text-forest/60">Referenca / Sklic:</span>
                        <span className="font-mono font-bold text-forest text-right">SI00 {state.orderNumber}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-[11px] text-forest/80 bg-amber-50 border border-amber-200/60 rounded-lg p-2.5 leading-relaxed">
                      💡 <strong>Pomembno:</strong> Paket bo pripravljen in odposlan z dostavno službo GLS takoj, ko prejmemo nakazilo na naš bančni račun.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {state.status === "confirmed" ? (
              <>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-forest/90 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag size={15} />
                  <span>Nadaljuj z nakupovanjem</span>
                </Link>
                <Link
                  className="inline-flex font-semibold text-forest/80 hover:text-forest underline text-sm py-2 px-3"
                  to="/contact"
                >
                  Potrebujete pomoč?
                </Link>
              </>
            ) : (
              <>
                {sessionId && (
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
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
