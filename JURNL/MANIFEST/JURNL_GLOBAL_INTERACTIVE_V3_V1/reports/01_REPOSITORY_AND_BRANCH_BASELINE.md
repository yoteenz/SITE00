# 01 · Repository and branch baseline

Sprint `P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.V3-AUTHORITY-AND-ALL-FAMILY-COMPONENT-CONVERGENCE.OPUS1`. Merge, deployment,
production database access, paid spend and image generation: none.

| Ref | Head (2026-11-04) | State | Role |
|---|---|---|---|
| #1705 `claude/jurnl-financial-os-unification-um0u93` | `c56691ec` | draft | financial OS (underneath #1713) |
| #1706 `claude/jurnl-financial-os-stabilization-um0u93` | `274d7956` | draft | stabilization (underneath #1713) |
| #1707 `claude/jurnl-f05-money-motion-pilot-um0u93` | `0e930112` | draft | F05 / DOT 01 + OPUS1 (cherry-picked into the base below) |
| #1708 `cursor/jurnl-founder-entitlements-isolated-v1-4e5a` | `470fc09a` | draft | FOUNDER_FULL grants — **not in this base**; read for compatibility (report 10) |
| #1709 `cursor/jurnl-f05-money-full-bleed-layout-4e5a` | `ad7ac177` | open | short-phone fixes — carried by #1713 |
| #1713 `cursor/jurnl-financial-safety-integration-4e5a` | `f7e2739c` | draft | **financial safety base** (unchanged since last sprint) |
| `integration/jurnl-production-workspace` | `7752eae2` | — | #1710 / #1711 / #1712 (copy, snap rail, type −2 px): not merged here |
| `claude/jurnl-f05-dot01-authority-scenes-um0u93` | `4d222f7c` | pushed | OPUS2 (03 / 04 / 05 authority compositions) |
| **this sprint** `claude/jurnl-global-interactive-v3-um0u93` | see 25 | new | isolated branch from `4d222f7c` |

**Base choice.** `4d222f7c` = #1713 (overpay guard, safe archive, canonical settlement, #1709 short-phone fixes) + OPUS1
+ OPUS2 (the approved 03 / 04 / 05 compositions the sprint says must not regress). No newer Composer / Opus work on the
JURNL interactive layer exists (latest open PRs listed above; the only new artefact is the V3 calibration release).
No existing branch was modified, merged or force-pushed.

**V3 authority (verified).** Release `jurnl-interactive-color-calibration-v3-2026-11-04`: master PNG 2304 × 1296,
SHA-256 `19435509d947dc480d2f8e1a19c6d8007e8a140a6bef5e52987ca7f35a2ee3c4`; evidence ZIP
`82dd3fed…`. Its own notes mark panels 02 and 04 as demonstration art (invented founder-lifetime copy; an unlock overlay
FOUNDER_FULL should hide) — treated accordingly (reports 09, 10).
