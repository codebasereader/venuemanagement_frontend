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

function normalizeDurationsFromApi(durationSource = {}) {
  const durations = {};
  for (const { key } of DURATIONS) {
    const dur = durationSource?.[key] ?? {};
    durations[key] = {
      expectedBookings: dur.expectedBookings ?? "",
      expectedBusiness: dur.expectedBusiness ?? "",
      expectedExpenses: dur.expectedExpenses ?? "",
      actualBookings: dur.actualBookings ?? 0,
      actualBusiness: dur.actualBusiness ?? 0,
      actualExpenses: dur.actualExpenses ?? 0,
    };
  }
  return durations;
}

function buildFallbackRowsFromSpaces(apiData) {
  const rows = [];

  // Keep venue buyout visible even when API rows are empty.
  rows.push({
    rowType: "venue_buyout",
    spaceId: null,
    spaceName: "Complete Venue Buyout",
    durations: normalizeDurationsFromApi(apiData?.totals?.durationTotals),
  });

  const spaces = Array.isArray(apiData?.spaces) ? apiData.spaces : [];
  for (const space of spaces) {
    const durations = emptyDurations();
    // Backend currently returns actuals per space as totals, not per duration.
    // Put them in "Full Day" bucket so the user can still see and post rows.
    const bucket = "24";
    durations[bucket] = {
      ...durations[bucket],
      actualBookings: space?.actualBookings ?? 0,
      actualBusiness: space?.actualBusiness ?? 0,
      actualExpenses: space?.actualExpenses ?? 0,
    };

    rows.push({
      rowType: "space",
      spaceId: space?.spaceId ?? null,
      spaceName: space?.spaceName ?? "Unnamed Space",
      durations,
    });
  }

  return rows;
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
  if (apiRows.length === 0) {
    return buildFallbackRowsFromSpaces(apiData);
  }

  return apiRows.map((row) => {
    const durations = normalizeDurationsFromApi(row.durations);
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
