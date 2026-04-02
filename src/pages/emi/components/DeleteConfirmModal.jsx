import React from "react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  message: msg,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(26,25,23,0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm delete"
        style={{
          width: "min(400px, 100%)",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #ece9e4",
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 18,
                color: "#1a1917",
              }}
            >
              Delete EMI Bill
            </h3>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                color: "#6b6966",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
              }}
            >
              {msg || "Are you sure? This action cannot be undone."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "1px solid #d9d6d0",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#6b6966",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: loading ? "#f9a09a" : "#dc2626",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              transition: "background 0.15s",
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
