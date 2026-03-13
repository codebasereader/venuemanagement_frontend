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

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ConfirmedQuoteCard({ confirmedQuote }) {
  if (!confirmedQuote) {
    return (
      <div style={cardStyle}>
        <div style={titleStyle}>Confirmed quote</div>
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#6b6966", fontFamily: "'DM Sans', sans-serif" }}>
          No confirmed quote yet. Confirm a quote from the Quotes tab to see payment details here.
        </p>
      </div>
    );
  }

  const ew = confirmedQuote.eventWindow || {};
  const totals = confirmedQuote.pricing?.totals || {};
  const total = totals.total ?? 0;
  const bookingLabel =
    confirmedQuote.bookingType === "space_buyout" ? "Space buyout" : "Full venue buyout";

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Confirmed quote</div>
      <div style={{ borderTop: "1px solid #f1f0ee" }} />
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 13, color: "#6b6966", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            Booking
          </span>
          <span style={{ fontSize: 13, color: "#1a1917", fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>
            {bookingLabel}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 13, color: "#6b6966", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            Event
          </span>
          <span style={{ fontSize: 13, color: "#1a1917", fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>
            {ew.startAt ? `${formatDate(ew.startAt)} ${formatTime(ew.startAt)}` : "—"} – {ew.endAt ? formatTime(ew.endAt) : "—"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontSize: 13, color: "#6b6966", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            Total
          </span>
          <span style={{ fontSize: 15, color: "#1a1917", fontFamily: "'DM Sans', sans-serif", fontWeight: 900 }}>
            {formatINR(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
