import React, { useMemo, useState } from "react";
import {
  generateEmiMonths,
  findEmiStatus,
  getEmiMonthStatus,
  formatCurrency,
  formatDate,
  formatMonthYear,
} from "./emiUtils";
import EmiFormModal from "./EmiFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MarkPaidModal from "./MarkPaidModal";
import PaymentDetailsModal from "./PaymentDetailsModal";

// ── Icons ───────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronRight({ rotated }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.2s",
        transform: rotated ? "rotate(90deg)" : "none",
        flexShrink: 0,
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ statusInfo }) {
  const palette = {
    paid: { bg: "#dcfce7", color: "#15803d" },
    due_soon: { bg: "#fef3c7", color: "#92400e" },
    overdue: { bg: "#fee2e2", color: "#991b1b" },
    upcoming: { bg: "#f3f4f6", color: "#4b5563" },
  };
  const p = palette[statusInfo.type] || palette.upcoming;

  let text = "";
  if (statusInfo.type === "paid") text = "Paid";
  else if (statusInfo.type === "due_soon")
    text =
      statusInfo.daysLeft === 0
        ? "Due today"
        : `Due in ${statusInfo.daysLeft}d`;
  else if (statusInfo.type === "overdue")
    text = `Overdue ${statusInfo.daysOverdue}d`;
  else text = "Upcoming";

  return (
    <span
      style={{
        display: "inline-block",
        background: p.bg,
        color: p.color,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

// ── Monthly installments sub-table ─────────────────────────────────────────

function MonthlyInstallments({ bill, onMarkPaid, onViewDetails }) {
  const months = useMemo(
    () =>
      bill.emiDate && bill.emi_end_date
        ? generateEmiMonths(bill.emiDate, bill.emi_end_date)
        : [],
    [bill.emiDate, bill.emi_end_date],
  );

  if (!months.length) {
    return (
      <div
        style={{
          padding: "16px 20px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "#9a9896",
        }}
      >
        No monthly installments available.
      </div>
    );
  }

  const thStyle = {
    padding: "8px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "#9a9896",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
    background: "#faf9f7",
  };

  const tdStyle = {
    padding: "10px 14px",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    color: "#1a1917",
    verticalAlign: "middle",
    borderBottom: "1px solid #f3f2ef",
  };

  return (
    <div style={{ padding: "0 0 8px" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Month / Year</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {months.map(({ month, year }) => {
              const statusInfo = getEmiMonthStatus(bill, month, year);
              const emiStatusEntry = findEmiStatus(bill.emiStatus, month, year);
              const amount = emiStatusEntry?.emiAmount ?? bill.defaultAmount;

              return (
                <tr key={`${year}-${month}`}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {formatMonthYear(month, year)}
                  </td>
                  <td style={tdStyle}>{formatCurrency(amount)}</td>
                  <td style={tdStyle}>
                    <StatusBadge statusInfo={statusInfo} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {!statusInfo.status?.paid && (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(bill, month, year)}
                          style={{
                            padding: "5px 12px",
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {statusInfo.status?.paid && (
                        <button
                          type="button"
                          title="View payment details"
                          onClick={() =>
                            onViewDetails(bill, month, year, statusInfo.status)
                          }
                          style={{
                            padding: "5px 10px",
                            background: "#f7f6f3",
                            color: "#1a1917",
                            border: "1px solid #e8e6e2",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <EyeIcon /> View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main List View ──────────────────────────────────────────────────────────

export default function EmiListView({
  bills,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onUpsertStatus,
  addSubmitting,
  editSubmitting,
  deleteSubmitting,
  markPaidSubmitting,
  formError,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [deleteBillTarget, setDeleteBillTarget] = useState(null);
  const [markPaidTarget, setMarkPaidTarget] = useState(null); // { bill, month, year }
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null); // { bill, month, year, status }

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleMarkPaidConfirm = async (payload) => {
    await onUpsertStatus(markPaidTarget.bill._id, payload);
    setMarkPaidTarget(null);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteBill(deleteBillTarget._id);
    setDeleteBillTarget(null);
  };

  return (
    <div>
      {/* Page header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(16px,3.5vw,20px)",
              color: "#1a1917",
            }}
          >
            EMI Bills
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#9a9896",
            }}
          >
            Click a bill to expand its monthly installments
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            background: "#1a1917",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 2px 8px rgba(26,25,23,0.15)",
          }}
        >
          <svg
            width={15}
            height={15}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add EMI
        </button>
      </div>

      {/* Empty state */}
      {bills.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "56px 20px",
            color: "#9a9896",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#6b6966" }}>
            No EMI bills yet
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Click &ldquo;+ Add EMI&rdquo; to create your first recurring bill
          </div>
        </div>
      )}

      {/* Bills list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bills.map((bill) => {
          const isExpanded = expandedId === bill._id;
          const allMonths =
            bill.emiDate && bill.emi_end_date
              ? generateEmiMonths(bill.emiDate, bill.emi_end_date)
              : [];
          const paidCount = allMonths.filter(
            ({ month, year }) =>
              findEmiStatus(bill.emiStatus, month, year)?.paid,
          ).length;

          return (
            <div
              key={bill._id}
              style={{
                border: isExpanded
                  ? "1.5px solid #c5c2be"
                  : "1px solid #ece9e4",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
                transition: "border-color 0.15s",
                boxShadow: isExpanded
                  ? "0 4px 20px rgba(26,25,23,0.06)"
                  : "none",
              }}
            >
              {/* Bill header row */}
              <div
                onClick={() => toggle(bill._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  flexWrap: "wrap",
                  userSelect: "none",
                }}
              >
                {/* Chevron */}
                <span style={{ color: "#9a9896" }}>
                  <ChevronRight rotated={isExpanded} />
                </span>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(13px,2.5vw,15px)",
                      color: "#1a1917",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9a9896",
                      fontFamily: "'DM Sans', sans-serif",
                      marginTop: 2,
                    }}
                  >
                    {bill.emiType
                      ? bill.emiType.charAt(0).toUpperCase() +
                        bill.emiType.slice(1)
                      : "—"}{" "}
                    · {formatCurrency(bill.defaultAmount)}/cycle ·{" "}
                    <span
                      style={{
                        color:
                          paidCount === allMonths.length && allMonths.length > 0
                            ? "#15803d"
                            : "#92400e",
                        fontWeight: 600,
                      }}
                    >
                      {paidCount}/{allMonths.length} paid
                    </span>
                  </div>
                </div>

                {/* Date range */}
                <div
                  style={{
                    fontSize: 11,
                    color: "#9a9896",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Start: {formatDate(bill.emiDate)}</span>
                  <span>End: {formatDate(bill.emi_end_date)}</span>
                </div>

                {/* Edit / Delete - stop propagation so chevron doesn't toggle */}
                <div
                  style={{ display: "flex", gap: 8, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title="Edit bill"
                    onClick={() => setEditBill(bill)}
                    style={{
                      padding: "7px 11px",
                      background: "#f7f6f3",
                      border: "1px solid #e8e6e2",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1a1917",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <PencilIcon /> Edit
                  </button>
                  <button
                    type="button"
                    title="Delete bill"
                    onClick={() => setDeleteBillTarget(bill)}
                    style={{
                      padding: "7px 11px",
                      background: "#fff0f0",
                      border: "1px solid #fca5a5",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#dc2626",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>

              {/* Expandable monthly rows */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #f0ede8" }}>
                  <MonthlyInstallments
                    bill={bill}
                    onMarkPaid={(b, m, y) =>
                      setMarkPaidTarget({ bill: b, month: m, year: y })
                    }
                    onViewDetails={(b, m, y, s) =>
                      setViewDetailsTarget({
                        bill: b,
                        month: m,
                        year: y,
                        status: s,
                      })
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Add bill */}
      <EmiFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          await onAddBill(payload);
          setAddOpen(false);
        }}
        submitting={addSubmitting}
        error={formError}
      />

      {/* Edit bill */}
      <EmiFormModal
        isOpen={!!editBill}
        onClose={() => setEditBill(null)}
        onSubmit={async (payload) => {
          await onEditBill(editBill._id, payload);
          setEditBill(null);
        }}
        submitting={editSubmitting}
        error={formError}
        initialData={editBill}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteBillTarget}
        onClose={() => setDeleteBillTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteSubmitting}
        message={
          deleteBillTarget
            ? `Are you sure you want to delete "${deleteBillTarget.name}"? All monthly EMI records will be permanently removed.`
            : undefined
        }
      />

      {/* Mark paid */}
      {markPaidTarget && (
        <MarkPaidModal
          isOpen
          onClose={() => setMarkPaidTarget(null)}
          onConfirm={handleMarkPaidConfirm}
          submitting={markPaidSubmitting}
          bill={markPaidTarget.bill}
          month={markPaidTarget.month}
          year={markPaidTarget.year}
        />
      )}

      {/* View payment details */}
      {viewDetailsTarget && (
        <PaymentDetailsModal
          isOpen
          onClose={() => setViewDetailsTarget(null)}
          bill={viewDetailsTarget.bill}
          month={viewDetailsTarget.month}
          year={viewDetailsTarget.year}
          status={viewDetailsTarget.status}
        />
      )}
    </div>
  );
}
