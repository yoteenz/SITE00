# INBOX — Production Authority Tree

## 1. ROOT AUTHORITY

- **Route:** `/production/queue`
- **Component:** `ProductionQueuePage` → `InboxBody`
- **Role:** Attention / response — not Gmail

## 2. CHILD ROUTES

None (single global inbox route).

## 3. GRANDCHILD ROUTES

None.

## 4. NON-ROUTE INTERACTIONS

- Tabs: **needs** | **watching** | **resolved** (`inbox-tabs`)
- **APPROVE** / **REQUEST REVISION** on founder attention card
- Queue row navigation (`queue-request` test ids)

## 5. TEMPORARY SURFACES

- Post-decision inline footnote (`inbox-decision-note`) — not a toast system

## 6. STATES

- Empty needs copy
- Watching list empty
- Resolved activity feed
- Request status chips (QUEUED / IN_PROGRESS / AWAITING_APPROVAL)

## 7. RESPONSIVE VARIANTS

Authority frame consistent; request plates scale within body. Tablet/desktop use pxh nav.

## 8. PARENT INHERITANCE REQUIREMENTS

Inherit inbox reference plate atmosphere, status typography, card glass, red accent buttons — must not become generic CRM table.

## 9. KNOWN STALE / LEGACY SURFACES

- Request thumbnails use `PW_IMG.request.*` — monitored for genericization

## 10. MISSING / UNMOUNTED SURFACES

- Remote queue service (device-held requests) — functional gap, not a missing route

## 11. AUTHORITY SOURCE

- Founder inbox authority (registry `inbox`)
- `productionRequestStore` + `requestCatalog` copy

## 12. CURRENT IMPLEMENTATION STATUS

| Node | Status |
|------|--------|
| inbox-root + tabs + lists | REFERENCE_LOCKED |
| inbox-decision-note | PARTIAL |

**Tree complete:** yes.
