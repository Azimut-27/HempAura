import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";

const columns = [
  {
    title: "HempAura",
    links: [
      ["Izdelki", "/products"],
      ["Kakovost", "/quality"],
      ["Laboratorijska poročila", "/lab-reports"],
      ["Kontakt", "/contact"],
    ],
  },
  {
    title: "Podpora",
    links: [
      ["Pogosta vprašanja", "/faq"],
      ["Dostava in vračila", "/shipping-and-returns"],
      ["Odgovorna uporaba", "/responsible-use"],
      ["Odjava od e-novic", "/newsletter/unsubscribe"],
      ["Košarica", "/cart"],
    ],
  },
  {
    title: "Pravno",
    links: [
      ["Zasebnost", "/privacy"],
      ["Pogoji poslovanja", "/terms"],
      ["Piškotki", "/cookies"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-porcelain">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <p className="font-display text-4xl font-semibold">{siteConfig.brandName}</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-porcelain/70">
              Premium predstavitev konopljinih izdelkov z jasnimi informacijami,
              odgovorno komunikacijo in mirno uporabniško izkušnjo.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-bold text-gold">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map(([label, to]) => (
                    <li key={to}>
                      <Link className="text-sm text-porcelain/70 hover:text-white" to={to}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-porcelain/60">
          <p>
            Informacije na tej strani niso zdravstveni nasvet. Uporabljaj izdelke
            skladno s potrjeno deklaracijo in navodili na embalaži.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} HempAura. Vse pravice pridržane.</p>
        </div>
      </div>
    </footer>
  );
}
