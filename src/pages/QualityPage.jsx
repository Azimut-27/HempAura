import { FileCheck2, PackageSearch, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import ContactCta from "../components/ContactCta.jsx";
import Seo from "../components/Seo.jsx";

const principles = [
  {
    icon: PackageSearch,
    title: "Identiteta izdelka",
    text: "Naziv, različica, serija in deklaracija morajo biti usklajeni pred objavo.",
  },
  {
    icon: FileCheck2,
    title: "Dokumentacija",
    text: "Poročilo se prikaže samo, ko obstaja resnična datoteka za konkreten izdelek ali serijo.",
  },
  {
    icon: Scale,
    title: "Odgovorna komunikacija",
    text: "Besedilo ne pripisuje zdravljenja ali zagotovljenih zdravstvenih učinkov.",
  },
];

export default function QualityPage() {
  return (
    <>
      <Seo
        title="Kakovost in sledljivost"
        description="Pristop HempAura k predstavitvi kakovosti, dokumentacije in sledljivosti brez izmišljenih certifikatov."
        path="/quality"
      />
      <section className="bg-forest py-16 text-porcelain sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-gold">Naš pristop</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-semibold sm:text-6xl">
            Transparentnost se začne pri tem, česar še ne vemo.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-porcelain/72">
            HempAura ne prikazuje laboratorija, certifikata, porekla ali rezultata,
            dokler lastnik ne predloži preverljivih podatkov.
          </p>
        </div>
      </section>
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-px bg-forest/10 px-5 sm:px-6 md:grid-cols-3 lg:px-8">
          {principles.map(({ icon: Icon, title, text }) => (
            <article key={title} className="bg-white p-7">
              <Icon className="text-gold" size={28} aria-hidden="true" />
              <h2 className="mt-5 font-display text-3xl font-semibold text-forest">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-forest/68">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-porcelain py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-semibold text-forest">
              Sledljivost po seriji
            </h2>
            <p className="mt-4 leading-8 text-forest/70">
              Časovnica dobavne verige bo dodana samo, če bodo na voljo pristni
              podatki o izvoru, predelavi, seriji in testiranju.
            </p>
          </div>
          <div>
            <h2 className="font-display text-4xl font-semibold text-forest">
              Poročila
            </h2>
            <p className="mt-4 leading-8 text-forest/70">
              Območje za dokumente je že pripravljeno na filtriranje po izdelku in
              prikaz številke serije ter datuma.
            </p>
            <Link className="mt-5 inline-flex font-bold text-forest underline" to="/lab-reports">
              Odpri laboratorijska poročila
            </Link>
          </div>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
