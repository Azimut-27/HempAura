import { Check, PenLine, Star, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { reviews } from "../data/reviews.js";

export default function ReviewsSection() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("HerbaGallus CBD kapljice 5 %");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setName("");
      setEmail("");
      setComment("");
    }, 2500);
  };

  return (
    <section className="bg-cream/40 py-18 sm:py-24 border-b border-forest/10" aria-label="Mnenja kupcev">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Top Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-10 sm:pb-12">
          {/* Left Title & Badge */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c69214]/30 bg-[#fbf5ea] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#9b5940]">
              <Star size={12} className="fill-[#c69214] text-[#c69214]" />
              {t("MNENJA ZADOVOLJNIH KUPCEV")}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl lg:text-5xl">
              {t("Kaj pravijo tisti, ki zaupajo HerbaGallus")}
            </h2>
          </div>

          {/* Right Rating & CTA Button */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="text-left sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="font-display text-2xl sm:text-3xl font-bold text-forest">
                  4.9 <span className="text-lg sm:text-xl font-normal text-forest/50">/ 5.0</span>
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-[#E5A93C] text-[#E5A93C]" />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-forest/65">
                {t("Več kot 250 zadovoljnih kupcev")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#7C4828] hover:bg-[#683b1f] text-white px-5 py-3 text-xs sm:text-sm font-bold tracking-wide shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <PenLine size={15} />
              <span>{t("NAPIŠITE MNENJE")}</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-forest/10 bg-white p-6 sm:p-8 shadow-[0_6px_25px_rgba(27,59,43,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(27,59,43,0.08)]"
            >
              {/* Star Rating & Relative Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#E5A93C] text-[#E5A93C]" />
                  ))}
                </div>
                <span className="text-xs text-forest/45 font-medium">{t(rev.date)}</span>
              </div>

              {/* Review Quote */}
              <p className="my-5 font-serif italic text-forest/85 text-[15px] sm:text-base leading-relaxed">
                »{t(rev.quote)}«
              </p>

              {/* Author Info & Product Tag */}
              <div className="mt-auto pt-4 border-t border-forest/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-forest">{rev.author}</span>
                    <span
                      className="inline-flex items-center justify-center size-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold"
                      title={t("Preverjen kupec")}
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-forest/55 mt-0.5">{t(rev.role)}</p>
                </div>
                <span className="text-[11px] sm:text-xs text-forest/50 font-medium sm:text-right">
                  {t(rev.product)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-forest/10 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-forest/50 hover:text-forest hover:bg-cream transition-colors"
              aria-label={t("Zapri")}
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="py-10 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={28} />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-forest">
                  {t("Hvala za vaše mnenje!")}
                </h3>
                <p className="mt-2 text-sm text-forest/70">
                  {t("Vaša ocena pomaga drugim kupcem pri izbiri kakovostnih naravnih izdelkov.")}
                </p>
              </div>
            ) : (
              <>
                <div className="pr-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-clay">
                    {t("Vaša izkušnja")}
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-forest">
                    {t("Ocenite HerbaGallus")}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-forest/65">
                    {t("Zaupajte nam svojo izkušnjo z izdelki, aromo in dostavo.")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Star Picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-forest mb-1.5">
                      {t("Ocena")}
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={`${
                              star <= (hoverRating || rating)
                                ? "fill-[#E5A93C] text-[#E5A93C]"
                                : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-forest/70">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="rev-name" className="block text-xs font-bold uppercase tracking-wide text-forest mb-1">
                      {t("Ime ali začetnica")} *
                    </label>
                    <input
                      id="rev-name"
                      type="text"
                      required
                      placeholder="npr. Luka M."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-forest/15 bg-cream/30 px-3.5 py-2.5 text-sm text-forest focus:border-forest focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="rev-email" className="block text-xs font-bold uppercase tracking-wide text-forest mb-1">
                      {t("E-poštni naslov (ne bo javno viden)")} *
                    </label>
                    <input
                      id="rev-email"
                      type="email"
                      required
                      placeholder="vas.email@primer.si"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-forest/15 bg-cream/30 px-3.5 py-2.5 text-sm text-forest focus:border-forest focus:outline-none"
                    />
                  </div>

                  {/* Product Select */}
                  <div>
                    <label htmlFor="rev-product" className="block text-xs font-bold uppercase tracking-wide text-forest mb-1">
                      {t("Izdelek")}
                    </label>
                    <select
                      id="rev-product"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="w-full rounded-xl border border-forest/15 bg-cream/30 px-3.5 py-2.5 text-sm text-forest focus:border-forest focus:outline-none"
                    >
                      <option value="HerbaGallus CBD kapljice 5 %">HerbaGallus CBD kapljice 5 %</option>
                      <option value="CBD cvetovi Citrin 15 %">HerbaGallus CBD cvetovi Citrin 15 %</option>
                      <option value="Splošna izkušnja in dostava">Splošna izkušnja in dostava</option>
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="rev-comment" className="block text-xs font-bold uppercase tracking-wide text-forest mb-1">
                      {t("Vaše mnenje")} *
                    </label>
                    <textarea
                      id="rev-comment"
                      required
                      rows={3}
                      placeholder={t("Opišite svoje vtise o kakovosti, vonju, okusu ali hitrosti dostave ...")}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-xl border border-forest/15 bg-cream/30 px-3.5 py-2.5 text-sm text-forest focus:border-forest focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-forest hover:bg-ink text-white py-3 text-sm font-bold tracking-wide shadow-md transition-all hover:scale-[1.01] active:scale-95"
                  >
                    {t("Oddaj mnenje")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
