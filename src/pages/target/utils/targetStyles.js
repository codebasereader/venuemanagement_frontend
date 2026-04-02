// Shared token values for the Business Plan feature

export const FONT = "'DM Sans', sans-serif";
export const SERIF = "'DM Serif Display', Georgia, serif";

// ─── Table cell base styles ────────────────────────────────────────────────────

export const TH_BASE = {
  padding: "10px 14px",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  textAlign: "right",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

export const TD_BASE = {
  padding: "10px 14px",
  fontFamily: FONT,
  fontSize: 13,
  color: "#1a1917",
  whiteSpace: "nowrap",
  textAlign: "right",
  borderBottom: "1px solid #f0ede8",
  verticalAlign: "middle",
};

// ─── Form controls ────────────────────────────────────────────────────────────

export const selectStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1.5px solid #ece9e4",
  fontFamily: FONT,
  fontSize: 13,
  color: "#1a1917",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

export const inputStyle = {
  width: "100%",
  minWidth: 72,
  padding: "5px 8px",
  border: "1.5px solid #d0cccc",
  borderRadius: 6,
  fontFamily: FONT,
  fontSize: 12,
  color: "#1a1917",
  background: "#fff",
  outline: "none",
  textAlign: "right",
  boxSizing: "border-box",
};

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const btnPrimary = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 18px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 13,
  background: "#1a1917",
  color: "#fff",
  transition: "opacity 0.15s",
};

export const btnOutline = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 18px",
  borderRadius: 999,
  border: "1.5px solid #ece9e4",
  cursor: "pointer",
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 13,
  background: "#fff",
  color: "#1a1917",
};
