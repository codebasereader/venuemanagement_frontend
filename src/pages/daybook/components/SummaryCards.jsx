import React from "react";

const cardContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 32,
};

const cardStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid #ece9e4",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#8a8580",
  marginBottom: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const amountStyle = {
  fontSize: 32,
  fontWeight: 900,
  color: "#1a1917",
  marginBottom: 8,
};

const iconStyle = {
  width: 48,
  height: 48,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
};

function ArrowDownIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function ArrowUpIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function TrendingUpIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendingDownIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function formatINR(amount) {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const SummaryCard = ({
  label,
  amount,
  icon: Icon,
  backgroundColor,
  iconColor,
}) => {
  return (
    <div style={cardStyle}>
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={amountStyle}>{formatINR(amount)}</div>
      </div>
      <div style={{ ...iconStyle, backgroundColor }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export const SummaryCards = ({ data }) => {
  const {
    inflowTotal = 0,
    outflowTotal = 0,
    profitLoss = 0,
    profitOrLossType = "profit",
  } = data?.totals || {};

  return (
    <div style={cardContainerStyle}>
      <SummaryCard
        label="Total Inflow"
        amount={inflowTotal}
        icon={ArrowDownIcon}
        backgroundColor="#e8f5e9"
        iconColor="#4caf50"
      />
      <SummaryCard
        label="Total Outflow"
        amount={outflowTotal}
        icon={ArrowUpIcon}
        backgroundColor="#ffebee"
        iconColor="#f44336"
      />
      <SummaryCard
        label={`Profit${profitOrLossType === "loss" ? " / Loss" : ""}`}
        amount={profitLoss}
        icon={profitOrLossType === "profit" ? TrendingUpIcon : TrendingDownIcon}
        backgroundColor={profitOrLossType === "profit" ? "#e3f2fd" : "#fce4ec"}
        iconColor={profitOrLossType === "profit" ? "#2196f3" : "#e91e63"}
      />
    </div>
  );
};

export default SummaryCards;
