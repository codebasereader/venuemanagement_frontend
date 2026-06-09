# Leads Calendar - Backend Contract Guide

This document defines how to move lead calendar logic to backend so frontend only renders data.

## 1) Recommended Lead Schema (Mongo-style)

```js
Lead {
  _id: ObjectId,
  venueId: ObjectId,              // required, indexed
  bookingType: "venue_buyout" | "space_buyout",
  eventStatus: "in_progress" | "confirmed" | "cancelled",
  eventType: String,              // wedding, birthday, etc.
  eventTypeOther: String|null,
  contact: {
    name: String,
    phone: String,
    email: String|null
  },
  specialDay: {
    startAt: Date,                // required for calendar events
    endAt: Date                   // required for calendar events
  },
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date|null            // optional soft delete
}
```

## 2) Critical Validation Rules (Server Side)

- `specialDay.startAt <= specialDay.endAt` always.
- `eventStatus` only from enum: `in_progress`, `confirmed`, `cancelled`.
- Normalize incoming aliases:
  - `inprogress` -> `in_progress`
  - `conformed` -> `confirmed`
- Reject leads without `venueId`.
- Use venue timezone consistently when converting date ranges to day buckets.

## 3) Required Indexes

- `{ venueId: 1, eventStatus: 1, "specialDay.startAt": 1, "specialDay.endAt": 1 }`
- `{ venueId: 1, createdAt: -1 }` (list pages)
- text/keyword support for search:
  - either text index on `contact.name`, `contact.phone`
  - or normalized keyword fields for faster partial search

## 4) API Endpoints For Leads Page

### A. List Leads (cards/list view)

`GET /venues/:venueId/leads`

Query params:
- `search` (name/phone)
- `eventStatus` (`in_progress|confirmed|cancelled`)
- `startDate` (`YYYY-MM-DD`)
- `endDate` (`YYYY-MM-DD`)
- `page` (default `1`)
- `limit` (default `12`)
- `sortBy` (optional, default `createdAt`)
- `sortOrder` (`asc|desc`, default `desc`)

Response:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### B. Calendar Buckets (monthly/yearly views)

`GET /venues/:venueId/leads/calendar`

Query params:
- `view` = `month|year`
- `year` = `2026`
- `month` = `1..12` (required for month view)
- `eventStatus` = `all|in_progress|confirmed|cancelled` (default `all`)
- `bookingType` = `all|venue_buyout|space_buyout` (optional)
- `search` (optional)
- `timezone` (optional, e.g. `Asia/Kolkata`)

Response (day-keyed buckets):
```json
{
  "view": "month",
  "year": 2026,
  "month": 6,
  "days": {
    "2026-06-02": [
      {
        "id": "leadId",
        "contactName": "John",
        "eventStatus": "confirmed",
        "eventType": "Wedding",
        "specialDay": {
          "startAt": "2026-06-02T06:00:00.000Z",
          "endAt": "2026-06-02T18:00:00.000Z"
        }
      }
    ]
  }
}
```

### C. Day Details (drawer data)

`GET /venues/:venueId/leads/calendar/day/:date`

Path:
- `date` = `YYYY-MM-DD`

Query params:
- `eventStatus`
- `bookingType`
- `timezone`

Response:
```json
{
  "date": "2026-06-02",
  "count": 2,
  "items": []
}
```

### D. Leads Summary Stats (for dynamic totals)

`GET /venues/:venueId/leads/stats`

Query params:
- `view` = `month|year|list`
- `year` (required for month/year views)
- `month` (required only for month view)
- `eventStatus` = `all|in_progress|confirmed|cancelled`
- `bookingType` = `all|venue_buyout|space_buyout` (optional)
- `search` (optional)
- `startDate` / `endDate` (optional for list-screen filter summary)

Response:
```json
{
  "totalLeads": 124,
  "inProgress": 21,
  "confirmed": 82,
  "cancelled": 21,
  "totalRevenue": 850000,
  "totalEventDays": 47,
  "totalHoursBooked": 192
}
```

Notes:
- This endpoint should return totals after applying the same filters as list/calendar queries.
- Frontend status colors are mapped by `eventStatus` enum:
  - `in_progress` -> yellow
  - `confirmed` -> green
  - `cancelled` -> red

## 5) Query Logic (Backend)

For overlap filtering (date range):
```js
{
  "specialDay.startAt": { $lte: endBoundary },
  "specialDay.endAt": { $gte: startBoundary }
}
```

This ensures events spanning multiple days are included and allows stacked cards per day.

## 6) Frontend Should Stop Doing

- Expanding each lead into day buckets in browser.
- Status normalization in UI.
- Complex date overlap filtering in UI.

All above should be API-driven for consistency and performance.
