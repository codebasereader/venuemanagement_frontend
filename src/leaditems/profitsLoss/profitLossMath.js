export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function sumBy(items, picker) {
  if (!Array.isArray(items) || typeof picker !== "function") return 0;
  return items.reduce((sum, item) => sum + asNumber(picker(item)), 0);
}

export function pctOf(base, part) {
  const b = asNumber(base);
  if (b <= 0) return 0;
  return Math.round((asNumber(part) / b) * 100);
}

export function calcNetProfitLoss({ quoteTotal, outflowPaid, labourCost, inflowReceived }) {
  return asNumber(quoteTotal) - asNumber(outflowPaid) - asNumber(labourCost) + asNumber(inflowReceived);
}
