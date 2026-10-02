# BOTTOM_NAV_ICON_FAMILY V1

Founder-review masters for the production bottom nav. Not wired. Not canonical until approval.

Order: HUB, INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY, ACTIVITY.

The pixels are keyed from the seven high-quality renders in `authority/hq/`. The low-res sheet (`authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg`) still names the roles. It is not redrawn on top of those renders.

| File | Role | Source |
| --- | --- | --- |
| `outputs/01_HUB.png` | Tighter open diamond stack | `authority/hq/01_HUB.jpg` |
| `outputs/02_INBOX.png` | Rounded envelope, inner flap | `authority/hq/02_INBOX.jpg` |
| `outputs/03_DESIGN.png` | More open diamond stack | `authority/hq/03_DESIGN.jpg` |
| `outputs/04_EXPERIENCE.png` | Circle and rounded play triangle | `authority/hq/04_EXPERIENCE.jpg` |
| `outputs/05_EXPRESSION.png` | Isometric cube, no front notch | `authority/hq/05_EXPRESSION.jpg` |
| `outputs/06_LIBRARY.png` | Three volumes, right one tilted | `authority/hq/06_LIBRARY.jpg` |
| `outputs/07_ACTIVITY.png` | Pulse with a ring joined to the stroke | `authority/hq/07_ACTIVITY.jpg` |

White paper is knocked out. Ink is charcoal `#141414` on a transparent 512 canvas. The longest ink side is 320px. Red is not in the masters.

Red dots on `proof/master-sheet.png` show where the host may mark inbox and activity. They are not in the PNG masters.

The registry is `shared/site00-studio-world-ui/icons/families/`. Status is `FOUNDER_REVIEW`.
Rebuild pixels with `node scripts/site00-bottom-nav-icon-family-v1.mjs`.
