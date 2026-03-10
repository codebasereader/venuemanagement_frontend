import axios from "axios";
import { API_BASE_URL } from "../../config";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapData(response) {
  return response?.data?.data ?? response?.data;
}

/**
 * Get presigned upload URL for S3 (e.g. venue logo).
 * POST /api/uploads/presign
 * Then PUT the file binary to uploadUrl with Content-Type header.
 * Save publicUrl (or key) in your entity (venue profile, etc.).
 */
export async function getPresignUrl(token, { fileName, contentType, entityId, expiresIn = 900 }) {
  const res = await axios.post(
    `${API_BASE_URL}uploads/presign`,
    { fileName, contentType, entityId, expiresIn },
    { headers: { "Content-Type": "application/json", ...authHeaders(token) } },
  );
  return unwrapData(res);
}

/**
 * Upload a single file to S3 via presign: get presigned URL, then PUT file.
 * Returns the publicUrl to store (e.g. in space.images[]).
 * @param {string} token - Bearer token
 * @param {File} file - File object from input
 * @param {string} entityId - venueId or spaceId for S3 path
 * @returns {Promise<string>} publicUrl
 */
export async function uploadImageToS3(token, file, entityId) {
  const fileName = file.name || "image.jpg";
  const contentType = file.type || "image/jpeg";
  const { uploadUrl, publicUrl } = await getPresignUrl(token, {
    fileName,
    contentType,
    entityId,
    expiresIn: 900,
  });
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) throw new Error("Upload failed");
  return publicUrl;
}

/**
 * Delete an uploaded file by S3 key.
 * DELETE /api/uploads
 */
export async function deleteUpload(token, { key }) {
  const res = await axios.delete(`${API_BASE_URL}uploads`, {
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    data: { key },
  });
  return unwrapData(res);
}
