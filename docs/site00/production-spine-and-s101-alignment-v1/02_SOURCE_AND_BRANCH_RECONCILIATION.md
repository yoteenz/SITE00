# 02 — Source and branch reconciliation

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, repository `yoteenz/SITE00`. Nothing was merged and nothing was deployed.

## 1. What existed before this sprint

| PR | Branch @ head | Base | Content | State |
| --- | --- | --- | --- | --- |
| #1690 | `cursor/the-exchange-canon-lock-screenplay-8aec` @ `3466534f` | `main` @ `159c0fa9` | founder canon lock, screenplay architecture | open |
| #1692 | `cursor/the-exchange-directorial-production-engine-8aec` @ `b0a63b95` | #1690 | directorial engine V2, S1-01 directorial packet | open |
| #1693 | `claude/ready-r60enh` @ `d6fcbcf4` | #1692 | living-world audit (`f43aa1f0`), then the Character Studios integration audit (`d6fcbcf4`) | open |
| #1694 | `claude/the-exchange-living-world-promotion` @ `d1f41ae3` | `claude/ready-r60enh` | living-world promotion, including the seven S1-01 patch contracts (deliverable 08) | open |

**Finding: #1694 does not contain the Character Studios audit.**

- #1694 was branched from `f43aa1f0`. The Character Studios audit (`d6fcbcf4`) was added to `claude/ready-r60enh` afterwards.
- So #1694, and the branches stacked on it here, do not contain that audit's 24 documents.
- Nothing in this sprint's code needs them. The audit's gap IDs and decisions (D-01 to D-14) were read from `d6fcbcf4` and are cited by ID.
- A test merge of `d6fcbcf4` into the B2 head is clean: the audit only adds its own folder.

## 2. Sources of truth used

| Need | Source |
| --- | --- |
| The seven S1-01 patches | Living World Promotion deliverable 08 (#1694) and its `S101_PATCH` contracts in `promotion/s101Patch.ts` |
| Gaps and decisions D-01 to D-14 | Character Studios audit `d6fcbcf4`, deliverables 07, 13, 15, 17, 19 and 20 |
| S1-01 shot, keyframes, decisions | `THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json` (after the patches, sha256 `4509b8aa…`) |
| Scene review state | `REVIEW_STATE_V1.json` (all five steps PENDING; unchanged) |
| Prices | `PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V2.json` (2026-10-24 14:47 UTC) |
| Season runtime | `SEASON1_86_RELEASE_MASTER_V1.json` (86 releases, 7,660 s) |
| Spend bypasses and policies | `main` @ `159c0fa9` |

No source record was invented. Where a value was not available it is recorded as UNKNOWN or NOT_AVAILABLE:

- OpenArt's credit-to-USD rate;
- a charge the provider did not report;
- the OpenArt connector's tool names.

## 3. Branches made by this sprint

| Workstream (PR) | Branch @ head | Based on | Why that base |
| --- | --- | --- | --- |
| A, S1-01 packet alignment (#1695) | `claude/the-exchange-s101-packet-alignment` @ `6dda1c51` | #1694 @ `d1f41ae3` | the patches apply promotion records that exist only on #1694 |
| B1, spend gates and role policies (#1696) | `claude/production-spend-gates-and-policy-repair` @ `30577615` | `main` @ `159c0fa9` | the fixes are in `main` code (Expression Engine, ASSTS, migrations) and must not wait for the Exchange stack |
| B2, production record spine (#1697) | `claude/studioworld-production-record-spine` @ `0877342e` (implementation; documentation commits follow) | A @ `6dda1c51` | the SH01 setup is built from the patched packet and records its hash |

The sprint required separate branches and PRs, so no work went to the session's default branch `claude/ready-r60enh`. That branch is #1693's head and was left unchanged.

**Conflict checks.**

| Merge tested | Result |
| --- | --- |
| B1 + B2 (merge base `main`) | clean |
| B2 + `d6fcbcf4` (merge base `f43aa1f0`) | clean |

## 4. Where the deliverables live

The deliverables are split across the three branches, so no file has two sources:

| Branch | Deliverables |
| --- | --- |
| A | 03 and 04, rendered by `scripts/the-exchange/render-s101-alignment.ts` |
| B1 | 07 and 08 (B1 is based on `main`, so they travel with its fix) |
| B2 | 01, 02, 05, 06, 09, 10, 11, 12, 13, 14, 15 and 16; 06 and 12 are rendered by `scripts/production/render-spine-docs.ts` |

The FULL implementation evidence package holds all sixteen together.

## 5. Decisions the audit proposed, and what this sprint did

| Decision | Done here |
| --- | --- |
| D-01 record spine first | yes (B2) |
| D-02 agent-session OpenArt runner | built; disabled; not run |
| D-03 repository JSON for pilot records | yes, behind `RecordStore`; read-only under the production policy |
| D-04 private storage with expiring signed reads | contract and adapters yes; live storage BLOCKED |
| D-07 Director Composer inside EXPRESSION | yes, on the existing TAKES route |
| D-08 THE EXCHANGE as a managed project | yes; cast stays project-local |
| D-11 media production | **not granted, not marked** |
| D-13 close both spend paths | yes (B1) |
| D-14 repair both policies, verify in isolation | yes (B1); production not touched |

**Conflict with repository reality, and the safer choice kept.**

- The audit's D-03 implies a writable pilot store.
- A deployed server's checkout does not keep writes.
- So repository JSON is writable only outside the production persistence policy.
- In production it is read-only until a durable store exists.
