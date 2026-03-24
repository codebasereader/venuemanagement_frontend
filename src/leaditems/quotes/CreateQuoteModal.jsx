import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getVenuePricing } from "../../api/pricing.js";
import {
  computeTotals,
  DURATIONS,
  formatINR,
  moneyToNumber,
  normalizeAddons,
  normalizeInclusions,
  pickRackRate,
} from "./quoteMath.js";

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 800,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "#1a1917",
  background: "white",
  boxSizing: "border-box",
  outline: "none",
};

const btnBase = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function DurationChips({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {DURATIONS.map((d) => {
        const active = Number(value) === d;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange?.(d)}
            style={{
              ...btnBase,
              padding: "9px 14px",
              background: active ? "#c9a84c" : "#f0ede8",
              color: active ? "#1a1917" : "#1a1917",
            }}
          >
            {d}h
          </button>
        );
      })}
    </div>
  );
}

function OptionCard({ title, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 14,
        border: selected ? "2px solid #c9a84c" : "1px solid #e8e6e2",
        background: selected ? "#fdf6e8" : "white",
        padding: 14,
        cursor: "pointer",
      }}
    >
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917" }}>
        {title}
      </div>
      <div style={{ marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 700 }}>
        {description}
      </div>
    </button>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "8px 0" }}>
      <div style={{ color: "#6b6966", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      <div style={{ color: "#1a1917", fontSize: 13, fontWeight: strong ? 900 : 800, fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function AddonRow({ addon, idx, durationHours, setAddons }) {
  const unit = moneyToNumber(addon?.prices?.[String(durationHours)] ?? 0);
  const qty = Math.max(0, Number(addon.quantity) || 0);
  const lineTotal = unit * qty;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 10, alignItems: "center" }}>
      <input
        type="checkbox"
        checked={Boolean(addon.selected)}
        onChange={(e) => setAddons((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, selected: e.target.checked } : x)))}
      />
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: "#1a1917", fontSize: 13 }}>
          {addon.name}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6966", fontWeight: 700 }}>
          {unit ? `${formatINR(unit)} (+18% GST)` : "—"}
        </div>
        {addon.selected && unit > 0 && (
          <div style={{ marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#1a1917", fontWeight: 700 }}>
            {formatINR(unit)} × {qty} = {formatINR(lineTotal)}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          disabled={!addon.selected}
          onClick={() => setAddons((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, quantity: Math.max(0, (Number(x.quantity) || 0) - 1) } : x)))}
          style={{ ...btnBase, width: 28, height: 28, padding: 0, borderRadius: 8, background: "#f0ede8", color: "#1a1917", opacity: addon.selected ? 1 : 0.5 }}
        >
          −
        </button>
        <input
          type="number"
          min={0}
          disabled={!addon.selected}
          value={String(addon.quantity ?? 0)}
          onChange={(e) => {
            const v = Math.max(0, Number(e.target.value) || 0);
            setAddons((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, quantity: v } : x)));
          }}
          style={{ ...inputStyle, width: 52, padding: "6px 8px", textAlign: "center", opacity: addon.selected ? 1 : 0.6 }}
        />
        <button
          type="button"
          disabled={!addon.selected}
          onClick={() => setAddons((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, quantity: (Number(x.quantity) || 0) + 1 } : x)))}
          style={{ ...btnBase, width: 28, height: 28, padding: 0, borderRadius: 8, background: "#f0ede8", color: "#1a1917", opacity: addon.selected ? 1 : 0.5 }}
        >
          +
        </button>
      </div>
    </div>
  );
}

const QUOTE_STEPS = [
  "Event Window",
  "Venue Booking",
  "Pricing",
  "Add-ons",
  "Final Review",
];

function buildQuotePayload({
  lead,
  venueId,
  bookingType,
  spaceId,
  startAtISO,
  endAtISO,
  durationHours,
  basePrice,
  inclusions,
  addons,
  maintenanceCharge,
  totals,
  status = "draft",
}) {
  return {
    leadId: lead?._id,
    venueId,
    bookingType,
    ...(bookingType === "space_buyout" ? { spaceId } : {}),
    eventWindow: {
      startAt: startAtISO,
      endAt: endAtISO ?? null,
      durationHours: Number(durationHours),
    },
    pricing: {
      basePrice: moneyToNumber(basePrice),
      inclusions: (inclusions || []).map((i) => ({
        name: i.name,
        quantity: Number(i.quantity) || 0,
        ...(i.maxQuantity != null ? { maxQuantity: Number(i.maxQuantity) } : {}),
      })),
      addons: (addons || [])
        .filter((a) => a.selected)
        .map((a) => ({
          name: a.name,
          quantity: Number(a.quantity) || 0,
          unitPrice: moneyToNumber(a?.prices?.[String(durationHours)] ?? 0),
        })),
      maintenanceCharge: moneyToNumber(maintenanceCharge),
      gstRate: 0.18,
      discount: totals?.discount ?? 0,
      totals: {
        venueBase: totals?.venueBase,
        venueNet: totals?.venueNet,
        venueGst: totals?.venueGst,
        venueTotal: totals?.venueTotal,
        maintenanceCharge: totals?.maintenanceCharge,
        selectedAddonTotal: totals?.selectedAddonTotal,
        addonTotal: totals?.addonTotal,
        addonGst: totals?.addonGst,
        addonsTotalWithGst: totals?.addonsTotalWithGst,
        subtotal: totals?.subtotal,
        discount: totals?.discount,
        total: totals?.total,
      },
    },
    status,
  };
}

/** Map API quote (from GET/POST response) to modal form state for editing */
function quoteToFormState(editQuote) {
  if (!editQuote || typeof editQuote !== "object") return null;
  const ew = editQuote.eventWindow || {};
  const startAt = ew.startAt ? new Date(ew.startAt) : null;
  const endAt = ew.endAt ? new Date(ew.endAt) : null;
  const durationHours = Number(ew.durationHours) || 24;
  const pr = editQuote.pricing || {};
  const inclusions = (pr.inclusions || []).map((i) => ({
    name: i.name ?? "",
    maxQuantity: i.maxQuantity,
    quantity: Number(i.quantity) ?? 1,
  })).filter((i) => i.name);
  const durKey = String(durationHours);
  const addons = (pr.addons || []).map((a) => ({
    name: a.name ?? "",
    maxQuantity: a.maxQuantity,
    prices: { [durKey]: String(moneyToNumber(a.unitPrice) ?? 0) },
    selected: true,
    quantity: Number(a.quantity) ?? 1,
  })).filter((i) => i.name);
  return {
    startAtLocal: startAt && !Number.isNaN(startAt.getTime()) ? startAt.toISOString().slice(0, 16) : "",
    endAtLocal: endAt && !Number.isNaN(endAt.getTime()) ? endAt.toISOString().slice(0, 16) : "",
    durationHours,
    bookingType: editQuote.bookingType || "",
    spaceId: editQuote.spaceId || "",
    basePrice: moneyToNumber(pr.basePrice) || 0,
    inclusions,
    addons,
    maintenanceCharge:
      moneyToNumber(pr.maintenanceCharge ?? pr.totals?.maintenanceCharge) || 0,
    discount: moneyToNumber(pr.discount) || 0,
  };
}

export default function CreateQuoteModal({ isOpen, onClose, lead, onCreate, onUpdate, editQuote = null, submitting = false }) {
  const { access_token: token, venueId } = useSelector((s) => s.user.value);
  const isEdit = Boolean(editQuote?._id);

  const [step, setStep] = useState(0);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [pricing, setPricing] = useState(null);

  // Step 1
  const [startAtLocal, setStartAtLocal] = useState("");
  const [endAtLocal, setEndAtLocal] = useState("");
  const [endTouched, setEndTouched] = useState(false);
  const [durationHours, setDurationHours] = useState(24);

  // Step 2
  const [bookingType, setBookingType] = useState("");
  const [spaceId, setSpaceId] = useState("");

  // Step 3
  const [basePrice, setBasePrice] = useState(0);
  const [inclusions, setInclusions] = useState([]);
  const [addons, setAddons] = useState([]);
  const [maintenanceCharge, setMaintenanceCharge] = useState(0);
  const [discount, setDiscount] = useState(0);

  const pricingFlags = useMemo(() => {
    const buyoutOnly = Boolean(pricing?.buyoutOnly);
    const spaceOnly = Boolean(pricing?.spaceOnly);
    return { buyoutOnly, spaceOnly };
  }, [pricing]);

  const allowedBookingTypes = useMemo(() => {
    if (pricingFlags.buyoutOnly) return ["venue_buyout"];
    if (pricingFlags.spaceOnly) return ["space_buyout"];
    return ["venue_buyout", "space_buyout"];
  }, [pricingFlags]);

  const spaces = useMemo(() => {
    const arr = Array.isArray(pricing?.spaces) ? pricing.spaces : [];
    return arr.map((s) => ({ id: s._id ?? s.id, name: s.name ?? s.spaceName ?? s._id ?? s.id })).filter((s) => s.id);
  }, [pricing]);

  const startAtISO = useMemo(() => {
    if (!startAtLocal) return null;
    const v = new Date(startAtLocal);
    if (Number.isNaN(v.getTime())) return null;
    return v.toISOString();
  }, [startAtLocal]);

  const endAtISO = useMemo(() => {
    if (!endAtLocal) return null;
    const v = new Date(endAtLocal);
    if (Number.isNaN(v.getTime())) return null;
    return v.toISOString();
  }, [endAtLocal]);

  const windowError = useMemo(() => {
    if (!startAtISO || !endAtISO) return "";
    const s = new Date(startAtISO);
    const e = new Date(endAtISO);
    if (e.getTime() <= s.getTime()) return "End date/time must be after start.";
    return "";
  }, [startAtISO, endAtISO]);

  const totals = useMemo(
    () =>
      computeTotals({
        basePrice,
        addons,
        maintenanceCharge,
        durationHours,
        discount,
      }),
    [basePrice, addons, maintenanceCharge, durationHours, discount],
  );

  const LAST_STEP = 4;
  const modalTitle = isEdit ? `Edit Quote - Step ${step + 1}/5` : `Create Quote - Step ${step + 1}/5`;

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setPricing(null);
    setPricingError("");
    setEndTouched(false);

    const fromEdit = quoteToFormState(editQuote);
    if (fromEdit) {
      setStartAtLocal(fromEdit.startAtLocal);
      setEndAtLocal(fromEdit.endAtLocal);
      setDurationHours(fromEdit.durationHours);
      setBookingType(fromEdit.bookingType);
      setSpaceId(fromEdit.spaceId);
      setBasePrice(fromEdit.basePrice);
      setInclusions(fromEdit.inclusions);
      setAddons(fromEdit.addons);
      setMaintenanceCharge(fromEdit.maintenanceCharge);
      setDiscount(fromEdit.discount);
      return;
    }

    setBookingType("");
    setSpaceId("");
    setMaintenanceCharge(0);
    setDiscount(0);

    const leadStart = lead?.specialDay?.startAt ? new Date(lead.specialDay.startAt) : null;
    const leadEnd = lead?.specialDay?.endAt ? new Date(lead.specialDay.endAt) : null;
    const duration = Number(lead?.specialDay?.durationHours) || 24;
    setDurationHours(duration);

    const start = leadStart && !Number.isNaN(leadStart.getTime()) ? leadStart : new Date();
    const end =
      leadEnd && !Number.isNaN(leadEnd.getTime())
        ? leadEnd
        : new Date(start.getTime() + duration * 60 * 60 * 1000);

    setStartAtLocal(start.toISOString().slice(0, 16));
    setEndAtLocal(end.toISOString().slice(0, 16));
  }, [isOpen, lead, editQuote]);

  // Keep endAt in sync when duration changes (unless user manually edited endAt)
  useEffect(() => {
    if (!startAtLocal) return;
    if (endTouched) return;
    const s = new Date(startAtLocal);
    if (Number.isNaN(s.getTime())) return;
    const end = new Date(s.getTime() + Number(durationHours || 0) * 60 * 60 * 1000);
    setEndAtLocal(end.toISOString().slice(0, 16));
  }, [startAtLocal, durationHours, endTouched]);

  useEffect(() => {
    let cancelled = false;
    async function loadPricing() {
      if (!isOpen) return;
      if (!token || !venueId) return;
      setLoadingPricing(true);
      setPricingError("");
      try {
        const data = await getVenuePricing(token, venueId);
        if (!cancelled) setPricing(data);
      } catch (err) {
        if (!cancelled) {
          setPricingError(err.response?.data?.error?.message || "Failed to load pricing.");
        }
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    }
    loadPricing();
    return () => {
      cancelled = true;
    };
  }, [isOpen, token, venueId]);

  // When pricing loads, auto-select allowed booking type if only one
  useEffect(() => {
    if (!pricing) return;
    if (allowedBookingTypes.length === 1) setBookingType(allowedBookingTypes[0]);
  }, [pricing, allowedBookingTypes]);

  // When booking type / duration / space changes, derive Step 3 defaults (skip when editing existing quote)
  useEffect(() => {
    if (editQuote?._id) return;
    if (!pricing) return;
    if (!bookingType) return;

    if (bookingType === "venue_buyout") {
      const base = pickRackRate(pricing.rackRates, durationHours);
      setBasePrice(base);
      setInclusions(normalizeInclusions(pricing.inclusions));
      setAddons(normalizeAddons(pricing.addons));
      return;
    }

    if (bookingType === "space_buyout") {
      const selected = spaceId || spaces[0]?.id || "";
      if (!spaceId && selected) setSpaceId(selected);
      const sp = pricing.spacePricings?.[selected] || {};
      const base = pickRackRate(sp.rackRates, durationHours);
      setBasePrice(base);
      setInclusions(normalizeInclusions(sp.inclusions));
      setAddons(normalizeAddons(sp.addons));
    }
  }, [editQuote?._id, pricing, bookingType, durationHours, spaceId, spaces]);

  const canClose = true;

  const goNext = () => {
    if (step === 0) {
      if (!startAtLocal) return;
      if (!endAtLocal) return;
      if (!durationHours) return;
      if (windowError) return;
    }
    if (step === 1) {
      if (!bookingType) return;
      if (bookingType === "space_buyout" && !spaceId) return;
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const getPayload = (status = "draft") => {
    if (!lead?._id || !venueId || !startAtISO || !endAtISO) return null;
    if (windowError) return null;
    const payload = buildQuotePayload({
      lead,
      venueId,
      bookingType,
      spaceId,
      startAtISO,
      endAtISO,
      durationHours,
      basePrice,
      inclusions,
      addons,
      maintenanceCharge,
      totals,
      status,
    });
    payload.draft = status === "draft";
    payload.confirmed = status === "confirmed";
    return payload;
  };

  const submit = () => {
    const payload = getPayload("confirmed");
    if (!payload) return;
    if (isEdit && onUpdate) {
      onUpdate(editQuote._id, payload);
      onClose?.();
      return;
    }
    onCreate?.(payload);
    onClose?.();
  };

  const saveDraft = () => {
    const payload = getPayload("draft");
    if (!payload) return;
    if (isEdit && onUpdate) {
      onUpdate(editQuote._id, payload);
      onClose?.();
      return;
    }
    onCreate?.(payload);
    onClose?.();
  };

  const shareWhatsApp = () => {
    const payload = getPayload("draft");
    if (!payload) return;
    const name = lead?.contact?.name || "Customer";
    const eventStr = startAtLocal && endAtLocal ? `${startAtLocal.replace("T", " ")} – ${endAtLocal.replace("T", " ")} (${durationHours}h)` : "—";
    const spaceStr = bookingType === "venue_buyout" ? "Full Venue Buyout" : (spaces.find((s) => s.id === spaceId)?.name || "—");
    const text = [
      `Quote for ${name}`,
      `Event: ${eventStr}`,
      `Spaces: ${spaceStr}`,
      `Venue Rental: ${formatINR(totals.venueBase)}`,
      totals.discount > 0 ? `Discount: −${formatINR(totals.discount)}` : `Discount: ${formatINR(0)}`,
      `Net Amount: ${formatINR(totals.venueNet)}`,
      `GST (18%): ${formatINR(totals.venueGst)}`,
      `TOTAL (Venue only): ${formatINR(totals.venueTotal)}`,
    ]
      .filter(Boolean)
      .join("\n");
    const phone = (lead?.contact?.phone || "").replace(/\D/g, "");
    const num = phone.startsWith("91") ? phone : `91${phone}`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: "rgba(26, 25, 23, 0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => canClose && onClose?.()}
      role="presentation"
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          width: "min(520px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          border: "1px solid #ece9e4",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
      >
        <div style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, fontWeight: 800, color: "#1a1917" }}>
            {modalTitle}
          </div>
          <button
            type="button"
            onClick={() => canClose && onClose?.()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {QUOTE_STEPS.map((title, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <span
                  key={title}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: `1px solid ${active ? "#1a1917" : "#e8e6e2"}`,
                    background: active ? "#1a1917" : done ? "#f0ede8" : "#faf9f7",
                    color: active ? "#fff" : "#1a1917",
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {idx + 1}. {title}
                </span>
              );
            })}
          </div>
          {loadingPricing && (
            <div style={{ padding: 14, borderRadius: 14, background: "#faf9f7", border: "1px dashed #e8e6e2", color: "#6b6966", fontWeight: 800 }}>
              Loading pricing…
            </div>
          )}
          {!!pricingError && (
            <div style={{ padding: 14, borderRadius: 14, background: "#fde8e6", border: "1px solid #f6c8c2", color: "#a33b2d", fontWeight: 900 }}>
              {pricingError}
            </div>
          )}

          {step === 0 && (
            <>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 12 }}>
                Event Window
              </div>

              <label style={labelStyle}>Start Date & Time</label>
              <input
                type="datetime-local"
                value={startAtLocal}
                onChange={(e) => {
                  setStartAtLocal(e.target.value);
                  setEndTouched(false);
                }}
                style={inputStyle}
              />

              <div style={{ height: 12 }} />

              <label style={labelStyle}>End Date & Time</label>
              <input
                type="datetime-local"
                value={endAtLocal}
                onChange={(e) => {
                  setEndAtLocal(e.target.value);
                  setEndTouched(true);
                }}
                style={inputStyle}
              />

              <div style={{ height: 12 }} />

              <label style={labelStyle}>Duration</label>
              <DurationChips value={durationHours} onChange={setDurationHours} />

              {!!windowError && (
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "#fde8e6", border: "1px solid #f6c8c2", color: "#a33b2d", fontWeight: 900, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                  {windowError}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 12 }}>
                Venue Booking
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {allowedBookingTypes.includes("venue_buyout") && (
                  <OptionCard
                    title="Full Venue Buyout"
                    description="This venue accepts buyout bookings"
                    selected={bookingType === "venue_buyout"}
                    onClick={() => setBookingType("venue_buyout")}
                  />
                )}
                {allowedBookingTypes.includes("space_buyout") && (
                  <OptionCard
                    title="Space Buyout"
                    description="Book one space with per-space pricing"
                    selected={bookingType === "space_buyout"}
                    onClick={() => setBookingType("space_buyout")}
                  />
                )}
              </div>

              {bookingType === "space_buyout" && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Select Space</label>
                  <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} style={inputStyle}>
                    <option value="" disabled>
                      Select space…
                    </option>
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 12 }}>
                Pricing Breakdown
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #ece9e4",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917" }}>
                      Venue Rental
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6966", fontWeight: 700 }}>
                      {durationHours}h × {bookingType === "venue_buyout" ? "Full venue" : "Selected space"}
                    </div>
                  </div>
                  <div style={{ width: 160 }}>
                    <input
                      inputMode="numeric"
                      value={String(basePrice)}
                      onChange={(e) => setBasePrice(moneyToNumber(e.target.value))}
                      style={{ ...inputStyle, padding: "10px 12px", textAlign: "right" }}
                      aria-label="Base price"
                    />
                  </div>
                </div>
                <div style={{ marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#6b6966", fontWeight: 700 }}>
                  + GST 18%: {formatINR(totals.venueGst)}
                </div>

                {inclusions?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", fontSize: 12, letterSpacing: "0.06em" }}>
                      INCLUSIONS (included)
                    </div>
                    <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                      {inclusions.map((i, idx) => {
                        const qty = Math.max(0, Number(i.quantity) || 0);
                        return (
                          <div key={`${i.name}-${idx}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: "#1a1917", fontSize: 13 }}>
                              {i.name}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setInclusions((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, quantity: Math.max(0, (Number(x.quantity) || 0) - 1) } : x)))}
                                style={{ ...btnBase, width: 32, height: 32, padding: 0, borderRadius: 8, background: "#f0ede8", color: "#1a1917", fontSize: 16 }}
                                aria-label="Decrease"
                              >
                                −
                              </button>
                              <span style={{ minWidth: 28, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 13 }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setInclusions((prev) => prev.map((x, pIdx) => (pIdx === idx ? { ...x, quantity: (Number(x.quantity) || 0) + 1 } : x)))}
                                style={{ ...btnBase, width: 32, height: 32, padding: 0, borderRadius: 8, background: "#f0ede8", color: "#1a1917", fontSize: 16 }}
                                aria-label="Increase"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 14, borderTop: "1px solid #f1f0ee", paddingTop: 10 }}>
                  <SummaryRow label="Venue Rental" value={formatINR(totals.venueBase)} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "10px 0" }}>
                    <div style={{ color: "#6b6966", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                      Discount
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#d94f3d", fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>−₹</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={discount === 0 ? "" : String(discount)}
                        onChange={(e) => setDiscount(moneyToNumber(e.target.value))}
                        placeholder="0"
                        style={{ ...inputStyle, width: 100, padding: "8px 10px", textAlign: "right", borderColor: "#c9a84c" }}
                      />
                    </div>
                  </div>
                  <SummaryRow label="Net Amount" value={formatINR(totals.venueNet)} />
                  <SummaryRow label="GST (18%)" value={formatINR(totals.venueGst)} />
                  <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 8 }} />
                  <SummaryRow label="TOTAL" value={formatINR(totals.venueTotal)} strong />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 12 }}>
                Add-ons
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1px solid #ece9e4", padding: 14 }}>
                <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                  {(addons || []).length === 0 && (
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 700 }}>
                      No add-ons configured for this pricing.
                    </div>
                  )}
                  {(addons || []).map((a, idx) => (
                    <AddonRow key={`${a.name}-${idx}`} addon={a} idx={idx} durationHours={durationHours} setAddons={setAddons} />
                  ))}
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Maintenance Charges</label>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={maintenanceCharge === 0 ? "" : String(maintenanceCharge)}
                    onChange={(e) => setMaintenanceCharge(moneyToNumber(e.target.value))}
                    placeholder="Enter amount"
                    style={{ ...inputStyle, textAlign: "right" }}
                  />
                </div>

                <div style={{ marginTop: 14, borderTop: "1px solid #f1f0ee", paddingTop: 10 }}>
                  <SummaryRow label="Selected Add-ons" value={formatINR(totals.selectedAddonTotal)} />
                  <SummaryRow label="Maintenance Charges" value={formatINR(totals.maintenanceCharge)} />
                  <SummaryRow label="Add-ons (Before GST)" value={formatINR(totals.addonTotal)} />
                  <SummaryRow label="GST (18%)" value={formatINR(totals.addonGst)} />
                  <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 8 }} />
                  <SummaryRow label="TOTAL" value={formatINR(totals.addonsTotalWithGst)} strong />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 12 }}>
                Final Review
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1px solid #ece9e4", padding: 14 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 8 }}>
                  For: {lead?.contact?.name || "—"}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 800 }}>
                  Event: {startAtLocal ? startAtLocal.replace("T", " ") : "—"} → {endAtLocal ? endAtLocal.replace("T", " ") : "—"} ({durationHours}h)
                </div>
                <div style={{ marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 800 }}>
                  {bookingType === "venue_buyout" ? "Spaces: Full Venue Buyout" : `Spaces: ${spaces.find((s) => s.id === spaceId)?.name || "—"}`}
                </div>
                <div style={{ marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 800 }}>
                  Add-ons:{" "}
                  {(addons || []).filter((a) => a.selected).length
                    ? (addons || []).filter((a) => a.selected).map((a) => `${a.name} ×${a.quantity || 0}`).join(", ")
                    : "—"}
                </div>
                <div style={{ marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966", fontWeight: 800 }}>
                  Maintenance Charges: {formatINR(totals.maintenanceCharge)}
                </div>

                <div style={{ marginTop: 12, borderTop: "1px solid #f1f0ee", paddingTop: 10 }}>
                  <SummaryRow label="Venue Total" value={formatINR(totals.venueTotal)} />
                  <SummaryRow label="Add-ons Total" value={formatINR(totals.addonsTotalWithGst)} />
                  <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 8 }} />
                  <SummaryRow label="TOTAL" value={formatINR(totals.total)} strong />
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={step === 0 ? onClose : goBack}
              style={{
                ...btnBase,
                background: "#f0ede8",
                color: "#1a1917",
                minWidth: 90,
              }}
            >
              {step === 0 ? "Cancel" : "< Back"}
            </button>

            {step < LAST_STEP ? (
              <button
                type="button"
                onClick={goNext}
                style={{
                  ...btnBase,
                  background: "#c9a84c",
                  color: "#1a1917",
                  minWidth: 120,
                }}
              >
                {"Next >"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={submitting}
                  style={{
                    ...btnBase,
                    background: "#f0ede8",
                    color: "#1a1917",
                    minWidth: 100,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving…" : "Save as draft"}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  style={{
                    ...btnBase,
                    background: "#c9a84c",
                    color: "#1a1917",
                    minWidth: 120,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  Confirm book
                </button>
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  disabled={submitting}
                  style={{
                    ...btnBase,
                    background: "#25D366",
                    color: "#fff",
                    minWidth: 110,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                  title="Share via WhatsApp"
                >
                  <WhatsAppIcon size={18} />
                  Share
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

