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
  padding: 14,
  maxWidth: 760,
  width: "100%",
  maxHeight: "92vh",
  overflowY: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  border: "1px solid #ece9e4",
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
  const [form, setForm] = useState({
    vendorType: "",
    paymentCategory: "cash",
    companyName: "",
    vendorName: "",
    legalCategory: "individual",
    address: "",
    gst: "",
    pan: "",
    aadhar: "",
    msmedNo: "",
    bankName: "",
    beneficiaryName: "",
    bankPincode: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    contact: "",
    phone: "",
    alternatePhone: "",
    email: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      vendorType: "",
      paymentCategory: "cash",
      companyName: "",
      vendorName: "",
      legalCategory: "individual",
      address: "",
      gst: "",
      pan: "",
      aadhar: "",
      msmedNo: "",
      bankName: "",
      beneficiaryName: "",
      bankPincode: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      contact: "",
      phone: "",
      alternatePhone: "",
      email: "",
    });
  }, [isOpen]);

  const handleClose = () => {
    if (!submitting) {
      onClose?.();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vendorName.trim() || !form.vendorType.trim()) return;
    onSubmit({
      name: form.vendorName.trim(),
      vendorType: form.vendorType.trim(),
      paymentCategory: form.paymentCategory,
      companyName: form.companyName.trim() || undefined,
      legalCategory: form.legalCategory,
      address: form.address.trim() || undefined,
      gst: form.gst.trim().toUpperCase() || undefined,
      pan: form.pan.trim().toUpperCase() || undefined,
      aadhar: form.aadhar.trim() || undefined,
      msmedNo: form.msmedNo.trim() || undefined,
      contact: form.contact.trim() || undefined,
      phone: form.phone.trim() || undefined,
      alternatePhone: form.alternatePhone.trim() || undefined,
      email: form.email.trim() || undefined,
      bankDetails: {
        bankName: form.bankName.trim() || undefined,
        beneficiaryName: form.beneficiaryName.trim() || undefined,
        bankPincode: form.bankPincode.trim() || undefined,
        accountNumber: form.accountNumber.trim() || undefined,
        ifscCode: form.ifscCode.trim().toUpperCase() || undefined,
        branch: form.branch.trim() || undefined,
      },
    });
  };

  if (!isOpen) return null;

  const canSubmit = Boolean(form.vendorName.trim() && form.vendorType.trim());

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
          Add Vendor
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <Field label="Vendor Type *"><input value={form.vendorType} onChange={(e) => setForm((p) => ({ ...p, vendorType: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Specify Category *">
              <select value={form.paymentCategory} onChange={(e) => setForm((p) => ({ ...p, paymentCategory: e.target.value }))} style={inputStyle}>
                <option value="cash">Cash</option>
                <option value="account_cash">Account Cash</option>
                <option value="account">Account</option>
              </select>
            </Field>
            <Field label="Company Name"><input value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Vendor Name *"><input value={form.vendorName} onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Category *">
              <select value={form.legalCategory} onChange={(e) => setForm((p) => ({ ...p, legalCategory: e.target.value }))} style={inputStyle}>
                <option value="individual">Individual</option>
                <option value="huf">HUF</option>
                <option value="firm">Firm</option>
                <option value="company">Company</option>
              </select>
            </Field>
            <Field label="Contact Name"><input value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Phone Number"><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Alternate Phone Number"><input value={form.alternatePhone} onChange={(e) => setForm((p) => ({ ...p, alternatePhone: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Email ID"><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Address" full><textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} /></Field>
            <Field label="GST"><input value={form.gst} onChange={(e) => setForm((p) => ({ ...p, gst: e.target.value }))} style={inputStyle} /></Field>
            <Field label="PAN"><input value={form.pan} onChange={(e) => setForm((p) => ({ ...p, pan: e.target.value }))} style={inputStyle} /></Field>
            <Field label="AADHAR"><input value={form.aadhar} onChange={(e) => setForm((p) => ({ ...p, aadhar: e.target.value }))} style={inputStyle} /></Field>
            <Field label="MSMED No"><input value={form.msmedNo} onChange={(e) => setForm((p) => ({ ...p, msmedNo: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Bank Name"><input value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Beneficiary Name / Company Name"><input value={form.beneficiaryName} onChange={(e) => setForm((p) => ({ ...p, beneficiaryName: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Bank PIN Code"><input value={form.bankPincode} onChange={(e) => setForm((p) => ({ ...p, bankPincode: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Account Number"><input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} style={inputStyle} /></Field>
            <Field label="IFSC Code"><input value={form.ifscCode} onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Branch"><input value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} style={inputStyle} /></Field>
          </div>

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

function Field({ label, children, full = false }) {
  return (
    <div style={{ minWidth: 0, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

