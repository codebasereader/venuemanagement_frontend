/**
 * Payload shapes for Venue Buyout and Space Buyout (Pricing).
 * Use these when sending to your API or for type reference.
 */

const DEFAULT_RACK_RATES = { "12": "", "24": "", "36": "", "48": "" };

/** Rack rates: duration (hours) -> price string (numeric). */
export const defaultRackRates = () => ({ ...DEFAULT_RACK_RATES });

/**
 * Venue buyout payload (from VenueBuyout.jsx onSave).
 * @typedef {Object} VenueBuyoutPayload
 * @property {boolean} buyoutOnly - Hide per-space pricing; only venue buyout.
 * @property {Record<string, string>} rackRates - Keys "12"|"24"|"36"|"48", values price strings (e.g. "50000").
 * @property {Array<{ id: string, name: string, maxQuantity?: number }>} inclusions - Items included at no extra cost.
 * @property {Array<{ id: string, name: string, maxQuantity?: number, prices: Record<string, string> }>} addons - Extra items with prices per duration.
 */
export const venueBuyoutPayloadExample = {
  buyoutOnly: false,
  rackRates: { "12": "50000", "24": "90000", "36": "120000", "48": "150000" },
  inclusions: [
    { id: "inc-1", name: "Sound system", maxQuantity: 1 },
    { id: "inc-2", name: "Basic lighting" },
  ],
  addons: [
    {
      id: "addon-1",
      name: "Extra projector",
      maxQuantity: 2,
      prices: { "12": "5000", "24": "8000", "36": "10000", "48": "12000" },
    },
  ],
};

/** Backend-ready venue buyout example (JSON-serializable, no undefined). Copy for schema design. */
export const venueBuyoutExampleForBackend = {
  buyoutOnly: false,
  rackRates: { "12": "50000", "24": "90000", "36": "120000", "48": "150000" },
  inclusions: [
    { id: "inc-1739123456789-abc12de", name: "Sound system", maxQuantity: 1 },
    { id: "inc-1739123456790-xyz34fg", name: "Basic lighting" },
  ],
  addons: [
    {
      id: "addon-1739123456791-addon01",
      name: "Extra projector",
      maxQuantity: 2,
      prices: { "12": "5000", "24": "8000", "36": "10000", "48": "12000" },
    },
    {
      id: "addon-1739123456792-addon02",
      name: "Catering package",
      prices: { "12": "20000", "24": "35000", "36": "45000", "48": "55000" },
    },
  ],
};

/**
 * Space buyout payload (from SpacePricings.jsx onSave).
 * @typedef {Object} SpaceBuyoutPayload
 * @property {boolean} spaceOnly - Hide venue buyout; only per-space pricing.
 * @property {string|null} selectedSpaceId - Currently selected space id (UI state).
 * @property {Record<string, SpacePricing>} spacePricings - Map spaceId -> { rackRates, inclusions, addons }.
 */
/**
 * @typedef {Object} SpacePricing
 * @property {Record<string, string>} rackRates - Keys "12"|"24"|"36"|"48".
 * @property {Array<{ id: string, name: string, maxQuantity?: number }>} inclusions
 * @property {Array<{ id: string, name: string, maxQuantity?: number, prices: Record<string, string> }>} addons
 */
export const spaceBuyoutPayloadExample = {
  spaceOnly: false,
  selectedSpaceId: "space-123",
  spacePricings: {
    "space-123": {
      rackRates: { "12": "30000", "24": "55000", "36": "75000", "48": "95000" },
      inclusions: [{ id: "inc-1", name: "WiFi" }],
      addons: [
        {
          id: "addon-1",
          name: "Catering package",
          maxQuantity: 1,
          prices: { "12": "20000", "24": "35000", "36": "45000", "48": "55000" },
        },
      ],
    },
    "space-456": {
      rackRates: { "12": "", "24": "40000", "36": "", "48": "80000" },
      inclusions: [],
      addons: [],
    },
  },
};

/** Backend-ready space buyout example (JSON-serializable). Keys in spacePricings are spaceId (e.g. MongoDB ObjectId). */
export const spaceBuyoutExampleForBackend = {
  spaceOnly: false,
  spacePricings: {
    "69afc2df3235f0510b471102": {
      rackRates: { "12": "30000", "24": "55000", "36": "75000", "48": "95000" },
      inclusions: [
        { id: "inc-space1-001", name: "WiFi" },
        { id: "inc-space1-002", name: "Projector", maxQuantity: 1 },
      ],
      addons: [
        {
          id: "addon-space1-001",
          name: "Catering package",
          maxQuantity: 1,
          prices: { "12": "20000", "24": "35000", "36": "45000", "48": "55000" },
        },
      ],
    },
    "69afc2df3235f0510b471103": {
      rackRates: { "12": "", "24": "40000", "36": "", "48": "80000" },
      inclusions: [],
      addons: [],
    },
  },
};

/** Empty venue buyout payload (defaults). */
export function getEmptyVenueBuyoutPayload() {
  return {
    buyoutOnly: false,
    rackRates: defaultRackRates(),
    inclusions: [],
    addons: [],
  };
}

/** Empty space pricing for one space. */
export function getEmptySpacePricing() {
  return {
    rackRates: defaultRackRates(),
    inclusions: [],
    addons: [],
  };
}

/** Empty space buyout payload (defaults). */
export function getEmptySpaceBuyoutPayload() {
  return {
    spaceOnly: false,
    selectedSpaceId: null,
    spacePricings: {},
  };
}
