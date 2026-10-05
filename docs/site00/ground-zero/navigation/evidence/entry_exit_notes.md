# SITE 00: ENTRY and EXIT systems (static forensic audit)

Commit `2ac4059` (main). This audit reads code only; no runtime was available. Anything marked **CONFIRM_LIVE** needs a browser check. Structured data is in `entry_exit.json`.

## 1. The model in code

```
ORIGIN (/ , /origin)
 ├─ ENTER 00 (header toggle, desktop/tablet)        ─┐
 ├─ "ENTER SITE 00" link (mobile callout)            ├─> /enter  = WAITING ROOM (EnterPage, env ENTER_00_WAITING_ROOM)
 │                                                   ┘        └─ EXIT 00 (same toggle) ─> /origin
 └─ SWIPE UP gesture / "SWIPE UP" button (mobile) ────> /origin/locations = LOCATIONS (mobile-only)
                                                              └─ EXIT 00 (DirectoryExitButton) ─> /origin
FAST TRAVEL (mobile header overlay, every Site00MobileShell page except LOCATIONS) ─> LOCATIONS, 00 ORIGIN, contextual items
```

There are **two interior directories**:
- **WAITING ROOM:** `/enter`, built from `directory.ts`, desktop-first.
- **LOCATIONS:** `/origin/locations`, built from `locations-directory.ts`, mobile-only.

They have different item sets and labels, and each has its own EXIT 00. The mobile Origin callout shows both entrances in the same widget: the "ENTER SITE 00" link opens `/enter`, and both the swipe gesture and the "SWIPE UP" button open `/origin/locations` (`OriginMobileSwipeUp.tsx:37,45`).

## 2. ENTER 00

**Triggers**
- `EntryToggle.tsx:27-36`. This is a labelled `<Link>` in the right slot of the `Site00AppShell` header.
  - CSS hides it on the Origin mobile layout (`site00.css:764`).
- `OriginMobileSwipeUp.tsx:37`. The "ENTER SITE 00" link, mobile only.
- The swipe-up gesture does **not** open ENTER 00. It goes to LOCATIONS (`useOriginLocationsTransition.ts:21`).

**Surface**
- It is a full route, not an overlay (`Site00Routes.tsx:649-659`).
- The page is `EnvironmentShell` → `Site00AppShell` → `DirectoryPanel` + `EnterStatusStrip` (`EnterPage.tsx:6-14`).

**Destinations** (`directory.ts:30-117`)
- EXPLORE: 01–05, i.e. SITES, SERVICES, SYSTEM, ABOUT, JOURNAL.
- YOUR SPACE: BLDR STUDIO, PROJECTS (auth), ACCOUNT (auth, goes to `/control`), SUPPORT.
- Every destination resolves to a live route.
- Signed-out users who pick PROJECTS or ACCOUNT go to `/origin/sign-in?returnTo=…` (`directory.ts:119-128`).
- IDNTY, EVOLVE and MY SITES are missing.
- The EXPLORE items repeat the header GlobalNav on the same screen.

**Variants**
- Public and signed-in differ only in the lock styling. Signed-in state comes from the localStorage flag (`WorkflowCards.tsx:171-205`).
- There is no founder variant and no client variant.

**Responsive behaviour**
- On a hard load of `/enter`, preview mode is forced to desktop (`Site00Context.tsx:32-38`). On a phone that means a scaled 1440×900 artboard.
- Reaching `/enter` client-side from mobile Origin probably keeps mobile mode, so the page renders as a native single column (`site00.css:734-741`). How it renders depends on how the user arrived (CONFIRM_LIVE).
- Viewports ≥768px get native desktop.
- The Mobile/Desktop preview switch is hard-disabled (`preview-mode.ts:6-8`).

**Transitions**
- None. Only the route-loader copy "ENTERING SITE 00" (`site00LoaderRouteCopy.ts:55-60`).

**Visual authority**
- Only the environment plate is approved: 89319E70 (`environments.ts:102`; `assets.ts:77-85`).
- There is no ENTER or WAITING ROOM record in `publicRedesignAuthorityManifest.ts`; LOCATIONS has one (`:103`).
- `/enter` desktop was the Experience Engine V0 fidelity proof (`MEMORY.md:5784-5787`).

**Recommended classification: SPATIAL_PORTAL**
- ENTER 00 has its own URL, its own environment plate and location label, and a reciprocal EXIT 00.
- It is a threshold place, not persistent chrome.
- The toggle is a shell interaction that points at the portal. FAST TRAVEL is the real global overlay.
- This depends on founder decision U2 (merge LOCATIONS into WAITING ROOM).

## 3. WAITING ROOM

**In code, WAITING ROOM is `/enter`.**
- Environment id `ENTER_00_WAITING_ROOM` (`environments.ts:92-103,121`; `EnterPage.tsx:8`).
- CSS section "Enter 00 — waiting room (/enter)" (`site00.css:1081`).
- Forensics screen `waiting-room` = "Waiting Room / Enter 00" (`site00RouteForensics.ts:66-79`).
- Its "menu" is `DirectoryPanel`.
- It is **not** the LOCATIONS directory.
- The words "WAITING ROOM" are never shown to users. The only user-facing text is the FAQ seed (`site00-page-seed.ts:111`), and `/faq` is draft-gated.

**"MENU = WAITING ROOM" founder decision: not found in the repo.**
- Searched: src, shared, api, docs, motherboard (including a grep of MEMORY.md), audit, artifacts, .cursor, visual-references and the git log.
- Closest evidence:
  - Locked constraint L3: "WAITING ROOM (directory) and EXIT 00 (return to origin) are named navigation concepts" (`SITE00_INDEPENDENT_TREE_REVIEW_PACKET.json:9726`).
  - The label "ENTER 00 DIRECTORY (WAITING ROOM menu)" (`evidence/navigation.json:128`).
- The merge question U2 is still open (`…PACKET.json:9786`; `SITE00_TREE_TRADEOFF_MATRIX.md:44`).
- The Opus proposal is PUB.WAITING_ROOM at `/enter`, with LIST, MAP (absorbing `/origin/locations`) and SIGNED_IN states (`SITE00_OPUS_PROPOSED_SCREEN_TREE.json:28-37`).
- The decision should be recorded in-repo if it was made elsewhere.

**Relationships**
- ENTER 00 is the portal action and WAITING ROOM is the place it opens.
- EXIT 00 leaves the WAITING ROOM for ORIGIN.
- FAST TRAVEL never links to `/enter`.
- The mobile nav highlights the ORIGIN bay on `/enter` (`mobile-site-nav.ts:74-80`).

## 4. LOCATIONS

**Structure**
- `LocationsPage.tsx` uses `Site00MobileShell(headerVariant='directory')`, which renders `LocationsDirectory` with its header, `DirectorySpine` and `DirectoryCard`.
- 11 entries: PUBLIC WORLD 01–07 and YOUR SPACE 08–11 (`locations-directory.ts:30-130`).

**Desktop redirect**
- At ≥768px the page does `<Navigate to="/origin" replace>` (`LocationsPage.tsx:7-20,37-39`).
- CSS also hides it (`site00-locations.css:6-12`).
- So every LOCATIONS link on desktop silently bounces to Origin. Example: `AccessSystemFooter.tsx:31` on the desktop credential page.

**Entry points**
- Swipe or the "SWIPE UP" button.
- The centre bay of the bottom nav.
- FAST TRAVEL.

**Animation**
- A 780 ms shell animation plus staggered cards when the user arrives by swipe (`site00-locations.css:215-245,497-505`).
- Reduced-motion is honoured (`:618-627`).

**Visual authority**
- `01_LOCATIONS_MAIN` (`manifest:103`).
- The manifest names the component `PublicLocationsDirectory`, which does not exist. The real component is `LocationsDirectory`.

## 5. EXIT 00

| Where | Context | Goes to |
|---|---|---|
| `EntryToggle.tsx:14-25` | `/enter` header (aria "EXIT SITE 00 INTERIOR") | `/origin` (push) |
| `DirectoryExitButton.tsx:5-15` via `Site00MobileHeader.tsx:25-26` | LOCATIONS header. It replaces the FAST TRAVEL trigger, and the panel is not mounted (`Site00MobileShell.tsx:47-69`) | `/origin` (push) |
| `Site00DesignWorkspaceShell.tsx:139-141` | Internal design-workspace sidebar footer | `/`. This is Origin only when `VITE_SITE00_ROOT=1` |

How EXIT 00 differs from the other "leave" controls:
- **BACK:** EXIT 00 has a fixed target and pushes a new history entry. There is no history-based BACK anywhere except FAST TRAVEL close. The BACK links in the app are explicit routes, e.g. `Site00SignInForm.tsx:136-139`.
- **LOG OUT:** LOG OUT ends the session and then does `navigate('/origin', {replace})` (`CtrlRoomSidebar.tsx:12-16`, `EcosystemSidebar.tsx:14-18`, `CtrlRoomSignOutButton.tsx:12-18`). EXIT 00 never touches the session.
- **CLOSE:** FAST TRAVEL ×, Esc and backdrop close the overlay through `history.back()` (`FastTravelPanel.tsx:33-40`), with no route change. EXIT 00 is a route change.
- **HOME:** Public chrome has no HOME control; ORIGIN is the home. The "00 ORIGIN" item in FAST TRAVEL goes to the same URL as EXIT 00.
- **EXIT PROJECT:** `ProjectWorkspaceDrawer.tsx:268-270` goes to `/projects`. It leaves one project inside the app.
- **Semantics:** EXIT 00 has two meanings. In public it leaves a place; in the design workspace it leaves an application.

## 6. Gestures

All gestures found in `src/` (full table in JSON):

| Gesture | Where | Non-gesture alternative |
|---|---|---|
| Swipe-up | Origin mobile | Yes: SWIPE UP button. Its label names the gesture, not the destination. The swipe surface is a full-screen, aria-hidden layer with `touch-action:none` (`site00.css:976-985`) |
| Horizontal swipe | 5 review carousels: `DerivativeReviewCarousel`, `ConceptDirectedTwinGallery`, `PageConceptGeneratorNbpStage`, `ExperienceCompilerWorkspacePage`, `productionHub/machine.tsx` ArtifactStage | Prev/next buttons in all five. The NBP arrows have no aria-label |
| Drag | `CropBoxOverlay` | **None** (no keyboard or numeric entry) |
| Drag | `CompositionStudioCanvas` | Numeric inputs |
| Drag-to-pan | `DesignPageV3DerivationReviewPanel` | Partial (zoom buttons only) |
| HTML5 drag-and-drop reorder | `Entry001FormatSequenceWorkspace` | Move buttons |
| Outside-tap dismiss | Origin desktop expanded panels, production menus | Buttons and/or Esc |

None found: long-press, pull-to-refresh, edge-swipe, swipe-down, wheel handlers.

## 7. Back behaviour and dead navigation

**Back and history**
- `navigate(-1)` is not used anywhere.
- FAST TRAVEL pushes an overlay history entry. When the user picks a destination, it calls `replaceState(null, '')` (`FastTravelPanel.tsx:42-51`). This likely wipes the router state and leaves a duplicate back entry (CONFIRM_LIVE).
- Both public EXIT 00 controls push `/origin`, so history fills with Origin↔directory ping-pong.

**Exit loops**
- **SelfDirected "SIGN OUT" does not sign out.** It is a plain link to `/origin/sign-in` (`SelfDirectedViews.tsx:450-452,509-511`). The sign-in bootstrap then sees the session and redirects to `/control` (`useSite00SignInBootstrap.ts:71-106`; `signInReturnTo.ts:5,40`).
- **LOCATIONS on ≥768px** bounces straight back to Origin.

**Context loss**
- **Device mode:** preview device mode is decided once per provider mount and `/enter` forces desktop, so the swipe can disappear on phone Origin after visiting `/enter` (`Site00Context.tsx:32-66`).
- **Swipe timer:** the 720 ms swipe `setTimeout` is never cleared (`useOriginLocationsTransition.ts:32`). It can override a navigation the user made during that window.
- **No FAST TRAVEL on LOCATIONS.** The header slot is taken by EXIT 00 and the panel is not mounted.

**Stale links**
- `/account` is a composer draft route, so links to it redirect to `/`. Affected links: design workspace ACCOUNT, ProjectWorkspaceDrawer ACCOUNT.
- The design-workspace nav items GUIDE, SOUND, FAQ, CONTACT and BLUEPRINTS are all draft-gated the same way (`p0vr2b/constants.ts:30-41`).
- The loader matches `/enter/*`, but no such routes exist.

**Duplicates and label drift**
- GlobalNav and the ENTER 00 EXPLORE section show the same five items on one screen.
- CTRL ROOM is "ACCOUNT" in ENTER 00 and "CTRL ROOM" everywhere else.
- BLDR has four labels: "BLDR STUDIO", "BLDR", "BLDR / START BUILD", "START A BUILD".
- The ENTER 00 and LOCATIONS item sets diverge.

**Dead code**
- `Site00EnterArtboardViewportBackground`
- `Site00MobileMenuDrawer`
- `Site00PublicSidebar`
- The `__origin` swipe-transition CSS

**Tests**
- No tests cover the swipe, EntryToggle, EXIT 00, LOCATIONS, the directory configs or FAST TRAVEL.
