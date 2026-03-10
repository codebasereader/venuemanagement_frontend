# Example payloads for backend schema design (Pricing)

Use these JSON examples to design your API request/response schema and DB models. All values are copy-paste ready.

---

## 1. Venue buyout (venue-level pricing)

**When to use:** One document per venue (e.g. `venueId` in path or body). Frontend sends this when user saves "Venue Buyout" tab.

```json
{
  "buyoutOnly": false,
  "rackRates": {
    "12": "50000",
    "24": "90000",
    "36": "120000",
    "48": "150000"
  },
  "inclusions": [
    {
      "id": "inc-1739123456789-abc12de",
      "name": "Sound system",
      "maxQuantity": 1
    },
    {
      "id": "inc-1739123456790-xyz34fg",
      "name": "Basic lighting"
    }
  ],
  "addons": [
    {
      "id": "addon-1739123456791-addon01",
      "name": "Extra projector",
      "maxQuantity": 2,
      "prices": {
        "12": "5000",
        "24": "8000",
        "36": "10000",
        "48": "12000"
      }
    },
    {
      "id": "addon-1739123456792-addon02",
      "name": "Catering package",
      "prices": {
        "12": "20000",
        "24": "35000",
        "36": "45000",
        "48": "55000"
      }
    }
  ]
}
```

**Field summary (venue buyout):**

| Field         | Type    | Required | Description |
|---------------|---------|----------|-------------|
| buyoutOnly    | boolean | ✓        | If true, hide per-space pricing; only venue buyout is offered. |
| rackRates     | object  | ✓        | Keys: `"12"`, `"24"`, `"36"`, `"48"` (hours). Values: price as string (e.g. `"50000"` for ₹50,000). Empty string = not offered. |
| inclusions    | array   | ✓        | Items included at no extra cost. |
| inclusions[].id | string | ✓      | Unique id (frontend generates; backend may replace with `_id`). |
| inclusions[].name | string | ✓    | Display name. |
| inclusions[].maxQuantity | number |   | Optional. Max quantity per booking. |
| addons        | array   | ✓        | Extra chargeable items. |
| addons[].id   | string  | ✓        | Unique id. |
| addons[].name | string  | ✓        | Display name. |
| addons[].maxQuantity | number |  | Optional. |
| addons[].prices | object | ✓       | Keys `"12"`,`"24"`,`"36"`,`"48"`. Values: price string. |

---

## 2. Space buyout (per-space pricing)

**When to use:** One document per venue that contains pricing for each space (e.g. `spacePricings` keyed by `spaceId`). Frontend sends this when user saves "Space Buyout" tab.

```json
{
  "spaceOnly": false,
  "spacePricings": {
    "69afc2df3235f0510b471102": {
      "rackRates": {
        "12": "30000",
        "24": "55000",
        "36": "75000",
        "48": "95000"
      },
      "inclusions": [
        {
          "id": "inc-space1-001",
          "name": "WiFi"
        },
        {
          "id": "inc-space1-002",
          "name": "Projector",
          "maxQuantity": 1
        }
      ],
      "addons": [
        {
          "id": "addon-space1-001",
          "name": "Catering package",
          "maxQuantity": 1,
          "prices": {
            "12": "20000",
            "24": "35000",
            "36": "45000",
            "48": "55000"
          }
        }
      ]
    },
    "69afc2df3235f0510b471103": {
      "rackRates": {
        "12": "",
        "24": "40000",
        "36": "",
        "48": "80000"
      },
      "inclusions": [],
      "addons": []
    }
  }
}
```

**Field summary (space buyout):**

| Field            | Type    | Required | Description |
|------------------|---------|----------|-------------|
| spaceOnly        | boolean | ✓        | If true, hide venue buyout; only per-space pricing is shown. |
| spacePricings    | object  | ✓        | Map of `spaceId` (MongoDB ObjectId or string) → space pricing object. |
| spacePricings.{spaceId}.rackRates | object | ✓ | Same as venue: `"12"`,`"24"`,`"36"`,`"48"` → price string. |
| spacePricings.{spaceId}.inclusions | array  | ✓ | Same shape as venue inclusions. |
| spacePricings.{spaceId}.addons    | array  | ✓ | Same shape as venue addons (with `prices` per duration). |

**Note:** `selectedSpaceId` is UI-only (which space tab is selected). Backend does not need to store it; omit in API payload if you prefer.

---

## 3. Minimal / empty examples

**Venue buyout (minimal):**
```json
{
  "buyoutOnly": false,
  "rackRates": { "12": "", "24": "", "36": "", "48": "" },
  "inclusions": [],
  "addons": []
}
```

**Space buyout (minimal):**
```json
{
  "spaceOnly": false,
  "spacePricings": {}
}
```

**Single space pricing (one entry inside `spacePricings`):**
```json
{
  "rackRates": { "12": "", "24": "", "36": "", "48": "" },
  "inclusions": [],
  "addons": []
}
```

---

## Suggested backend storage

- **Option A – One doc per venue:**  
  `VenuePricing` (or embedded in venue): `{ venueId, buyoutOnly, rackRates, inclusions, addons, spaceOnly, spacePricings }`.

- **Option B – Split:**  
  - `VenuePricing`: `{ venueId, buyoutOnly, rackRates, inclusions, addons }`.  
  - `SpacePricing`: `{ venueId, spaceId, rackRates, inclusions, addons }` (one doc per space).

Use the examples above as the body of your `PUT`/`PATCH` requests and as the shape of stored documents.
