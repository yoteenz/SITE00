# OPUS → COMPOSER HANDOFF

**Sprint:** `P0.SITE00.PUBLIC-REDESIGN.OPUS-CONVERGENCE1` · **Branch:** `cursor/public-redesign-sonnet-structure1-4f59`

This file lists only post-Opus functional and product issues. The visual reconstruction is done; don't redo it. The page geometry is final apart from the Grok asset injection described in `OPUS-GROK-HANDOFF.md`. Composer owns backend capability, production hardening, integration and merge.

Opus changed **no** routes, no persistence, no submit lifecycle, no auth, no DB schema and no API. Every item below already existed after Sonnet, or it is a founder decision that Opus surfaced and did not resolve.

---

## 1. Identity-authority verification backend (BLOCKER for real Build Ready)

**Today:**
- `IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE = false` (`src/site00/lib/identityAuthorityVerification.ts`).
- `unavailableIdentityAuthorityGateway.submitForVerification` returns `BACKEND_UNAVAILABLE`.
- The UI says **VERIFICATION SUBMISSION IS NOT AVAILABLE YET** and never navigates.

**Composer needs to provide:**
1. A server snapshot read: `ServerIdentityAuthoritySnapshot` per intake, with one status per domain (`STRATEGY / VISUAL / VOICE / VALUES / EXPERIENCE`).
   - This is the only source allowed to render **AUTHORITY ESTABLISHED**. The authority image `03_BUILD_READY_AUTHORITY_CHECK` shows that state, and the UI already resolves it from a snapshot via `resolveDisplayedAuthorityStatus` / `authorityCheckStatus`.
2. A submit-for-verification endpoint, plus a review queue and reviewer tooling that live outside the public site.
3. Wiring the snapshot into `IdentityDiagnosticFlow` in place of `snapshot={null}` (four call sites).

**Visual impact:** none. The `PENDING_REVIEW`, `GAP_IDENTIFIED` and `AUTHORITY_ESTABLISHED` styles and rows are already final.

## 2. Evidence persistence and storage

**Today:**
- Evidence is a set of selected source chips plus "ask SITE 00 to review" flags, stored as answer keys `evidence-<domain>` and `review-flags` on the IDNTY intake draft through the existing autosave.
- No files are uploaded.

**Composer needs to provide:**
- Decide whether evidence needs real file or URL attachments. If it does, add storage, size and type limits, and per-domain linkage.
- Keep the chip model as the summary layer.

## 3. BLDR unlock authority

- BLDR is never unlocked from IDNTY Build Ready. The UI offers no `/bldr` link from Build Ready, and the browser flow check asserts this.
- Composer must define the server rule ("verified identity → BLDR access") and expose it.
- The authority's "ENTER BLDR" CTA on state 03 stays replaced by **BEGIN VERIFICATION** until that rule exists. That is a founder decision (see §8).

## 4. BLDR EXTENSIONS: product-definition mismatch → **BLOCKED_FOR_FOUNDER_DECISION**

- **Authority:** four BLDR paths — SITE / WORLD / **SYSTEMS** / **EXTENSIONS** (`01_BLDR_COMMAND_CENTER`, `05_BLDR_SYSTEMS`, `06_BLDR_EXTENSIONS`, Origin BLDR panel).
- **Product today:** build classes SITE / WORLD / **ENTERPRISE** / **NOT SURE**.
- **Current mapping (unchanged by Opus):**
  - SYSTEMS → class `enterprise` (`/bldr/enterprise`).
  - EXTENSIONS → class `not-sure` → **BEGIN EXTENSIONS** routes to `/bldr/not-sure` (BLDR discovery), with the on-panel note: *EXTENSIONS HAS NO DEDICATED ASSESSMENT YET — THIS STARTS BUILDER DISCOVERY.*
- **This is not a visual mismatch.** The EXTENSIONS panel is converged visually. Whether EXTENSIONS is a real build class (with its own assessment, pricing and fulfilment) is a product decision. Opus did not reinterpret it.
- **Founder to decide:**
  - (a) Make EXTENSIONS a fourth build class with its own assessment.
  - (b) Keep EXTENSIONS as a discovery entry (current behavior).
  - (c) Rename it.
- Composer implements whichever is chosen.

## 5. Pricing source

- BLDR and EVOLVE path panels show investment and timeline copy from `src/site00/config/public-redesign-content.ts` (EVOLVE: `FROM $1,750`, `4–6 WEEKS` …).
- IDNTY detail uses `IDNTY_INVESTMENT_TIERS`.
- There is no server pricing source. Composer should decide on a single canonical source (CMS or config service) before any pricing changes.

## 6. Submit lifecycle and commercial activation (IDNTY Foundation / Refine / Evolution)

- **SUBMIT IDENTITY ASSESSMENT** calls the existing intake `submit` action and then routes to `/idnty/:state/complete`.
  - Incomplete answers route to the first missing question.
  - A failed submit stays on review and says so.
  - Browser flow checks cover all three.
- **Composer must confirm the server semantics of `submit`:** does it create a commercial engagement, a quote, or a notification? Composer must also confirm that the `complete` page's copy matches that truth.

## 7. Missing-authority routes (keep functional, do not redesign)

These 16 live routes have no approved authority yet, so Opus left them visually untouched:

- additional Builder pages (assessment steps, class pages);
- additional Evolve pages (assessment steps);
- checkout;
- `/idnty/:state/complete`;
- other public routes.

The full list is in `SONNET-ROUTE-AUTHORITY-MAP.md`. When authorities arrive, they go through Sonnet/Opus. Composer should only keep them working.

## 8. Founder decisions Opus surfaced (not product code; listed so Composer doesn't guess)

| # | Topic | Current implementation |
|---|---|---|
| 1 | State 03 detail copy / CTA (authority: "locked and verified … ENTER BLDR") | Honest verification copy + **BEGIN VERIFICATION** |
| 2 | Authority check "AUTHORITY ESTABLISHED / SITE 00 HAS REVIEWED" | Provisional statuses + disclaimer until §1 exists |
| 3 | Header links CHARACTERS / WORLDS / LIBRARY + SEARCH | Omitted (no routes / no search capability). The BLDR/EVOLVE center headers show the links that exist: EXPLORE · BUILD · EVOLVE · ABOUT |
| 4 | EVOLVE center nav bay (authority highlights IDNTY) | Contextual **EVOLVE** bay |
| 5 | Locations numbering (authority repeats 05) and YOUR SPACE section | 05 / 06 / 07; YOUR SPACE kept |
| 6 | 941- vs 1080-family scale mismatch for IDNTY detail screens | **RESOLVED (founder, OPUS-SURGICAL-CLEANUP1):** family continuity wins. State 00 detail normalised to the FOUNDATION family and locked by tests |
| 7 | BLDR panel numbering (02 / 02.01 … drawn inconsistently) | Reproduced as drawn |
| 8 | TERMS / PRIVACY destinations | Labels only (no dead links) |

## 9. Production notes for the merge

- Shared shell change: `body:has(.s00pr-shell) { margin: 0 }`.
  - Before this, every redesigned page carried the browser's default 8px body margin.
  - The rule is scoped, so other SITE 00 surfaces are unaffected.
- `FastTravelPanel` (shared component) now returns focus to its trigger only after an open → close transition.
  - Before, it focused the trigger on every page mount, which drew a red focus ring in the header and moved screen-reader focus.
- The laptop "Mobile" preview artboard had a pre-existing layout bug that pushed content about 420px down. It is fixed: the environment and content now share one grid cell, with a sticky plate.
- Proof harnesses now load the real Martian Mono webfont from a local cache (`scripts/site00-cache-proof-fonts.sh`). Sonnet's proof captures were rendered in a fallback monospace.
