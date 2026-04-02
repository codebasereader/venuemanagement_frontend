import React, { useEffect, useState } from "react";
import { formatMonthYear } from "./emiUtils";

const fieldStyle = { display: "flex", flexDirection: "column", gap: 4 };

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b6966",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  padding: "9px 12px",
  border: "1px solid #d9d6d0",
  borderRadius: 8,
  fontSize: 14,
  color: "#1a1917",
  background: "#fff",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  width: "100%",
  boxSizing: "border-box",
};

const PAYMENT_MODES = ["Cash", "Account"];

export default function MarkPaidModal({
  isOpen,
  onClose,
  onConfirm,
  submitting,
  bill,
  month,
  year,
}) {
  const [form, setForm] = useState({
    emiAmount: "",
    amountPaid: "",
    paymentMode: "Cash",
    paymentDate: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  useEffect(() => {
    if (isOpen && bill) {
      const defaultAmt =
        bill.defaultAmount != null ? String(bill.defaultAmount) : "";
      setForm({
        emiAmount: defaultAmt,
        amountPaid: defaultAmt,
        paymentMode: "Cash",
        paymentDate: new Date().toISOString().slice(0, 10),
        remarks: "",
      });
    }
  }, [isOpen, bill]);

  if (!isOpen) return null;

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onConfirm({
        month: Number(month),
        year: Number(year),
        emiAmount: Number(form.emiAmount),
        paid: true,
        amountPaid: Number(form.amountPaid),
        paymentMode: form.paymentMode,
        paymentDate: new Date(form.paymentDate).toISOString(),
        remarks: form.remarks.trim(),
      });
    } catch {
      // errors shown via parent's message.error; modal stays open
    }
  };

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
        aria-label="Mark EMI as paid"
        style={{
          width: "min(500px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
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
            marginBottom: 6,
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
                ✓ Mark as Paid
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(16px,4vw,20px)",
                color: "#1a1917",
              }}
            >
              Record Payment
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
            margin: "0 0 20px",
          }}
        >
          {bill?.name} — {formatMonthYear(month, year)}
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>EMI Amount (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="any"
                style={inputStyle}
                value={form.emiAmount}
                onChange={(e) => setField("emiAmount", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Amount Paid (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="any"
                style={inputStyle}
                value={form.amountPaid}
                onChange={(e) => setField("amountPaid", e.target.value)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Payment Mode</label>
              <select
                style={inputStyle}
                value={form.paymentMode}
                onChange={(e) => setField("paymentMode", e.target.value)}
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Payment Date</label>
              <input
                required
                type="date"
                style={inputStyle}
                value={form.paymentDate}
                onChange={(e) => setField("paymentDate", e.target.value)}
              />
            </div>
            <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Remarks (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                value={form.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
                placeholder="Any notes about this payment…"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #d9d6d0",
                borderRadius: 8,
                background: "#fff",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#6b6966",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 24px",
                border: "none",
                borderRadius: 8,
                background: submitting ? "#86efac" : "#16a34a",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                transition: "background 0.15s",
              }}
            >
              {submitting ? "Saving…" : "Confirm Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
