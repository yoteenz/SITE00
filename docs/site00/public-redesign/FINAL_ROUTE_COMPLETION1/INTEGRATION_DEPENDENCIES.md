# INTEGRATION DEPENDENCIES

New shared-for-hubs files (additive): `components/public-redesign/PublicHubLayouts.tsx`, `styles/site00-public-redesign-hubs.css` (imported in `routes/Site00Routes.tsx`).

Existing shared files touched (all justified, minimal):
- `routes/Site00Routes.tsx` — one CSS import line.
- `state/Site00Context.tsx` — removed the `/enter` special-case that forced the *desktop artboard* preview on first load (the redesigned ENTER composes natively; desktop artboard scaled it to unreadable on phones). Behaviour elsewhere unchanged; Mobile/Desktop toggle still present.
- `components/ecosystem/EcosystemShell.tsx` — optional `publicRedesign` prop (mobile layout only). Default path identical.
- `Site00AuthShell`, `BldrAssessmentShell`, `EvolveAssessmentShell`, `BldrIntakeShell` — non-artboard branch now renders `PublicHubPage`; desktop-artboard (`/desktop`) branches retained.

Not touched: Origin, OriginDualEnvironment, nav, `PUBLIC_REDESIGN_ASSET_URLS`, asset loader, host shell, 47 injected assets, 5 live-code exclusions, framework glyphs.

Runtime deps preserved: sign-in/create-account Supabase actions, `useBldrAssessment`/`useEvolveAssessment` server sync, `marketingEngagementApi`, `useCtrlRoomData`, `useProjectIndex`, `resolveStartEvolveRoute`.

Known baseline test failure (pre-existing, unrelated): `tests/projectHubReconstructionP0VR1DA.test.ts` "uses reference mobile overview only on overview route".
