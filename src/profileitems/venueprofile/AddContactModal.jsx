import React, { useState, useEffect } from "react";

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "#1a1917",
  background: "white",
  marginBottom: "16px",
  boxSizing: "border-box",
};

const btnBase = {
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s",
};

export default function AddContactModal({ isOpen, onClose, onSave, editContact = null }) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [number, setNumber] = useState("");

  const isEdit = Boolean(editContact);

  useEffect(() => {
    if (editContact) {
      setName(editContact.name || "");
      setDesignation(editContact.designation || "");
      setNumber(editContact.number || "");
    } else {
      setName("");
      setDesignation("");
      setNumber("");
    }
  }, [editContact, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, designation, number };
    if (editContact?.id) payload.id = editContact.id;
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(26, 25, 23, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px #f1f0ee",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: "0 0 20px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: "#1a1917",
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {isEdit ? "Edit Contact" : "Add Contact"}
        </h3>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Name
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            Designation
            <input
              type="text"
              placeholder="e.g. Manager, Sales"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Phone Number
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              style={{ ...inputStyle, marginBottom: "20px" }}
              required
            />
          </label>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                ...btnBase,
                background: "#f5f4f1",
                color: "#1a1917",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e6e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f4f1")}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...btnBase,
                background: "#1a1917",
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
            >
              {isEdit ? "Update" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
