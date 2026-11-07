# 02 · Repository and branch baseline

Sprint: P0.JURNL.GLOBAL-MENU.CONNECTED-ACCOUNTS-AND-FINANCIAL-INTELLIGENCE.UI-COVERAGE-REGRESSION-AUDIT.OPUS1.
This audit is read-only and documentation-only. Application code was not modified.

Evidence class used here: VERIFIED_CURRENT_CODE / VERIFIED_HISTORICAL_CODE. Every value below was read with `git` on 2026-11-05 after
`git fetch origin` of the branches named.

## Inspected tree

| Field | Value |
|---|---|
| Repository | `yoteenz/SITE00` |
| Default branch | `main` @ `e413590e1` (2026-11-02, "Merge pull request #1702 … jurnl-input-autofill-uppercase") |
| **Inspected branch (current JURNL integration tip)** | `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ **`4ddbac6ced7fd43213d22ffd6d26524336ee37aa`** (2026-11-05, PR **#1714**, draft, base `integration/jurnl-production-workspace`) |
| Integration branch | `integration/jurnl-production-workspace` @ `7752eae2f` (2026-11-04) |
| Latest Opus (this agent) branch | `claude/jurnl-f05-dot01-artwork-typography-um0u93` @ `c34ef288f`. It is **not** a descendant of `4ddbac6ce`: both share the merge-base `550a6f83d`. `c34ef288f` adds 1 commit (the editorial-overlay imagery pass, art and CSS only). The tunnel adds 38 Cursor commits that also change navigation code (`JurnlCornerChrome.tsx` menu toggle and `aria-expanded`, `store.tsx` `writeLastJurnlRoute` / `mergeMoneySearchParams`, `JurnlRuntimeRoot.tsx` last-route resume). For that reason every navigation claim in this audit is read at `4ddbac6ce`, not at `c34ef288f`. |
| Preview tunnel ref | `preview/tunnel` @ `e413590e1` (= `main`). It does **not** contain the JURNL financial OS or the V3 menu. |
| Live preview SHA | **LIVE_RUNTIME_UNVERIFIED.** The founder's tunnel is served from another agent's VM (`/tmp/site00-preview-main`, per AGENTS.md); it cannot be read from this session. |

How the tree was read: `git show 4ddbac6ce:<path>` and `git grep <pattern> 4ddbac6ce`. Nothing was checked out, and no worktree
of another agent was touched.

## Ancestry (read with `git merge-base`, `git rev-list --count`)

| Branch | Merge-base with `4ddbac6ce` lineage | Notes |
|---|---|---|
| `main` `e413590e1` | ancestor | 63 commits behind `c34ef288f`; none of the JURNL financial-OS PRs are merged to `main` |
| `integration/jurnl-production-workspace` `7752eae2f` | ancestor | base of PR #1714 |
| `claude/jurnl-financial-os-unification-um0u93` `c56691ecb` | ancestor | PR #1705 (draft) |
| `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` `4ddbac6ce` | **inspected** | contains every Opus sprint up to `550a6f83d` (OPUS2 editorial, OPUS3A/B DOT 01) plus 38 Cursor commits (MONEY dock, rail, f05seed) |

## Open JURNL pull requests (GitHub, read 2026-11-05)

| PR | Head → base | State | Relevance |
|---|---|---|---|
| #1714 | `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` → `integration/jurnl-production-workspace` | draft | **inspected tree**: V3 menu, editorial overlays, DOT 01 |
| #1715 | `cursor/jurnl-financial-intelligence-audit-4e5a` @ `5aeeee0a4` → `main` | draft | Financial Intelligence Foundation Audit (28 docs). It inspected the same tunnel branch at `8ba653faf` and is the functional source this audit maps to |
| #1713 | `cursor/jurnl-financial-safety-integration-4e5a` @ `f7e2739c6` → `main` | draft | financial safety integration candidate |
| #1707 | `claude/jurnl-f05-money-motion-pilot-um0u93` → stabilization | draft | F05 MONEY + DOT 01 |
| #1706 | `claude/jurnl-financial-os-stabilization-um0u93` → unification | draft | transfer settlement, dual-horizon Safe to Spend |
| #1705 | `claude/jurnl-financial-os-unification-um0u93` → `main` | draft | unified accounting |
| #1708 | `cursor/jurnl-founder-entitlements-isolated-v1-4e5a` | draft | FOUNDER_FULL grants (membership entitlements) |
| #1704 | `cursor/jurnl-product-utility-audit-4e5a` | draft | product utility audit |
| #1709–#1712 | small F05 fixes | open | MONEY layout and type |

None of these are merged. This audit merges nothing and rebases nothing.

## Menu-relevant files and their presence

| Path | `main` | `integration` | `4ddbac6ce` |
|---|---|---|---|
| `src/projects/jurnl/runtime/global/GlobalMenu.tsx` | absent | absent | present; first commit `3fac5e546` (2026-11-04, "JURNL V3: global interactive foundation, global menu, membership & access, archive caution"); last change `1ef7535d6` (2026-11-05, "copy(jurnl): global menu script line mentions preferences") |
| `src/projects/jurnl/runtime/screens/AccountScreens.tsx` (AccountDrawer, F09 replica) | see 03 / 05 | see 03 / 05 | present |
| `src/projects/jurnl/data/foundation/connectionProvider.ts` | — | — | present: `JURNL_BANK_CONNECTION_PROVIDER = { provider_id: 'jurnl.bank.none', availability: 'PROVIDER_UNAVAILABLE' }` |
| `src/projects/jurnl/data/f02/contract.ts` | — | — | present: F02 SETUP accounts step, permission drawer, CONNECTED state |

Historical menu forensics (03, 05) follow every version of these files through `git log`.

## Boundaries kept in this sprint

* Application code modified: **no**.
* Bank connections initiated: 0. Provider API calls: 0.
* OpenArt generations: 0. Paid credits: 0.
* Database mutations: 0. Deployment: none. Merge: none.
* Documentation lands on a **docs-only branch from `main`**, which carries only this folder (see 30).
