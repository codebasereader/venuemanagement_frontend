import React from "react";
import { formatCurrency, formatDate, formatMonthYear } from "./emiUtils";

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid #f3f2ef",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "#6b6966",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#1a1917",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  bill,
  month,
  year,
  status,
}) {
  if (!isOpen) return null;

  const emiAmount = status?.emiAmount ?? bill?.defaultAmount;
  const remaining =
    emiAmount != null && status?.amountPaid != null
      ? emiAmount - status.amountPaid
      : null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(26,25,23,0.48)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Payment details"
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #ece9e4",
          padding: 24,
          boxSizing: "border-box",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#dcfce7",
                borderRadius: 999,
                padding: "3px 10px",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: "#15803d",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ✓ Paid
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(16px,4vw,18px)",
                color: "#1a1917",
              }}
            >
              Payment Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6b6966",
            }}
          >
            ✕
          </button>
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#6b6966",
            margin: "4px 0 18px",
          }}
        >
          {bill?.name} — {formatMonthYear(month, year)}
        </p>

        <div>
          <DetailRow label="EMI Amount" value={formatCurrency(emiAmount)} />
          <DetailRow
            label="Amount Paid"
            value={formatCurrency(status?.amountPaid)}
          />
          {remaining != null && remaining !== 0 && (
            <DetailRow
              label={remaining > 0 ? "Remaining" : "Overpaid"}
              value={formatCurrency(Math.abs(remaining))}
            />
          )}
          <DetailRow label="Payment Mode" value={status?.paymentMode || "—"} />
          <DetailRow
            label="Payment Date"
            value={formatDate(status?.paymentDate)}
          />
          {status?.remarks && (
            <DetailRow label="Remarks" value={status.remarks} />
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "11px",
              border: "1px solid #d9d6d0",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#1a1917",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
