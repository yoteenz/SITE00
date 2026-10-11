# Founder review summary — Builder Hybrid Spatial Studio

**Status:** ready for founder review on the cloud dev preview (`/bldr/studio`). **Not released.** Visual fidelity: **PENDING FOUNDER APPROVAL.**

## What you can review now

1. **The client builds a Blueprint** at `/bldr/studio`. Four rooms lead to the Blueprint reveal. Every choice is saved to SITE 00 as it is made, and the save status is always shown: SAVING, SAVED, LOCAL ONLY, SYNC FAILED or CONFLICT.
2. **The client submits.** A guest leaves an email. The client then sees SUBMISSION RECEIVED · AWAITING FOUNDER REVIEW, with the submitted version locked and still inspectable.
3. **You review in the existing inbox**, at `/admin/site00/intakes/builder/:id`. You don't need to read JSON. You see:
   - the Build Object
   - build type and level, structure, visual direction, capabilities, pages, pace and the client's note
   - the initial estimate, marked automated and not a quote
   - version history, with what changed between versions
4. **You decide one of two things:**
   - **MARK IN REVIEW** is status only. The client sees UNDER REVIEW.
   - **REQUEST REVISION** sends your message. The client sees it, edits and resubmits as a new version. The earlier version stays on record exactly as sent. VIEW CLIENT RESPONSE shows what they changed.
5. **A decision made on an old version is refused** if the client has resubmitted in the meantime.

## What is deliberately not there

| Missing | Why |
|---|---|
| Refined commercial estimate | There is no contract for a founder-reviewed range yet. The client never sees "REFINED ESTIMATE AVAILABLE". |
| Automatic acceptance or production activation | Acceptance stays manual: CONVERTED and a linked project through BLDR operations. |
| Photoreal materials, backdrops and AR | Assets are requested from Grok, not generated. The Build Object is a live, procedural model. |

## Decisions needed from you

| # | Decision | Default if unanswered |
|---|---|---|
| D-1 | **CUSTOM path:** a CUSTOM Blueprint cannot be submitted under the current contract, because its typography, colour, image and motion lines stay open. Should a CUSTOM submission be allowed with those lines marked "defined in custom direction"? (Composer change R-01) | CUSTOM clients can save but not submit. They are told why. |
| D-2 | **SIMPLE + an advanced capability** (SHOP, MEMBER AREA, PORTAL) moves the build to ADVANCED after asking. Is that the right resolution? | As implemented. |
| D-3 | **Email before submit for guests** (so you can reply). Keep it? | Kept. |
| D-4 | **FEEL** offers four directions (MODERN, BOLD, EDITORIAL, IMMERSIVE), as in the reference. Should WARM / OPERATIONAL return? | Four. |
| D-5 | **Core included** shows WEBSITE and MOBILE only, because SEO and analytics are not part of the estimate selection. Add them to the contract (R-09), or accept? | Two tiles. |
| D-6 | **PACE has no preselected option.** The reference shows STANDARD checked, but the contract requires an explicit choice. Preselect STANDARD? | Explicit choice. |
| D-7 | **Visual fidelity** of rooms 01–05 against the references (`founder-review-qa/comparisons/`). | PENDING. |

## Evidence

- **Captures 01–10, tablet and desktop:** `founder-review-qa/*.jpg`
- **Functional QA:** 32/32 PASS, in `founder-review-qa/founder-loop-results.json`. This ran the real intake handlers on the in-memory store. Supabase-backed persistence was **not** tested and is BLOCKED in this environment.
- **Full write-up:** `../HYBRID_SPATIAL_STUDIO_FOUNDER_REVIEW_V1.md`
