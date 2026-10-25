# 01 — Executive competitive workflow review

Sprint `P0.SITE00.STUDIOWORLD.CHARACTER-STUDIOS-TO-DIRECTOR-COMPOSER.INTEGRATION-AUDIT.V1`. Read-only audit of `yoteenz/SITE00` at `origin/main` 159c0fa9 plus THE EXCHANGE stack (PRs #1690, #1692, #1693, #1694, all open). Nothing was changed, generated or spent.

Part 1 is the founder review (sprint §30). Parts 2 and 3 are the workflow comparison (§05) and the two actor paths (§06). Evidence for every claim is in deliverables 02 to 21.

**Source limits.** The Elsewhere site and the Instagram reel could not be opened from this environment (DNS lookup fails), and the founder's screen recording is not in the workspace. Elsewhere is described only from its own indexed marketing text and from the founder's observations, each labelled (deliverable 02).

---

## Part 1 — Founder review

### 1. What Elsewhere does well

From its own published text, three things:

- **Identity once, reused everywhere.** "Train your own brand model once and reuse the same face and look across every campaign."
- **A reference becomes direction.** Its Echo feature reads an image's lighting, mood and style and writes the prompt.
- **Cost is visible up front,** in one credit currency across several video models (Elsewhere Motion, Kling 3.0, Seedance 2.5 and 2.0).

You also saw a storyboard step, look, shot and camera controls, and duration, resolution and aspect settings. This audit could not see those.

The lesson is the order of work: the person picks who and how, and the tool carries everything else forward.

### 2. What Character Studios already does better

- **It keeps identity layers separate.** Actor, Character, Look, temporal look and shot casting are separate types, so one actor can play many characters without the face being rewritten. Tests cover this (`p0StudioWorldActorCatalogueCasting1`, 17 tests).
- **It reuses before it creates.** The casting logic refuses to create a new actor when a catalogue match exists.
- **Approvals invalidate downstream work.** Fabrication locks the body and invalidates later stations when it changes. THE EXCHANGE's review state invalidates dependent shots when you request a change.
- **It plans like a film, not a prompt.** THE EXCHANGE engine plans:
  - motion-weighted shot lengths (complex movement 1–3 s);
  - a frame-exact 24 fps timeline on eight tracks;
  - coverage classes, so continuous dialogue can cut to reactions and inserts;
  - keyframe reuse;
  - per-shot quotes;
  - five founder authorization steps.

  Nothing in Elsewhere's published text claims this.

### 3. What our system can actually do today

**Works:**
- Image generation through fal runs from the backend. Entry 002 keyframes ran on 2026-09-07 with real request IDs.
- OpenArt images are made by agents and registered in ledgers (JURNL).
- You ran Kling 4 video and Kling lip-sync in OpenArt's own interface for KAI'S NOTE (production test only).
- THE EXCHANGE plans S1-01 completely as data: 19 shots, 1,080 frames, 22 keyframes and a 3,400-credit budget, all validated.

**Does not work:**
- SITE 00 cannot start a video generation.
- It cannot record a take.
- It cannot store approved footage.
- It cannot export a timeline.

### 4. What exists only as architecture

- Studio World's catalogue is seven hard-coded actors with no images.
- Character Fabrication saves only in your browser.
- The live digital-human runtime has run only against a mock; the Unreal host is blocked on your local machine.
- FILM dailies judge simulated clips held in memory.
- The edit decision list cannot render.
- The Kling 4 adapter on PR #1683 never submits.
- The ElevenLabs voice IDs are stored but unverified by the repository.
- No table exists for actors, characters, looks, scenes, shots, takes or edits.

### 5. The missing handoffs

| From | To | What is missing |
| --- | --- | --- |
| Character Studios | Composer | THE EXCHANGE cast does not read the catalogue, and the catalogue has no stored images (G-ID-01, G-ID-02). |
| Look | Shot | No versioned Look you can pick, and no approved principal wardrobe yet (G-LOOK-01, G-LOOK-04). |
| Reference | Job | References have no purpose, so a lighting image could be bound as a face (G-REF-01). |
| Plan | Provider | No job runner. Results are copied back by hand (G-GEN-01). |
| Provider | Take | No take record and no permanent copy (G-TAKE-01, G-ASSET-01). |
| Take | You | No dailies surface. The approved takes screen exists but is empty (G-TAKE-02). |
| Voice | Lip-sync | No recorded dialogue master. The KAI'S NOTE audio origin is unknown (G-AUD-02). |
| Takes | Editor | No timeline export and no edit versions (G-EDIT-01). |

### 6. The five most important improvements

1. **Record every generation as a Take**, with a runner that writes its provider, inputs, cost and output back to the shot (G-GEN-01, G-TAKE-01).
2. **Copy approved files into SITE 00 storage** with a hash, in a private bucket (G-ASSET-01, G-ASSET-02).
3. **Enforce authorization where the job starts,** and close the two paths that can spend without a gate (G-COST-02, G-COST-03).
4. **Mount dailies in the existing EXPRESSION takes screen** and establish THE EXCHANGE there (G-TAKE-02, G-WS-01).
5. **Make scenes remember the cast.** That needs one canonical actor registry, versioned Look presets, typed references, and scene context resolved for any project (G-ID-03, G-LOOK-01, G-REF-01, G-SCENE-01).

### 7. The recommended Director Composer experience

Work from the scene storyboard. Opening a shot shows it already assembled:
- cast and Look;
- set and lighting state;
- start frame (reused when one exists);
- screen time and generation length;
- route, quote and authorization state.

You change only what happens, how it should feel and how the camera sees it. Model, references and cost detail live in an inspector.

Generate shows the quote before it runs. Takes arrive in the existing EXPRESSION takes screen, where you can approve, revise, reject, hold or select for edit. Decisions appear in INBOX, jobs in ACTIVITY, and approved footage in LIBRARY.

No new navigation tab, no page scrolling, rectangular controls. Detail: deliverable 08.

### 8. The smallest path to real footage

**Use S1-01.** It has no principal cast on screen and no dialogue: 18 silent-action shots and 1 transition. That avoids the identity, wardrobe and voice blockers.

**First take: SH01, the establishing shot.**
- It needs one founder decision beyond the screenplay: FD-S101-08, the city reference.
- It is untouched by the S1-01 patch plan.
- Its start frame is the city reference itself.

**Second pilot: SH05 then SH07.** It proves frame reuse. It waits until you accept the S1-01 patch plan, because PATCH-S101-01, -02 and -05 touch these shots and the teenager's four-count step is still to be choreographed.

| Step | What happens | Cost (committed quotes) |
| --- | --- | --- |
| Approve | Screenplay (FD-S101-01), city reference (FD-S101-08), generation for SH01 (FD-S101-11) | — |
| Build | Phase 1 in deliverable 20: job record, take list, permanent copy, enforced authorization, minimal dailies | — |
| SH01 references | Two city reference candidates (also SH01's start frame) | 80 credits |
| SH01 video | The SH01 video (5 s for 4 s on screen) | 175 credits |
| Approve SH01 | One SH01 take approved and stored | — |
| Then SH05 references | Second city reference and two SH05 start-frame candidates | 120 credits |
| Then SH05 video | The SH05 video (3 s) | 105 credits |
| SH07 start frame | Extracted from the approved SH05 take's last frame | 0 credits |
| SH07 video | The SH07 video (4 s) | 140 credits |

**Totals before retakes:**
- SH01 alone: about 255 credits;
- both pilots: about 620 credits;
- quoted balance (2026-10-24): 10,031 credits.

The SH07 walkthrough is deliverable 21.

### 9. The risks

- **Spend leaks.** Two existing paths can spend without a gate. Fix them first (G-COST-03).
- **Wrong identity.** Nine registries overlap, and SW-008 names two different people (G-ID-03).
- **Lost footage.** Provider URLs are the only copy today.
- **Database uncertainty.** The production database has not answered agents since 2026-10-02, so schema work must start with a read-only check (G-DATA-03).
- **Exposure.** Two tables have a policy that applies to every role (G-DATA-02).
- **Stack order.** THE EXCHANGE engine sits on four unmerged PRs. Generalizing it before they merge would fork it.
- **Overbuilding.** A full editor or live digital human before the first approved take would delay footage. Both stay later and optional.

### 10. What needs your approval

The decision board is deliverable 22. The first decisions are:

- the order of the roadmap;
- where generation runs: an agent session using OpenArt, a backend adapter, or the Artlist connector;
- where records and masters live: repository JSON or Supabase, and which bucket;
- which actor registry is canonical;
- whether THE EXCHANGE's principals become catalogue Actors;
- establishing THE EXCHANGE in EXPRESSION;
- the editor you will conform in;
- the S1-01 approvals listed in point 8, and when to accept the S1-01 patch plan.

---

## Part 2 — Workflow comparison (sprint §05)

**Today's manual count for one shot:** about twelve actions across three tools.
1. Read the shot in the packet.
2. Find the reference files.
3. Upload them to OpenArt.
4. Write the prompt.
5. Set the model, duration and resolution.
6. Check credits.
7. Generate.
8. Review in OpenArt.
9. Note the output.
10. Have an agent copy the record.
11. Record a decision (no surface exists).
12. Import into an editor.

Elsewhere's action count is not known: the audit could not watch its workflow.

| Stage | Equivalent today | Operational | Context carried forward | Repeat information | Approved references reused | Linked to project | Returns to scene | Approve or reject a take | Provenance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Select model (actor) | Studio World catalogue (seed); CAST NDX (NDXBOOK only); THE EXCHANGE cast registry | Partly: CAST NDX code runs; the catalogue has no images | No: three separate registries | Yes | NDX only | NDX run records only | No | No | Exchange registry hashes face masters |
| Select or define look | EXPRESSION Look family over static data; fabrication Look station (browser only); Exchange wardrobe all DESIGN_REQUIRED | No | No | Yes, per prompt | No | No | No | No | No |
| Create shot / storyboard | Exchange shot planner (S1-01, 19 shots); EXPRESSION storyboard (NDXBOOK Entry 002); FILM planner (memory) | Exchange: data and validation only, no UI | Within Exchange, yes | No, within Exchange | Keyframe reuse planned | Exchange records | Plan only | Per-shot decision, not per take | Plan is versioned in git |
| Choose cinematic direction | Exchange camera, coverage, spatial and performance fields; EXPRESSION sets/camera | Data only | Within Exchange | No | n/a | Yes, as data | Plan only | n/a | Yes, in git |
| Select model and output settings | Exchange routes (OpenArt nano-banana-pro, kling-3-omni); FILM router; Expression routing recommends only | No selector | Route fixed per job kind | No | n/a | n/a | n/a | n/a | Route ID recorded |
| Review cost | Exchange per-shot quotes, ceiling and balance (quoted by hand); FILM static prices | Data only; no UI; no live price | Yes, in the packet | No | n/a | Yes | n/a | n/a | Quotes dated |
| Generate | None for video in SITE 00. fal images from the backend. OpenArt by agent or founder by hand | Images yes; video no | No | Yes, every time | By hand | By hand | By hand | n/a | By hand |
| Review output | Exchange per-element decisions; FILM dailies (simulated); EXPRESSION takes (empty) | No | No | n/a | n/a | No | No | No take entity | No |

**Fragmentation found:**
- nine actor or character sources;
- seven provider routers;
- four spend gates that disagree;
- about thirteen job or asset stores;
- workspace decisions kept in browser storage;
- four character and film pages outside the production frame (`/projects/:p/character/casting`, `/character/continuity`, `/content-operations/film-production`, `/campaign-director`).

**Missing interaction states:**
- a take list per shot;
- HOLD and SELECT FOR EDIT;
- job in flight, failed and retried;
- quote stale;
- budget exceeded;
- route unavailable in this environment;
- reference purpose conflict;
- provider URL expired;
- approved file stored.

THE EXCHANGE already has "upstream changed, downstream invalidated".

**Where manual work can go:**
- results written back by the runner;
- start frames reused from approved takes;
- scene context resolved once per scene;
- Look presets instead of wardrobe prose;
- quotes computed at plan time;
- one dailies list.

**What must not be simplified away:**
- the five founder authorization steps;
- Actor and Character separation;
- motion-weighted shot lengths;
- invalidation on change;
- the rule that a provider file is not an approval.

## Part 3 — The two actor paths (sprint §06)

| Path A step | Exists | Status |
| --- | --- | --- |
| Actor identity | Catalogue types; CAST NDX locks; Exchange face masters | Partly: images exist only for NDX (Supabase) and Exchange (repository) |
| Character assignment | `ProductionCharacter.actorId`; Exchange cast registry | Types and repository JSON |
| Approved Look | `CharacterCampaignLook` (unversioned) | Types only |
| Scene references | Exchange scene packet | Exchange only |
| Keyframe / storyboard | Exchange keyframe manifest; Entry 002 keyframes | Planned (Exchange); one live image run (NDXBOOK) |
| Video generation | None in SITE 00 | Manual in OpenArt |
| Performance / lip-sync | None in SITE 00 | Manual in OpenArt (1 of 3 runs completed) |
| Approved take | None | — |
| Scene assembly | Exchange multitrack plan | Manual editor |

| Path B step | Exists | Status |
| --- | --- | --- |
| Digital-human geometry | None (`rigAuthorityId` null) | NOT_FOUND |
| Appearance configuration | Fabrication stations | Browser only |
| Rig / animation | Motion fixtures | Fixtures |
| Runtime integration | Manifest, protocol, WebSocket adapter | Mock only |
| Interactive performance / capture | Capture-rig presets; Unreal host | BLOCKED on the founder's local machine |

**Shared identity record.** `ActorIdentityAuthority` (immutable views) is the shared root. The runtime's `CharacterAssemblyManifest` carries `approvedAuthorityId` and lineage back to it. Approved face masters, body versions and Looks can serve both paths.

**Path A needs nothing from path B.** Every path A acceptance test in deliverable 20 runs with path B absent (G-DH-01 is P3).
