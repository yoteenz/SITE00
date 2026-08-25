# SITE 00 Canon Promotion

**Status:** Implemented P0.D (2026-08-25)

---

## Core rule

```
CREATIVE EXPLORATION → REVIEW → APPROVAL → IDENTITY CANON
```

Auto-canonization is **disabled**. `canAutoCanonize()` always returns `false`.

---

## Promotion path

1. Identity territories created as `CREATIVE_EXPLORATION` (status: PROPOSED)
2. Founder records judgment (SELECT / REVISE / REJECT / HYBRIDIZE)
3. Founder explicitly calls `canon_promote_identity` with approved fields
4. System writes:
   - `site00_canon_records` (canon_type: IDENTITY)
   - `site00_canon_versions` (version 1+)
   - `site00_identity_canon_promotions` (audit trail)
5. Territory status updated to PROMOTED or PROMOTED_PARTIAL

---

## Partial approval

Not all fields must be approved at once:

```
MASTER BRAND NAME = approved
DISTRICT NAME = approved
PALETTE = unresolved
TYPOGRAPHY = unresolved
```

Phase status becomes `PARTIALLY_APPROVED` until full approval.

---

## Hierarchical canon scopes

| Scope | Example |
|-------|---------|
| MASTER | Astral World global identity |
| DISTRICT | Astréa district expression |
| DESTINATION | Tarot Suite styling |
| EXPERIENCE | Reader badge behavior |

Each promotion records `hierarchy_scope` and optional `scope_node_id`.

---

## Lineage metadata

Every promotion preserves:

- `sourceTerritoryId` / `sourceTerritoryKey`
- `approver`
- `promotedFrom: CREATIVE_EXPLORATION`
- `version` / `superseded_by` for immutability

Rejected territories remain in database with status REJECTED — not deleted.

---

## Host firewall

Promotion blocked if approved fields contain SITE 00 host identity traits (Martian Mono, SITE 00 red, etc.).

---

## Key file

`api/_lib/site00Projects/identity/canonPromotionService.ts`
