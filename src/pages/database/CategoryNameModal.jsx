import { useEffect, useState } from "react";
import {
  createDatabaseCategory,
  updateDatabaseCategory,
  getApiErrorMessage,
} from "../../api/database";
import { getEntityId } from "./databaseHelpers";

function Field({ label, children, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b6966" }}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d9d6d0",
  borderRadius: 10,
  fontSize: 14,
  color: "#1a1917",
  background: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};

export default function CategoryNameModal({
  open,
  category,
  token,
  venueId,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setError("");
  }, [open, category]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }
    if (!token) {
      setError("Missing authentication.");
      return;
    }
    if (!venueId) {
      setError("Missing venue id.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = { venueId, name: trimmed };
      const saved = isEdit
        ? await updateDatabaseCategory(getEntityId(category), payload, token)
        : await createDatabaseCategory(payload, token);
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save category."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={() => !submitting && onClose?.()}
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
        aria-label={isEdit ? "Edit category" : "Add category"}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
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
          {isEdit ? "Edit category" : "Add category"}
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: 16, display: "grid", gap: 14 }}
        >
          {error ? (
            <p
              style={{
                margin: 0,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #f6c8c2",
                background: "#fde8e6",
                color: "#a33b2d",
                fontSize: 13,
              }}
            >
              {error}
            </p>
          ) : null}

          <Field label="Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              disabled={submitting}
              style={inputStyle}
            />
          </Field>

          <footer
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "10px 16px",
                border: "1px solid #d9d6d0",
                borderRadius: 10,
                background: "#fff",
                color: "#6b6966",
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 10,
                background: submitting ? "#6b6966" : "#1a1917",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Saving…" : "Submit"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

