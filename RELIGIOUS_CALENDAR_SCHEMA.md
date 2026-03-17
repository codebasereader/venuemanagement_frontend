# Religious Calendar – Payload & Schema

This document describes the **recommended payloads** and **backend schema** for the Religious Calendar feature. The calendar is **global** — it is **not** tied to any venue; the same auspicious dates apply across all venues.

The frontend lets the user:

- Choose a religion tab (Hindu / Muslim / Christian)
- Choose a **type** (Highly Auspicious / auspicious / less auspicious)
- Pick **multiple dates** via the calendar

---

## 1. Route design (global, not venue-scoped)

Endpoints are **not** under a venue. They are application-level (admin-managed, common for all venues).

| Action        | Method | Endpoint                  |
| ------------- | ------ | ------------------------- |
| List days     | GET    | `/api/calendar-days`      |
| Create (bulk) | POST   | `/api/calendar-days/bulk` |
| Create (one)  | POST   | `/api/calendar-days`      |
| Update one    | PATCH  | `/api/calendar-days/{id}` |
| Delete one    | DELETE | `/api/calendar-days/{id}` |

No `venueId` in the path or in the resource model.

---

## 2. Enums

**Religion**

- `hindu`
- `muslim`
- `christian`

**Type**

- `most_auspicious`
- `auspicious`
- `less_auspicious`

---

## 3. Bulk create (from the Calendar page)

When the user selects a religion, chooses a type, and picks multiple dates, the frontend sends one bulk request.

### Request

**POST** `/api/calendar-days/bulk`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

```json
{
  "items": [
    {
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-09"
    },
    {
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-10"
    },
    {
      "religion": "hindu",
      "type": "auspicious",
      "date": "2026-02-01"
    }
  ]
}
```

### Response (200/201)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-09",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:30:00.000Z",
      "updatedAt": "2026-03-13T07:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012345b",
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-10",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:30:00.000Z",
      "updatedAt": "2026-03-13T07:30:00.000Z"
    }
  ]
}
```

Single-item create (optional):

**POST** `/api/calendar-days`

```json
{
  "religion": "hindu",
  "type": "most_auspicious",
  "date": "2026-01-09"
}
```

---

## 4. List (with optional filters)

**GET** `/api/calendar-days`

Query params (all optional):

- `religion` – one of `hindu | muslim | christian`
- `type` – one of `most_auspicious | auspicious | less_auspicious`
- `year` – integer (e.g. `2026`)
- `month` – 1–12 (January = 1)

Examples:

- `GET /api/calendar-days` — all days
- `GET /api/calendar-days?religion=hindu` — Hindu only
- `GET /api/calendar-days?religion=hindu&type=most_auspicious&year=2026&month=1` — Hindu, Highly Auspicious, Jan 2026

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-09",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:30:00.000Z",
      "updatedAt": "2026-03-13T07:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012345b",
      "religion": "hindu",
      "type": "auspicious",
      "date": "2026-01-15",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:32:00.000Z",
      "updatedAt": "2026-03-13T07:32:00.000Z"
    }
  ]
}
```

---

## 5. Update and delete

### Update one

**PATCH** `/api/calendar-days/{id}`

```json
{
  "type": "less_auspicious"
}
```

Optional: allow changing `date` or `religion` if your business rules allow it.

### Delete one

**DELETE** `/api/calendar-days/{id}`

```json
{ "success": true }
```

Optional: support bulk delete by query, e.g.  
`DELETE /api/calendar-days?religion=hindu&date=2026-01-09`.

---

## 6. Mongo/Mongoose schema (no venueId)

Calendar is **global**; there is no `venueId` on the document.

```javascript
const religiousCalendarDaySchema = new mongoose.Schema(
  {
    religion: {
      type: String,
      required: true,
      enum: ["hindu", "muslim", "christian"],
    },
    type: {
      type: String,
      required: true,
      enum: ["most_auspicious", "auspicious", "less_auspicious"],
    },
    date: {
      type: String, // 'YYYY-MM-DD', e.g. '2026-01-09'
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// One entry per religion + date (global)
religiousCalendarDaySchema.index({ religion: 1, date: 1 }, { unique: true });
```

---

## 7. Frontend payload summary

When the user saves from the Calendar modal, the frontend sends items **without** any venue reference. Each item has:

- `religion` — `"hindu" | "muslim" | "christian"`
- `type` — `"most_auspicious" | "auspicious" | "less_auspicious"`
- `date` — `"YYYY-MM-DD"`

Either send the array in a wrapper:

```json
{ "items": [ { "religion": "hindu", "type": "most_auspicious", "date": "2026-01-09" }, ... ] }
```

or accept a raw array on bulk create, depending on your API convention. The important point: **no `venueId`** — the calendar is common for all venues.
