import React from "react";
import { ClipboardCheck, FileText, ShieldCheck } from "lucide-react";

const points = [
  {
    icon: ClipboardCheck,
    title: "Čiste sestavine",
    copy: "Formule so predstavljene jasno, brez nepotrebnih obljub in z osredotočenostjo na kakovost.",
  },
  {
    icon: ShieldCheck,
    title: "Neodvisno testiranje",
    copy: "Poudarek je na laboratorijskih poročilih, sledljivosti in skladnosti z veljavnimi omejitvami.",
  },
  {
    icon: FileText,
    title: "Odgovorna komunikacija",
    copy: "Vsebina ostaja informativna, premium in brez medicinskih trditev.",
  },
];

export default function QualitySection() {
  return (
    <section id="kakovost" className="bg-porcelain py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-clay">
            Standard kakovosti
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">
            Kakovost, transparentnost in odgovorna predstavitev
          </h2>
          <p className="mt-6 text-lg leading-8 text-forest/70">
            Naši izdelki so predstavljeni odgovorno, brez medicinskih obljub.
            Poudarek je na kakovosti, jasnih sestavinah, sledljivosti in
            laboratorijskem testiranju.
          </p>
          <div className="mt-8 rounded-lg border border-gold/30 bg-gold/10 p-5 text-sm leading-7 text-forest/78">
            CBD izdelki niso namenjeni diagnosticiranju, zdravljenju ali
            preprečevanju bolezni. Pred uporabo se posvetujte s strokovnjakom,
            posebej če jemljete zdravila, ste noseči ali imate zdravstvene
            težave.
          </div>
        </div>

        <div className="grid gap-4">
          {points.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="rounded-lg border border-forest/10 bg-white/64 p-6 shadow-soft transition duration-300 hover:-translate-y-1"
            >
              <Icon className="text-gold" size={28} aria-hidden="true" />
              <h3 className="mt-5 font-display text-3xl font-semibold text-forest">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-forest/68">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
