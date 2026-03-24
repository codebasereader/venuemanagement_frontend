# Labours Backend Payload and Schema Example

This uses separate labour APIs (same pattern as commissions).

## 1) API endpoints

- `GET /api/venues/:venueId/leads/:leadId/labours`
- `POST /api/venues/:venueId/leads/:leadId/labours`
- `PATCH /api/venues/:venueId/leads/:leadId/labours/:labourId`
- `DELETE /api/venues/:venueId/leads/:leadId/labours/:labourId`

## 2) POST / PATCH payload example

```json
{
  "date": "2026-03-24T00:00:00.000Z",
  "shiftType": "both",
  "labourCount": 8,
  "dayRate": 650,
  "nightRate": 850,
  "amount": 12000,
  "notes": "Turnaround + overnight cleanup"
}
```

Amount formula used by frontend:

- `day` => `labourCount * dayRate`
- `night` => `labourCount * nightRate`
- `both` => `labourCount * (dayRate + nightRate)`  

## 3) Suggested Mongoose schema

```js
const LabourSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    shiftType: {
      type: String,
      enum: ["day", "night", "both"],
      required: true
    },
    labourCount: { type: Number, required: true, min: 1 },
    dayRate: { type: Number, default: 0, min: 0 },
    nightRate: { type: Number, default: 0, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" }
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema({
  // ...existing fields
  labours: { type: [LabourSchema], default: [] }
});
```

## 4) Suggested response examples

GET list response:

```json
[
  {
    "_id": "67f1f80b8b4d7f3fbb4f00a1",
    "date": "2026-03-24T00:00:00.000Z",
    "shiftType": "day",
    "labourCount": 12,
    "dayRate": 700,
    "nightRate": 0,
    "amount": 8400,
    "notes": "Stage setup"
  }
]
```

## 5) Suggested backend validation rules

- `shiftType=day` => `dayRate > 0`, `nightRate = 0`
- `shiftType=night` => `nightRate > 0`, `dayRate = 0`
- `shiftType=both` => `dayRate > 0` and `nightRate > 0`
- `amount` should be recomputed server-side before save.
- Optional: compute labour total per lead when serving summary endpoints.
