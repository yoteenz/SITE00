# 05 · Asset mounting audit

| Asset | Used by authority | In repo | Referenced by React before | After |
| --- | --- | --- | --- | --- |
| DF monoline icon set (`src/site00/foundation-client/icons/glyphs.ts`, `meta.ts` aliases) | Nav, rail, bottom bar, icon buttons, search, banners, menu | Yes | **No.** Text labels such as “Menu” and “Search” replaced icons | `WsIcon` renders the same glyph source with the authority aliases |
| `DfCrownObject` (`foundation-client/objects.tsx`, variant OVERVIEW) | Overview page header architecture object | Yes | No | Mounted in the page header (`.ws-arch`, aria-hidden) |
| SITE 00 Display / Saira Semi Condensed font files | Everywhere | Yes | Mounted, weights not requested | Mounted and used |
| Plates (initials), status marks, lifecycle segments | Registry, focus, needs you | CSS-only | No | `WsPlate`, `WsMark`, `WsSegments` |
| Environment photographs (correspondence-studio environment) | OPUS3 Referrals headers, Card Studio | Yes | No | **Not mounted yet.** Referrals propagation waits for founder approval |
| `DF_ARCHITECTURE_RENDERS` | Optional raster renders | `null` in repo | — | Not used (no asset exists; nothing substituted) |

No artwork was generated or substituted.
