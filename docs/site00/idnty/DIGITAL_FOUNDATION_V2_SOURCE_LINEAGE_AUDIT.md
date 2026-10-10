# Digital Foundation V2 — source lineage audit

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-COMPLETE-PARENT-CHILD-ARCHITECTURE-LIFECYCLE-COMMUNICATIONS-AND-END-TO-END-RECOVERY1`  
**Rollback SHA (branch base):** `8d29986d` (main at sprint start)  
**Agent:** Cursor Composer  

## Recovered (do not re-build)

| Area | Evidence |
| --- | --- |
| Client P01–P06 | `src/site00/foundation-client/parents/` |
| Client route | `/foundation/:token` → `FoundationClient.tsx` |
| Quote / timeline engines | `shared/site00-digital-foundation/quoteEngine.ts`, `timelineEngine.ts` |
| Ops engine P13–P15 API | `api/_lib/digitalFoundation/operationsEngine.ts`, `api/admin/site00-foundation.ts` |
| Invitation 001 | `/invite/:code`, `shared/site00-invitation-system/` |
| BGI contracts | `shared/site00-business-growth-intelligence/` (checkout flags default off) |
| Email pack (platform) | `shared/site00-email/`, `/admin/site00/debug/email-pack` |
| Supabase DF persistence | `supabase/migrations/*digital_foundation*` |

## Parallel / unmerged work (not on this branch)

| Branch / PR | Notes |
| --- | --- |
| `cursor/df-component-system-a9f7` / PR #1573 | Universal component system (draft, founder review). Not merged into V2 branch. |

## This sprint additions

| Area | Path |
| --- | --- |
| Project portal P07–P10 + records + prefs | `src/site00/foundation-client/parents/ProjectPortal.tsx`, `model.ts` |
| Founder P13–P15 UI | `FoundationPipelinePage`, `FoundationProjectCommandPage`, `FoundationWorkbenchPage` |
| Communications domain (Family F) | `shared/site00-digital-foundation/communications/` |
| Send intent enqueue (dry run) | `api/_lib/digitalFoundation/communications/dispatch.ts` |
| Manifests | This folder `DIGITAL_FOUNDATION_V2_*` |

## Still missing / partial

- P11/P12 visual authority on `DigitalFoundationCompleteSurface` (functional only)
- Business Ambition intake UI + `growthBridge` wiring
- Durable Supabase tables for send intents / consent (memory-only today)
- Marketing journeys M01–M15 (contracts only)
- Live provider send (flags off)
- P15A/B/C dedicated founder sub-pages (workbench JSON only)
