import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getVendor } from "../api/vendors.js";

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0" }}>
      <div style={{ color: "#6b6966", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      <div style={{ color: "#1a1917", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", textAlign: "right" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        marginTop: 4,
        marginBottom: 2,
        fontSize: 12,
        fontWeight: 900,
        color: "#6b6966",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export default function VendorDetailsPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { access_token, venueId } = useSelector((state) => state.user.value);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!access_token || !venueId || !vendorId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getVendor(venueId, vendorId, access_token);
        if (!cancelled) setVendor(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load vendor details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [access_token, venueId, vendorId]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <button
        type="button"
        onClick={() => navigate("/vendors")}
        style={{
          marginBottom: 14,
          padding: "8px 12px",
          borderRadius: 10,
          border: "1px solid #e8e6e2",
          background: "#faf9f7",
          color: "#1a1917",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ← Back to vendors
      </button>

      <h1 style={{ margin: "0 0 14px", fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, color: "#1a1917", fontFamily: "'DM Serif Display', Georgia, serif" }}>
        Vendor Details
      </h1>

      {loading && (
        <div style={{ padding: 14, border: "1px dashed #e8e6e2", borderRadius: 12, color: "#6b6966", fontWeight: 700 }}>
          Loading vendor details...
        </div>
      )}

      {!!error && (
        <div style={{ marginBottom: 12, padding: 12, border: "1px solid #f6c8c2", borderRadius: 12, background: "#fde8e6", color: "#a33b2d", fontWeight: 700 }}>
          {error}
        </div>
      )}

      {!loading && vendor && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #ece9e4", padding: 14 }}>
          <SectionTitle>Basic Details</SectionTitle>
          <InfoRow label="Name" value={vendor?.name} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Vendor type" value={vendor?.vendorType || vendor?.category} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Payment category" value={vendor?.paymentCategory} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Legal category" value={vendor?.legalCategory} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Company name" value={vendor?.companyName} />

          <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 6 }} />
          <SectionTitle>Contact Details</SectionTitle>
          <InfoRow label="Contact person" value={vendor?.contact || vendor?.contactName} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Phone number" value={vendor?.phone} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Alternate phone" value={vendor?.alternatePhone || vendor?.altPhone} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Email ID" value={vendor?.email} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Address" value={vendor?.address} />

          <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 6 }} />
          <SectionTitle>KYC Details</SectionTitle>
          <InfoRow label="GST" value={vendor?.gst} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="PAN" value={vendor?.pan} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="AADHAR" value={vendor?.aadhar} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="MSMED No" value={vendor?.msmedNo} />

          <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 6 }} />
          <SectionTitle>Bank Details</SectionTitle>
          <InfoRow label="Bank name" value={vendor?.bankDetails?.bankName} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Beneficiary name" value={vendor?.bankDetails?.beneficiaryName} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Bank PIN code" value={vendor?.bankDetails?.bankPincode} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Account number" value={vendor?.bankDetails?.accountNumber} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="IFSC code" value={vendor?.bankDetails?.ifscCode} />
          <div style={{ borderTop: "1px solid #f1f0ee" }} />
          <InfoRow label="Branch" value={vendor?.bankDetails?.branch} />

          {(vendor?.notes || "").trim() && (
            <>
              <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 6 }} />
              <SectionTitle>Other</SectionTitle>
              <InfoRow label="Notes" value={vendor?.notes} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
