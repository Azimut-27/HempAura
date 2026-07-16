import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { siteConfig } from "../config/siteConfig.js";
import { submitContact } from "../services/api.js";

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await submitContact({
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        orderNumber: form.get("orderNumber"),
        message: form.get("message"),
        consent: form.get("consent") === "on",
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
    <>
      <Seo
        title="Kontakt"
        description="Pošlji varno kontaktno sporočilo ekipi HempAura."
        path="/contact"
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-clay">Kontakt</p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
              Kako ti lahko pomagamo?
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-forest/70">
              Za vprašanja o izdelkih, dostavi ali naročilu uporabi obrazec. Pri
              naročilu dodaj številko, če jo imaš.
            </p>
            <dl className="mt-8 space-y-5 text-sm">
              <div>
                <dt className="font-bold text-forest">E-pošta za podporo</dt>
                <dd className="mt-1 text-forest/65">{siteConfig.supportEmail}</dd>
              </div>
              <div>
                <dt className="font-bold text-forest">Predviden odziv</dt>
                <dd className="mt-1 text-forest/65">{siteConfig.responseTime}</dd>
              </div>
            </dl>
            <p className="mt-8 border-l-2 border-gold pl-4 text-sm leading-7 text-forest/65">
              Podpora ne daje zdravstvenih nasvetov. Za zdravstvena vprašanja se
              obrni na ustreznega strokovnjaka.
            </p>
          </div>
          <form className="bg-white p-6 sm:p-8" onSubmit={handleSubmit}>
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-website">Spletna stran</label>
              <input id="contact-website" name="website" tabIndex="-1" autoComplete="off" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="contact-name" label="Ime in priimek" name="name" autoComplete="name" />
              <Field
                id="contact-email"
                label="E-poštni naslov"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="contact-subject" label="Zadeva" name="subject" />
              <Field
                id="contact-order"
                label="Številka naročila (neobvezno)"
                name="orderNumber"
                required={false}
              />
            </div>
            <div className="mt-5">
              <label className="block text-sm font-bold text-forest" htmlFor="contact-message">
                Sporočilo
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength="10"
                maxLength="4000"
                rows="7"
                className="mt-2 w-full border border-forest/20 bg-porcelain px-4 py-3 outline-none focus:border-clay focus:ring-2 focus:ring-clay/25"
              />
            </div>
            <label className="mt-5 flex gap-3 text-sm leading-6 text-forest/70">
              <input type="checkbox" name="consent" required className="mt-1 size-5 accent-forest" />
              <span>
                Strinjam se z obdelavo podatkov za odgovor na sporočilo in sem
                prebral/-a <Link className="underline" to="/privacy">politiko zasebnosti</Link>.
              </span>
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 min-h-12 bg-forest px-7 text-sm font-bold text-porcelain disabled:opacity-60"
            >
              {status === "loading" ? "Pošiljanje ..." : "Pošlji sporočilo"}
            </button>
            <div
              className={`mt-5 min-h-7 text-sm ${
                status === "error" ? "text-clay" : "text-forest"
              }`}
              role={status === "error" ? "alert" : "status"}
            >
              {message}
              {status === "error" && (
                <button
                  type="submit"
                  className="ml-2 font-bold underline"
                  disabled={status === "loading"}
                >
                  Poskusi znova
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  required = true,
  autoComplete,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-forest" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        minLength={type === "text" && required ? 2 : undefined}
        maxLength="160"
        className="mt-2 min-h-12 w-full border border-forest/20 bg-porcelain px-4 outline-none focus:border-clay focus:ring-2 focus:ring-clay/25"
      />
    </div>
  );
}
