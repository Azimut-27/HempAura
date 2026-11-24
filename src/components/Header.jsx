import { Check, ChevronDown, Globe2, Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const navItems = [
  { label: "Izdelki", to: "/products" },
  { label: "Kakovost", to: "/quality" },
  { label: "O nas", to: "/#about" },
  { label: "Partnerji", to: "/partners" },
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

  const navClass = (to) => ({ isActive }) => {
    const active =
      to === "/#about"
        ? location.pathname === "/" && location.hash === "#about"
        : isActive;
    return `relative py-1 text-sm font-medium tracking-[0.01em] transition-colors ${
      active
        ? "text-forest font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[1.5px] after:bg-gold"
        : "text-forest/70 hover:text-forest"
    }`;
  };

  return (
    <>
      {siteConfig.announcement.enabled && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-[0.02em] text-porcelain">
          {siteConfig.announcement.text}
          {siteConfig.announcement.linkLabel && (
            <Link className="ml-2 underline decoration-gold/70 underline-offset-4" to={siteConfig.announcement.linkTo}>
              {siteConfig.announcement.linkLabel}
            </Link>
          )}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-forest/8 bg-porcelain/90 backdrop-blur-md">
        <nav
          className="mx-auto flex h-16 sm:h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
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
            <span className="font-display text-xl font-semibold tracking-[-0.015em] text-forest sm:text-2xl lg:text-[28px] translate-y-[1px]">
              HerbaGallus
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass(item.to)}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setLanguageOpen((current) => !current)}
                className="group inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 rounded-lg border border-forest/12 bg-porcelain/70 px-2.5 sm:px-3 py-1 text-forest transition duration-200 hover:border-gold/55 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                aria-label={t("Izberi jezik")}
                aria-haspopup="menu"
                aria-expanded={languageOpen}
                aria-controls="language-menu"
              >
                <span className="grid size-5 sm:size-6 place-items-center rounded-full bg-forest text-porcelain transition-colors group-hover:bg-ink">
                  <Globe2 size={11} strokeWidth={1.8} aria-hidden="true" className="sm:hidden" />
                  <Globe2 size={13} strokeWidth={1.8} aria-hidden="true" className="hidden sm:block" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {languages.find((option) => option.code === language)?.shortLabel}
                </span>
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  aria-hidden="true"
                  className={`text-forest/60 transition-transform duration-200 ${languageOpen ? "rotate-180" : ""}`}
                />
              </button>

              {languageOpen && (
                <div
                  id="language-menu"
                  role="menu"
                  aria-label={t("Izberi jezik")}
                  className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-48 overflow-hidden rounded-xl border border-forest/10 bg-porcelain p-1.5 shadow-[0_20px_48px_rgba(23,56,44,0.14)]"
                >
                  <div className="border-b border-forest/8 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/55">
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
                          className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold ${
                            selected
                              ? "bg-forest text-porcelain"
                              : "text-forest hover:bg-sage/60"
                          }`}
                        >
                          <span
                            className={`grid size-6 place-items-center rounded-md border text-[10px] font-semibold uppercase tracking-[0.08em] ${
                              selected
                                ? "border-gold/60 text-gold"
                                : "border-forest/15 text-forest/65"
                            }`}
                          >
                            {option.shortLabel}
                          </span>
                          <span className="flex-1 text-sm font-medium">{option.label}</span>
                          {selected && <Check size={15} className="text-gold" aria-hidden="true" />}
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
              className="relative grid size-9 sm:size-10 place-items-center rounded-lg text-forest transition-colors hover:bg-forest/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`Odpri košarico, ${count} izdelkov`}
            >
              <ShoppingBag size={18} strokeWidth={1.7} className="sm:hidden" aria-hidden="true" />
              <ShoppingBag size={20} strokeWidth={1.7} className="hidden sm:block" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[9px] font-semibold text-porcelain ring-2 ring-porcelain">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/products"
              className="hidden min-h-10 items-center rounded-lg bg-forest px-5 text-sm font-semibold tracking-[0.03em] text-porcelain transition-colors hover:bg-ink lg:inline-flex"
            >
              Nakup
            </Link>
            <button
              type="button"
              className="grid size-9 sm:size-10 place-items-center rounded-lg text-forest transition-colors hover:bg-forest/5 lg:hidden"
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
