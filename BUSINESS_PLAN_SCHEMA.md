# Business Plan — Schema & API Design

Share this with the backend team to implement the Business Plan feature.

---

## Overview

The Business Plan feature lets venue owners set monthly **expected** targets (bookings, business, expenses) per space, and compare them against **actual** figures derived from daybook and bookings data.

---

## Database Schema

### Collection: `business_plans`

```json
{
  "_id": "ObjectId",
  "venueId": "ObjectId (ref: venues)",
  "month": "Number (1–12)",
  "year": "Number (e.g. 2026)",
  "rows": [
    {
      "rowType": "String — 'venue_buyout' | 'space'",
      "spaceId": "ObjectId | null  (null for venue_buyout row)",
      "spaceName": "String  (denormalised label, stored for display safety)",
      "expectedBookings": "Number (default 0)",
      "expectedBusiness": "Number — total revenue expected in ₹ (default 0)",
      "expectedExpenses": "Number — total expenses expected in ₹ (default 0)"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Index

```
{ venueId: 1, month: 1, year: 1 }  →  unique
```

One document per venue per month. Use **upsert** on save.

### What is NOT stored

| Field             | Reason                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| `expectedProfits` | Always computed on the frontend as `expectedBusiness − expectedExpenses` |
| `actualBookings`  | Aggregated at query time from the bookings/leads collection              |
| `actualBusiness`  | Aggregated at query time: `SUM(rent + inflow)` from daybook entries      |
| `actualExpenses`  | Aggregated at query time: `SUM(outflow + labours)` from daybook entries  |
| `actualProfits`   | Computed on the frontend as `actualBusiness − actualExpenses`            |

---

## Actual Data — Aggregation Rules

When a GET returns a plan, attach computed actual figures to each row:

| Actual Field     | Source                                     | Filter                                                    |
| ---------------- | ------------------------------------------ | --------------------------------------------------------- |
| `actualBookings` | Count of confirmed leads/bookings          | `venueId` + space match + within the requested month/year |
| `actualBusiness` | `SUM(rent) + SUM(inflow)` from daybook     | Same filter                                               |
| `actualExpenses` | `SUM(outflow) + SUM(labours)` from daybook | Same filter                                               |

**For the `venue_buyout` row** (`spaceId: null`): aggregate across the entire venue (not filtered by specific space), or only venue-level bookings with no space assigned — whichever matches your bookings schema.

---

## API Endpoints

### 1. GET Monthly Plan

```
GET /api/venues/:venueId/business-plan
```

**Query Parameters**

| Param   | Type   | Required | Description |
| ------- | ------ | -------- | ----------- |
| `month` | Number | ✅       | 1–12        |
| `year`  | Number | ✅       | e.g. 2026   |

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "venueId": "abc123",
    "month": 5,
    "year": 2026,
    "rows": [
      {
        "rowType": "venue_buyout",
        "spaceId": null,
        "spaceName": "Complete Venue Buyout",
        "expectedBookings": 10,
        "expectedBusiness": 500000,
        "expectedExpenses": 100000,
        "actualBookings": 8,
        "actualBusiness": 420000,
        "actualExpenses": 95000
      },
      {
        "rowType": "space",
        "spaceId": "spaceId1",
        "spaceName": "Main Hall",
        "expectedBookings": 5,
        "expectedBusiness": 200000,
        "expectedExpenses": 50000,
        "actualBookings": 4,
        "actualBusiness": 180000,
        "actualExpenses": 45000
      }
    ]
  }
}
```

**If no plan is saved yet — return 200 with empty rows (preferred over 404)**

```json
{
  "success": true,
  "data": {
    "venueId": "abc123",
    "month": 5,
    "year": 2026,
    "rows": []
  }
}
```

> The frontend will still render all current spaces with blank expected values.

---

### 2. POST — Upsert Monthly Plan

```
POST /api/venues/:venueId/business-plan
```

**Request Body**

```json
{
  "month": 5,
  "year": 2026,
  "rows": [
    {
      "rowType": "venue_buyout",
      "spaceId": null,
      "spaceName": "Complete Venue Buyout",
      "expectedBookings": 10,
      "expectedBusiness": 500000,
      "expectedExpenses": 100000
    },
    {
      "rowType": "space",
      "spaceId": "spaceId1",
      "spaceName": "Main Hall",
      "expectedBookings": 5,
      "expectedBusiness": 200000,
      "expectedExpenses": 50000
    }
  ]
}
```

**Behaviour**

- Use `findOneAndUpdate` with `upsert: true` keyed on `{ venueId, month, year }`.
- Replace the entire `rows` array on each save.

**Success Response — 200 / 201**

Return the full updated document in the same format as GET Monthly (including computed actual fields).

---

### 3. GET Yearly Summary

```
GET /api/venues/:venueId/business-plan/yearly
```

**Query Parameters**

| Param  | Type   | Required | Description |
| ------ | ------ | -------- | ----------- |
| `year` | Number | ✅       | e.g. 2026   |

**Success Response — 200**

Returns one object per month that has **either a saved plan or actual data**. Missing months are filled in by the frontend with dashes.

```json
{
  "success": true,
  "data": [
    {
      "month": 1,
      "totalExpectedBookings": 15,
      "totalExpectedBusiness": 700000,
      "totalExpectedExpenses": 150000,
      "totalActualBookings": 12,
      "totalActualBusiness": 620000,
      "totalActualExpenses": 140000
    },
    {
      "month": 2,
      "totalExpectedBookings": 18,
      "totalExpectedBusiness": 850000,
      "totalExpectedExpenses": 180000,
      "totalActualBookings": 16,
      "totalActualBusiness": 790000,
      "totalActualExpenses": 170000
    }
  ]
}
```

> `totalExpectedProfits` and `totalActualProfits` are **not required** in the response — the frontend computes them as `business − expenses`.

---

## Field Definitions

| Field              | Type   | Unit              | Notes                                      |
| ------------------ | ------ | ----------------- | ------------------------------------------ |
| `expectedBookings` | Number | count             | Number of bookings planned                 |
| `expectedBusiness` | Number | ₹ (whole numbers) | Planned total revenue                      |
| `expectedExpenses` | Number | ₹ (whole numbers) | Planned total expenses                     |
| `actualBookings`   | Number | count             | Computed from bookings/leads               |
| `actualBusiness`   | Number | ₹                 | `SUM(rent) + SUM(inflow)` from daybook     |
| `actualExpenses`   | Number | ₹                 | `SUM(outflow) + SUM(labours)` from daybook |

---

## Notes for Backend

1. **Route order matters** — register `/yearly` before `/:id` or any wildcard to avoid path conflicts.
2. **Actual data aggregation** — compute actuals in the same query/pipeline as the plan lookup to avoid an extra round-trip.
3. **Authorization** — protect all endpoints; only `owner` and `incharge` roles with access to the venue should be allowed.
4. **Validation** — ensure `month` is 1–12, `year` is a reasonable range (e.g. 2020–2040), and all monetary fields are non-negative numbers.
5. **Denormalized `spaceName`** — stored on each row so historical plans remain readable even if the space is later renamed or deleted.
