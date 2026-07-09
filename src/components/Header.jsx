import { Menu, ShoppingBag, X } from "lucide-react";
import React, { useState } from "react";

const navItems = [
  { label: "Izdelki", href: "#izdelki" },
  { label: "O znamki", href: "#o-znamki" },
  { label: "Kakovost", href: "#kakovost" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-porcelain/78 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="HempAura domov">
          <span className="grid size-10 place-items-center rounded-lg bg-forest text-sm font-semibold text-porcelain shadow-glow transition-transform duration-300 group-hover:-translate-y-0.5">
            HA
          </span>
          <span className="font-display text-3xl font-semibold tracking-normal text-forest">
            HempAura
          </span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-forest/76 transition-colors duration-300 hover:text-forest"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#izdelki"
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-semibold text-porcelain shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-ink"
          >
            <ShoppingBag size={17} aria-hidden="true" />
            Nakup izdelkov
          </a>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-lg border border-forest/15 text-forest transition duration-300 hover:bg-sage lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Zapri meni" : "Odpri meni"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        className={`lg:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden border-t border-forest/10 bg-porcelain/96 transition-all duration-300`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-forest transition-colors hover:bg-sage"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#izdelki"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-semibold text-porcelain"
          >
            <ShoppingBag size={17} aria-hidden="true" />
            Nakup izdelkov
          </a>
        </div>
      </div>
    </header>
  );
}
