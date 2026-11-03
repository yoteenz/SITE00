# 01 — Project ownership forensic audit

**Sprint:** P0.SITE00.STUDIOWORLD.MEDIA-PROJECT-OWNERSHIP-AND-EXCHANGE-INDEPENDENCE.V1

## Root cause (verified)

THE EXCHANGE was **not** owned by Studio World in `FOUNDER_PROJECTS` or canon trees. The founder-visible error was **registry and discovery fragmentation**:

| Layer | THE EXCHANGE before repair |
| --- | --- |
| `api/_lib/site00Projects/projectRegistry.ts` | Present (`SERIALIZED_FICTION`) |
| `managedProjectRegistry.ts` | **Missing** → not in Production switcher |
| `projectIndexOrder.ts` | **Missing** → no portfolio numbering |
| `orgRegistry.ts` | **Missing org UUID** → `resolveSite00ProjectIndexEntry` returned **null** |
| `evolveService` ORG_CLASS | **Missing** → misclassified as generic managed brand |
| Production Hub project list | Fell back to design-enabled set only → **invisible** next to NDXBOOK |

Studio World naming in package paths (`site00-studio-world-production`) is **workspace machinery**, not creative parentage. No code path set `parentProjectId: studio-world` on THE EXCHANGE.

## Error class

- **Presentation / discovery gap** (primary)
- **Index / org registry gap** (blocking founder Projects index)
- **Not** duplicate managed-project row
- **Not** destructive data migration required
