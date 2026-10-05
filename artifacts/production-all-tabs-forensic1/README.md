# P0.PRODUCTION.ALL-TABS.AUTHORITY-FORENSIC1 — truth table

## How this was checked
- **Rendered:** the tunnel branch, rendered locally at `c58157b3`. Its Production files are identical to `be15f01a`; the delta is only the origin/main merge, which has no Production changes.
- **Viewports:** live Chromium at 390×844, 1024×768 and 1440×810.
- **Compared against:** STUDIOOS_PRODUCTION_PARENT_3VIEW_AUTHORITY_LITE_v1 (00–11). Expression sub-pages use EXPRESSION_LITE_v2; Character Fabrication uses its 16 mobile screens.
- **Not reached:** site00.fsbw-dev.com is blocked by this container's network policy.

**Founder decision:** ACTIVITY stays OPUS1 (`7dcf37de`). The ACTIVITY LOG (`ffc7f7c0`, `c8248353`, `c0cc47d7`) is documented here only and is not a target.

| Tab | Tunnel implementation | Authority | Match | Failure class | Newer elsewhere | Mobile | Tablet | Desktop |
|---|---|---|---|---|---|---|---|---|
| HUB | HubBody `f47629d7` + `c508fc3d` | 00_HUB | Partial | PARTIAL_CONVERGENCE + SHELL_DRIFT | No | Layout match, fits | Overflows 16px | Overflows 35px |
| INBOX | InboxBody OPUS2 `103ce900` (before this commit) | 01_INBOX | No, now converged by this commit | NEW_CODE_OLD_AUTHORITY | `ffc7f7c0` (Inbox part now ported) | Fits | Fits | Fits |
| DESIGN ×6 | DesignChamber + OPUS3 pack `94831d12` | 02–07 | Mostly | PARTIAL_CONVERGENCE (content clipped inside chamber and panels) | No (the `-87ed` design-workspace is an older, different line) | Match | Match | Match; VIEWPORT iframe unverifiable here (Supabase blocked) |
| EXPERIENCE | ExperienceBody `668f46a8` | 08 | Partial | RESPONSIVE_VARIANT_MISSING (mobile) + AUTHORITY_REFERENCE_MISMATCH (world image) | No | Overflows 188px | Match | Match |
| EXPRESSION root | ExpressionBody `1ca88e20` (40 sub-pages `be15f01a`) | 09 / EXPRESSION_LITE_v2 | Root partial, sub-pages yes | PARTIAL_CONVERGENCE | No | Overflows 811px | Overflows 186px | Overflows 122px |
| Character Fabrication | CharacterFabrication (`1ca88e20` lineage); floor 01 entry present | 16 mobile screens | Mobile partial | RESPONSIVE_VARIANT_MISSING (tablet/desktop) | No (`de741cdd`, `d1b6120f` and `b7874853` on `claude/narrative-momentum-widget-8zogkg` are older) | Partial | Phone column, no authority | Phone column, no authority |
| LIBRARY | LibraryBody `1ca88e20` | 10 | Partial | PARTIAL_CONVERGENCE | No | Overflows 838px; grid 2 columns, should be 4 | Overflows 383px | Overflows 298px; checkboxes instead of category icons |
| ACTIVITY | OPUS1 ActivityBody `7dcf37de` / `319ae2ff` | OPUS1 (founder target) | Right implementation | Scrolls (no-scroll gap) | — | Scrolls 903px | Scrolls 439px | Scrolls 435px |

## Shell drift (all tabs, tablet/desktop)
- `77302d92` removed the left host title along with the duplicate CURRENT WORK panel. The authority shows "HUB · SITE 00 / STUDIO WORLD".
- The bottom nav puts the icon beside the label; the authority puts the icon above the label.

## Evidence
`*-authority-vs-tunnel.jpg` (authority top, tunnel bottom: desktop · tablet · mobile) and `tunnel-<viewport>-report.json`.
