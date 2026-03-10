import React, { useState, useCallback } from "react";
import BuyoutOnlyToggle from "./BuyoutOnlyToggle";
import RackRatesSection from "./RackRatesSection";
import InclusionsSection from "./InclusionsSection";
import AddonsSection from "./AddonsSection";

const defaultRates = { "12": "", "24": "", "36": "", "48": "" };

export default function VenueBuyout({
  buyoutOnly = false,
  onBuyoutOnlyChange,
  rackRates = defaultRates,
  onRackRatesChange,
  inclusions = [],
  onInclusionsChange,
  addons = [],
  onAddonsChange,
  onSave,
  saving = false,
}) {
  const handleSave = useCallback(() => {
    onSave?.({
      buyoutOnly,
      rackRates,
      inclusions,
      addons,
    });
  }, [buyoutOnly, rackRates, inclusions, addons, onSave]);

  return (
    <div style={{ padding: "0 4px" }}>
      <BuyoutOnlyToggle
        checked={buyoutOnly}
        onChange={onBuyoutOnlyChange}
        label="Buyout Only"
        description="Hide per-space pricing, only allow venue buyout."
      />

      <RackRatesSection rates={rackRates} onChange={onRackRatesChange} />
      <InclusionsSection items={inclusions} onChange={onInclusionsChange} />
      <AddonsSection items={addons} onChange={onAddonsChange} />

      {onSave && (
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#c9a84c",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(201, 168, 76, 0.3)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
