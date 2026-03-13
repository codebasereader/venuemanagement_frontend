import React from "react";
import { formatINR } from "../quotes/quoteMath.js";

const cardStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid #ece9e4",
  padding: 16,
};

const titleStyle = {
  fontSize: 13,
  fontWeight: 900,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: 10,
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 8,
  padding: "12px 0",
  borderTop: "1px solid #f1f0ee",
};

const iconBtnStyle = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  border: "1px solid #e8e6e2",
  background: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  color: "#6b6966",
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function methodLabel(method) {
  if (method === "account") return "BANK TRANSFER";
  if (method === "cash") return "CASH";
  return (method || "").toUpperCase() || "—";
}

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function PaymentHistoryCard({ payments = [], onDelete, actionLoadingId = null }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Payment history</div>
      <div style={{ borderTop: "1px solid #f1f0ee" }} />

      {payments.length === 0 && (
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#6b6966", fontFamily: "'DM Sans', sans-serif" }}>
          No payments recorded yet. Mark a reminder as received or add a payment to see them here.
        </p>
      )}

      {payments.map((p) => {
        const busy = actionLoadingId === p._id;
        const date = p.receivedAt || p.createdAt;
        return (
          <div key={p._id} style={rowStyle}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1917", fontFamily: "'DM Sans', sans-serif" }}>
                {formatINR(p.amount ?? 0)}
              </div>
              <div style={{ fontSize: 12, color: "#6b6966", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                {methodLabel(p.method)} • {formatDate(date)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(p)}
              disabled={busy}
              style={iconBtnStyle}
              title="Delete"
              aria-label="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
