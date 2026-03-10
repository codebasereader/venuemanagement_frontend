import React, { useState, useCallback } from "react";
import BuyoutOnlyToggle from "./BuyoutOnlyToggle";
import RackRatesSection from "./RackRatesSection";
import InclusionsSection from "./InclusionsSection";
import AddonsSection from "./AddonsSection";

const defaultRates = { "12": "", "24": "", "36": "", "48": "" };

function getDefaultSpacePricing() {
  return {
    rackRates: { ...defaultRates },
    inclusions: [],
    addons: [],
  };
}

export default function SpacePricings({
  spaces = [],
  spacePricings = {}, // { [spaceId]: { rackRates, inclusions, addons } }
  onSpacePricingsChange,
  spaceOnly = false,
  onSpaceOnlyChange,
  onSave,
  saving = false,
}) {
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id ?? null);

  const currentPricing = selectedSpaceId ? (spacePricings[selectedSpaceId] ?? getDefaultSpacePricing()) : null;

  const updateCurrentSpacePricing = useCallback(
    (patch) => {
      if (!selectedSpaceId) return;
      onSpacePricingsChange({
        ...spacePricings,
        [selectedSpaceId]: {
          ...getDefaultSpacePricing(),
          ...spacePricings[selectedSpaceId],
          ...patch,
        },
      });
    },
    [selectedSpaceId, spacePricings, onSpacePricingsChange]
  );

  const handleSave = useCallback(() => {
    onSave?.({
      spaceOnly,
      spacePricings,
      selectedSpaceId,
    });
  }, [spaceOnly, spacePricings, selectedSpaceId, onSave]);

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);

  return (
    <div style={{ padding: "0 4px" }}>
      <BuyoutOnlyToggle
        checked={spaceOnly}
        onChange={onSpaceOnlyChange}
        label="Space buyout only"
        description="Hide venue buyout, only allow per-space pricing."
      />

      {spaces.length === 0 ? (
        <div
          style={{
            padding: "32px 24px",
            textAlign: "center",
            background: "#faf9f7",
            borderRadius: "12px",
            border: "1px dashed #e8e6e2",
            fontSize: "14px",
            color: "#6b6966",
          }}
        >
          No spaces added yet. Add spaces in the Spaces section to set per-space pricing.
        </div>
      ) : (
        <>
          <section style={{ marginBottom: "24px" }}>
            <h2
              style={{
                margin: "0 0 4px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1a1917",
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}
            >
              Select space
            </h2>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#6b6966" }}>
              Configure rack rates, inclusions and add-ons for each space.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {spaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => setSelectedSpaceId(space.id)}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: selectedSpaceId === space.id ? "2px solid #c9a84c" : "1px solid #e8e6e2",
                    background: selectedSpaceId === space.id ? "#fdf6e8" : "white",
                    color: "#1a1917",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {space.spaceName || space.name || `Space ${space.id}`}
                </button>
              ))}
            </div>
          </section>

          {selectedSpace && currentPricing && (
            <>
              <RackRatesSection
                rates={currentPricing.rackRates ?? defaultRates}
                onChange={(rackRates) => updateCurrentSpacePricing({ rackRates })}
              />
              <InclusionsSection
                items={currentPricing.inclusions ?? []}
                onChange={(inclusions) => updateCurrentSpacePricing({ inclusions })}
              />
              <AddonsSection
                items={currentPricing.addons ?? []}
                onChange={(addons) => updateCurrentSpacePricing({ addons })}
              />
            </>
          )}

          {onSave && spaces.length > 0 && (
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
        </>
      )}
    </div>
  );
}
