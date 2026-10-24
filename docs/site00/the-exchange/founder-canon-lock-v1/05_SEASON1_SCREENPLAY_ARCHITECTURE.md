# 05 — Season 1 screenplay architecture

**Classification:** `PROVISIONAL_IMPLEMENTATION` (an implementation of the founder-approved direction; the conventions are accepted only when the founder approves the S1-01 to S1-05 batch).

**Code:** `shared/site00-fiction-production/` (`fountain.ts`, `screenplay.ts`, `shotPlanner.ts`, `continuity.ts`, `manifest.ts`). **Files:** `THE_EXCHANGE/SEASON_1/SCREENPLAYS/<release>_<TITLE>.fountain`.

## Authority order

1. The approved 86-release master (`SEASON1_86_RELEASE_MASTER_V1.json`) decides what happens in a release.
2. The knowledge ledger decides who knows what, and when the audience learns it.
3. The dialogue registry decides how each person sounds.
4. The asset registry decides what can be shown. A missing asset is a blocker, never something to generate around.
5. The screenplay performs the release. It may refine wording; it may not change a beat, a reveal or a fact.

Generation convenience never overrides story authority. A beat that is hard to generate stays in the script and becomes a production blocker.

## File format

Each screenplay is one UTF-8 file: a JSON metadata block between two `---` lines, then a Fountain subset.

| Layer | Where | Content |
| --- | --- | --- |
| IDENTITY | `meta.identity` | releaseId, title, arc, version, approvalStatus, runtimeTarget. `approvalStatus` must stay `DRAFT — FOUNDER REVIEW REQUIRED` until a SCREENPLAY approval is recorded. |
| STORY | `meta.story` | narrative purpose, previous continuity, opening hook, scene objectives, character motivations, conflict, revelations, emotional turning point, ending hook |
| SCREENPLAY | body | scene headings, action, character cues, parentheticals, dialogue, transitions |
| PERFORMANCE | `meta.performance` | speech notes per character, subtext, pacing, silence |
| VISUAL | `meta.visual` | visual intention, key images, required reveals, continuity rules |
| PRODUCTION | `meta.production` | characters, locations, wardrobe, props, effects, crowd, shot complexity, technical notes |
| CONTINUITY | `meta.continuity` | facts introduced, facts carried, open questions, payoff dependencies, canon references |
| EDITORIAL | `meta.editorial` | pacing risk, retention hook, ending transition |

The validator treats any empty required field as a hard conflict.

### Body rules

- Scene headings: `INT.`, `EXT.` or `INT./EXT.` + location + optional zone + time of day, separated by em dashes: `EXT. HALCYON HOUSE — FRONT STEPS — NIGHT`. Every location must resolve to a registered set or alias; an unregistered zone is a warning.
- Action is performable: what the camera sees and the actor does. Paragraphs over 70 words are flagged as prose summary.
- Dialogue: an upper-case cue, an optional `(V.O.)`, `(O.S.)`, `(O.C.)` or `(CONT'D)`, optional parentheticals, then speech. `^` marks dual dialogue. Speeches over 45 words are flagged.
- Every cue must be in the dialogue registry. A minor speaker declared in `PRODUCTION.characters` is a warning (needs a voice); an undeclared one is a hard conflict.
- Line IDs are assigned on parse (`S1-03-L007`) and are the key for recordings, lip-sync and the edit.

### Production notes

A note is a block of its own, separated from action and dialogue by blank lines: `[[TAG: value]]`. Unknown tags are hard conflicts.

| Tag | Value | Use |
| --- | --- | --- |
| `SHOT` | framing / movement | Frames the paragraph that follows it |
| `INSERT` | what we see | A cutaway insert (1.5 s) |
| `REACTION` | `WHO — what` | A reaction shot (1.5 s) |
| `FREEZE` | `TITLE: descriptor` | Sloane's freeze-frame card; the following `SLOANE (V.O.)` performs the descriptor (2.5 s) |
| `PROP` | `PR-ID: state` | Prop state from this point |
| `HANDOFF` | `PR-ID: FROM → TO` | A prop changes hands; checked against the registry chain |
| `WARDROBE` | `WHO: WD-ID` | Look in effect; checked across releases on the same fictional day |
| `ENTER` / `EXIT` | cue | Who is on screen without speaking |
| `CONTINUITY` | text | A carried fact the editor must protect |
| `MUSIC` / `SFX` / `VFX` | cue | Audio and effects cues, exported to the manifest |
| `TIME` | seconds | Replaces the estimate of the action paragraph before it |
| `HOLD` | seconds | Adds a held beat |

## Runtime model

| Element | Seconds |
| --- | --- |
| Dialogue | words ÷ 2.5 |
| Action | max(1.5, words ÷ 3.5), or the following `[[TIME]]` |
| Parenthetical "beat" / "pause" / "long pause" or "silence" | +1 / +2 / +3 |
| `FREEZE` / `INSERT` / `REACTION` | 2.5 / 1.5 / 1.5 |
| Transition | 0.5 |
| Dual dialogue | the longer side only |

Pacing band = estimate ÷ target: UNDER below 0.85, ON_TARGET to 1.15, OVER above 1.15, HIGH_RISK above 1.3. The shot list's total always equals the runtime estimate, so the edit and the script agree.

Current drafts: S1-01 41.5 / 45 s (0.92), S1-02 65.6 / 70 s (0.94), S1-03 109 / 120 s (0.91), S1-04 86.9 / 90 s (0.97), S1-05 91.9 / 105 s (0.88). All ON_TARGET.

## Script to shots

`planShots()` turns a validated screenplay into shot records (fields in `13_SCREENPLAY_BATCH_SHOT_LISTS.md`):

- The first shot after a change of location is ESTABLISHING. Each `[[SHOT]]` starts a new shot. Consecutive lines by one speaker merge; a V.O. extends the shot it plays over.
- Dialogue coverage, reaction inserts, inserts, freeze cards and transitions are separate shots. A scene is never compressed into one 8–10 second generation.
- No shot exceeds 10 seconds. Longer beats split into parts that chain the end frame of one part to the start frame of the next.
- Each shot carries face locks from the visual registry, wardrobe and prop state, the set, movement constraints, complexity, the planned provider and two alternative cost estimates. Generation status starts at `NOT_STARTED`; actual cost is null.

The Kai's Note screen test informed these rules (multiple angles per exchange, separate reaction coverage, short generations). It stays `PRODUCTION_TEST_ONLY` and outside canon.

## Validation layers

| Layer | Function | Blocks on |
| --- | --- | --- |
| Parser | `parseExchangeScreenplay()` | missing or invalid metadata, heading without time of day, content before the first heading |
| Screenplay | `validateScreenplay()` | schema gaps, title or runtime mismatch with the master, approval status, unregistered sets or speakers, unknown notes, dialogue in a no-dialogue release |
| Continuity | `validateContinuity()` | 15 checks (see `10_CONTINUITY_VALIDATION_REPORT.md`); flags, never rewrites |
| Assets | `buildProductionManifest()` | missing faces, voices, set references, unapproved wardrobe or props, unregistered extras |

## Versioning

A screenplay revision bumps `identity.version`. The shot list records the screenplay's SHA-256; if the screenplay changes, the pipeline marks the shot list stale (BLOCKED) until it is regenerated. An approved screenplay that is revised is SUPERSEDED and the new version restarts at DRAFT.
