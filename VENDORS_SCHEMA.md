# Vendors payload + schema (Frontend → Backend)

This document describes the **recommended schema** and **API contract** for
**vendors per venue**. These vendors are used in the **Commissions** tab
as selectable options for outflow / inflow commissions.

---

## 1. Route design (venue scoped)

Serverless config (example):

```yaml
vendorsApi:
  handler: src/handlers/vendorsApi.handler
  events:
    - httpApi:
        path: /api/venues/{venueId}/vendors
        method: get
    - httpApi:
        path: /api/venues/{venueId}/vendors
        method: post
    - httpApi:
        path: /api/venues/{venueId}/vendors/{vendorId}
        method: get
    - httpApi:
        path: /api/venues/{venueId}/vendors/{vendorId}
        method: patch
    - httpApi:
        path: /api/venues/{venueId}/vendors/{vendorId}
        method: delete
```

Resulting endpoints:

| Action          | Method | Endpoint                                    |
| --------------- | ------ | ------------------------------------------- |
| List vendors    | GET    | `/api/venues/{venueId}/vendors`            |
| Create vendor   | POST   | `/api/venues/{venueId}/vendors`            |
| Get vendor      | GET    | `/api/venues/{venueId}/vendors/{vendorId}` |
| Update vendor   | PATCH  | `/api/venues/{venueId}/vendors/{vendorId}` |
| Delete vendor   | DELETE | `/api/venues/{venueId}/vendors/{vendorId}` |

All vendor records are **venue-scoped**, not lead-scoped.

---

## 2. Vendor document (Mongo / Mongoose style)

Fields (from your example):

```json
{
  "name": "Photographer Raj",
  "category": "photography",
  "contactName": "Raj",
  "phone": "+919876543210",
  "email": "raj@example.com",
  "notes": "Specializes in candid weddings"
}
```

Suggested schema:

```javascript
const vendorSchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
    },

    contactName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Useful index for dropdowns / searches
vendorSchema.index({ venueId: 1, name: 1 }, { unique: false });
```

> Only `name` is **required**. All other fields are optional.

---

## 3. List vendors (GET)

**GET** `/api/venues/{venueId}/vendors`

Optional query params:

- `category` – filter by category (e.g. `"photography"`, `"decor"`)
- `q` – free text search on name / contactName (optional)

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64c1b2c3d4e5f6789012345a",
      "venueId": "69afc2df3235f0510b471102",
      "name": "Photographer Raj",
      "category": "photography",
      "contactName": "Raj",
      "phone": "+919876543210",
      "email": "raj@example.com",
      "notes": "Specializes in candid weddings",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-15T07:30:00.000Z",
      "updatedAt": "2026-03-15T07:30:00.000Z"
    }
  ]
}
```

---

## 4. Create vendor (POST)

**POST** `/api/venues/{venueId}/vendors`

### Request body

```json
{
  "name": "Photographer Raj",
  "category": "photography",
  "contactName": "Raj",
  "phone": "+919876543210",
  "email": "raj@example.com",
  "notes": "Specializes in candid weddings"
}
```

Only `name` is required; the rest are optional.

### Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "64c1b2c3d4e5f6789012345a",
    "venueId": "69afc2df3235f0510b471102",
    "name": "Photographer Raj",
    "category": "photography",
    "contactName": "Raj",
    "phone": "+919876543210",
    "email": "raj@example.com",
    "notes": "Specializes in candid weddings",
    "createdBy": "69afbd219ab76559ecbb2f1a",
    "createdAt": "2026-03-15T07:30:00.000Z",
    "updatedAt": "2026-03-15T07:30:00.000Z"
  }
}
```

---

## 5. Get / Update / Delete one vendor

### Get vendor

**GET** `/api/venues/{venueId}/vendors/{vendorId}`

Response body matches a single item from the list response.

### Update vendor

**PATCH** `/api/venues/{venueId}/vendors/{vendorId}`

Example:

```json
{
  "category": "photo + video",
  "phone": "+919811111111",
  "notes": "Now also offers cinematic video"
}
```

### Delete vendor

**DELETE** `/api/venues/{venueId}/vendors/{vendorId}`

Response:

```json
{ "success": true }
```

---

## 6. Frontend usage in Commissions tab

In the **Lead Commissions** tab:

- The frontend will call:
  - `GET /api/venues/{venueId}/vendors` to load vendors into a dropdown.
  - `POST /api/venues/{venueId}/vendors` from the **Add vendor** modal.
- After create succeeds, the new vendor is:
  - Added to the local vendors list.
  - Immediately selectable in the **Vendor** dropdown for both **outflow** and **inflow** commission cards.

For now, the **Commission** document still only stores `vendorName` (string).  
Later you can optionally extend it with `vendorId` to create a strong relation.***
