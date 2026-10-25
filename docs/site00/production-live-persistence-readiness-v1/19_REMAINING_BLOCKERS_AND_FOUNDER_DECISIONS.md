# 19 — Remaining blockers and founder decisions

Sprint §33/§34. Every item here is open. None is resolved by technical readiness.

## 1. Infrastructure blockers

| Blocker | Classification | What unblocks it |
| --- | --- | --- |
| Spine schema not on any Supabase project | STAGING_VERIFIED: BLOCKED; PRODUCTION_DEPLOYED: no | Founder approves staging changes → deliverable 18 Stage 2 |
| Private masters bucket not live | Live storage verification BLOCKED | Stage 2.1 creates it; 2.2 verifies it |
| #1696 and the security follow-up not deployed: two `service_role_all` policies open to `public`, two production-graph tables without RLS, one SECURITY DEFINER function open to anon (all live, read-only finding) | Exposure live in production | Stage 1 (founder-approved) |
| No OpenArt executor for the deployed API | Provider route BLOCKED | Founder decision D-B below |
| No PostgREST layer tested locally | The HTTP layer is exercised only by the staging script | Stage 2.2 |
| `site00-staging` has no managed-project registry | Stage 2.1 must apply `20260826123000` first | Included in the plan |
| Production migration drift: fiction canon (20261022), invitation system, DF messaging not applied | Unrelated to the spine; noted | Separate founder review |
| **Paid provider paths outside the spine: 15 ungated and 10 client-flag-only, most public (no session; CORS `*`)** | §14 PARTIAL. A pre-existing live exposure, depending on which keys and flags Railway sets. | Founder decision D-I; deliverable 09 §8 |

## 2. Founder decisions (new in this sprint)

| # | Decision | Default until decided |
| --- | --- | --- |
| D-A | Approve deploying the security repairs (Stage 1) | Not deployed |
| D-B | How the deployed system reaches OpenArt: (a) an agent-session executor the founder runs per job, or (b) a server credential the founder provisions. The founder's ChatGPT/OpenArt app session is not either. | Route disabled |
| D-C | Approve staging changes (Stage 2), then production (Stage 3) | Repository catalogue, read-only |
| D-D | Who besides the founder gets project roles (`site00_spine_members`), and which | Founder only; other admins refused |
| D-E | May a REVIEWER approve or reject takes? (Sprint step 12 reads "the reviewer can approve it"; this build keeps take approval with the founder.) | Founder only |
| D-F | `studio_world_atomic_reserve_budget` is SECURITY DEFINER and open to anon/authenticated in production, but defined outside this repository | Reported only |
| D-G | FS Website findings: 15 SECURITY DEFINER functions open to anon/authenticated; public INSERT/UPDATE policies on the `live-preview` bucket | Reported only; another product |
| D-H | Quote freshness limit (24 h) and authorization lifetime (≤ 24 h) | As built |
| **D-I** | Close the paid paths outside the spine (deliverable 09 §8). Immediate, no code: set `SITE00_CREATIVE_REASONING_FORCE_FALLBACK=1` on Railway, and confirm which provider keys the API needs. Then a security branch from `main`: an admin/founder guard on every ungated and client-flag entry point, opt-in dispatch in the Evolve services, no GET resumes, UNKNOWN instead of zero cost, restricted CORS, and screens that send the session. | Not changed: these are other product systems, and closing them changes how the founder's screens call the API |

## 3. S1-01 / SH01 creative and financial decisions

From deliverable 15, in the suggested order:

| Order | Decision | SH01 |
| --- | --- | --- |
| 1 | FD-S101-01 screenplay v2 | GLOBAL |
| 2 | FD-S101-09 24 fps | GLOBAL |
| 3 | FD-S101-08 how the street is seeded (photograph or 2 candidates) | SH01-SPECIFIC |
| 4 | FD-S101-11 generation budget (re-quote first; 255 cr is a 24 Oct planning estimate) | GLOBAL |
| 5 | FD-S101-12 teenager's four-count | later shots (SH05–SH07) |
| 6 | FD-S101-05 dress design | later shots (SH08–SH10, SH17, SH18) |
| 7 | FD-S101-03 the Ember's look | later shot (SH14) |
| 8 | FD-S101-04 Halcyon House exterior | later shot (SH18) |
| 9 | FD-S101-02 music route | audio; scene-wide DIRECTION only |
| 10 | FD-S101-10 title card | edit only |

The authorization steps follow the decisions:

- SCREENPLAY and DIRECTION: scoped to S1-01/INTENT and SH01 at minimum;
- KEYFRAMES and GENERATION_BUDGET: scoped to KF-ENV-CITY-DUSK-A;
- PRODUCTION: scoped to SH01;
- then the reference approval and the one VIDEO-01 job authorization.

## 4. Known limits (not blockers)

- **Status names.** Only `completed` and `failed` have been observed for OpenArt creations. Any other status stops the job for a person.
- **Charges.** OpenArt creation records carry no charge, so actual spend stays UNKNOWN and the quote is counted.
- **Revoking Supabase links.** A Supabase signed URL cannot be revoked individually before expiry. Preview links last 5 minutes.
- **Mobile text size.** The 7 px secondary text on mobile comes from the shared HUB density authority.
- **Step prerequisites ignore scope.** A scoped authorization of an earlier step satisfies the later step's prerequisite. Each job still needs its own target element approved and, for video or references, its scope; so nothing outside the founder's scopes can be generated.
