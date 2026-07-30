import { BadgePercent, HandCoins, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";

const benefits = [
  {
    icon: BadgePercent,
    title: "Osebna koda za popust",
    text: "Sledilci prejmejo dogovorjeni popust prek tvoje kode ali partnerske povezave.",
  },
  {
    icon: HandCoins,
    title: "Provizija za potrjene nakupe",
    text: "Za veljavne plačane nakupe se zabeleži dogovorjena provizija od neto vrednosti izdelkov.",
  },
  {
    icon: ShieldCheck,
    title: "Pregledna pravila",
    text: "Vsaka konverzija ima sled naročila, kode, zneska, čakalnega obdobja in statusa izplačila.",
  },
];

const steps = [
  "Pošlješ kratko predstavitev svojih kanalov, občinstva in načina ustvarjanja.",
  "Dogovorimo kodo, popust za kupca, stopnjo provizije in pogoje sodelovanja.",
  "Prejmeš osebno partnersko povezavo in navodila za odgovorno komunikacijo.",
  "Po potrjenem plačilu se provizija zabeleži; izplačilo sledi po preverjanju vračil in dogovorjenih pogojev.",
];

const rules = [
  "Plačane objave, darila in partnerske povezave morajo biti jasno označeni kot oglas oziroma komercialno sodelovanje.",
  "Prepovedane so zdravstvene, terapevtske ali zagotovljene trditve o učinkih CBD/CBG izdelkov.",
  "Provizija se računa od znižane vrednosti izdelkov, brez dostave in davka.",
  "Preklicana, vrnjena, sporna ali povrnjena naročila niso upravičena do izplačila.",
  "Samonakupi, zloraba kod in zavajajoče predstavljanje lahko pomenijo prekinitev sodelovanja.",
  "Višina popusta, provizije, prag in ritem izplačil se določijo v individualnem dogovoru.",
];

export default function PartnerProgramPage() {
  return (
    <>
      <Seo
        title="Partnerski program"
        description="Partnerski program HempAura za odgovorne ustvarjalce: koda za popust, sledljive konverzije in pregledna provizija."
        path="/partners"
      />

      <section className="hero-wash border-b border-forest/10 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">
              Partnerski program HempAura
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] text-forest sm:text-7xl">
              Ustvarjaj z nami. Zasluži z zaupanjem.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-forest/72">
              Program je namenjen ustvarjalcem, ki cenijo premišljeno predstavitev,
              jasne informacije in odgovorno komunikacijo o konopljinih izdelkih.
            </p>
          </div>
          <div className="border-l-2 border-gold bg-porcelain/65 p-6">
            <p className="text-sm font-bold text-forest">Pomembno</p>
            <p className="mt-2 text-sm leading-7 text-forest/68">
              Sodelovanje ni avtomatsko. Pred aktivacijo kode potrdimo identiteto,
              vsebinsko usmeritev, pogodbo in podatke, potrebne za zakonito izplačilo.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-forest/10 bg-white p-7">
                <Icon className="text-gold" size={26} aria-hidden="true" />
                <h2 className="mt-5 font-display text-3xl font-semibold text-forest">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-forest/68">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">
              Kako deluje
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-forest sm:text-5xl">
              Od prvega pogovora do prve konverzije
            </h2>
          </div>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[44px_1fr] gap-4">
                <span className="grid size-11 place-items-center bg-forest text-sm font-bold text-gold">
                  {index + 1}
                </span>
                <p className="pt-2 text-sm leading-7 text-forest/72">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-forest py-16 text-porcelain sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Pravila sodelovanja
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Jasna meja med priporočilom in obljubo
            </h2>
          </div>
          <ul className="divide-y divide-white/12 border-y border-white/12">
            {rules.map((rule) => (
              <li key={rule} className="py-5 text-sm leading-7 text-porcelain/75">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-porcelain py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">
            Postani HempAura partner
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-forest sm:text-5xl">
            Povej nam, kaj ustvarjaš
          </h2>
          <p className="mt-5 leading-8 text-forest/68">
            V sporočilo dodaj povezave do kanalov, osnovne podatke o občinstvu in
            primer vsebine, ki najbolje predstavlja tvoj slog.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex min-h-14 items-center justify-center bg-forest px-8 text-sm font-bold text-porcelain"
          >
            Pošlji predstavitev
          </Link>
        </div>
      </section>
    </>
  );
}
