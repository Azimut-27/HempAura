import React from "react";
import { FlaskConical, Globe2, Leaf, ListChecks } from "lucide-react";

const items = [
  { icon: FlaskConical, title: "Laboratorijsko testirano" },
  { icon: ListChecks, title: "Transparentne sestavine" },
  { icon: Leaf, title: "Premium konopljin ekstrakt" },
  { icon: Globe2, title: "Slovenija in EU fokus" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-forest/10 bg-forest text-porcelain">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 py-3 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, title }) => (
          <div key={title} className="flex items-center gap-3 px-1 py-4 sm:justify-center">
            <Icon size={19} className="text-gold" aria-hidden="true" />
            <span className="text-sm font-semibold">{title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
