import { ShoppingBag, Trash2 } from "lucide-react";
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
import { createCheckoutSession, getReferralPreview } from "../services/api.js";

export default function CartPage() {
  const { items, setQuantity, removeItem, clearCart, totals } = useCart();
  const { language, t } = useLanguage();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [legalConsent, setLegalConsent] = useState(false);
  const [referralCode, setReferralCode] = useState(() => getStoredReferralCode());
  const [promoCodeInput, setPromoCodeInput] = useState(referralCode);
  const [referralPreview, setReferralPreview] = useState({
    status: referralCode ? "loading" : "idle",
    data: null,
  });
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
              message: "Kodo za popust bomo preverili v varnem plačilnem koraku.",
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
      setMessage("");
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
    setMessage("");
  }

  async function checkout() {
    if (!siteConfig.paymentsEnabled) {
      setMessage("Prodaja še ni odprta. Plačilo ni bilo izvedeno.");
      return;
    }
    if (!legalConsent) {
      setMessage("Pred nadaljevanjem potrdi pogoje, zasebnost in informacije o vračilih.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const result = await createCheckoutSession(items, referralCode, language);
      window.location.assign(result.url);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <>
      <Seo
        title="Košarica"
        description="Preglej izdelke v košarici HerbaGallus in nadaljuj na varno gostovano plačilo, ko bo prodaja omogočena."
        path="/cart"
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl font-semibold text-forest sm:text-6xl">
            {t("Košarica")}
          </h1>
          {items.length === 0 ? (
            <div className="mt-10 grid min-h-80 place-items-center border border-forest/10 bg-white p-8 text-center">
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
                  className="mt-6 inline-flex min-h-12 items-center bg-forest px-6 text-sm font-bold text-porcelain"
                >
                  {t("Odpri izdelke")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="bg-white">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  return (
                    <article
                      key={item.productId}
                      className="grid gap-5 border-b border-forest/10 p-5 sm:grid-cols-[130px_1fr_auto]"
                    >
                      <div className="aspect-square overflow-hidden">
                        <ProductMedia product={product} />
                      </div>
                      <div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="font-display text-2xl font-semibold text-forest"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-2 text-sm text-forest/60">
                          {formatPrice(product.priceCents)}
                        </p>
                        <div className="mt-4">
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
                        className="grid size-11 place-items-center text-clay hover:bg-clay/10"
                        aria-label={`${t("Odstrani")} ${t(product.name)}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
                <div className="p-5">
                  <button
                    type="button"
                    className="text-sm font-bold text-clay underline"
                    onClick={clearCart}
                  >
                    {t("Izprazni košarico")}
                  </button>
                </div>
              </div>
              <aside className="h-fit bg-forest p-6 text-porcelain">
                <h2 className="font-display text-3xl font-semibold">{t("Povzetek")}</h2>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <dt>{t("Vmesni seštevek")}</dt>
                    <dd>{formatPrice(totals.subtotalCents)}</dd>
                  </div>
                  {referralCode && (
                    <div className="border-y border-white/15 py-3">
                      <div className="flex justify-between gap-4">
                        <dt>
                          {t("Popust")}
                          <span className="ml-2 rounded-sm bg-gold/20 px-2 py-1 text-xs font-bold text-gold">
                            {referralCode}
                          </span>
                        </dt>
                        <dd>
                          {referralDiscountCents > 0
                            ? `-${formatPrice(referralDiscountCents)}`
                            : referralPreview.status === "loading"
                              ? t("Preverjanje ...")
                              : t("Preverjanje v Stripe")}
                        </dd>
                      </div>
                      {referralPreview.data?.active && (
                        <p className="mt-2 text-xs leading-5 text-porcelain/60">
                          {referralPreview.data.customerDiscountPercent}%{" "}
                          {t("popusta bo ponovno potrjeno v varnem plačilu.")}
                        </p>
                      )}
                      {!referralPreview.data?.active && referralPreview.data?.message && (
                        <p className="mt-2 text-xs leading-5 text-porcelain/60">
                          {t(referralPreview.data.message)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between text-porcelain/70">
                    <dt>{t("Dostava")}</dt>
                    <dd>
                      {Number.isInteger(totals.shippingCents)
                        ? formatPrice(totals.shippingCents)
                        : t("Izračun pred plačilom")}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-white/15 pt-4 text-base font-bold">
                    <dt>{t("Ocenjeno skupaj")}</dt>
                    <dd>
                      {Number.isInteger(totals.shippingCents)
                        ? formatPrice(estimatedTotalCents)
                        : formatPrice(totals.subtotalCents)}
                    </dd>
                  </div>
                </dl>
                <form className="mt-5" onSubmit={applyPromoCode}>
                  <label
                    className="text-xs font-bold uppercase text-porcelain/60"
                    htmlFor="cart-promo-code"
                  >
                    {t("Koda za popust")}
                  </label>
                  <div className="mt-2 flex border border-white/20 bg-white/5 focus-within:border-gold">
                    <input
                      id="cart-promo-code"
                      type="text"
                      value={promoCodeInput}
                      onChange={(event) => setPromoCodeInput(event.target.value)}
                      placeholder="ANA10"
                      className="min-h-11 w-full bg-transparent px-3 text-sm font-bold uppercase text-porcelain outline-none placeholder:text-porcelain/35"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <button
                      type="submit"
                      className="min-h-11 shrink-0 bg-porcelain px-4 text-xs font-bold text-forest hover:bg-gold"
                    >
                      {t("Uporabi")}
                    </button>
                  </div>
                  {referralCode && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-bold text-gold underline"
                      onClick={() => {
                        clearReferralCode();
                        setReferralCode("");
                        setPromoCodeInput("");
                        setReferralPreview({ status: "idle", data: null });
                        setMessage("");
                      }}
                    >
                      {t("Odstrani kodo")}
                    </button>
                  )}
                  {!referralCode && referralPreview.data?.message && (
                    <p className="mt-2 text-xs leading-5 text-porcelain/60">
                      {t(referralPreview.data.message)}
                    </p>
                  )}
                </form>
                <button
                  type="button"
                  disabled={status === "loading"}
                  onClick={checkout}
                  className="mt-7 min-h-12 w-full bg-gold px-5 text-sm font-bold text-ink disabled:opacity-60"
                >
                  {status === "loading"
                    ? t("Odpiranje varnega plačila ...")
                    : siteConfig.paymentsEnabled
                      ? t("Nadaljuj na plačilo")
                      : t("Prodaja se odpre kmalu")}
                </button>
                <label className="mt-5 flex gap-3 text-sm leading-6 text-porcelain/76">
                  <input
                    type="checkbox"
                    checked={legalConsent}
                    onChange={(event) => setLegalConsent(event.target.checked)}
                    className="mt-1 size-5 shrink-0 accent-gold"
                  />
                  <span>
                    {t("Strinjam se s")}{" "}
                    <Link className="underline" to="/terms">
                      {t("pogoji poslovanja")}
                    </Link>
                    , {t("prebral/-a sem")}{" "}
                    <Link className="underline" to="/privacy">
                      {t("politiko zasebnosti")}
                    </Link>{" "}
                    {t("in")}{" "}
                    <Link className="underline" to="/shipping-and-returns">
                      {t("informacije o vračilih")}
                    </Link>
                    .
                  </span>
                </label>
                <p className="mt-4 min-h-6 text-sm text-porcelain/80" aria-live="polite">
                  {t(message)}
                </p>
                {status === "error" && (
                  <button
                    type="button"
                    className="text-sm font-bold text-gold underline"
                    onClick={() => navigate("/contact")}
                  >
                    {t("Kontaktiraj podporo")}
                  </button>
                )}
                <p className="mt-4 text-xs leading-6 text-porcelain/60">
                  {t("Končni znesek se vedno ponovno izračuna na strežniku. Podatki o kartici se v tej aplikaciji ne shranjujejo.")}
                </p>
                <p className="mt-2 text-xs leading-6 text-porcelain/60">
                  {t("Kodo za popust lahko vneseš tudi v naslednjem varnem koraku.")}
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
