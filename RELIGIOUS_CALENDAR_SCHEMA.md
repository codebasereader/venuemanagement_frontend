# Religious Calendar – Payload & Schema

This document describes the **recommended payloads** and **backend schema** for the Religious Calendar screen (Hindu, Muslim, Christian auspicious days).

The frontend treats Hindu / Muslim / Christian as separate calendars, and lets the user:

- Choose a religion tab
- Choose a **type** (most auspicious / auspicious / less auspicious)
- Pick **multiple dates** via the calendar

---

## 1. Route design

All endpoints are venue‑scoped (optionally also user‑scoped if needed).

Recommended base:

- `GET/POST /api/venues/{venueId}/calendar-days`
- `GET/PATCH/DELETE /api/venues/{venueId}/calendar-days/{id}`

> If you want per‑venue + per‑religion separation, keep `religion` inside the document (see schema) and filter by query param `?religion=hindu`.

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

## 3. Bulk create payload (from the Calendar page)

When the user selects a religion, chooses a type and clicks multiple dates in the calendar, the frontend will typically send **one bulk request** containing all the new days.

### Example request

**POST** `/api/venues/{venueId}/calendar-days/bulk`

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

**Response (200/201):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "venueId": "69afc2df3235f0510b471102",
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-09",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:30:00.000Z",
      "updatedAt": "2026-03-13T07:30:00.000Z"
    }
  ]
}
```

> You can also accept a **single‑item** payload for non‑bulk cases:
> `POST /api/venues/{venueId}/calendar-days` with body `{ "religion": "...", "type": "...", "date": "..." }`

---

## 4. List / filter payload

### List all for a venue (optional filters)

**GET** `/api/venues/{venueId}/calendar-days?religion=hindu&type=most_auspicious&year=2026&month=1`

Query params:

- `religion` – optional, one of `hindu|muslim|christian`
- `type` – optional, one of `most_auspicious|auspicious|less_auspicious`
- `year` – optional, integer year (e.g. `2026`)
- `month` – optional, 1‑12 (January = 1)

**Example response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "venueId": "69afc2df3235f0510b471102",
      "religion": "hindu",
      "type": "most_auspicious",
      "date": "2026-01-09",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-13T07:30:00.000Z",
      "updatedAt": "2026-03-13T07:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012345b",
      "venueId": "69afc2df3235f0510b471102",
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

## 5. Update / delete

### Update a single day

**PATCH** `/api/venues/{venueId}/calendar-days/{id}`

```json
{
  "type": "less_auspicious"
}
```

You may optionally allow changing `date` or `religion`, but in most cases you only need to update the **type**.

### Delete a single day

**DELETE** `/api/venues/{venueId}/calendar-days/{id}`

Response:

```json
{ "success": true }
```

You can also support bulk delete: `DELETE /api/venues/{venueId}/calendar-days?religion=hindu&date=2026-01-09`.

---

## 6. Suggested Mongo/Mongoose schema

```javascript
const religiousCalendarDaySchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
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
    // store only the date part (no time) in UTC
    date: {
      type: String, // e.g. '2026-01-09'
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Optional index to prevent duplicates
religiousCalendarDaySchema.index(
  { venueId: 1, religion: 1, date: 1 },
  { unique: true }
);
```

---

## 7. Frontend → Backend payload summary

When the user **saves** from the modal on the Calendar page, the frontend will send an array of items of this shape:

```json
[
  {
    "religion": "hindu",
    "type": "most_auspicious",
    "date": "2026-01-09"
  },
  {
    "religion": "hindu",
    "type": "most_auspicious",
    "date": "2026-01-10"
  }
]
```

You can either accept that array directly or wrap it in `{ "items": [...] }` as shown in the bulk example above. This should give you everything you need to design and implement the backend schema and APIs for the religious calendar feature.

