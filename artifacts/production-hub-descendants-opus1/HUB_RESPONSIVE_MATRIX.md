# HUB responsive matrix

| SURFACE | MOBILE 390×844 / 430×932 | TABLET 834×1194 / 1024×768 | DESKTOP 1280×720 / 1440×900 / 1920×1080 |
|---|---|---|---|
| HUB root | REFERENCE_LOCKED: 9:16 artboard, one column, ops / activity paired | REFERENCE_LOCKED: 4:3 artboard, two columns | REFERENCE_LOCKED: 16:9 artboard, two columns, fits above the nav |
| Host top (project selector, ITEMS NEED YOU, menu) | phone strip, converged height | host top (canonical override anatomy) | host top (canonical override anatomy) |
| Menu | 864-space panel under the strip | anchored panel | anchored panel |
| Hover | n/a (touch) | red hairline tint on cards / tiles, grey wash on rows | same |
| Focus (keyboard) | red focus ring | red focus ring | red focus ring |
| Pressed | grey press wash | grey press wash | grey press wash |
| Loading / empty / no-production | captured | captured | captured |
| 22 action targets | 22/22 PASS | 22/22 PASS | 22/22 PASS |
| Hub machine (child) | legacy phone composition | legacy, centred | legacy, centred (LEGACY_LOCKED) |

Captures: `mobile/`, `tablet/` and `desktop/` (HUB root at 7 sizes), `root/`, `interactions/<family>/`, `temporary/`, `children/`. Mobile was captured on mobile viewports with touch emulation; no family was certified from another.
