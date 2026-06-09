import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddLeads from "../leaditems/AddLeads.jsx";
import { createLead, deleteLead, listLeadStats, listLeads } from "../api/leads.js";
import LeadCard from "./leads/components/LeadCard.jsx";
import DeleteLeadConfirmModal from "./leads/components/DeleteLeadConfirmModal.jsx";
import EventDetailsDrawer from "./leads/components/EventDetailsDrawer.jsx";
import LeadsCalendarView from "./leads/components/LeadsCalendarView.jsx";
import {
  CalendarIcon,
  PlusIcon,
  SearchIcon,
} from "./leads/components/LeadIcons.jsx";
import {
  STATUS_TABS,
  getLeadDateRange,
  getLeadDaysForMonth,
  normalizeStatusFilter,
  parseLeadsResponse,
  toDateKey,
} from "./leads/leadsHelpers.js";

const Leads = () => {
  const navigate = useNavigate();
  const { access_token, venueId } = useSelector((state) => state.user.value);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [calendarMode, setCalendarMode] = useState("month");
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [drawerDateKey, setDrawerDateKey] = useState(null);
  const [drawerEvents, setDrawerEvents] = useState([]);
  const [leadStats, setLeadStats] = useState({
    totalLeads: 0,
    inProgress: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const statsScopeLabel =
    calendarMode === "month"
      ? `${new Date(calendarYear, calendarMonth, 1).toLocaleString("en-US", {
          month: "long",
        })} ${calendarYear}`
      : `${calendarYear}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, startDateFilter, endDateFilter]);

  const fetchLeads = useCallback(async () => {
    if (!venueId || !access_token) return;
    setError("");
    setLoading(true);
    try {
      const data = await listLeads(venueId, access_token, {
        search: searchQuery || undefined,
        eventStatus: normalizeStatusFilter(statusFilter) || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        page,
        limit,
      });
      const parsed = parseLeadsResponse(data);
      setLeads(parsed.items);
      setTotalCount(parsed.total);
      setTotalPages(parsed.totalPages);
      setLimit(parsed.limit || limit);
      if (parsed.page && parsed.page !== page) {
        setPage(parsed.page);
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Failed to load leads. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    venueId,
    access_token,
    searchQuery,
    statusFilter,
    startDateFilter,
    endDateFilter,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchLeads().catch(() => {});
  }, [fetchLeads]);

  useEffect(() => {
    if (!venueId || !access_token) return;
    let cancelled = false;
    (async () => {
      try {
        const params = {
          search: searchQuery || undefined,
          eventStatus: normalizeStatusFilter(statusFilter) || undefined,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
          view: calendarMode,
          year: calendarYear,
          ...(calendarMode === "month" ? { month: calendarMonth + 1 } : {}),
        };
        const data = await listLeadStats(venueId, access_token, params);
        if (cancelled) return;
        setLeadStats({
          totalLeads: Number(data?.totalLeads ?? data?.total ?? 0),
          inProgress: Number(data?.inProgress ?? data?.in_progress ?? 0),
          confirmed: Number(data?.confirmed ?? 0),
          cancelled: Number(data?.cancelled ?? 0),
        });
      } catch {
        if (!cancelled) {
          setLeadStats({
            totalLeads: 0,
            inProgress: 0,
            confirmed: 0,
            cancelled: 0,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    venueId,
    access_token,
    searchQuery,
    statusFilter,
    startDateFilter,
    endDateFilter,
    calendarMode,
    calendarYear,
    calendarMonth,
  ]);

  const handleAdd = () => {
    setIsAddOpen(true);
  };

  const handleViewDetails = (lead) => {
    const id = lead?._id || lead?.id;
    if (id) navigate(`/leads/${id}`);
  };

  const handleDeleteConfirm = async () => {
    const leadId = deleteCandidate?._id || deleteCandidate?.id;
    if (!leadId || !venueId || !access_token) return;
    try {
      setDeleteLoading(true);
      await deleteLead(venueId, leadId, access_token);
      setDeleteCandidate(null);

      const hasOnlyOneItemOnPage = leads.length <= 1;
      if (hasOnlyOneItemOnPage && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        await fetchLeads();
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to delete lead. Please try again.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters = Boolean(search.trim() || statusFilter || startDateFilter || endDateFilter);
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalCount);
  const activeStatusTab = normalizeStatusFilter(statusFilter) || "all";

  const calendarLeads = useMemo(() => {
    return leads.filter((lead) => {
      const normalized = normalizeStatusFilter(lead?.eventStatus);
      if (activeStatusTab !== "all" && normalized !== activeStatusTab) return false;
      return Boolean(getLeadDateRange(lead));
    });
  }, [leads, activeStatusTab]);

  const leadsByDate = useMemo(() => {
    const map = {};
    if (calendarMode === "month") {
      calendarLeads.forEach((lead) => {
        getLeadDaysForMonth(lead, calendarYear, calendarMonth).forEach((key) => {
          if (!map[key]) map[key] = [];
          map[key].push(lead);
        });
      });
      return map;
    }
    calendarLeads.forEach((lead) => {
      const range = getLeadDateRange(lead);
      if (!range) return;
      const cursor = new Date(range.start);
      while (cursor <= range.end) {
        if (cursor.getFullYear() === calendarYear) {
          const key = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
          if (!map[key]) map[key] = [];
          map[key].push(lead);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [calendarLeads, calendarMode, calendarYear, calendarMonth]);

  const openDayDetails = (key) => {
    setDrawerDateKey(key);
    setDrawerEvents(leadsByDate[key] || []);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: "1280px",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
            <div style={{ display: "inline-flex", border: "1px solid #e8e6e2", borderRadius: 10, overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{ border: "none", padding: "8px 12px", background: viewMode === "list" ? "#1a1917" : "#fff", color: viewMode === "list" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                style={{ border: "none", padding: "8px 12px", background: viewMode === "calendar" ? "#1a1917" : "#fff", color: viewMode === "calendar" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
              >
                Calendar
              </button>
            </div>
          </div>
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

        {/* Search + status/date filters */}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              minWidth: 170,
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              color: "#1a1917",
              outline: "none",
            }}
          >
            <option value="">All statuses</option>
            <option value="in_progress">In progress</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <CalendarIcon />
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              max={endDateFilter || undefined}
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
            <span style={{ fontSize: 12, color: "#9a9896" }}>to</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              min={startDateFilter || undefined}
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
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSearchQuery("");
              setStatusFilter("");
              setStartDateFilter("");
              setEndDateFilter("");
              setPage(1);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e8e6e2",
              background: "#fff",
              color: "#6b6966",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: hasActiveFilters ? "pointer" : "not-allowed",
              opacity: hasActiveFilters ? 1 : 0.6,
            }}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>

        {viewMode === "list" && (
          <div style={{ marginBottom: 14, fontSize: 13, color: "#6b6966", fontWeight: 600 }}>
            Showing {showingFrom}-{showingTo} of {totalCount} leads
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key === "all" ? "" : tab.key)}
              style={{ border: "none", borderRadius: 999, padding: "8px 13px", fontWeight: 800, fontSize: 12, background: activeStatusTab === tab.key ? "#1a1917" : "#f0ede8", color: activeStatusTab === tab.key ? "#fff" : "#1a1917", cursor: "pointer" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {viewMode === "calendar" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: "#6b6966" }}>
              {calendarMode === "month" ? "Monthly stats" : "Yearly stats"} · {statsScopeLabel}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              <div
                style={{
                  border: "1px solid #fcd34d",
                  background: activeStatusTab === "in_progress" ? "#fef3c7" : "#fffbeb",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>In progress</div>
                <div style={{ fontSize: 22, color: "#78350f", fontWeight: 800, marginTop: 2 }}>{leadStats.inProgress}</div>
              </div>
              <div
                style={{
                  border: "1px solid #86efac",
                  background: activeStatusTab === "confirmed" ? "#dcfce7" : "#f0fdf4",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Confirmed</div>
                <div style={{ fontSize: 22, color: "#14532d", fontWeight: 800, marginTop: 2 }}>{leadStats.confirmed}</div>
              </div>
              <div
                style={{
                  border: "1px solid #fca5a5",
                  background: activeStatusTab === "cancelled" ? "#fee2e2" : "#fef2f2",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Cancelled</div>
                <div style={{ fontSize: 22, color: "#7f1d1d", fontWeight: 800, marginTop: 2 }}>{leadStats.cancelled}</div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "list" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            {loading &&
              Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee", padding: "18px 20px", minHeight: 120 }} />
              ))}
            {!loading &&
              leads.map((lead) => (
                <LeadCard
                  key={lead?._id || lead?.id}
                  lead={lead}
                  onViewDetails={handleViewDetails}
                  onDeleteClick={setDeleteCandidate}
                  deleting={deleteLoading}
                />
              ))}
          </div>
        )}

        {viewMode === "calendar" && (
          <LeadsCalendarView
            calendarMode={calendarMode}
            setCalendarMode={setCalendarMode}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            calendarYear={calendarYear}
            setCalendarYear={setCalendarYear}
            leadsByDate={leadsByDate}
            onDayClick={openDayDetails}
          />
        )}

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#6b6966", fontWeight: 700 }}>
              Per page
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #e8e6e2",
                background: "#fff",
              }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e8e6e2",
                background: "#fff",
                cursor: page <= 1 || loading ? "not-allowed" : "pointer",
                opacity: page <= 1 || loading ? 0.6 : 1,
              }}
            >
              Prev
            </button>
            <span style={{ fontSize: 13, color: "#6b6966", minWidth: 90, textAlign: "center" }}>
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(Math.max(1, totalPages), prev + 1))}
              disabled={page >= Math.max(1, totalPages) || loading}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e8e6e2",
                background: "#fff",
                cursor:
                  page >= Math.max(1, totalPages) || loading
                    ? "not-allowed"
                    : "pointer",
                opacity: page >= Math.max(1, totalPages) || loading ? 0.6 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>

        {!!error && (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#fde8e6",
              border: "1px solid #f6c8c2",
              color: "#a33b2d",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {!venueId && (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#faf9f7",
              border: "1px dashed #e8e6e2",
              color: "#6b6966",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            No venue assigned. Leads are per-venue, so please assign a venue to this user.
          </div>
        )}

        {!loading && leads.length === 0 && (
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
              {hasActiveFilters ? "Try adjusting your search or filters." : "Add a lead to get started."}
            </p>
          </div>
        )}
      </div>

      <AddLeads
        isOpen={isAddOpen}
        submitting={submitting}
        onClose={() => setIsAddOpen(false)}
        onSubmit={async (payload) => {
          try {
            setSubmitting(true);
            if (!venueId) throw new Error("No venue assigned to user.");
            await createLead(venueId, payload, access_token);
            setIsAddOpen(false);
            setSearch("");
            setSearchQuery("");
            setStatusFilter("");
            setStartDateFilter("");
            setEndDateFilter("");
            setPage(1);
          } catch (err) {
            setError(
              err.response?.data?.error?.message ||
                err.message ||
                "Failed to create lead. Please try again.",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      />

      <DeleteLeadConfirmModal
        isOpen={Boolean(deleteCandidate)}
        leadName={deleteCandidate?.contact?.name || deleteCandidate?.clientName || ""}
        loading={deleteLoading}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
      />
      <EventDetailsDrawer
        open={Boolean(drawerDateKey)}
        dateKey={drawerDateKey}
        events={drawerEvents}
        onClose={() => {
          setDrawerDateKey(null);
          setDrawerEvents([]);
        }}
        onViewDetails={handleViewDetails}
      />
    </>
  );
};

export default Leads;
