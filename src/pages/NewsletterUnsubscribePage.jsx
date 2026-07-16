import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { unsubscribeNewsletter } from "../services/api.js";

export default function NewsletterUnsubscribePage() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await unsubscribeNewsletter({ email: form.get("email") });
      setStatus("success");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <>
      <Seo
        title="Odjava od e-novic"
        description="Odjava e-poštnega naslova od HempAura e-novic."
        path="/newsletter/unsubscribe"
      />
      <section className="grid min-h-[65vh] place-items-center bg-cream px-5 py-16">
        <form className="w-full max-w-lg bg-white p-8 sm:p-10" onSubmit={handleSubmit}>
          <p className="text-xs font-bold uppercase text-clay">HempAura novice</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-forest">
            Odjava od e-novic
          </h1>
          <label className="mt-7 block text-sm font-bold text-forest" htmlFor="unsubscribe-email">
            E-poštni naslov
          </label>
          <input
            id="unsubscribe-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 min-h-12 w-full border border-forest/20 bg-porcelain px-4"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-5 min-h-12 bg-forest px-6 text-sm font-bold text-porcelain disabled:opacity-60"
          >
            {status === "loading" ? "Odjavljanje ..." : "Odjavi naslov"}
          </button>
          <p
            className={`mt-5 min-h-6 text-sm ${
              status === "error" ? "text-clay" : "text-forest"
            }`}
            aria-live="polite"
          >
            {message}
          </p>
          <Link className="mt-5 inline-flex text-sm font-bold text-forest underline" to="/">
            Nazaj na domov
          </Link>
        </form>
      </section>
    </>
  );
}
