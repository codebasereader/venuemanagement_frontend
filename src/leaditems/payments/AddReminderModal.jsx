import React, { useEffect, useState } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
  padding: 16,
};

const modalStyle = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  maxWidth: 400,
  width: "100%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 800,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "#1a1917",
  background: "white",
  boxSizing: "border-box",
};

const btnBase = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

function moneyToNumber(value) {
  if (value == null) return 0;
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function AddReminderModal({ isOpen, onClose, onSubmit, editReminder = null, submitting = false }) {
  const isEdit = Boolean(editReminder?._id);
  const [expectedAmount, setExpectedAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (editReminder) {
      setExpectedAmount(
        editReminder.expectedAmount != null ? String(editReminder.expectedAmount) : "",
      );
      const d = editReminder.expectedDate ? new Date(editReminder.expectedDate) : null;
      setExpectedDate(
        d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "",
      );
    } else {
      setExpectedAmount("");
      setExpectedDate("");
    }
  }, [isOpen, editReminder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = moneyToNumber(expectedAmount);
    if (!expectedDate || amount <= 0) return;
    onSubmit({
      expectedAmount: amount,
      expectedDate: new Date(expectedDate).toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose?.()}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 900,
            fontSize: 18,
            color: "#1a1917",
            marginBottom: 16,
          }}
        >
          {isEdit ? "Edit reminder" : "Add payment reminder"}
        </div>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Expected amount (₹)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            placeholder="e.g. 500000"
            style={{ ...inputStyle, marginBottom: 14 }}
            required
          />
          <label style={labelStyle}>Expected date</label>
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            style={{ ...inputStyle, marginBottom: 20 }}
            required
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{ ...btnBase, background: "#f0ede8", color: "#1a1917" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !expectedDate || moneyToNumber(expectedAmount) <= 0}
              style={{ ...btnBase, background: "#c9a84c", color: "#1a1917" }}
            >
              {submitting ? "Saving…" : isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
