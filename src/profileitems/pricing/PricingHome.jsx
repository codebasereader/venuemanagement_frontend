import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { message } from "antd";
import VenueBuyout from "./VenueBuyout";
import SpacePricings from "./SpacePricings";
import {
  getVenuePricing,
  patchVenueBuyout,
  patchSpaceBuyout,
} from "../../api/pricing";
import { listVenues } from "../../api/venue";

const ChevronLeftIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const TAB_KEYS = { VENUE: "venue", SPACE: "space" };

const DEFAULT_RACK_RATES = { 12: "", 24: "", 36: "", 48: "" };

function makeId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Normalize API inclusion to UI shape (with id). */
function normalizeInclusion(item, index) {
  if (!item || typeof item !== "object") return null;
  return {
    id: item._id ?? item.id ?? makeId(),
    name: item.name ?? "",
    maxQuantity: item.maxQuantity,
  };
}

/** Normalize API addon to UI shape (with id). */
function normalizeAddon(item, index) {
  if (!item || typeof item !== "object") return null;
  return {
    id: item._id ?? item.id ?? makeId(),
    name: item.name ?? "",
    maxQuantity: item.maxQuantity,
    prices: { ...DEFAULT_RACK_RATES, ...(item.prices ?? {}) },
  };
}

/** Normalize API space to UI shape (id for key). */
function normalizeSpace(s) {
  if (!s) return null;
  const id = s._id ?? s.id;
  if (!id) return null;
  return {
    ...s,
    id,
    name: s.name ?? s.spaceName,
  };
}

/** Normalize full pricing API response to PricingHome state. */
function normalizePricingResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      buyoutOnly: false,
      rackRates: { ...DEFAULT_RACK_RATES },
      inclusions: [],
      addons: [],
      spaceOnly: false,
      spacePricings: {},
      spaces: [],
    };
  }
  const rackRates = { ...DEFAULT_RACK_RATES, ...(data.rackRates ?? {}) };
  const inclusions = (data.inclusions ?? [])
    .map(normalizeInclusion)
    .filter(Boolean);
  const addons = (data.addons ?? []).map(normalizeAddon).filter(Boolean);
  const spaces = (data.spaces ?? []).map(normalizeSpace).filter(Boolean);

  const spacePricings = {};
  const rawSpacePricings = data.spacePricings ?? {};
  for (const [spaceId, sp] of Object.entries(rawSpacePricings)) {
    if (!sp || typeof sp !== "object") continue;
    spacePricings[spaceId] = {
      rackRates: { ...DEFAULT_RACK_RATES, ...(sp.rackRates ?? {}) },
      inclusions: (sp.inclusions ?? []).map(normalizeInclusion).filter(Boolean),
      addons: (sp.addons ?? []).map(normalizeAddon).filter(Boolean),
    };
  }

  return {
    buyoutOnly: Boolean(data.buyoutOnly),
    rackRates,
    inclusions,
    addons,
    spaceOnly: Boolean(data.spaceOnly),
    spacePricings,
    spaces,
  };
}

/** Build API payload for venue-buyout. */
function toApiVenueBuyout(data) {
  return {
    buyoutOnly: Boolean(data.buyoutOnly),
    rackRates: { ...DEFAULT_RACK_RATES, ...(data.rackRates ?? {}) },
    inclusions: (data.inclusions ?? []).map((i) => ({
      id: i?.id,
      name: (i?.name ?? "").trim(),
      ...(i?.maxQuantity != null &&
        i.maxQuantity !== "" && { maxQuantity: Number(i.maxQuantity) }),
    })),
    addons: (data.addons ?? []).map((i) => ({
      id: i?.id,
      name: (i?.name ?? "").trim(),
      ...(i?.maxQuantity != null &&
        i.maxQuantity !== "" && { maxQuantity: Number(i.maxQuantity) }),
      prices: { ...DEFAULT_RACK_RATES, ...(i?.prices ?? {}) },
    })),
  };
}

/** Build API payload for space-buyout. */
function toApiSpaceBuyout(data) {
  const spacePricings = {};
  const raw = data.spacePricings ?? {};
  for (const [spaceId, sp] of Object.entries(raw)) {
    if (!sp || typeof sp !== "object") continue;
    spacePricings[spaceId] = {
      rackRates: { ...DEFAULT_RACK_RATES, ...(sp.rackRates ?? {}) },
      inclusions: (sp.inclusions ?? []).map((i) => ({
        id: i?.id,
        name: (i?.name ?? "").trim(),
        ...(i?.maxQuantity != null &&
          i.maxQuantity !== "" && { maxQuantity: Number(i.maxQuantity) }),
      })),
      addons: (sp.addons ?? []).map((i) => ({
        id: i?.id,
        name: (i?.name ?? "").trim(),
        ...(i?.maxQuantity != null &&
          i.maxQuantity !== "" && { maxQuantity: Number(i.maxQuantity) }),
        prices: { ...DEFAULT_RACK_RATES, ...(i?.prices ?? {}) },
      })),
    };
  }
  return {
    spaceOnly: Boolean(data.spaceOnly),
    spacePricings,
  };
}

export default function PricingHome() {
  const navigate = useNavigate();
  const {
    access_token: accessToken,
    role,
    venueId: myVenueId,
  } = useSelector((s) => s.user.value);
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState(TAB_KEYS.VENUE);
  const [venueOnly, setVenueOnly] = useState(false);
  const [spaceOnly, setSpaceOnly] = useState(false);

  const [venueBuyoutOnly, setVenueBuyoutOnly] = useState(false);
  const [rackRates, setRackRates] = useState({ ...DEFAULT_RACK_RATES });
  const [inclusions, setInclusions] = useState([]);
  const [addons, setAddons] = useState([]);

  const [spaces, setSpaces] = useState([]);
  const [spacePricings, setSpacePricings] = useState({});

  const [venueOptions, setVenueOptions] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(myVenueId ?? null);
  const [loading, setLoading] = useState(false);
  const [savingVenue, setSavingVenue] = useState(false);
  const [savingSpace, setSavingSpace] = useState(false);

  const effectiveVenueId = isAdmin ? selectedVenueId : myVenueId;

  // Load venue list for admin
  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    listVenues(accessToken)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        const opts = arr.map((v) => ({
          value: v._id ?? v.id,
          label: v.name ?? v._id ?? v.id,
        }));
        setVenueOptions(opts);
        if (!selectedVenueId && opts[0]?.value)
          setSelectedVenueId(opts[0].value);
      })
      .catch(() => setVenueOptions([]));
  }, [accessToken, isAdmin, selectedVenueId]);

  // Fetch pricing when venue is known
  const fetchPricing = useCallback(async () => {
    if (!accessToken || !effectiveVenueId) return;
    setLoading(true);
    try {
      const data = await getVenuePricing(accessToken, effectiveVenueId);
      const norm = normalizePricingResponse(data);
      setVenueBuyoutOnly(norm.buyoutOnly);
      setVenueOnly(norm.buyoutOnly);
      setRackRates(norm.rackRates);
      setInclusions(norm.inclusions);
      setAddons(norm.addons);
      setSpaceOnly(norm.spaceOnly);
      setSpacePricings(norm.spacePricings);
      setSpaces(norm.spaces);
      // When spaceOnly: show Space tab and disable Venue tab; when buyoutOnly: show Venue tab and disable Space tab; when both false: both enabled
      if (norm.spaceOnly) setActiveTab(TAB_KEYS.SPACE);
      else if (norm.buyoutOnly) setActiveTab(TAB_KEYS.VENUE);
      else setActiveTab(TAB_KEYS.VENUE);
    } catch (err) {
      message.error(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load pricing",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, effectiveVenueId]);

  useEffect(() => {
    if (isAdmin && !selectedVenueId) return;
    fetchPricing();
  }, [fetchPricing, isAdmin, selectedVenueId]);

  const venueTabDisabled = spaceOnly;
  const spaceTabDisabled = venueOnly;

  const handleVenueSave = useCallback(
    async (data) => {
      if (!accessToken || !effectiveVenueId) {
        message.error("Venue not selected");
        return;
      }
      setSavingVenue(true);
      try {
        await patchVenueBuyout(
          accessToken,
          effectiveVenueId,
          toApiVenueBuyout(data),
        );
        message.success("Venue buyout pricing saved");
        fetchPricing();
      } catch (err) {
        message.error(
          err?.response?.data?.message ?? err?.message ?? "Failed to save",
        );
      } finally {
        setSavingVenue(false);
      }
    },
    [accessToken, effectiveVenueId, fetchPricing],
  );

  const handleSpaceSave = useCallback(
    async (data) => {
      if (!accessToken || !effectiveVenueId) {
        message.error("Venue not selected");
        return;
      }
      setSavingSpace(true);
      try {
        await patchSpaceBuyout(
          accessToken,
          effectiveVenueId,
          toApiSpaceBuyout(data),
        );
        message.success("Space buyout pricing saved");
        fetchPricing();
      } catch (err) {
        message.error(
          err?.response?.data?.message ?? err?.message ?? "Failed to save",
        );
      } finally {
        setSavingSpace(false);
      }
    },
    [accessToken, effectiveVenueId, fetchPricing],
  );

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
          {isAdmin && venueOptions.length > 0 && (
            <select
              value={selectedVenueId ?? ""}
              onChange={(e) => setSelectedVenueId(e.target.value || null)}
              style={{
                marginLeft: "auto",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e8e6e2",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                minWidth: "180px",
              }}
            >
              <option value="">Select venue</option>
              {venueOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#6b6966" }}
          >
            Loading pricing…
          </div>
        ) : !effectiveVenueId ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#6b6966" }}
          >
            {isAdmin
              ? "Select a venue to manage pricing."
              : "No venue assigned."}
          </div>
        ) : (
          <>
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
                onClick={() =>
                  !venueTabDisabled && setActiveTab(TAB_KEYS.VENUE)
                }
                disabled={venueTabDisabled}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderBottom:
                    activeTab === TAB_KEYS.VENUE
                      ? "2px solid #c9a84c"
                      : "2px solid transparent",
                  background: "none",
                  color: venueTabDisabled
                    ? "#c5c2be"
                    : activeTab === TAB_KEYS.VENUE
                      ? "#1a1917"
                      : "#6b6966",
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
                onClick={() =>
                  !spaceTabDisabled && setActiveTab(TAB_KEYS.SPACE)
                }
                disabled={spaceTabDisabled}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderBottom:
                    activeTab === TAB_KEYS.SPACE
                      ? "2px solid #c9a84c"
                      : "2px solid transparent",
                  background: "none",
                  color: spaceTabDisabled
                    ? "#c5c2be"
                    : activeTab === TAB_KEYS.SPACE
                      ? "#1a1917"
                      : "#6b6966",
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
                saving={savingVenue}
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
                saving={savingSpace}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
