# Booking Calendar — Home Dashboard

Documentation for the year booking calendar on the Home page (`src/pages/Home.jsx` → `src/components/BookingCalendar.jsx`).

## Overview

The Booking Calendar shows a full-year grid for the selected year. It loads auspicious (faith) days and venue bookings from the **calendar-days** API in one request, then paints day cells based on toggles and overlaps.

## Data source

`GET /api/calendar-days?religion=all&year={year}`

Response (relevant fields):

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "days": [
      { "date": "2026-03-01", "religion": "hindu", "type": "most_auspicious" }
    ],
    "bookings": {
      "view": "year",
      "year": 2026,
      "items": [
        {
          "eventStatus": "confirmed",
          "specialDay": {
            "startAt": "2026-11-21T11:30:00.000Z",
            "endAt": "2026-11-21T17:30:00.000Z"
          },
          "contact": { "clientName": "…", "name": "…" },
          "eventType": "wedding",
          "referenceCode": "LD-…",
          "expectedGuests": 500
        }
      ]
    }
  }
}
```

### Bookings used on the calendar

Only leads with:

| `eventStatus`   | Color on calendar | Default toggle |
|-----------------|-------------------|----------------|
| `confirmed`     | Black `#1a1917`   | On             |
| `in_progress`   | Yellow `#facc15`  | On             |

Other statuses are ignored by the frontend.

Each booking paints **every local calendar date** from `specialDay.startAt` through `specialDay.endAt` (inclusive). Overnight events that cross midnight mark both days.

## Day cell colors

### Priority / composition

1. Collect colors that apply to that date (from visible toggles).
2. If **one** color → solid fill.
3. If **multiple** (e.g. confirmed + in progress, or booking + Christian/Muslim/Hindu) → **conic-gradient** so a slice of each color shows.
4. If none of the above and the date is today → purple “Today” style.
5. Otherwise → muted grey number.

Bookings no longer fully hide faith colors; when the faith overlay is on and a date is also booked, the cell shows a mix of booking + faith colors.

### Legend

- Always: **Today**
- When Confirmed toggle is on: **Confirmed** (black)
- When In progress toggle is on: **In progress** (yellow)
- When faiths toggle is on: **Christian**, **Muslim**, **Hindu**

## Toggles

All live under the calendar title. Defaults:

| Toggle                         | Default | Effect |
|--------------------------------|---------|--------|
| **Confirmed**                  | On      | Show/hide `eventStatus: "confirmed"` days |
| **In progress**                | On      | Show/hide `eventStatus: "in_progress"` days |
| **Christian · Muslim · Hindu** | Off     | Show/hide faith auspicious-day overlay |

Turning a booking toggle off removes those leads from the grid and from hover tooltips. Faith data is still fetched; it is only painted when the faiths toggle is on.

## Hover tooltip

Hover (or focus) a day that has at least one visible booking. The tooltip lists each booking with:

- Client name (`contact.clientName` or `contact.name`)
- Event type and reference code
- Status (`confirmed` / `in progress`), colored to match the calendar
- Special-day start–end (local formatting)
- Expected guest count (when present)

## Year selector

Years come from `getAvailableYears()` in `src/utils/calendarUtils.js`:

- Present year through present year + `CALENDAR_FUTURE_YEARS` (default **5**)
- Home defaults to the **current** year

## Files touched

| File | Role |
|------|------|
| `src/pages/Home.jsx` | Renders `<BookingCalendar year={…} onYearChange={…} />` |
| `src/components/BookingCalendar.jsx` | Calendar UI, toggles, coloring, tooltips, API load |
| `src/utils/calendarUtils.js` | Month helpers, date keys, year list |
| `src/api/calendar.js` | `listCalendarDays` → `GET calendar-days` |

## Behaviour summary

- Confirmed → black; in progress → yellow.
- Overlap of statuses and/or faiths → multi-color conic slices.
- Confirmed / In progress toggles default **on**; faiths default **off**.
- Tooltip shows booking details for visible leads on that date.
