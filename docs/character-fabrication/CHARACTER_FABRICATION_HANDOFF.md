# Character Fabrication — Composer / Grok handoff

Sprint P0.SW.CHARACTER-FABRICATION-LIVE-MACHINE1 · Route `/production/:project/expression/character-fabrication` (`?station=<id>`).

## Architecture
- Pure core `shared/site00-character-fabrication/`: `types` (FabricationState), `reducer` (state machine; time/ids arrive on actions; side effects leave via `outbox`), `dependency` (reusable resolver: blockers, staleness, downstream impact, pending decisions), `simulation` (Level-2 cached preview checks), `actors` (canonical adapters), `library` (LIBRARY_SEED catalogues), `assets` (semantic slot registry + receipts + manifest).
- UI `src/site00/components/characterFabrication/` (provider, primitives, eight station files); styles `site00-character-fabrication.css`.
- ACTOR (`ActorRecord`, from Studio World acting-catalogue) and CHARACTER (`CharacterRecord`, from Entry 002 cast state) are separate types; the character references the actor by id only.
- Outbox → existing `productionActivityStore` and `productionRequestStore` (new kinds `CHARACTER_FABRICATION_*`) so decisions appear in Hub ON YOUR TABLE, Inbox/queue and Recent Activity.

## Persistence (honest)
`src/site00/state/characterFabricationRepository.ts` is the single storage boundary. Implementation is DEVICE-LOCAL (localStorage). Founder gates are NOT canonical backend authority. Replace with an API repository (same interface) to persist server-side.

## Fidelity
1. LIVE UI PREVIEW — React state, controls, sliders (implemented).
2. SIMULATION PREVIEW (CACHED) — deterministic run clock + fixture checks (implemented; labelled in UI). Seeded defects WARDROBE_TOP / MOTION_TIMING clear only when the owning station is revised and re-approved.
3. FINAL GENERATION — not implemented, not triggered.

## Known data conflicts
Canonical SW-017 (Maya Okonkwo, 26–32, deep brown skin, black 4C hair) differs from the authority images (24–30, Caucasian, blonde). UI shows canonical data. Portraits are empty slots; Grok must produce imagery consistent with canonical SW-017.

## Grok
`CHARACTER_FABRICATION_ASSET_MANIFEST.json` lists every slot (regenerate: `npx tsx scripts/generate-character-fabrication-manifest.ts`). Deliver files to each `destinationPath`; Composer appends `CHARACTER_ASSET_RECEIPTS`.

## Gaps
No measurement backend (body readouts are fixtures); motion request lifecycle advance is an OPERATOR control; rate card not integrated; World Fabrication / Scene Assembly not built (state is per-character so it can converge later); `page.reload` on production routes throws a dev-only removeChild error (also on the Hub).

## Pixel-fidelity convergence (P0.SW.CHARACTER-FABRICATION.OPUS-PIXEL-FIDELITY-CONVERGENCE1)
- Every view is authored on the 432×768 authority canvas; the workspace root uses CSS `zoom = innerWidth/432` (capped 1.6×) so authority px map 1:1 at any phone width. Stylesheet: `site00-character-fabrication-authority.css`.
- Typography: vendored OFL Barlow Condensed / Barlow Semi Condensed (`public/site00/fonts/…`, family `SITE00 Fab Condensed`) to match the authorities' condensed grotesque.
- Authority → live state: 5414 IdentityView/ActorCatalogue · 5415 ActorProfile · 5416 ContinuityInspector · 5417 BodyStation · 5418 LookView · 5419 LookCompare · 5420 AppearanceView · 5421 AppearanceCompare · 5422 CharacterView · 5423 CharacterView(BEHAVIOR_LIBRARY) · 5424 PerformanceStation · 5425 MotionRequestPage · 5426 RunningSimulation · 5427 SimulationResult · 5428 AuthorityView · 5429 TestingGround.
- Reference numbering errors corrected: 5424 "07 PERFORMANCE"→06, 5425 rail "02 PERFORMANCE"→06, 5429 "06 TESTING GROUND"→07 with SIMULATION active.
- Frames with no rail (5419, 5422–5424, 5426, 5427) keep the 01–08 rail directly below the composition; the station status bar only appears when there is an interlock, staleness or open revision.
- ASSET GEOMETRY FROZEN for Grok by the live slot boxes (e.g. hero subject 74×216 at (179,24); catalogue portrait 78×76; profile hero 161.5×248; look candidates 117.5×223.5; appearance hero 282×266; compare primaries 184.5×183.5, angles 57×79; motion player 275×291; test preview 165×150; result preview 282×235; final authority 129×162). New slots: `appearance.sw017.hero.closeup`, `look.sw017.candidate.{a,b,c}.layers`. Total 104 (102 Grok, 2 runtime canonical).
- Known remaining divergences: photographic material is empty slots + live SVG proportion proxy; canonical data differs from images (SW-017 age/ethnicity, 7 catalogue actors, 7 appearance layers vs 9 rows in 5421, 8 motions vs "24 ITEMS"); the Testing Ground feed is a neutral lab plate, not the photographed room.
