import { CheckCircle2, Crown, LoaderCircle, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkPartnerCodeAvailability,
  submitPartnerApplication,
} from "../services/api.js";

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "Blog / Spletna stran",
  "Drugo",
];

const AUDIENCE_SIZES = ["< 1k", "1k – 10k", "10k – 50k", "50k+"];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  socialPlatform: "Instagram",
  handle: "",
  audienceSize: "1k – 10k",
  requestedPromoCode: "",
  niche: "",
  promotionPlan: "",
  consent: false,
  website: "",
};

export default function PartnerApplicationModal({ open, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [codeStatus, setCodeStatus] = useState({ state: "idle", message: "" });

  // Lock body scroll & handle Escape key
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Live promo code availability check (debounced)
  useEffect(() => {
    const raw = form.requestedPromoCode.trim().toUpperCase();
    if (!raw) {
      setCodeStatus({ state: "idle", message: "" });
      return;
    }
    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(raw)) {
      setCodeStatus({
        state: "invalid",
        message: "3–32 znakov (A–Z, 0–9, _ ali -)",
      });
      return;
    }

    let cancelled = false;
    setCodeStatus({ state: "checking", message: "Preverjam..." });

    const timer = setTimeout(async () => {
      try {
        const res = await checkPartnerCodeAvailability(raw);
        if (cancelled) return;
        if (res.available) {
          setCodeStatus({ state: "available", message: "Koda je prosta" });
        } else {
          setCodeStatus({
            state: "taken",
            message: res.reason || "Koda je že zasedena",
          });
        }
      } catch {
        if (!cancelled) setCodeStatus({ state: "idle", message: "" });
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.requestedPromoCode]);

  if (!open) return null;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  function handlePromoCodeChange(rawValue) {
    const cleaned = rawValue
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .slice(0, 32);
    handleChange("requestedPromoCode", cleaned);
  }

  function handleResetAndClose() {
    setForm(INITIAL_FORM);
    setError("");
    setSuccessMessage("");
    setSubmittedCode("");
    setCodeStatus({ state: "idle", message: "" });
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (codeStatus.state === "taken") {
      setError("Izbrana promocijska koda je že zasedena. Prosimo izberi drugo.");
      return;
    }
    if (!form.consent) {
      setError("Za oddajo prijave potrdi polnoletnost (18+) in pravila sodelovanja.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPartnerApplication({
        ...form,
        requestedPromoCode: form.requestedPromoCode.trim().toUpperCase(),
      });
      setSubmittedCode(
        result.partner?.publicCode || form.requestedPromoCode.trim().toUpperCase()
      );
      setSuccessMessage(
        result.message ||
          "Prijava je uspešno oddana! Pregledali jo bomo in te v kratkem kontaktirali."
      );
    } catch (submitError) {
      setError(
        submitError.message || "Prijave trenutno ni bilo mogoče oddati. Poskusi znova."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b1611]/80 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ambassador-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleResetAndClose();
      }}
    >
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-[#132920] via-[#0e1f18] to-[#0a1510] p-6 text-porcelain shadow-[0_28px_90px_rgba(0,0,0,0.65)] sm:p-8">
        {/* Subtle gold radial glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-inner">
              <Crown size={22} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="ambassador-modal-title"
                className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                Prijava ambasadorja
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-porcelain/65 sm:text-sm">
                Pridruži se uradni HerbaGallus mreži ustvarjalcev.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-porcelain/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Zapri okno"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {successMessage ? (
          <div className="relative mt-7 rounded-2xl border border-emerald-400/25 bg-emerald-950/40 p-6 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-white">
              Prijava prejeta!
            </h3>
            <p className="mt-2 text-sm leading-6 text-porcelain/80">
              {successMessage}
            </p>
            {submittedCode && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/35 bg-black/35 px-4 py-2.5">
                <Sparkles size={15} className="text-gold" />
                <span className="text-xs uppercase tracking-wider text-porcelain/60">
                  Rezervirana koda:
                </span>
                <span className="font-mono text-base font-bold tracking-wider text-gold">
                  {submittedCode}
                </span>
              </div>
            )}
            <p className="mt-4 text-xs text-porcelain/55">
              Po odobritvi v naši ekipi bomo kodo aktivirali in ti na e-pošto poslali
              navodila ter osebno povezavo.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#e8d199] via-[#d4b06a] to-[#b99552] px-6 text-sm font-bold text-[#10241b] shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Zapri
            </button>
          </div>
        ) : (
          /* Application Form */
          <form className="relative mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Honeypot */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="partner-website">Website</label>
              <input
                id="partner-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>

            {/* Full Name & Email */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-fullname"
                  className="block text-xs font-semibold text-porcelain/85"
                >
                  Ime in priimek / Ustvarjalec <span className="text-gold">*</span>
                </label>
                <input
                  id="partner-fullname"
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="npr. Ana Novak"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-sm text-white placeholder:text-porcelain/35 outline-none transition-colors focus:border-gold focus:bg-black/45"
                />
              </div>

              <div>
                <label
                  htmlFor="partner-email"
                  className="block text-xs font-semibold text-porcelain/85"
                >
                  E-poštni naslov <span className="text-gold">*</span>
                </label>
                <input
                  id="partner-email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="npr. ana@primer.si"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-sm text-white placeholder:text-porcelain/35 outline-none transition-colors focus:border-gold focus:bg-black/45"
                />
              </div>
            </div>

            {/* Platform & Handle */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-platform"
                  className="block text-xs font-semibold text-porcelain/85"
                >
                  Glavna platforma <span className="text-gold">*</span>
                </label>
                <select
                  id="partner-platform"
                  value={form.socialPlatform}
                  onChange={(e) => handleChange("socialPlatform", e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-[#0e1f18] px-3.5 text-sm text-white outline-none transition-colors focus:border-gold"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="partner-handle"
                  className="block text-xs font-semibold text-porcelain/85"
                >
                  Profil / Povezava <span className="text-gold">*</span>
                </label>
                <input
                  id="partner-handle"
                  type="text"
                  required
                  minLength={2}
                  maxLength={200}
                  placeholder="@vasprofil"
                  value={form.handle}
                  onChange={(e) => handleChange("handle", e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-sm text-white placeholder:text-porcelain/35 outline-none transition-colors focus:border-gold focus:bg-black/45"
                />
              </div>
            </div>

            {/* Audience Size & Requested Promo Code */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-audience"
                  className="block text-xs font-semibold text-porcelain/85"
                >
                  Velikost občinstva <span className="text-gold">*</span>
                </label>
                <select
                  id="partner-audience"
                  value={form.audienceSize}
                  onChange={(e) => handleChange("audienceSize", e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-[#0e1f18] px-3.5 text-sm text-white outline-none transition-colors focus:border-gold"
                >
                  {AUDIENCE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="partner-code"
                    className="block text-xs font-semibold text-porcelain/85"
                  >
                    Želena promo koda <span className="text-gold">*</span>
                  </label>
                  {codeStatus.state === "available" && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      ✓ Prosta
                    </span>
                  )}
                  {codeStatus.state === "taken" && (
                    <span className="text-[11px] font-bold text-rose-400">
                      ✕ Zasedena
                    </span>
                  )}
                  {codeStatus.state === "checking" && (
                    <span className="text-[11px] text-porcelain/50">...</span>
                  )}
                </div>
                <input
                  id="partner-code"
                  type="text"
                  required
                  minLength={3}
                  maxLength={32}
                  placeholder="npr. ANA10"
                  value={form.requestedPromoCode}
                  onChange={(e) => handlePromoCodeChange(e.target.value)}
                  className={`mt-1.5 min-h-11 w-full rounded-xl border bg-black/30 px-3.5 font-mono text-sm uppercase tracking-wider text-white placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-porcelain/35 outline-none transition-colors focus:bg-black/45 ${
                    codeStatus.state === "taken" || codeStatus.state === "invalid"
                      ? "border-rose-400/70 focus:border-rose-400"
                      : codeStatus.state === "available"
                        ? "border-emerald-400/60 focus:border-emerald-400"
                        : "border-white/15 focus:border-gold"
                  }`}
                />
                {codeStatus.state === "invalid" && (
                  <p className="mt-1 text-[11px] text-amber-300/90">
                    {codeStatus.message}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Niche */}
            <div>
              <label
                htmlFor="partner-niche"
                className="block text-xs font-semibold text-porcelain/85"
              >
                Glavno področje / Niša <span className="text-gold">*</span>
              </label>
              <input
                id="partner-niche"
                type="text"
                required
                minLength={2}
                maxLength={200}
                placeholder="npr. Šport & regeneracija, Naravni življenjski slog, Sprostitev"
                value={form.niche}
                onChange={(e) => handleChange("niche", e.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-sm text-white placeholder:text-porcelain/35 outline-none transition-colors focus:border-gold focus:bg-black/45"
              />
            </div>

            {/* Promotion Plan */}
            <div>
              <label
                htmlFor="partner-plan"
                className="block text-xs font-semibold text-porcelain/85"
              >
                Kako boš promoviral/-a HerbaGallus?
              </label>
              <textarea
                id="partner-plan"
                rows={3}
                maxLength={1500}
                placeholder="npr. Povezava v bio, Instagram Reels, unboxing zgodbe, priporočila strankam..."
                value={form.promotionPlan}
                onChange={(e) => handleChange("promotionPlan", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-porcelain/35 outline-none transition-colors focus:border-gold focus:bg-black/45"
              />
            </div>

            {/* Compliance & 18+ Checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-porcelain/75">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => handleChange("consent", e.target.checked)}
                required
                className="mt-0.5 size-4 shrink-0 accent-[#b99552]"
              />
              <span>
                Potrjujem, da sem polnoleten/-na (18+) in se strinjam s pravili
                odgovorne komunikacije (brez zdravstvenih obljub) ter obdelavo podatkov
                za namen partnerskega sodelovanja.
              </span>
            </label>

            {/* Error Alert */}
            {error && (
              <div
                className="rounded-xl border border-rose-400/40 bg-rose-950/60 px-4 py-3 text-xs font-semibold text-rose-200"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || codeStatus.state === "taken"}
              className="mt-2 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0dda8] via-[#d7b46a] to-[#b99552] px-6 text-sm font-extrabold tracking-wide text-[#0f231a] shadow-[0_12px_32px_rgba(185,149,82,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(185,149,82,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  <span>Pošiljam prijavo...</span>
                </>
              ) : (
                <span>Oddaj prijavo ambasadorja</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
