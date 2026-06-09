# Calendar Monthly/Yearly - Updated Query Contract

This document reflects the current frontend behavior in `CalendarMonthly.jsx` and `src/api/leads.js` after moving filtering to server-side.

## 1) Mandatory Query Behavior

For both endpoints below:
- If `view=month`, send `year` and `month`.
- If `view=year`, send only `year` and do **not** send `month`.
- `bookingType` is optional and sent only when tab is not `all`.

## 2) Endpoints Used By Frontend

### A) Calendar events data

`GET /venues/:venueId/leads/confirmed`

Query sent by frontend:
- `view=month|year`
- `year=YYYY`
- `month=1..12` (only for monthly view)
- `bookingType=venue_buyout|space_buyout` (optional)

Purpose:
- Returns confirmed leads for calendar buckets (month/year).

### B) Stats cards data

`GET /venues/:venueId/leads/confirmed/stats`

Query sent by frontend:
- `view=month|year`
- `year=YYYY`
- `month=1..12` (only for monthly view)
- `bookingType=venue_buyout|space_buyout` (optional)

Purpose:
- Returns values for:
  - `totalBookings`
  - `totalRevenue`
  - `totalHoursBooked`
  - `totalEventDays`
  - `occupancyPercent`

## 3) Accepted Stats Response Shape

Preferred:
```json
{
  "totalBookings": 24,
  "totalRevenue": 520000,
  "totalHoursBooked": 186,
  "totalEventDays": 37,
  "occupancyPercent": 68.5
}
```

Fallback aliases supported by UI normalization:
- `bookings` -> `totalBookings`
- `revenue` -> `totalRevenue`
- `hours` -> `totalHoursBooked`
- `eventDays` -> `totalEventDays`
- `occupancy` -> `occupancyPercent`

## 4) Backend Filter Expectations

Server should apply all filtering in DB:
- `venueId`
- `year` (required)
- `month` only when `view=month`
- `bookingType` when provided
- confirmed leads route should already ensure status = confirmed

## 5) Overlap Logic For Calendar Days

For month/year range filtering, use:

```js
{
  "specialDay.startAt": { $lte: rangeEnd },
  "specialDay.endAt": { $gte: rangeStart }
}
```

Then bucket to `YYYY-MM-DD` server-side if you want to fully offload frontend computation.

## 6) Frontend Dynamic Labels

UI title/subtitle now changes based on view:
- `view=month` -> "Monthly bookings"
- `view=year` -> "Yearly bookings"
