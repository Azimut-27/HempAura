import Seo from "../components/Seo.jsx";

const policies = {
  privacy: {
    title: "Politika zasebnosti",
    description: "Predloga politike zasebnosti HempAura z označenimi pravnimi podatki.",
    sections: [
      ["Upravljavec podatkov", "[LEGAL_ENTITY_NAME], [BUSINESS_ADDRESS], [SUPPORT_EMAIL]."],
      [
        "Katere podatke obdelujemo",
        "Kontaktne podatke, vsebino sporočil, podatke o naročilu ter tehnične podatke, ki so nujni za varnost in delovanje storitve.",
      ],
      [
        "Nameni in pravne podlage",
        "Odgovor na povpraševanje, izvedba pogodbe, izpolnitev pravnih obveznosti in trženje samo na podlagi ločene izrecne privolitve.",
      ],
      [
        "Hramba in prejemniki",
        "Roke hrambe, obdelovalce, prenose ter pravice posameznika mora pred objavo potrditi pravni strokovnjak za Slovenijo in EU.",
      ],
      ["Kontakt za pravice", "[SUPPORT_EMAIL]"],
    ],
  },
  terms: {
    title: "Pogoji poslovanja",
    description: "Predloga pogojev poslovanja HempAura za strokovni pravni pregled.",
    sections: [
      ["Ponudnik", "[LEGAL_ENTITY_NAME], [BUSINESS_ADDRESS], [REGISTRATION_NUMBER], [TAX_NUMBER]."],
      [
        "Izdelki in cene",
        "Končne lastnosti, cene, davčna obravnava in razpoložljivost morajo biti potrjeni pred omogočitvijo prodaje.",
      ],
      [
        "Naročilo in plačilo",
        "Pogodbeni trenutek, načini plačila, potrditve in obravnava napak zahtevajo pravni in računovodski pregled.",
      ],
      [
        "Odstop, vračila in reklamacije",
        "Uporabiti je treba potrjeno obdobje [RETURN_PERIOD], izjeme za zapečatene izdelke in postopek na naslovu [RETURN_ADDRESS].",
      ],
      [
        "Pritožbe in reševanje sporov",
        "Dodati je treba potrjen postopek, pristojnost ter informacije o izvensodnem reševanju sporov.",
      ],
    ],
  },
  shipping: {
    title: "Dostava in vračila",
    description: "Informacije o dostavi, odstopu in vračilih HempAura.",
    sections: [
      [
        "Dostava v Sloveniji",
        "Cena dostave, prag brezplačne dostave, partner [DELIVERY_PARTNER] in rok dostave [ROK_DOSTAVE] še čakajo na potrditev lastnika.",
      ],
      [
        "Dostava v EU",
        "Dostava izven Slovenije je privzeto onemogočena, dokler niso potrjene države, upravičenost izdelkov, davki in logistika.",
      ],
      [
        "Odstop od pogodbe",
        "Obdobje [RETURN_PERIOD], obrazec, morebitne izjeme in stroški vračila zahtevajo pravni pregled.",
      ],
      [
        "Naslov za vračila",
        "[RETURN_ADDRESS]. Izdelkov ne pošiljaj, dokler ne prejmeš potrjenih navodil podpore.",
      ],
    ],
  },
  cookies: {
    title: "Informacije o piškotkih",
    description: "Nujni piškotki in pripravljena arhitektura privolitve HempAura.",
    sections: [
      [
        "Nujno delovanje",
        "Lokalna shramba košarice je potrebna, da se vsebina košarice ohrani med obiski. Plačilni ponudnik lahko ob začetku plačila uporabi svoje nujne tehnologije.",
      ],
      [
        "Analitika",
        "Analitika ni privzeto vključena. Če bo dodana, se ne sme zagnati brez ustrezne privolitve, kadar je ta zahtevana.",
      ],
      [
        "Trženje",
        "Trženjske tehnologije niso vključene. Prijava na e-novice je ločena, izrecna in uporablja dvojno potrditev.",
      ],
    ],
  },
};

export default function PolicyPage({ type }) {
  const policy = policies[type] || policies.privacy;

  return (
    <>
      <Seo
        title={policy.title}
        description={policy.description}
        path={
          type === "shipping"
            ? "/shipping-and-returns"
            : type === "terms"
              ? "/terms"
              : type === "cookies"
                ? "/cookies"
                : "/privacy"
        }
      />
      <article className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-clay">Predloga za pregled</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            {policy.title}
          </h1>
          <div className="mt-6 border-l-2 border-clay bg-clay/10 p-5 text-sm leading-7 text-forest">
            Ta stran vsebuje označena polja in ni pripravljena za pravno objavo brez
            pregleda slovenskega oziroma EU pravnega strokovnjaka.
          </div>
          <div className="mt-10 space-y-9">
            {policy.sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="font-display text-3xl font-semibold text-forest">{title}</h2>
                <p className="mt-3 leading-8 text-forest/70">{text}</p>
              </section>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
