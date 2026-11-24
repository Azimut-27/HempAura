import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function FarmGallery({ items = [], dark = false }) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((idx) => (idx === null ? null : (idx + 1) % items.length));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((idx) =>
          idx === null ? null : (idx - 1 + items.length) % items.length
        );
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`${t("Oglej si fotografijo")}: ${t(item.title)}`}
            className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${
              dark
                ? "border border-white/12 bg-forest shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                : "border border-forest/10 bg-cream shadow-[0_12px_30px_rgba(23,56,44,0.08)] hover:shadow-[0_20px_42px_rgba(23,56,44,0.16)]"
            }`}
          >
            <img
              src={item.src}
              alt={t(item.alt || item.title)}
              width="960"
              height="1280"
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d211a]/95 via-[#0d211a]/55 to-transparent px-3.5 pb-3.5 pt-16 sm:px-4 sm:pb-4">
              <p className="font-display text-sm font-semibold leading-snug text-porcelain sm:text-base">
                {t(item.title)}
              </p>
              {item.subtitle && (
                <p className="mt-0.5 text-[11px] leading-snug text-porcelain/78 sm:text-xs">
                  {t(item.subtitle)}
                </p>
              )}
            </div>
            <span
              className="pointer-events-none absolute right-2.5 top-2.5 inline-grid size-8 place-items-center rounded-full bg-forest/65 text-porcelain opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden="true"
            >
              <Expand size={14} />
            </span>
          </button>
        ))}
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t(activeItem.title)}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label={t("Zapri predogled")}
            className="absolute right-4 top-4 inline-grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((activeIndex - 1 + items.length) % items.length);
                }}
                aria-label="Prejšnja fotografija"
                className="absolute left-3 top-1/2 inline-grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((activeIndex + 1) % items.length);
                }}
                aria-label="Naslednja fotografija"
                className="absolute right-3 top-1/2 inline-grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <figure
            className="flex max-h-[90vh] max-w-2xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeItem.src}
              alt={t(activeItem.alt || activeItem.title)}
              className="max-h-[78vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <figcaption className="mt-4 text-center text-porcelain">
              <p className="font-display text-lg font-semibold">{t(activeItem.title)}</p>
              {activeItem.subtitle && (
                <p className="mt-1 text-sm text-porcelain/75">{t(activeItem.subtitle)}</p>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
