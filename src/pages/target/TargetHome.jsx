import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { message } from "antd";
import {
  getMonthlyPlan,
  upsertMonthlyPlan,
  getYearlyPlan,
} from "../../api/target";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  mergeRowsWithApiData,
  parseNum,
} from "./utils/targetHelpers";
import { FONT, SERIF } from "./utils/targetStyles";
import { BarChartIcon, CalendarIcon } from "./components/TargetIcons";
import LoadingState from "./components/LoadingState";
import MonthlyPlanTable from "./components/MonthlyPlanTable";
import MonthlyMobileCards from "./components/MonthlyMobileCards";
import YearlyPlanTable from "./components/YearlyPlanTable";

// â”€â”€â”€ Responsive breakpoint CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Injected once â€” controls which view (table vs cards) is visible at each breakpoint.

const RESPONSIVE_CSS = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .target-desktop-only { display: block; }
  .target-mobile-only  { display: none; }
  @media (max-width: 767px) {
    .target-desktop-only { display: none; }
    .target-mobile-only  { display: block; }
  }
`;

// â”€â”€â”€ Tab config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = [
  { key: "monthly", label: "Monthly", Icon: CalendarIcon },
  { key: "yearly", label: "Yearly", Icon: BarChartIcon },
];

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function TargetHome() {
  const [activeTab, setActiveTab] = useState("monthly");

  // Monthly state
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [savedRows, setSavedRows] = useState([]);
  const [draftRows, setDraftRows] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [saveSubmitting, setSaveSubmitting] = useState(false);

  // Yearly state
  const [yearlyYear, setYearlyYear] = useState(CURRENT_YEAR);
  const [yearlyData, setYearlyData] = useState(null);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  const { venueId, access_token: accessToken } = useSelector(
    (state) => state.user.value,
  );


  const fetchMonthly = useCallback(async () => {
    if (!venueId || !accessToken) return;
    setMonthlyLoading(true);
    try {
      const data = await getMonthlyPlan(
        accessToken,
        venueId,
        selectedMonth,
        selectedYear,
      );
      const rows = mergeRowsWithApiData(data);
      setSavedRows(rows);
      setDraftRows(rows.map((r) => ({ ...r })));
    } catch {
      setSavedRows([]);
      setDraftRows([]);
    } finally {
      setMonthlyLoading(false);
    }
  }, [venueId, accessToken, selectedMonth, selectedYear]);

  useEffect(() => {
    if (activeTab === "monthly") {
      setEditMode(false);
      fetchMonthly();
    }
  }, [fetchMonthly, activeTab]);

  // â”€â”€ Fetch yearly plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchYearly = useCallback(async () => {
    if (!venueId || !accessToken) return;
    setYearlyLoading(true);
    try {
      const data = await getYearlyPlan(accessToken, venueId, yearlyYear);
      setYearlyData(Array.isArray(data) ? data : (data?.months ?? []));
    } catch {
      setYearlyData([]);
    } finally {
      setYearlyLoading(false);
    }
  }, [venueId, accessToken, yearlyYear]);

  useEffect(() => {
    if (activeTab === "yearly") fetchYearly();
  }, [fetchYearly, activeTab]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleCellChange = (idx, field, value) => {
    setDraftRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  };

  const handleEdit = () => {
    setDraftRows(savedRows.map((r) => ({ ...r })));
    setEditMode(true);
  };

  const handleCancel = () => {
    setDraftRows(savedRows.map((r) => ({ ...r })));
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaveSubmitting(true);
    try {
      const payload = {
        month: selectedMonth,
        year: selectedYear,
        rows: draftRows.map((r) => ({
          rowType: r.rowType,
          spaceId: r.spaceId || null,
          spaceName: r.spaceName,
          expectedBookings: parseNum(r.expectedBookings) ?? 0,
          expectedBusiness: parseNum(r.expectedBusiness) ?? 0,
          expectedExpenses: parseNum(r.expectedExpenses) ?? 0,
        })),
      };
      const data = await upsertMonthlyPlan(accessToken, venueId, payload);
      const rows = mergeRowsWithApiData(data);
      setSavedRows(rows);
      setDraftRows(rows.map((r) => ({ ...r })));
      setEditMode(false);
      message.success("Business plan saved");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to save business plan",
      );
    } finally {
      setSaveSubmitting(false);
    }
  };

  const handleMonthChange = (m) => {
    setEditMode(false);
    setSelectedMonth(m);
  };
  const handleYearChange = (y) => {
    setEditMode(false);
    setSelectedYear(y);
  };

  // â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const isMonthlyLoading = monthlyLoading;
  const displayRows = editMode ? draftRows : savedRows;
  const isLoading = activeTab === "monthly" ? isMonthlyLoading : yearlyLoading;

  const monthlyProps = {
    rows: displayRows,
    editMode,
    saving: saveSubmitting,
    onCellChange: handleCellChange,
    onEdit: handleEdit,
    onSave: handleSave,
    onCancel: handleCancel,
    selectedMonth,
    selectedYear,
    onMonthChange: handleMonthChange,
    onYearChange: handleYearChange,
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 28px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <style>{RESPONSIVE_CSS}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: "clamp(22px, 5vw, 30px)",
            color: "#1a1917",
            lineHeight: 1.2,
          }}
        >
          Business Plan
        </h1>
        <p
          style={{
            margin: "5px 0 0",
            fontFamily: FONT,
            fontSize: 14,
            color: "#9a9896",
          }}
        >
          Plan expected targets and compare against actual performance
        </p>
      </div>

      {/* Tab switcher */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
      >
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveTab(key);
              setEditMode(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 13,
              background: activeTab === key ? "#1a1917" : "#f0ede8",
              color: activeTab === key ? "#fff" : "#1a1917",
              transition: "background 0.15s, color 0.15s",
              boxShadow:
                activeTab === key ? "0 2px 8px rgba(26,25,23,0.15)" : "none",
            }}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece9e4",
          borderRadius: 14,
          padding: "clamp(14px, 2.5vw, 24px)",
          minHeight: 300,
        }}
      >
        {isLoading ? (
          <LoadingState />
        ) : activeTab === "monthly" ? (
          <>
            <div className="target-desktop-only">
              <MonthlyPlanTable {...monthlyProps} />
            </div>
            <div className="target-mobile-only">
              <MonthlyMobileCards {...monthlyProps} />
            </div>
          </>
        ) : (
          <YearlyPlanTable
            yearlyYear={yearlyYear}
            onYearChange={setYearlyYear}
            yearlyData={yearlyData}
          />
        )}
      </div>
    </div>
  );
}
