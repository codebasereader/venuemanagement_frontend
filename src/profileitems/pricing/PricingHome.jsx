import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VenueBuyout from "./VenueBuyout";
import SpacePricings from "./SpacePricings";

const ChevronLeftIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const TAB_KEYS = { VENUE: "venue", SPACE: "space" };

export default function PricingHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_KEYS.VENUE);
  const [venueOnly, setVenueOnly] = useState(false);
  const [spaceOnly, setSpaceOnly] = useState(false);

  const [venueBuyoutOnly, setVenueBuyoutOnly] = useState(false);
  const [rackRates, setRackRates] = useState({ "12": "", "24": "", "36": "", "48": "" });
  const [inclusions, setInclusions] = useState([]);
  const [addons, setAddons] = useState([]);

  const [spaces, setSpaces] = useState([]);
  const [spacePricings, setSpacePricings] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("venue-spaces");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSpaces(parsed);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("venue-pricing");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.buyoutOnly != null) setVenueBuyoutOnly(data.buyoutOnly);
        if (data.buyoutOnly) setVenueOnly(true);
        if (data.rackRates) setRackRates((prev) => ({ ...prev, ...data.rackRates }));
        if (Array.isArray(data.inclusions)) setInclusions(data.inclusions);
        if (Array.isArray(data.addons)) setAddons(data.addons);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("space-pricings");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.spaceOnly) setSpaceOnly(true);
        if (data.spacePricings && typeof data.spacePricings === "object") setSpacePricings(data.spacePricings);
      }
    } catch (_) {}
  }, []);

  const venueTabDisabled = spaceOnly;
  const spaceTabDisabled = venueOnly;

  const handleVenueSave = useCallback((data) => {
    console.log("Venue buyout save", data);
    try {
      localStorage.setItem("venue-pricing", JSON.stringify(data));
    } catch (_) {}
  }, []);

  const handleSpaceSave = useCallback((data) => {
    console.log("Space pricing save", data);
    try {
      localStorage.setItem("space-pricings", JSON.stringify(data));
    } catch (_) {}
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
          padding: "0 8px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label="Back to Profile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "none",
              background: "#f5f4f1",
              color: "#1a1917",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeftIcon />
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 4vw, 26px)",
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
              letterSpacing: "-0.02em",
            }}
          >
            Pricing
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "20px",
            borderBottom: "1px solid #e8e6e2",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            onClick={() => !venueTabDisabled && setActiveTab(TAB_KEYS.VENUE)}
            disabled={venueTabDisabled}
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom: activeTab === TAB_KEYS.VENUE ? "2px solid #c9a84c" : "2px solid transparent",
              background: "none",
              color: venueTabDisabled ? "#c5c2be" : activeTab === TAB_KEYS.VENUE ? "#1a1917" : "#6b6966",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: venueTabDisabled ? "default" : "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            Venue Buyout
          </button>
          <button
            type="button"
            onClick={() => !spaceTabDisabled && setActiveTab(TAB_KEYS.SPACE)}
            disabled={spaceTabDisabled}
            style={{
              padding: "12px 20px",
              border: "none",
              borderBottom: activeTab === TAB_KEYS.SPACE ? "2px solid #c9a84c" : "2px solid transparent",
              background: "none",
              color: spaceTabDisabled ? "#c5c2be" : activeTab === TAB_KEYS.SPACE ? "#1a1917" : "#6b6966",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: spaceTabDisabled ? "default" : "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            Space Buyout
          </button>
        </div>

        {activeTab === TAB_KEYS.VENUE && (
          <VenueBuyout
            buyoutOnly={venueBuyoutOnly}
            onBuyoutOnlyChange={(checked) => {
              setVenueBuyoutOnly(checked);
              setVenueOnly(checked);
              if (checked) setSpaceOnly(false);
            }}
            rackRates={rackRates}
            onRackRatesChange={setRackRates}
            inclusions={inclusions}
            onInclusionsChange={setInclusions}
            addons={addons}
            onAddonsChange={setAddons}
            onSave={handleVenueSave}
          />
        )}

        {activeTab === TAB_KEYS.SPACE && (
          <SpacePricings
            spaces={spaces}
            spacePricings={spacePricings}
            onSpacePricingsChange={setSpacePricings}
            spaceOnly={spaceOnly}
            onSpaceOnlyChange={(checked) => {
              setSpaceOnly(checked);
              if (checked) setVenueBuyoutOnly(false);
              if (checked) setVenueOnly(false);
            }}
            onSave={handleSpaceSave}
          />
        )}
      </div>
    </>
  );
}
