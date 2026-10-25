# 08 — Unified Director Composer UX recommendations

These are recommendations only. No UI is changed and no final design is proposed.

What Elsewhere teaches (deliverable 02) is applied as principles, not as its look:
- pick who once;
- carry it forward;
- show the cost before running.

## 1. Where the Composer belongs

EXPRESSION already owns the production families the Composer needs (`src/site00/components/productionAuthority/expression/expressionRoutes.ts`, 40 routes, each with an approved authority reference):

| Existing family | Routes | Composer use |
| --- | --- | --- |
| Casting | roles, actors, characters, continuity, actor and character profiles | Read cast; change cast here, not in the Composer |
| Look + Wardrobe | looks, outfits, hair, makeup, accessories, fittings, continuity | Read Looks; edit Looks here |
| Cast + Performance | scenes, beats, **takes** | Scene entry; **dailies** (takes screen exists, renders UNMOUNTED) |
| Sets + Scenes | environments, sets, zones, props, graphics, camera | Read set, zone, props; camera presets |
| Storyboard | root, sequence detail, keyframes | **The Composer's home**: work from the scene storyboard |
| Review + Handoff | root, approval detail | Authorization steps and budget approval |

**Recommendation.**
- Do not add a navigation tab or a separate top-level route.
- The Composer is the storyboard family plus one new detail route for a single shot: `/production/:p/expression/storyboard/shot/:id`. It resolves through `resolveExpressionRoute` and inherits the internal guard, `ExpressionDomainGate` and the no-scroll frame contract.
- Dailies use the existing `performance/takes` route.
- Only the shot detail is a genuinely missing surface. It needs a new visual authority exploration (D-12). Nothing else is redesigned.

## 2. Ownership boundaries (sprint §09 and §28)

| Owner | Owns | Lives in |
| --- | --- | --- |
| Character Studios | Actor, Character, assignment, Look versions, identity pack, voice association, fabrication | EXPRESSION Casting, Look, Character Fabrication |
| Director Composer | Scene context resolution, shot plan, camera, reference resolution, jobs, routing, continuity checks, dialogue visibility, audio alignment, takes, assembly export | EXPRESSION Storyboard (shot detail) and Performance (takes); services from the directorial engine (deliverable 06 §3) |
| Directorial engine | Headless planning and validation: motion, timeline, coverage, keyframes, review gates, budget | Shared service, no UI of its own |
| Shared inspector | Advanced detail: references by purpose, model and settings, cost breakdown, provenance | Reuse `NodeInspector` and `buildInspectorView` (`productionHub/panels.tsx`, `inspectorContent.ts`) |
| Production Asset Registry | Asset identity, permanent copies, hashes, lineage, reuse eligibility, storage | Backend; surfaced in LIBRARY |
| Studio World | Project context, navigation, INBOX (decisions), ACTIVITY (jobs and events), LIBRARY (approved assets) | Existing frame |

## 3. Composer controls (sprint §09 list)

| Control | Where | Default comes from | Founder edits? |
| --- | --- | --- | --- |
| Current project | Existing project switcher | Workspace scope | Yes |
| Current episode (release) | Scene selector header | Active production unit | Yes |
| Current scene | Scene selector (reuse `SceneSelector`) | Scene index | Yes |
| Actor / character | Read-only chip on the shot | Scene context | In Casting |
| Approved Look | Read-only chip with version | Scene context | In Look |
| Environment | Read-only chip (set, zone, lighting state) | Scene context | In Sets |
| Storyboard | Primary stage | Keyframe manifest | Select a frame |
| Shot type, camera angle, camera movement | Primary shot controls | Shot plan | **Yes, primary** |
| Performance | Primary text field | Shot plan | **Yes, primary** |
| Dialogue | Read-only line list with visibility class | Screenplay and coverage | In the screenplay step |
| Reference assets | Inspector, grouped by purpose | Reference resolution | Swap with reason |
| Generation model | Inspector | Route for the job kind | Yes, among routes that pass a runtime check |
| Duration | Inspector, showing screen time against generation length | Motion class plus handle | Yes, within route limits |
| Aspect ratio, resolution | Inspector | Project format (S1-01: 9:16) | Rarely |
| Credit estimate | Always visible beside Generate | Quote | No |
| Generate | Action bar | — | Enabled only when authorized |
| Review take | Takes screen, plus the latest take inline | — | Yes |

**Rule from sprint §19: no control without working backend behaviour.** Until a phase delivers a control's backend:
- Generate, Approve and Select for edit show their state as text (for example "Not authorized: GENERATION_BUDGET pending").
- They are not shown as working buttons.
- The existing `Btn` primitive already takes `disabled` and `reason` (`ExpressionFamilyShell.tsx:425`), so this needs no new component.

## 4. Progressive disclosure

1. **Stage (always).** The storyboard frame or take, what happens, how it should feel, camera, credit estimate, Generate.
2. **Inspector (on demand).** References by purpose with source and status, model and settings, cost breakdown, continuity checks.
3. **Record (elsewhere).** Job log in ACTIVITY, decisions in INBOX, approved files in LIBRARY.

The founder never sees all eight tracks, all routes or the dependency graph at once. Each stays one tap away, where it belongs.

## 5. The founder flow (sprint §22), in three surfaces instead of eleven

| Sprint step | Surface |
| --- | --- |
| Select project, select scene | Storyboard root (scene selector) |
| Select approved cast, confirm Look and environment | Scene header chips (read from Casting, Look, Sets) |
| Review directorial shots, select shot | Storyboard root (frame strip; reuse `Filmstrip`) |
| Adjust camera, performance, settings; review cost; generate | Shot detail (stage plus inspector) |
| Review take, approve for edit | Takes (performance family) |

## 6. Interaction states to design

- Scene context incomplete (lists what is missing and where to fix it).
- Reference purpose conflict.
- Keyframe blocked (with the upstream reason, already computed by `effectiveBlockers`).
- Quote missing or stale.
- Step not authorized.
- Over budget.
- Route not available here.
- Job queued, running, failed (retryable or final) or succeeded.
- Take received but not stored.
- Take stored.
- Take decided.
- Upstream changed so the take is invalidated (`requestChange` already computes this).

## 7. Visual rules

- No page scroll. Lists and the inspector scroll internally (`[data-scroll="internal"]`), following the expression-family contract (`.pxa[data-screen^='expression-'] .pxa-scroll { overflow: hidden }`).
- Rectangular controls from the existing `Btn` and `Actions` primitives in `ExpressionFamilyShell.tsx`. No circular primary buttons (the visual-authority gate, #18).
- No generic dashboard composition or card stacks (gate #11, #12). The stage shows the scene's images, not metrics.
- Media panels declare `data-media-slot` and `data-media-fit`, per the density rules.

## 8. Recommendations with owner, dependency and acceptance

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| U-01 | Composer as storyboard family plus a shot-detail route; no new tab | Studio World | D-07, G-WS-01 | Route resolves under the existing guard; navigation unchanged; route tests pass at 5 viewports with no page scroll |
| U-02 | Dailies in `performance/takes` | Studio World | G-TAKE-01 | The UNMOUNTED empty state is replaced by persisted takes |
| U-03 | Scene header chips read from Casting, Look and Sets | Director Composer | G-SCENE-01 | For S1-01 every chip shows source and status with no typed input |
| U-04 | Inspector grouped by reference purpose | Director Composer | G-REF-01 | Each bound reference shows purpose, registry ID, status and hash |
| U-05 | Credit estimate always beside Generate; Generate gated by authorization | Director Composer | G-COST-02 | The control states the blocking step until authorized; after a job, actual credits replace the estimate |
| U-06 | Show state as text where no backend exists yet | Studio World | none | No enabled control whose action has no backend |
| U-07 | Visual authority exploration for the shot detail only | Studio World | D-12 | Founder approves 3 viewport authorities before any build |
