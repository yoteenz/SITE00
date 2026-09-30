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
