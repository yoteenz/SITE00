# 06 · Desktop standard authority (1280–1919)

**Boards:** D-01 to D-15, C-01, C-04 to C-07. **Verified at:** 1280 × 800, 1366 × 768, 1440 × 900, 1600 × 900.

## 1. Four zones

| Zone | Authority |
| --- | --- |
| **Navigation** | Sidebar 224 (248 from 1600): brand + environment tag; NEW FOUNDATION (red, 40 h); six destinations; tool links (Readiness Desk, Correspondence Studio); founder identity with the account menu (OL-18 opens upward). Primary labels 12 px / 0.12 em, never wrapped or truncated. |
| **Stage** | `container: stage`; gutter 32; content max 1560, centred. Pages pick their composition from the stage width: cl 920–1439, cx ≥ 1440. |
| **Contextual inspector** | Docked when something is selected: clamp(344, 24vw, 420). The stage keeps ≥ 680 (1280: 712; 1440: 870; 1600: 968). Head (kicker + close) / scrolling body / footer actions. |
| **Global utilities** | Top bar 56: breadcrumb (index · destination · record), search clamp(200, 26vw, 420) with ⌘K, notifications popover (OL-05). The page title is not repeated in the top bar. |

## 2. Header

- **Height:** about 112 px. The title is 52 px; it drops to 44 when the viewport height is ≤ 860 (1366 × 768, 1280 × 800).
- **Actions:** sit on the title baseline.
- **Threshold objects:** appear on Overview and System only (FD-W14), at most 104 px tall, right-aligned inside the header, `aria-hidden`.

## 3. Compositions (stage width decides)

| Page | 1280 (stage 1056) | 1440 (stage 1216) | With inspector |
| --- | --- | --- | --- |
| Overview | Focus \| needs · signals · ACTIVE WORK full width · milestone \| movement | Focus \| needs · signals · work \| movement · milestone | — |
| Foundations | Five columns | Five columns | Three columns (stage 712–968) |
| Client record | Section \| 360 | Section \| 360 | — |
| Reviews | Queue \| context + decision footer | **Queue \| context \| decision** | — |
| Operations | Runbooks \| main, context row beneath | Same | Task inspector docked |
| Correspondence | Index \| thread + context footer | **Index \| thread \| context** | Email preview docked |
| System | Console (5 columns) | Console | Console compacts; module detail docked |

## 4. Density

Each page carries one density class:

| Class | Pages | Row | Pad | Gap |
| --- | --- | --- | --- | --- |
| RELAXED | Overview, Client record, Create | 64 | 22 | 24 |
| STANDARD | Foundations, Reviews, Operations, Correspondence | 56 | 18 | 18 |
| COMPACT | System, Test lab | 44 | 14 | 12 |

On phones every class keeps 44 px touch targets (compact rows become 48).

## 5. Desktop interaction

| Capability | Authority |
| --- | --- |
| Hover | Rows lift to white; hover never reveals an action that keyboard and touch cannot reach (row actions are in ⋯ and in the inspector footer). |
| Keyboard shortcuts | ⌘K palette · `/` search · J / K next / previous row or queue item · ↵ open · ESC close the overlay or inspector · `G` then `1`–`6` go to a destination · `N` new foundation (from the palette) · `?` shortcut list (account menu) |
| Command palette | OL-04: 680 wide at 14vh; groups CLIENTS / REVIEWS / COMMANDS; arrows + ↵; only existing navigation and the existing create flow |
| Sorting | One active sort (SORT control + `aria-sort` on the column header). No multi-column sort. |
| Selection | One row at a time (inspector). **No multi-select:** no bulk API exists and none is invented. |
| Unavailable actions | Shown disabled with the reason and gap id (RESEND · N/A · G-05; REVOKE · N/A · G-06), per FD-W5 (open) |

## 6. Acceptance

All audited states at 1280, 1366, 1440 and 1600 pass the hard checks. Stretch-gap warnings at standard desktop are listed in `verification/layout-audit-summary.md`.
