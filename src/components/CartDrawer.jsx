import { ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getProductById } from "../data/products.js";
import { formatPrice } from "../lib/formatters.js";

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, removeItem, totals } = useCart();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("button")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDrawer();
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-ink/45" onMouseDown={closeDrawer}>
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Košarica"
        className="ml-auto flex h-full w-[min(92vw,430px)] flex-col bg-porcelain shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-forest/10 p-5">
          <h2 className="font-display text-3xl font-semibold text-forest">Košarica</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="grid size-12 place-items-center text-forest hover:bg-sage"
            aria-label="Zapri košarico"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto text-gold" size={34} aria-hidden="true" />
                <p className="mt-4 font-semibold text-forest">Košarica je prazna.</p>
                <p className="mt-2 text-sm text-forest/65">
                  Izdelki bodo na voljo, ko bodo potrjeni vsi prodajni podatki.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-forest/10">
              {items.map((item) => {
                const product = getProductById(item.productId);
                return (
                  <li key={item.productId} className="flex gap-4 py-5">
                    <div className="grid size-20 shrink-0 place-items-center bg-sage text-xs font-bold text-forest">
                      {product?.cbdPercentage ? `${product.cbdPercentage} %` : "HA"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-forest">{product?.name}</p>
                      <p className="mt-1 text-sm text-forest/65">
                        {item.quantity} × {formatPrice(product?.priceCents)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="grid size-10 place-items-center text-clay hover:bg-clay/10"
                      aria-label={`Odstrani ${product?.name}`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-forest/10 p-5">
          <div className="flex justify-between font-semibold text-forest">
            <span>Vmesni seštevek</span>
            <span>{formatPrice(totals.subtotalCents)}</span>
          </div>
          <Link
            to="/cart"
            onClick={closeDrawer}
            className="mt-5 flex min-h-12 items-center justify-center bg-forest px-5 text-sm font-bold text-porcelain"
          >
            Odpri košarico
          </Link>
        </div>
      </aside>
    </div>
  );
}
