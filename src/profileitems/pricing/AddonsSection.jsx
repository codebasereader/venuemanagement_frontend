import React, { useState, useCallback } from "react";

const DURATIONS = [
  { key: "12", label: "12h" },
  { key: "24", label: "24h" },
  { key: "36", label: "36h" },
  { key: "48", label: "48h" },
];

const GST_PERCENT = 18;

function makeId() {
  return `addon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultPrices = () => ({ "12": "", "24": "", "36": "", "48": "" });

export default function AddonsSection({ items = [], onChange }) {
  const [editingId, setEditingId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formMaxQty, setFormMaxQty] = useState("");
  const [formPrices, setFormPrices] = useState(defaultPrices());

  const openAdd = useCallback(() => {
    setFormName("");
    setFormMaxQty("");
    setFormPrices(defaultPrices());
    setAddModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingId(item.id);
    setFormName(item.name ?? "");
    setFormMaxQty(item.maxQuantity != null && item.maxQuantity !== "" ? String(item.maxQuantity) : "");
    setFormPrices({ ...defaultPrices(), ...(item.prices ?? {}) });
  }, []);

  const closeModal = useCallback(() => {
    setAddModalOpen(false);
    setEditingId(null);
    setFormName("");
    setFormMaxQty("");
    setFormPrices(defaultPrices());
  }, []);

  const setFormPrice = useCallback((key, value) => {
    setFormPrices((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, "") }));
  }, []);

  const saveItem = useCallback(() => {
    const name = (formName || "").trim();
    if (!name) return;
    const maxQuantity = formMaxQty.trim() === "" ? undefined : Math.max(0, parseInt(formMaxQty, 10) || 0);
    if (editingId) {
      onChange?.(
        items.map((i) =>
          i.id === editingId
            ? { ...i, name, maxQuantity: maxQuantity === undefined ? undefined : maxQuantity, prices: { ...formPrices } }
            : i
        )
      );
      closeModal();
      return;
    }
    onChange?.([
      ...items,
      { id: makeId(), name, maxQuantity, prices: { ...formPrices } },
    ]);
    closeModal();
  }, [formName, formMaxQty, formPrices, editingId, items, onChange, closeModal]);

  const removeItem = useCallback(
    (id) => {
      onChange?.(items.filter((i) => i.id !== id));
      if (editingId === id) closeModal();
    },
    [items, onChange, editingId, closeModal]
  );

  const isModalOpen = addModalOpen || editingId != null;

  return (
    <section style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            ADD-ONS
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b6966" }}>
            Extra items with charges
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #c9a84c",
            background: "#fff",
            color: "#1a1917",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.length === 0 && !isModalOpen && (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              background: "#faf9f7",
              borderRadius: "12px",
              border: "1px dashed #e8e6e2",
              fontSize: "14px",
              color: "#6b6966",
            }}
          >
            No add-ons yet. Click Add to add extra items with charges.
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "16px",
              background: "#faf9f7",
              border: "1px solid #e8e6e2",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1917", marginBottom: "8px" }}>
                  {item.name}
                  {item.maxQuantity != null && item.maxQuantity !== "" && (
                    <span style={{ fontWeight: 400, color: "#6b6966", fontSize: "14px" }}> (max {item.maxQuantity})</span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", marginBottom: "6px" }}>
                  {DURATIONS.map(({ key, label }) => (
                    <span key={key} style={{ fontSize: "14px", color: "#1a1917" }}>
                      {label}: ₹{(item.prices && item.prices[key]) || "0"}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#6b6966" }}>
                  GST: {GST_PERCENT}%
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label="Edit"
                  style={{
                    padding: "8px",
                    border: "none",
                    background: "transparent",
                    color: "#6b6966",
                    cursor: "pointer",
                    borderRadius: "8px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Delete"
                  style={{
                    padding: "8px",
                    border: "none",
                    background: "transparent",
                    color: "#b85450",
                    cursor: "pointer",
                    borderRadius: "8px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            overflow: "auto",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              margin: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 700, color: "#1a1917" }}>
              {editingId ? "Edit add-on" : "Add add-on"}
            </h3>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#1a1917" }}>
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Chairs, Round tables"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e8e6e2",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#1a1917" }}>
                Price by duration (₹)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {DURATIONS.map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ fontSize: "11px", color: "#6b6966", display: "block", marginBottom: "2px" }}>{label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formPrices[key] ?? ""}
                      onChange={(e) => setFormPrice(key, e.target.value)}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #e8e6e2",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "12px", padding: "8px 12px", background: "#f5f4f1", borderRadius: "8px", fontSize: "13px", color: "#6b6966" }}>
              GST: {GST_PERCENT}% (readonly)
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#1a1917" }}>
                Max quantity (optional)
              </label>
              <input
                type="number"
                min="0"
                value={formMaxQty}
                onChange={(e) => setFormMaxQty(e.target.value)}
                placeholder="e.g. 10"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e8e6e2",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b6966" }}>
                Maximum number the user can add. Leave empty for no limit.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e8e6e2",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveItem}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#c9a84c",
                  color: "#1a1917",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
