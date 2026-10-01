# BUILD READY — Verification Gap (Forensic)

**Sprint:** P0.SITE00.IDNTY-INTAKE-FORENSIC-SYNTHESIS2  
**Status:** Evidence from `idnty-assessment.ts`, `IdentityStateLandingV2.tsx`, `idnty-diagnostic.ts`, `useBldrAssessment.ts`.

## INTENDED (product copy)

- `MY IDENTITY IS COMPLETE. IT'S TIME TO BUILD.`
- `WE'LL VERIFY YOUR IDENTITY SYSTEM, CONFIRM THE ASSETS REQUIRED FOR PRODUCTION, AND ROUTE YOU INTO BLDR.`
- Mobile system mode label: `IDENTITY VERIFICATION` (`identity-state-v2.ts`)
- Diagnostic CTA: `ENTER BLDR →` with `IDENTITY VERIFIED` (`idnty-diagnostic.ts`)

## CURRENT (implementation)

### 1. ENTRY routes

| Entry | Route / action | Source |
|-------|----------------|--------|
| State picker | `build-ready` → **`/bldr/start`** (skips assessment) | `resolveIdntyStateDestination` |
| Direct assessment | `/idnty/build-ready` landing + steps | `IdntyAssessmentRouterPage` |
| Mobile landing early exit | `completenessPct >= 60` → **`/bldr/start`** | `IdentityStateLandingV2.handleContinue` |

### 2. INVENTORY categories (mobile landing)

Same as Refine asset checklist: LOGO, COLOR PALETTE, TYPOGRAPHY, TAGLINE / MESSAGING, WEBSITE, SOCIAL MEDIA, MARKETING MATERIALS, PHOTOGRAPHY / IMAGERY, OTHER (PLEASE SPECIFY).

### 3. ACTUAL FILE EVIDENCE

**NONE.** No upload controls in public IDNTY assessment components.

### 4. ACTUAL VERIFICATION

**NONE.** No inspection of files, guidelines, consistency, or strategic foundation. Checkbox selection only.

### 5. HUMAN REVIEW

**NONE** on public path. Admin Intakes may show draft payload — operational, not build-ready verification queue.

### 6. STATUS labels (`UNVERIFIED` / `IN REVIEW` / `READY`)

**UI semantics only** in `IdentityStateLandingV2`: derived from `computeInventorySummary` — `found === 0` → UNVERIFIED; `completenessPct >= 80` → READY; else IN REVIEW. **Not persisted** as lifecycle enum on intake.

### 7. THRESHOLD (60%)

**File:** `src/site00/config/identity-state-v2.ts` — `completenessPct = round(found/total*100)`.  
**Trigger:** `IdentityStateLandingV2` — if `>= 60`, primary CTA routes to `/bldr/start`.  
**Measures:** count of asset **labels checked**, not file presence or quality.

### 8. AUTHORITY

**NONE created.** No `identity verified`, brand authority manifest, or build-ready authority field in client record or proven server transition on happy path.

### 9. BLDR HANDOFF

- **Can bypass verification:** YES — state picker → `/bldr/start`; mobile ≥60% checkboxes → `/bldr/start`.
- **BLDR data:** `readIdntyPrefill` / `readIdntyLoreSnapshot` from localStorage — partial, optional.

### 10. Desktop assessment steps (if user completes branch)

1. `services` — BLDR capability multi-select  
2. `scope` — build scope textarea  
3. `timeline` — shared timeline options  

These are **build planning**, not identity verification.

## PRODUCT GAP summary

| Dimension | INTENDED | CURRENT |
|-----------|----------|---------|
| Verification | Identity system verified | Self-assert inventory % |
| Evidence | Production-ready assets | Checkbox labels |
| Authority | Verified → BLDR | Direct links to BLDR |
| Steps | Confirm asset kit | Services + scope + timeline |

## Minimum verification contract (proposed — not implemented)

See receipt section N in synthesis conclusion.
