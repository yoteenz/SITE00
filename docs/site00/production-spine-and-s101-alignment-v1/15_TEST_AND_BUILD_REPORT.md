# 15 — Test and build report

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`. Each workstream is validated on its own branch against its own base. Every "pre-existing" claim below comes from running the same tests on the base without the change.

## 1. Workstream A (`claude/the-exchange-s101-packet-alignment` @ `6dda1c51`, base #1694)

| Check | Result |
| --- | --- |
| THE EXCHANGE tests (15 files, including the new `theExchangeS101PacketAlignment.test.ts`, 10 tests) | 134 of 134 pass |
| Typecheck (`tsc --noEmit`) | clean |
| Deterministic regeneration (rebuild chain twice) | identical bytes |
| Protected files | cue sheet, multitrack, budget and review state unchanged; the five moved files match `FOUNDER_S101_PATCH_BASELINE` |

## 2. Workstream B1 (`claude/production-spend-gates-and-policy-repair` @ `30577615`, base `main` @ `159c0fa9`)

| Check | Result |
| --- | --- |
| `tests/productionSpendGates.test.ts` on the fix | 15 of 15 pass |
| The same tests on unfixed `main` | 10 of 15 fail (the bypasses are real) |
| Related suites (31 files: Expression Engine B3–B5, ASSTS, provider gateway, bypass audit, reference binding) | 579 pass, 15 fail; identical on unmodified `main` (B4.1, B4.2, B5.3 #15, B5.4 #4) |
| API type errors in the changed files' dependency closure (the `api/` folder has no project tsconfig) | 328 before, 328 after, identical set |
| `scripts/production/verify-role-policies.sh` (throwaway PostgreSQL 16) | before: anon INSERT allowed; after: anon and authenticated denied and see 0 rows, service_role allowed, policy roles `{service_role}`, re-apply harmless |
| Full suite, B1 head | 11,341 tests: 11,245 pass, 91 fail (60 files), 5 skipped |
| Full suite, `main` @ `159c0fa9` | 11,326 tests: 11,230 pass, 91 fail (60 files), 5 skipped |
| Failure sets compared test by test | **identical: 0 new failures, 0 fixed**; the +15 tests are `productionSpendGates.test.ts` |

## 3. Workstream B2 (`claude/studioworld-production-record-spine`, base A @ `6dda1c51`)

| Check | Result |
| --- | --- |
| `tests/productionSpine.test.ts` (records, machines, gate, runner, storage, frames, project integration) | 33 of 33 pass |
| `tests/productionSpineApi.test.ts` (API, the 20-step dry run, UI wiring) | 8 of 8 pass |
| THE EXCHANGE tests | 134 of 134 pass |
| Related suites (44 files: production authority, hub, inbox, project graph, project isolation, panel media, JURNL F01, managed registry, Exchange) | 821 pass, 4 fail; the same 4 fail on the base without B2 |
| Full suite, B2 head | 11,480 tests: 11,384 pass, 91 fail (60 files), 5 skipped |
| Full suite, base `6dda1c51` | 11,438 tests: 11,342 pass, 91 fail (60 files), 5 skipped |
| Failure sets compared test by test | **identical: 0 new failures, 0 fixed** |
| Test count difference | +42: the 41 new spine tests and 1 new parametrized case in `productionWorkspacePanelMediaGeometry2` (the new Takes panels), which passes |
| Typecheck (`tsc --noEmit`, whole app) | clean |
| Spine, API and scripts typecheck (scratch tsconfig including `api/site00/production-spine.ts`) | clean |
| Production build (`npm run build`) | passes: `tsc` clean; Vite built 4,151 modules in 46 s; `verify-production-dist` OK (471 JS assets); release manifest and SPA `.htaccess` written to `dist/` (untracked); no spine module in any browser-externalization warning |
| Zero-spend dry run (`scripts/production/sh01DryRun.ts`) | 20 of 20 steps; 0 network calls; live records unchanged |
| Responsive check (`scripts/production/takes-viewport-check.ts`) | 390, 834, 1440 and 2560 pass: no page or frame scroll, bottom nav visible, controls on screen, no circular buttons; decisions written by touch, keyboard and click |
| Dev server | serves `/api/site00/production-spine`; without Supabase it refuses with 503 (auth not configured), and a bad media signature with 403 |

The full suite writes two JURNL generation ledgers as a side effect. Both were restored after each of the four runs (B2, its base, B1 and `main`).

## 4. Pre-existing failures

The 91 failures in 60 files are the same on B2 and on its base. The living-world promotion sprint recorded the same count (91 in 60 files). They sit in:

- NDX notification and icon tests;
- Expression Engine sprint B4/B5 tests;
- P0.VR reconstruction tests;
- founder creative ingestion;
- the local API TSX loader;
- project index contracts;
- others.

The full list (`full-suite-failures-base.txt` and `full-suite-failures-b2.txt`) is in the FULL evidence package.

## 5. Skipped and blocked

| Item | Status |
| --- | --- |
| 5 skipped tests | skipped on the base as well |
| Live private-storage transfer (Supabase) | BLOCKED: no bucket or credentials in this environment; the adapter is contract-tested against a stand-in client |
| Live OpenArt request | not attempted by design; the route is disabled |
| Production database policy check | not attempted by design; production is not mutated, and it has answered agents with 522 errors since 2026-10-02 |
| H.264 playback in a browser | not observed: the test Chromium build has no H.264 decoder; sizing, serving and hashes were verified |
| JURNL Playwright e2e (`npm run jurnl:e2e`) | not run: unrelated to this sprint |
