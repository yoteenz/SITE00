# 05 — Production record spine specification

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, workstream B2 (§15, §16, §20; decisions D-01 and D-03). Branch `claude/studioworld-production-record-spine`. Code: `shared/site00-production-spine/`.

## 1. What it is

One typed record set takes a shot from planning to an approved take:

- **What was planned:** the shot setup and its budget.
- **What was asked of a provider:** the generation job.
- **What came back:** the asset.
- **What the founder decided:** the take and its approvals.
- **What later shots may reuse:** the continuity reference.

Four kinds are **references**, resolved from the project's existing canon. The spine never copies them:

| Kind | Resolved from (THE EXCHANGE) |
| --- | --- |
| PROJECT | `SEASON1_86_RELEASE_MASTER_V1.json` (86 releases, 127:40), cast authority PROJECT_LOCAL |
| RELEASE | the same master, one release row |
| SCENE | the S1-01 directorial packet (status, screenplay status) |
| PROVIDER | the route table in `directorial/routing.ts` and the transport's runtime status |

Seven kinds are **stored**: SHOT, GENERATION_JOB, TAKE, ASSET, APPROVAL, BUDGET and CONTINUITY_REFERENCE.

## 2. Relationships

```
PROJECT ─ RELEASE ─ SCENE ─ SHOT ─┬─ BUDGET ── APPROVAL (budget authorization)
                                  ├─ GENERATION_JOB ─┬─ APPROVAL (generation authorization / revoke)
                                  │                  ├─ ASSET (inputs: approved references)
                                  │                  └─ ASSET (outputs) ── TAKE ─┬─ APPROVAL (decisions, continuity review)
                                  │                                              └─ CONTINUITY_REFERENCE ── ASSET (frame)
                                  └─ references ── ASSET ── APPROVAL (reference approval)
PROVIDER ── GENERATION_JOB (routeId, provider, model)
```

Every stored record carries the same base fields:

- `kind`, `id` and `projectId`;
- `schemaVersion` (1) and `revision`;
- `createdAt`, `updatedAt` and `createdBy`;
- `fixture`, only on test data.

## 3. Generation job (all §16 fields)

| §16 field | Record field |
| --- | --- |
| Unique job ID | `id` (`JOB-<shot>-<slot>`) |
| Project, scene, shot | `projectId`, `sceneId`, `shotId` (and `releaseId`) |
| Requested outputs | `requestedOutputs` (media type, count, duration, aspect, resolution, audio) |
| Input references | `inputs[]` (role, reference ID, asset ID, content hash) |
| Provider, model, settings | `provider`, `model`, `mode`, `routeId`, `settings` |
| Quoted cost | `quotedCost` (credits, quote file and hash, quote time); null when no exact quote exists |
| Maximum authorized cost | `maxAuthorizedCost.credits` (null until a founder authorization) |
| Founder approval reference | `founderApprovalRef` (an APPROVAL record) |
| Provider operation ID | `providerOperationId` (NOT_AVAILABLE before submission) |
| Status | `status` (deliverable 06) |
| Submission and completion time | `submittedAt`, `completedAt` |
| Actual spend | `actualSpend.credits`: NOT_AVAILABLE before any attempt closes; UNKNOWN when the provider reports no charge |
| Output asset references | `outputAssetIds[]` |
| Error and retry history | `errors[]`, `attempts[]` (each attempt: authorization, ticket, operation, outcome, charged credits) |
| Audit information | `transitions[]` (from, to, time, actor, reason, evidence) |

Two more fields protect spend:

- **`inputHash`** is a SHA-256 over everything that changes what the provider would make.
- **`idempotencyKey`** is a SHA-256 over the job ID and the input hash.

## 4. Take (all §16 fields)

| §16 field | Record field |
| --- | --- |
| Stable take ID | `id` (`TAKE-<shot>-<nn>`) |
| Source job ID, shot ID | `jobId`, `shotId` (and `sceneId`, `releaseId`) |
| Storage reference, content hash | `storageRef` (`spine-media://…`), `contentSha256` |
| Runtime, resolution, frame rate, aspect, audio | `runtimeSec`, `resolution`, `frameRate`, `aspectRatio`, `audioPresent` |
| Continuity review | `continuity` (NOT_REVIEWED, PASS or ISSUES, and the approval that set it) |
| Founder decision | `decision` (READY_FOR_REVIEW, APPROVED, HELD or REJECTED) and `approvalIds[]` |
| Selected-for-edit status | `selectedForEdit` |

**Media facts come from the stored copy, not the provider.**

- Runtime, resolution, frame rate and audio presence are read by probing the stored copy with ffprobe.
- A value the probe cannot read is UNKNOWN. Nothing is taken from a provider's claims.

## 5. The other stored records

**ASSET**

- Media type and MIME type.
- Storage adapter, `storageRef`, SHA-256, byte size and the time it was verified.
- Lineage: source job, source take, derived-from asset and provider operation.
- The provider source **host** only. A provider URL is never stored (§6).

**APPROVAL** is one immutable decision:

- its kind (generation authorization, budget authorization, reference approval, take decision or continuity review);
- its subject, decision, actor and role, time and note;
- the founder decisions it relies on (FD-…) and the approval it supersedes.

A generation authorization also carries:

- the input hash it approved;
- its maximum credits and expiry;
- its budget.

**BUDGET**

- Release and shots.
- Status: PLANNING_ESTIMATE_ONLY, AUTHORIZED or CLOSED.
- Planned and authorized credits, and its approval.
- Its lines, and the quote file and hash it was priced from.

**CONTINUITY_REFERENCE**

- Take, shot, source asset and source hash.
- Frame index, timestamp and resolution.
- Frame asset and hash.
- The take's decision at extraction.
- Status: CANONICAL, INSPECTION_ONLY or INVALIDATED.

## 6. Storage contract (§20)

Business logic uses `RecordStore` only. Where the bytes live is a `StoreBackend`:

- **Repository JSON** (`node/jsonStore.ts`) is the D-03 pilot backend: one file per record at `<root>/<KIND>/<id>.json`, written to a temp file and renamed.
- **In-memory** (`store.ts`) is for tests.
- **A Supabase backend** needs only the three backend methods (`read`, `write`, `list`). None is written yet.

Each rule is enforced by the store, not the caller:

| Requirement | How |
| --- | --- |
| Schema validation | zod strict schemas per kind (`validate.ts`); unknown fields are refused |
| Versioning | `schemaVersion` on every record; a store refuses a version it does not read; `revision` counts accepted writes |
| Immutable approval history | APPROVAL records are create-only; an update is refused (IMMUTABLE_RECORD); a reversed decision is a new record |
| Idempotent writes | creating an identical record again is a no-op |
| Conflict detection | a different record under an existing ID, or an update from a stale revision, is refused (CONFLICT) |
| Reference integrity | every record a write points at must exist in the same project; `verifyStoreIntegrity` also checks the two-way links |
| Deterministic serialization | sorted keys at every depth, two-space indent, trailing newline |
| Retention | `RETENTION` table: approvals, budgets, jobs, shots, takes and continuity references are permanent; rejected-take media may be archived only by founder decision after 90 days; nothing is deleted automatically |
| No secrets or media | secret-like field names and any URL are refused; a record over 256 KB is refused; media lives in private storage (deliverable 09) |
| Project scoping | a store holds one project; another project's record, read or write, is refused (CROSS_PROJECT_DENIED) |
| Test data | a live store refuses records marked TEST_FIXTURE; a test store holds only them |
| GENERATION_READY is earned | a SHOT cannot be stored as GENERATION_READY while any decision is open, any reference unapproved or the live provider check not passed |

**Repository JSON is temporary pilot persistence.**

- It suits one operator working through the agent-session route.
- It is not a multi-user production database.
- A server running under the durable-persistence policy opens it read-only (`STORE_READ_ONLY`), because a deployed checkout does not keep writes. That policy applies when `NODE_ENV=production` or `SITE00_DURABLE_REQUIRED=1`; it is the same policy Studio World execution uses.
- Live writes need the durable store (deliverable 14).

## 7. THE EXCHANGE records committed now

`THE_EXCHANGE/SEASON_1/PRODUCTION_RECORDS/` holds five records. They are built by `scripts/production/build-exchange-production-records.ts` from the packet and the V2 quotes.

| Record | State |
| --- | --- |
| `BUDGET/BUDGET-S1-01-SH01-PILOT` | PLANNING_ESTIMATE_ONLY, 255 credits planned, 0 authorized |
| `SHOT/S1-01-SH01` | PRODUCTION_SETUP_READY / GENERATION_AUTHORIZATION_PENDING |
| `GENERATION_JOB/JOB-S1-01-SH01-REF-01`, `-REF-02` | DRAFT, 40 credits each (nano-banana-pro, 2K, 9:16) |
| `GENERATION_JOB/JOB-S1-01-SH01-VIDEO-01` | DRAFT, 175 credits (kling-3-omni, pro, 5 s, sound off) |

No take, asset or approval exists in the live catalogue.

## 8. Audit gaps (§15)

| Gap | Status after this sprint |
| --- | --- |
| G-GEN-01 runner with write-back | Closed in code and tested end to end with the fake provider. The real OpenArt route is built but disabled and unverified. |
| G-TAKE-01 take entity | Closed: one shot, many takes, each with source identity, references, settings, provider, model, cost, output and its own approval history; rejected takes are kept. |
| G-TAKE-02 dailies surface | Partly closed: EXPRESSION → TAKES plays the take and records APPROVE, HOLD, REJECT and SELECT FOR EDIT. Not done: REVISE, and delivery to INBOX and ACTIVITY. |
| G-ASSET-01 permanent private copy | Partly closed: content-addressed private storage, hash verification and signed reads exist and are tested. Live private storage is BLOCKED (deliverable 09). |
| G-COST-02 authorization at execution | Closed for spine jobs (deliverable 07 §4). The founder authorization surface is deliberately absent: D-11 is not granted. |
| G-ID-06 principal identity references | Open. Not touched by this sprint. |
| G-LOOK-04 approved wardrobe | Open. Not touched by this sprint. |
| G-AUD-02 approved dialogue masters | Open. Not touched by this sprint. |
