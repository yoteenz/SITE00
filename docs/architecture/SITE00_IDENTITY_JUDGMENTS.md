# SITE 00 Identity Judgments

**Status:** Implemented P0.E (2026-08-25)  
**Predecessor:** P0.D Identity Phase Entry

---

## Judgment layers

| Layer | Values | Maps to sprint terminology |
|-------|--------|---------------------------|
| Territory | SELECT, REVISE, REJECT, UNREVIEWED, HYBRIDIZE | LOVE, PROMISING, REJECT, UNREVIEWED, Option D |
| Field | APPROVE, REVISE, REJECT, UNREVIEWED | Field-level partial approval |

Territory judgment ≠ wholesale canon adoption. Fields promoted independently.

---

## Field-level judgments

**Table:** `site00_identity_field_judgments`

Each record ties:
- `project_id` + `territory_id` + `field_key` + `hierarchy_scope`
- `judgment` (APPROVE / REVISE / REJECT / UNREVIEWED)
- `approver` (founder email — automated approvers blocked)
- `field_value` (snapshot from territory payload)

---

## Revision path

When judgment = REVISE, a row is created in `site00_identity_revision_targets` preserving:
- Original value
- Founder critique
- Source territory lineage

Original proposal is **not** overwritten.

---

## Rejection preservation

REJECTED territories and fields:
- Remain queryable in decision history
- Excluded from canon promotion
- Excluded from WORLD formation input
- Never deleted

---

## No fake judgment rule

Blocked approvers: `system`, `automated`, `cursor-cloud`, `agent`, `bot`

Promotion requires real founder `approver` email matching APPROVE judgment records.

Automated promotion paths cannot impersonate founder judgment.

---

## API actions

| Action | Purpose |
|--------|---------|
| `identity_review_state` | Load verified territories + judgment state |
| `identity_judgment` | Territory-level judgment |
| `identity_field_judgment` | Field-level judgment |
| `identity_promotion_preview` | Preview eligible canon fields |

---

## Key file

`api/_lib/site00Projects/identity/identityJudgmentService.ts`
