import React, { useCallback, useEffect, useState } from "react";
import { Button, message } from "antd";
import { useSelector } from "react-redux";
import { getDaybookList } from "../../api/daybook.js";
import DaybookTransactionsList from "../daybook/components/DaybookTransactionsList.jsx";
import { getDaybookErrorMessage } from "../daybook/daybookHelpers.js";

const LIST_LIMIT = 20;

const pageContainerStyle = {
  padding: "24px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 900,
  color: "#1a1917",
  marginBottom: 8,
  fontFamily: "'DM Sans', sans-serif",
};

const paginationBarStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 20,
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #ece9e4",
  background: "#faf9f7",
};

const pageButtonStyle = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #e8e6e2",
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  minWidth: 88,
};

export default function PaymentsHome() {
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    venueId,
    venue,
    access_token: accessToken,
  } = useSelector((state) => state.user.value);

  const fetchList = useCallback(async () => {
    if (!venueId || !accessToken) {
      setListData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await getDaybookList(venueId, accessToken, {
        page,
        limit: LIST_LIMIT,
      });

      if (response.success) {
        setListData(response.data);
      } else {
        message.error(response.error?.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching payments list:", error);
      message.error(getDaybookErrorMessage(error, "Failed to fetch transactions"));
    } finally {
      setLoading(false);
    }
  }, [venueId, accessToken, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (!venueId) {
    return (
      <div style={pageContainerStyle}>
        <p style={{ color: "#8a8580" }}>
          Please select a venue to view payments.
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, listData?.totalPages || 1);
  const totalCount = listData?.total || 0;
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * LIST_LIMIT + 1;
  const showingTo = Math.min(page * LIST_LIMIT, totalCount);
  const rowOffset = (page - 1) * LIST_LIMIT;
  const items = listData?.items || [];

  return (
    <div style={pageContainerStyle}>
      <div style={{ marginBottom: 24 }}>
        <div style={titleStyle}>Payments</div>
        <p style={{ color: "#8a8580", margin: 0 }}>
          {venue?.name || "Selected venue"} · Complete transaction history
        </p>
      </div>

      <DaybookTransactionsList
        items={items}
        loading={loading}
        rowOffset={rowOffset}
      />

      <div style={paginationBarStyle}>
        <span style={{ color: "#8a8580", fontSize: 13 }}>
          {totalCount === 0
            ? "No transactions"
            : `Showing ${showingFrom}–${showingTo} of ${totalCount}`}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              ...pageButtonStyle,
              cursor: page <= 1 || loading ? "not-allowed" : "pointer",
              opacity: page <= 1 || loading ? 0.6 : 1,
            }}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span
            style={{
              fontSize: 13,
              color: "#1a1917",
              fontWeight: 600,
              minWidth: 100,
              textAlign: "center",
            }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            style={{
              ...pageButtonStyle,
              cursor: page >= totalPages || loading ? "not-allowed" : "pointer",
              opacity: page >= totalPages || loading ? 0.6 : 1,
            }}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </button>
          <Button onClick={fetchList} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
