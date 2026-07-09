import React from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Kaj je CBD?",
    answer:
      "CBD je naravno prisotna spojina v konoplji. Na tej strani ga predstavljamo izključno kot del wellness in negovalnih rutin, brez medicinskih obljub.",
  },
  {
    question: "Ali CBD vsebuje THC?",
    answer:
      "Nekateri izdelki lahko vsebujejo sledi THC znotraj zakonsko dovoljenih mej, drugi so oblikovani kot izbira brez THC. Vedno preverite oznake izdelka in laboratorijska poročila.",
  },
  {
    question: "Kako izbrati pravi izdelek?",
    answer:
      "Začnite pri želeni obliki uporabe, sestavinah, koncentraciji in lastnih rutinah. Pri posebnih okoliščinah se pred uporabo posvetujte s strokovnjakom.",
  },
  {
    question: "Ali lahko CBD uporabljam vsak dan?",
    answer:
      "Izdelek naj bo uporabljen skladno z navodili na embalaži. Če jemljete zdravila, ste noseči ali imate zdravstvene težave, se pred uporabo posvetujte s strokovnjakom.",
  },
  {
    question: "Ali izdelki zdravijo bolezni?",
    answer:
      "Ne. Izdelki niso namenjeni zdravljenju, diagnosticiranju ali preprečevanju bolezni.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-clay">
            Pogosta vprašanja
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-forest sm:text-5xl">
            Jasni odgovori pred prvim nakupom
          </h2>
        </div>
        <div className="mt-12 divide-y divide-forest/12 rounded-lg border border-forest/10 bg-white/68 shadow-soft">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5 open:bg-white/72 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-semibold text-forest">
                {faq.question}
                <ChevronDown
                  size={20}
                  className="shrink-0 text-gold transition duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-forest/68">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
