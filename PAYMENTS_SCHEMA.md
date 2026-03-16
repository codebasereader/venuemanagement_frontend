# Payments payload + schema (Frontend → Backend)

This document describes the **recommended schema** and **API contract** for recording
**received payments for a Lead**. It is designed to work with the existing routes:

- `GET  /api/venues/{venueId}/leads/{leadId}/payments`
- `POST /api/venues/{venueId}/leads/{leadId}/payments`
- `PATCH /api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`
- `DELETE /api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`

The goal is to support:

- A separate **“Add received payments” tab** (manual payments, not tied to reminders)
- Existing **“Payment reminders”** flow (mark reminder as received)
- Full **edit + delete** support for each payment row

---

## 1. Route design (venue + lead scoped)

All payment records are scoped to a specific **venue** and **lead**.

| Action              | Method | Endpoint                                                          |
| ------------------- | ------ | ----------------------------------------------------------------- |
| List payments       | GET    | `/api/venues/{venueId}/leads/{leadId}/payments`                  |
| Create payment      | POST   | `/api/venues/{venueId}/leads/{leadId}/payments`                  |
| Update payment      | PATCH  | `/api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`      |
| Delete payment      | DELETE | `/api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`      |

> These endpoints are already used by the frontend `src/api/payments.js`.  
> The schema below adds fields for **received date**, **mode**, **received by**, and **given by**.

---

## 2. Core fields / enums

### Method (mode of payment)

- `cash`
- `account` (any bank / UPI / online transfer)

> You can extend this later (e.g. `"card"`, `"upi"`) without breaking the UI.

### Payment document (Mongo / Mongoose style)

At a minimum each payment record should store:

- `_id`: ObjectId
- `venueId`: ObjectId (ref `Venue`) **required**
- `leadId`: ObjectId (ref `Lead`) **required**
- `amount`: number **required** – amount received (in rupees)
- `method`: `"cash" | "account"` **required**
- `receivedAt`: Date **required** – when the payment was actually received
- `receivedByName`: string **required** – staff member who received the payment
- `givenByName`: string **required** – guest / client who gave the payment
- `notes`: string (optional) – short free‑text note (NEFT ref no, UPI id, etc.)
- `reminderId`: ObjectId (ref `PaymentReminder`, optional)
  - present when the payment was created via **“Payment reminder → Mark as received”**
- `status`: `"active" | "deleted"` (optional, if you want soft delete)
- `createdBy`: ObjectId (ref `User`) – from JWT
- `createdAt`, `updatedAt`: timestamps

Example Mongoose schema:

```javascript
const paymentSchema = new mongoose.Schema(
  {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: true,
      enum: ["cash", "account"],
    },
    receivedAt: {
      type: Date,
      required: true,
    },
    receivedByName: {
      type: String,
      required: true,
      trim: true,
    },
    givenByName: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentReminder",
    },
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

paymentSchema.index({ venueId: 1, leadId: 1, createdAt: -1 });
```

---

## 3. List payments (GET)

**GET** `/api/venues/{venueId}/leads/{leadId}/payments`

Optional query params (future‑friendly):

- `from` – ISO datetime, only payments with `receivedAt >= from`
- `to` – ISO datetime, only payments with `receivedAt <= to`
- `method` – `cash | account`

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345a",
      "venueId": "69afc2df3235f0510b471102",
      "leadId": "69b11a75b014e71dc485f735",
      "amount": 250000,
      "method": "account",
      "receivedAt": "2026-03-12T10:30:00.000Z",
      "receivedByName": "Kumar",
      "givenByName": "Ramesh",
      "notes": "NEFT AXIS123456",
      "reminderId": "64a1b2c3d4e5f6789012345b",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-12T10:31:00.000Z",
      "updatedAt": "2026-03-12T10:31:00.000Z"
    }
  ]
}
```

> The frontend `PaymentHistoryCard` already expects `amount`, `method`, and a date
> (`receivedAt` or `createdAt`). With this schema, **“Edit”** simply updates the same record.

---

## 4. Create payment (POST)

This endpoint is used by:

- **“Add received payments” tab** (manual add)
- **“Payment reminders → Received”** modal (auto‑filled from reminder)

**POST** `/api/venues/{venueId}/leads/{leadId}/payments`

### Request body – manual add (from “Add received payments” tab)

```json
{
  "amount": 300000,
  "method": "cash",
  "receivedAt": "2026-03-15T09:00:00.000Z",
  "receivedByName": "Anand",
  "givenByName": "Bride family",
  "notes": "Advance amount collected at venue"
}
```

### Request body – from reminder (current `ReceivedPaymentModal` path)

```json
{
  "amount": 250000,
  "method": "account",
  "receivedAt": "2026-03-12T10:30:00.000Z",
  "receivedByName": "Kumar",
  "givenByName": "Ramesh",
  "notes": "NEFT ref AXIS123456",
  "reminderId": "64a1b2c3d4e5f6789012345b"
}
```

> If you want the reminder flow to keep working without frontend changes, you can:
>
> - Default `receivedAt` to `new Date()` on the backend **when omitted**
> - Default `receivedByName` / `givenByName` to blank or from related models (lead primary contact)

### Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345a",
    "venueId": "69afc2df3235f0510b471102",
    "leadId": "69b11a75b014e71dc485f735",
    "amount": 250000,
    "method": "account",
    "receivedAt": "2026-03-12T10:30:00.000Z",
    "receivedByName": "Kumar",
    "givenByName": "Ramesh",
    "notes": "NEFT AXIS123456",
    "reminderId": "64a1b2c3d4e5f6789012345b",
    "createdBy": "69afbd219ab76559ecbb2f1a",
    "createdAt": "2026-03-12T10:31:00.000Z",
    "updatedAt": "2026-03-12T10:31:00.000Z"
  }
}
```

---

## 5. Update payment (PATCH – for “Edit”)

To support **edit in the UI**, the backend should allow partial updates.

**PATCH** `/api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`

### Example – edit method, date, and names

```json
{
  "amount": 300000,
  "method": "account",
  "receivedAt": "2026-03-16T11:00:00.000Z",
  "receivedByName": "Anand",
  "givenByName": "Bride family",
  "notes": "Updated: amount adjusted after discussion"
}
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345a",
    "amount": 300000,
    "method": "account",
    "receivedAt": "2026-03-16T11:00:00.000Z",
    "receivedByName": "Anand",
    "givenByName": "Bride family",
    "notes": "Updated: amount adjusted after discussion"
  }
}
```

---

## 6. Delete payment

**DELETE** `/api/venues/{venueId}/leads/{leadId}/payments/{paymentId}`

### Response (200/204)

```json
{ "success": true }
```

If you prefer **soft delete**, keep the record and set:

```json
{
  "status": "deleted"
}
```

and filter `status !== "deleted"` in the list API.

---

## 7. Frontend payload summary

For the **“Add received payments” tab**, the frontend should send:

- `amount`: number (required)
- `method`: `"cash" | "account"` (required – select dropdown)
- `receivedAt`: ISO datetime string (required; build from **date + time** pickers or default to now)
- `receivedByName`: string (required; text input)
- `givenByName`: string (required; text input)
- `notes`: string (optional)

For **reminder → received** flow:

- same fields as above, plus
- `reminderId`: ObjectId (optional, but recommended)

The list and history UI (`PaymentHistoryCard`) can read:

- `amount`
- `method`
- `receivedAt` (fallback to `createdAt` if you don’t store it yet)
- `receivedByName`, `givenByName` (for future display in tooltip / details view)

