import {
  CheckCircle2,
  ChevronDown,
  Download,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  downloadAdminGlsLabel,
  getAdminOrders,
  updateAdminOrderStatus,
} from "../services/api.js";

const TOKEN_STORAGE_KEY = "hempaura_admin_dashboard_token";

const statusLabels = {
  paid: "Plačano",
  unpaid: "Neplačano",
  no_payment_required: "Brez plačila",
  unfulfilled: "Neobdelano",
  processing: "V pripravi",
  fulfilled: "Odposlano",
  cancelled: "Preklicano",
  label_created: "Nalepka pripravljena",
  failed: "Napaka",
  sent: "Poslano",
};

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800",
  fulfilled: "bg-emerald-100 text-emerald-800",
  label_created: "bg-emerald-100 text-emerald-800",
  sent: "bg-emerald-100 text-emerald-800",
  processing: "bg-amber-100 text-amber-800",
  unfulfilled: "bg-stone-100 text-stone-700",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  unpaid: "bg-red-100 text-red-800",
};

function relation(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        statusStyles[value] || "bg-stone-100 text-stone-700"
      }`}
    >
      {statusLabels[value] || value || "—"}
    </span>
  );
}

function formatMoney(cents, currency = "EUR") {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: String(currency || "EUR").toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("sl-SI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAddress(address) {
  if (!address) return "Naslov ni shranjen";
  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  const city = [address.postal_code, address.city].filter(Boolean).join(" ");
  return [street, city, address.country].filter(Boolean).join(" · ");
}

function AdminLogin({ onLogin, error, loading }) {
  const [value, setValue] = useState("");

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 py-12">
      <section className="w-full max-w-md border border-forest/10 bg-white p-7 shadow-soft sm:p-10">
        <div className="grid size-12 place-items-center rounded-full bg-forest text-gold">
          <LockKeyhole size={22} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-clay">
          Zasebni dostop
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-forest">
          HerbaGallus upravljanje
        </h1>
        <p className="mt-3 text-sm leading-6 text-forest/65">
          Vnesi administratorski ključ za pregled naročil, e-pošte in GLS nalepk.
        </p>
        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(value.trim());
          }}
        >
          <label className="text-xs font-bold uppercase tracking-wide text-forest" htmlFor="admin-token">
            Administratorski ključ
          </label>
          <input
            id="admin-token"
            type="password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="current-password"
            className="mt-2 min-h-12 w-full border border-forest/20 bg-porcelain px-4 text-sm outline-none focus:border-gold"
            required
            minLength={32}
          />
          {error && <p className="mt-3 text-sm font-semibold text-clay">{error}</p>}
          <button
            type="submit"
            disabled={loading || value.trim().length < 32}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-forest px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading && <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />}
            Odpri nadzorno ploščo
          </button>
        </form>
      </section>
    </main>
  );
}

export default function AdminOrdersPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const initialToken = useRef(token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("open");
  const [expandedOrder, setExpandedOrder] = useState("");
  const [activeAction, setActiveAction] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Naročila | HerbaGallus Admin";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow, noarchive";
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  const loadOrders = useCallback(async (adminToken) => {
    if (!adminToken) return;
    setLoading(true);
    setError("");
    try {
      const payload = await getAdminOrders(adminToken);
      setOrders(payload.orders || []);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, adminToken);
      setToken(adminToken);
    } catch (loadError) {
      setError(loadError.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialToken.current) loadOrders(initialToken.current);
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery =
        !normalized ||
        [order.public_order_number, order.customer_name, order.customer_email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && order.fulfillment_status !== "fulfilled" && order.fulfillment_status !== "cancelled") ||
        (filter === "fulfilled" && order.fulfillment_status === "fulfilled") ||
        (filter === "attention" &&
          (order.payment_status !== "paid" ||
            relation(order.gls_shipments).some((shipment) => shipment.status === "failed") ||
            relation(order.order_email_deliveries).some((email) => email.status === "failed")));
      return matchesQuery && matchesFilter;
    });
  }, [filter, orders, query]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      open: orders.filter((order) => !["fulfilled", "cancelled"].includes(order.fulfillment_status)).length,
      paid: orders.filter((order) => order.payment_status === "paid").length,
      attention: orders.filter(
        (order) =>
          relation(order.gls_shipments).some((shipment) => shipment.status === "failed") ||
          relation(order.order_email_deliveries).some((email) => email.status === "failed")
      ).length,
    }),
    [orders]
  );

  async function changeStatus(orderNumber, fulfillmentStatus) {
    setActiveAction(`${orderNumber}:status`);
    setError("");
    try {
      await updateAdminOrderStatus(token, orderNumber, fulfillmentStatus);
      await loadOrders(token);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActiveAction("");
    }
  }

  async function createLabel(order) {
    const shipment = relation(order.gls_shipments)[0];
    setActiveAction(`${order.public_order_number}:label`);
    setError("");
    try {
      await downloadAdminGlsLabel(
        token,
        order.public_order_number,
        shipment?.status === "failed"
      );
      await loadOrders(token);
    } catch (actionError) {
      setError(`${order.public_order_number}: ${actionError.message}`);
    } finally {
      setActiveAction("");
    }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setOrders([]);
    setError("");
  }

  if (!token || (!orders.length && error && !loading)) {
    return <AdminLogin onLogin={loadOrders} error={error} loading={loading} />;
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Zasebna nadzorna plošča</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-forest">HerbaGallus naročila</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadOrders(token)}
              disabled={loading}
              className="grid size-11 place-items-center border border-forest/15 text-forest hover:bg-sage disabled:opacity-50"
              aria-label="Osveži naročila"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 items-center gap-2 border border-forest/15 px-4 text-sm font-bold text-forest hover:bg-sage"
            >
              <LogOut size={17} aria-hidden="true" />
              <span className="hidden sm:inline">Odjava</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-10">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Povzetek naročil">
          {[
            ["Vseh prikazanih", stats.total],
            ["Odprtih", stats.open],
            ["Plačanih", stats.paid],
            ["Potrebuje pozornost", stats.attention],
          ].map(([label, value]) => (
            <div key={label} className="border border-forest/10 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-forest/55">{label}</p>
              <p className="mt-2 font-display text-4xl font-semibold text-forest">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 border border-forest/10 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-h-11 w-full items-center gap-3 border border-forest/15 bg-porcelain px-4 lg:max-w-md">
              <Search size={17} className="text-forest/55" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Poišči številko, ime ali e-pošto"
                className="w-full bg-transparent text-sm outline-none placeholder:text-forest/40"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["open", "Odprta"],
                ["attention", "Pozornost"],
                ["fulfilled", "Odposlana"],
                ["all", "Vsa"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`min-h-10 px-4 text-xs font-bold ${
                    filter === value ? "bg-forest text-white" : "bg-sage/60 text-forest hover:bg-sage"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 border border-clay/30 bg-clay/10 p-4 text-sm font-semibold text-clay" role="alert">
            {error}
          </div>
        )}

        <section className="mt-5 space-y-3" aria-label="Naročila">
          {visibleOrders.map((order) => {
            const items = relation(order.order_items);
            const shipment = relation(order.gls_shipments)[0];
            const emails = relation(order.order_email_deliveries);
            const deliveryAddress = order.shipping_address_json || order.billing_address_json;
            const expanded = expandedOrder === order.id;
            const actionLoading = activeAction.startsWith(order.public_order_number);

            return (
              <article key={order.id} className="border border-forest/10 bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedOrder(expanded ? "" : order.id)}
                  className="grid w-full gap-4 p-5 text-left sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center sm:p-6"
                  aria-expanded={expanded}
                >
                  <div>
                    <p className="font-display text-xl font-semibold text-forest">{order.public_order_number}</p>
                    <p className="mt-1 text-xs text-forest/55">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-forest">{order.customer_name || "Brez imena"}</p>
                    <p className="mt-1 truncate text-xs text-forest/55">{order.customer_email || "Brez e-pošte"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={order.payment_status} />
                    <StatusBadge value={order.fulfillment_status} />
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-base font-bold text-forest">{formatMoney(order.total_cents, order.currency)}</p>
                    <ChevronDown
                      size={18}
                      className={`text-forest/55 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-forest/10 bg-porcelain/60 p-5 sm:p-6">
                    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr_1fr]">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wide text-forest/55">Izdelki</h2>
                        <div className="mt-3 space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 border-b border-forest/10 pb-2 text-sm">
                              <span>{item.quantity} × {item.name_snapshot}</span>
                              <span className="shrink-0 font-semibold">{formatMoney(item.line_total_cents, order.currency)}</span>
                            </div>
                          ))}
                        </div>
                        <dl className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between"><dt>Vmesni znesek</dt><dd>{formatMoney(order.subtotal_cents, order.currency)}</dd></div>
                          {order.discount_cents > 0 && <div className="flex justify-between text-emerald-700"><dt>Popust {order.promotion_code ? `(${order.promotion_code})` : ""}</dt><dd>-{formatMoney(order.discount_cents, order.currency)}</dd></div>}
                          <div className="flex justify-between"><dt>Dostava</dt><dd>{formatMoney(order.shipping_cents, order.currency)}</dd></div>
                          <div className="flex justify-between border-t border-forest/10 pt-2 font-bold"><dt>Skupaj</dt><dd>{formatMoney(order.total_cents, order.currency)}</dd></div>
                        </dl>
                      </div>

                      <div>
                        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-forest/55"><MapPin size={15} /> Dostava</h2>
                        <p className="mt-3 text-sm leading-6 text-forest/75">{formatAddress(deliveryAddress)}</p>
                        <h2 className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-forest/55"><Mail size={15} /> E-pošta</h2>
                        <div className="mt-3 space-y-2">
                          {emails.length ? emails.map((email) => (
                            <div key={email.id} className="flex items-center justify-between gap-3 text-xs">
                              <span>{email.kind === "customer_confirmation" ? "Potrdilo kupcu" : "Obvestilo trgovini"}</span>
                              <StatusBadge value={email.status} />
                            </div>
                          )) : <p className="text-sm text-forest/55">Ni podatkov o pošiljanju.</p>}
                        </div>
                      </div>

                      <div>
                        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-forest/55"><Truck size={15} /> GLS dostava</h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {shipment ? <StatusBadge value={shipment.status} /> : <span className="text-sm text-forest/55">Nalepka še ni ustvarjena</span>}
                          {shipment?.parcel_number && <span className="text-xs font-semibold text-forest/65">#{shipment.parcel_number}</span>}
                        </div>
                        {shipment?.error_message && <p className="mt-2 text-xs leading-5 text-clay">{shipment.error_message}</p>}
                        <div className="mt-5 grid gap-2">
                          <button
                            type="button"
                            onClick={() => createLabel(order)}
                            disabled={order.payment_status !== "paid" || actionLoading}
                            className="inline-flex min-h-11 items-center justify-center gap-2 bg-forest px-4 text-xs font-bold text-white disabled:opacity-45"
                          >
                            {activeAction === `${order.public_order_number}:label` ? <LoaderCircle className="animate-spin" size={16} /> : <Download size={16} />}
                            {shipment?.status === "failed" ? "Ponovi GLS nalepko" : shipment?.status === "label_created" ? "Prenesi GLS nalepko" : "Ustvari GLS nalepko"}
                          </button>
                          {order.fulfillment_status !== "processing" && order.fulfillment_status !== "fulfilled" && (
                            <button
                              type="button"
                              onClick={() => changeStatus(order.public_order_number, "processing")}
                              disabled={actionLoading}
                              className="inline-flex min-h-11 items-center justify-center gap-2 border border-forest/20 px-4 text-xs font-bold text-forest disabled:opacity-45"
                            >
                              <PackageCheck size={16} /> Označi: v pripravi
                            </button>
                          )}
                          {order.fulfillment_status !== "fulfilled" && (
                            <button
                              type="button"
                              onClick={() => changeStatus(order.public_order_number, "fulfilled")}
                              disabled={actionLoading}
                              className="inline-flex min-h-11 items-center justify-center gap-2 border border-forest/20 px-4 text-xs font-bold text-forest disabled:opacity-45"
                            >
                              <CheckCircle2 size={16} /> Označi: odposlano
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!loading && !visibleOrders.length && (
            <div className="grid min-h-52 place-items-center border border-forest/10 bg-white p-8 text-center">
              <div>
                <p className="font-display text-2xl font-semibold text-forest">Ni najdenih naročil</p>
                <p className="mt-2 text-sm text-forest/55">Spremeni iskanje ali izbrani filter.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
