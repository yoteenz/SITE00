# SITE 00 Hierarchical Canon

**Status:** Implemented P0.E (2026-08-25)

---

## Scope model

```
MASTER (Astral World global)
  → DISTRICT (Astréa)
    → DESTINATION (Tarot Suite, Astral Mall, Coffee Shop)
      → EXPERIENCE (readers/services — future)
```

---

## Granular canon fields

**Table:** `site00_canon_field_records`

Each promoted field records:
- `canon_type`: IDENTITY | WORLD_STRUCTURE
- `field_key`, `hierarchy_scope`, `scope_node_id`
- `field_value`
- `source_territory_id`, `source_judgment_id`
- `canon_version`, `status` (ACTIVE | SUPERSEDED)
- `approver`, `lineage`

Partial approval example:

| Scope | Field | Status |
|-------|-------|--------|
| MASTER | masterBrandPersonality | CANON |
| MASTER | typographyDirection | UNRESOLVED |
| DISTRICT | astreaDistrictExpression | CANON |

---

## Structural vs visual canon

| Type | Meaning |
|------|---------|
| WORLD_STRUCTURE | Hierarchy, roles, destination names — founder confirmed |
| IDENTITY | Brand personality, tone, direction fields |
| WORLD_FORMATION | Visual/runtime world expression — NOT IMPLEMENTED |

Structural world canon promotion does **not** trigger world formation.

---

## Promotion path

```
identity_field_judgment (APPROVE)
  → identity_promotion_preview
  → canon_promote_fields (explicit)
  → site00_canon_field_records + site00_canon_records + site00_canon_versions
```

Unsafe whole-territory promotion (`promoteTerritory`) is **blocked**.

---

## Versioning

First promotion creates IDENTITY_CANON_VERSION = 1.  
Later changes supersede via new version records — historical approvals preserved.

---

## Key file

`api/_lib/site00Projects/identity/canonPromotionService.ts`
