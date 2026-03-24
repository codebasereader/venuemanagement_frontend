import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  createVendor,
  deleteVendor,
  listVendors,
  updateVendor,
} from "../api/vendors.js";

const PAGE_SIZE = 10;

const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PAYMENT_CATEGORIES = [
  { value: "cash", label: "Cash" },
  { value: "account_cash", label: "Account Cash" },
  { value: "account", label: "Account" },
];

const LEGAL_CATEGORIES = [
  { value: "individual", label: "Individual" },
  { value: "huf", label: "HUF" },
  { value: "firm", label: "Firm" },
  { value: "company", label: "Company" },
];

const emptyVendorForm = {
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
};

function AddVendorModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
  error,
  mode = "add",
}) {
  if (!isOpen) return null;
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 350,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        background: "rgba(26,25,23,0.45)",
        backdropFilter: "blur(3px)",
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          width: "min(760px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #ece9e4",
          padding: 14,
          boxSizing: "border-box",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Edit vendor" : "Add vendor"}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', Georgia, serif", color: "#1a1917", fontSize: "clamp(18px,4vw,22px)" }}>
            {mode === "edit" ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <button type="button" onClick={onClose} style={{ border: "1px solid #e8e6e2", background: "#faf9f7", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>
            Close
          </button>
        </div>

        {!!error && (
          <div style={{ marginBottom: 10, padding: 10, border: "1px solid #f6c8c2", borderRadius: 10, background: "#fde8e6", color: "#a33b2d", fontSize: 13, fontWeight: 700 }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="Vendor Type *">
            <input value={form.vendorType} onChange={(e) => setField("vendorType", e.target.value)} style={fieldInput} placeholder="Decorator / Catering / DJ" />
          </Field>
          <Field label="Specify Category *">
            <select value={form.paymentCategory} onChange={(e) => setField("paymentCategory", e.target.value)} style={fieldInput}>
              {PAYMENT_CATEGORIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Company Name">
            <input value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Vendor Name *">
            <input value={form.vendorName} onChange={(e) => setField("vendorName", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Category *">
            <select value={form.legalCategory} onChange={(e) => setField("legalCategory", e.target.value)} style={fieldInput}>
              {LEGAL_CATEGORIES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Contact Name">
            <input value={form.contact} onChange={(e) => setField("contact", e.target.value)} style={fieldInput} placeholder="+91 9876543210" />
          </Field>
          <Field label="Phone Number">
            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} style={fieldInput} placeholder="+91 9876543210" />
          </Field>
          <Field label="Alternate Phone Number">
            <input value={form.alternatePhone} onChange={(e) => setField("alternatePhone", e.target.value)} style={fieldInput} placeholder="+91 9XXXXXXXXX" />
          </Field>
          <Field label="Email ID">
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} style={fieldInput} placeholder="vendor@example.com" />
          </Field>
          <Field label="Address" full>
            <textarea value={form.address} onChange={(e) => setField("address", e.target.value)} style={{ ...fieldInput, minHeight: 80, resize: "vertical" }} />
          </Field>
          <Field label="GST">
            <input value={form.gst} onChange={(e) => setField("gst", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="PAN">
            <input value={form.pan} onChange={(e) => setField("pan", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="AADHAR">
            <input value={form.aadhar} onChange={(e) => setField("aadhar", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="MSMED No">
            <input value={form.msmedNo} onChange={(e) => setField("msmedNo", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Bank Name">
            <input value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Beneficiary Name / Company Name">
            <input value={form.beneficiaryName} onChange={(e) => setField("beneficiaryName", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Bank PIN Code">
            <input value={form.bankPincode} onChange={(e) => setField("bankPincode", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Account Number">
            <input value={form.accountNumber} onChange={(e) => setField("accountNumber", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="IFSC Code">
            <input value={form.ifscCode} onChange={(e) => setField("ifscCode", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="Branch">
            <input value={form.branch} onChange={(e) => setField("branch", e.target.value)} style={fieldInput} />
          </Field>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" onClick={onClose} disabled={submitting} style={{ ...actionBtn, background: "#f0ede8", color: "#1a1917" }}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={submitting} style={{ ...actionBtn, background: "#1a1917", color: "#fff" }}>
            {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div style={{ minWidth: 0, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#6b6966", fontWeight: 700 }}>{label}</label>
      {children}
    </div>
  );
}

const fieldInput = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #e8e6e2",
  background: "#fff",
  padding: "10px 12px",
  fontSize: 14,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const actionBtn = {
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
};

function displayType(vendor) {
  return vendor?.vendorType || vendor?.category || "—";
}

function displayContact(vendor) {
  return vendor?.contact || vendor?.phone || vendor?.contactName || "—";
}

function vendorToForm(vendor) {
  const bank = vendor?.bankDetails || {};
  return {
    vendorType: vendor?.vendorType || vendor?.category || "",
    paymentCategory: vendor?.paymentCategory || "cash",
    companyName: vendor?.companyName || "",
    vendorName: vendor?.name || "",
    legalCategory: vendor?.legalCategory || "individual",
    address: vendor?.address || "",
    gst: vendor?.gst || "",
    pan: vendor?.pan || "",
    aadhar: vendor?.aadhar || "",
    msmedNo: vendor?.msmedNo || "",
    bankName: bank?.bankName || "",
    beneficiaryName: bank?.beneficiaryName || "",
    bankPincode: bank?.bankPincode || "",
    accountNumber: bank?.accountNumber || "",
    ifscCode: bank?.ifscCode || "",
    branch: bank?.branch || "",
    contact: displayContact(vendor) === "—" ? "" : displayContact(vendor),
    phone: vendor?.phone || "",
    alternatePhone: vendor?.alternatePhone || vendor?.altPhone || "",
    email: vendor?.email || "",
  };
}

function buildVendorPayload(form) {
  return {
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
  };
}

function VendorCard({ vendor, onView, onEdit, onDelete }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #ece9e4",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        padding: "14px",
        display: "grid",
        gap: 10,
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1917", fontFamily: "'DM Sans', sans-serif" }}>
          {vendor?.name || "—"}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#6b6966", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
          Type: {displayType(vendor)}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, color: "#6b6966", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
          Contact: {displayContact(vendor)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <button
          type="button"
          onClick={() => onView(vendor)}
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 8px",
            borderRadius: 10,
            border: "1px solid #e8e6e2",
            background: "#faf9f7",
            color: "#1a1917",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          <EyeIcon />
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(vendor)}
          style={{
            width: "100%",
            padding: "10px 8px",
            borderRadius: 10,
            border: "1px solid #d9c388",
            background: "#fff8e7",
            color: "#7a5a00",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(vendor)}
          style={{
            width: "100%",
            padding: "10px 8px",
            borderRadius: 10,
            border: "1px solid #f6c8c2",
            background: "#fde8e6",
            color: "#a33b2d",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Vendorslist() {
  const navigate = useNavigate();
  const { access_token, venueId } = useSelector((state) => state.user.value);
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState("");
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [editForm, setEditForm] = useState(emptyVendorForm);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!access_token || !venueId) return;
      setLoading(true);
      setError("");
      try {
        const data = await listVendors(venueId, access_token);
        const arr = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        if (!cancelled) setVendors(arr);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load vendors.");
          setVendors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [access_token, venueId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      const name = String(v?.name || "").toLowerCase();
      const type = String(displayType(v)).toLowerCase();
      const contact = String(displayContact(v)).toLowerCase();
      return name.includes(q) || type.includes(q) || contact.includes(q);
    });
  }, [vendors, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const viewDetails = (vendor) => {
    const id = vendor?._id || vendor?.id;
    if (!id) return;
    navigate(`/vendors/${id}`);
  };

  const submitVendor = async () => {
    if (!vendorForm.vendorName.trim()) {
      setAddError("Vendor name is required.");
      return;
    }
    if (!vendorForm.vendorType.trim()) {
      setAddError("Vendor type is required.");
      return;
    }
    if (!venueId || !access_token) {
      setAddError("Missing venue or auth.");
      return;
    }
    setAddError("");
    setAdding(true);
    try {
      const payload = buildVendorPayload(vendorForm);
      const created = await createVendor(venueId, payload, access_token);
      setVendors((prev) => [created, ...prev]);
      setIsAddOpen(false);
      setVendorForm(emptyVendorForm);
      setSearch("");
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      setAddError(err?.response?.data?.message || "Failed to create vendor.");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (vendor) => {
    const id = vendor?._id || vendor?.id;
    if (!id) return;
    setEditingVendorId(id);
    setEditError("");
    setEditForm(vendorToForm(vendor));
    setIsEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editForm.vendorName.trim()) {
      setEditError("Vendor name is required.");
      return;
    }
    if (!editForm.vendorType.trim()) {
      setEditError("Vendor type is required.");
      return;
    }
    if (!venueId || !access_token || !editingVendorId) {
      setEditError("Missing vendor, venue or auth.");
      return;
    }
    setEditError("");
    setUpdating(true);
    try {
      const payload = buildVendorPayload(editForm);
      const updated = await updateVendor(venueId, editingVendorId, payload, access_token);
      setVendors((prev) =>
        prev.map((v) => ((v?._id || v?.id) === editingVendorId ? { ...v, ...updated } : v)),
      );
      setIsEditOpen(false);
      setEditingVendorId("");
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update vendor.");
    } finally {
      setUpdating(false);
    }
  };

  const removeVendor = async (vendor) => {
    const id = vendor?._id || vendor?.id;
    if (!id || !venueId || !access_token) return;
    const ok = window.confirm(`Delete vendor "${vendor?.name || "this vendor"}"?`);
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteVendor(venueId, id, access_token);
      setVendors((prev) => prev.filter((v) => (v?._id || v?.id) !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete vendor.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(22px,4vw,28px)", color: "#1a1917", fontWeight: 700, fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Vendor Management
        </h1>
        <button
          type="button"
          onClick={() => {
            setAddError("");
            setIsAddOpen(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            background: "#1a1917",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          <PlusIcon />
          Add Vendor
        </button>
      </div>

      <div style={{ marginBottom: 18, position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9a9896", pointerEvents: "none" }}>
          <SearchIcon />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor name, type or contact..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 10,
            border: "1px solid #e8e6e2",
            background: "#faf9f7",
            padding: "12px 14px 12px 42px",
            fontSize: 14,
            color: "#1a1917",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {loading && (
        <div style={{ padding: 14, border: "1px dashed #e8e6e2", borderRadius: 12, color: "#6b6966", fontWeight: 700 }}>
          Loading vendors...
        </div>
      )}

      {!!error && (
        <div style={{ marginBottom: 12, padding: 12, border: "1px solid #f6c8c2", borderRadius: 12, background: "#fde8e6", color: "#a33b2d", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
              gap: 14,
            }}
          >
            {visible.map((vendor) => (
              <VendorCard
                key={vendor?._id || vendor?.id}
                vendor={vendor}
                onView={viewDetails}
                onEdit={openEdit}
                onDelete={removeVendor}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ marginTop: 18, border: "1px dashed #e8e6e2", borderRadius: 12, background: "#faf9f7", padding: "24px 16px", textAlign: "center", color: "#6b6966", fontWeight: 700 }}>
              No vendors found.
            </div>
          )}

          {hasMore && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1a1917",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}

      <AddVendorModal
        isOpen={isAddOpen}
        onClose={() => !adding && setIsAddOpen(false)}
        form={vendorForm}
        setForm={setVendorForm}
        onSubmit={submitVendor}
        submitting={adding}
        error={addError}
        mode="add"
      />

      <AddVendorModal
        isOpen={isEditOpen}
        onClose={() => !updating && setIsEditOpen(false)}
        form={editForm}
        setForm={setEditForm}
        onSubmit={submitEdit}
        submitting={updating}
        error={editError}
        mode="edit"
      />

      {!!deletingId && (
        <div style={{ position: "fixed", bottom: 16, right: 16, background: "#1a1917", color: "#fff", padding: "10px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
          Deleting vendor...
        </div>
      )}
    </div>
  );
}