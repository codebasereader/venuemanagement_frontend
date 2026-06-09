import React, { useCallback, useEffect, useState } from "react";
import { Tabs, Space, Button, message, Spin } from "antd";
import { useSelector } from "react-redux";
import { buildDaybookDateParams, getDaybookData } from "../../api/daybook.js";
import SummaryCards from "./components/SummaryCards.jsx";
import InflowItemsList from "./components/InflowItemsList.jsx";
import OutflowItemsList from "./components/OutflowItemsList.jsx";
import DaybookDailyBreakdown from "./components/DaybookDailyBreakdown.jsx";
import {
  dateInputStyle,
  getDaybookErrorMessage,
} from "./daybookHelpers.js";

const pageContainerStyle = {
  padding: "24px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerStyle = {
  marginBottom: 32,
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 900,
  color: "#1a1917",
  marginBottom: 16,
  fontFamily: "'DM Sans', sans-serif",
};

const filterContainerStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};

const contentStyle = {
  marginTop: 24,
};

export const Daybookhome = () => {
  const [daybookData, setDaybookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    venueId,
    venue,
    access_token: accessToken,
  } = useSelector((state) => state.user.value);

  const fetchSummary = useCallback(async () => {
    if (!venueId || !accessToken) {
      setDaybookData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await getDaybookData(
        venueId,
        accessToken,
        buildDaybookDateParams(startDate, endDate),
      );

      if (response.success) {
        setDaybookData(response.data);
      } else {
        message.error(response.error?.message || "Failed to fetch daybook data");
      }
    } catch (error) {
      console.error("Error fetching daybook:", error);
      message.error(getDaybookErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [venueId, accessToken, startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleStartDateChange = (event) => {
    const value = event.target.value;
    setStartDate(value);
    if (endDate && value > endDate) {
      setEndDate(value);
    }
  };

  const handleEndDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
    if (startDate && value < startDate) {
      setStartDate(value);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
  };

  if (!venueId) {
    return (
      <div style={pageContainerStyle}>
        <p style={{ color: "#8a8580" }}>
          Please select a venue to view daybook data.
        </p>
      </div>
    );
  }

  const rangeLabel =
    !startDate && !endDate
      ? "All transactions"
      : startDate && endDate
        ? startDate === endDate
          ? startDate
          : `${startDate} → ${endDate}`
        : startDate
          ? `From ${startDate}`
          : `Until ${endDate}`;

  return (
    <div style={pageContainerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Daybook</div>
        <p style={{ color: "#8a8580", margin: "0 0 16px" }}>
          {venue?.name || "Selected venue"} · {rangeLabel}
        </p>
        <div style={filterContainerStyle}>
          <Space size="middle" wrap>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate || undefined}
              style={dateInputStyle}
              aria-label="Start date"
            />
            <span style={{ color: "#8a8580", fontSize: 13 }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              style={dateInputStyle}
              aria-label="End date"
            />
            <Button onClick={handleReset} disabled={!startDate && !endDate}>
              Reset
            </Button>
          </Space>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {daybookData && <SummaryCards data={daybookData} />}
          <DaybookDailyBreakdown rows={daybookData?.daybook || []} />

          <div style={contentStyle}>
            <Tabs
              items={[
                {
                  key: "inflow",
                  label: `Inflow (${daybookData?.inflowItems?.length || 0})`,
                  children: (
                    <InflowItemsList
                      items={daybookData?.inflowItems || []}
                      loading={loading}
                    />
                  ),
                },
                {
                  key: "outflow",
                  label: `Outflow (${daybookData?.outflowItems?.length || 0})`,
                  children: (
                    <OutflowItemsList
                      items={daybookData?.outflowItems || []}
                      loading={loading}
                    />
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Daybookhome;
