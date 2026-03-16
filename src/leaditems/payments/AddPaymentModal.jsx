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
  maxWidth: 420,
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

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
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
  if (value == null || value === "") return 0;
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function buildReceivedAt(dateStr, timeStr) {
  if (!dateStr) return null;
  const time = timeStr || "00:00";
  const iso = `${dateStr}T${time}:00.000Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  initialPayment = null,
  submitting = false,
}) {
  const isEdit = Boolean(initialPayment?._id);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("account");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [receivedByName, setReceivedByName] = useState("");
  const [givenByName, setGivenByName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (initialPayment) {
      setAmount(
        initialPayment.amount != null ? String(initialPayment.amount) : "",
      );
      setMethod(initialPayment.method || "account");
      const baseDate = initialPayment.receivedAt || initialPayment.createdAt;
      const d = baseDate ? new Date(baseDate) : null;
      if (d && !Number.isNaN(d.getTime())) {
        setDate(d.toISOString().slice(0, 10));
        setTime(
          `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes(),
          ).padStart(2, "0")}`,
        );
      } else {
        setDate("");
        setTime("");
      }
      setReceivedByName(initialPayment.receivedByName || "");
      setGivenByName(initialPayment.givenByName || "");
      setNotes(initialPayment.notes || "");
    } else {
      setAmount("");
      setMethod("account");
      const now = new Date();
      setDate(now.toISOString().slice(0, 10));
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`,
      );
      setReceivedByName("");
      setGivenByName("");
      setNotes("");
    }
  }, [isOpen, initialPayment]);

  const handleClose = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = moneyToNumber(amount);
    const receivedAt = buildReceivedAt(date, time);

    if (!receivedAt || numericAmount <= 0) return;

    onSubmit({
      amount: numericAmount,
      method,
      receivedAt,
      receivedByName: receivedByName.trim(),
      givenByName: givenByName.trim(),
      notes: notes.trim(),
    });
  };

  if (!isOpen) return null;

  const numericAmount = moneyToNumber(amount);
  const canSubmit =
    numericAmount > 0 &&
    Boolean(date) &&
    Boolean(receivedByName.trim()) &&
    Boolean(givenByName.trim());

  return (
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
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
          {isEdit ? "Edit received payment" : "Add received payment"}
        </div>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Amount received (₹)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 300000"
            style={{ ...inputStyle, marginBottom: 14 }}
            required
          />

          <label style={labelStyle}>Received date</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 140 }}
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 120 }}
            />
          </div>

          <label style={labelStyle}>Received in</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ ...selectStyle, marginBottom: 14 }}
          >
            <option value="account">Bank / Account transfer</option>
            <option value="cash">Cash</option>
          </select>

          <label style={labelStyle}>Received by (staff name)</label>
          <input
            type="text"
            value={receivedByName}
            onChange={(e) => setReceivedByName(e.target.value)}
            placeholder="e.g. Kumar"
            style={{ ...inputStyle, marginBottom: 14 }}
            required
          />

          <label style={labelStyle}>Given by (client name)</label>
          <input
            type="text"
            value={givenByName}
            onChange={(e) => setGivenByName(e.target.value)}
            placeholder="e.g. Bride family"
            style={{ ...inputStyle, marginBottom: 14 }}
            required
          />

          <label style={labelStyle}>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. NEFT ref 123456"
            style={{ ...inputStyle, marginBottom: 20 }}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{ ...btnBase, background: "#f0ede8", color: "#1a1917" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !canSubmit}
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

