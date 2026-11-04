# 15 — Completion report

Written by hand after the build and tests ran; deliverables 01 to 14 are generated. The founder approved 19 Living World Audit V1 proposals at the creative-proposal level on 2026-10-25, plus four follow-up decisions. This sprint promoted exactly those, kept the other 53 unapproved, and generated nothing.

| Field | Value |
| --- | --- |
| SPRINT ID | `P0.THE-EXCHANGE.OPUS.LIVING-WORLD-FOUNDER-APPROVAL-AND-CANON-PROMOTION.V1` |
| STATUS | COMPLETE. 19 proposals promoted; S1-01 packet update proposed, not applied; PR open for review. |
| REPOSITORY | `yoteenz/SITE00` |
| BRANCH | `claude/the-exchange-living-world-promotion`, stacked on `claude/ready-r60enh` (PR #1693 at `f43aa1f07d275fe8dd4abf0abf1afd94b1b61905`) |
| COMMIT SHA | Promotion content through ``6020de2b0` (tests)`. A report cannot name the commit that contains it; the session close records the final head. |
| PR NUMBER | [#1694](https://github.com/yoteenz/SITE00/pull/1694), based on PR #1693's branch. Not merged. PRs #1690, #1692 and #1693 are not merged. |
| SOURCE AUDIT STATUS | PASS. Audit validator 21 of 21 on the promoted canon. The approved behaviour of each proposal is the audit text word for word, except the R-01 alternative the founder declined. |
| FOUNDER APPROVAL COUNT | 19 proposals in 12 priority groups, plus FD-S101-05 (story continuity only), FD-S101-06 RECURRING, FD-S101-07 ANONYMOUS and R-01 SPEAKING |
| PROPOSALS PROMOTED | 19: V-07, T-02, T-10, T-11, T-12, T-01 (phase A); F-01, F-04, F-05, F-06, F-07, F-19 (phase B); W-01, R-01, R-02, R-03, S-02, R-04, R-05 (phase C) |
| PROPOSALS HELD | No founder holds or rejections. 53 are PENDING_FOUNDER with their audit recommendation (APPROVE 19, REVISE 1, HOLD 10, REJECT 23); R-12, R-01-ALT, C-01 and R-14 are explicitly not applied. 8 of the 19 approved are under a conditional production hold. |
| DEPENDENCIES RESOLVED | All four depends-on edges in order (T-02 → T-01, W-01 → R-02, W-01 → R-03, S-02 → R-04). FD-S101-06 cleared five proposals and FD-S101-07 cleared R-03. The R-03 / R-12 conflict holds because R-12 stays unpromoted. Every technology edge points at an existing system. |
| DEPENDENCIES STILL OPEN | FD-S101-05 garment design (R-02 is production-held). Production holds: the S1-01 packet revision (S-02, R-01, R-02, R-03, R-04), the fruit-truck song (F-01), FD-18 memory face locks (F-06, F-07). |
| CANON PROMOTION RESULT | PASS. 30 amendments in 22 master releases; with them removed the master is byte-identical to the audit baseline. Each of the 86 writing briefs carries its development requirements. New promotion ledger and recurring-background registry. |
| TECHNOLOGY RULE RESULT | PASS. Seven season rules: copper wax (only on-screen break in S1-86), the four Relay rules, the Ember governs devices not hearing, memory, speech, repetition or gossip, the gold ladder (hand, room, city; nothing outside the room before S1-77), the S1-59 and S1-76 lantern, the silent Echo Track, and two-witness flashback grammar. Every rule is checked against the master lines it cites. |
| SENSORY MEMORY RESULT | PASS. Six sound and memory directions; no new visual flashback (F-06 and F-07 set the grammar of the master's two). Seven sound motifs registered; none composed or recorded. |
| BACKGROUND IDENTITY RESULT | PASS. The S1-01 tailor (anonymous), grandmother (one existing S1-59 line, dress design pending) and teenager (four-count step) are recurring background; the girl from Kai's workshop returns by R-05. The woman on the balcony and the neighbour stay scene-scoped. No names, relationships or voices. |
| S1-01 STATUS | Packet unchanged and in founder review: 45 s, 19 shots, 1,080 frames, 22 keyframes, 3 music cues, 1 silence, 13 sound cues. The update the decisions call for is the patch plan PATCH-S101-01 to -07 (deliverable 08). FD-S101-01 to -05 and -08 to -11 stay open. |
| S1-59 STATUS | 0:50 unchanged. The S1-01 grandmother speaks the existing line (R-01); the girl from Kai's workshop is among the kids on bikes (R-05); the flickering lantern has a fixed position and pattern (T-12). |
| S1-77 STATUS | 3:30 unchanged. Celestine's flash from inside the dance (F-07, face-lock hold); the far bank as the city's own party (W-01); the jewel-green dress (R-02, design hold); the anonymous tailor, separately (R-03). |
| S1-86 STATUS | 1:30 unchanged. The season's only on-screen seal break (V-07) and the Relay blanking in Celestine's hand (T-01, rules T-02). The two envelope lines are unchanged. |
| SEASON RELEASE COUNT | 86 |
| SEASON TARGET RUNTIME | 127:40 (7,660 s) |
| ACTUAL PLANNED RUNTIME CHANGE | 0 s, at release and season level |
| BUILD STATUS | PASS. `npx tsc --noEmit` (project) exits 0, and a scoped typecheck over the promotion module, renderers and tests exits 0. All six generators re-run byte-stable. `npm run build` not run: no `src/` or UI change. |
| TEST STATUS | PASS for this branch. `npx vitest run tests/theExchange`: 124 of 124 in 14 files (105 existing, 19 new). Full suite: 11,331 pass, 91 fail in 60 files, 6 skipped. None of the 91 is an Exchange test, no failing file reads Exchange data, and nothing outside the Exchange code imports `site00-fiction-production`, so all 91 are baseline failures, not regressions. |
| MEDIA GENERATIONS | 0 |
| MEDIA CREDITS SPENT | 0 |
| PRODUCTION DEPLOYMENT | NONE |
| AUTOMATIC MERGES | NONE |
| SMALL FOUNDER REVIEW PACKAGE | Deliverables 01, 03, 08, 12, 13 and 15. Recorded in the session close (file name and SHA-256). |
| FULL IMPLEMENTATION PACKAGE | Deliverables 01 to 15. Recorded in the session close (file name and SHA-256). |
| NEXT ACTION | FOUNDER REVIEWS THE CANON PROMOTION DIFF, RESIDUAL DEPENDENCIES, AND UPDATED S1-01 PRODUCTION REQUIREMENTS BEFORE ANY FURTHER PRODUCTION AUTHORIZATION. |

## Choices made while implementing

- **Where the promotion lives.** Release-level directions are master amendments, the mechanism the canon lock already uses (`approvedAmendments`). Season rules, motifs, holds and the S1-01 patch live in the new promotion ledger, because no season-rules record existed and the Master Bible is founder source.
- **The audit's baseline.** The audit protected the master by hash. Its check now accepts the master only when removing the AM-LW amendments gives back the exact baseline bytes, so any other change still fails.
- **S1-01.** The packet's nine files are untouched, so FD-S101-06 and FD-S101-07 still read OPEN inside the packet. The founder's answers are in the promotion ledger and the patch plan, which says exactly what changes when the founder accepts it.
- **FD-S101-06.** RECURRING settles the tier. The packet question also asked about the planned looks; those stay directorial interpretation until the S1-01 start frames are approved.
- **Exchange paper.** The copper-wax rule covers Exchange envelopes and paper. S1-17's makers read their terms, so the terms are shown already opened; letters, cards and notes are ordinary paper.
- **The girl from Kai's workshop.** R-05 makes her a returning figure, so she is in the recurring-background register with only her S1-22 source.
- **Not regenerated.** The canon-lock deliverables (`founder-canon-lock-v1/`) are that sprint's snapshot; five were already stale before this branch and none is drift-tested.
- **Branch.** The session pushes to `claude/` branches; the branch is new and stacked on PR #1693, as asked.

IMPLEMENT ONLY WHAT THE FOUNDER AUTHORIZED. PRESERVE THE 86 RELEASES AND 127:40. FOUNDER APPROVAL REMAINS THE FINAL CREATIVE AUTHORITY.
