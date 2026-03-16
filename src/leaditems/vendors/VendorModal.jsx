import React, { useEffect, useState } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
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
  padding: "10px 12px",
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

export default function VendorModal({ isOpen, onClose, onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setCategory("");
    setPhone("");
    setEmail("");
    setNotes("");
  }, [isOpen]);

  const handleClose = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category: category.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const canSubmit = Boolean(name.trim());

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
            marginBottom: 12,
          }}
        >
          Add vendor
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#6b6966",
            margin: "0 0 16px 0",
          }}
        >
          Only name is required. Other details are optional and can help you
          remember who this vendor is.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Photographer Raj"
            style={{ ...inputStyle, marginBottom: 10 }}
            required
          />

          <label style={labelStyle}>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="photography / decor / catering"
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="raj@example.com"
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          <label style={labelStyle}>Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Specializes in candid weddings"
            style={{ ...inputStyle, marginBottom: 18 }}
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
              {submitting ? "Saving…" : "Add vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

