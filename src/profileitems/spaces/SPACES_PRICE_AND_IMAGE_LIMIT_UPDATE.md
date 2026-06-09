# Spaces API — Backend schema spec (frontend contract)

This document defines what the **Venue Management frontend** sends and expects for **venue spaces**, including base pricing by duration and images. Use it for MongoDB/API schema design and validation.

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/venues/{venueId}/spaces` | List spaces for a venue |
| `GET` | `/api/venues/{venueId}/spaces/{spaceId}` | Get one space |
| `POST` | `/api/venues/{venueId}/spaces` | Create space |
| `PATCH` | `/api/venues/{venueId}/spaces/{spaceId}` | Update space |
| `DELETE` | `/api/venues/{venueId}/spaces/{spaceId}` | Delete space |

**Auth:** `Authorization: Bearer <token>` on all routes.

**Response wrapper** (if used elsewhere in the app):

```json
{
  "success": true,
  "data": { }
}
```

---

## Space document (recommended shape)

### Core fields

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `_id` | `ObjectId` / string | — | Server-generated |
| `venueId` | `ObjectId` / string | Yes | Parent venue |
| `name` | string | Yes | Display name (UI label: "Space name") |
| `description` | string | No | Free text |
| `capacity` | number | No | e.g. seat count; integer ≥ 0 |
| `dimensions` | string | No | e.g. `"40ft x 60ft"` |
| `isActive` | boolean | No | Frontend sends `true` on create/update |
| `images` | `string[]` | No | **Public URLs** after S3 upload; **max 2** items |
| `rackRates` | object | No | **Canonical** base price map (see below) |
| `createdAt` / `updatedAt` | ISO date | — | Server timestamps |

### Pricing: `rackRates` (canonical)

**Recommendation:** Persist and return **only** `rackRates`. The frontend currently also sends `prices` with the same object for backward compatibility; backend may accept both on write but should **return only `rackRates`** once implemented.

| Key (string) | UI label | Meaning |
|--------------|----------|---------|
| `"12"` | Half Day | 12 hours |
| `"24"` | Full Day | 24 hours |
| `"36"` | 1.5 Days | 36 hours |
| `"48"` | 2 Days | 48 hours |

**Value type:** `number` — base cost in **INR** (₹), non-negative.

- Keys are **strings**, not numbers (`"12"` not `12`).
- Partial maps are allowed (only durations the user filled in).
- Omitted keys = no rack rate for that duration.

**Example:**

```json
"rackRates": {
  "12": 50000,
  "24": 90000,
  "36": 120000,
  "48": 150000
}
```

**Validation (suggested):**

- Only keys `12`, `24`, `36`, `48` allowed.
- Each value: `number`, `>= 0`.
- Reject unknown keys or string values like `"50000"`.

### Images

- Frontend uploads files to S3 **before** create/update; API receives **URLs only**.
- **Maximum 2** URLs per space.
- Order is significant (carousel order).

**Validation (suggested):**

- `images` must be an array of strings (valid URLs).
- `images.length <= 2`.

---

## Request bodies

### `POST /api/venues/{venueId}/spaces` — Create

```json
{
  "name": "Main Hall",
  "description": "Indoor banquet hall",
  "capacity": 200,
  "dimensions": "40ft x 60ft",
  "isActive": true,
  "images": [
    "https://cdn.example.com/spaces/abc/1.jpg",
    "https://cdn.example.com/spaces/abc/2.jpg"
  ],
  "rackRates": {
    "12": 50000,
    "24": 90000
  }
}
```

| Field | Required on create |
|-------|-------------------|
| `name` | Yes |
| `description`, `capacity`, `dimensions`, `images`, `rackRates` | No |

**Note:** Frontend may temporarily send duplicate `prices` identical to `rackRates`. Backend should treat `rackRates` as source of truth and may ignore `prices` or merge into `rackRates`.

### `PATCH /api/venues/{venueId}/spaces/{spaceId}` — Update

Same fields as create; all optional except what your API requires for PATCH semantics. Frontend sends full space fields on edit (not a minimal delta).

---

## Response bodies (GET list / GET one)

Return pricing so the edit form can pre-fill. Frontend reads, in order:

1. `space.rackRates`
2. `space.prices` (legacy)
3. `space.pricing.rackRates` (nested legacy)

**Recommended GET shape:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "venueId": "507f191e810c19729de860ea",
  "name": "Main Hall",
  "description": "Indoor banquet hall",
  "capacity": 200,
  "dimensions": "40ft x 60ft",
  "isActive": true,
  "images": [
    "https://cdn.example.com/spaces/abc/1.jpg"
  ],
  "rackRates": {
    "12": 50000,
    "24": 90000,
    "36": 120000,
    "48": 150000
  },
  "createdAt": "2026-06-02T07:00:00.000Z",
  "updatedAt": "2026-06-02T07:30:00.000Z"
}
```

If `rackRates` is missing or empty, the UI still works; price inputs show empty.

---

## Frontend behavior summary

| Topic | Behavior |
|-------|----------|
| Price inputs | Four rows: Half Day, Full Day, 1.5 Days, 2 Days → keys `12`, `24`, `36`, `48` |
| Empty price cell | Key not sent in `rackRates` |
| Image UI | Max **2** upload slots |
| Image upload | Client uploads to S3, then sends URL strings in `images` |
| Duplicate `prices` | Sent only until backend confirms `rackRates` only |

---

## Suggested Mongoose-style schema (reference)

```js
const rackRatesSchema = {
  type: Map,
  of: Number,
  default: undefined,
  validate: {
    validator(map) {
      if (!map) return true;
      const allowed = new Set(["12", "24", "36", "48"]);
      for (const [k, v] of map.entries()) {
        if (!allowed.has(String(k))) return false;
        if (typeof v !== "number" || v < 0) return false;
      }
      return true;
    },
    message: "rackRates keys must be 12|24|36|48 with non-negative numbers",
  },
};

const spaceSchema = {
  venueId: { type: ObjectId, ref: "Venue", required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  capacity: { type: Number, min: 0 },
  dimensions: { type: String },
  isActive: { type: Boolean, default: true },
  images: {
    type: [String],
    validate: [(arr) => arr.length <= 2, "Max 2 images allowed"],
    default: [],
  },
  rackRates: rackRatesSchema,
};
```

---

## Error responses (suggested)

| Case | HTTP | Example message |
|------|------|-----------------|
| Missing `name` on create | `400` | `name is required` |
| More than 2 images | `400` | `images cannot exceed 2 items` |
| Invalid rack rate key | `400` | `Invalid duration key in rackRates` |
| Negative price | `400` | `rackRates values must be >= 0` |
| Space not found | `404` | `Space not found` |

---

## Action items for backend

1. **Confirm canonical field:** `rackRates` only (frontend can remove duplicate `prices` after confirmation).
2. **Persist and return** `rackRates` on GET list and GET by id.
3. **Enforce** `images.length <= 2` and rack rate validation on POST/PATCH.
4. **Do not** expect multipart file upload on space endpoints — only image URLs.

---

## Changelog (frontend)

- Price values normalized to numbers before API call.
- Image upload slots reduced from 5 to **2**.
- Temporary dual send: `rackRates` + `prices` (same object) until backend standardizes on `rackRates`.
