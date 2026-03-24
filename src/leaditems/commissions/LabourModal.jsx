import React, { useEffect, useMemo, useState } from "react";

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
  maxWidth: 460,
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

function toNumber(value) {
  if (value == null || value === "") return 0;
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function buildAmount({ labourCount, shiftType, dayRate, nightRate }) {
  const count = Math.max(0, toNumber(labourCount));
  const day = Math.max(0, toNumber(dayRate));
  const night = Math.max(0, toNumber(nightRate));
  if (shiftType === "day") return count * day;
  if (shiftType === "night") return count * night;
  return count * (day + night);
}

export default function LabourModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  initialLabour = null,
}) {
  const isEdit = Boolean(initialLabour?._id);
  const [date, setDate] = useState("");
  const [shiftType, setShiftType] = useState("day");
  const [labourCount, setLabourCount] = useState("");
  const [dayRate, setDayRate] = useState("");
  const [nightRate, setNightRate] = useState("");
  const [notes, setNotes] = useState("");
  const [addGst, setAddGst] = useState(false);

  const GST_RATE = 18;

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date().toISOString().slice(0, 10);
    if (initialLabour) {
      const d = initialLabour.date ? new Date(initialLabour.date) : null;
      setDate(d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : today);
      setShiftType(initialLabour.shiftType || "day");
      setLabourCount(initialLabour.labourCount != null ? String(initialLabour.labourCount) : "");
      setDayRate(initialLabour.dayRate != null ? String(initialLabour.dayRate) : "");
      setNightRate(initialLabour.nightRate != null ? String(initialLabour.nightRate) : "");
      setNotes(initialLabour.notes || "");
      setAddGst(Boolean(initialLabour.gstIncluded));
      return;
    }
    setDate(today);
    setShiftType("day");
    setLabourCount("");
    setDayRate("");
    setNightRate("");
    setNotes("");
    setAddGst(false);
  }, [isOpen, initialLabour]);

  const previewAmount = useMemo(
    () => buildAmount({ labourCount, shiftType, dayRate, nightRate }),
    [labourCount, shiftType, dayRate, nightRate],
  );
  const gstAmount = useMemo(
    () => (addGst ? Math.round(previewAmount * (GST_RATE / 100)) : 0),
    [addGst, previewAmount],
  );
  const totalAmount = previewAmount + gstAmount;

  const canSubmit = useMemo(() => {
    const count = toNumber(labourCount);
    if (!date || count <= 0) return false;
    if (shiftType === "day") return toNumber(dayRate) > 0;
    if (shiftType === "night") return toNumber(nightRate) > 0;
    return toNumber(dayRate) > 0 && toNumber(nightRate) > 0;
  }, [date, labourCount, shiftType, dayRate, nightRate]);

  const handleClose = () => {
    if (!submitting) onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit?.({
      _id: initialLabour?._id,
      date: new Date(date).toISOString(),
      shiftType,
      labourCount: Math.max(0, toNumber(labourCount)),
      dayRate: shiftType === "night" ? 0 : Math.max(0, toNumber(dayRate)),
      nightRate: shiftType === "day" ? 0 : Math.max(0, toNumber(nightRate)),
      amount: totalAmount,
      taxableAmount: previewAmount,
      gstIncluded: addGst,
      gstRate: addGst ? GST_RATE : 0,
      gstAmount,
      notes: notes.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
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
          {isEdit ? "Edit labour entry" : "Add labour entry"}
        </div>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} required />

          <label style={labelStyle}>Day / Night</label>
          <select value={shiftType} onChange={(e) => setShiftType(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
            <option value="day">Day</option>
            <option value="night">Night</option>
            <option value="both">Both day and night</option>
          </select>

          <label style={labelStyle}>No. of labour</label>
          <input
            type="number"
            min="1"
            step="1"
            value={labourCount}
            onChange={(e) => setLabourCount(e.target.value)}
            style={{ ...inputStyle, marginBottom: 12 }}
            placeholder="e.g. 10"
            required
          />

          {(shiftType === "day" || shiftType === "both") && (
            <>
              <label style={labelStyle}>Day rate</label>
              <input
                type="number"
                min="1"
                step="1"
                value={dayRate}
                onChange={(e) => setDayRate(e.target.value)}
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="e.g. 700"
                required={shiftType !== "night"}
              />
            </>
          )}

          {(shiftType === "night" || shiftType === "both") && (
            <>
              <label style={labelStyle}>Night rate</label>
              <input
                type="number"
                min="1"
                step="1"
                value={nightRate}
                onChange={(e) => setNightRate(e.target.value)}
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="e.g. 900"
                required={shiftType !== "day"}
              />
            </>
          )}

          <label style={labelStyle}>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Short note"
            style={{ ...inputStyle, marginBottom: 10 }}
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
              marginBottom: 18,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ece9e4",
              background: "#faf9f7",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Base: ₹{previewAmount.toLocaleString("en-IN")} {addGst ? `• GST(18%): ₹${gstAmount.toLocaleString("en-IN")} • Total: ₹${totalAmount.toLocaleString("en-IN")}` : ""}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" onClick={handleClose} disabled={submitting} style={{ ...btnBase, background: "#f0ede8", color: "#1a1917" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !canSubmit} style={{ ...btnBase, background: "#c9a84c", color: "#1a1917" }}>
              {submitting ? "Saving..." : isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
