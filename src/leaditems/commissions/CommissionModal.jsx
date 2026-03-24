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

export default function CommissionModal({
  isOpen,
  onClose,
  onSubmit,
  direction,
  initialCommission = null,
  submitting = false,
  vendors = [],
  onAddVendor,
}) {
  const isEdit = Boolean(initialCommission?._id);
  const title =
    direction === "outflow"
      ? isEdit
        ? "Edit outflow commission"
        : "Add outflow commission"
      : isEdit
        ? "Edit inflow commission"
        : "Add inflow commission";

  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("account");
  const [givenDate, setGivenDate] = useState("");
  const [notes, setNotes] = useState("");
  const [addGst, setAddGst] = useState(false);

  const GST_RATE = 18;

  useEffect(() => {
    if (!isOpen) return;
    if (initialCommission) {
      setVendorId(initialCommission.vendorId || "");
      const hasGst = Boolean(initialCommission.gstIncluded);
      const taxableAmount =
        initialCommission.taxableAmount != null
          ? initialCommission.taxableAmount
          : hasGst
            ? Number(initialCommission.amount || 0) / (1 + GST_RATE / 100)
            : Number(initialCommission.amount || 0);
      setAmount(taxableAmount > 0 ? String(Math.round(taxableAmount)) : "");
      setMethod(initialCommission.method || "account");
      const d = initialCommission.givenDate
        ? new Date(initialCommission.givenDate)
        : null;
      setGivenDate(
        d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "",
      );
      setNotes(initialCommission.notes || "");
      setAddGst(hasGst);
    } else {
      setVendorId("");
      setAmount("");
      setMethod("account");
      const today = new Date();
      setGivenDate(today.toISOString().slice(0, 10));
      setNotes("");
      setAddGst(false);
    }
  }, [isOpen, initialCommission]);

  const handleClose = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const baseAmount = moneyToNumber(amount);
    const gstAmount = addGst ? Math.round(baseAmount * (GST_RATE / 100)) : 0;
    const totalAmount = baseAmount + gstAmount;
    const selectedVendor = vendors.find((v) => v._id === vendorId);
    const finalName = selectedVendor?.name || "";
    if (!finalName || !givenDate || baseAmount <= 0) return;

    const dateIso = new Date(givenDate).toISOString();

    onSubmit({
      direction,
      vendorName: finalName,
      amount: totalAmount,
      taxableAmount: baseAmount,
      gstIncluded: addGst,
      gstRate: addGst ? GST_RATE : 0,
      gstAmount,
      method,
      givenDate: dateIso,
      notes: notes.trim(),
    });
  };

  if (!isOpen) return null;

  const amt = moneyToNumber(amount);
  const gstAmount = addGst ? Math.round(amt * (GST_RATE / 100)) : 0;
  const totalAmount = amt + gstAmount;
  const hasSelectedVendor = Boolean(vendorId);
  const canSubmit = amt > 0 && hasSelectedVendor && Boolean(givenDate.trim());

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
          {title}
        </div>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Vendor</label>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
              }}
              style={{ ...selectStyle, flex: "1 1 160px", minWidth: 160 }}
            >
              <option value="">Select existing vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                  {v.category ? ` - ${v.category}` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAddVendor}
              style={{
                ...btnBase,
                padding: "8px 10px",
                background: "#f0ede8",
                color: "#1a1917",
                fontSize: 12,
              }}
            >
              + Add vendor
            </button>
          </div>

          <label style={labelStyle}>Amount (₹)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 15000"
            style={{ ...inputStyle, marginBottom: 10 }}
            required
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={addGst}
              onChange={(e) => setAddGst(e.target.checked)}
            />
            Add 18% GST
          </label>
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ece9e4",
              background: "#faf9f7",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Base: ₹{amt.toLocaleString("en-IN")} {addGst ? `• GST(18%): ₹${gstAmount.toLocaleString("en-IN")} • Total: ₹${totalAmount.toLocaleString("en-IN")}` : ""}
          </div>

          <label style={labelStyle}>Cash / Account</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ ...selectStyle, marginBottom: 14 }}
          >
            <option value="account">Bank / Account transfer</option>
            <option value="cash">Cash</option>
          </select>

          <label style={labelStyle}>Given date</label>
          <input
            type="date"
            value={givenDate}
            onChange={(e) => setGivenDate(e.target.value)}
            style={{ ...inputStyle, marginBottom: 14 }}
            required
          />

          <label style={labelStyle}>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Short note"
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

