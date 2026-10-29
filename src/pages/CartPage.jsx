import {
  Banknote,
  CheckCircle2,
  FileText,
  LoaderCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductMedia from "../components/ProductMedia.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import Seo from "../components/Seo.jsx";
import { siteConfig } from "../config/siteConfig.js";
import { useCart } from "../context/CartContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getProductById } from "../data/products.js";
import { formatPrice } from "../lib/formatters.js";
import {
  clearReferralCode,
  getStoredReferralCode,
  normalizeReferralCode,
  rememberReferralCode,
} from "../lib/referral.js";
import { createDirectOrder, getReferralPreview } from "../services/api.js";

export default function CartPage() {
  const { items, setQuantity, removeItem, clearCart, totals } = useCart();
  const { language, t } = useLanguage();
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referralCode, setReferralCode] = useState(() => getStoredReferralCode());
  const [promoCodeInput, setPromoCodeInput] = useState(referralCode);
  const [referralPreview, setReferralPreview] = useState({
    status: referralCode ? "loading" : "idle",
    data: null,
  });

  // Delivery and order form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    notes: "",
    paymentMethod: "cod", // "cod" | "proforma"
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!referralCode || totals.subtotalCents <= 0) {
      setReferralPreview({ status: "idle", data: null });
      return undefined;
    }

    let cancelled = false;
    setReferralPreview((current) => ({ ...current, status: "loading" }));
    getReferralPreview(referralCode, totals.subtotalCents)
      .then((data) => {
        if (!cancelled) setReferralPreview({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) {
          setReferralPreview({
            status: "error",
            data: {
              active: false,
              code: referralCode,
              message: "Kodo za popust bomo preverili ob zaključku naročila.",
            },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [referralCode, totals.subtotalCents]);

  const referralDiscountCents =
    referralPreview.data?.active && Number.isInteger(referralPreview.data.discountCents)
      ? referralPreview.data.discountCents
      : 0;

  const estimatedTotalCents = Math.max(0, totals.totalCents - referralDiscountCents);

  function applyPromoCode(event) {
    event.preventDefault();
    const code = normalizeReferralCode(promoCodeInput);

    if (!promoCodeInput.trim()) {
      clearReferralCode();
      setReferralCode("");
      setReferralPreview({ status: "idle", data: null });
      setErrorMessage("");
      return;
    }

    if (!code) {
      setReferralPreview({
        status: "error",
        data: {
          active: false,
          code: promoCodeInput.trim(),
          message: "Koda ni v pravilnem formatu.",
        },
      });
      return;
    }

    rememberReferralCode(code);
    setPromoCodeInput(code);
    setReferralCode(code);
    setErrorMessage("");
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateForm() {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Vnesite vaše ime in priimek.";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Vnesite veljaven e-poštni naslov.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = "Vnesite telefonsko številko za obvestilo GLS kurirja.";
    }
    if (!formData.line1.trim()) {
      errors.line1 = "Vnesite ulico in hišno številko (npr. Slovenska cesta 15).";
    } else if (!/\d+/.test(formData.line1)) {
      errors.line1 = "Naslov mora vsebovati tudi hišno številko (npr. Slovenska cesta 15).";
    }
    if (!formData.postalCode.trim() || !/^\d{4}$/.test(formData.postalCode.trim())) {
      errors.postalCode = "Vnesite 4-mestno poštno številko (npr. 1000).";
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = "Vnesite kraj oz. mesto.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmitOrder(event) {
    if (event) event.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Prosimo, izpolnite vsa obvezna polja za dostavo.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const orderPayload = {
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        paymentMethod: formData.paymentMethod,
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        shippingAddress: {
          name: formData.name.trim(),
          line1: formData.line1.trim(),
          line2: formData.line2.trim(),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          country: "SI",
        },
        notes: formData.notes.trim(),
        referralCode: referralCode || undefined,
        language,
      };

      const result = await createDirectOrder(orderPayload);
      clearCart();
      navigate(
        `/checkout/success?order_number=${encodeURIComponent(
          result.orderNumber
        )}&method=${encodeURIComponent(result.paymentMethod || formData.paymentMethod)}`
      );
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error?.message ||
          "Naročila trenutno ni bilo mogoče oddati. Preverite vnesene podatke."
      );
    }
  }

  return (
    <>
      <Seo
        title="Košarica in zaključek naročila"
        description="Preglejte izdelke in enostavno oddajte naročilo s plačilom ob prevzemu kurirju GLS."
        path="/cart"
      />
      <section className="bg-cream py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="font-display text-4xl font-semibold text-forest sm:text-5xl">
              {t("Košarica in naročilo")}
            </h1>
            <span className="text-xs font-semibold tracking-wide text-forest/60">
              Varna oddaja naročila · Plačilo ob prevzemu
            </span>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 grid min-h-80 place-items-center border border-forest/10 bg-white p-8 text-center rounded-2xl">
              <div>
                <ShoppingBag className="mx-auto text-gold" size={40} aria-hidden="true" />
                <h2 className="mt-5 font-display text-3xl font-semibold text-forest">
                  {t("Košarica je prazna")}
                </h2>
                <p className="mt-3 text-sm text-forest/65">
                  {t("Oglej si kolekcijo in preveri stanje posameznega izdelka.")}
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex min-h-12 items-center rounded-full bg-forest px-8 text-sm font-bold text-porcelain hover:bg-forest/90 transition-all shadow-sm"
                >
                  {t("Odpri izdelke")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* LEVI STOLPEC: Izdelki v košarici & Obrazec za dostavo */}
              <div className="space-y-8">
                {/* 1. SEZNAM IZDELKOV */}
                <div className="border border-forest/10 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between border-b border-forest/10 pb-4">
                    <h2 className="font-display text-2xl font-semibold text-forest flex items-center gap-2">
                      <ShoppingBag size={20} className="text-gold" />
                      <span>{t("Naročeni izdelki")}</span>
                    </h2>
                    <button
                      type="button"
                      className="text-xs font-semibold text-clay underline hover:text-clay/80"
                      onClick={clearCart}
                    >
                      {t("Izprazni košarico")}
                    </button>
                  </div>

                  <div className="divide-y divide-forest/10">
                    {items.map((item) => {
                      const product = getProductById(item.productId);
                      return (
                        <article
                          key={item.productId}
                          className="grid gap-4 py-4 sm:grid-cols-[100px_1fr_auto] items-center"
                        >
                          <div className="aspect-square overflow-hidden rounded-xl border border-forest/5 bg-cream/30">
                            <ProductMedia product={product} />
                          </div>
                          <div>
                            <Link
                              to={`/products/${product.slug}`}
                              className="font-display text-lg font-semibold text-forest hover:text-gold transition-colors"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-1 text-sm font-medium text-forest/70">
                              {formatPrice(product.priceCents)}
                            </p>
                            <div className="mt-3">
                              <QuantityControl
                                value={item.quantity}
                                max={product.stock}
                                onChange={(quantity) => setQuantity(product.id, quantity)}
                                label={product.name}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            className="grid size-10 place-items-center rounded-full text-clay hover:bg-clay/10 transition-colors"
                            aria-label={`${t("Odstrani")} ${product.name}`}
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* 2. OBRAZEC ZA PODATKE O DOSTAVI */}
                <div className="border border-forest/10 bg-white p-5 sm:p-7 rounded-2xl shadow-sm">
                  <div className="border-b border-forest/10 pb-4">
                    <h2 className="font-display text-2xl font-semibold text-forest flex items-center gap-2">
                      <Truck size={22} className="text-gold" />
                      <span>1. Podatki za dostavo (GLS Slovenija)</span>
                    </h2>
                    <p className="mt-1 text-xs text-forest/65">
                      Vnesite naslov v Sloveniji, kamor vam kurir GLS dostavi paket.
                    </p>
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                    {/* Ime in priimek */}
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                        htmlFor="customer-name"
                      >
                        Ime in priimek *
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="npr. Ana Novak"
                        className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                          formErrors.name
                            ? "border-red-500 bg-red-50/20"
                            : "border-forest/20 focus:border-forest"
                        }`}
                        autoComplete="name"
                        required
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    {/* E-pošta in Telefon */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                          htmlFor="customer-email"
                        >
                          E-poštni naslov *
                        </label>
                        <input
                          id="customer-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="npr. ana.novak@gmail.com"
                          className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                            formErrors.email
                              ? "border-red-500 bg-red-50/20"
                              : "border-forest/20 focus:border-forest"
                          }`}
                          autoComplete="email"
                          required
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                        )}
                        <p className="mt-1 text-[11px] text-forest/50">Za potrdilo in sledenje.</p>
                      </div>

                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                          htmlFor="customer-phone"
                        >
                          Telefonska številka *
                        </label>
                        <input
                          id="customer-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          placeholder="npr. 041 123 456"
                          className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                            formErrors.phone
                              ? "border-red-500 bg-red-50/20"
                              : "border-forest/20 focus:border-forest"
                          }`}
                          autoComplete="tel"
                          required
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                        )}
                        <p className="mt-1 text-[11px] text-forest/50">Za SMS obvestilo GLS kurirja.</p>
                      </div>
                    </div>

                    {/* Ulica in hišna številka */}
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                        htmlFor="shipping-street"
                      >
                        Ulica in hišna številka *
                      </label>
                      <input
                        id="shipping-street"
                        type="text"
                        value={formData.line1}
                        onChange={(e) => handleFieldChange("line1", e.target.value)}
                        placeholder="npr. Slovenska cesta 15"
                        className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                          formErrors.line1
                            ? "border-red-500 bg-red-50/20"
                            : "border-forest/20 focus:border-forest"
                        }`}
                        autoComplete="address-line1"
                        required
                      />
                      {formErrors.line1 && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.line1}</p>
                      )}
                      <p className="mt-1 text-[11px] text-forest/50">
                        Vključite številko stavbe (npr. Dunajska 15).
                      </p>
                    </div>

                    {/* Dodatek k naslovu (stanovanje, nadstropje) */}
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider text-forest/60"
                        htmlFor="shipping-line2"
                      >
                        Stanovanje, nadstropje, vhod (neobvezno)
                      </label>
                      <input
                        id="shipping-line2"
                        type="text"
                        value={formData.line2}
                        onChange={(e) => handleFieldChange("line2", e.target.value)}
                        placeholder="npr. Stanovanje 4, 2. nadstropje"
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-forest/20 px-3.5 text-sm font-medium text-forest outline-none focus:border-forest transition-colors"
                        autoComplete="address-line2"
                      />
                    </div>

                    {/* Poštna številka in Kraj */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                          htmlFor="shipping-postal"
                        >
                          Poštna številka *
                        </label>
                        <input
                          id="shipping-postal"
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                          placeholder="npr. 1000"
                          maxLength={4}
                          className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                            formErrors.postalCode
                              ? "border-red-500 bg-red-50/20"
                              : "border-forest/20 focus:border-forest"
                          }`}
                          autoComplete="postal-code"
                          required
                        />
                        {formErrors.postalCode && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.postalCode}</p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block text-xs font-bold uppercase tracking-wider text-forest/75"
                          htmlFor="shipping-city"
                        >
                          Kraj / Mesto *
                        </label>
                        <input
                          id="shipping-city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleFieldChange("city", e.target.value)}
                          placeholder="npr. Ljubljana"
                          className={`mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-forest outline-none transition-colors ${
                            formErrors.city
                              ? "border-red-500 bg-red-50/20"
                              : "border-forest/20 focus:border-forest"
                          }`}
                          autoComplete="address-level2"
                          required
                        />
                        {formErrors.city && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>
                        )}
                      </div>
                    </div>

                    {/* Opombe za dostavo */}
                    <div>
                      <label
                        className="block text-xs font-bold uppercase tracking-wider text-forest/60"
                        htmlFor="shipping-notes"
                      >
                        Opombe za dostavljalca (neobvezno)
                      </label>
                      <input
                        id="shipping-notes"
                        type="text"
                        value={formData.notes}
                        onChange={(e) => handleFieldChange("notes", e.target.value)}
                        placeholder="npr. Pozvonite pri spodnjem vhodu ali pustite pri sosedu"
                        className="mt-1.5 min-h-11 w-full rounded-xl border border-forest/20 px-3.5 text-sm font-medium text-forest outline-none focus:border-forest transition-colors"
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* DESNI STOLPEC: Način plačila, Koda za popust, Povzetek in Zaključek */}
              <div className="space-y-6">
                {/* 2. IZBIRA NAČINA PLAČILA */}
                <div className="border border-forest/10 bg-white p-5 sm:p-7 rounded-2xl shadow-sm">
                  <h2 className="font-display text-2xl font-semibold text-forest flex items-center gap-2 border-b border-forest/10 pb-4">
                    <Banknote size={22} className="text-gold" />
                    <span>2. Način plačila</span>
                  </h2>

                  <div className="mt-5 space-y-3">
                    {/* Možnost 1: Plačilo ob prevzemu (COD) */}
                    <label
                      className={`relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all ${
                        formData.paymentMethod === "cod"
                          ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                          : "border-forest/15 hover:border-forest/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={() => handleFieldChange("paymentMethod", "cod")}
                        className="mt-1 text-gold focus:ring-gold"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-forest text-sm sm:text-base">
                            Plačilo ob prevzemu
                          </span>
                          <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                            Najbolj priljubljeno v Sloveniji
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-forest/75 leading-relaxed">
                          Paket plačate kurirju GLS ob prevzemu z <strong>gotovino</strong> ali{" "}
                          <strong>plačilno kartico</strong> (POS terminal). 100% varno, brez tveganja.
                        </p>
                      </div>
                    </label>

                    {/* Možnost 2: Plačilo po predračunu (UPN) */}
                    <label
                      className={`relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all ${
                        formData.paymentMethod === "proforma"
                          ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                          : "border-forest/15 hover:border-forest/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="proforma"
                        checked={formData.paymentMethod === "proforma"}
                        onChange={() => handleFieldChange("paymentMethod", "proforma")}
                        className="mt-1 text-gold focus:ring-gold"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-forest text-sm sm:text-base">
                            Plačilo po predračunu (UPN nalog)
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-forest/75 leading-relaxed">
                          Podatke za nakazilo prek vaše spletne banke prejmete na e-pošto takoj po oddaji naročila.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. POVZETEK IN KODA ZA POPUST */}
                <div className="bg-forest p-6 sm:p-7 text-porcelain rounded-2xl shadow-md">
                  <h2 className="font-display text-2xl font-semibold">Povzetek naročila</h2>

                  <dl className="mt-5 space-y-3.5 text-sm">
                    <div className="flex justify-between text-porcelain/85">
                      <dt>{t("Vmesni seštevek")}</dt>
                      <dd className="font-semibold">{formatPrice(totals.subtotalCents)}</dd>
                    </div>

                    {referralCode && (
                      <div className="border-y border-white/15 py-3 text-porcelain/90">
                        <div className="flex justify-between gap-4 items-center">
                          <dt className="flex items-center gap-1.5">
                            <span>{t("Popust")}</span>
                            <span className="rounded bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold">
                              {referralCode}
                            </span>
                          </dt>
                          <dd className="font-bold text-gold">
                            {referralDiscountCents > 0
                              ? `-${formatPrice(referralDiscountCents)}`
                              : referralPreview.status === "loading"
                                ? t("Preverjanje ...")
                                : "0,00 €"}
                          </dd>
                        </div>
                        {referralPreview.data?.active && (
                          <p className="mt-1 text-xs text-gold/80">
                            {referralPreview.data.customerDiscountPercent}% popusta upoštevano!
                          </p>
                        )}
                        {!referralPreview.data?.active && referralPreview.data?.message && (
                          <p className="mt-1 text-xs text-porcelain/60">
                            {t(referralPreview.data.message)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between text-porcelain/85">
                      <dt className="flex items-center gap-1.5">
                        <Truck size={15} className="text-gold" />
                        <span>Dostava (GLS Slovenija)</span>
                      </dt>
                      <dd className="font-semibold">
                        {totals.shippingCents === 0 ? (
                          <span className="text-gold">Brezplačna dostava</span>
                        ) : (
                          formatPrice(totals.shippingCents)
                        )}
                      </dd>
                    </div>

                    {totals.subtotalCents < 5000 && (
                      <p className="text-[11px] text-porcelain/65">
                        💡 Naročite še za {formatPrice(5000 - totals.subtotalCents)} in prejmete{" "}
                        <strong className="text-gold">brezplačno dostavo</strong>!
                      </p>
                    )}

                    <div className="flex justify-between border-t border-white/15 pt-4 text-base font-bold">
                      <dt>Skupaj za plačilo</dt>
                      <dd className="text-xl text-gold font-display">
                        {formatPrice(estimatedTotalCents)}
                      </dd>
                    </div>
                  </dl>

                  {/* Vnos kode za popust */}
                  <form className="mt-6 border-t border-white/10 pt-5" onSubmit={applyPromoCode}>
                    <label
                      className="text-xs font-bold uppercase tracking-wider text-porcelain/70"
                      htmlFor="cart-promo-code"
                    >
                      {t("Koda za popust")}
                    </label>
                    <div className="mt-2 flex rounded-xl border border-white/20 bg-white/10 overflow-hidden focus-within:border-gold">
                      <input
                        id="cart-promo-code"
                        type="text"
                        value={promoCodeInput}
                        onChange={(event) => setPromoCodeInput(event.target.value)}
                        placeholder="npr. ANA10"
                        className="min-h-11 w-full bg-transparent px-3 text-sm font-bold uppercase text-porcelain outline-none placeholder:text-porcelain/35"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <button
                        type="submit"
                        className="min-h-11 shrink-0 bg-gold px-4 text-xs font-bold text-ink hover:bg-gold/90 transition-colors"
                      >
                        {t("Uporabi")}
                      </button>
                    </div>
                    {referralCode && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-gold/80 hover:text-gold underline"
                        onClick={() => {
                          clearReferralCode();
                          setReferralCode("");
                          setPromoCodeInput("");
                          setReferralPreview({ status: "idle", data: null });
                        }}
                      >
                        {t("Odstrani kodo")}
                      </button>
                    )}
                  </form>

                  {/* GUMB ZA ODDAJO NAROČILA */}
                  <button
                    type="button"
                    disabled={status === "loading"}
                    onClick={handleSubmitOrder}
                    className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 text-sm sm:text-base font-bold text-ink shadow-md hover:bg-gold/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <LoaderCircle className="animate-spin" size={20} />
                        <span>Oddajanje naročila ...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck size={20} />
                        <span>
                          {formData.paymentMethod === "cod"
                            ? `Oddaj naročilo s plačilom ob prevzemu (${formatPrice(estimatedTotalCents)})`
                            : `Potrdi naročilo po predračunu (${formatPrice(estimatedTotalCents)})`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Napaka */}
                  {errorMessage && (
                    <div className="mt-4 rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-200 text-center">
                      {errorMessage}
                    </div>
                  )}

                  {/* Pravna opomba */}
                  <p className="mt-4 text-center text-[11px] leading-relaxed text-porcelain/60">
                    Z oddajo naročila se strinjate s{" "}
                    <Link className="underline hover:text-gold" to="/terms">
                      pogoji poslovanja
                    </Link>
                    {", "}
                    <Link className="underline hover:text-gold" to="/privacy">
                      politiko zasebnosti
                    </Link>{" "}
                    in{" "}
                    <Link className="underline hover:text-gold" to="/shipping-and-returns">
                      informacijami o vračilih
                    </Link>
                    .
                  </p>
                </div>

                {/* Zaupanje in ugodnosti */}
                <div className="grid grid-cols-2 gap-3 text-xs text-forest/80">
                  <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-forest/10">
                    <Truck size={18} className="text-gold shrink-0" />
                    <span>Dostava 1–3 delovne dni</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-forest/10">
                    <ShieldCheck size={18} className="text-gold shrink-0" />
                    <span>100% naravno slovensko</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-forest/10">
                    <CheckCircle2 size={18} className="text-gold shrink-0" />
                    <span>Plačilo ob izročitvi</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-forest/10">
                    <FileText size={18} className="text-gold shrink-0" />
                    <span>14 dni za vračilo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
