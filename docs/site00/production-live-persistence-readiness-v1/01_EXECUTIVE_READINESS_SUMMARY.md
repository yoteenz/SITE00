# 01 — Executive readiness summary

Sprint P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1.

- **PRs:** #1699 (the integration branch, stacked on #1697) and #1698 (the security follow-up, stacked on #1696).
- **Nothing was generated, spent, merged or deployed, and nothing in the production database was changed.**

## In one paragraph

- **What is ready.** The production record spine now has a durable, database-backed store with roles, append-only approval history, transactional integrity and a hardened spend gate. All of it is proven on a real PostgreSQL 16 database shaped like Supabase. A full zero-spend SH01 run passes all 20 steps on that store.
- **What is not.** None of it is on Supabase yet: staging was not approved for changes, and production is out of scope. The OpenArt route stays disabled, because the deployed system has no way to reach OpenArt; that is the founder's decision.
- **A wider finding.** The audit of every paid provider path found that most paths *outside* the spine are reachable without a founder session. That exposure predates this sprint and needs a founder decision (D-I).

## Readiness, separately (§29)

| Classification | State | Basis |
| --- | --- | --- |
| CODE_COMPLETE | **YES** (spine, store, roles, gate, runner, UI, scripts); **PARTIAL** for spend coverage outside the spine | Deliverables 03–13 |
| ISOLATED_TEST_VERIFIED | **YES** | PostgreSQL 16 durable tests (18/18); spine unit tests (56/56); API and dry run (9/9, dry run 20/20); security 20/20; policies 16/16; viewport 4/4 |
| STAGING_VERIFIED | **BLOCKED** | No staging project approved for changes; the script is ready (deliverable 18, Stage 2) |
| PRODUCTION_DEPLOYED | **NO** | Not in scope |
| PRODUCTION_VERIFIED | **NO** | Nothing deployed |
| CREATIVE_APPROVED | **NO** | FD-S101-01, -08, -09 open for SH01; all 5 authorization steps PENDING (deliverable 15) |
| SPEND_AUTHORIZED | **NO** | FD-S101-11 open; budget PLANNING_ESTIMATE_ONLY; no job authorized; the 255 cr quotes are 24 Oct planning figures, stale for spend |
| LIVE_GENERATION_READY | **NO** | All of the above, plus a BLOCKED provider route |

None of these stands in for another. Technical readiness is not creative approval, and creative approval is not permission to spend.

## For the founder to read first

1. **Deliverable 16:** the SH01 authorization packet, the exact transaction SH01 would be.
2. **Deliverable 15:** every S1-01 decision, and what SH01 does and does not need.
3. **Deliverable 19:** the blockers and decisions D-A to D-I. D-I, the open paid paths outside the spine, is the most urgent.
4. **Deliverable 18:** how to roll out, stage by stage, with rollback.

## Key facts

- **What SH01 needs.**
  - Global: FD-S101-01 (screenplay), FD-S101-09 (24 fps), FD-S101-11 (budget).
  - SH01-specific: FD-S101-08 (how the street is seeded), plus the scoped authorization steps, the reference image, its approval and a fresh quote.
  - Not needed: the dress design (FD-S101-05) or the teenager's four-count (FD-S101-12).
- **Planned cost.** 255 cr (2 × 40 reference, 175 video), quoted 24 Oct; this must be re-quoted. **Actual spend: 0.**
- **Exchange canon is unchanged.** 86 releases, 127:40; S1-01 is 45 s, 1,080 frames, 19 shots. All seven #1695 patches re-verified; the tailor anonymous, the grandmother the S1-59 speaking role, the dress visual pending, the four-count pending.
- **Security found live in production (read-only).**
  - #1696's two open policies; two production-graph tables without RLS; one SECURITY DEFINER function open to anon. These are repaired in #1696 and #1698, not deployed.
  - Public paid endpoints outside the spine (deliverable 09).
