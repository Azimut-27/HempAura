import { useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function CartNotice() {
  const { notice, clearNotice } = useCart();

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(clearNotice, 3200);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 bg-ink px-5 py-3 text-sm font-semibold text-porcelain shadow-2xl transition ${
        notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      {notice}
    </div>
  );
}
