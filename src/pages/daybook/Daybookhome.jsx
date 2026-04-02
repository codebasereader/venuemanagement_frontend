import React, { useEffect, useState } from "react";
import { Tabs, Space, Button, message, Spin } from "antd";
import { useSelector } from "react-redux";
import { getDaybookData } from "../../api/daybook.js";
import SummaryCards from "./components/SummaryCards.jsx";
import InflowItemsList from "./components/InflowItemsList.jsx";
import OutflowItemsList from "./components/OutflowItemsList.jsx";

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

const dateInputStyle = {
  minWidth: 180,
  padding: "9px 12px",
  border: "1px solid #d9d9d9",
  borderRadius: 8,
  fontSize: 14,
  color: "#1a1917",
  background: "#fff",
};

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function requestDaybookData({ venueId, accessToken, selectedDate }) {
  return getDaybookData(venueId, accessToken, {
    date: selectedDate,
  });
}

export const Daybookhome = () => {
  const [daybookData, setDaybookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue);
  const {
    venueId,
    venue,
    access_token: accessToken,
  } = useSelector((state) => state.user.value);

  useEffect(() => {
    let isCancelled = false;

    async function loadDaybook() {
      if (!venueId || !accessToken) {
        setDaybookData(null);
        return;
      }

      try {
        setLoading(true);
        const response = await requestDaybookData({
          venueId,
          accessToken,
          selectedDate,
        });

        if (!isCancelled) {
          if (response.success) {
            setDaybookData(response.data);
          } else {
            message.error(response.message || "Failed to fetch daybook data");
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching daybook:", error);
          message.error(
            error.response?.data?.message || "Failed to fetch daybook data",
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadDaybook();

    return () => {
      isCancelled = true;
    };
  }, [venueId, accessToken, selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleRefresh = async () => {
    if (!venueId || !accessToken) {
      return;
    }

    try {
      setLoading(true);
      const response = await requestDaybookData({
        venueId,
        accessToken,
        selectedDate,
      });

      if (response.success) {
        setDaybookData(response.data);
      } else {
        message.error(response.message || "Failed to fetch daybook data");
      }
    } catch (error) {
      console.error("Error fetching daybook:", error);
      message.error(
        error.response?.data?.message || "Failed to fetch daybook data",
      );
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={pageContainerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Daybook</div>
        <p style={{ color: "#8a8580", margin: "0 0 16px" }}>
          {venue?.name || "Selected venue"}
        </p>
        <div style={filterContainerStyle}>
          <Space size="middle">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={dateInputStyle}
            />
            <Button type="primary" onClick={handleRefresh} loading={loading}>
              Refresh
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

          <div style={contentStyle}>
            <Tabs
              items={[
                {
                  key: "inflow",
                  label: "Inflow",
                  children: (
                    <InflowItemsList
                      items={daybookData?.inflowItems || []}
                      loading={loading}
                    />
                  ),
                },
                {
                  key: "outflow",
                  label: "Outflow",
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
