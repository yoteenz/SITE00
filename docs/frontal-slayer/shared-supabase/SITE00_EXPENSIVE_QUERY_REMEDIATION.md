# SITE 00 expensive query remediation

**Sprint:** `P0.SITE00.FS.SHARED-SUPABASE.WORKLOAD-CONTAINMENT-AND-QUERY-STABILIZATION1`  
**Status:** Code implemented on branch `cursor/shared-supabase-workload-containment-9839` — **not deployed**

## Changes shipped in code

### Shared utility

- **`api/_lib/supabase/boundedListQuery.ts`** — clamp limits, Supabase `range()`, chunked `fetchAllRowsInChunks()` for full-history reads without single unbounded SELECT.

### Priority tables

1. **`site00_senior_creative_judgments`**
   - `listJudgmentsFromSupabasePage()` — summary projection; optional `record`.
   - `listJudgmentsFromSupabase()` — chunked retrieval (default includes `record`; callers can set `includeRecord: false` for lightweight scans).

2. **`site00_creative_corrections`**
   - `listCorrectionsFromSupabasePage()` + chunked `listCorrectionsFromSupabase()`.
   - Avoids blind `select('*')` without `order`/`limit`.

3. **`site00_campaign_copy_packages`**
   - `listCampaignCopyPackagesFromSupabasePage()` — list without loading full JSON packages.

4. **`site00_methodology_validation_runs`**
   - `listPersonalityReplayRecordsForOrg(org, { limit, mode })` — default limit **100**, max **500**.
   - `findActiveSubmittedReplay` uses `{ limit: 200 }`.

5. **`site00_marketing_engagements`**
   - Admin/client list functions default **200**, max **500**.
   - `GET .../site00-marketing?action=list&limit=` optional override (clamped server-side).

6. **Studio OS / ASSTS**
   - `listFilteredLibraryAssets` — **2000** cap.
   - `getLibraryCategoryCounts` — narrow column projection.
   - `listAllAssetsWithVersions` — default **100** assets (N+1 versions unchanged but bounded asset count).

7. **Admin operations**
   - Identity / lead / discovery related lists capped (**100** detail fan-out, **250** list views).

## Semantics preserved

- No silent truncation for callers that need full history: chunked fetch continues until empty or `maxRows` (50k cap in helper).
- Paginated APIs expose `hasMore` / `nextPage` via `BoundedListMeta`.
- Business rules unchanged; only access patterns bounded.

## Tests

- `tests/supabaseBoundedListQuery.test.ts`
- `tests/site00CreativeIntelligenceBoundedList.test.ts`

## Not in scope (follow-up)

- HTTP routes that expose judgment/copy **pages** to founder UI (adapters ready; wire when product needs history browser).
- Replacing JSONB `record` duplication with column-only reads on write path.
- Moving ASSTS category counts to SQL `GROUP BY` (requires query redesign, not migration).
