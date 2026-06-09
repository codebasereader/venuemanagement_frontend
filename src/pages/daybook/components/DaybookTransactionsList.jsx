import React from "react";
import { Empty, Spin } from "antd";
import {
  capitalize,
  formatDateTime,
  formatINR,
  formatTime,
  getClientName,
  getEventType,
  getPartyOrVendorName,
} from "../daybookHelpers.js";

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
  labour: {
    background: "#f3e5f5",
    color: "#6a1b9a",
    border: "1px solid #e1bee7",
  },
  inflow: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
  },
  outflow: {
    background: "#ffebee",
    color: "#c62828",
    border: "1px solid #ffcdd2",
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

const wrapperStyle = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  border: "1px solid #ece9e4",
};

const tableStyle = {
  width: "100%",
  minWidth: 900,
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

function getSourceLabel(item) {
  if (item.source === "payment") return "Payment";
  if (item.source === "commission") return "Commission";
  if (item.source === "labour") return "Labour";
  return capitalize(item.source);
}

function getFlowType(item) {
  return item.type === "outflow" ? "outflow" : "inflow";
}

function TransactionRow({ item, index, rowOffset }) {
  const flowType = getFlowType(item);
  const isInflow = flowType === "inflow";
  const hasGst = Boolean(item.gstIncluded && item.taxableAmount);

  return (
    <tr style={{ background: index % 2 === 0 ? "#fff" : "#fdfcfb" }}>
      <td style={{ ...tdMutedStyle, fontWeight: 600 }}>{rowOffset + index + 1}</td>
      <td style={tdStyle}>
        <div style={{ fontWeight: 600 }}>{formatDateTime(item.date)}</div>
        <div style={{ color: "#8a8580", fontSize: 11, marginTop: 2 }}>
          {formatTime(item.date)}
        </div>
      </td>
      <td style={tdStyle}>
        <Badge type={flowType} label={isInflow ? "Inflow" : "Outflow"} />
      </td>
      <td style={tdStyle}>
        <Badge type={item.source} label={getSourceLabel(item)} />
      </td>
      <td style={tdStyle}>
        <div style={{ fontWeight: 600 }}>{getClientName(item)}</div>
        {item.lead?.referenceCode && (
          <div style={{ color: "#c9a84c", fontSize: 11, marginTop: 2 }}>
            {item.lead.referenceCode}
          </div>
        )}
      </td>
      <td style={tdMutedStyle}>{getEventType(item)}</td>
      <td style={tdStyle}>{getPartyOrVendorName(item)}</td>
      <td style={tdStyle}>
        {item.method ? (
          <Badge
            type={item.method}
            label={
              item.method === "account"
                ? "Bank/Acct"
                : item.method === "cash"
                  ? "Cash"
                  : item.method
            }
          />
        ) : (
          "—"
        )}
      </td>
      <td style={tdMutedStyle}>
        {hasGst ? formatINR(item.taxableAmount) : "—"}
      </td>
      <td
        style={{
          ...tdStyle,
          fontWeight: 900,
          fontSize: 15,
          color: isInflow ? "#2e7d32" : "#c62828",
          whiteSpace: "nowrap",
        }}
      >
        {formatINR(item.amount)}
      </td>
    </tr>
  );
}

export const DaybookTransactionsList = ({ items = [], loading, rowOffset = 0 }) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <Empty description="No transactions found" style={{ margin: "40px 0" }} />
    );
  }

  return (
    <div style={wrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Client</th>
            <th style={thStyle}>Event</th>
            <th style={thStyle}>Party / Vendor</th>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Taxable Amt</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <TransactionRow
              key={item._id || `${item.date}-${index}`}
              item={item}
              index={index}
              rowOffset={rowOffset}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DaybookTransactionsList;
