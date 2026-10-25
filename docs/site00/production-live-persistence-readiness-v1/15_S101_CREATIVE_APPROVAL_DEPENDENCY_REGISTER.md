# 15 — S1-01 creative approval and dependency register

Sprint §22 and §23. Generated from the S1-01 directorial packet (section 9 decisions, section 10 steps), the keyframe manifest's dependency chains and the review state. It records where each decision stands; it answers none of them. The same data is in `S101_CREATIVE_APPROVAL_REGISTER_V1.json`.

## 1. Founder decisions (all 12 in the packet)

The order is a suggested review order. It starts with what everything depends on, then the street that seeds almost every frame, then the budget, then the decisions later shots need.

| Order | Decision | State | Blocks step | Affected shots | SH01 | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **FD-S101-01** Approve the S1-01 screenplay v2 (still DRAFT)? | OPEN | SCREENPLAY | all 19 | GLOBAL | Founder decides: Approve v2 / Request changes / Return to v1. Packet recommends: Approve v2: the glass is set up, the Ember is silent and Halcyon House is windows only. |
| 2 | **FD-S101-09** Confirm 24 fps delivery? | OPEN | DIRECTION | all 19 | GLOBAL | Founder decides: 24 fps / 30 fps (re-time every event). Packet recommends: 24 fps. |
| 3 | **FD-S101-08** How is the street seeded? | OPEN | KEYFRAMES | all generated (18) | SH01_SPECIFIC | Founder decides: Look development: two candidates from the spec / Founder supplies a street photograph as the reference. Packet recommends: Founder photograph if one exists; otherwise two look-development candidates (80 credits). |
| 4 | **FD-S101-11** Authorize the generation budget? | OPEN | GENERATION_BUDGET | all generated (18) | GLOBAL | Founder authorizes an amount for SH01 references and video only after re-reading current quotes (the 255-credit figure is a 24 Oct planning estimate). |
| 5 | **FD-S101-12** Lock the teenager's four-count step? | OPEN | KEYFRAMES | SH05, SH06, SH07 | LATER_SHOT | Founder decides: Founder supplies or approves the four counts / Hold SH05 to SH07. Packet recommends: Lock the step before the SH05 start frame is generated; no shot length changes. |
| 6 | **FD-S101-05** Design of the jewel-green dress? | OPEN (STORY_CONTINUITY_APPROVED, VISUAL_DESIGN_PENDING) | KEYFRAMES | SH08, SH09, SH10, SH17, SH18 | LATER_SHOT | Founder decides: Approve from two generated candidates / Founder supplies a reference. Packet recommends: Two candidates (80 credits): a 1960s satin cocktail dress and a bias-cut evening dress. |
| 7 | **FD-S101-03** What does the Ember look like on a lens? | OPEN | KEYFRAMES | SH14 | LATER_SHOT | Founder decides: Soft copper bloom spreading from the lens / A thin copper ring around the lens / Founder supplies a reference. Packet recommends: Approve two KF-EMBER-LOOK candidates (80 credits) and choose one. |
| 8 | **FD-S101-04** Halcyon House: windows only, or supply an exterior authority? | OPEN | KEYFRAMES | SH18 | LATER_SHOT | Founder decides: Windows only (no facade, roofline or signage) / Founder supplies an exterior reference first. Packet recommends: Windows only for S1-01; design the exterior when S1-02 to S1-05 need the front steps. |
| 9 | **FD-S101-02** Music direction and composer route? | OPEN | DIRECTION | none (audio/edit) | LATER_SHOT | Founder decides: Commission a composer (cost UNKNOWN) / fal ElevenLabs music (low cost; commercial terms to review) / Founder's ElevenLabs workspace (outside this environment). Packet recommends: Commission a composer for the main theme; frame-exact hits are hard to prompt. |
| 10 | **FD-S101-10** Title card at the end? | OPEN | DIRECTION | none (audio/edit) | LATER_SHOT | Founder decides: No title card / THE EXCHANGE title over black. Packet recommends: No title card in S1-01. |
| 11 | **FD-S101-06** Approve the inhabitants' looks as planned (scene-scoped)? | ANSWERED | KEYFRAMES | — (answered) | NOT_BLOCKING | None: recorded. |
| 12 | **FD-S101-07** Is the tailor Wendell Ames? | ANSWERED | KEYFRAMES | — (answered) | NOT_BLOCKING | None: recorded. |

### Detail

#### FD-S101-01: Approve the S1-01 screenplay v2 (still DRAFT)?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-01 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots SH01, SH02, SH03, SH04, SH05, SH06, SH07, SH08, SH09, SH10, SH11, SH12, SH13, SH14, SH15, SH16, SH17, SH18, SH19. Basis: blocks SCREENPLAY, the first step; every shot is planned from screenplay v2.
- **Production impact:** Every shot, cue and keyframe is planned from v2; v1 is kept in SCREENPLAYS/HISTORY.
- **SH01:** GLOBAL, because SH01 is planned from screenplay v2; SCREENPLAY precedes every other step.
- **Next action:** Founder decides: Approve v2 / Request changes / Return to v1. Packet recommends: Approve v2: the glass is set up, the Ember is silent and Halcyon House is windows only.

#### FD-S101-09: Confirm 24 fps delivery?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-09 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots SH01, SH02, SH03, SH04, SH05, SH06, SH07, SH08, SH09, SH10, SH11, SH12, SH13, SH14, SH15, SH16, SH17, SH18, SH19. Basis: blocks DIRECTION; every event is timed in frames at 24 fps.
- **Production impact:** All timing is in frames at 24 fps, matching the recorded Kling outputs (PK-007).
- **SH01:** GLOBAL, because SH01 is 96 frames at 24 fps; the frame rate fixes every duration.
- **Next action:** Founder decides: 24 fps / 30 fps (re-time every event). Packet recommends: 24 fps.

#### FD-S101-08: How is the street seeded?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-08 (sha256 4509b8aa6672…)`
- **Affected:** keyframes KF-ENV-CITY-DUSK-A, KF-ENV-CITY-DUSK-B, KF-ENV-HALCYON-EXT, KF-SF-SH02, KF-SF-SH03, KF-SF-SH04, KF-SF-SH05, KF-SF-SH06, KF-SF-SH07, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH11, KF-SF-SH12, KF-SF-SH13, KF-SF-SH14, KF-SF-SH15, KF-SF-SH16, KF-SF-SH17, KF-SF-SH18; shots SH01, SH02, SH03, SH04, SH05, SH06, SH07, SH08, SH09, SH10, SH11, SH12, SH13, SH14, SH15, SH16, SH17, SH18. Basis: keyframe manifest effectiveBlockers: KF-ENV-CITY-DUSK-A, KF-ENV-CITY-DUSK-B, KF-ENV-HALCYON-EXT, KF-SF-SH02, KF-SF-SH03, KF-SF-SH04, KF-SF-SH05, KF-SF-SH06, KF-SF-SH07, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH11, KF-SF-SH12, KF-SF-SH13, KF-SF-SH14, KF-SF-SH15, KF-SF-SH16, KF-SF-SH17, KF-SF-SH18.
- **Production impact:** SET-CITY-DUSK has no approved reference; every frame derives from KF-ENV-CITY-DUSK-A.
- **SH01:** SH01_SPECIFIC, because it blocks KF-ENV-CITY-DUSK-A, the SH01 start frame.
- **Next action:** Founder decides: Look development: two candidates from the spec / Founder supplies a street photograph as the reference. Packet recommends: Founder photograph if one exists; otherwise two look-development candidates (80 credits).

#### FD-S101-11: Authorize the generation budget?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-11 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots SH01, SH02, SH03, SH04, SH05, SH06, SH07, SH08, SH09, SH10, SH11, SH12, SH13, SH14, SH15, SH16, SH17, SH18. Basis: blocks GENERATION_BUDGET; no job is paid for without it.
- **Production impact:** No credits are spent until the founder authorizes an amount.
- **SH01:** GLOBAL, because no credit is spent on any shot, SH01 included, until the founder authorizes an amount.
- **Next action:** Founder authorizes an amount for SH01 references and video only after re-reading current quotes (the 255-credit figure is a 24 Oct planning estimate).

#### FD-S101-12: Lock the teenager's four-count step?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-12 (sha256 4509b8aa6672…)`
- **Affected:** keyframes KF-SF-SH05, KF-SF-SH06, KF-SF-SH07; shots SH05, SH06, SH07. Basis: keyframe manifest effectiveBlockers: KF-SF-SH05, KF-SF-SH06, KF-SF-SH07.
- **Production impact:** SH05 to SH07 miss it, tangle it and land it on frame 324, and S1-51 repeats the same four counts (S-02, R-04). The step is not choreographed yet (CHOREOGRAPHY_LOCK_PENDING).
- **SH01:** LATER_SHOT, because it blocks SH05, SH06, SH07, and SH01 uses none of KF-SF-SH05, KF-SF-SH06, KF-SF-SH07.
- **Next action:** Founder decides: Founder supplies or approves the four counts / Hold SH05 to SH07. Packet recommends: Lock the step before the SH05 start frame is generated; no shot length changes.

#### FD-S101-05: Design of the jewel-green dress?

- **State:** OPEN (STORY_CONTINUITY_APPROVED, VISUAL_DESIGN_PENDING)
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-05 (sha256 4509b8aa6672…)`
- **Affected:** keyframes KF-WD-GREEN-DRESS, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH17, KF-SF-SH18; shots SH08, SH09, SH10, SH17, SH18. Basis: keyframe manifest effectiveBlockers: KF-WD-GREEN-DRESS, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH17, KF-SF-SH18.
- **Production impact:** It appears in four shots and the rise; it needs one fixed design (U-4).
- **SH01:** LATER_SHOT, because it blocks SH08, SH09, SH10, SH17, SH18, and SH01 uses none of KF-WD-GREEN-DRESS, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH17, KF-SF-SH18.
- **Next action:** Founder decides: Approve from two generated candidates / Founder supplies a reference. Packet recommends: Two candidates (80 credits): a 1960s satin cocktail dress and a bias-cut evening dress.

#### FD-S101-03: What does the Ember look like on a lens?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-03 (sha256 4509b8aa6672…)`
- **Affected:** keyframes KF-EMBER-LOOK, KF-SF-SH14; shots SH14. Basis: keyframe manifest effectiveBlockers: KF-EMBER-LOOK, KF-SF-SH14.
- **Production impact:** It holds for the season and must never be mistaken for the gold yes revealed in S1-58.
- **SH01:** LATER_SHOT, because it blocks SH14, and SH01 uses none of KF-EMBER-LOOK, KF-SF-SH14.
- **Next action:** Founder decides: Soft copper bloom spreading from the lens / A thin copper ring around the lens / Founder supplies a reference. Packet recommends: Approve two KF-EMBER-LOOK candidates (80 credits) and choose one.

#### FD-S101-04: Halcyon House: windows only, or supply an exterior authority?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-04 (sha256 4509b8aa6672…)`
- **Affected:** keyframes KF-ENV-HALCYON-EXT; shots SH18. Basis: keyframe manifest effectiveBlockers: KF-ENV-HALCYON-EXT.
- **Production impact:** No approved exterior exists and the sprint forbids inventing one.
- **SH01:** LATER_SHOT, because it blocks SH18, and SH01 uses none of KF-ENV-HALCYON-EXT.
- **Next action:** Founder decides: Windows only (no facade, roofline or signage) / Founder supplies an exterior reference first. Packet recommends: Windows only for S1-01; design the exterior when S1-02 to S1-05 need the front steps.

#### FD-S101-02: Music direction and composer route?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-02 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots none. Basis: blocks DIRECTION through the music cues MX01, MX02, MXS1 and MX03; no picture depends on it.
- **Production impact:** The cue arc and hit points are planned; who composes it decides cost, rights and how exactly it hits frame 324, 684 and 990.
- **SH01:** LATER_SHOT, because audio only: SH01 picture does not depend on the score. It blocks a scene-wide DIRECTION authorization, not one scoped to S1-01/INTENT and SH01.
- **Next action:** Founder decides: Commission a composer (cost UNKNOWN) / fal ElevenLabs music (low cost; commercial terms to review) / Founder's ElevenLabs workspace (outside this environment). Packet recommends: Commission a composer for the main theme; frame-exact hits are hard to prompt.

#### FD-S101-10: Title card at the end?

- **State:** OPEN
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-10 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots none. Basis: blocks DIRECTION; concerns the end of the release after SH19 (edit only).
- **Production impact:** The release ends on a ringing chord over black.
- **SH01:** LATER_SHOT, because end card only; nothing generated depends on it.
- **Next action:** Founder decides: No title card / THE EXCHANGE title over black. Packet recommends: No title card in S1-01.

#### FD-S101-06: Approve the inhabitants' looks as planned (scene-scoped)?

- **State:** ANSWERED. Answer: RECURRING (founder, 2026-10-25): the tailor, the grandmother and the teenager keep reusable recurring-background identities; the woman on the balcony and the neighbour stay scene-scoped.
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-06 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots none. Basis: no keyframe or step depends on it.
- **Production impact:** Ages, looks and clothes are directorial interpretation; none of the five gets a permanent package.
- **SH01:** NOT_BLOCKING, because the founder has answered it.
- **Next action:** None: recorded.

#### FD-S101-07: Is the tailor Wendell Ames?

- **State:** ANSWERED. Answer: No: an unnamed tailor (ANONYMOUS, founder, 2026-10-25). The shop sign stays unreadable.
- **Source:** `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json#FD-S101-07 (sha256 4509b8aa6672…)`
- **Affected:** keyframes none; shots none. Basis: no keyframe or step depends on it.
- **Production impact:** Yes makes him a recurring character whose identity reference must exist before S1-01 frames are generated.
- **SH01:** NOT_BLOCKING, because the founder has answered it.
- **Next action:** None: recorded.

## 2. Authorization steps (packet section 10)

| Step | State | Prerequisite | What it approves |
| --- | --- | --- | --- |
| SCREENPLAY | PENDING | none | S1-01/SCREENPLAY |
| DIRECTION | PENDING | SCREENPLAY | INTENT, SHOT, MUSIC_CUE and SOUND_CUE elements in scope |
| KEYFRAMES | PENDING | DIRECTION | KEYFRAME, ENVIRONMENT and WARDROBE elements in scope (each must be approved first) |
| GENERATION_BUDGET | PENDING | KEYFRAMES | BUDGET element; reference and keyframe jobs (scope enforced) |
| PRODUCTION | PENDING | GENERATION_BUDGET | video jobs for shots in scope (scope enforced) |

Each step may be scoped. A scoped step satisfies the next step's prerequisite. Every generation job still needs its own target element approved, so a scope covering SH01 opens no other shot.

## 3. Review elements

| Type | Total | Pending | Approved |
| --- | --- | --- | --- |
| SCREENPLAY | 1 | 1 | 0 |
| INTENT | 1 | 1 | 0 |
| SHOT | 19 | 19 | 0 |
| KEYFRAME | 22 | 22 | 0 |
| MUSIC_CUE | 4 | 4 | 0 |
| SOUND_CUE | 13 | 13 | 0 |
| ENVIRONMENT | 2 | 2 | 0 |
| WARDROBE | 2 | 2 | 0 |
| BUDGET | 1 | 1 | 0 |

## 4. SH01 dependency split (§23)

The 255-credit figure is the 24 October planning estimate (L-01 80 cr, L-02 175 cr). It is not a current quote.

### 4.1 Global production blockers: shared by SH01 and every other shot

| Item | Kind | State | Why |
| --- | --- | --- | --- |
| FD-S101-01 Approve the S1-01 screenplay v2 (still DRAFT)? | FOUNDER_DECISION | OPEN | SH01 is planned from screenplay v2; SCREENPLAY precedes every other step |
| FD-S101-09 Confirm 24 fps delivery? | FOUNDER_DECISION | OPEN | SH01 is 96 frames at 24 fps; the frame rate fixes every duration |
| FD-S101-11 Authorize the generation budget? | FOUNDER_DECISION | OPEN | no credit is spent on any shot, SH01 included, until the founder authorizes an amount |
| SCREENPLAY step | AUTHORIZATION_STEP | PENDING | first step; release-wide (approves S1-01/SCREENPLAY) |
| DIRECTION step (at least S1-01/INTENT and S1-01-SH01) | AUTHORIZATION_STEP | PENDING | KEYFRAMES needs DIRECTION; S1-01/INTENT is the release intent every shot shares. A scene-wide DIRECTION also needs FD-S101-02 and FD-S101-10 |
| Spine budget BUDGET-S1-01-SH01-PILOT authorized by the founder | SPEND | PLANNING_ESTIMATE_ONLY | the spend gate refuses any job with no authorized budget |
| Durable record store deployed (migration 20261026100000, staging then production) | INFRASTRUCTURE | NOT_DEPLOYED | production decisions must not land in the read-only repository catalogue |
| Private media bucket site00-production-masters live and verified | INFRASTRUCTURE | NOT_DEPLOYED | a take master has nowhere durable and private to go until then |
| Provider execution route (OpenArt) for the deployed API | INFRASTRUCTURE | BLOCKED | the deployed app has no OpenArt credential or executor; the agent-session connector is the founder’s, not the server’s |

### 4.2 SH01-specific blockers

| Item | Kind | State | Why |
| --- | --- | --- | --- |
| FD-S101-08 How is the street seeded? | FOUNDER_DECISION | OPEN | it blocks KF-ENV-CITY-DUSK-A, the SH01 start frame; it is also the root of 17 later shots |
| S1-01-SH01 shot element approved | ELEMENT | PENDING | the scene gate checks the target shot element |
| KF-ENV-CITY-DUSK-A spec approved | ELEMENT | PENDING | the reference job targets this element |
| S1-01/ENV/SET-CITY-DUSK approved | ELEMENT | PENDING | environment element in the KEYFRAMES step for the street |
| KEYFRAMES step scoped to KF-ENV-CITY-DUSK-A and S1-01/ENV/SET-CITY-DUSK | AUTHORIZATION_STEP | PENDING | GENERATION_BUDGET needs KEYFRAMES; a scoped authorization leaves the dress, Ember, Halcyon and teenager keyframes untouched |
| GENERATION_BUDGET step scoped to KF-ENV-CITY-DUSK-A | AUTHORIZATION_STEP | PENDING | reference image jobs need it; the scene gate now enforces its scope |
| Reference image: founder photograph, or 2 look-development candidates (REF-01, REF-02) | ASSET | NOT_CREATED | SH01 is image-to-video from KF-ENV-CITY-DUSK-A |
| Founder approves the reference (APPROVE_REFERENCE) | APPROVAL | PENDING | the start frame is bound to the video job by its hash; changing it voids the job authorization |
| PRODUCTION step scoped to S1-01-SH01 | AUTHORIZATION_STEP | PENDING | the scene gate refuses a video job outside the production scope |
| Current quotes read within 24 h for each SH01 job | SPEND | STALE (24 Oct planning quotes) | the spend gate refuses a quote older than the limit (QUOTE_STALE) |
| Founder authorization of JOB-S1-01-SH01-VIDEO-01 (one attempt, ceiling, expiry) | SPEND | DRAFT | one authorization buys one attempt of exactly this request |

### 4.3 Later S1-01 shot blockers: not required for SH01

| Decision | State | Shots | Why SH01 does not need it |
| --- | --- | --- | --- |
| FD-S101-12 | OPEN | SH05, SH06, SH07 | it blocks SH05, SH06, SH07, and SH01 uses none of KF-SF-SH05, KF-SF-SH06, KF-SF-SH07 |
| FD-S101-05 | OPEN (STORY_CONTINUITY_APPROVED, VISUAL_DESIGN_PENDING) | SH08, SH09, SH10, SH17, SH18 | it blocks SH08, SH09, SH10, SH17, SH18, and SH01 uses none of KF-WD-GREEN-DRESS, KF-SF-SH08, KF-SF-SH09, KF-SF-SH10, KF-SF-SH17, KF-SF-SH18 |
| FD-S101-03 | OPEN | SH14 | it blocks SH14, and SH01 uses none of KF-EMBER-LOOK, KF-SF-SH14 |
| FD-S101-04 | OPEN | SH18 | it blocks SH18, and SH01 uses none of KF-ENV-HALCYON-EXT |
| FD-S101-02 | OPEN | none (audio/edit) | audio only: SH01 picture does not depend on the score. It blocks a scene-wide DIRECTION authorization, not one scoped to S1-01/INTENT and SH01 |
| FD-S101-10 | OPEN | none (audio/edit) | end card only; nothing generated depends on it |

- **The dress design (FD-S101-05)** reaches SH08 to SH10, SH17 and SH18 through KF-WD-GREEN-DRESS. SH01 uses only KF-ENV-CITY-DUSK-A.
- **The teenager's four-count (FD-S101-12)** reaches SH05 to SH07 through KF-SF-SH05.
- **Neither is required for SH01.** Both still use the street that FD-S101-08 seeds, so answering FD-S101-08 first unblocks both lines later.

### 4.4 Already answered

| Decision | Answer |
| --- | --- |
| FD-S101-06 | RECURRING (founder, 2026-10-25): the tailor, the grandmother and the teenager keep reusable recurring-background identities; the woman on the balcony and the neighbour stay scene-scoped. |
| FD-S101-07 | No: an unnamed tailor (ANONYMOUS, founder, 2026-10-25). The shop sign stays unreadable. |
