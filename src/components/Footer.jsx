import React from "react";

const columns = [
  {
    title: "Brand",
    links: ["O HempAura", "Kakovost", "Sledljivost", "Kontakt"],
  },
  {
    title: "Izdelki",
    links: ["CBD olje 5%", "CBD olje 10%", "CBD balzam", "Darilni seti"],
  },
  {
    title: "Podpora",
    links: ["Pogosta vprašanja", "Dostava", "Vračila", "Laboratorijska poročila"],
  },
  {
    title: "Pravno",
    links: ["Politika zasebnosti", "Pogoji uporabe", "Kontakt", "Odgovorna uporaba"],
  },
];

export default function Footer() {
  return (
    <footer id="kontakt" className="bg-ink text-porcelain">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-display text-4xl font-semibold">HempAura</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-porcelain/68">
              Premium konopljini izdelki za ljudi, ki cenijo naravne sestavine,
              transparentnost in odgovorno predstavitev.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-gold">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-sm text-porcelain/66 transition hover:text-porcelain"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-porcelain/54">
          <p>
            Izjava: CBD izdelki niso namenjeni diagnosticiranju, zdravljenju ali
            preprečevanju bolezni. Pred uporabo se posvetujte s strokovnjakom,
            posebej če jemljete zdravila, ste noseči ali imate zdravstvene
            težave.
          </p>
          <p className="mt-4">© 2026 HempAura. Vse pravice pridržane.</p>
        </div>
      </div>
    </footer>
  );
}
