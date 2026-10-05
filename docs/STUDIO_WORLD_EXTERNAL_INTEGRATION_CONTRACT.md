# Studio World — External Integration Contract (SITE 00)

**Version:** 1.0  
**Consumer:** SITE 00 (`externalSystem: SITE_00`)  
**Provider:** Studio World (external production system)  
**Status:** ACTIVE — implemented by `LiveStudioWorldAdapter`

---

## Authentication

All Studio World requests from SITE 00:

```
Authorization: Bearer {STUDIO_WORLD_API_KEY}
Content-Type: application/json
```

Provisioning requests additionally require:

```
X-Idempotency-Key: {externalEngagementId}
```

---

## Base URL

```
{STUDIO_WORLD_API_BASE}
```

Example: `https://studio-world.example.com`

---

## Endpoints

### 1. Provision campaign

`POST /external/v1/campaigns/provision`

**Request body** (matches `StudioWorldProvisionRequest`):

```json
{
  "externalSystem": "SITE_00",
  "externalProjectId": "uuid-or-null",
  "externalClientId": "uuid-or-email",
  "externalEngagementId": "uuid",
  "brandId": "uuid-or-null",
  "brandSetupRequired": false,
  "engagementType": "EVOLVE_MARKETING",
  "serviceType": "campaign",
  "campaignObjective": "string",
  "deliverables": ["FEED ASSETS"],
  "platforms": ["INSTAGRAM"],
  "aspectRatios": ["9:16"],
  "quantity": "string",
  "deadline": "ISO8601",
  "approvedScope": {},
  "clientVisibleProjectId": "MKT-1234"
}
```

**Response 200:**

```json
{
  "campaignId": "sw-campaign-uuid",
  "status": "PROVISIONED",
  "clientPhase": "02"
}
```

**Response 409** (idempotent duplicate):

```json
{
  "campaignId": "sw-campaign-uuid",
  "status": "ALREADY_EXISTS",
  "clientPhase": "02"
}
```

---

### 2. Client-safe status

`GET /external/v1/campaigns/{campaignId}/status`

**Response 200:**

```json
{
  "campaignId": "sw-campaign-uuid",
  "clientPhase": "05",
  "clientActionRequired": true,
  "clientActionLabel": "REVIEW CAMPAIGN",
  "milestoneLabel": "YOUR REVIEW",
  "nextExpectedAction": "Approve direction or request revision.",
  "syncStatus": "SYNCED"
}
```

Internal generation steps, model names, prompts, and QC are **never** returned.

---

### 3. Client reviews

`GET /external/v1/campaigns/{campaignId}/reviews`

**Response 200:**

```json
{
  "reviews": [
    {
      "id": "rev-uuid",
      "title": "CAMPAIGN DIRECTION A",
      "reviewType": "direction",
      "previewUrl": "https://…",
      "thumbnailUrl": "https://…",
      "status": "OPEN",
      "allowsDirectionSelect": true,
      "directions": [{ "id": "A", "label": "DIRECTION A", "previewUrl": "https://…" }]
    }
  ]
}
```

---

### 4. Client deliverables

`GET /external/v1/campaigns/{campaignId}/deliverables`

Only `CLIENT_VISIBLE` and `APPROVED` items are returned.

**Response 200:**

```json
{
  "deliverables": [
    {
      "id": "del-uuid",
      "title": "CAMPAIGN MASTER — FEED",
      "format": "MP4",
      "aspectRatio": "9:16",
      "version": "V1",
      "previewUrl": "https://…",
      "downloadUrl": "https://…",
      "visibility": "APPROVED"
    }
  ]
}
```

---

### 5. Client review action

`POST /external/v1/reviews/{reviewId}/actions`

**Request body:**

```json
{
  "clientUserId": "uuid",
  "action": "APPROVE",
  "note": "optional",
  "directionId": "A",
  "timestamp": "ISO8601"
}
```

Actions: `APPROVE` | `REQUEST_REVISION` | `SELECT_DIRECTION`

**Response 200:** `{ "ok": true }`

---

## Webhooks (Studio World → SITE 00)

`POST {SITE_00_API_BASE}/api/site00/studio-world/webhook`

**Headers:**

```
X-Studio-World-Signature: sha256={hmac}
X-Studio-World-Event: status.updated
```

**Payload:**

```json
{
  "eventType": "status.updated",
  "campaignId": "sw-campaign-uuid",
  "externalEngagementId": "uuid",
  "timestamp": "ISO8601",
  "payload": {}
}
```

**Event types:**

| Event | SITE 00 action |
|-------|----------------|
| `status.updated` | Sync engagement status |
| `client_action.required` | Set action-required flags |
| `review.ready` | Set REVIEW_READY |
| `deliverable.approved` | Vault handoff |
| `campaign.complete` | Mark COMPLETE |

Signature verified with `STUDIO_WORLD_WEBHOOK_SECRET`.

---

## Error mapping (SITE 00 adapter)

| Studio World | SITE 00 code |
|--------------|--------------|
| Timeout / 504 | `STUDIO_CONNECTION_DELAYED` |
| 409 ALREADY_EXISTS | `PROJECT_ALREADY_INITIALIZED` |
| 401 / 403 | `INTERNAL_CONNECTION_ERROR` |
| 422 / 400 | `PRODUCTION_SETUP_REQUIRES_ATTENTION` |

---

## Environment (SITE 00 server)

| Variable | Required (live) | Purpose |
|----------|-------------------|---------|
| `STUDIO_WORLD_ADAPTER` | No | `live` or `mock` (default: `live` in production, `mock` in dev) |
| `STUDIO_WORLD_API_BASE` | Yes (live) | Studio World base URL |
| `STUDIO_WORLD_API_KEY` | Yes (live) | Bearer token |
| `STUDIO_WORLD_WEBHOOK_SECRET` | Yes (webhooks) | HMAC verification |

---

## Implementation

| Component | Path |
|-----------|------|
| Contract constants | `api/_lib/studioWorld/contract.ts` |
| HTTP client | `api/_lib/studioWorld/httpClient.ts` |
| Live adapter | `api/_lib/studioWorld/liveAdapter.ts` |
| Mock adapter | `api/_lib/studioWorld/mockAdapter.ts` |
| Factory | `api/_lib/studioWorld/client.ts` |
| Webhook | `api/site00/studio-world-webhook.ts` |
