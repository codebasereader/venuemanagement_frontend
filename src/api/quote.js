import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * Build request body for create/update from frontend payload.
 * Strips leadId/venueId and sends only fields expected by API.
 */
function toQuoteBody(payload) {
  const {
    leadId: _l,
    venueId: _v,
    bookingType,
    spaceId,
    eventWindow,
    pricing,
    draft,
    confirmed,
  } = payload ?? {};
  const body = {
    bookingType,
    ...(bookingType === "space_buyout" && spaceId ? { spaceId } : {}),
    eventWindow:
      eventWindow && typeof eventWindow === "object"
        ? {
            startAt: eventWindow.startAt,
            endAt: eventWindow.endAt,
            durationHours: eventWindow.durationHours,
          }
        : undefined,
    pricing:
      pricing && typeof pricing === "object"
        ? {
            basePrice: pricing.basePrice,
            inclusions: pricing.inclusions,
            addons: pricing.addons,
            gstRate: pricing.gstRate,
            discount: pricing.discount,
            totals: pricing.totals,
          }
        : undefined,
  };
  if (typeof draft === "boolean") body.draft = draft;
  if (typeof confirmed === "boolean") body.confirmed = confirmed;
  return body;
}

/**
 * Create quote for a lead.
 * POST /api/venues/{venueId}/leads/{leadId}/quotes
 */
export async function createQuote(venueId, leadId, payload, token) {
  const body = toQuoteBody(payload);
  const res = await axios.post(
    `${API_BASE_URL}venues/${venueId}/leads/${leadId}/quotes`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * List quotes for a lead.
 * GET /api/venues/{venueId}/leads/{leadId}/quotes
 * Query: status, draft, confirmed
 */
export async function listQuotesByLead(venueId, leadId, token, params = {}) {
  const { status, draft, confirmed } = params;
  const query = {};
  if (status != null) query.status = status;
  if (draft != null) query.draft = draft;
  if (confirmed != null) query.confirmed = confirmed;
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/${leadId}/quotes`,
    { headers: authHeaders(token), params: Object.keys(query).length ? query : undefined },
  );
  return unwrapData(res);
}

/**
 * Get a single quote by ID (lead-nested route).
 * GET /api/venues/{venueId}/leads/{leadId}/quotes/{quoteId}
 */
export async function getQuoteById(venueId, leadId, quoteId, token) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/leads/${leadId}/quotes/${quoteId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

/**
 * Update quote (confirm or edit).
 * PATCH /api/venues/{venueId}/leads/{leadId}/quotes/{quoteId}
 */
export async function updateQuote(venueId, leadId, quoteId, payload, token) {
  const body = toQuoteBody(payload ?? {});
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/leads/${leadId}/quotes/${quoteId}`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Delete quote.
 * DELETE /api/venues/{venueId}/leads/{leadId}/quotes/{quoteId}
 */
export async function deleteQuote(venueId, leadId, quoteId, token) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/leads/${leadId}/quotes/${quoteId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}
