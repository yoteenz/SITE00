# SITE 00 World Hierarchy

**Status:** Data model implemented P0.D (2026-08-25)  
**WORLD formation runtime:** NOT IMPLEMENTED

---

## Semantic model

| Level | Definition | Example |
|-------|------------|---------|
| WORLD | Top-level immersive product universe | Astral World |
| DISTRICT | Major themed subdivision within a WORLD | Astréa |
| DESTINATION | Visitable place/experience within a DISTRICT | Tarot Suite, Astral Mall, Coffee Shop |
| EXPERIENCE | Person, service, activity within a destination | Reader session (future) |

---

## Target hierarchy

```
ASTRAL WORLD (MASTER PRODUCT / UNIVERSE)
  → ASTRÉA (FLAGSHIP DISTRICT)
    → Tarot Suite
    → Astral Mall
    → Coffee Shop
  → [Future District 02]
  → [Future District 03]
```

Future districts belong to the Astral World **project** — not separate projects.

---

## Data model

**Table:** `site00_world_hierarchy_nodes`

| Field | Purpose |
|-------|---------|
| `node_type` | WORLD, DISTRICT, DESTINATION, EXPERIENCE |
| `slug` | Stable project-scoped identifier |
| `display_name` | Human-readable name |
| `parent_id` | Self-referential tree |
| `truth_layer` | CLIENT_FOUNDER_TRUTH, APPROVED_CANON, etc. |
| `is_canonical` | false until explicitly promoted |
| `payload` | Role, founder truth, naming notes |

Unique constraint: `(project_id, slug)`

No hardcoded maximum on destinations or districts.

---

## Astral World hierarchy (founder-directed)

| Node | Role | Truth layer |
|------|------|-------------|
| Astral World | MASTER_PRODUCT_UNIVERSE | CLIENT_FOUNDER_TRUTH |
| Astréa | FLAGSHIP_DISTRICT | CLIENT_FOUNDER_TRUTH |
| Tarot Suite | Client concept destination | CLIENT_FOUNDER_TRUTH |
| Astral Mall | Client concept destination | CLIENT_FOUNDER_TRUTH |
| Coffee Shop | Client concept destination | CLIENT_FOUNDER_TRUTH |

Visual execution of Astréa and destinations is **not** formed canon.

---

## Expansion model

Founder truth: "Future districts may be added beneath Astral World without creating new projects."

New districts are inserted as sibling DISTRICT nodes under the WORLD node.

---

## API

`GET /api/site00/projects?action=world_hierarchy&slug=<slug>`

---

## Key files

| Path | Role |
|------|------|
| `api/_lib/site00Projects/identity/worldHierarchyService.ts` | Seed + list hierarchy |
| `shared/site00-identity/astralWorldIdentity.ts` | Astral World hierarchy seed |
| `shared/site00-identity/types.ts` | `WorldHierarchyNodeType`, `CanonHierarchyScope` |
