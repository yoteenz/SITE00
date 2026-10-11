# Hybrid Spatial Studio — recovery, reconciliation and founder preview V1

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-OPUS-BRANCH-RECONCILIATION-AND-FOUNDER-LIVE-PREVIEW1` · OPUS
**Mode:** recovery and integration. No redesign; no new concepts.
**Founder approval:** **PENDING.** Known imperfections are kept visible for founder review.

---

## 1. Recovery inventory

| Item | Original (`claude/digital-foundation-authority-audit-8d42xk`) | Recovered on `claude/bldr-studio-reconciliation-8d42xk` |
|---|---|---|
| Visual implementation | `e32e67e2`, then rebound onto Composer's contracts in `c5e604e5` (PR #1524, draft, superseded by this branch) | ✅ All of `src/site00/builder-studio/**` |
| Three.js Build Object | `buildObject/engine.ts`, `composition.ts`, `BuildObjectStage.tsx` | ✅ Recovered; one rendering fix (§5) |
| Rooms 01–04, Blueprint, shell, menu, icons, styles | `rooms.tsx`, `BlueprintRoom.tsx`, `BuilderStudio.tsx`, `site00-builder-studio.css` | ✅ Recovered; two small fixes (§5) |
| Fonts (Anton, Inter, OFL) | `public/site00/fonts/{anton,inter}/` | ✅ |
| Original screenshots and reference comparisons | `hybrid-spatial-studio/screenshots/`, `comparisons/`, `functional-qa-results.json` | ✅ All present (historic evidence for `e32e67e2`) |
| Founder-review QA evidence | `hybrid-spatial-studio/founder-review-qa/` | ✅ |
| Grok asset manifest | `hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md` | ✅ Preserved |
| Docs | `HYBRID_SPATIAL_STUDIO_V1.md`, `HYBRID_SPATIAL_STUDIO_FOUNDER_REVIEW_V1.md`, summary, gap report | ✅ |
| `useStudioDraft`, `submitBlueprint.ts`, `/bldr/builder` route | Device-local save and simulated submission (`e32e67e2`) | **Intentionally not recovered.** Replaced by Composer's `useBuilderSpatialIntakeSession` and `submitForReview`. |
| Digital Foundation audit doc | On the old branch | Not carried; unrelated to this sprint |

**Method:**

- A **new branch from `main` @ `d76723b0`** (PR #1523 is newer than the reported `1da72cea`).
- The recovered paths are checked out from `c5e604e5`, so nothing old is merged wholesale.
- Composer's newer files are kept exactly as on `main`:
  - #1523 contract reconciliation report
  - Opus integration map
  - handoff docs
  - preview run script
  - motherboard memory
- Nothing on `main` was reset or force-pushed.

## 2. Contract reconciliation (Composer authority kept)

| Concern | Current `main` contract | Studio usage |
|---|---|---|
| Session | `useBuilderSpatialIntakeSession()` | Single source (adapter `useStudioSession` adds presentation only) |
| State | `SpatialBuilderState` | Rooms read and write it; no second state model |
| Selection, Blueprint, readiness | `spatialSelectionToBuilder`, `snapshotFromSpatialState` | Consumed; not re-derived |
| Estimator | `builderEstimateView` via the snapshot | Figures shown verbatim (Q07–Q09) |
| Save / resume | Intake autosave, `?intakeId=` hydration, local cache | SAVED only after server confirmation (Q01, Q12, Q13) |
| Submission | `submitForReview()` → `submitIntake`, versioned payload | Real API (Q15–Q17) |
| Route | `/bldr/studio` (founder URL) | `/bldr/studio/:room` (rooms as sub-paths). The scaffold presentation was replaced, per Composer's handoff. |

**Incompatible interfaces (documented, not forced):**

- The CUSTOM path cannot be submitted (contract `BLUEPRINT_INCOMPLETE`). See R-01 in the founder-review doc.
- FEEL has four directions.
- STRUCTURE is fixed by path.
- SEO and analytics are not in the selection.
- **New this sprint:** BLOG maps to the same capability as PAGES (`EDIT_CONTENT`), so adding BLOG changes neither the Blueprint nor the estimate. Seen live in Q09. **FOUNDER DECISION REQUIRED.**

Composer-owned hook fixes carried from #1524 (please review):

- `flushAutosave` returns success.
- Submit stops after a failed flush.
- START OVER re-bootstraps.
- StrictMode bootstrap completes.

## 3. Verification on the reconciled branch

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| vitest (Composer's suggested set + studio) | ✅ 10 files, 105 tests. Covers `builder-experience/`, `site00BuilderSpatial/`, `api/site00/intakes.test.ts`, `site00Intakes/`, `builder-studio/`. |
| `vite build` (production) | ✅ `vendor` unchanged (461 kB); `three` stays a separate lazy chunk (530 kB / 133 kB gzip) |
| Flags off (production build) | ✅ `/bldr/studio/*` and `?intakeId=` redirect to `/bldr`; zero intake API calls |
| Live browser QA, tunnel dev-mode equivalent | ✅ **20/20**: `recovery-preview-qa/recovery-qa-results.json` |
| Founder loop QA (previous sprint, same code) | ✅ 32/32: `founder-review-qa/founder-loop-results.json` |

**Live QA setup** (`scripts/site00/builder-studio-qa/preview-recovery.cjs`): Vite dev with `SITE00_INTAKES_USE_MEMORY=1` and both Builder flags. This is the same configuration the founder tunnel's dev mode runs (`run-site00-cloud-preview-server.sh`). The browser calls the dev server's own in-process `/api/site00/intakes`, which is the real handler on the intake service's memory store. Nothing is mocked, except two deliberate request aborts that prove the failure paths.

**Not verified:**

- **Supabase-backed persistence: BLOCKED** (unreachable from this environment).
- Composer reports that the preview-linked database is missing the intake migration.

| # | Check | Result |
|---|---|---|
| Q01 | Flag on: `/bldr/studio` → room 01; started intake confirmed (SAVED) | PASS |
| Q02–Q04 | PLACE / FEEL / WORK change the Build Object composition | PASS |
| Q05 | Device back / forward between rooms | PASS |
| Q06 | Server draft holds the four rooms | PASS |
| Q07 / Q08 | Blueprint investment and timeline equal the canonical estimator for the server-held state | PASS |
| Q09 | EDIT SELECTIONS → change → Blueprint re-estimates | PASS |
| Q10 | Drag-to-rotate turns the object (inspect mode), and it stays rendered | PASS |
| Q11 | Fullscreen inspection opens with the object visible | PASS (after the §5 fix) |
| Q12 | SAVE FOR LATER confirmed by SITE 00 | PASS |
| Q13 | Returning client restores the server draft (`?intakeId`), no new intake | PASS |
| Q14 | A different client gets its own intake and none of client A's choices | PASS |
| Q15 | Submission failure shown; record stays unsubmitted | PASS |
| Q16 | Real submit: SUBMITTED, Blueprint v1 with the estimate snapshot | PASS |
| Q17 | Duplicate submission protection | PASS |
| Q18 | No console errors from the studio | PASS. The only console errors were BLDR images on Supabase storage (blocked by this environment's proxy, not by the studio) and the deliberate abort. |
| Q19 / Q20 | Idle sway with default motion; still with reduced motion | PASS |

**Cross-client caveat (unchanged contract):** a guest intake can be read by anyone holding its id (`?intakeId`, anonymous direct access). See R-07.

## 4. Captures (live Chromium, software WebGL)

`docs/site00/builder-experience/hybrid-spatial-studio/recovery-preview-qa/`:

| Viewport | Files |
|---|---|
| Mobile 390×844 @2x | `mobile-01-place` · `mobile-02-feel` · `mobile-03-work` · `mobile-04-pace` · `mobile-05-blueprint` |
| Mobile, Blueprint states | `mobile-05b-blueprint-rotated` · `mobile-05c-blueprint-fullscreen` · `mobile-05d-blueprint-save-state` · `mobile-05e-blueprint-submission-failed` · `mobile-05f-blueprint-submission-received` · `mobile-05g-blueprint-submission-state` |
| Tablet 834×1194 | `tablet-03-work` · `tablet-05-blueprint` |
| Desktop 1440×900 | `desktop-03-work` · `desktop-05-blueprint` |
| Reference vs implementation | `comparisons/cmp-mobile-0{1..5}-*.jpg` |

## 5. Fixes found by this sprint's QA (defects, not redesign)

| Fix | Cause | Change |
|---|---|---|
| Fullscreen inspection was blank | Scene fog was fixed at 14–34 units. A portrait fullscreen fits the camera further back, so the object fogged into the background. | Fog now recedes with the fitted camera distance. The room-stage values are the floor, so room views are unchanged. |
| Email field in the SAVE / SUBMIT sheets rendered as a tall box | The global capture stacks its row on narrow screens. | The sheet keeps the input and button on one line. |
| Submission-failure copy ran two sentences together and could misstate where the draft was | — | Reads "NOT SUBMITTED — {reason}." and says whether SITE 00 holds the choices, based on the server copy. |

## 6. Visual comparison against the two approved references

| Area | Classification | Note |
|---|---|---|
| Phone proportions | MINOR DEVIATION | The references are ~1.33× taller than 390×844, so vertical rhythm is compressed. |
| Headline hierarchy and typography | MINOR DEVIATION | Same condensed black uppercase plus red full stop. Ours is slightly heavier and larger. |
| Lede, room id, menu, wordmark | MATCHES | |
| Room composition (header → headline → stage → controls → CTA → rail) | MATCHES | |
| Build Object scale | SIGNIFICANT DEVIATION | The object sits smaller in its stage than the references' hero renders, especially in PLACE and PACE. |
| Material appearance (glass, Carrara, acrylic) | ASSET BLOCKED | Procedural materials, not photoreal (GA-01, 02, 08). |
| Spatial depth and background architecture | ASSET BLOCKED | Soft columns only; the reference backdrops are missing (GA-05). |
| Scale figures | ASSET BLOCKED | Capsule figures (GA-06). |
| PLACE / FEEL option cards | MINOR DEVIATION | Same grid and rail. Thumbnails are live mini-renders, not the reference's photoreal scenes. |
| WORK toggles around the structure | MATCHES | PAGES starts selected (the contract default). |
| WORK core-included tiles | FOUNDER DECISION REQUIRED | Two tiles (WEBSITE, MOBILE), not four. SEO and analytics are not in the contract. |
| PACE rows | MINOR DEVIATION | Same rows and check. Icons differ slightly. EXPEDITED shows "NOT AVAILABLE FOR THIS SCOPE" when the estimator says priority would not help (functional truth). No preselection; the contract requires a choice. |
| CTA placement and progress rail | MATCHES | |
| Header save status (new) | FOUNDER DECISION REQUIRED | Not in the reference; required by the save-status brief. |
| Blueprint information hierarchy (tabs, three facts, configuration cards, CTA + SAVE FOR LATER) | MATCHES | |
| Blueprint figures | MATCHES (by design) | The values come from the estimator, not the reference's illustrative `6–10 WEEKS / $12,000–$18,000`. |
| Blueprint AR control | DEFERRED | GA-09; no inert button. |
| Scroll behaviour | MINOR DEVIATION | Mobile rooms fit one screen. The Blueprint scrolls to reach the CTA, as in the reference. |
| Responsive (tablet, desktop) | MATCHES the V1 responsive design | Desktop uses the left-column / right-stage layout. |
| CUSTOM submission | FUNCTIONAL BLOCKER (contract) | R-01 |

## 7. Preview delivery — founder URL `https://site00.fsbw-dev.com/bldr/studio`

**Status: NOT DEPLOYED — blocked; the deployment handoff below is ready.**

- **Host reachability:** this environment's egress proxy refuses `site00.fsbw-dev.com` (CONNECT 403). The live route could not be opened from here, so **LIVE ROUTE NOT VERIFIED**.
- **How the host is served** (from the repo scripts and Composer's #1523 report):
  - A Cloudflare tunnel points at `:5174` on the canonical Cursor cloud environment.
  - That environment serves `origin/preview/tunnel`, which CI fast-forwards from `main` on every push (`sync-preview-tunnel-branch.yml`).
  - It runs in dev mode with both Builder flags and `SITE00_INTAKES_USE_MEMORY=1` (ephemeral intakes; **not** production persistence).
  - Feature branches stay invisible until merged or pinned.
- **Isolation:**
  - Flags are set only in the dev exec of the preview run script. Production builds (`site00-production-deploy.yml` → GoDaddy / Railway) do not set them.
  - The tunnel is a development host, separate from `site00.com`.
  - It is reachable by anyone with the URL (no login). It is not auth-restricted.
- **Why I did not deploy:**
  1. The tunnel machine is not reachable from this environment; only a session on it can pin or refresh.
  2. Merging to `main` triggers the production deploy workflow (gated code, flags off). The brief requires founder authorization for that.
  3. Pushing to the shared `preview/tunnel` branch is Composer-owned infrastructure, and CI resets it to `main` on the next push.

### Deployment handoff (Composer or founder ops, on the canonical tunnel environment)

| Field | Value |
|---|---|
| Branch | `claude/bldr-studio-reconciliation-8d42xk` |
| Commit | the head of that branch; see the PR (recovery commit `efe97924`, plus the QA/doc commit) |
| New dependency | **`three@0.185.1`** (+ `@types/three`). Run `npm ci` on the canonical environment before serving; the shared `node_modules` does not have it yet. |
| Flags | `VITE_SITE00_TEMPLATE_SYSTEM_V1=1`, `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1` (set automatically by dev mode). Intakes: `SITE00_INTAKES_USE_MEMORY=1` (dev mode, ephemeral). |
| Expected route | `https://site00.fsbw-dev.com/bldr/studio`, which redirects to `/bldr/studio/place` |

**Option A: pre-merge pinned preview (recommended; no production deploy).** Run on the canonical environment, from the repo root:

```bash
git fetch origin claude/bldr-studio-reconciliation-8d42xk
git checkout --detach origin/claude/bldr-studio-reconciliation-8d42xk && npm ci
tmux -f /exec-daemon/tmux.portal.conf kill-session -t site00_vite 2>/dev/null || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s site00_vite -- bash -lc \
  'SITE00_PREVIEW_PIN_REF=origin/claude/bldr-studio-reconciliation-8d42xk SITE00_CLOUD_PREVIEW_MODE=dev bash .cursor/scripts/run-site00-cloud-preview-server.sh 2>&1 | tee -a /tmp/site00-vite-preview-tunnel.log'
```

Run `run-site00-cloud-preview-server.sh` directly, as above. `serve-site00-preview-from-main.sh` deliberately clears pins.

**Option B: merge** (needs founder authorization; `main` deploys production with the flags off):

1. Merge the PR.
2. CI syncs `preview/tunnel`.
3. On the canonical environment, run `npm ci && bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh`.
4. Confirm `/tmp/site00-preview-runtime-lineage.txt` shows the merged SHA.

**Smoke test (either option):**

1. `/bldr/studio` opens 01 PLACE with the header save chip reading SAVED.
2. Choose through 01–04 → 05 BLUEPRINT shows estimator figures.
3. The cube button lets you drag to turn; the fullscreen button shows the object.
4. SAVE FOR LATER → "SAVED."
5. Submit with an email → "SUBMISSION RECEIVED · VERSION 1".
6. Reloading keeps the Blueprint locked as submitted.
7. The console shows no studio errors.

**Rollback:**

```bash
rm -f /tmp/site00-cloud-preview-pinned-ref
bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh
```

This returns the tunnel to `origin/preview/tunnel` (= `main`). For Option B, revert the merge PR; the flags stay off in production either way.

**To let Opus verify the live route itself:** add `site00.fsbw-dev.com` to the Claude environment's allowed network domains, so the deployed route can be opened and captured from this session.

## 8. Asset gaps (unchanged; not hidden)

| Asset | Status |
|---|---|
| GA-01 atrium HDRI | ASSET BLOCKED |
| GA-02 Carrara marble | ASSET BLOCKED |
| GA-03 nero marble | PARTIAL |
| GA-04 concrete / limestone | PARTIAL |
| GA-05 room backdrops | ASSET BLOCKED |
| GA-06 figures | PARTIAL |
| GA-07 fallback stills | PARTIAL |
| GA-08 acrylic micro-surface | PARTIAL |
| GA-09 AR export | DEFERRED |

No asset was generated, and nothing from the Artlist image-to-3D evaluation is wired in. Any future GLB must keep the parameter-driven composition (`buildObject/composition.ts`) as the source of truth. See `hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md`.

## 9. Next action

**FOUNDER VISUAL INSPECTION.**

1. Deploy with Option A, or authorize Option B.
2. Open `/bldr/studio` on the tunnel.
3. Decide on the deviations marked FOUNDER DECISION REQUIRED and SIGNIFICANT above.

No design changes until then.
