# 01 — Implementation summary

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, repository `yoteenz/SITE00`.

Two coordinated workstreams in three branches and three pull requests.

**What did not happen:**

- No media was generated.
- No provider was called and no credit was spent.
- Nothing was merged or deployed.
- **The first shot was not generated.**

## Workstream A: the S1-01 directorial packet

**The seven founder-authorized patches (PATCH-S101-01 to -07) are applied.** The packet is regenerated deterministically.

- **The three neighbours.** The tailor, the teenager and the grandmother are recurring background identities (FD-S101-06 answered).
- **The tailor** stays anonymous (FD-S101-07 answered).
- **The grandmother** stays the S1-59 speaking grandmother. Her identity reference is KF-SF-SH10, which shows her face; the plan named SH09, which hides it.
- **The dress.** Its story half is approved and its design is pending, so its keyframe stays blocked.
- **The teenager** tries a four-count step across SH05 to SH07. Locking it is new open decision FD-S101-12.
- **Forward references:** grandmother to S1-59 and S1-77, tailor to S1-77, teenager to S1-51. Nobody meets, there is no invitation-only Exchange Night and there is no new dialogue.

**Unchanged:**

- 45 s, 1,080 frames, 19 shots in order and every cue;
- no title card, and Halcyon House windows only;
- 86 releases and 127:40;
- the 53 remaining proposals unapproved, and the screenplay DRAFT.

Details: deliverables 03 and 04.

## Workstream B: the production spine

**B1 closes the two ways credits could be spent without an explicit action.**

- Expression Engine generation on page load.
- ASSTS reads that queued and retried generation.

B1 also repairs the two database policies that let any role read and write two service tables, and verifies the repair on a throwaway database. Production was not changed. Details: deliverables 07 and 08.

**B2 builds the production record spine.**

- **Records.** Typed records link project, release, scene, shot, job, take, asset, provider, approval, budget and continuity reference.
- **Machines.** Job and take state machines with no automatic retry or regeneration.
- **Spend gate.** The only thing that can hand a request to a provider.
- **Storage.**
  - Repository-JSON record storage behind an interface a Supabase store can replace.
  - Private, content-addressed media with signed, expiring reads.
- **Runner and transports.** A runner with a fake provider for tests, and a disabled OpenArt route.
- **Frames.** Frame extraction for continuity.

THE EXCHANGE is now a managed production project:

- **Takes screen.** Its EXPRESSION → TAKES route shows the Takes workspace.
- **Real records.** APPROVE, HOLD, REJECT and SELECT FOR EDIT write real records.
- **Cast.** Sloane, Gideon and Kai stay project-local.

Details: deliverables 05, 06 and 09 to 12.

## S1-01-SH01

- **Status:** PRODUCTION_SETUP_READY / GENERATION_AUTHORIZATION_PENDING. **Never GENERATION_READY.**
- **Planning estimate:** 255 credits. That is two 40-credit reference images plus a 175-credit, 5-second video. It is an estimate, not a budget: nothing is authorized, reserved or spent.
- **Waits on:** FD-S101-01 (screenplay), FD-S101-08 (street reference) and FD-S101-11 (generation authorization). All three are OPEN.
- **Dry run:** the 20-step zero-spend dry run passes, with 0 network calls and live records unchanged (deliverable 12). It is a simulation: no footage exists.

## Where to look

| For | Read |
| --- | --- |
| The decision in front of you | 14 (remaining blockers) and 16 (completion report) |
| What changed in S1-01 | 03 |
| Whether money can leak | 07 and 10 |
| The Takes screen | 11 (with screenshots in the FULL package) |
| Tests and build | 15 |
