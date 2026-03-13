# Payment Reminders & Payments – Backend Schema & Payloads

This document describes the recommended API and data shape for **payment reminders** and **received payments** used by the Payments tab (lead-level).

---

## Overview

- **Payment reminders**: Expected payment entries (expected amount + expected date). User can add, edit, delete, or mark as "received."
- **Payments (received)**: When user clicks "Received" on a reminder, they confirm with notes and method (cash/account); that creates a **payment** record and the received amount is reflected in the progress bar (collected vs total).

Suggested routes (nested under lead):

- `GET/POST /api/venues/{venueId}/leads/{leadId}/payment-reminders`
- `GET/PATCH/DELETE /api/venues/{venueId}/leads/{leadId}/payment-reminders/{reminderId}`
- `GET/POST /api/venues/{venueId}/leads/{leadId}/payments` (received payments)

---

## 1. Payment reminder

### Fields

| Field            | Type     | Required | Description                          |
|------------------|----------|----------|--------------------------------------|
| `_id`            | ObjectId | (auto)   | Unique id                            |
| `leadId`         | ObjectId | yes      | Lead reference                       |
| `venueId`        | ObjectId | yes      | Venue reference                      |
| `expectedAmount` | Number   | yes      | Expected amount (e.g. INR)           |
| `expectedDate`    | Date     | yes      | Expected date (ISO string or Date)   |
| `status`         | String   | no       | e.g. `pending`, `received`           |
| `paymentId`      | ObjectId | no       | Set when marked received (link payment) |
| `createdAt`      | Date     | (auto)   |                                      |
| `updatedAt`      | Date     | (auto)   |                                      |

### Example: Create reminder (POST body)

**Request:** `POST /api/venues/{venueId}/leads/{leadId}/payment-reminders`

```json
{
  "expectedAmount": 691210,
  "expectedDate": "2026-01-09"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "leadId": "69b11a75b014e71dc485f735",
    "venueId": "69afc2df3235f0510b471102",
    "expectedAmount": 691210,
    "expectedDate": "2026-01-09T00:00:00.000Z",
    "status": "pending",
    "createdAt": "2026-03-11T10:00:00.000Z",
    "updatedAt": "2026-03-11T10:00:00.000Z"
  }
}
```

### Example: Update reminder (PATCH body)

**Request:** `PATCH /api/venues/{venueId}/leads/{leadId}/payment-reminders/{reminderId}`

```json
{
  "expectedAmount": 700000,
  "expectedDate": "2026-01-15"
}
```

### Example: List reminders (GET response)

**Request:** `GET /api/venues/{venueId}/leads/{leadId}/payment-reminders`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "leadId": "69b11a75b014e71dc485f735",
      "venueId": "69afc2df3235f0510b471102",
      "expectedAmount": 691210,
      "expectedDate": "2026-01-09T00:00:00.000Z",
      "status": "pending",
      "paymentId": null,
      "createdAt": "2026-03-11T10:00:00.000Z",
      "updatedAt": "2026-03-11T10:00:00.000Z"
    }
  ]
}
```

### Example: Delete reminder

**Request:** `DELETE /api/venues/{venueId}/leads/{leadId}/payment-reminders/{reminderId}`

**Response (200):** `{ "success": true }` or 204 No Content.

---

## 2. Payment (received payment)

When user confirms "Received" on a reminder, the frontend sends a **payment** record (amount, method, notes) and optionally links it to the reminder.

### Fields

| Field       | Type     | Required | Description                    |
|------------|----------|----------|--------------------------------|
| `_id`      | ObjectId | (auto)   | Unique id                      |
| `leadId`   | ObjectId | yes      | Lead reference                 |
| `venueId`  | ObjectId | yes      | Venue reference                |
| `amount`   | Number   | yes      | Received amount                |
| `method`   | String   | yes      | e.g. `cash`, `account` (bank)  |
| `notes`    | String   | no       | Optional notes                 |
| `reminderId` | ObjectId | no     | Link to reminder if marked from reminder |
| `receivedAt` | Date    | (auto)   | Defaults to now                |
| `createdAt` | Date    | (auto)   |                                |
| `updatedAt` | Date     | (auto)   |                                |

### Example: Record received payment (POST body)

**Request:** `POST /api/venues/{venueId}/leads/{leadId}/payments`

When user clicks "Received" on a reminder and confirms in the modal:

```json
{
  "amount": 691210,
  "method": "account",
  "notes": "NEFT received from customer.",
  "reminderId": "64a1b2c3d4e5f6789012345"
}
```

Without reminder (general "Add Payment"):

```json
{
  "amount": 500000,
  "method": "cash",
  "notes": "Advance in cash"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "leadId": "69b11a75b014e71dc485f735",
    "venueId": "69afc2df3235f0510b471102",
    "amount": 691210,
    "method": "account",
    "notes": "NEFT received from customer.",
    "reminderId": "64a1b2c3d4e5f6789012345",
    "receivedAt": "2026-03-11T10:05:00.000Z",
    "createdAt": "2026-03-11T10:05:00.000Z",
    "updatedAt": "2026-03-11T10:05:00.000Z"
  }
}
```

### Example: List payments (GET response)

**Request:** `GET /api/venues/{venueId}/leads/{leadId}/payments`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "leadId": "69b11a75b014e71dc485f735",
      "venueId": "69afc2df3235f0510b471102",
      "amount": 500000,
      "method": "account",
      "notes": "BANK TRANSFER",
      "reminderId": null,
      "receivedAt": "2025-12-27T00:00:00.000Z",
      "createdAt": "2025-12-27T00:00:00.000Z",
      "updatedAt": "2025-12-27T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Progress bar (frontend computation)

- **Total amount**: From the confirmed quote for the lead (`quote.pricing.totals.total`). If multiple confirmed quotes, use the one you consider primary or sum as per business rule.
- **Collected**: Sum of all `payment.amount` for that lead.
- **Pending**: `totalAmount - collected`.

No separate API for progress; the frontend uses **confirmed quote(s)** and **list payments** to compute these values.

---

## 4. Suggested Mongoose schemas (reference)

```javascript
const paymentReminderSchema = new mongoose.Schema({
  leadId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  venueId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  expectedAmount: { type: Number, required: true },
  expectedDate:   { type: Date, required: true },
  status:     { type: String, default: 'pending', enum: ['pending', 'received'] },
  paymentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  leadId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  venueId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  amount:     { type: Number, required: true },
  method:     { type: String, required: true, enum: ['cash', 'account'] },
  notes:      { type: String, default: '' },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentReminder' },
  receivedAt: { type: Date, default: Date.now },
}, { timestamps: true });
```

---

## 5. Summary

| Action              | Method | Endpoint                                                                 | Body (key parts)                          |
|---------------------|--------|--------------------------------------------------------------------------|-------------------------------------------|
| List reminders      | GET    | `/api/venues/:venueId/leads/:leadId/payment-reminders`                     | —                                         |
| Create reminder     | POST   | `/api/venues/:venueId/leads/:leadId/payment-reminders`                    | `expectedAmount`, `expectedDate`           |
| Update reminder     | PATCH  | `/api/venues/:venueId/leads/:leadId/payment-reminders/:reminderId`       | `expectedAmount`, `expectedDate`           |
| Delete reminder     | DELETE | `/api/venues/:venueId/leads/:leadId/payment-reminders/:reminderId`       | —                                         |
| List payments       | GET    | `/api/venues/:venueId/leads/:leadId/payments`                            | —                                         |
| Record payment      | POST   | `/api/venues/:venueId/leads/:leadId/payments`                             | `amount`, `method`, `notes`, `reminderId?` |
| Delete payment      | DELETE | `/api/venues/:venueId/leads/:leadId/payments/:paymentId`                  | —                                         |

After creating a payment linked to a reminder, the backend should set that reminder’s `status` to `received` and `paymentId` to the new payment’s `_id` so the UI can hide "Received" or show it as received.
