# Daybook API (Profit / Loss)

## Endpoint

`GET /api/venues/{venueId}/daybook`

Auth: `admin`, `incharge`, or `owner`

## Query parameters (pick one)

1. `date` (YYYY-MM-DD)
   - Returns daybook for that single calendar day (UTC-based).

2. `from` (ISO datetime)
   - Optional `to` (ISO datetime).
   - If `to` is omitted, range is `from + 1 day`.

### Examples

- Single day:
  - `.../daybook?date=2026-03-24`
- Range:
  - `.../daybook?from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.999Z`

## How totals are calculated

Inflow (increase profit):
- `Payment.amount` (from received payments)
- `Commission.amount` where `direction = "inflow"`

Outflow (decrease profit):
- `Commission.amount` where `direction = "outflow"`
- `Labour.amount` (labour management cost)

Net:
- `profitLoss = inflowTotal - outflowTotal`
- `profitOrLossType = "profit"` if `profitLoss >= 0`, else `"loss"`

## Response format

```json
{
  "success": true,
  "data": {
    "period": {
      "mode": "day" | "range",
      "date": "YYYY-MM-DD" // when mode=day
      // or from/to when mode=range
    },
    "totals": {
      "inflowTotal": 0,
      "outflowTotal": 0,
      "profitLoss": 0,
      "profitOrLossType": "profit" | "loss"
    },
    "inflowItems": [
      {
        "_id": "…",
        "source": "payment|commission",
        "type": "inflow",
        "date": "2026-03-24T00:00:00.000Z",
        "amount": 0
      }
    ],
    "outflowItems": [
      {
        "_id": "…",
        "source": "commission|labour",
        "type": "outflow",
        "date": "2026-03-24T00:00:00.000Z",
        "amount": 0
      }
    ],
    "daybook": [
      {
        "date": "YYYY-MM-DD",
        "inflowTotal": 0,
        "outflowTotal": 0,
        "net": 0
      }
    ]
  }
}
```

Notes:
- `daybook[]` is grouped by day (UTC) inside your requested period.
- `inflowItems[]` / `outflowItems[]` contain the detailed rows used to compute totals (payments, commissions, labours).
- This endpoint uses server-side aggregation (MongoDB) for accuracy and speed.

