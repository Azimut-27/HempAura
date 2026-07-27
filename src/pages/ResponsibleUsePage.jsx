import Seo from "../components/Seo.jsx";
import {
  legalIdentityComplete,
  missingLegalDetails,
  siteConfig,
} from "../config/siteConfig.js";

export default function ResponsibleUsePage() {
  return (
    <>
      <Seo
        title="Odgovorna uporaba CBD in konopljinih izdelkov"
        description="Razvrstitev izdelkov, omejitve uporabe, opozorila in odgovorna predstavitev CBD ter konopljinih izdelkov HempAura."
        path="/responsible-use"
      />
      <article className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-clay">Pomembne informacije</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            Odgovorna uporaba
          </h1>
          <p className="mt-4 text-sm text-forest/60">
            Zadnja posodobitev: {siteConfig.legalLastUpdated}
          </p>

          <div
            className="mt-8 border-l-2 border-clay bg-clay/10 p-5 text-sm leading-7 text-forest"
            role="alert"
          >
            <p className="font-bold">
              Spletna predstavitev ne dokazuje, da je izdelek dovoljeno prodajati ali
              uporabljati na določen način.
            </p>
            <p className="mt-2">
              Pred prodajo mora strokovnjak preveriti razvrstitev vsakega izdelka,
              sestavo, vir kanabinoidov, označevanje, dokumentacijo, dovoljene trditve,
              ciljno skupino in pravico do dajanja na slovenski trg.
              {!legalIdentityComplete &&
                ` Pred objavo manjkajo tudi podatki trgovca: ${missingLegalDetails.join(", ")}.`}
            </p>
          </div>

          <div className="mt-10 space-y-10">
            <Section title="1. Najprej preveri razvrstitev">
              <p>
                Enaka beseda »CBD« se lahko pojavi pri kozmetiki, živilu, tehničnem
                izdelku ali izdelku z drugo pravno razvrstitvijo. Pravila se razlikujejo.
                Vedno upoštevaj namen uporabe in opozorila na dejanski embalaži.
              </p>
            </Section>

            <Section title="2. CBD kapljice in izdelki za zaužitje">
              <p>
                Izdelka ne zaužij samo zato, ker je opremljen s kapalko ali ker druga
                spletna stran opisuje oralno uporabo. Pred prodajo oziroma navodilom za
                zaužitje je treba potrditi zakonito živilsko razvrstitev in morebitno
                dovoljenje po pravilih EU o novih živilih. Če taka potrditev ni
                dokumentirana, mora biti prodaja za zaužitje onemogočena.
              </p>
              <p>
                Kadar je izdelek zakonito namenjen zaužitju, sledi odmerjanju in
                opozorilom proizvajalca. Ne prekorači navedenega odmerka. Ob zdravilih,
                bolezni, nosečnosti ali dojenju se pred uporabo posvetuj z zdravnikom
                ali farmacevtom.
              </p>
            </Section>

            <Section title="3. Kozmetični izdelki">
              <p>
                Kozmetiko uporabljaj samo zunanje in na način, naveden na embalaži.
                Izogibaj se očem, sluznicam in poškodovani koži, če deklaracija ne
                določa drugače. Ob draženju prenehaj z uporabo. Kozmetičnemu izdelku se
                ne sme pripisovati zdravljenja ali preprečevanja bolezni.
              </p>
            </Section>

            <Section title="4. Cvetovi in tehnični izdelki">
              <p>
                Izdelek, označen za tehnično, industrijsko ali hortikulturno uporabo,
                ni namenjen uživanju, kajenju ali uparjanju. Hraniti ga je treba izven
                dosega otrok. Prodaja izdelka z omejitvijo 18+ zahteva preverjanje
                starosti in dosledno komunikacijo na izdelku, v košarici ter ob dostavi.
              </p>
            </Section>

            <Section title="5. Brez zdravstvenih obljub">
              <p>
                HempAura ne diagnosticira, zdravi, preprečuje ali ozdravi bolezni.
                Opisi izdelkov, mnenja uporabnikov in laboratorijski podatki niso
                zdravstveni nasvet. Ne nadomeščajo pregleda pri zdravniku ali nasveta
                farmacevta.
              </p>
            </Section>

            <Section title="6. Zdravila, nosečnost in vožnja">
              <p>
                Kanabinoidi lahko vplivajo na zdravila ali niso primerni za posamezne
                skupine. Če jemlješ zdravila, imaš zdravstveno stanje, si noseča ali
                dojiš, se pred uporabo posvetuj z zdravstvenim strokovnjakom. Ne vozi
                in ne upravljaj strojev, če izdelek povzroča zaspanost, omotico ali
                kakršnokoli zmanjšanje sposobnosti. Prisotnost THC lahko vpliva tudi na
                testiranje, četudi izdelek ni namenjen povzročanju omame.
              </p>
            </Section>

            <Section title="7. Otroci, shranjevanje in embalaža">
              <p>
                Izdelke hrani v originalni embalaži, izven dosega otrok in živali ter
                skladno s temperaturo, svetlobo in rokom uporabe na deklaraciji. Izdelka
                ne uporabljaj, če je zaščita poškodovana, serija ni razvidna ali se
                videz oziroma vonj razlikuje od pričakovanega.
              </p>
            </Section>

            <Section title="8. Neželeni učinek ali incident">
              <p>
                Ob resnem ali nepričakovanem učinku prenehaj z uporabo in po potrebi
                poišči zdravstveno pomoč. Izdelek, serijo, fotografije in opis dogodka
                sporoči podpori na{" "}
                {siteConfig.supportEmail || (
                  <strong className="text-clay">
                    e-poštni naslov podpore, ki ga mora lastnik še vnesti
                  </strong>
                )}
                . Ponudnik mora imeti postopek za sledljivost, pritožbe, varnostne
                dogodke in morebiten odpoklic.
              </p>
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
      <div className="mt-3 space-y-4 leading-8 text-forest/70">{children}</div>
    </section>
  );
}
