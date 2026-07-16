import FaqList from "../components/FaqList.jsx";
import Seo from "../components/Seo.jsx";
import { faqs } from "../data/faqs.js";

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Seo
        title="Pogosta vprašanja"
        description="Odgovori o izdelkih, laboratorijskih poročilih, naročilih in odgovorni uporabi HempAura."
        path="/faq"
        jsonLd={jsonLd}
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase text-clay">Podpora</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            Pogosta vprašanja
          </h1>
          <div className="mt-10">
            <FaqList items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
