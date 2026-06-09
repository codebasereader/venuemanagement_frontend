export default function DeleteConfirmModal({
  open,
  title,
  message,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={() => !loading && onClose?.()}
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
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #ece9e4",
          padding: 22,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20,
            color: "#1a1917",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "10px 0 0",
            color: "#6b6966",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "1px solid #d9d6d0",
              borderRadius: 10,
              background: "#fff",
              color: "#6b6966",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              background: loading ? "#f59a93" : "#dc2626",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
