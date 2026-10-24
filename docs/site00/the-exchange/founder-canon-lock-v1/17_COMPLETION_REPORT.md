# 17 — Completion report

Status words: **COMPLETE** (done and verified by a command), **PARTIAL** (done in part; the rest is named), **BLOCKED** (cannot proceed without a named dependency), **NOT STARTED**, **NOT VERIFIED** (done but not checked).

| Field | Value |
| --- | --- |
| SPRINT ID | `P0.THE-EXCHANGE.OPUS.FOUNDER-CANON-LOCK-AND-SCREENPLAY-ARCHITECTURE.V1` |
| STATUS | COMPLETE for the sprint scope. Generation stays BLOCKED by design. |
| REPOSITORY | `yoteenz/SITE00` |
| BRANCH | `cursor/the-exchange-canon-lock-screenplay-8aec`, from `main` at `159c0fa9b` |
| COMMIT SHA | The head of the pull request. A report cannot name the commit that contains it; the session close records the final SHA. |
| PR LINK OR NUMBER | [#1690](https://github.com/yoteenz/SITE00/pull/1690), targeting `main`. Not merged. |
| BUILD STATUS | COMPLETE. `npm run build` exit 0; 470 JS assets checked. |
| TEST STATUS | COMPLETE for this sprint: 47 of 47 Exchange tests pass, 25 of them new. The full suite has 74 failures in 56 other files; the same 74 fail on `main`. See `16_TEST_AND_BUILD_REPORT.md`. |
| SOURCE AUDIT RESULT | COMPLETE. All sources found and hash-verified. One pre-existing Bible hash mismatch (`00_READ_ME.md`) is reported, not repaired. See `01_FOUNDATION_AND_SOURCE_AUDIT.md`. |
| CANON PROMOTION RESULT | COMPLETE. S-1 Hybrid H, S-2 Option A and S-3 N1 + N2 are `APPROVED_CANON`. NR-1 to NR-11 are recorded with their classifications. The NR-8 and NR-9 placements are `PROVISIONAL_IMPLEMENTATION` pending founder confirmation FC-02. |
| APPROVED RELEASE COUNT | 86 (S1-01 to S1-86), 127:40 total. IDs and order unchanged from BASELINE V1. |
| SCREENPLAY ARCHITECTURE STATUS | COMPLETE. Format, metadata schema, parser, validator and runtime model are in `shared/site00-fiction-production/`. See `05_SEASON1_SCREENPLAY_ARCHITECTURE.md`. |
| DIALOGUE REGISTRY STATUS | COMPLETE for written style: 8 characters, no hard conflicts. No character has a verified voice asset. |
| ASSET REGISTRY STATUS | COMPLETE as a registry: 7 characters, 14 sets, 6 wardrobe entries, 6 props. 0 hard conflicts, 35 blockers (missing faces, voices, set references and designs). |
| SHOT ENGINE STATUS | COMPLETE. 116 shots planned across the five drafts, each 10 s or less, chained frame to frame. |
| PRODUCTION PIPELINE STATUS | COMPLETE as a gated system: 14 stages, 9 approval domains, dispatch gate with 0 credits spent. Generation is BLOCKED: no provider is verified, no screenplay is approved, and there is no spend authorization. |
| FIRST FIVE SCREENPLAY STATUS | COMPLETE as drafts. S1-01 to S1-05 are `DRAFT — FOUNDER REVIEW REQUIRED`, with shot lists and production manifests. No renders. S1-06 onward NOT STARTED, as instructed. |
| OPEN DEPENDENCIES | See the section below and `15_OPEN_QUESTIONS_AND_DEPENDENCIES.md`. |
| SMALL PACKAGE PATH | Recorded in the session close (download link and SHA-256). |
| FULL PACKAGE PATH | Recorded in the session close (download link and SHA-256). |
| NEXT RECOMMENDED SPRINT | See the last section. |

## What was promoted

| Decision | Result |
| --- | --- |
| S-1 Hybrid H | Sloane stops deciding for everyone, keeps facilitating and does not retire. Needed is not loved. S1-75 Living Legacy is unchanged. S1-10, S1-74 and S1-80 are revised to depend on S-1. |
| S-2 Option A | 86 releases, 127:40. The baseline stays immutable. Option B (81) is preserved as an inactive fallback; none of its merges is active. The 74-release Plan C is superseded and archived. |
| S-3 N1 + N2 | S1-20 *Nineteen Eighty-Six* and S1-40 *The Breakfast Dance* are Nights. No release was added. The longest gap without a Night is 19 releases (S1-21 to S1-39). |

Ledger totals: 5 season decisions, 8 recommendation entries covering NR-1 to NR-11, 8 character decisions, the status of all 20 hybrid founder decisions (FD-01 to FD-20), and 3 founder confirmations requested.

## Change against BASELINE V1

| Measure | Value |
| --- | --- |
| Unchanged | 73 |
| Revised | 10 |
| Revised because of S-1 | 3 (S1-10, S1-74, S1-80) |
| Nights | 21 |
| Complexity | 41 low, 30 medium, 10 high, 5 very high |

## Approval state after this sprint

| Domain | State |
| --- | --- |
| Story structure | Approved for all 86 releases (founder authorization, October 23, 2026) |
| Screenplay | 5 drafts awaiting the founder; 81 not submitted |
| Shot plan | 5 drafts; 81 not submitted |
| Character visual identity | Sloane and Gideon approved; Nadine, Richard and Vivienne in review; Kai and Royce not submitted |
| Character voice | 8 not submitted |
| Set | 14 not submitted |
| Wardrobe | 6 not submitted |
| Generated video, final edit | 86 not submitted each |

No approval was granted by an agent. The nine domains need separate founder approvals.

## What was not done, on purpose

- No video, voice, lip-sync or music generation, and no credits spent.
- No screenplay for S1-06 onward.
- No answer to an open creative question: Emmett Hale's identity, Vivienne's private truth, patron faces, wardrobe and invention mechanics stay open.
- No change to facial master assets, the visual registry, the Bible, the three history packages, `src/`, `api/` or `server/`.
- No publication and no deployment.

## Open dependencies

| Kind | Items |
| --- | --- |
| Creative questions (founder) | U-1 Vivienne's private truth; U-2 a Night purely for joy; U-3 Emmett Hale's identity; U-9 the Breach route (Season 2) |
| Founder confirmations | FC-01 FD-05 Ember backstory; FC-02 NR-8 and NR-9 placements; FC-03 FD-07, FD-12 and FD-15 |
| Production | U-4 wardrobe; U-5 invention dossiers; U-6 patron face locks (Kai and Royce block S1-03); U-7 name clearance |
| Provider | A voice provider and a lip-sync path must be verified before any dialogue shot can be dispatched |
| Budget | The first batch is estimated at $178.22 or 26,236 OpenArt credits. The last balance read was 10,154 credits. |

## Next recommended sprint

**Founder review first.** Read the five drafts in `12_SCREENPLAY_BATCH_S1-01_TO_S1-05.md` and rule on:

1. Each screenplay: approve, request changes, or reject.
2. FC-01, FC-02 and FC-03.
3. The two S1-04 review items: Gideon's lines, and whether the producer and pianist get registry entries.

**Then the sprint:** `P1.THE-EXCHANGE.SCREENPLAY-BATCH-02-AND-VOICE-VERIFICATION.V1`

- Apply the founder's notes to S1-01 to S1-05 and record the screenplay approvals.
- Draft S1-06 to S1-10 under the same rules.
- Run a read-only voice and lip-sync capability check (no paid job) so one provider can move to verified.
- Prepare face-lock requests for Kai and Royce for founder approval. No generation without founder spend authorization.
