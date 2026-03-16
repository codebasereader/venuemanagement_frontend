# Commissions payload + schema (Frontend → Backend)

This document defines the **recommended schema** and **API contract** for storing
**commission cashflows per lead**.

For each lead we want to track:

- **Outflow commissions** – cash you pay out to vendors/agents.
- **Inflow commissions** – cash you receive from vendors/partners.

Both are stored in a single `Commission` collection with a `direction` flag.

---

## 1. Route design (venue + lead scoped)

Routes follow the same pattern as quotes and payments:

| Action                | Method | Endpoint                                                                   |
| --------------------- | ------ | -------------------------------------------------------------------------- |
| List commissions      | GET    | `/api/venues/{venueId}/leads/{leadId}/commissions`                        |
| Create commission     | POST   | `/api/venues/{venueId}/leads/{leadId}/commissions`                        |
| Update commission     | PATCH  | `/api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}`         |
| Delete commission     | DELETE | `/api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}`         |

All routes are **lead-scoped** and **venue-scoped**.

---

## 2. Core enums / fields

### Direction

- `outflow` – commission you **pay** to others.
- `inflow` – commission you **receive** from others.

### Method (mode of payment)

- `cash`
- `account` (bank / UPI / online transfer)

### Commission document (Mongo / Mongoose style)

```javascript
const commissionSchema = new mongoose.Schema(
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

    direction: {
      type: String,
      enum: ["outflow", "inflow"],
      required: true,
    },

    vendorName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["cash", "account"],
      required: true,
    },

    givenDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

commissionSchema.index({ venueId: 1, leadId: 1, direction: 1, givenDate: -1 });
```

> `givenDate` is used for both inflow and outflow:
> - For **outflow**: date when you paid the vendor.
> - For **inflow**: date when you received the commission.

---

## 3. List commissions (GET)

**GET** `/api/venues/{venueId}/leads/{leadId}/commissions`

Optional query params:

- `direction` – `outflow | inflow`
- `from` – ISO date, filter `givenDate >= from`
- `to` – ISO date, filter `givenDate <= to`
- `method` – `cash | account`

### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "64b1b2c3d4e5f6789012345a",
      "venueId": "69afc2df3235f0510b471102",
      "leadId": "69b11a75b014e71dc485f735",
      "direction": "outflow",
      "vendorName": "Photographer Raj",
      "amount": 15000,
      "method": "cash",
      "givenDate": "2026-03-10T00:00:00.000Z",
      "notes": "Referral for photography",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-10T08:31:00.000Z",
      "updatedAt": "2026-03-10T08:31:00.000Z"
    },
    {
      "_id": "64b1b2c3d4e5f6789012345b",
      "venueId": "69afc2df3235f0510b471102",
      "leadId": "69b11a75b014e71dc485f735",
      "direction": "inflow",
      "vendorName": "Decorator Suresh",
      "amount": 20000,
      "method": "account",
      "givenDate": "2026-03-12T00:00:00.000Z",
      "notes": "Commission on decor package",
      "createdBy": "69afbd219ab76559ecbb2f1a",
      "createdAt": "2026-03-12T07:10:00.000Z",
      "updatedAt": "2026-03-12T07:10:00.000Z"
    }
  ]
}
```

---

## 4. Create commission (POST)

**POST** `/api/venues/{venueId}/leads/{leadId}/commissions`

### Outflow example (commission you pay)

```json
{
  "direction": "outflow",
  "vendorName": "Photographer Raj",
  "amount": 15000,
  "method": "cash",
  "givenDate": "2026-03-10T00:00:00.000Z",
  "notes": "Referral for photography"
}
```

### Inflow example (commission you receive)

```json
{
  "direction": "inflow",
  "vendorName": "Decorator Suresh",
  "amount": 20000,
  "method": "account",
  "givenDate": "2026-03-12T00:00:00.000Z",
  "notes": "Commission on decor package"
}
```

### Response (201)

```json
{
  "success": true,
  "data": {
    "_id": "64b1b2c3d4e5f6789012345a",
    "venueId": "69afc2df3235f0510b471102",
    "leadId": "69b11a75b014e71dc485f735",
    "direction": "outflow",
    "vendorName": "Photographer Raj",
    "amount": 15000,
    "method": "cash",
    "givenDate": "2026-03-10T00:00:00.000Z",
    "notes": "Referral for photography",
    "createdBy": "69afbd219ab76559ecbb2f1a",
    "createdAt": "2026-03-10T08:31:00.000Z",
    "updatedAt": "2026-03-10T08:31:00.000Z"
  }
}
```

---

## 5. Update commission (PATCH – edit)

**PATCH** `/api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}`

### Example

```json
{
  "vendorName": "Photographer Rajesh",
  "amount": 18000,
  "method": "account",
  "givenDate": "2026-03-11T00:00:00.000Z",
  "notes": "Updated: bank transfer instead of cash"
}
```

> The backend can optionally allow changing `direction`, but normally
> you keep the record as outflow/inflow and just update other fields.

### Response (200)

```json
{
  "success": true,
  "data": {
    "_id": "64b1b2c3d4e5f6789012345a",
    "vendorName": "Photographer Rajesh",
    "amount": 18000,
    "method": "account",
    "givenDate": "2026-03-11T00:00:00.000Z",
    "notes": "Updated: bank transfer instead of cash"
  }
}
```

---

## 6. Delete commission

**DELETE** `/api/venues/{venueId}/leads/{leadId}/commissions/{commissionId}`

### Response (200/204)

```json
{ "success": true }
```

If you prefer **soft delete**, add a `status` field similar to payments and
filter `status !== 'deleted'` in the list endpoint.

---

## 7. Frontend payload summary (Lead Commissions tab)

The **Lead Commissions** tab will send/expect the following fields:

- `direction`: `"outflow"` or `"inflow"` (card decides this)
- `vendorName`: string (required) – **Vendor name**
- `amount`: number (required) – **Amount**
- `method`: `"cash" | "account"` (required) – **Cash / Account dropdown**
- `givenDate`: ISO date string; UI uses a `date` picker (time portion `T00:00:00.000Z` is enough)
- `notes`: string (optional)

The same schema is used for:

- **Outflow cash card** – `direction = "outflow"`
- **Inflow cash card** – `direction = "inflow"`

### Data for pie chart

On the frontend we will compute totals from the list:

- `outflowTotal = sum(amount where direction === "outflow")`
- `inflowTotal = sum(amount where direction === "inflow")`

These two numbers drive a **pie/donut chart** that visualizes:

- Portion of total commissions that are **outflow** vs **inflow**

No extra API is required for the chart; the numbers are derived from the list endpoint.***
