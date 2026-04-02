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
 * Spaces come from data.spaces (which carry per-space actual booking data).
 * "Complete Venue Buyout" actuals = totals - sum of all space actuals.
 * Expected values are read from data.rows (saved plan rows).
 */
export function mergeRowsWithApiData(apiData) {
  const rows = [];
  const savedRows = apiData?.rows ?? [];
  const apiSpaces = apiData?.spaces ?? [];
  const totals = apiData?.totals ?? {};

  // Venue-buyout actuals = grand total minus all individual space actuals
  const spacesActualBookings = apiSpaces.reduce(
    (s, sp) => s + (sp.actualBookings ?? 0),
    0,
  );
  const spacesActualBusiness = apiSpaces.reduce(
    (s, sp) => s + (sp.actualBusiness ?? 0),
    0,
  );
  const spacesActualExpenses = apiSpaces.reduce(
    (s, sp) => s + (sp.actualExpenses ?? 0),
    0,
  );

  const vbRow = savedRows.find((r) => r.rowType === "venue_buyout");
  rows.push({
    rowType: "venue_buyout",
    spaceId: null,
    spaceName: "Complete Venue Buyout",
    expectedBookings: vbRow?.expectedBookings ?? "",
    expectedBusiness: vbRow?.expectedBusiness ?? "",
    expectedExpenses: vbRow?.expectedExpenses ?? "",
    actualBookings: (totals.actualBookings ?? 0) - spacesActualBookings,
    actualBusiness: (totals.actualBusiness ?? 0) - spacesActualBusiness,
    actualExpenses: (totals.actualExpenses ?? 0) - spacesActualExpenses,
  });

  for (const space of apiSpaces) {
    const savedRow = savedRows.find(
      (r) =>
        r.spaceId && r.spaceId.toString() === (space.spaceId ?? "").toString(),
    );
    rows.push({
      rowType: "space",
      spaceId: space.spaceId,
      spaceName: space.spaceName || "Unnamed Space",
      expectedBookings: savedRow?.expectedBookings ?? "",
      expectedBusiness: savedRow?.expectedBusiness ?? "",
      expectedExpenses: savedRow?.expectedExpenses ?? "",
      actualBookings: space.actualBookings ?? 0,
      actualBusiness: space.actualBusiness ?? 0,
      actualExpenses: space.actualExpenses ?? 0,
    });
  }

  return rows;
}

// ─── Totals calculators ───────────────────────────────────────────────────────

export function calcMonthlyTotals(rows) {
  const expBk = rows.reduce(
    (s, r) => s + (parseNum(r.expectedBookings) ?? 0),
    0,
  );
  const expBiz = rows.reduce(
    (s, r) => s + (parseNum(r.expectedBusiness) ?? 0),
    0,
  );
  const expExp = rows.reduce(
    (s, r) => s + (parseNum(r.expectedExpenses) ?? 0),
    0,
  );
  const actBk = rows.reduce((s, r) => s + (r.actualBookings ?? 0), 0);
  const actBiz = rows.reduce((s, r) => s + (r.actualBusiness ?? 0), 0);
  const actExp = rows.reduce((s, r) => s + (r.actualExpenses ?? 0), 0);
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
