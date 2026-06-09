# Database Venue API — Backend Schema Specification

REST contract for the **Database Venue** contact list. Works like **Database Entries** (`/api/database`) mapped to **Categories**, but here each record is mapped to a global **Venue** (`/api/venues`).

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

| Module | Parent catalog | Child records | Filter param |
|--------|----------------|---------------|--------------|
| Database (contacts) | `GET /api/database/categories` | `GET /api/database` | `categoryId` |
| **Database Venue** | `GET /api/venues` | `GET /api/database/venues` | `venueId` |

Use the global venues list for dropdowns. Create or pick a venue first, then create database venue entries linked via `venueId`.

---

## 2. Venue entry entity

### 2.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (ObjectId) | yes (response) | Unique database venue entry ID |
| `venueId` | string | yes | Reference to global `venues` collection |
| `venueName` | string \| null | no (response) | Populated venue name |
| `venueAddress` | string \| null | no (response) | Populated venue address |
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

### 2.2 Validation rules

1. `venueId` — required; must reference an existing venue from `GET /api/venues`
2. `prefix` — required; one of `MR`, `MRS`, `MISS`, `MASTER`
3. `name` — required; non-empty; max 200 chars
4. `contactNumber1` — required; 6–20 characters
5. `contactNumber2` — optional; 6–20 characters when provided
6. `email` — optional; valid email format when provided
7. Optional text fields respect max lengths above
8. Multiple database venue entries may share the same `venueId` (one venue, many contacts)

### 2.3 Example document (response)

```json
{
  "id": "674d00000000000000000001",
  "venueId": "674c00000000000000000001",
  "venueName": "Main Hall",
  "venueAddress": "Block A, City Center",
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

## 3. Endpoints

Resource path: **`/api/database/venues`**

| Method | Path |
|--------|------|
| GET | `/api/database/venues` |
| POST | `/api/database/venues` |
| GET | `/api/database/venues/{id}` |
| PUT | `/api/database/venues/{id}` |
| DELETE | `/api/database/venues/{id}` |

---

### 3.1 List venue entries

```http
GET /api/database/venues
```

**Query parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | no | Case-insensitive search on name, email, phones, address, company, department, designation, referredBy, prefix |
| `venueId` | string | no | Filter by venue ID (omit for all venues) |

**Examples**

```http
GET /api/database/venues
GET /api/database/venues?search=ramesh
GET /api/database/venues?venueId=674c00000000000000000001
GET /api/database/venues?search=admin&venueId=674c00000000000000000001
```

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "674d00000000000000000001",
      "venueId": "674c00000000000000000001",
      "venueName": "Main Hall",
      "venueAddress": "Block A, City Center",
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

Results are sorted by `name` ascending.

---

### 3.2 Get venue entry by ID

```http
GET /api/database/venues/{id}
```

**Response `200`:** single entry in `data` (object, same shape as list item).

**Response `404`:** entry not found.

---

### 3.3 Create venue entry

```http
POST /api/database/venues
```

**Request body**

```json
{
  "venueId": "674c00000000000000000001",
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
| `venueId` | yes |
| `prefix` | yes |
| `name` | yes |
| `contactNumber1` | yes |
| All other fields | no |

**Response `201`:** created entry in `data` (with `venueName`, `venueAddress` populated).

**Response `400`:** validation error.

**Response `404`:** `venueId` does not exist.

---

### 3.4 Update venue entry

```http
PUT /api/database/venues/{id}
```

**Request body:** partial update — send only fields to change.

```json
{
  "name": "Ramesh K.",
  "contactNumber2": "9123456789",
  "designation": "Senior Manager"
}
```

**Response `200`:** updated entry in `data`.

**Response `404`:** entry not found, or new `venueId` not found.

---

### 3.5 Delete venue entry

```http
DELETE /api/database/venues/{id}
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

## 4. Related resources

### 4.1 Global venues (dropdown source)

Used to populate the venue picker before creating a database venue entry.

| Method | Path |
|--------|------|
| GET | `/api/venues` |
| POST | `/api/venues` |
| PUT | `/api/venues/{id}` |
| DELETE | `/api/venues/{id}` |

**List response item**

```json
{
  "id": "674c00000000000000000001",
  "name": "Main Hall",
  "address": "Block A, City Center"
}
```

**Note:** `GET /api/venues` does not require JWT. Database venue endpoints **do** require JWT.

**Delete protection:** A global venue cannot be deleted if it is linked to any database venue entry or business plan event (`409 CONFLICT`).

### 4.2 Database contacts (parallel module)

| Resource | Endpoint |
|----------|----------|
| Categories | `GET /api/database/categories` |
| Entries | `GET /api/database?categoryId=` |

Database venue entries mirror database entry field shapes; only the parent mapping differs (`venueId` instead of `categoryId`).

---

## 5. Error format

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
| `404` | Entry or venue not found |
| `409` | Conflict (e.g. deleting venue in use) |
| `500` | Server error |

---

## 6. Suggested frontend flow

1. **Venue dropdown** — `GET /api/venues` (optionally with `search`)
2. **Optional inline venue** — `POST /api/venues`, then refresh list and select new `id`
3. **List table** — `GET /api/database/venues?search=&venueId=`
4. **Create / edit modal** — `POST` or `PUT /api/database/venues` with `venueId` + contact fields
5. **Delete row** — `DELETE /api/database/venues/{id}`

**UI parity with Database contacts**

| Database contacts | Database venues |
|-------------------|-----------------|
| Category filter (`categoryId`) | Venue filter (`venueId`) |
| `categoryName` in table | `venueName` + `venueAddress` in table |
| Same prefix / phone / email fields | Same fields |

---

## 7. MongoDB collection (reference)

**Collection:** `database_venues`

```javascript
{
  _id: ObjectId,
  venueId: { type: ObjectId, ref: 'venues', required: true },
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

**Indexes:** `{ venueId: 1 }`, `{ name: 1 }`, `{ venueId: 1, name: 1 }`

---

## 8. Interactive API docs

Swagger UI: `GET /api/docs`  
OpenAPI spec: `GET /api/docs/swagger.yaml`  
Tag: **Database Venues**

---

## 9. Changelog

| Date | Notes |
|------|-------|
| 2026-06-02 | Initial Database Venue module — `database_venues` collection, CRUD at `/api/database/venues`, `venueId` mapping to global venues |
