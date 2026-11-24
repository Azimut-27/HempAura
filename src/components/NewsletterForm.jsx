import { useState } from "react";
import { Link } from "react-router-dom";
import { subscribeNewsletter } from "../services/api.js";

export default function NewsletterForm() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await subscribeNewsletter({
        email: form.get("email"),
        consent: form.get("consent") === "on",
        consentTextVersion: "2026-07-16",
        website: form.get("website"),
      });
      setStatus("success");
      setMessage(result.message);
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="newsletter-website">Spletna stran</label>
        <input id="newsletter-website" name="website" tabIndex="-1" autoComplete="off" />
      </div>
      <div>
        <label className="block text-sm font-bold text-porcelain" htmlFor="newsletter-email">
          E-poštni naslov
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vas.email@primer.si"
          className="mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-porcelain px-4 text-forest outline-none focus:border-gold focus:ring-2 focus:ring-gold/50"
        />
      </div>
      <label className="flex gap-3 text-sm leading-6 text-porcelain/78">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-5 shrink-0 rounded accent-gold"
        />
        <span>
          Strinjam se s prejemanjem e-novic. Prijavo bom potrdil/-a po e-pošti.
          Prebral/-a sem <Link className="underline decoration-gold/60 underline-offset-4" to="/privacy">politiko zasebnosti</Link>.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="min-h-12 rounded-lg bg-gold px-7 text-sm font-semibold tracking-[0.03em] text-ink transition-colors hover:bg-porcelain disabled:opacity-60"
      >
        {status === "loading" ? "Pošiljanje ..." : "Prijavi se"}
      </button>
      <p className="min-h-6 text-sm text-porcelain" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
