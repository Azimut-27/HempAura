import { ArrowRight, Crown, FileSearch, Leaf, PackageCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ContactCta from "../components/ContactCta.jsx";
import FaqList from "../components/FaqList.jsx";
import FarmGallery from "../components/FarmGallery.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import PartnerApplicationModal from "../components/PartnerApplicationModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";
import Seo from "../components/Seo.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { faqs } from "../data/faqs.js";
import { products } from "../data/products.js";

const lifestyleImage = "/hemp-lifestyle.png";
const qualityShowcaseImage = "/farm/farm-loupe-check.jpg";

const homeFarmPhotos = [
  {
    src: "/farm/farm-rows-golden.jpg",
    title: "Pridelava na prostem",
    subtitle: "Sončne vrste pod zaščitno mrežo",
    alt: "Vrste zunanjih rastlin konoplje v zlati sončni svetlobi pod zaščitno mrežo",
  },
  {
    src: "/farm/farm-white-heaven-frost.jpg",
    title: "Bogata aroma in smola",
    subtitle: "Sveži cvetovi sorte White Heaven",
    alt: "Bližnji posnetek svežega cvetu konoplje sorte White Heaven z vijoličastimi listi",
  },
  {
    src: "/farm/farm-harvest-sunbeams.jpg",
    title: "Ročna žetev",
    subtitle: "Pobiranje ob optimalni zrelosti",
    alt: "Sončni žarki skozi zaščitno mrežo nad sveže požeto konopljo na nasadu HerbaGallus",
  },
  {
    src: "/farm/farm-cola-macro-purple.jpg",
    title: "100 % slovensko poreklo",
    subtitle: "Skrbno negovani vrhovi na soncu",
    alt: "Makro posnetek cvetočega vrha konoplje na sončnem nasadu HerbaGallus",
  },
];

const trustItems = [
  [PackageCheck, "100 % transparentna sestava"],
  [FileSearch, "Neodvisno laboratorijsko testirano"],
  [ShieldCheck, "Varno & certificirano poreklo"],
  [Leaf, "Ekološko pridelano v naravi"],
];

export default function HomePage() {
  const { t } = useLanguage();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  return (
    <>
      <Seo
        title="Premium konopljini izdelki"
        description="HerbaGallus predstavlja premium CBD izdelke z outdoor pristopom, bio usmerjeno filozofijo, jasno dokumentacijo in odgovorno komunikacijo."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "HerbaGallus",
          url: window.location.origin,
        }}
      />
      <section className="hero-wash border-b border-forest/8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-xl lg:py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold sm:text-xs">
              PREMIUM OUTDOOR CBD
            </p>
            <h1 className="hero-title mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-forest sm:text-5xl lg:text-[62px]">
              <span className="inline-block whitespace-nowrap">{t("Za trenutke,")}&nbsp;</span>
              <span className="inline-block">{t("ko potrebujete sprostitev.")}</span>
            </h1>
            <p className="mt-7 max-w-[36rem] text-base leading-8 text-forest/72 sm:text-[17px]">
              {t("HerbaGallus združuje premium CBD, outdoor pristop in bio usmerjeno vizijo. Vsak izdelek odlikujejo preverjeno poreklo, 100 % naravne sestavine in laboratorijsko potrjena kakovost.")}
            </p>
            <div className="mt-10 flex flex-col gap-3.5 sm:flex-row">
              <Link
                to="/products"
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-lg bg-forest px-7 text-sm font-semibold tracking-[0.03em] text-porcelain shadow-[0_10px_28px_rgba(23,56,44,0.14)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-ink hover:shadow-[0_16px_36px_rgba(23,56,44,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {t("Poglej ponudbo")}
                <ArrowRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  size={16}
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/quality"
                className="inline-flex min-h-13 items-center justify-center rounded-lg border border-forest/22 bg-porcelain/60 px-7 text-sm font-semibold tracking-[0.02em] text-forest transition-[background-color,border-color] duration-300 hover:border-forest/45 hover:bg-porcelain focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Standard HerbaGallus
              </Link>
            </div>
          </div>
          <div className="hero-media-frame relative aspect-[4/3] min-w-0 overflow-hidden rounded-2xl bg-cream sm:aspect-[16/11] lg:aspect-[4/3]">
            <img
              src={lifestyleImage}
              alt="HerbaGallus premium CBD olje v elegantni embalaži z zlato konopljino ilustracijo"
              width="1536"
              height="1024"
              fetchPriority="high"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-forest/10 bg-forest text-porcelain" aria-label="Načela HerbaGallus">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustItems.map(([Icon, label], idx) => (
            <div
              key={label}
              className={`flex min-h-20 items-center gap-3 border-white/10 px-2 py-4 lg:px-6 ${
                idx < trustItems.length - 1 ? "lg:border-r" : ""
              }`}
            >
              <Icon className="shrink-0 text-gold" size={18} strokeWidth={1.7} aria-hidden="true" />
              <span className="text-[13px] font-medium tracking-[0.01em] text-porcelain/90 sm:text-sm">
                {t(label)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Kolekcija</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.015em] text-forest sm:text-5xl">
                Izbrana kolekcija
              </h2>
              <p className="mt-4 leading-7 text-forest/68">
                Tri premišljeno izbrane CBD formulacije z jasnimi sestavinami,
                outdoor filozofijo in odgovorno predstavitvijo.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline decoration-gold/70 underline-offset-4 transition-colors hover:text-gold"
              to="/products"
            >
              Vsi izdelki <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {products.filter((product) => product.featured).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <section id="about" className="bg-porcelain py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{t("O nas")}</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.015em] text-forest sm:text-5xl">
                {t("Naravno pridelano. Kakovost na prvem mestu.")}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-forest/72">
              <p>
                {t("HerbaGallus temelji na kakovostni outdoor konoplji, pregledni sestavi in jasnih informacijah o uporabi, serijah ter dokumentaciji.")}
              </p>
              <p>
                {t("Naša trgovina je odprta z namenom, da vam ponudi kakovostne izdelke, pregledne informacije ter varen in enostaven nakup. Izbrane izdelke HerbaGallus lahko najdete tudi v trgovini Plečnikov čaj v Ljubljani.")}
              </p>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline decoration-gold/70 underline-offset-4 transition-colors hover:text-gold"
                to="/quality"
              >
                {t("Preberi pristop h kakovosti")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-forest/10 pt-10 sm:mt-16 sm:pt-12">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {t("Z naše sončne pridelave")}
                </p>
                <p className="mt-1.5 text-sm text-forest/65">
                  {t("Pristne fotografije z našega slovenskega nasada – od rasti na prostem do skrbne ročne žetve.")}
                </p>
              </div>
            </div>
            <FarmGallery items={homeFarmPhotos} />
          </div>
        </div>
      </section>

      <section className="bg-forest py-20 text-porcelain sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <img
              src={qualityShowcaseImage}
              alt="Ročna kontrola zrelosti cvetov konoplje s povečevalnim steklom na nasadu HerbaGallus"
              width="960"
              height="1280"
              loading="lazy"
              className="h-full w-full object-cover object-[50%_24%]"
            />
          </div>
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {t("Vsakdanji ritual")}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.015em] sm:text-5xl">
              {t("Kakovost, ki govori sama zase.")}
            </h2>
            <p className="mt-5 text-base leading-8 text-porcelain/76 sm:text-lg">
              {t("Pri izdelkih HerbaGallus so v ospredju kakovost, jasna deklaracija in odgovorna uporaba. Ne pripisujemo jim zdravilnih učinkov ali obljub, ki jih ni mogoče utemeljiti.")}
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gold underline decoration-gold/60 underline-offset-4 transition-colors hover:text-white"
              to="/responsible-use"
            >
              {t("Odgovorna uporaba")} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.015em] text-forest">
              Jasni odgovori
            </h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="bg-forest py-20 text-porcelain sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              HerbaGallus novice
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.015em]">
              Novosti z našega nasada in ugodnosti
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-porcelain/74">
              Obveščamo le o novih serijah, svežih žetvah in posebnih ugodnostih.
              Prijavo potrdite s klikom na povezavo v e-pošti.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <section className="bg-porcelain py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#142d23] via-[#10241c] to-[#0b1813] px-6 py-10 text-porcelain shadow-[0_20px_54px_rgba(23,56,44,0.14)] sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/12 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <Crown size={14} aria-hidden="true" />
                <span>{t("Partnerski program")}</span>
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.015em] text-white sm:text-4xl">
                {t("Postani HerbaGallus ambasador")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-porcelain/75 sm:text-base">
                {t(
                  "Ustvarjaš vsebine na družbenih omrežjih? Pridobi svojo unikatno kodo za popust za sledilce in zasluži pregledno provizijo od vsakega nakupa."
                )}
              </p>
            </div>
            <div className="relative mt-7 flex flex-wrap items-center gap-3 lg:mt-0 lg:shrink-0">
              <button
                type="button"
                onClick={() => setPartnerModalOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold tracking-[0.02em] text-ink shadow-[0_8px_22px_rgba(185,149,82,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#c9a663]"
              >
                <Crown size={15} aria-hidden="true" />
                <span>{t("Prijavi se zdaj")}</span>
              </button>
              <Link
                to="/partners"
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-5 text-sm font-semibold text-porcelain transition-colors hover:border-gold/50 hover:bg-white/5"
              >
                <span>{t("Več o programu")}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactCta />

      <PartnerApplicationModal
        open={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
      />
    </>
  );
}
