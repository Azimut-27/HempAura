import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import {
  legalIdentityComplete,
  missingLegalDetails,
  siteConfig,
} from "../config/siteConfig.js";
import { formatPrice } from "../lib/formatters.js";

const pathByType = {
  privacy: "/privacy",
  terms: "/terms",
  shipping: "/shipping-and-returns",
  cookies: "/cookies",
};

const titleByType = {
  privacy: "Politika zasebnosti",
  terms: "Splošni pogoji poslovanja",
  shipping: "Dostava, odstop in vračila",
  cookies: "Informacije o piškotkih",
};

const descriptionByType = {
  privacy:
    "Informacije o obdelavi osebnih podatkov kupcev, obiskovalcev in naročnikov HempAura.",
  terms:
    "Splošni pogoji poslovanja spletne trgovine HempAura za potrošnike v Sloveniji.",
  shipping:
    "Pogoji dostave, pravica do odstopa, vračila, reklamacije in obrazec za odstop.",
  cookies:
    "Informacije o nujnih tehnologijah, lokalni shrambi in morebitnih piškotkih HempAura.",
};

export default function PolicyPage({ type }) {
  const resolvedType = titleByType[type] ? type : "privacy";

  return (
    <>
      <Seo
        title={titleByType[resolvedType]}
        description={descriptionByType[resolvedType]}
        path={pathByType[resolvedType]}
      />
      <article className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-clay">
            Pravno in potrošniško obvestilo
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            {titleByType[resolvedType]}
          </h1>
          <p className="mt-4 text-sm text-forest/60">
            Zadnja posodobitev: {siteConfig.legalLastUpdated}
          </p>

          <LegalReviewNotice />

          <div className="mt-10 space-y-10">
            {resolvedType === "privacy" && <PrivacyPolicy />}
            {resolvedType === "terms" && <TermsPolicy />}
            {resolvedType === "shipping" && <ShippingPolicy />}
            {resolvedType === "cookies" && <CookiesPolicy />}
          </div>
        </div>
      </article>
    </>
  );
}

function LegalReviewNotice() {
  if (legalIdentityComplete) {
    return (
      <div className="mt-8 border-l-2 border-gold bg-gold/10 p-5 text-sm leading-7 text-forest">
        Ta vsebina je pripravljena kot operativni osnutek in mora pred začetkom prodaje
        skozi slovenski/EU pravni pregled, posebej glede razvrstitve CBD in konopljinih
        izdelkov, označevanja, dovoljenih trditev, davkov ter omejitev prodaje.
      </div>
    );
  }

  return (
    <div
      className="mt-8 border-l-2 border-clay bg-clay/10 p-5 text-sm leading-7 text-forest"
      role="alert"
    >
      <p className="font-bold">Stran še ni primerna za objavo ali omogočanje plačil.</p>
      <p className="mt-2">
        Manjkajo preverjeni podatki dejanskega trgovca: {missingLegalDetails.join(", ")}.
        Identitete, naslova ali davčnih številk družbe Hemptouch nismo prekopirali,
        ker Hemptouch ni samodejno ponudnik trgovine HempAura.
      </p>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <>
      <Section title="1. Upravljavec osebnih podatkov">
        <BusinessIdentity />
        <p>
          Upravljavec je dejanski ponudnik spletne trgovine HempAura. Vprašanja in
          zahteve glede zasebnosti pošljite na {supportEmailText()}.
        </p>
      </Section>

      <Section title="2. Katere podatke obdelujemo">
        <List
          items={[
            "naročilo in pogodba: ime, priimek, kontaktni podatki, naslov za dostavo, naročeni izdelki, zneski, status plačila in številka naročila;",
            "podpora: ime, e-pošta, zadeva, vsebina sporočila in po želji številka naročila;",
            "e-novice: e-poštni naslov, dokaz privolitve, čas potrditve in status odjave;",
            "tehnični in varnostni podatki: IP-naslov, čas zahtevka, pot, osnovni dnevniški podatki ter podatki za preprečevanje zlorab;",
            "podatki o plačilu, ki jih posreduje plačilni ponudnik, na primer identifikator transakcije in stanje plačila. HempAura ne prejme ali hrani celotne številke kartice.",
            "partnerski program: uporabljena partnerska koda, povezano naročilo, popust, izračunana provizija ter status odobritve in izplačila.",
          ]}
        />
      </Section>

      <Section title="3. Nameni in pravne podlage">
        <List
          items={[
            "izvedba naročila, dostave, plačila in podpora pred ali po sklenitvi pogodbe: izvajanje pogodbe oziroma ukrepi na zahtevo posameznika;",
            "izdaja in hramba računov, davčne evidence, odpoklic izdelkov in druge zakonske obveznosti: izpolnitev pravne obveznosti;",
            "varnost spletne strani, preprečevanje goljufij, dokazovanje zahtevkov in izboljšanje zanesljivosti: zakoniti interesi upravljavca, če ne prevladajo pravice posameznika;",
            "uporaba zahtevanega partnerskega popusta ter obračun provizije partnerju: izvajanje naročila, partnerske pogodbe in zakoniti interes za pravilno evidenco prodaje;",
            "e-novice in nenujne trženjske tehnologije: predhodna, ločena privolitev, ki jo je mogoče kadarkoli preklicati.",
          ]}
        />
      </Section>

      <Section title="4. Prejemniki in obdelovalci">
        <p>
          Podatke lahko v obsegu, potrebnem za storitev, prejmejo ponudnik gostovanja
          Vercel, podatkovna storitev Supabase, ponudnik e-pošte Resend, plačilni
          ponudnik Stripe, pogodbeni dostavljavec, računovodstvo ter pristojni organi,
          kadar to zahteva zakon. Pogodbeni ponudniki smejo podatke obdelovati samo po
          navodilih upravljavca in ob ustreznih zaščitnih ukrepih.
        </p>
        <p>
          Nekateri ponudniki imajo lahko infrastrukturo zunaj Evropskega gospodarskega
          prostora. Pred produkcijo je treba preveriti izbrane regije, vloge
          upravljavcev, pogodbe o obdelavi in veljaven mehanizem prenosa, na primer
          sklep o ustreznosti ali standardne pogodbene klavzule.
        </p>
      </Section>

      <Section title="5. Roki hrambe">
        <List
          items={[
            "računi in davčna dokumentacija: 10 let po poteku leta, na katero se nanašajo;",
            "podatki o naročilu in pogodbi: toliko časa, kolikor je potrebno za izvedbo pogodbe, zakonske obveznosti ter uveljavljanje ali obrambo pravnih zahtevkov;",
            "evidence partnerskih provizij in izplačil: skladno z roki za povezano pogodbeno, računovodsko in davčno dokumentacijo;",
            "sporočila podpori: praviloma do 24 mesecev po zaključku zadeve, dlje le ob odprtem zahtevku ali zakonski obveznosti;",
            "e-novice: do odjave ali preklica privolitve; nato se hrani le minimalen dokaz odjave, kadar je potreben za spoštovanje izbire;",
            "varnostni dnevniki: praviloma največ 12 mesecev, razen če je daljša hramba potrebna zaradi preiskave incidenta.",
          ]}
        />
      </Section>

      <Section title="6. Vaše pravice">
        <p>
          Glede na pogoje GDPR lahko zahtevate dostop, popravek, izbris, omejitev
          obdelave in prenosljivost podatkov ter ugovarjate obdelavi na podlagi
          zakonitega interesa. Privolitev lahko kadarkoli prekličete brez vpliva na
          zakonitost obdelave pred preklicem. Pred odgovorom lahko upravljavec razumno
          preveri identiteto vlagatelja.
        </p>
        <p>
          Pritožbo lahko vložite pri Informacijskem pooblaščencu Republike Slovenije,
          Dunajska cesta 22, 1000 Ljubljana,{" "}
          <a className="underline" href="mailto:gp.ip@ip-rs.si">
            gp.ip@ip-rs.si
          </a>
          . Če je zahteva povezana z računom ali drugo zakonsko evidenco, pravica do
          izbrisa ne pomeni, da se mora dokument izbrisati pred iztekom obveznega roka.
        </p>
      </Section>

      <Section title="7. Avtomatizirano odločanje in obveznost podatkov">
        <p>
          HempAura ne uporablja avtomatiziranega odločanja, ki bi imelo pravne ali
          podobno pomembne učinke. Podatki, označeni kot obvezni pri naročilu, so
          potrebni za sklenitev in izvedbo pogodbe; brez njih naročila ni mogoče
          izvesti. Prijava na e-novice ni pogoj za nakup.
        </p>
      </Section>

      <Section title="8. Spremembe politike">
        <p>
          Veljavna različica je vedno objavljena na tej strani z datumom posodobitve.
          Ob bistveni spremembi namena obdelave ali pravic bodo prizadeti posamezniki
          obveščeni na primeren način pred začetkom nove obdelave, kadar je to potrebno.
        </p>
      </Section>
    </>
  );
}

function TermsPolicy() {
  return (
    <>
      <Section title="1. Ponudnik in področje uporabe">
        <BusinessIdentity />
        <p>
          Ti pogoji urejajo prodajo potrošnikom prek spletne trgovine HempAura v
          Sloveniji. Pred oddajo naročila so kupcu na voljo bistvene lastnosti
          izdelka, cena z davkom, stroški dostave, način plačila in informacije o
          odstopu. Za posamezno naročilo velja različica pogojev, ki je bila kupcu
          dostopna ob oddaji naročila.
        </p>
      </Section>

      <Section title="2. Izdelki iz konoplje in CBD">
        <p>
          Izdelki se prodajajo samo v razvrstitvi in za namen, ki sta navedena na
          potrjeni deklaraciji. Kozmetični izdelek je namenjen zunanji uporabi.
          Tehnični ali hortikulturni izdelek ni namenjen uživanju ali kajenju.
          Izdelek se ne predstavlja kot zdravilo in mu ni dovoljeno pripisovati
          preprečevanja, zdravljenja ali ozdravitve bolezni.
        </p>
        <p>
          Ponudnik mora pred aktivacijo posameznega izdelka preveriti njegovo
          zakonitost, varnostno dokumentacijo, sestavo, označevanje, dovoljene trditve,
          starostne omejitve in pravico do dajanja na slovenski trg. Navedba vsebnosti
          CBD, CBG ali THC sama po sebi ne dokazuje skladnosti ali dovoljenja za prodajo.
        </p>
      </Section>

      <Section title="3. Cene, davki in stroški">
        <p>
          Cene so v evrih in vključujejo DDV, kadar je ponudnik identificiran za DDV
          in je tako navedeno ob izdelku. Strošek dostave je prikazan pred oddajo
          naročila. Ponudnik lahko cene spremeni za prihodnja naročila; za že sklenjeno
          pogodbo velja cena iz potrditve naročila. Očitne napake se obravnavajo
          pošteno in v skladu s prisilnimi pravili varstva potrošnikov.
        </p>
      </Section>

      <Section title="4. Oddaja naročila in sklenitev pogodbe">
        <List
          items={[
            "kupec izbere izdelek in količino, pregleda košarico ter obvezne informacije;",
            "pred plačilom vnese zahtevane podatke in potrdi seznanitev s pogoji;",
            "naročilo je oddano s potrditvijo gumba, ki jasno označuje obveznost plačila;",
            "pogodba je sklenjena, ko ponudnik po uspešnem plačilu pošlje potrditev sprejema naročila na trajnem nosilcu;",
            "če izdelka ni mogoče dobaviti ali je prišlo do očitne tehnične napake, ponudnik kupca nemudoma obvesti in vrne prejeto plačilo.",
          ]}
        />
        <p>
          Kupec mora pred oddajo popraviti morebitne napake v košarici in podatkih.
          Potrditev naročila in ti pogoji se pošljejo oziroma omogočijo v obliki, ki jo
          je mogoče shraniti.
        </p>
      </Section>

      <Section title="5. Plačilo">
        <p>
          Plačilo se izvede prek ponudnika Stripe z načini, prikazanimi v varnem
          plačilnem postopku. Ponudnik ne prejme celotne številke kartice. Plačila za
          izdelke iz konoplje/CBD se ne smejo omogočiti brez pisne potrditve plačilnega
          ponudnika za dejanski katalog, poslovni model in prodajne države.
        </p>
      </Section>

      <Section title="6. Dostava">
        <p>
          Dostava je trenutno omejena na naslove v Sloveniji. Dostavni partner je{" "}
          {valueOrPending(siteConfig.deliveryPartner, "še ni potrjen")}. Predvideni
          čas dostave je {siteConfig.shipping.deliveryEstimate}. Podrobni stroški in
          pogoji so objavljeni na strani{" "}
          <Link className="underline" to="/shipping-and-returns">
            Dostava, odstop in vračila
          </Link>
          .
        </p>
      </Section>

      <Section title="7. Odstop od pogodbe">
        <p>
          Potrošnik lahko praviloma v 14 dneh od prevzema blaga odstopi od pogodbe
          brez navedbe razloga. Obvestilo mora poslati pred iztekom roka, nato pa blago
          vrniti najpozneje v 14 dneh. Neposredni strošek vračila praviloma nosi
          potrošnik. Podrobnosti, izjeme, vzorčni obrazec in naslov so na strani o
          vračilih.
        </p>
      </Section>

      <Section title="8. Skladnost blaga in reklamacije">
        <p>
          Zakonska pravica iz naslova neskladnosti blaga je ločena od prostovoljnega
          odstopa. Če izdelek ni skladen s pogodbo, se obrnite na{" "}
          {supportEmailText()} in priložite številko naročila, opis težave ter po
          možnosti fotografije. Potrošniku pripadajo zakonski jamčevalni zahtevki po
          ZVPot-1; ti pogoji jih ne omejujejo.
        </p>
      </Section>

      <Section title="9. Pritožbe in izvensodno reševanje sporov">
        <p>
          Pritožbo pošljite na {supportEmailText()}. Ponudnik bo odgovoril v{" "}
          {siteConfig.responseTime}. Izjava o priznanem izvajalcu izvensodnega
          reševanja potrošniških sporov:{" "}
          {valueOrPending(
            siteConfig.irpsProvider,
            "ponudnik mora pred objavo izbrati in objaviti ustrezno izjavo po ZIsRPS"
          )}
          .
        </p>
        <p>
          Nekdanja evropska platforma ODR ni navedena, ker je bila ukinjena 20. julija
          2025. Za razmerje se uporablja pravo Republike Slovenije, vendar to ne
          odvzema prisilnega varstva, ki potrošniku pripada po veljavnem pravu.
        </p>
      </Section>

      <Section title="10. Končne določbe">
        <p>
          Če je posamezna določba neveljavna, ostale ostanejo v veljavi. Spremembe
          pogojev učinkujejo za prihodnja naročila od objavljenega datuma. Ponudnik
          ne more s pogoji izključiti odgovornosti ali pravic, ki jih prisilni predpisi
          dajejo potrošniku.
        </p>
      </Section>
    </>
  );
}

function ShippingPolicy() {
  const standardShipping =
    siteConfig.shipping.standardCents === null
      ? "mora biti določena in prikazana pred oddajo naročila"
      : formatPrice(siteConfig.shipping.standardCents);
  const freeThreshold =
    siteConfig.shipping.freeThresholdCents === null
      ? "prag brezplačne dostave še ni potrjen"
      : `brezplačno od ${formatPrice(siteConfig.shipping.freeThresholdCents)}`;

  return (
    <>
      <Section title="1. Dostava v Sloveniji">
        <List
          items={[
            `dostavni partner: ${siteConfig.deliveryPartner || "še ni potrjen"};`,
            `standardna dostava: ${standardShipping};`,
            `brezplačna dostava: ${freeThreshold};`,
            `predvideni čas dostave: ${siteConfig.shipping.deliveryEstimate};`,
            "končni strošek, način in naslov dostave so prikazani pred obveznostjo plačila.",
          ]}
        />
        <p>
          Plačil ni dovoljeno omogočiti, dokler strošek dostave in pogodbeni partner
          nista vnesena ter usklajena s strežniško konfiguracijo. Dostava izven
          Slovenije je izključena, dokler niso preverjeni lokalna zakonitost izdelkov,
          davki, označevanje in logistika.
        </p>
      </Section>

      <Section title="2. Prevzem in poškodovana pošiljka">
        <p>
          Ob prevzemu preverite zunanje stanje paketa. Vidno poškodbo ali manjkajočo
          vsebino čim prej dokumentirajte s fotografijami in sporočite dostavljavcu
          ter podpori. To ne omejuje zakonskih pravic zaradi neskladnosti blaga.
        </p>
      </Section>

      <Section title="3. Kako odstopiti od pogodbe">
        <p>
          Potrošnik lahko brez navedbe razloga v 14 dneh od dneva, ko je sam ali tretja
          oseba, ki ni prevoznik, fizično prejela blago, pošlje nedvoumno izjavo o
          odstopu. Pri več izdelkih iz enega naročila, dobavljenih ločeno, rok začne
          teči s prejemom zadnjega izdelka.
        </p>
        <p>
          Izjavo pošljite na {supportEmailText()} ali na poslovni naslov ponudnika.
          Zadostuje, da jo pošljete pred iztekom roka. Po obvestilu morate blago
          odposlati najpozneje v 14 dneh na naslov:{" "}
          {valueOrPending(siteConfig.returnAddress, "naslov za vračila še ni vnesen")}.
          Pred pošiljanjem priporočamo, da pridobite številko vračila in izdelek varno
          zapakirate. Priporočilo ne omejuje zakonske pravice do odstopa.
        </p>
      </Section>

      <Section title="4. Stroški in vračilo plačila">
        <p>
          Neposredni strošek vračila nosi potrošnik, razen če ponudnik pisno prevzame
          strošek ali potrošnika o njem pred nakupom ni pravilno obvestil. Ponudnik
          najpozneje v 14 dneh po prejemu izjave vrne prejeta plačila, vključno s
          stroškom najcenejše ponujene standardne dostave. Dodatnega stroška dražje
          izbrane dostave ni dolžan vrniti.
        </p>
        <p>
          Vračilo se izvede z enakim plačilnim sredstvom, razen če se potrošnik izrecno
          strinja drugače brez dodatnih stroškov. Pri prodaji blaga sme ponudnik vračilo
          zadržati do prejema blaga ali dokazila, da je bilo poslano nazaj, kar nastopi
          prej.
        </p>
      </Section>

      <Section title="5. Stanje vrnjenega blaga in izjeme">
        <p>
          Potrošnik odgovarja le za zmanjšano vrednost, ki je posledica ravnanja,
          nepotrebnega za ugotovitev narave, lastnosti in delovanja blaga. Odstop je
          lahko po zakonu izključen pri zapečatenem blagu, ki zaradi varovanja zdravja
          ali higiene ni primerno za vračilo, če je bil pečat po dostavi odprt, ter v
          drugih primerih, ki jih določa zakon. Izjema se uporabi samo, če so izpolnjeni
          vsi zakonski pogoji in je bil kupec o njej vnaprej jasno obveščen.
        </p>
        <p>
          Sama odprta transportna škatla ne pomeni nujno izgube pravice do odstopa.
          Zakonska pravica zaradi neskladnosti blaga velja neodvisno od izjem pri
          prostovoljnem odstopu.
        </p>
      </Section>

      <Section title="6. Vzorčni obrazec za odstop">
        <div className="border border-forest/15 bg-white p-5 text-sm leading-7 text-forest/75">
          <p>
            Prejemnik: {valueOrPending(siteConfig.legalBusinessName, "naziv ponudnika")},{" "}
            {valueOrPending(siteConfig.returnAddress, "naslov za vračila")},{" "}
            {supportEmailText(false)}
          </p>
          <p className="mt-3">
            Obveščam vas, da odstopam od pogodbe za naslednje blago: __________
          </p>
          <p>Naročeno dne / prejeto dne: __________</p>
          <p>Številka naročila: __________</p>
          <p>Ime in naslov potrošnika: __________</p>
          <p>Datum: __________</p>
          <p>Podpis (samo pri papirnem obrazcu): __________</p>
        </div>
      </Section>

      <Section title="7. Neskladnost, napačen izdelek ali poškodba">
        <p>
          Če je blago napačno, poškodovano ali neskladno z naročilom, ne uporabljajte
          postopka prostovoljnega odstopa kot nadomestilo za reklamacijo. Pišite na{" "}
          {supportEmailText()} z opisom in številko naročila. Ponudnik krije stroške,
          ki jih mora po zakonu kriti pri vzpostavitvi skladnosti.
        </p>
      </Section>
    </>
  );
}

function CookiesPolicy() {
  return (
    <>
      <Section title="1. Kaj uporablja spletna stran">
        <p>
          Košarica se hrani v lokalni shrambi brskalnika, da ostane na voljo med
          obiski. Lokalna shramba ni klasičen piškotek, vendar je podobna tehnologija.
          Če uporabnik odpre partnersko povezavo, se partnerska koda začasno shrani
          v sejni shrambi trenutnega zavihka, da se ob plačilu uporabi pripadajoči
          popust in zabeleži partner. Koda se ne uporablja za vedenjsko profiliranje.
          Spletna stran lahko uporablja tudi nujne varnostne in sejne tehnologije
          gostovanja ter API-storitev.
        </p>
      </Section>

      <Section title="2. Plačilo in zunanji ponudniki">
        <p>
          Ob prehodu na Stripe Checkout lahko Stripe uporabi nujne piškotke za varnost,
          preprečevanje goljufij in izvedbo plačila. Ti se aktivirajo šele, ko uporabnik
          začne plačilni postopek. Podrobnosti ureja tudi politika zasebnosti Stripe.
        </p>
      </Section>

      <Section title="3. Analitika in trženje">
        <p>
          HempAura trenutno nima vključene analitike, oglaševalskih pikslov ali
          trženjskih piškotkov. Če bodo dodani, se nenujne tehnologije ne smejo naložiti
          pred veljavno privolitvijo, kadar jo zakon zahteva. Zavrnitev nenujnih
          tehnologij ne sme preprečiti osnovnega nakupa.
        </p>
      </Section>

      <Section title="4. Upravljanje podatkov v brskalniku">
        <p>
          Vsebino lokalne shrambe lahko izbrišete v nastavitvah brskalnika. S tem se
          lahko izprazni košarica. Partnerska koda se izbriše ob zaprtju zavihka ali
          z izbrisom sejne shrambe. Nujnih tehnologij, ki so potrebne za varnost ali
          zahtevano storitev, ni mogoče izključiti prek soglasja za trženje.
        </p>
      </Section>
    </>
  );
}

function BusinessIdentity() {
  const rows = [
    ["Blagovna znamka", siteConfig.brandName],
    ["Registrirani ponudnik", siteConfig.legalBusinessName],
    ["Sedež in poslovni naslov", siteConfig.businessAddress],
    ["Matična številka", siteConfig.registrationNumber],
    ["Davčna številka", siteConfig.taxNumber],
    ["ID za DDV", siteConfig.vatId || "ni potrjeno, ali je ponudnik zavezanec za DDV"],
    ["E-pošta", siteConfig.supportEmail],
    ["Telefon", siteConfig.supportPhone || "ni vnesen"],
  ];

  return (
    <dl className="grid gap-px overflow-hidden border border-forest/15 bg-forest/15 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="bg-white p-4" key={label}>
          <dt className="text-xs font-bold uppercase tracking-wide text-forest/55">
            {label}
          </dt>
          <dd className={`mt-1 text-sm ${value ? "text-forest" : "font-bold text-clay"}`}>
            {value || "PODATEK MORA VNESTI LASTNIK"}
          </dd>
        </div>
      ))}
    </dl>
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

function List({ items }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function supportEmailText(link = true) {
  if (!siteConfig.supportEmail) {
    return <strong className="text-clay">preverjen e-poštni naslov še ni vnesen</strong>;
  }

  return link ? (
    <a className="underline" href={`mailto:${siteConfig.supportEmail}`}>
      {siteConfig.supportEmail}
    </a>
  ) : (
    siteConfig.supportEmail
  );
}

function valueOrPending(value, fallback) {
  return value || <strong className="text-clay">{fallback}</strong>;
}
