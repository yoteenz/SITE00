# 22 — Founder approval decision board

Fifteen decisions. The first nine unlock Phase 1 and the first real take. Each has a recommendation; none is assumed.

## Needed for Phase 1

| ID | Decision | Options | Recommendation | Unblocks |
| --- | --- | --- | --- | --- |
| D-01 | Roadmap order | As the sprint suggested (identity first) / record spine first | **Record spine first.** S1-01 has no principal cast and no dialogue, and the spine is what blocks footage | Phase 1 |
| D-02 | Where generation runs | A. Agent-session runner (OpenArt MCP or CLI)<br>B. Artlist connector, reusing PR #1683<br>C. Backend adapter | **A** for the S1-01 pilot, with a pluggable provider step | G-GEN-01 |
| D-03 | Where production records live | Repository JSON / Supabase tables | **Repository JSON for the pilot**; Supabase in Phase 3, after the database answers | G-TAKE-01, G-DATA-01 |
| D-04 | Where approved masters live, and retention | Private Supabase bucket with signed URLs / other storage | **Private bucket by migration, signed expiring reads.** Not the Git repository: it is already 8.5 GB | G-ASSET-01, G-ASSET-02 |
| D-07 | Where the Composer lives | New navigation tab / dedicated route / EXPRESSION storyboard plus a shot-detail route, with takes in `performance/takes` | **EXPRESSION**: no new tab, existing authorities kept | G-TAKE-02 |
| D-08 | Establish THE EXCHANGE in the production workspace | Yes / not yet | **Yes**: a managed-project entry and an EXPRESSION domain for it | G-WS-01 |
| D-11 | S1-01 approvals for the first take | FD-S101-01 screenplay; FD-S101-08 city reference; FD-S101-11 generation for SH01; GENERATION_BUDGET and PRODUCTION steps for SH01 | **Approve when ready.** SH01 needs about 255 credits plus a retake allowance | First footage |
| D-13 | Close the two ungated spend paths | Yes / no | **Yes, first** | G-COST-03 |
| D-14 | Fix the two policies that apply to every role | Yes, verified on a non-production branch / no | **Yes** | G-DATA-02 |

## Needed before principal-cast and dialogue releases (Phase 2)

| ID | Decision | Options | Recommendation | Unblocks |
| --- | --- | --- | --- | --- |
| D-05 | Canonical actor registry | Acting-catalogue seed / residents registry (branch) / a reconciled new registry | **Reconcile into one**; others become projections. Resolve SW-008 (two people) and SW-017 (images contradict the record). Decide whether the residents branch stack (#1313–#1329) merges or retires | G-ID-02, G-ID-03, G-ID-04, G-ID-08 |
| D-06 | THE EXCHANGE principals | Stay project-local behind an adapter / become catalogue Actors | **Project-local behind an adapter** for now. Making them Actors creates new catalogue identities, which only you can authorize | G-ID-01 |
| S1-02+ | Supply Kai's 10 close-up angles and full body, and Sloane's wardrobe references; approve principal Looks | — | When ready | G-ID-06, G-LOOK-04 |
| S1-01 patch | Accept the S1-01 patch plan (PATCH-S101-01 to -07) and choreograph the teenager's four-count step | — | Before SH05 to SH07 | Second pilot |

## Later

| ID | Decision | Options | Recommendation | Unblocks |
| --- | --- | --- | --- | --- |
| D-09 | ElevenLabs access | Manual export with import records / a backend credential with read-only verification first | **Manual first** (Phase 2); credential in Phase 5 | G-AUD-01 |
| D-10 | Editor and export format | CapCut / Descript / Adobe; FCPXML, OTIO or EDL | Your editor; **FCPXML or OTIO**, EDL as minimum | G-EDIT-01 |
| D-12 | Visual authority exploration | Shot detail (390, 834, 1440, 2560) and ultra-wide only | **Authorize exploration only**; no build before approval | G-WS-03, Phase 3 |
| D-15 | Take retention | Keep all rejected takes / keep for a period / delete on rejection | **Keep all** until a policy is set | G-TAKE-01 |

## Confirmations (no build)

- **Navigation order.** Code has EXPERIENCE before DESIGN; the sprint lists DESIGN first (G-WS-05).
- **Circular buttons and generic dashboards.** These rules apply to production workspaces as well as the visual-authority gate (G-WS-04).

## Not decided here

- Nothing in this audit canonizes KAI'S NOTE, changes a character identity, or authorizes media generation.
- THE EXCHANGE PRs #1690, #1692, #1693 and #1694 stay unmerged until you instruct otherwise.
