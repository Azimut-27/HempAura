import { ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductMedia from "../components/ProductMedia.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import Seo from "../components/Seo.jsx";
import { siteConfig } from "../config/siteConfig.js";
import { useCart } from "../context/CartContext.jsx";
import { getProductById } from "../data/products.js";
import { formatPrice } from "../lib/formatters.js";
import { createCheckoutSession } from "../services/api.js";

export default function CartPage() {
  const { items, setQuantity, removeItem, clearCart, totals } = useCart();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [legalConsent, setLegalConsent] = useState(false);
  const navigate = useNavigate();

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
      const result = await createCheckoutSession(items);
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
        description="Preglej izdelke v košarici HempAura in nadaljuj na varno gostovano plačilo, ko bo prodaja omogočena."
        path="/cart"
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl font-semibold text-forest sm:text-6xl">
            Košarica
          </h1>
          {items.length === 0 ? (
            <div className="mt-10 grid min-h-80 place-items-center border border-forest/10 bg-white p-8 text-center">
              <div>
                <ShoppingBag className="mx-auto text-gold" size={40} aria-hidden="true" />
                <h2 className="mt-5 font-display text-3xl font-semibold text-forest">
                  Košarica je prazna
                </h2>
                <p className="mt-3 text-sm text-forest/65">
                  Oglej si kolekcijo in preveri stanje posameznega izdelka.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex min-h-12 items-center bg-forest px-6 text-sm font-bold text-porcelain"
                >
                  Odpri izdelke
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
                        aria-label={`Odstrani ${product.name}`}
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
                    Izprazni košarico
                  </button>
                </div>
              </div>
              <aside className="h-fit bg-forest p-6 text-porcelain">
                <h2 className="font-display text-3xl font-semibold">Povzetek</h2>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <dt>Vmesni seštevek</dt>
                    <dd>{formatPrice(totals.subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between text-porcelain/70">
                    <dt>Dostava</dt>
                    <dd>
                      {Number.isInteger(totals.shippingCents)
                        ? formatPrice(totals.shippingCents)
                        : "Izračun pred plačilom"}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-white/15 pt-4 text-base font-bold">
                    <dt>Ocenjeno skupaj</dt>
                    <dd>
                      {Number.isInteger(totals.shippingCents)
                        ? formatPrice(totals.totalCents)
                        : formatPrice(totals.subtotalCents)}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={status === "loading"}
                  onClick={checkout}
                  className="mt-7 min-h-12 w-full bg-gold px-5 text-sm font-bold text-ink disabled:opacity-60"
                >
                  {status === "loading"
                    ? "Odpiranje varnega plačila ..."
                    : siteConfig.paymentsEnabled
                      ? "Nadaljuj na plačilo"
                      : "Prodaja se odpre kmalu"}
                </button>
                <label className="mt-5 flex gap-3 text-sm leading-6 text-porcelain/76">
                  <input
                    type="checkbox"
                    checked={legalConsent}
                    onChange={(event) => setLegalConsent(event.target.checked)}
                    className="mt-1 size-5 shrink-0 accent-gold"
                  />
                  <span>
                    Strinjam se s <Link className="underline" to="/terms">pogoji poslovanja</Link>,
                    prebral/-a sem <Link className="underline" to="/privacy">politiko zasebnosti</Link>
                    {" "}in <Link className="underline" to="/shipping-and-returns">informacije o vračilih</Link>.
                  </span>
                </label>
                <p className="mt-4 min-h-6 text-sm text-porcelain/80" aria-live="polite">
                  {message}
                </p>
                {status === "error" && (
                  <button
                    type="button"
                    className="text-sm font-bold text-gold underline"
                    onClick={() => navigate("/contact")}
                  >
                    Kontaktiraj podporo
                  </button>
                )}
                <p className="mt-4 text-xs leading-6 text-porcelain/60">
                  Končni znesek se vedno ponovno izračuna na strežniku. Podatki o
                  kartici se v tej aplikaciji ne shranjujejo.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
