// ─── Date constants ───────────────────────────────────────────────────────────

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().getMonth() + 1;
export const YEAR_OPTIONS = Array.from(
  { length: 7 },
  (_, i) => CURRENT_YEAR - 3 + i,
);

// ─── Duration constants ────────────────────────────────────────────────────────

export const DURATIONS = [
  { key: "12", label: "Half Day" },
  { key: "24", label: "Full Day" },
  { key: "36", label: "1.5 Day" },
  { key: "48", label: "2 Days" },
];

function emptyDurationSlot() {
  return {
    expectedBookings: "",
    expectedBusiness: "",
    expectedExpenses: "",
    actualBookings: 0,
    actualBusiness: 0,
    actualExpenses: 0,
  };
}

export function emptyDurations() {
  return Object.fromEntries(DURATIONS.map((d) => [d.key, emptyDurationSlot()]));
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function parseNum(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function fmtNum(v) {
  const n = parseNum(v);
  if (n === null) return "—";
  return n.toLocaleString("en-IN");
}

export function fmtCurrency(v) {
  const n = parseNum(v);
  if (n === null) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

export function profitColor(val) {
  if (val === null || val === undefined) return "#9a9896";
  return val >= 0 ? "#16a34a" : "#dc2626";
}

// ─── Row builder ──────────────────────────────────────────────────────────────

/**
 * Build plan rows from the full monthly-plan API response object.
 * Each row contains a `durations` map keyed by "12"|"24"|"36"|"48".
 * The API `rows` array already contains per-duration expected and actual data
 * for both venue_buyout and space rows, so we use it directly.
 */
export function mergeRowsWithApiData(apiData) {
  const apiRows = apiData?.rows ?? [];

  return apiRows.map((row) => {
    const durations = {};
    for (const { key } of DURATIONS) {
      const dur = row.durations?.[key] ?? {};
      durations[key] = {
        expectedBookings: dur.expectedBookings ?? "",
        expectedBusiness: dur.expectedBusiness ?? "",
        expectedExpenses: dur.expectedExpenses ?? "",
        actualBookings: dur.actualBookings ?? 0,
        actualBusiness: dur.actualBusiness ?? 0,
        actualExpenses: dur.actualExpenses ?? 0,
      };
    }
    return {
      rowType: row.rowType,
      spaceId: row.spaceId ?? null,
      spaceName:
        row.spaceName ||
        (row.rowType === "venue_buyout"
          ? "Complete Venue Buyout"
          : "Unnamed Space"),
      durations,
    };
  });
}

// ─── Totals calculators ───────────────────────────────────────────────────────

function sumAllDurationsField(rows, field) {
  return rows.reduce((total, row) => {
    for (const { key } of DURATIONS) {
      const v = row.durations?.[key]?.[field];
      total += field.startsWith("expected") ? (parseNum(v) ?? 0) : (v ?? 0);
    }
    return total;
  }, 0);
}

export function calcMonthlyTotals(rows) {
  const expBk = sumAllDurationsField(rows, "expectedBookings");
  const expBiz = sumAllDurationsField(rows, "expectedBusiness");
  const expExp = sumAllDurationsField(rows, "expectedExpenses");
  const actBk = sumAllDurationsField(rows, "actualBookings");
  const actBiz = sumAllDurationsField(rows, "actualBusiness");
  const actExp = sumAllDurationsField(rows, "actualExpenses");
  return {
    expectedBookings: expBk,
    expectedBusiness: expBiz,
    expectedExpenses: expExp,
    expectedProfits: expBiz - expExp,
    actualBookings: actBk,
    actualBusiness: actBiz,
    actualExpenses: actExp,
    actualProfits: actBiz - actExp,
  };
}

export function calcYearlyTotals(rows) {
  const orNull = (field) => {
    const vals = rows
      .map((r) => r[field])
      .filter((v) => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) : null;
  };
  const expBiz = orNull("expectedBusiness");
  const expExp = orNull("expectedExpenses");
  const actBiz = orNull("actualBusiness");
  const actExp = orNull("actualExpenses");
  return {
    expectedBookings: orNull("expectedBookings"),
    expectedBusiness: expBiz,
    expectedExpenses: expExp,
    expectedProfits:
      expBiz !== null || expExp !== null ? (expBiz ?? 0) - (expExp ?? 0) : null,
    actualBookings: orNull("actualBookings"),
    actualBusiness: actBiz,
    actualExpenses: actExp,
    actualProfits:
      actBiz !== null || actExp !== null ? (actBiz ?? 0) - (actExp ?? 0) : null,
  };
}
