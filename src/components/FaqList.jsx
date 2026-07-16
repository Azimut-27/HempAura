import { ChevronDown } from "lucide-react";

export default function FaqList({ items }) {
  return (
    <div className="divide-y divide-forest/12 border-y border-forest/12">
      {items.map((faq) => (
        <details key={faq.question} className="group py-5">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 font-semibold text-forest">
            {faq.question}
            <ChevronDown
              size={20}
              className="shrink-0 text-gold transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-3xl pb-2 pr-10 text-sm leading-7 text-forest/68">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
