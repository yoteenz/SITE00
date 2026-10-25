# 14 — Remaining production blockers

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`. What still stands between today and a first approved SH01 take, in the order it has to be cleared. Nothing below was decided by this sprint.

## 1. Founder decisions on S1-01

| Decision | Status | Blocks |
| --- | --- | --- |
| FD-S101-01 Approve the S1-01 screenplay v2 (still DRAFT) | OPEN | SCREENPLAY step; every S1-01 job (SH01 included) |
| FD-S101-08 How is the street seeded (photograph or look development)? | OPEN | KF-ENV-CITY-DUSK-A, the SH01 start frame; the two reference jobs' inputs |
| FD-S101-11 Authorize the generation budget? | OPEN | any budget authorization; the 255-credit SH01 estimate stays an estimate |
| FD-S101-02 music direction and composer route | OPEN | DIRECTION step |
| FD-S101-03 the Ember on a lens | OPEN | KEYFRAMES step |
| FD-S101-04 Halcyon House: windows only, or an exterior authority? | OPEN (plan stays windows-only) | KEYFRAMES step |
| FD-S101-05 jewel-green dress | STORY_CONTINUITY_APPROVED / VISUAL_DESIGN_PENDING | KF-WD-GREEN-DRESS (blocked) |
| FD-S101-09 confirm 24 fps | OPEN | DIRECTION step |
| FD-S101-10 title card | OPEN (plan has none) | DIRECTION step |
| FD-S101-12 lock the teenager's four-count step | OPEN (CHOREOGRAPHY_LOCK_PENDING) | KF-SF-SH05; S-02 and R-04 production |

**The steps run in order.** The scene review state holds all five steps PENDING: SCREENPLAY → DIRECTION → KEYFRAMES → GENERATION_BUDGET → PRODUCTION.

- SH01's reference images need GENERATION_BUDGET authorized.
- SH01's video needs PRODUCTION authorized, which may be scoped to SH01 alone.

**Other open items.**

- The 53 remaining living-world audit proposals are unapproved.
- **D-11 (media production) is not granted.**

## 2. Before the first paid call

1. **Re-quote.** The V2 quotes are from 2026-10-24. Read the balance and confirm the 40- and 175-credit prices.
2. **Seed the street (FD-S101-08).**
   - If it is a photograph, import it with its hash and approve it as the reference.
   - If it is look development, authorize and run the two reference jobs, then approve one candidate.
3. **Authorize the budget.** The founder authorizes the SH01 budget (FD-S101-11). There is deliberately no API or UI action for this yet. It is a separate founder decision, recorded through the runner's `authorizeBudget` by an agent session.
4. **Authorize the job.** The founder authorizes the video job at its current input hash, with a maximum and an expiry.
5. **Run a live provider check** through the agent-session OpenArt route:
   - verify the connector's tool names and response fields;
   - set `SITE00_PROVIDER_EXECUTION=ENABLED` in that session only;
   - record `liveProviderCheck: PASSED` on the shot.

   Only then can SH01 read GENERATION_READY.

## 3. Infrastructure

| Item | State | To clear |
| --- | --- | --- |
| Live private media storage | BLOCKED | Create a private bucket; set `SITE00_PRODUCTION_MEDIA_BUCKET` and `SITE00_MEDIA_SIGNING_SECRET`; run `liveTransferCheck` (deliverable 09 §5) |
| Durable record store | Not built | Repository JSON is pilot persistence and read-only under the production policy. A Supabase `StoreBackend` (three methods) and its migration are next. |
| OpenArt execution | DISABLED | An agent-session executor implementing `submit`, `poll` and `fetchOutput`, behind the runtime flag; the deployed app keeps it disabled |
| Founder authorization surface | Absent by design | A founder-only UI for budget and job authorization, after D-11 |
| H.264 playback | Not observed | Open one test take on the founder's phone (Chrome or Safari) |
| Dailies completeness | Partial | REVISE action; decisions into INBOX and ACTIVITY |
| B1 spend-gate fixes | In PR, not deployed | Merge, then redeploy the API |
| B1 role-policy migration | In PR, not applied | Apply to Supabase, then confirm with the `pg_policies` query and an anon-key request (deliverable 08 §4); the production database has answered agents with 522 errors since 2026-10-02 |
| Founder-initiated paid POSTs elsewhere | No budget check | ASSTS `generate` / `regenerate` / `variant` and Expression Engine `GENERATE_FINAL_STORYBOARD` are explicit but unpriced (deliverable 07 §4) |

## 4. Audit gaps not closed

| Gap | Why it stays open |
| --- | --- |
| G-ID-06 principal identity references | Kai's founder-held angles and Sloane's wardrobe references are not imported; this sprint does not touch principal identity |
| G-LOOK-04 approved wardrobe | All wardrobe and props remain DESIGN_REQUIRED |
| G-AUD-02 approved dialogue masters | No voice master exists. S1-01 has no dialogue, so SH01 is not blocked by it. |
| G-TAKE-02 (part) | REVISE, INBOX and ACTIVITY |
| G-ASSET-01 (part) | live private storage |
| G-COST-02 (part) | the founder authorization surface |

## 5. Merge order (no merge was made)

1. #1690, #1692, #1693, #1694 (the existing Exchange stack).
2. #1695, workstream A (S1-01 packet alignment), based on #1694.
3. #1697, B2 (production spine), based on #1695.

#1696, B1 (spend gates and role policies), is based on `main` and is independent of 1–3. It can merge first.
