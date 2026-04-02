import React from "react";
import { Empty, Spin } from "antd";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(amount) {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function capitalize(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getClientName(item) {
  return item.lead?.contact?.clientName || item.lead?.contact?.name || "—";
}

function getEventType(item) {
  const t = item.lead?.eventType;
  if (!t) return "—";
  if (t === "other" && item.lead?.eventTypeOther)
    return capitalize(item.lead.eventTypeOther);
  return capitalize(t);
}

function getPartyName(item) {
  if (item.source === "commission") return item.vendorName || "—";
  const parts = [item.receivedByName, item.givenByName].filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
}

// ─── Badges ─────────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  payment: {
    background: "#e3f2fd",
    color: "#1565c0",
    border: "1px solid #bbdefb",
  },
  commission: {
    background: "#fff8e1",
    color: "#e65100",
    border: "1px solid #ffe082",
  },
  account: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
  },
  cash: {
    background: "#fce4ec",
    color: "#880e4f",
    border: "1px solid #f8bbd0",
  },
  confirmed: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
  },
  pending: {
    background: "#fff3e0",
    color: "#bf360c",
    border: "1px solid #ffe0b2",
  },
};

function Badge({ type, label }) {
  const style = BADGE_STYLES[type] || {
    background: "#f5f5f5",
    color: "#444",
    border: "1px solid #ddd",
  };
  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ─── Table Styles ────────────────────────────────────────────────────────────

const wrapperStyle = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  border: "1px solid #ece9e4",
};

const tableStyle = {
  width: "100%",
  minWidth: 820,
  borderCollapse: "collapse",
  background: "white",
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
};

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 11,
  color: "#8a8580",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  background: "#faf9f7",
  borderBottom: "1px solid #ece9e4",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #f1f0ee",
  verticalAlign: "middle",
  color: "#1a1917",
};

const tdMutedStyle = {
  ...tdStyle,
  color: "#8a8580",
  fontSize: 12,
};

const amountTdStyle = {
  ...tdStyle,
  fontWeight: 900,
  fontSize: 15,
  color: "#2e7d32",
  whiteSpace: "nowrap",
};

const dateLineStyle = {
  fontWeight: 600,
  color: "#1a1917",
  fontSize: 13,
};

const timeLineStyle = {
  color: "#8a8580",
  fontSize: 11,
  marginTop: 2,
};

const clientNameStyle = {
  fontWeight: 600,
  color: "#1a1917",
  fontSize: 13,
};

const leadRefStyle = {
  color: "#c9a84c",
  fontSize: 11,
  marginTop: 2,
};

// ─── Row ─────────────────────────────────────────────────────────────────────

const InflowRow = ({ item, index }) => {
  const hasGst = Boolean(item.gstIncluded && item.taxableAmount);
  const isConfirmed = item.source === "payment" && item.confirmedReceived;

  return (
    <tr style={{ background: index % 2 === 0 ? "#fff" : "#fdfcfb" }}>
      <td style={{ ...tdMutedStyle, fontWeight: 600 }}>{index + 1}</td>

      {/* Date */}
      <td style={tdStyle}>
        <div style={dateLineStyle}>{formatDateTime(item.date)}</div>
        <div style={timeLineStyle}>{formatTime(item.date)}</div>
      </td>

      {/* Source */}
      <td style={tdStyle}>
        <Badge
          type={item.source}
          label={item.source === "payment" ? "Payment" : "Commission"}
        />
      </td>

      {/* Client */}
      <td style={tdStyle}>
        <div style={clientNameStyle}>{getClientName(item)}</div>
        {item.lead?.referenceCode && (
          <div style={leadRefStyle}>{item.lead.referenceCode}</div>
        )}
      </td>

      {/* Event */}
      <td style={tdMutedStyle}>{getEventType(item)}</td>

      {/* Vendor / Party */}
      <td style={tdStyle}>{getPartyName(item)}</td>

      {/* Method */}
      <td style={tdStyle}>
        <Badge
          type={item.method}
          label={
            item.method === "account"
              ? "Bank/Acct"
              : item.method === "cash"
                ? "Cash"
                : item.method || "—"
          }
        />
      </td>

      {/* Taxable */}
      <td style={tdMutedStyle}>
        {hasGst ? formatINR(item.taxableAmount) : "—"}
      </td>

      {/* GST */}
      <td style={tdMutedStyle}>
        {hasGst ? (
          <span>
            {item.gstRate}% ·{" "}
            <span style={{ fontWeight: 600 }}>{formatINR(item.gstAmount)}</span>
          </span>
        ) : (
          "—"
        )}
      </td>

      {/* Amount */}
      <td style={amountTdStyle}>{formatINR(item.amount)}</td>

      {/* Confirmed */}
      <td style={tdStyle}>
        {item.source === "payment" ? (
          <Badge
            type={isConfirmed ? "confirmed" : "pending"}
            label={isConfirmed ? "Confirmed" : "Pending"}
          />
        ) : (
          <span style={{ color: "#d0ccc8", fontSize: 12 }}>—</span>
        )}
      </td>
    </tr>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export const InflowItemsList = ({ items, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Empty description="No inflow items found" style={{ margin: "40px 0" }} />
    );
  }

  return (
    <div style={wrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Event</th>
            <th style={thStyle}>Vendor / Party</th>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Taxable Amt</th>
            <th style={thStyle}>GST</th>
            <th style={{ ...thStyle, color: "#2e7d32" }}>Amount</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <InflowRow key={item._id} item={item} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InflowItemsList;
