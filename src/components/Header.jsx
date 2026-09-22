import { Check, ChevronDown, Globe2, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const navItems = [
  { label: "Izdelki", to: "/products" },
  { label: "Kakovost", to: "/quality" },
  { label: "O znamki", to: "/#about" },
  { label: "FAQ", to: "/faq" },
  { label: "Kontakt", to: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const drawerRef = useRef(null);
  const languageMenuRef = useRef(null);
  const location = useLocation();
  const { count, openDrawer } = useCart();
  const { language, languages, setLanguage, t } = useLanguage();

  useEffect(() => {
    setOpen(false);
    setLanguageOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!languageOpen) return undefined;

    const closeLanguageMenu = (event) => {
      if (event.key === "Escape") setLanguageOpen(false);
      if (
        event.type === "pointerdown" &&
        !languageMenuRef.current?.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("keydown", closeLanguageMenu);
    document.addEventListener("pointerdown", closeLanguageMenu);
    return () => {
      document.removeEventListener("keydown", closeLanguageMenu);
      document.removeEventListener("pointerdown", closeLanguageMenu);
    };
  }, [languageOpen]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? "text-clay" : "text-forest/75 hover:text-forest"
    }`;

  return (
    <>
      {siteConfig.announcement.enabled && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-semibold text-porcelain">
          {siteConfig.announcement.text}
          {siteConfig.announcement.linkLabel && (
            <Link className="ml-2 underline" to={siteConfig.announcement.linkTo}>
              {siteConfig.announcement.linkLabel}
            </Link>
          )}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-porcelain/95 backdrop-blur">
        <nav
          className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8"
          aria-label="Glavna navigacija"
        >
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-h-10" aria-label="HerbaGallus domov">
            <img
              src="/brand/herbagallus-mark.png"
              alt="HerbaGallus"
              width="180"
              height="240"
              className="h-8 w-auto object-contain sm:h-9"
            />
            <span className="font-display text-xl font-bold tracking-tight text-forest sm:text-2xl lg:text-3xl translate-y-[2px] sm:translate-y-[3px]">
              HerbaGallus
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((current) => !current)}
                className="group inline-flex min-h-9 sm:min-h-11 items-center gap-1.5 sm:gap-2 border border-forest/15 bg-porcelain/75 px-2 sm:px-3 py-1 text-forest shadow-[0_4px_12px_rgba(28,33,29,0.04)] transition duration-200 hover:border-gold/60 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
                aria-label={t("Izberi jezik")}
                aria-haspopup="menu"
                aria-expanded={languageOpen}
                aria-controls="language-menu"
              >
                <span className="grid size-6 sm:size-7 place-items-center rounded-full bg-forest text-porcelain shadow-[inset_0_0_0_1px_rgba(185,149,82,0.35)] transition-colors group-hover:bg-ink">
                  <Globe2 size={12} strokeWidth={1.8} aria-hidden="true" className="sm:hidden" />
                  <Globe2 size={14} strokeWidth={1.8} aria-hidden="true" className="hidden sm:block" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.1em] sm:tracking-[0.14em]">
                  {languages.find((option) => option.code === language)?.shortLabel}
                </span>
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={`text-moss transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`}
                />
              </button>

              {languageOpen && (
                <div
                  id="language-menu"
                  role="menu"
                  aria-label={t("Izberi jezik")}
                  className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-48 border border-forest/10 border-t-gold/70 bg-porcelain p-1.5 shadow-[0_24px_55px_rgba(28,33,29,0.2)]"
                >
                  <div className="border-b border-forest/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-moss">
                    {t("Izberi jezik")}
                  </div>
                  <div className="pt-1.5">
                    {languages.map((option) => {
                      const selected = option.code === language;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => {
                            setLanguage(option.code);
                            setLanguageOpen(false);
                          }}
                          className={`flex min-h-11 w-full items-center gap-3 px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-clay ${
                            selected
                              ? "bg-forest text-porcelain"
                              : "text-forest hover:bg-sage/70"
                          }`}
                        >
                          <span
                            className={`grid size-7 place-items-center border text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                              selected
                                ? "border-gold/60 text-gold"
                                : "border-forest/15 text-moss"
                            }`}
                          >
                            {option.shortLabel}
                          </span>
                          <span className="flex-1 text-sm font-semibold">{option.label}</span>
                          {selected && <Check size={16} className="text-gold" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={openDrawer}
              className="relative grid size-9 sm:size-12 place-items-center text-forest hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
              aria-label={`Odpri košarico, ${count} izdelkov`}
            >
              <ShoppingBag size={18} className="sm:hidden" aria-hidden="true" />
              <ShoppingBag size={21} className="hidden sm:block" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 sm:right-1.5 sm:top-1.5 grid min-h-4 min-w-4 sm:min-h-5 sm:min-w-5 place-items-center rounded-full bg-clay px-1 text-[9px] sm:text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/products"
              className="hidden min-h-12 items-center bg-forest px-5 text-sm font-bold text-porcelain hover:bg-ink lg:inline-flex"
            >
              Nakup
            </Link>
            <button
              type="button"
              className="grid size-9 sm:size-12 place-items-center text-forest hover:bg-sage lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Odpri meni"
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <Menu size={20} className="sm:hidden" aria-hidden="true" />
              <Menu size={23} className="hidden sm:block" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/45 lg:hidden" onMouseDown={() => setOpen(false)}>
          <div
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobilna navigacija"
            className="ml-auto flex h-full w-[min(88vw,390px)] flex-col bg-porcelain p-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-forest/10 pb-5">
              <span className="flex items-center gap-2.5">
                <img
                  src="/brand/herbagallus-mark.png"
                  alt="HerbaGallus"
                  width="180"
                  height="240"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-display text-2xl font-bold text-forest translate-y-[2px]">HerbaGallus</span>
              </span>
              <button
                type="button"
                className="grid size-12 place-items-center text-forest hover:bg-sage"
                onClick={() => setOpen(false)}
                aria-label="Zapri meni"
              >
                <X size={23} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-1 py-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-4 text-lg font-semibold text-forest hover:bg-sage"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Link
              to="/products"
              className="flex min-h-12 items-center justify-center bg-forest px-5 text-sm font-bold text-porcelain"
            >
              Razišči kolekcijo
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
