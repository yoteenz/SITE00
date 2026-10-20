# 03 · Foundations (D-03/04/05/06/07 · TP-03/04/05 · TL-03/04/05 · C-05)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


## Registry (`pages/FoundationsPage.tsx`, `foundations/FoundationsRegistry.tsx`)

- Header: `02 FOUNDATIONS.` · real counts (`N FOUNDATIONS · N ACTIVE · N NEED YOU`) · REFRESH · NEW FOUNDATION (OL-01). Header
  actions hide on phones (CREATE lives in the bottom bar).
- `reg-toolbar`: live search (name, artifact id, link token; `/` focuses) · status views ALL / NEEDS YOU / INVITED /
  INTAKE / QUOTE / ACTIVE / COMPLETE with real counts from `readLifecycle` (`data/foundationViews.ts`) · FILTER and SORT
  open OL-07 (payload `lifecycle_states` kept).
- `reg` registry, container-driven: phone cards (< 600) · CLIENT / STATUS / NEXT ACTION (600–919) · CLIENT / LIFECYCLE /
  INTAKE / NEXT ACTION / LAST ACTIVITY (≥ 920). Row ⋯ → OL-06. `data-testid="foundations-registry-row"` kept.
- Keyboard: J / K move, ↵ opens the record, space selects.
- Inspector (`inspectors/Inspectors.tsx · ClientInspector`): docked ≥ 1100 (dock rule), identity, status + step,
  abbreviated journey, next action, personal link, intake, payment, referral, last activity, G-03 movement note;
  OPEN FOUNDATION · COPY LINK · MORE (OL-06). Below 1100 a row opens **OL-19** (client preview sheet).
- States: loading skeleton rows · no foundations (create CTA) · no matches (clear search + view) · load error (red
  banner, RETRY, technical detail → OL-20) · refresh error keeps the last list.
- Data: `foundationAdminApi.list()` + `pipeline()` (pipeline optional). No fixtures in source.

## Create client (OL-01, `overlays/CreateClientOverlay.tsx`)

Full screen on phones, dialog on tablet/desktop. Choice cards (CLIENT FOUNDATION; SYNTHETIC TEST CLIENT disabled → Test
Lab), business / contact name, optional validated email (the old pre-filled `prospect@example.com` placeholder is gone),
referral source as choice cards (DIRECT / AIO · planned, attribution only / CLIENT REFERRAL / SITE 00). `createLeadLink`
contract unchanged; success toast and OL-02 only after the server returns a link; failure keeps entries.

## Client record (`pages/ClientRecordPage.tsx`)

`rec-head` (plate, display name, referral, email, COPY LINK · CLIENT VIEW · MESSAGE (OL-14) · MORE (OL-06)) ·
`rec-progress` journey with known dates · tabs OVERVIEW / INTAKE / RECOMMENDATIONS / QUOTE / OPERATIONS / RECORDS /
COMMUNICATIONS / ACTIVITY · two-zone body with PERSONAL LINK / CONTACT / RECENT MOVEMENT side column.
Quote: `qt` table from the quote record (never recalculated) + DECISION (OL-08 approve, OL-09 adjustment). Records:
completion gate reasons from `completionGate()`, ownership record, MARK COMPLETE opens OL-10 (which enforces the gate),
project command link. Workbench / intake links preserved.

Evidence: `evidence/matrix/foundations-14-viewports.jpg`, `evidence/matrix/record-14-viewports.jpg`, `evidence/compare/foundations-*.jpg`,
`evidence/compare/record-*.jpg`, `evidence/states/`.

FOUNDATIONS: COMPLETE · CLIENT RECORD: COMPLETE · CREATE CLIENT: COMPLETE
