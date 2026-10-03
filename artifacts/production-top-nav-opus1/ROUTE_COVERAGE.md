# Route coverage

| Tab | Root | Descendant verified | Header | Status |
|---|---|---|---|---|
| HUB | `/production` | — (the machine view `?view=machine` is LEGACY_LOCKED with its own header) | shared | PASS |
| INBOX | `/production/queue` | `?view=approvals` | shared | PASS |
| DESIGN | `/production/ndxbook/design` (`?mode=brand`) | `?mode=surfaces`; `/design/references` etc. mount the shared header through the Design overlay | shared | PASS (see residual on Design section pages) |
| EXPERIENCE | `/production/ndxbook/experience` | `/experience/world` (PwFrame) | shared | PASS |
| EXPRESSION | `/production/ndxbook/expression` | `/expression/casting` (PwFrame) | shared | PASS |
| LIBRARY | `/production/libraries` | none exists (Library has in-page state only, no child route) | shared | PASS |
| ACTIVITY | `/production/activity` | `?view=blockers` | shared | PASS |

Each is checked in 7 widths (`RESPONSIVE_MATRIX.md`) and mounted in 3 families by the unit tests (12 routes × 3 families). Child routes inherit the header because all three frames mount the same `ProductionWorkspaceHeader`, and there is no route-specific header CSS left (enforced by a test).

These keep their own headers on purpose:
- Character Fabrication (`/expression/character-fabrication`): station state, not Production attention
- the legacy hub machine (`/production?view=machine`)

See `HEADER_COMPONENT_AUDIT.md`.
