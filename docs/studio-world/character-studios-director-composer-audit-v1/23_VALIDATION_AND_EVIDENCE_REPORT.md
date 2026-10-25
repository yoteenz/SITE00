# 23 — Validation and evidence report

## 1. Sprint §31 checklist

| Check | Result | Evidence |
| --- | --- | --- |
| No implementation changes | PASS | The commit adds files under `docs/studio-world/character-studios-director-composer-audit-v1/` only; no source, config, migration or lockfile touched |
| No database mutations | PASS | No Supabase call of any kind was made |
| No new media generation | PASS | No generation tool was called |
| No provider credit spending | PASS | Credits spent: 0. The Artlist connector was used for read-only model listings (one list, three configuration reads). No generation, upload or cost request |
| No production deployment | PASS | Nothing deployed |
| No automatic merges | PASS | No PR merged. PRs #1690, #1692, #1693 and #1694 remain open |
| No fictional API capabilities | PASS | Every capability names its evidence class (repository, founder-run, connector-reported, vendor-documented); vendor claims are labelled untested |
| No duplicate registries | PASS | No registry created. The audit recommends reconciling the nine that exist (D-05) |
| No invented asset references | PASS | Asset IDs, hashes and provider IDs are quoted from committed records; the sprint's "cream envelope" and "dressing suite" are reported as not canonical |
| No loss of Actor / Character separation | PASS | Deliverable 04 keeps every entity separate and rejects a flattened model record |
| No premature runtime claims | PASS | Runtime status is LIVE_AND_VERIFIED only with dated run evidence (fal keyframes 2026-09-07; JURNL OpenArt ledgers; founder OpenArt runs 2026-10-24) |
| No character identity modifications | PASS | No identity file or record changed |
| No unrelated Studio World redesign | PASS | Only the shot detail and ultra-wide arrangement are proposed for new authority exploration |
| Every gap references repository evidence | PASS | 60 of 60 gap rows have a non-empty evidence field; all cited paths resolve (below) |
| Every recommendation has an owner, dependency and acceptance criterion | PASS | 60 gap rows have all 13 fields. Recommendation tables in 08–19 carry owner, dependency and acceptance columns |
| Roadmap compatible with existing architecture | PASS | Composer placed in existing EXPRESSION families and routes; reuse lists per phase; no navigation change |
| Unavailable source material reported honestly | PASS | §3 |

## 2. Automated evidence checks (2026-10-25)

Run over the 24 Markdown and CSV deliverables against `git ls-files` of the working tree: `origin/main` plus THE EXCHANGE stack.

| Check | Result |
| --- | --- |
| Cited path tokens checked | 352 |
| Paths that do not resolve | **0** (two cite this audit's own folder, which this commit creates) |
| Branch-only citations (named with their branch in the text) | 7 |
| Non-file tokens skipped (routes, git refs, branch names, authority IDs, the npm package name) | 14 |
| Gap rows | 60 (P0 8, P1 28, P2 18, P3 6) |
| Gap IDs used in any deliverable but not defined in 07 | 0 |
| Gap rows with an empty required field | 0 |
| Transfer rows | 24; all statuses valid; all gap references defined |
| Gaps placed in a roadmap phase | 60 of 60, each exactly once |
| Model identifiers or connector-internal IDs in deliverables | 0 |

Line-level claims spot-checked by reading the file at that line:
- `review.ts:160`
- `identityAnchorCasting.ts:241-244`
- `fabricationBridge.ts:44,47`
- `site00-production-hub-reconstruction.css:913-916`
- `site00-production-workspace-density.css:990-997`
- `site00-production-expression-family.css:16`
- `ExpressionFamilyShell.tsx:425,457`
- the two policy definitions (`20260910180000…:31-32`, `20260921120000…:26-27`)
- `directorial/types.ts:93,112,152`

Classifications of systems outside THE EXCHANGE come from three read-only discovery passes over `origin/main`, spot-checked as above. Line references that were not re-read are cited as found by those passes.

## 3. Unavailable or unchecked sources

| Source | Status |
| --- | --- |
| `elsewherestudiosai.com` | Not reachable (DNS lookup fails); indexed text used, labelled |
| Instagram reel `De3QxrGg2EV` | Not reachable; not watched |
| Founder's screen recording | Not in the workspace; not inspected |
| Production Supabase | Not queried (read-only audit; 522 errors to agents since 2026-10-02) |
| Remote migration state | Inferred from memory and the pending checklist |
| OpenArt MCP | Not attached to this session; OpenArt facts come from committed records |
| ElevenLabs | No credential or connector here; voice IDs not verified |
| `FAL_KEY` | Not set in this session |
| FSBW resident canon | Not in this repository |
| Founder's Unreal host | Not reachable |
| ElevenLabs Studio, forced alignment | Vendor documentation found by search; not tested |

## 4. External calls made during the audit

| Call | Purpose | Side effect |
| --- | --- | --- |
| Web search (Elsewhere; ElevenLabs Studio and forced alignment) | Published product documentation | none |
| Artlist connector: model listing (image-to-video), three model configuration reads | Real connector capability results | none (no generation, upload or cost request) |
| GitHub reads (pull request state) | Branch and PR status | none |
| `git fetch --depth=1` of four branch tips (discovery pass) | Read branch evidence | Four local remote-tracking refs created; nothing pushed |

## 5. Build and test status

- **BUILD.** Not applicable. The commit is documentation and two CSV files in a new folder; no compiled source, configuration or dependency changed.
- **TEST.** The repository test suite was not run for this documentation-only change. The audit's own evidence checks (§2) pass.
