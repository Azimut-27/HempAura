import {
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  LoaderCircle,
  Mail,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const PARTNER_STATUS_META = {
  pending: {
    label: "Čaka na potrditev",
    badge: "border border-amber-300 bg-amber-100 text-amber-900",
    bar: "bg-amber-500",
  },
  active: {
    label: "Aktiven",
    badge: "border border-emerald-300 bg-emerald-100 text-emerald-800",
    bar: "bg-emerald-500",
  },
  paused: {
    label: "Pavziran",
    badge: "border border-slate-300 bg-slate-100 text-slate-700",
    bar: "bg-slate-400",
  },
  ended: {
    label: "Zaključen",
    badge: "border border-stone-300 bg-stone-200 text-stone-700",
    bar: "bg-stone-400",
  },
};

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

function parsePartnerNotes(rawNotes) {
  if (!rawNotes) return { structured: null, plain: "" };
  try {
    const parsed = JSON.parse(rawNotes);
    if (parsed && typeof parsed === "object" && (parsed.socialPlatform || parsed.handle || parsed.niche)) {
      return { structured: parsed, plain: "" };
    }
  } catch {
    // Plain text notes
  }
  return { structured: null, plain: String(rawNotes) };
}

function buildProfileUrl(platform, handle) {
  if (!handle) return "";
  const trimmed = handle.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, "");
  if (platform === "Instagram") return `https://instagram.com/${clean}`;
  if (platform === "TikTok") return `https://tiktok.com/@${clean}`;
  if (platform === "YouTube") return `https://youtube.com/@${clean}`;
  if (platform === "Facebook") return `https://facebook.com/${clean}`;
  return "";
}

export default function AdminPartnersTab({
  partners,
  orders,
  loading,
  activeAction,
  onCreatePartner,
  onUpdatePartner,
  onDeletePartner,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [editingRatesId, setEditingRatesId] = useState("");
  const [editDiscount, setEditDiscount] = useState("10");
  const [editCommission, setEditCommission] = useState("15");

  const [newPartner, setNewPartner] = useState({
    displayName: "",
    contactEmail: "",
    publicCode: "",
    customerDiscountPercent: "10",
    commissionRatePercent: "15",
    status: "active",
    notes: "",
  });

  // Compute live performance stats per promo code from orders
  const performanceByCode = useMemo(() => {
    const map = {};
    for (const order of orders || []) {
      const code = String(order.promotion_code || "").trim().toUpperCase();
      if (!code) continue;
      if (
        order.fulfillment_status === "cancelled" ||
        order.payment_status === "cancelled" ||
        order.payment_status === "refunded"
      ) {
        continue;
      }
      if (!map[code]) {
        map[code] = { orderCount: 0, qualifyingCents: 0, discountCents: 0 };
      }
      const subtotal = Number(order.subtotal_cents || 0);
      const discount = Number(order.discount_cents || 0);
      map[code].orderCount += 1;
      map[code].qualifyingCents += Math.max(0, subtotal - discount);
      map[code].discountCents += discount;
    }
    return map;
  }, [orders]);

  const stats = useMemo(() => {
    let pending = 0;
    let active = 0;
    let totalOrders = 0;
    let totalCommissionCents = 0;

    for (const p of partners || []) {
      if (p.status === "pending") pending += 1;
      if (p.status === "active") active += 1;
      const perf = performanceByCode[String(p.public_code || "").toUpperCase()];
      if (perf) {
        totalOrders += perf.orderCount;
        totalCommissionCents += Math.round(
          (perf.qualifyingCents * Number(p.commission_rate_bps || 0)) / 10_000
        );
      }
    }

    return {
      total: (partners || []).length,
      pending,
      active,
      totalOrders,
      totalCommissionCents,
    };
  }, [partners, performanceByCode]);

  const visiblePartners = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (partners || []).filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!term) return true;
      const haystack = [
        p.display_name,
        p.contact_email,
        p.public_code,
        p.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [partners, query, statusFilter]);

  function handleCopy(key, text) {
    navigator.clipboard?.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId((curr) => (curr === key ? "" : curr)), 1800);
  }

  function startEditRates(partner) {
    setEditingRatesId(partner.id);
    setEditDiscount(String(Number(partner.customer_discount_percent ?? 10)));
    setEditCommission(String(Number(partner.commission_rate_bps ?? 1500) / 100));
  }

  async function saveRates(partnerId) {
    const discountNum = Number(editDiscount);
    const commissionNum = Number(editCommission);
    if (
      !Number.isFinite(discountNum) ||
      discountNum < 0 ||
      discountNum > 100 ||
      !Number.isFinite(commissionNum) ||
      commissionNum < 0 ||
      commissionNum > 100
    ) {
      return;
    }
    const ok = await onUpdatePartner(partnerId, {
      customerDiscountPercent: discountNum,
      commissionRatePercent: commissionNum,
    });
    if (ok) setEditingRatesId("");
  }

  async function handleSubmitNewPartner(event) {
    event.preventDefault();
    const ok = await onCreatePartner({
      displayName: newPartner.displayName.trim(),
      contactEmail: newPartner.contactEmail.trim(),
      publicCode: newPartner.publicCode.trim().toUpperCase(),
      customerDiscountPercent: Number(newPartner.customerDiscountPercent) || 10,
      commissionRatePercent: Number(newPartner.commissionRatePercent) || 15,
      status: newPartner.status,
      notes: newPartner.notes.trim(),
    });
    if (ok) {
      setNewPartner({
        displayName: "",
        contactEmail: "",
        publicCode: "",
        customerDiscountPercent: "10",
        commissionRatePercent: "15",
        status: "active",
        notes: "",
      });
      setShowCreateForm(false);
    }
  }

  return (
    <div>
      {/* KPI Summary Cards */}
      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Povzetek partnerskega programa"
      >
        <div className="border border-forest/10 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-forest/55">
            Vsi partnerji
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-forest">
            {stats.total}
          </p>
        </div>
        <div className="border border-forest/10 border-l-4 border-l-amber-500 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Čakajoče prijave
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-forest">
            {stats.pending}
          </p>
        </div>
        <div className="border border-forest/10 border-l-4 border-l-emerald-500 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Aktivne kode
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-forest">
            {stats.active}
          </p>
        </div>
        <div className="border border-forest/10 border-l-4 border-l-[#8e6128] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8e6128]">
            Naročila / Ocenjena provizija
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-forest">
            {stats.totalOrders}{" "}
            <span className="text-lg font-normal text-forest/55">
              · {formatMoney(stats.totalCommissionCents)}
            </span>
          </p>
        </div>
      </section>

      {/* Search, Filter & Add Partner Toolbar */}
      <section className="mt-6 border border-forest/10 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-11 w-full items-center gap-3 border border-forest/15 bg-porcelain px-4 lg:max-w-md">
            <Search size={17} className="text-forest/45" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Išči po imenu, kodi, profilu, e-pošti..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {[
              ["all", "Vsi"],
              ["pending", `Čakajoči (${stats.pending})`],
              ["active", "Aktivni"],
              ["paused", "Pavzirani"],
              ["ended", "Zaključeni"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`min-h-10 px-3.5 text-xs font-bold transition-colors ${
                  statusFilter === value
                    ? "bg-forest text-white"
                    : "border border-forest/15 bg-porcelain text-forest hover:bg-sage"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="inline-flex min-h-10 items-center gap-1.5 bg-[#8e6128] px-4 text-xs font-bold text-white transition-colors hover:bg-[#754f20]"
            >
              <Plus size={15} />
              <span>Dodaj partnerja</span>
            </button>
          </div>
        </div>

        {/* Inline Add Partner Form */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmitNewPartner}
            className="mt-5 grid gap-3 border-t border-forest/10 pt-5 sm:grid-cols-2 lg:grid-cols-6"
          >
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                Ime partnerja *
              </label>
              <input
                type="text"
                required
                minLength={2}
                placeholder="npr. Marko Kovač"
                value={newPartner.displayName}
                onChange={(e) =>
                  setNewPartner((p) => ({ ...p, displayName: e.target.value }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                Promo koda *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={32}
                placeholder="MARKO10"
                value={newPartner.publicCode}
                onChange={(e) =>
                  setNewPartner((p) => ({
                    ...p,
                    publicCode: e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_-]/g, "")
                      .slice(0, 32),
                  }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 font-mono text-sm uppercase outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                E-pošta
              </label>
              <input
                type="email"
                placeholder="marko@primer.si"
                value={newPartner.contactEmail}
                onChange={(e) =>
                  setNewPartner((p) => ({ ...p, contactEmail: e.target.value }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                Popust kupca (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                value={newPartner.customerDiscountPercent}
                onChange={(e) =>
                  setNewPartner((p) => ({
                    ...p,
                    customerDiscountPercent: e.target.value,
                  }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                Provizija (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={newPartner.commissionRatePercent}
                onChange={(e) =>
                  setNewPartner((p) => ({
                    ...p,
                    commissionRatePercent: e.target.value,
                  }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-forest/65">
                Opombe (kanal, dogovor ...)
              </label>
              <input
                type="text"
                placeholder="npr. Instagram @marko, dogovor 10% popust / 15% provizija"
                value={newPartner.notes}
                onChange={(e) =>
                  setNewPartner((p) => ({ ...p, notes: e.target.value }))
                }
                className="mt-1 min-h-10 w-full border border-forest/20 bg-porcelain px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-end gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={activeAction === "partner:create"}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 bg-forest px-4 text-xs font-bold text-white hover:bg-forest/90 disabled:opacity-50"
              >
                {activeAction === "partner:create" ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                <span>Shrani in aktiviraj</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="min-h-10 border border-forest/20 px-3 text-xs font-bold text-forest hover:bg-sage"
              >
                Prekliči
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Partner List */}
      <section className="mt-5 space-y-4">
        {visiblePartners.map((partner) => {
          const meta = PARTNER_STATUS_META[partner.status] || PARTNER_STATUS_META.pending;
          const { structured, plain } = parsePartnerNotes(partner.notes);
          const profileUrl = structured
            ? buildProfileUrl(structured.socialPlatform, structured.handle)
            : "";
          const discountPct = Number(partner.customer_discount_percent ?? 0);
          const commissionPct = Number(partner.commission_rate_bps ?? 0) / 100;
          const perf = performanceByCode[String(partner.public_code || "").toUpperCase()] || {
            orderCount: 0,
            qualifyingCents: 0,
            discountCents: 0,
          };
          const estimatedCommissionCents = Math.round(
            (perf.qualifyingCents * Number(partner.commission_rate_bps || 0)) / 10_000
          );
          const isBusy = activeAction.startsWith(`partner:${partner.id}:`);
          const isEditingRates = editingRatesId === partner.id;
          const shareUrl = `https://herbagallus.com/?ref=${encodeURIComponent(
            partner.public_code
          )}`;

          const mailtoApproval = partner.contact_email
            ? `mailto:${encodeURIComponent(
                partner.contact_email
              )}?subject=${encodeURIComponent(
                `HerbaGallus partnerski program — tvoja koda ${partner.public_code} je aktivna!`
              )}&body=${encodeURIComponent(
                `Pozdravljen/-a ${partner.display_name},\n\ntvoja prijava v HerbaGallus partnerski program je bila odobrena!\n\nTvoja promocijska koda: ${partner.public_code}\nPopust za sledilce: ${discountPct} %\nTvoja provizija: ${commissionPct} %\n\nLep pozdrav,\nEkipa HerbaGallus`
              )}`
            : "";

          return (
            <article
              key={partner.id}
              className="relative overflow-hidden rounded-xl border border-forest/10 bg-white shadow-xs transition-all hover:border-forest/20"
            >
              <div className={`h-1 w-full ${meta.bar}`} />

              <div className="p-5 sm:p-6">
                {/* Top Row: Name, Status, Promo Code & Dates */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-forest/8 text-forest">
                        <Crown size={16} />
                      </span>
                      <h3 className="font-display text-2xl font-semibold text-forest">
                        {partner.display_name}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-forest/65">
                      {partner.contact_email && (
                        <a
                          href={`mailto:${partner.contact_email}`}
                          className="inline-flex items-center gap-1 font-medium text-forest underline decoration-forest/30 underline-offset-2 hover:text-clay"
                        >
                          <Mail size={13} />
                          <span>{partner.contact_email}</span>
                        </a>
                      )}
                      <span>Prijava: {formatDate(partner.created_at)}</span>
                    </div>
                  </div>

                  {/* Promo Code Box */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-porcelain px-3.5 py-2">
                      <Sparkles size={14} className="text-[#8e6128]" />
                      <span className="font-mono text-base font-extrabold tracking-wider text-forest">
                        {partner.public_code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`code:${partner.id}`, partner.public_code)}
                        className="ml-1 inline-flex items-center gap-1 rounded-md border border-forest/15 bg-white px-2 py-1 text-[11px] font-bold text-forest hover:bg-sage"
                        title="Kopiraj promo kodo"
                      >
                        {copiedId === `code:${partner.id}` ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span>Kopirano</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Koda</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(`link:${partner.id}`, shareUrl)}
                        className="inline-flex items-center gap-1 rounded-md border border-forest/15 bg-white px-2 py-1 text-[11px] font-bold text-forest hover:bg-sage"
                        title="Kopiraj povezavo za partnerja"
                      >
                        {copiedId === `link:${partner.id}` ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span>Link ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Structured Social Info + Rates & Live Stats */}
                <div className="mt-5 grid gap-4 border-t border-forest/10 pt-4 lg:grid-cols-[1.35fr_1fr]">
                  {/* Creator Details */}
                  <div className="space-y-2.5 text-sm">
                    {structured ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          {structured.socialPlatform && (
                            <span className="inline-flex rounded-full border border-forest/15 bg-porcelain px-2.5 py-0.5 text-xs font-bold text-forest">
                              {structured.socialPlatform}
                            </span>
                          )}
                          {structured.handle &&
                            (profileUrl ? (
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
                              >
                                <span>{structured.handle}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="inline-flex rounded-full border border-forest/15 bg-white px-2.5 py-0.5 text-xs font-semibold text-forest">
                                {structured.handle}
                              </span>
                            ))}
                          {structured.audienceSize && (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                              Občinstvo: {structured.audienceSize}
                            </span>
                          )}
                        </div>
                        {structured.niche && (
                          <p className="text-xs text-forest/75">
                            <strong className="text-forest">Niša:</strong>{" "}
                            {structured.niche}
                          </p>
                        )}
                        {structured.promotionPlan && (
                          <p className="rounded-lg border-l-2 border-gold bg-porcelain/70 px-3 py-2 text-xs leading-6 text-forest/80">
                            {structured.promotionPlan}
                          </p>
                        )}
                      </>
                    ) : plain ? (
                      <p className="rounded-lg border-l-2 border-gold bg-porcelain/70 px-3 py-2 text-xs leading-6 text-forest/80">
                        {plain}
                      </p>
                    ) : (
                      <p className="text-xs italic text-forest/45">
                        Brez dodatnih opomb.
                      </p>
                    )}
                  </div>

                  {/* Rates + Performance Box */}
                  <div className="rounded-xl border border-forest/10 bg-porcelain/55 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-forest/60">
                        Pogoji & Učinek kode
                      </p>
                      {!isEditingRates && (
                        <button
                          type="button"
                          onClick={() => startEditRates(partner)}
                          className="text-[11px] font-bold text-clay underline underline-offset-2 hover:text-forest"
                        >
                          Uredi %
                        </button>
                      )}
                    </div>

                    {isEditingRates ? (
                      <div className="mt-2.5 flex flex-wrap items-end gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-forest/70">
                            Popust (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            className="mt-1 h-8 w-20 border border-forest/20 bg-white px-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-forest/70">
                            Provizija (%)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.5"
                            value={editCommission}
                            onChange={(e) => setEditCommission(e.target.value)}
                            className="mt-1 h-8 w-20 border border-forest/20 bg-white px-2 text-xs font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => saveRates(partner.id)}
                          className="h-8 bg-forest px-3 text-xs font-bold text-white hover:bg-forest/90 disabled:opacity-50"
                        >
                          Shrani
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRatesId("")}
                          className="h-8 border border-forest/20 bg-white px-2.5 text-xs font-semibold text-forest"
                        >
                          Prekliči
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div className="rounded-lg bg-white p-2 border border-forest/8">
                          <span className="block text-[10px] text-forest/55">
                            Popust kupca
                          </span>
                          <strong className="text-sm text-forest">{discountPct} %</strong>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-forest/8">
                          <span className="block text-[10px] text-forest/55">
                            Provizija
                          </span>
                          <strong className="text-sm text-forest">{commissionPct} %</strong>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-forest/8">
                          <span className="block text-[10px] text-forest/55">
                            Naročila
                          </span>
                          <strong className="text-sm text-forest">
                            {perf.orderCount}
                          </strong>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-forest/8">
                          <span className="block text-[10px] text-forest/55">
                            Zaslužek
                          </span>
                          <strong className="text-sm text-emerald-700">
                            {formatMoney(estimatedCommissionCents)}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-forest/10 pt-4">
                  {partner.status !== "active" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onUpdatePartner(partner.id, { status: "active" })}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : partner.status === "pending" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <PlayCircle size={14} />
                      )}
                      <span>
                        {partner.status === "pending"
                          ? "Odobri in aktiviraj kodo"
                          : "Aktiviraj"}
                      </span>
                    </button>
                  )}

                  {partner.status === "active" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onUpdatePartner(partner.id, { status: "paused" })}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-50"
                    >
                      <PauseCircle size={14} />
                      <span>Pavziraj</span>
                    </button>
                  )}

                  {partner.status !== "ended" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onUpdatePartner(partner.id, { status: "ended" })}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      <span>Zaključi</span>
                    </button>
                  )}

                  {mailtoApproval && (
                    <a
                      href={mailtoApproval}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-forest/20 bg-white px-3 py-1.5 text-xs font-bold text-forest transition-colors hover:bg-sage"
                    >
                      <Mail size={13} />
                      <span>Pošlji e-pošto partnerju</span>
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDeletePartner(partner.id, partner.display_name)}
                    className="ml-auto inline-flex min-h-9 items-center justify-center rounded-md border border-rose-200 bg-rose-50/70 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                    title="Trajno izbriši partnerja"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!loading && !visiblePartners.length && (
          <div className="grid min-h-52 place-items-center rounded-xl border border-forest/10 bg-white p-8 text-center">
            <div>
              <p className="font-display text-2xl font-semibold text-forest">
                Ni najdenih partnerjev
              </p>
              <p className="mt-2 text-sm text-forest/55">
                {statusFilter === "all" && !query
                  ? "Ko se prvi ambasador prijavi na /partners ali ga dodaš ročno, se bo pojavil tukaj."
                  : "Spremeni iskanje ali izbrani filter za prikaz partnerjev."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
