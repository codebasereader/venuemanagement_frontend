export const DURATIONS = [12, 24, 36, 48];
export const GST_RATE = 0.18;

export function moneyToNumber(value) {
  if (value == null) return 0;
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatINR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export function calcEndAt(startAtISO, durationHours) {
  if (!startAtISO || !durationHours) return null;
  const start = new Date(startAtISO);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + Number(durationHours) * 60 * 60 * 1000);
  return end.toISOString();
}

export function pickRackRate(rackRates, durationHours) {
  const key = String(durationHours);
  return moneyToNumber(rackRates?.[key] ?? 0);
}

export function normalizeInclusions(items = []) {
  return (items || []).map((i) => ({
    name: (i?.name ?? "").trim(),
    maxQuantity: i?.maxQuantity,
    quantity: i?.maxQuantity != null ? Number(i.maxQuantity) : 1,
  })).filter((i) => i.name);
}

export function normalizeAddons(items = []) {
  return (items || []).map((i) => ({
    name: (i?.name ?? "").trim(),
    maxQuantity: i?.maxQuantity,
    prices: i?.prices ?? {},
    selected: false,
    quantity: 1,
  })).filter((i) => i.name);
}

/**
 * Venue flow:
 *   Net Amount = Venue Rental - Discount
 *   GST is calculated on Net Amount
 *   Venue Total = Net Amount + GST
 *
 * Add-ons flow:
 *   Add-ons GST applied separately to selected add-ons total.
 *
 * Grand Total = Venue Total + Add-ons Total (incl GST)
 */
export function computeTotals({
  basePrice = 0,
  addons = [],
  maintenanceCharge = 0,
  durationHours = 12,
  gstRate = GST_RATE,
  discount = 0,
}) {
  const venueBase = moneyToNumber(basePrice);
  const discountAmount = Math.max(0, moneyToNumber(discount));
  const venueNet = Math.max(0, venueBase - discountAmount);
  const venueGst = Math.round(venueNet * gstRate);
  const venueTotal = venueNet + venueGst;

  const selectedAddonTotal = addons
    .filter((a) => a.selected)
    .reduce((sum, a) => {
      const unit = moneyToNumber(a?.prices?.[String(durationHours)] ?? 0);
      const qty = Math.max(0, Number(a.quantity) || 0);
      return sum + unit * qty;
    }, 0);
  const maintenanceAmount = Math.max(0, moneyToNumber(maintenanceCharge));
  const addonTotal = selectedAddonTotal + maintenanceAmount;
  const addonGst = Math.round(addonTotal * gstRate);
  const addonsTotalWithGst = addonTotal + addonGst;

  const subtotal = venueTotal + addonsTotalWithGst;
  const total = subtotal;

  return {
    venueBase,
    venueNet,
    venueGst,
    venueTotal,
    maintenanceCharge: maintenanceAmount,
    selectedAddonTotal,
    addonTotal,
    addonGst,
    addonsTotalWithGst,
    subtotal,
    discount: discountAmount,
    total,
  };
}

