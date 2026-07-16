import Seo from "../components/Seo.jsx";

export default function ResponsibleUsePage() {
  return (
    <>
      <Seo
        title="Odgovorna uporaba"
        description="Splošna načela odgovorne uporabe in omejitve informacij HempAura."
        path="/responsible-use"
      />
      <article className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-clay">Pomembne informacije</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            Odgovorna uporaba
          </h1>
          <div className="mt-10 space-y-9">
            <Section title="Upoštevaj embalažo">
              Uporabljaj samo skladno s potrjeno deklaracijo in navodili na končni
              embalaži. Spletni povzetek ne nadomesti oznak izdelka.
            </Section>
            <Section title="Brez zdravstvenih obljub">
              Izdelki in vsebina niso predstavljeni kot način diagnosticiranja,
              zdravljenja, ozdravitve ali preprečevanja bolezni.
            </Section>
            <Section title="Posvet s strokovnjakom">
              Pred uporabo se posvetuj z zdravnikom ali farmacevtom, kadar jemlješ
              zdravila, si noseča, dojiš, imaš zdravstveno stanje ali nisi prepričan/-a
              o primernosti izdelka.
            </Section>
            <Section title="Varnost">
              Izdelek hrani skladno z navodili, izven dosega otrok, in ga ne uporabljaj,
              če je embalaža poškodovana ali podatki o seriji niso jasni.
            </Section>
          </div>
        </div>
      </article>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-3xl font-semibold text-forest">{title}</h2>
      <p className="mt-3 leading-8 text-forest/70">{children}</p>
    </section>
  );
}
