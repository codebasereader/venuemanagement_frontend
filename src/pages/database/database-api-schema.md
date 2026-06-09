# Database API — Backend Schema Specification

REST contract for the **Database** contact list module used in the Venue Management frontend.

This module has **two resources**:

1. **Categories** — separate CRUD (`/api/database/categories`)
2. **Entries** — contact records mapped to a category (`/api/database`)

Each venue owner/incharge manages database data **scoped to their venue**. The frontend does **not** show a venue picker; it sends `venueId` automatically from the logged-in user (`GET /api/me`).

**Base URL:** `{API_BASE_URL}` (e.g. `https://…/api/`)  
**Auth:** `Authorization: Bearer <JWT>` on all endpoints  
**Content-Type:** `application/json`

**Standard envelope:**

```json
{
  "success": true,
  "data": { }
}
```

For lists:

```json
{
  "success": true,
  "data": [ ]
}
```

---

## 1. Module overview

| Resource | Endpoint base | Purpose | Scoped by |
|----------|---------------|---------|-----------|
| **Categories** | `/api/database/categories` | Group contacts (e.g. Vendors, Planners, Corporate) | `venueId` |
| **Entries** | `/api/database` | Contact person details | `venueId` + `categoryId` |

### Frontend behaviour (important for backend design)

| UI element | Backend expectation |
|------------|---------------------|
| Category dropdown (list filter) | `GET /api/database/categories?venueId=` |
| Category dropdown (add/edit entry) | Same; user must pick a category |
| Add / Edit / Delete category | Full category CRUD |
| Search box | `GET /api/database?search=&categoryId=&venueId=` |
| Venue field | **Hidden** — frontend sends `venueId` from JWT user (`/me` response) |

### User context (`GET /api/me`)

The frontend reads `venueId` from the authenticated user:

```json
{
  "success": true,
  "data": {
    "_id": "69c36a4b97389edeb0a307c2",
    "email": "owner@gmail.com",
    "name": "owner",
    "role": "owner",
    "venueId": "69afc2df3235f0510b471102",
    "venue": {
      "_id": "69afc2df3235f0510b471102",
      "name": "Manvi Convention Hall"
    }
  }
}
```

All category and entry operations for owner/incharge users must be **restricted to this `venueId`**.

---

## 2. Category entity

### 2.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (ObjectId) | yes (response) | Unique category ID |
| `venueId` | string (ObjectId) | yes | Venue this category belongs to |
| `name` | string | yes | Category label (max 200 chars) |
| `createdAt` | datetime | no (response) | Audit |
| `updatedAt` | datetime | no (response) | Audit |

### 2.2 Validation rules

1. `venueId` — required on create; must match the authenticated user's venue (unless admin override is supported later).
2. `name` — required; non-empty; trimmed; max 200 characters.
3. Category names should be unique per venue (recommended): e.g. `"Vendors"` cannot be duplicated within the same `venueId`.
4. Multiple entries may reference the same category.

### 2.3 Example document (response)

```json
{
  "id": "674c00000000000000000001",
  "venueId": "69afc2df3235f0510b471102",
  "name": "Corporate Clients",
  "createdAt": "2026-06-02T10:00:00.000Z",
  "updatedAt": "2026-06-02T10:00:00.000Z"
}
```

---

## 3. Category endpoints

Resource path: **`/api/database/categories`**

| Method | Path |
|--------|------|
| GET | `/api/database/categories` |
| POST | `/api/database/categories` |
| GET | `/api/database/categories/{id}` |
| PUT | `/api/database/categories/{id}` |
| DELETE | `/api/database/categories/{id}` |

---

### 3.1 List categories

```http
GET /api/database/categories
```

**Query parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `venueId` | string | yes* | Filter categories for a venue |

\* Frontend always sends `venueId` from `/me`. Backend may alternatively derive `venueId` from JWT and ignore the query param for non-admin users.

**Example**

```http
GET /api/database/categories?venueId=69afc2df3235f0510b471102
```

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "674c00000000000000000001",
      "venueId": "69afc2df3235f0510b471102",
      "name": "Corporate Clients",
      "createdAt": "2026-06-02T10:00:00.000Z",
      "updatedAt": "2026-06-02T10:00:00.000Z"
    },
    {
      "id": "674c00000000000000000002",
      "venueId": "69afc2df3235f0510b471102",
      "name": "Vendors",
      "createdAt": "2026-06-02T10:00:00.000Z",
      "updatedAt": "2026-06-02T10:00:00.000Z"
    }
  ]
}
```

Results sorted by `name` ascending (recommended).

---

### 3.2 Get category by ID

```http
GET /api/database/categories/{id}
```

**Response `200`:** single category in `data`.

**Response `404`:** category not found.

---

### 3.3 Create category

```http
POST /api/database/categories
```

**Request body**

```json
{
  "venueId": "69afc2df3235f0510b471102",
  "name": "Corporate Clients"
}
```

| Field | Required on create |
|-------|-------------------|
| `venueId` | yes |
| `name` | yes |

**Response `201`:** created category in `data`.

**Response `400`:** validation error (missing name, duplicate name per venue, etc.).

**Response `404`:** `venueId` does not exist.

---

### 3.4 Update category

```http
PUT /api/database/categories/{id}
```

**Request body** (partial update supported)

```json
{
  "name": "Corporate & Govt Clients"
}
```

**Response `200`:** updated category in `data`.

**Response `404`:** category not found.

---

### 3.5 Delete category

```http
DELETE /api/database/categories/{id}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "674c00000000000000000001",
    "deleted": true
  }
}
```

**Delete protection (recommended):**

| HTTP status | When |
|-------------|------|
| `409 CONFLICT` | Category is linked to one or more database entries |

Example error:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category because it is used by 12 database entries."
  }
}
```

Alternatively, backend may cascade-delete entries or reassign them — document the chosen behaviour. Frontend currently expects delete to fail with a clear message if entries exist.

---

## 4. Entry entity

### 4.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (ObjectId) | yes (response) | Unique entry ID |
| `venueId` | string (ObjectId) | yes | Venue scope (from user context) |
| `categoryId` | string (ObjectId) | yes | Reference to `database_categories` |
| `categoryName` | string \| null | no (response) | Populated category name |
| `prefix` | enum | yes | `MR` \| `MRS` \| `MISS` \| `MASTER` |
| `name` | string | yes | Contact person name |
| `contactNumber1` | string | yes | Primary phone (6–20 chars) |
| `contactNumber2` | string \| null | no | Secondary phone |
| `email` | string \| null | no | Valid email when provided |
| `address` | string \| null | no | Contact address (max 500) |
| `companyName` | string \| null | no | Max 200 chars |
| `departmentName` | string \| null | no | Max 200 chars |
| `designation` | string \| null | no | Max 200 chars |
| `referredBy` | string \| null | no | Max 200 chars |
| `createdAt` | datetime | no (response) | Audit |
| `updatedAt` | datetime | no (response) | Audit |

### 4.2 Validation rules

1. `venueId` — required on create; must match authenticated user's venue.
2. `categoryId` — required; must reference an existing category for the same `venueId`.
3. `prefix` — required; one of `MR`, `MRS`, `MISS`, `MASTER`.
4. `name` — required; non-empty; max 200 chars.
5. `contactNumber1` — required; 6–20 characters.
6. `contactNumber2` — optional; 6–20 characters when provided.
7. `email` — optional; valid email format when provided.
8. Optional text fields respect max lengths above.
9. Multiple entries may share the same `categoryId`.

### 4.3 Example document (response)

```json
{
  "id": "674d00000000000000000001",
  "venueId": "69afc2df3235f0510b471102",
  "categoryId": "674c00000000000000000001",
  "categoryName": "Corporate Clients",
  "prefix": "MR",
  "name": "Ramesh Kumar",
  "contactNumber1": "9876543210",
  "contactNumber2": null,
  "email": "ramesh@example.com",
  "address": "Hyderabad",
  "companyName": "ABC Corp",
  "departmentName": "Admin",
  "designation": "Manager",
  "referredBy": "John Doe",
  "createdAt": "2026-06-02T10:00:00.000Z",
  "updatedAt": "2026-06-02T10:00:00.000Z"
}
```

---

## 5. Entry endpoints

Resource path: **`/api/database`**

| Method | Path |
|--------|------|
| GET | `/api/database` |
| POST | `/api/database` |
| GET | `/api/database/{id}` |
| PUT | `/api/database/{id}` |
| DELETE | `/api/database/{id}` |

---

### 5.1 List entries

```http
GET /api/database
```

**Query parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `venueId` | string | yes* | Scope results to a venue |
| `categoryId` | string | no | Filter by category (dropdown) |
| `search` | string | no | Case-insensitive search (see below) |

\* Frontend always sends `venueId` from `/me`.

**Search fields (recommended):**  
`name`, `email`, `contactNumber1`, `contactNumber2`, `address`, `companyName`, `departmentName`, `designation`, `referredBy`, `prefix`, `categoryName`

**Examples**

```http
GET /api/database?venueId=69afc2df3235f0510b471102
GET /api/database?venueId=69afc2df3235f0510b471102&search=ramesh
GET /api/database?venueId=69afc2df3235f0510b471102&categoryId=674c00000000000000000001
GET /api/database?venueId=69afc2df3235f0510b471102&search=admin&categoryId=674c00000000000000000001
```

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "674d00000000000000000001",
      "venueId": "69afc2df3235f0510b471102",
      "categoryId": "674c00000000000000000001",
      "categoryName": "Corporate Clients",
      "prefix": "MR",
      "name": "Ramesh Kumar",
      "contactNumber1": "9876543210",
      "contactNumber2": null,
      "email": "ramesh@example.com",
      "address": null,
      "companyName": null,
      "departmentName": null,
      "designation": null,
      "referredBy": null,
      "createdAt": "2026-06-02T10:00:00.000Z",
      "updatedAt": "2026-06-02T10:00:00.000Z"
    }
  ]
}
```

Results sorted by `name` ascending (recommended).

---

### 5.2 Get entry by ID

```http
GET /api/database/{id}
```

**Response `200`:** single entry in `data`.

**Response `404`:** entry not found.

---

### 5.3 Create entry

```http
POST /api/database
```

**Request body**

```json
{
  "venueId": "69afc2df3235f0510b471102",
  "categoryId": "674c00000000000000000001",
  "prefix": "MR",
  "name": "Ramesh Kumar",
  "contactNumber1": "9876543210",
  "contactNumber2": null,
  "email": "ramesh@example.com",
  "address": "Hyderabad",
  "companyName": "ABC Corp",
  "departmentName": "Admin",
  "designation": "Manager",
  "referredBy": "John Doe"
}
```

| Field | Required on create |
|-------|-------------------|
| `venueId` | yes (sent by frontend from `/me`) |
| `categoryId` | yes |
| `prefix` | yes |
| `name` | yes |
| `contactNumber1` | yes |
| All other fields | no |

**Response `201`:** created entry in `data` (with `categoryName` populated).

**Response `400`:** validation error.

**Response `404`:** `categoryId` or `venueId` not found.

---

### 5.4 Update entry

```http
PUT /api/database/{id}
```

**Request body:** partial update — send only fields to change.

```json
{
  "categoryId": "674c00000000000000000002",
  "name": "Ramesh K.",
  "contactNumber2": "9123456789",
  "designation": "Senior Manager"
}
```

**Response `200`:** updated entry in `data`.

**Response `404`:** entry not found, or new `categoryId` not found.

---

### 5.5 Delete entry

```http
DELETE /api/database/{id}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "674d00000000000000000001",
    "deleted": true
  }
}
```

**Response `404`:** entry not found.

---

## 6. Error format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error"
  }
}
```

| HTTP status | When |
|-------------|------|
| `400` | Validation failed |
| `401` | Missing or invalid JWT |
| `403` | User not allowed to access this venue's data |
| `404` | Category or entry not found |
| `409` | Conflict (e.g. deleting category in use) |
| `500` | Server error |

---

## 7. Suggested frontend flow

1. **On page load** — read `venueId` from `GET /api/me`.
2. **Category dropdown (filter)** — `GET /api/database/categories?venueId={venueId}`.
3. **List table** — `GET /api/database?venueId={venueId}&search=&categoryId=`.
4. **Add entry drawer**
   - Load categories for dropdown.
   - User selects **Category** (required).
   - `POST /api/database` with `venueId` + `categoryId` + contact fields.
5. **Edit entry** — `PUT /api/database/{id}` (partial body).
6. **Delete entry** — `DELETE /api/database/{id}`.
7. **Add category** — `POST /api/database/categories` with `{ venueId, name }`.
8. **Edit category** — `PUT /api/database/categories/{id}` with `{ name }`.
9. **Delete category** — `DELETE /api/database/categories/{id}` (block if entries exist).

### UI mapping

| Database UI | API |
|-------------|-----|
| Category filter dropdown | `categoryId` query param on `GET /api/database` |
| Search input | `search` query param on `GET /api/database` |
| Category field in drawer | `categoryId` in create/update body |
| Venue | Not shown; `venueId` auto-sent from user session |

---

## 8. MongoDB collections (reference)

### `database_categories`

```javascript
{
  _id: ObjectId,
  venueId: { type: ObjectId, ref: 'venues', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes (recommended):**

- `{ venueId: 1 }`
- `{ venueId: 1, name: 1 }` unique

### `database_entries`

```javascript
{
  _id: ObjectId,
  venueId: { type: ObjectId, ref: 'venues', required: true, index: true },
  categoryId: { type: ObjectId, ref: 'database_categories', required: true, index: true },
  prefix: { type: String, enum: ['MR', 'MRS', 'MISS', 'MASTER'], required: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  contactNumber1: { type: String, required: true, trim: true, maxlength: 20 },
  contactNumber2: { type: String, trim: true, maxlength: 20, default: null },
  email: { type: String, trim: true, lowercase: true, maxlength: 255, default: null },
  address: { type: String, trim: true, maxlength: 500, default: null },
  companyName: { type: String, trim: true, maxlength: 200, default: null },
  departmentName: { type: String, trim: true, maxlength: 200, default: null },
  designation: { type: String, trim: true, maxlength: 200, default: null },
  referredBy: { type: String, trim: true, maxlength: 200, default: null },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes (recommended):**

- `{ venueId: 1 }`
- `{ categoryId: 1 }`
- `{ venueId: 1, categoryId: 1 }`
- `{ venueId: 1, name: 1 }`

---

## 9. Authorization notes

| Role | Expected access |
|------|-----------------|
| `owner` | Full CRUD on categories and entries for their `venueId` |
| `incharge` | Full CRUD on categories and entries for their `venueId` |
| `admin` | Out of scope for this page (admin uses separate venue management) |

Backend should verify that JWT user's `venueId` matches the `venueId` on create, and that list/query results are scoped to that venue.

---

## 10. Changelog

| Date | Notes |
|------|-------|
| 2026-06-05 | Initial Database module spec — categories CRUD + entries CRUD, `categoryId` mapping, `venueId` from `/me`, search + category filter |
