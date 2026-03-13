import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getLeadById, updateLead } from "../../api/leads.js";
import AddLeads from "../../leaditems/AddLeads.jsx";
import LeadTabs from "../../leaditems/details/LeadTabs.jsx";
import LeadDetailsTab from "../../leaditems/details/LeadDetailsTab.jsx";
import LeadQuotesTab from "../../leaditems/details/LeadQuotesTab.jsx";
import LeadPaymentsTab from "../../leaditems/details/LeadPaymentsTab.jsx";

function BackIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function formatPhone(phone) {
  if (!phone) return "—";
  return String(phone);
}

export default function LeadDetailsPage() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const { access_token, venueId } = useSelector((state) => state.user.value);

  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lead, setLead] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadLead = useCallback(async () => {
    if (!venueId || !access_token || !leadId) return;
    setError("");
    setLoading(true);
    try {
      const data = await getLeadById(venueId, leadId, access_token);
      setLead(data);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Failed to load lead details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [venueId, access_token, leadId]);

  useEffect(() => {
    let cancelled = false;
    loadLead().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loadLead]);

  const handleUpdateLead = useCallback(
    async (_leadId, payload) => {
      if (!venueId || !access_token || !leadId) return;
      setError("");
      setEditSubmitting(true);
      try {
        await updateLead(venueId, leadId, payload, access_token);
        setIsEditOpen(false);
        await loadLead();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to update lead.",
        );
      } finally {
        setEditSubmitting(false);
      }
    },
    [venueId, access_token, leadId, loadLead],
  );

  const headerTitle = useMemo(() => {
    const name = lead?.contact?.name;
    return name ? name : "Lead Details";
  }, [lead]);

  const phone = lead?.contact?.phone;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 auto" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Back"
            title="Back"
          >
            <BackIcon />
          </button>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "clamp(18px, 3.6vw, 22px)",
                fontWeight: 800,
                color: "#1a1917",
                fontFamily: "'DM Serif Display', Georgia, serif",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "min(760px, 75vw)",
              }}
            >
              {headerTitle}
            </div>
            <div style={{ fontSize: 13, color: "#6b6966", fontWeight: 700 }}>
              {formatPhone(phone)}
            </div>
          </div>
        </div>

        {!loading && lead && (
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #d4cfc4",
              background: "#f5f3ef",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Edit
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <LeadTabs activeKey={activeTab} onChange={setActiveTab} />
      </div>

      {(!venueId || !access_token) && (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: "#faf9f7",
            border: "1px dashed #e8e6e2",
            color: "#6b6966",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Missing venue assignment or auth token.
        </div>
      )}

      {!!error && (
        <div
          style={{
            marginTop: 10,
            padding: "14px 16px",
            borderRadius: 16,
            background: "#fde8e6",
            border: "1px solid #f6c8c2",
            color: "#a33b2d",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #ece9e4",
                padding: 16,
              }}
            >
              <div style={{ height: 14, width: "50%", background: "#f0ede8", borderRadius: 8, marginBottom: 12 }} />
              <div style={{ height: 10, width: "90%", background: "#f0ede8", borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 10, width: "80%", background: "#f0ede8", borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 10, width: "70%", background: "#f0ede8", borderRadius: 8 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && lead && (
        <div style={{ marginTop: 12 }}>
          {activeTab === "details" && <LeadDetailsTab lead={lead} />}
          {activeTab === "quotes" && <LeadQuotesTab lead={lead} />}
          {activeTab === "payments" && <LeadPaymentsTab lead={lead} />}
        </div>
      )}

      <AddLeads
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editLead={lead}
        onUpdate={handleUpdateLead}
        submitting={editSubmitting}
      />
    </div>
  );
}

