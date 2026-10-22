# 03 · Approved board → React trace (Overview + shell)

| Authority region (OPUS2 `ws-kit.js` / `ws-pages.js overview()`) | JSX / component | CSS (ported `ifw-authority.css`) | Asset / font | Interaction | Data source |
| --- | --- | --- | --- | --- | --- |
| `app()` frame | `FounderWorkspaceShell` → `.ws > .ws-app` | `.ws-app` grid (top/stage/bnav → nav/top/stage) | — | — | — |
| `sidebar()` | `.ws-side` (brand, NEW FOUNDATION, 01–07 list, READINESS DESK, account foot) | `.ws-side*` (≥ 1280) | DF icons (`foundation-client/icons/glyphs.ts`) | Links; create → OL-01; account → OL-18 | `config/navigation.ts` |
| `rail()` | `.ws-rail` (00 plate, NEW, icon items) | `.ws-rail*` (768–1279) | DF icons | Links; create → OL-01 | idem |
| `topbar()` phone | `.ws-top__m` brand + search / alerts / menu icon buttons | `.ws-top__m`, `.ws-iconbtn` | DF icons | OL-04 / OL-05 / OL-03 | — |
| `topbar()` tablet/desktop | `.ws-top__d` breadcrumb `0n — DEST / …`, search field with ⌘K, bell | `.ws-crumb`, `.ws-search--top` | — | OL-04 (and ⌘K), OL-05 | Route |
| `bnav()` | `.ws-bnav` from `FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV` | `.ws-bnav*` (+ safe area) | DF icons | Links; CREATE → OL-01 | `config/navigation.ts` |
| `phead()` | `FounderWorkspacePageFrame` → `.ws-phead` | `.ws-phead`, `.ws-title`, `.ws-arch` | SITE 00 Display 900; `DfCrownObject` (objects.tsx) | — | Destination ordinal |
| Focus | `.ws-focus` (status, ident plate, statement, CTA, “1 OF N DECISIONS”) | `.ws-focus*`, `.ws-statement` | Display 900 | CTA → client record | `foundationAdminApi.list/pipeline` → `readLifecycle()` |
| Signals | `.ws-signals.ov__signals` × 4 | `.ws-sig*` | Display 900 numerals | — | Counts from lifecycle kinds |
| Needs you | `WsPanel.ov__needs` + `.q-item` rows | `.ws-panel`, `.q-item` | — | Row → client record | Founder-kind rows |
| Active work | `.reg-box > .reg` header + `RegistryRow` | `.reg*` container queries | Plates | Row → client record | Non-complete rows (6) |
| Recent movement | `WsPanel.ov__move` + `WsActivity` | `.ws-act` | — | — | Latest state per artifact |
| Empty / error | `.ws-empty` / `WsBanner` + RETRY + technical detail | `.ws-empty`, `.ws-banner--red` | — | Create / retry | API outcome |
| Menu drawer (OL-03) | `WorkspaceMenuRows` (`.ws-menu__i`) inside the existing overlay host | `.ws-menu*` | DF icons | Links | Navigation config |

**Not ported (documented):** the specimen's *NEXT MILESTONE* panel. It needs operational stage data the list/pipeline API does not return, so it is omitted rather than invented (gap G-OV-1).
