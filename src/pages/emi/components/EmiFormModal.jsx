import React, { useEffect, useState } from "react";

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

const EMI_TYPES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const emptyForm = {
  name: "",
  emiType: "monthly",
  emiDate: "",
  emi_end_date: "",
  defaultAmount: "",
};

export default function EmiFormModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  error,
  initialData,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        name: initialData.name || "",
        emiType: initialData.emiType || "monthly",
        emiDate: initialData.emiDate ? initialData.emiDate.slice(0, 10) : "",
        emi_end_date: initialData.emi_end_date
          ? initialData.emi_end_date.slice(0, 10)
          : "",
        defaultAmount:
          initialData.defaultAmount != null
            ? String(initialData.defaultAmount)
            : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        name: form.name.trim(),
        emiType: form.emiType,
        emiDate: form.emiDate
          ? new Date(form.emiDate).toISOString()
          : undefined,
        emi_end_date: form.emi_end_date
          ? new Date(form.emi_end_date).toISOString()
          : undefined,
        defaultAmount: form.defaultAmount
          ? Number(form.defaultAmount)
          : undefined,
      });
    } catch {
      // error displayed via the `error` prop passed from parent
    }
  };

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
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
        aria-label={initialData ? "Edit EMI Bill" : "Add EMI Bill"}
        style={{
          width: "min(480px, 100%)",
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
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(18px,4vw,22px)",
              color: "#1a1917",
            }}
          >
            {initialData ? "Edit EMI Bill" : "Add EMI Bill"}
          </h2>
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

        {/* Error banner */}
        {!!error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#fde8e6",
              border: "1px solid #f6c8c2",
              borderRadius: 8,
              color: "#a33b2d",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {/* Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Bill Name *</label>
              <input
                required
                style={inputStyle}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Generator EMI"
              />
            </div>

            {/* Type */}
            <div style={fieldStyle}>
              <label style={labelStyle}>EMI Type *</label>
              <select
                required
                style={inputStyle}
                value={form.emiType}
                onChange={(e) => setField("emiType", e.target.value)}
              >
                {EMI_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={fieldStyle}>
                <label style={labelStyle}>EMI Start Date *</label>
                <input
                  required
                  type="date"
                  style={inputStyle}
                  value={form.emiDate}
                  onChange={(e) => setField("emiDate", e.target.value)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>EMI End Date *</label>
                <input
                  required
                  type="date"
                  style={inputStyle}
                  value={form.emi_end_date}
                  onChange={(e) => setField("emi_end_date", e.target.value)}
                />
              </div>
            </div>

            {/* Amount */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Default Amount (₹) *</label>
              <input
                required
                type="number"
                min="0"
                step="any"
                style={inputStyle}
                value={form.defaultAmount}
                onChange={(e) => setField("defaultAmount", e.target.value)}
                placeholder="e.g. 15000"
              />
            </div>
          </div>

          {/* Footer */}
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
                background: submitting ? "#c5c2be" : "#1a1917",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                transition: "background 0.15s",
              }}
            >
              {submitting
                ? "Saving…"
                : initialData
                  ? "Save Changes"
                  : "Add Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
