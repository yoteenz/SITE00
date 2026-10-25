# 04 — Actor, Character and Look data model audit

The sprint's chain is ACTOR → CHARACTER → LOOK → PERFORMANCE → SHOT → TAKE → APPROVED FOOTAGE. This audit maps each link to what exists and recommends the fewest extensions that close it.

## 1. Entity map

| Entity | Studio World (main) | Character Fabrication (main) | CAST NDX (main) | THE EXCHANGE (branch) | FILM (main) |
| --- | --- | --- | --- | --- | --- |
| Actor | `StudioWorldActor` and `ActorIdentityAuthority` (views FRONTAL, THREE_QUARTER, PROFILE, FULL_BODY; `immutable: true`) | `ActorRecord`, versioned `BodyVersion` | Casting candidate and identity lock (per project) | Not separate: the character carries its face master | — |
| Character | `ProductionCharacter` (`actorId`, `projectId`, `campaignLookId`, `temporalLookIds`) | `CharacterRecord` | Embodied character run record | Cast registry entry (24 fields, each with owner, status, source) | — |
| Look | `CharacterCampaignLook` (hair, makeup, nails, wardrobe, shoes, jewelry, accessories, bag, garments, props as strings; **no version**; one character); `CharacterTemporalLook` (`preservesActorIdentity: true`) | Look candidates A/B/C, 21-garment wardrobe seed (browser) | `WardrobeLock` | Wardrobe entries (6, DESIGN_REQUIRED) | — |
| Performance | `CharacterPerformanceSkin`, `PerformanceStackAssembly` (types) | Performance station (fixtures) | — | `PerformanceDirection` per shot, validated | — |
| Shot | `ShotCastEntry` keyed by a bare shot string | — | — | `ShotDesign` (camera, motion class, coverage, frames, keyframes) | Shot contract (memory) |
| Take | **None** | — | `CharacterCastingCandidate` (image rounds, persisted) | **None**; `DialogueEvent.takeRef` is a dangling slot | `FilmShotCandidate` (memory) |
| Approved footage | **None** | — | — | Asset registry `video.canonical: []` | — |

Evidence: `shared/site00-studio-world/acting-catalogue/types.ts`; `shared/site00-character-fabrication/`; `shared/site00-studio-world-production/characterVisualCasting/`; `shared/site00-fiction-production/directorial/types.ts` (DialogueEvent at line 152); `shared/site00-studio-world-production/filmProduction/types.ts`.

## 2. Required relationships

| Rule (sprint §04) | Supported | Evidence |
| --- | --- | --- |
| One Actor may portray many Characters across projects | Yes in the model; nothing persists it | Test "allows one Actor to play multiple Characters across campaigns"; seed has SW-017 cast but `charactersPlayed: []` |
| One Character may have many approved Looks | Partly: `temporalLookIds` and campaign looks exist; no approval history | `types.ts` |
| One Look may appear across many scenes | Not as a reusable record: a Look belongs to one character and has no version | `CharacterCampaignLook` |
| One Shot may produce many Takes | **No** anywhere persistent | §1 |
| Each Take keeps source identity, references, settings, provider and approval history | **No** | §1 |
| A wardrobe change must not change the face | Yes in design: temporal looks preserve actor identity; fabrication invalidates downstream on body change; campaign reuse does not overwrite identity (tested) | catalogue tests; `p0CharacterFabricationMachine1` |

**Actor/Character separation is intact** in Studio World and fabrication. THE EXCHANGE merges them: a character record holds its own face master and voice. That is correct for a single fiction project, but it means its people are not catalogue Actors. Whether they should become catalogue Actors is a founder decision (D-06), because it would create new catalogue identities.

## 3. Recommended extensions (only where necessary)

| Extension | Why it is needed | Where | Gap |
| --- | --- | --- | --- |
| `version` and `approval` on Look; Look items reference wardrobe, hair and makeup records instead of strings | Presets must be selectable and stable | Character Studios | G-LOOK-01 |
| Shot as a stored entity keyed by project, scene and shot ID | Takes and continuity need a stable parent | Director Composer | G-SCENE-01 |
| **Take** (shot ID, source actor, character, Look version, references with purpose, provider, model, settings, prompt, job ID, quoted and actual cost, output asset ID, decision history) | The core missing link | Director Composer, stored by the Production Asset Registry | G-TAKE-01 |
| Approved footage = a Take in APPROVED or SELECTED_FOR_EDIT state whose output has a stored master | Avoids a separate footage table | Production Asset Registry | G-ASSET-01 |
| Voice association on Character (optional default on Actor) | THE EXCHANGE voices are per character | Character Studios | G-VOICE-01 |
| Reference purpose on every job input | Identity must not be replaced by a style reference | Director Composer | G-REF-01 |

Not recommended: a new "AI model" record that flattens Actor, Character and Look. Elsewhere's "brand model" appears to be one such object. Here it would destroy the separation the founder approved.

## 4. Look preset example (sprint §08)

The sprint's example is SLOANE LOCKWOOD, LOOK: EVENING ARRIVAL. What the repository can supply today:

| Item | Value in the repository | Status |
| --- | --- | --- |
| Face | Founder-selected facial identity, two files hashed in `CHARACTER_VISUAL_REGISTRY_V1.json` | FACIAL_IDENTITY_LOCKED |
| Wardrobe | `WD-SLOANE-PARTY-GE92`: "The third of three looks on the bed: the one that moves when she spins." | DESIGN_REQUIRED |
| Jewelry | `PR-SLOANE-NECKLACE` | DESIGN_REQUIRED |
| Bag | `PR-SLOANE-CLUTCH` | DESIGN_REQUIRED |
| Hair and makeup | "Hair finished before Gideon arrives" (continuity note only) | Not designed |
| Footwear, nails | Not recorded | — |

So the preset can be defined as a structure but not filled. No wardrobe approval is invented here. Sloane's record states "Wardrobe language not approved (U-4)" (G-LOOK-04).

Source: `THE_EXCHANGE/SEASON_1/PRODUCTION_ASSET_REGISTRY_V1.json`; `CAST_REGISTRY_V1.json`.
