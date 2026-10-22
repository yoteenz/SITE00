# 09 · Tablet, desktop and ultra-wide recovery (Overview)

| Tier | Viewport tested | Composition (OPUS2) | Result |
| --- | --- | --- | --- |
| Tablet portrait | 834 × 1112 | 80 px rail; focus full width; signals 4-up; needs you \| recent movement; registry | ✓ matches `authority-opus2-overview-834x1112` |
| Tablet landscape | 1194 × 834 | Rail; focus \| needs you; signals; registry with LIFECYCLE / NEXT ACTION / LAST ACTIVITY; short-height title 44 | ✓ |
| Desktop | 1440 × 900 | Sidebar 224; focus 7/5 with needs you; signals strip; registry \| movement | ✓ matches `authority-opus2-overview-1440x900` |
| Wide | 1920 × 1080 | Sidebar 248; focus \| needs you \| signals (2 × 2); registry \| movement; title 60 | ✓ |
| Ultra-wide | 2560 × 1440 | Content bounded at the page max (1760); quiet gutters | ✓ |

All are container-driven: the same markup recomposes from the stage width, so nothing is stretched from mobile.

The inspector-dock rule (stage ≥ 680) is present in the ported CSS. The Overview has no inspector, so docking is untested here.
