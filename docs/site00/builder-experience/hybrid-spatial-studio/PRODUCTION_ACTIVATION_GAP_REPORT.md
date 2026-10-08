# Production activation gap report — Builder Hybrid Spatial Studio

**Scope:** what stands between a submitted Builder Blueprint and a live, paid production project, and between this sprint and a public release.
**Position:** activation stays **manual and gated**. Nothing in this sprint activates a project, takes payment or releases the studio.

## A. From submitted Blueprint to project

| Step | Today | Gap | Owner |
|---|---|---|---|
| Submission | ✅ A versioned Blueprint (`current` + `history`), estimator version and estimate snapshot are on `site00_bldr_intakes.submitted_payload` | Supabase path untested in this environment | Composer / ops |
| Informational review | ✅ MARK IN REVIEW (existing admin action), guarded against outdated versions | The server accepts no expected version (R-02) | Composer |
| Revision loop | ✅ REQUEST REVISION, then client resubmission as a new version. Originals are preserved. | Same version-guard gap | Composer |
| Refined commercial estimate | ❌ None | No contract for a founder range, reason, version link or client visibility (R-03) | Composer + founder |
| Quote and acceptance | ❌ None | No quote artifact. No client acceptance step. | Founder decision |
| Project acceptance (CONVERTED) | ⚠ Manual, through legacy BLDR operations only | No canonical admin action for spatial intakes (R-04). `builderProjectActivationHint` lists `INTAKE_NOT_CONVERTED` and `NO_PROJECT_LINK`. | Composer |
| Production handoff | ⚠ `project_id` lineage column only | No automatic `BuilderSelection` → project scope artifact | Composer |
| Payment | ❌ Not wired, by instruction | Paid workflows are not authorized | Founder |

## B. From this sprint to a public release

| Gate | Status |
|---|---|
| `VITE_SITE00_TEMPLATE_SYSTEM_V1` | Off by default. On only for the cloud dev tunnel (#1522). **Not enabled for production.** |
| `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` | Same. With it off, the studio shows "AT REVIEW" instead of figures. |
| Supabase persistence | **BLOCKED here.** Must be exercised end-to-end on a Supabase-backed environment before release. |
| Admin auth | Real admin auth is not exercised here. The QA harness skips only the HTTP auth check, on the memory store. |
| Client payload exposure | **Open (R-06).** The client read returns the founder's admin email in revision requests, and the estimate snapshot even when the preview flag is off. |
| Guest resume | **Open (R-07).** The bare `?intakeId` acts as a bearer link for guest intakes. |
| CUSTOM path | **Blocked by contract (R-01).** It cannot submit. |
| Autosave flush on leave | **Open (R-05).** The last change reaches SITE 00 only on the next visit. |
| Assets | Procedural only. Photoreal set requested (Grok manifest). |
| Founder visual approval | **PENDING.** |

## C. Recommended order

1. R-01 (CUSTOM decision), R-06 (client payload), R-02 (server version guard).
2. A Supabase-backed end-to-end run of `scripts/site00/builder-studio-qa/founder-loop.cjs`, pointing `QA_API` at a staging API with real admin auth.
3. Refined estimate (R-03) and canonical acceptance (R-04) contracts, if the founder wants them in the product rather than by hand.
4. Founder visual approval, then a flag decision for production.
