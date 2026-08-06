import { useState } from "react";
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
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await submitContact({
        name: form.get("name"),
        email: form.get("email"),
        subject: form.get("subject"),
        orderNumber: form.get("orderNumber"),
        message: form.get("message"),
        consent: true,
        website: form.get("website"),
      });
      setStatus("success");
      setMessage(result.message);
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <>
      <Seo
        title="Kontakt"
        description="Pošlji varno kontaktno sporočilo ekipi HerbaGallus."
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
                <dd className="mt-1 text-forest/65">
                  {siteConfig.supportEmail ? (
                    <a className="underline" href={`mailto:${siteConfig.supportEmail}`}>
                      {siteConfig.supportEmail}
                    </a>
                  ) : (
                    <strong className="text-clay">
                      Lastnik mora vnesti preverjen naslov podpore.
                    </strong>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-forest">Predviden odziv</dt>
                <dd className="mt-1 text-forest/65">{siteConfig.responseTime}</dd>
              </div>
              <div>
                <dt className="font-bold text-forest">Ponudnik</dt>
                <dd className="mt-1 text-forest/65">
                  {siteConfig.legalBusinessName || (
                    <strong className="text-clay">
                      Registrirani ponudnik še ni vnesen.
                    </strong>
                  )}
                </dd>
                {siteConfig.businessAddress && (
                  <dd className="mt-1 text-forest/65">{siteConfig.businessAddress}</dd>
                )}
              </div>
            </dl>
            <p className="mt-8 border-l-2 border-gold pl-4 text-sm leading-7 text-forest/65">
              Podpora ne daje zdravstvenih nasvetov. Za zdravstvena vprašanja se
              obrni na ustreznega strokovnjaka.
            </p>
          </div>
          <form
            className="border border-forest/10 bg-white/95 p-6 shadow-[0_24px_70px_rgba(23,56,44,0.10)] sm:p-8 lg:p-10"
            onSubmit={handleSubmit}
          >
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-website">Spletna stran</label>
              <input id="contact-website" name="website" tabIndex="-1" autoComplete="off" />
            </div>
            <div className="mb-8 flex flex-col gap-3 border-b border-forest/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">
                  Osebno sporočilo
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-forest">
                  Piši ekipi HerbaGallus
                </h2>
              </div>
              <p className="text-sm text-forest/60">{siteConfig.responseTime}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="contact-name"
                label="Ime in priimek"
                name="name"
                autoComplete="name"
                placeholder="Martin Jančar"
              />
              <Field
                id="contact-email"
                label="E-poštni naslov"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ime@email.com"
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                id="contact-subject"
                label="Zadeva"
                name="subject"
                placeholder="Vprašanje o izdelku"
              />
              <Field
                id="contact-order"
                label="Številka naročila (neobvezno)"
                name="orderNumber"
                required={false}
                placeholder="HA-..."
              />
            </div>
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-forest" htmlFor="contact-message">
                Sporočilo
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength="10"
                maxLength="4000"
                rows="7"
                placeholder="Napiši, kako ti lahko pomagamo."
                className="mt-2 w-full resize-y border border-forest/15 bg-porcelain/70 px-4 py-3 text-forest outline-none transition-colors placeholder:text-forest/35 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/25"
              />
            </div>
            <div className="mt-7 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "loading"}
                className="min-h-12 bg-forest px-8 text-sm font-bold text-porcelain shadow-[0_12px_28px_rgba(23,56,44,0.20)] transition-colors hover:bg-ink disabled:opacity-60"
              >
                {status === "loading" ? "Pošiljanje ..." : "Pošlji sporočilo"}
              </button>
              <div
                className={`min-h-7 text-sm ${
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
  placeholder,
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-forest" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={type === "text" && required ? 2 : undefined}
        maxLength="160"
        className="mt-2 min-h-12 w-full border border-forest/15 bg-porcelain/70 px-4 text-forest outline-none transition-colors placeholder:text-forest/35 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/25"
      />
    </div>
  );
}
