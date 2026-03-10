import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * POST /api/venues/{venueId}/gallery
 * Create album. Body: name (required), description?, coverImage? (S3 URL), isActive?, metadata?
 */
export async function createAlbum(token, venueId, body) {
  const res = await axios.post(`${API_BASE_URL}venues/${venueId}/gallery`, body, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
  return unwrapData(res);
}

/**
 * GET /api/venues/{venueId}/gallery
 * List albums (includes photoCount per album).
 */
export async function listAlbums(token, venueId) {
  const res = await axios.get(`${API_BASE_URL}venues/${venueId}/gallery`, {
    headers: authHeaders(token),
  });
  return unwrapData(res);
}

/**
 * GET /api/venues/{venueId}/gallery/{albumId}
 * Get single album with all photos.
 */
export async function getAlbumById(token, venueId, albumId) {
  const res = await axios.get(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

/**
 * PATCH /api/venues/{venueId}/gallery/{albumId}
 * Update album. Body: name?, description?, coverImage?, isActive?, metadata?
 */
export async function updateAlbum(token, venueId, albumId, body) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * DELETE /api/venues/{venueId}/gallery/{albumId}
 * Delete album and all its photos.
 */
export async function deleteAlbum(token, venueId, albumId) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}

/**
 * POST /api/venues/{venueId}/gallery/{albumId}/photos
 * Add photos. Body: { photos: [{ url, key?, caption?, sortOrder? }] }
 */
export async function addPhotosToAlbum(token, venueId, albumId, body) {
  const res = await axios.post(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}/photos`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * PATCH /api/venues/{venueId}/gallery/{albumId}/photos/{photoId}
 * Update single photo. Body: url?, key?, caption?, sortOrder?
 */
export async function updatePhoto(token, venueId, albumId, photoId, body) {
  const res = await axios.patch(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}/photos/${photoId}`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * DELETE /api/venues/{venueId}/gallery/{albumId}/photos/{photoId}
 * Remove photo from album.
 */
export async function deletePhoto(token, venueId, albumId, photoId) {
  const res = await axios.delete(
    `${API_BASE_URL}venues/${venueId}/gallery/${albumId}/photos/${photoId}`,
    { headers: authHeaders(token) },
  );
  return unwrapData(res);
}
