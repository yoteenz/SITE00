# 08 · Shared shell recovery contract

| Element | Contract | Source |
| --- | --- | --- |
| Root | `.ws.ifw` wraps the app and overlay host. `.ws` carries the authority tokens; `.ifw` keeps legacy page bodies styled until propagation | `FounderWorkspaceShell.tsx` |
| Grid | Phone: top / stage / bottom bar. ≥ 768: nav / top / stage. The stage is `container: stage` | `ifw-authority.css` `.ws-app` |
| Sidebar ≥ 1280 | 224 px (248 from 1600); brand + env; red NEW FOUNDATION (OL-01); 01–07 with red active rule; READINESS DESK; account foot (OL-18) | idem |
| Rail 768–1279 | 80 px; 00 plate; NEW; icon + short label per destination; REFERRALS has its own item | idem |
| Top bar | Phone: brand + 3 icon buttons. ≥ 768: breadcrumb `0n — DEST`, search field (⌘K), bell | idem |
| Bottom bar | Driven by `FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV` (tested); safe-area padding | idem |
| Page header | `FounderWorkspacePageFrame`: index rail, title, sub, optional actions and architecture object | `FounderWorkspacePageFrame.tsx` |
| Primitives | `WsIcon`, `WsButton`, `WsIconButton`, `WsStatus`, `WsMark`, `WsPlate`, `WsSegments`, `WsPanel`, `WsBanner`, `WsActivity`, `WsBrand` | `shell/wsKit.tsx` |
| Keyboard | ⌘K / Ctrl-K → OL-04 (kept) | Shell effect |
| Auth | Unchanged: the route stays under `AdminGuard`, and the Supabase user only labels the account | — |
