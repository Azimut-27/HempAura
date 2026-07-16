import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo.jsx";

export default function NewsletterStatusPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState({
    status: "loading",
    message: "Preverjanje potrditvene povezave ...",
  });

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Potrditveni žeton manjka." });
      return;
    }
    fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        return payload;
      })
      .then((payload) => setState({ status: "success", message: payload.message }))
      .catch((error) =>
        setState({
          status: "error",
          message: error.message || "Povezave ni bilo mogoče potrditi.",
        })
      );
  }, [token]);

  return (
    <>
      <Seo
        title="Potrditev e-novic"
        description="Potrditev prijave na e-novice HempAura."
        path="/newsletter/confirm"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <div className="max-w-xl bg-white p-8 text-center sm:p-12">
          <p className="text-xs font-bold uppercase text-clay">HempAura novice</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-forest">
            {state.status === "success"
              ? "Prijava je potrjena"
              : state.status === "loading"
                ? "Preverjanje prijave"
                : "Potrditev ni uspela"}
          </h1>
          <p className="mt-5 leading-7 text-forest/68">{state.message}</p>
          <Link className="mt-7 inline-flex font-bold text-forest underline" to="/">
            Nazaj na domov
          </Link>
        </div>
      </section>
    </>
  );
}
