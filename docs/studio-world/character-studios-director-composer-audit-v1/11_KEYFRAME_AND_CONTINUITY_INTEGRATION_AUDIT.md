# 11 — Keyframe and continuity integration audit

## 1. Scene context inheritance (sprint §12)

**What THE EXCHANGE resolves today.** For each S1-01 shot, the packet resolves from records:
- scene and beat;
- characters on screen;
- set and zone;
- lighting state;
- wardrobe string;
- props and prop state;
- dialogue visibility;
- screen time and generation length;
- camera plan;
- start and end keyframes and their upstream blockers;
- music hit points;
- continuity notes.

Sources: `directorial/packet.ts` buildScenePacket, `keyframes.ts`, `spatial.ts`, `PRODUCTION_SCENES/S1-01/*`.

**What it does not resolve:**
- Studio World actor records (G-ID-01);
- versioned Looks (G-LOOK-01);
- prior approved footage (no takes exist, G-TAKE-01).

**What no other project has:** any of it (G-SCENE-01).

### Illustrative pilot: KAI'S NOTE, envelope handoff

The sprint names this as a pilot context, not an authorization to canonize it. What the repository holds:

| The system should know | Repository record | Status |
| --- | --- | --- |
| Sloane's approved visual identity | `CHARACTER_VISUAL_REGISTRY_V1.json`, two hashed files | FACIAL_IDENTITY_LOCKED |
| Gideon's approved visual identity | same, two hashed files | FACIAL_IDENTITY_LOCKED |
| Their wardrobe | `WD-SLOANE-PARTY-GE92`, `WD-GIDEON-SUIT` | DESIGN_REQUIRED |
| The luxury dressing-suite environment | The screen test used "a penthouse dressing suite (marble vanity, wood panelling, skyline)". Whether that is Sloane's apartment is open (CQ-02) | PRODUCTION_TEST_ONLY candidate for `SET-SLOANE-APARTMENT` |
| Gideon's doorway position, Sloane's movement | `SET-SLOANE-APARTMENT` zones include DOORWAY and CLOSET; no blocking recorded for this moment | Not recorded |
| One envelope and its ownership | The canonical prop is `PR-KAI-NOTE`, "a folded note in Kai's hand; paper and handwriting not designed". Chain: Kai → Gideon (S1-03), Gideon → Sloane (S1-04/05), Sloane → clutch (S1-05). The sprint's "one cream envelope" is not in the records | DESIGN_REQUIRED |
| The relevant audio | Screen-test lip-sync used uploaded audio of unrecorded origin | PRODUCTION_TEST_ONLY |
| The required shot framing | No shot plan exists for this moment; S1-02 to S1-05 are not directed | Not recorded |

Sources: `THE_EXCHANGE/SEASON_1/PRODUCTION_ASSET_REGISTRY_V1.json` (sets, wardrobe, props); `PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json`.

**What it shows.** The inheritance mechanism exists, and its prop chain already models ownership before and after a handoff. What is missing for this scene is approved content (wardrobe, set, prop design) plus a directed shot plan. Nothing here is promoted to canon.

The knowledge base already records a lesson from that test (`PRODUCTION_KNOWLEDGE_BASE_V1.json`): "Rooms drifted in the Kai's Note screen test: the dressing suite must keep its geography and scale."

## 2. Keyframe relationships

| Relationship | THE EXCHANGE | Expression Engine (NDXBOOK) | FILM |
| --- | --- | --- | --- |
| Storyboard frame → shot start frame | Keyframe `usedBy` and shot `startFrame` | START/MID/END pinned by ID (`entry002ReelKeyframeIds.ts`) | Storyboard interpreter (memory) |
| Shot end frame | Shot `endFrame` (18 S1-01 shots NOT REQUIRED; one ends on `KF-ENV-HALCYON-EXT`) | END keyframe | — |
| Character references | Keyframe spec (placement, expression, wardrobe) | Storyboard authorities | — |
| Environment references | `ENVIRONMENT_REFERENCE` keyframes with `derivesFrom` and `reusableBeyondUnit` | Pre-storyboard authorities | — |
| Continuity frames | `EXTRACT_FROM_APPROVED_FOOTAGE` with `extractFrom: { shotId, position: LAST_FRAME }` | — | Continuity graph |
| Generated footage | `output: null`; no take | No video | Simulated |

**S1-01 counts** (`KEYFRAME_MANIFEST_V1.json`):
- 22 keyframes: 3 environment, 1 wardrobe, 1 prop, 17 start frames;
- 20 generate, 2 extract, 0 reuse;
- 29 images to generate (some frames have 2 candidates);
- all 22 blocked upstream; the blocking chains end at founder decisions FD-S101-08 (25 chains, via `KF-ENV-CITY-DUSK-A`), FD-S101-05 (8), FD-S101-03 (2) and FD-S101-04 (1).

## 3. What the Composer must determine, and where the answer lives

| Question | Answer source today | Missing |
| --- | --- | --- |
| Which keyframes exist | `output` on each keyframe | Always null: nothing is written back (G-GEN-01) |
| Which are approved | Review state per keyframe element | — |
| Which can be reused | `source: REUSE` and `reusableBeyondUnit` | Cross-release lookup of approved frames (G-KF-04) |
| Which are missing | `source: GENERATE` with no output | — |
| Which need regeneration | Change request → INVALIDATED dependents (`review.ts` requestChange) | Post-generation checks to trigger it (G-CONT-01) |

**One image per shot is already avoided in plan:**
- SH07 starts from SH05's last frame;
- environment frames carry over to any release on the same set.

The extraction itself is not built (G-KF-01).

## 4. Drift prevention

| Drift | Before generation (exists) | After generation (missing) |
| --- | --- | --- |
| Facial drift | Identity reference bound to the frame | Face comparison against the master (G-CONT-01) |
| Wardrobe drift | Wardrobe string per shot | Look comparison against approved items |
| Architectural drift | Spatial authority, landmarks, environment keyframe `derivesFrom` | Set comparison (the KAI'S NOTE lesson above) |
| Prop duplication | Prop chain and prop state per shot (`spatial.ts` propChain) | Count check on the take |
| Eyeline contradictions | Eyeline and screen direction per shot; physical continuity validator | Check on the take |
| Character position changes | Blocking and placement | Check on the take |
| Inconsistent lighting | Named lighting state | Check on the take |

CAST NDX's drift QA returns fixed scores (`identityAnchorCasting.ts:241-244`) and must not be reused as a real check.

## 5. Asset selection with visible provenance (proposal)

A **reference tray** in the shot inspector (deliverable 08 U-04) lists what the shot will bind, grouped by purpose. For each item it shows:
- thumbnail;
- registry ID;
- status;
- source (file, take or provider ID);
- hash;
- whether it was reused or is new.

Swapping an item opens a picker scoped to the scene's project, set and cast, from one registry query. The founder never searches several libraries.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| K-01 | Write job outputs back to keyframes and shots | Director Composer | G-GEN-01 | `output` is set with a hash for every generated keyframe |
| K-02 | Extract continuity frames from approved takes | Director Composer | G-TAKE-01, G-ASSET-01 | KF-SF-SH07 extracted with zero credits |
| K-03 | Reference tray with provenance | Director Composer, Production Asset Registry | G-REF-01, G-KF-04 | Every bound reference shows ID, status, source and hash |
| K-04 | Post-generation checks, advisory first | Director Composer | G-TAKE-01 | Each take shows check results with method; none uses a fixed score |
