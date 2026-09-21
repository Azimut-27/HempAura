import { FileCheck2, PackageCheck, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import ContactCta from "../components/ContactCta.jsx";
import Seo from "../components/Seo.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const principles = [
  {
    icon: PackageCheck,
    title: "Identiteta izdelka",
    text: "Naziv, različica, serija in deklaracija morajo biti usklajeni pred objavo.",
  },
  {
    icon: FileCheck2,
    title: "Dokumentacija",
    text: "Podatke in poročila objavimo le, ko obstaja preverljiva dokumentacija za konkreten izdelek ali serijo.",
  },
  {
    icon: Scale,
    title: "Odgovorna komunikacija",
    text: "Pri predstavitvi izdelkov uporabljamo jasen jezik brez neutemeljenih obljub ali pripisovanja zagotovljenih učinkov.",
  },
];

export default function QualityPage() {
  const { t } = useLanguage();

  return (
    <>
      <Seo
        title="Naš pristop h kakovosti | HerbaGallus"
        description="HerbaGallus temelji na outdoor pristopu in bio usmerjeni viziji. Informacije, laboratorijski izvidi in dokumentacija so objavljeni takrat, ko so zares preverjeni."
        path="/quality"
      />

      {/* Main Editorial Dark Green Section »NAŠ PRISTOP« */}
      <section className="bg-forest py-16 text-porcelain sm:py-20 lg:py-24 border-b border-forest/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            {t("NAŠ PRISTOP")}
          </p>

          {/* Main Heading constrained to ~2 lines */}
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.14] text-porcelain sm:text-5xl lg:text-6xl text-balance">
            {t("Transparentnost se začne pri tem, kar lahko preverimo.")}
          </h1>

          {/* Intro Description constrained to ~650px */}
          <p className="mt-6 max-w-[660px] font-sans text-base sm:text-lg leading-relaxed text-porcelain/80">
            {t(
              "HerbaGallus temelji na outdoor pristopu in bio usmerjeni viziji. Informacije, laboratorijski izvidi, poreklo in dokumentacija so objavljeni takrat, ko so zares preverjeni in usklajeni s konkretnim izdelkom ali serijo."
            )}
          </p>

          {/* 3 Equal Information Cards Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 sm:gap-8">
            {principles.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group relative flex flex-col justify-between rounded-[22px] border border-white/10 bg-white/[0.04] p-7 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:bg-white/[0.07] hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)]"
              >
                <div>
                  <div className="inline-grid size-12 place-items-center rounded-xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold/20">
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-porcelain sm:text-[26px]">
                    {t(title)}
                  </h2>
                  <p className="mt-3 font-sans text-sm sm:text-[15px] leading-relaxed text-porcelain/75">
                    {t(text)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sledljivost & Poročila Section */}
      <section className="bg-porcelain py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest">
              {t("Sledljivost po seriji")}
            </h2>
            <p className="mt-4 text-base leading-8 text-forest/70">
              {t(
                "Časovnica dobavne verige bo dodana samo, če bodo na voljo pristni podatki o izvoru, predelavi, seriji in testiranju."
              )}
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest">
              {t("Poročila")}
            </h2>
            <p className="mt-4 text-base leading-8 text-forest/70">
              {t(
                "Območje za dokumente je že pripravljeno na filtriranje po izdelku in prikaz številke serije ter datuma."
              )}
            </p>
            <Link
              className="mt-5 inline-flex font-bold text-forest underline hover:text-clay transition-colors"
              to="/lab-reports"
            >
              {t("Odpri laboratorijska poročila")} &rarr;
            </Link>
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
