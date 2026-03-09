import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CalendarIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Sample leads data – replace with API/localStorage when ready
const SAMPLE_LEADS = [
  { id: "1", clientName: "Sarah Mitchell", phone: "+1 (555) 234-5678", createdAt: "2025-03-05T10:30:00" },
  { id: "2", clientName: "James Chen", phone: "+1 (555) 876-5432", createdAt: "2025-03-04T14:20:00" },
  { id: "3", clientName: "Emma Wilson", phone: "+1 (555) 111-2233", createdAt: "2025-03-06T09:15:00" },
  { id: "4", clientName: "Michael Brown", phone: "+1 (555) 444-5566", createdAt: "2025-03-03T16:45:00" },
  { id: "5", clientName: "Olivia Davis", phone: "+1 (555) 777-8899", createdAt: "2025-03-07T08:00:00" },
];

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateForInput(isoString) {
  const d = new Date(isoString);
  return d.toISOString().slice(0, 10);
}

function LeadCard({ lead, onViewDetails }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#1a1917",
          }}
        >
          {lead.clientName}
        </p>
        <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#6b6966" }}>
          {lead.phone}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>
          Created {formatDate(lead.createdAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onViewDetails(lead)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #e8e6e2",
          background: "#faf9f7",
          color: "#1a1917",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f5f4f1";
          e.currentTarget.style.borderColor = "#d4d2ce";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#faf9f7";
          e.currentTarget.style.borderColor = "#e8e6e2";
        }}
      >
        <EyeIcon />
        View details
      </button>
    </div>
  );
}

const Leads = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [leads] = useState(SAMPLE_LEADS);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search.trim() ||
        lead.clientName.toLowerCase().includes(search.trim().toLowerCase()) ||
        lead.phone.replace(/\D/g, "").includes(search.trim().replace(/\D/g, ""));
      const matchesDate =
        !dateFilter ||
        formatDateForInput(lead.createdAt) === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [leads, search, dateFilter]);

  const handleAdd = () => {
    // TODO: open add lead modal or navigate to add lead page
  };

  const handleViewDetails = (lead) => {
    // TODO: navigate to lead detail or open detail modal
    navigate(`/leads/${lead.id}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header: title + Add button */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 4vw, 26px)",
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
              letterSpacing: "-0.02em",
            }}
          >
            Leads
          </h1>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#1a1917",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {/* Search + date filter */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              flex: "1 1 200px",
              minWidth: "180px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9a9896",
                pointerEvents: "none",
              }}
            >
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 44px",
                borderRadius: "10px",
                border: "1px solid #e8e6e2",
                background: "#faf9f7",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#1a1917",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a1917")}
              onBlur={(e) => (e.target.style.borderColor = "#e8e6e2")}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarIcon />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e8e6e2",
                background: "#faf9f7",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: "#1a1917",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a1917")}
              onBlur={(e) => (e.target.style.borderColor = "#e8e6e2")}
            />
          </div>
        </div>

        {/* Lead cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
        >
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onViewDetails={handleViewDetails} />
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#faf9f7",
              borderRadius: "16px",
              border: "1px dashed #e8e6e2",
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#6b6966" }}>
              No leads found
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>
              {search || dateFilter ? "Try adjusting your search or date filter." : "Add a lead to get started."}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Leads;
