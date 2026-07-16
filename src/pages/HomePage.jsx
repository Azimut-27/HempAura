import { ArrowRight, FileSearch, Leaf, PackageCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ContactCta from "../components/ContactCta.jsx";
import FaqList from "../components/FaqList.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { faqs } from "../data/faqs.js";
import { products } from "../data/products.js";

const lifestyleImage = "/hemp-lifestyle.png";

const trustItems = [
  [PackageCheck, "Jasni podatki o izdelku"],
  [FileSearch, "Poročila po izdelku in seriji"],
  [ShieldCheck, "Odgovorna predstavitev"],
  [Leaf, "Premišljena premium izkušnja"],
];

export default function HomePage() {
  return (
    <>
      <Seo
        title="Premium konopljini izdelki"
        description="HempAura predstavlja premium konopljine izdelke z jasno dokumentacijo, odgovorno komunikacijo in prodajo šele po potrditvi vseh podatkov."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "HempAura",
          url: window.location.origin,
        }}
      />
      <section className="hero-wash border-b border-forest/10">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase text-clay">
              Premium konopljini izdelki
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-forest sm:text-6xl lg:text-7xl">
              Premišljena kakovost za tvoj vsakdanji ritual.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-forest/72">
              HempAura združuje skrbno predstavitev, transparentne informacije in
              premium izkušnjo od izbire izdelka do dostave.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-forest px-6 text-sm font-bold text-porcelain"
              >
                Razišči kolekcijo
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                to="/quality"
                className="inline-flex min-h-12 items-center justify-center border border-forest/25 px-6 text-sm font-bold text-forest hover:bg-sage"
              >
                Naš standard kakovosti
              </Link>
            </div>
          </div>
          <div className="hero-media-frame relative aspect-[4/3] overflow-hidden bg-cream">
            <img
              src={lifestyleImage}
              alt="Jantarna steklenička ob konopljini rastlini in naravnih materialih"
              width="1536"
              height="1024"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 max-w-sm bg-forest p-5 text-porcelain">
              <p className="text-sm font-semibold">
                Končne informacije o izdelkih bodo objavljene po preverjanju
                deklaracij, cen, zaloge in dokumentacije.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-forest/10 bg-forest text-porcelain" aria-label="Načela HempAura">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustItems.map(([Icon, label]) => (
            <div key={label} className="flex min-h-24 items-center gap-3 border-white/10 px-2 py-5 lg:border-r lg:px-5">
              <Icon className="shrink-0 text-gold" size={20} aria-hidden="true" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase text-clay">Kolekcija</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-5xl">
                Izdelki v pripravi
              </h2>
              <p className="mt-4 leading-7 text-forest/68">
                Kartice so pripravljene za resnične fotografije in potrjene
                komercialne podatke. Prodaja ni omogočena, dokler ti podatki manjkajo.
              </p>
            </div>
            <Link className="text-sm font-bold text-forest underline" to="/products">
              Vsi izdelki
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.filter((product) => product.featured).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-porcelain py-18 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-clay">Zakaj HempAura</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-5xl">
              Manj hrupa. Več uporabnih informacij.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-forest/72">
            <p>
              Znamka je zasnovana okoli jasne predstavitve sestave, uporabe,
              opozoril, serij in dokumentacije. Podatki se ne zapolnijo z ugibanjem.
            </p>
            <p>
              Trgovina se varno odpre šele po potrditvi ponudnika plačil, davčne
              obravnave, dostave in zakonsko ustreznih informacij o izdelkih.
            </p>
            <Link className="inline-flex items-center gap-2 font-bold text-forest" to="/quality">
              Preberi pristop h kakovosti <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-forest py-18 text-porcelain sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={lifestyleImage}
              alt="Konopljina rastlina in jantarna steklenička v umirjenem domačem okolju"
              width="1536"
              height="1024"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase text-gold">Vsakdanji ritual</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Umirjena izkušnja brez medicinskih obljub
            </h2>
            <p className="mt-5 text-lg leading-8 text-porcelain/74">
              Vsebina se osredotoča na izdelek, njegovo deklaracijo in odgovorno
              uporabo. Ne pripisuje zdravljenja, lajšanja bolezni ali zagotovljenih
              učinkov.
            </p>
            <Link className="mt-7 inline-flex font-bold text-gold underline" to="/responsible-use">
              Odgovorna uporaba
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-18 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-clay">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest">
              Jasni odgovori
            </h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="bg-forest py-18 text-porcelain sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-gold">HempAura novice</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">
              Potrjena prijava, brez tihega dodajanja
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-porcelain/72">
              Po prijavi prejmeš potrditveno povezavo. Šele po potrditvi je naslov
              aktiven na seznamu.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
      <ContactCta />
    </>
  );
}
