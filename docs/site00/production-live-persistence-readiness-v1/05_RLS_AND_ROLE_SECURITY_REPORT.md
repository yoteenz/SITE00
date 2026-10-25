# 05 — RLS and role security report

Sprint §07 and §08.

- **Production was inspected read-only.** The Supabase MCP listings, advisors and SELECT queries ran against project `hyycomvcaqxxvyrfupes`. No production policy, table, function or bucket was changed. The repairs below are migrations awaiting a founder-approved deployment.
- **What "fixed" means here.** Nothing below is fixed in production until it is deployed and verified there (§08).

## 1. Roles

Five project roles, held per project in `site00_spine_members`. They fit the existing identity model:

- the API still requires an admin session (`resolveAdminAuth`);
- the founder (`FOUNDER_PRIVILEGED_ADMIN_EMAIL`) is FOUNDER on every spine project;
- every other admin needs a membership row. **An admin who is not a member of the project is refused** (`NOT_A_PROJECT_MEMBER`).

| Permission | FOUNDER | PRODUCTION_ADMIN | AUTHORIZED_EDITOR | REVIEWER | READ_ONLY |
| --- | :-: | :-: | :-: | :-: | :-: |
| VIEW, READ_MEDIA | ✓ | ✓ | ✓ | ✓ | ✓ |
| PREPARE_JOB (request authorization, record a quote) | ✓ | ✓ | ✓ | | |
| AUTHORIZE_SPEND (budget, job, revoke, retry) | ✓ | | | | |
| DISPATCH | ✓ | | | | |
| CANCEL_JOB, RECONCILE, RECAPTURE | ✓ | ✓ | | | |
| APPROVE_REFERENCE | ✓ | | | | |
| TAKE_APPROVE, TAKE_REJECT | ✓ | | | | |
| TAKE_HOLD | ✓ | ✓ | ✓ | ✓ | |
| SELECT_FOR_EDIT | ✓ | | ✓ | | |
| REVIEW_CONTINUITY (and inspection frames) | ✓ | ✓ | ✓ | ✓ | |
| EXTRACT_FRAME (canonical continuity frame) | ✓ | ✓ | ✓ | | |

- **Founder-only actions.** Spend, dispatch, reference approval and take approval belong to the founder alone. A test asserts that no other role ever gains one.
- **Take approval stays with the founder.** A REVIEWER-role member holds and reviews but does not approve. Whether reviewers should approve takes is listed as a founder decision (deliverable 19).

## 2. Where it is enforced (§07)

| Layer | Enforcement |
| --- | --- |
| API (`api/site00/production-spine.ts`) | The role comes from the project. Each action's permission is checked before any work (`ACTION_PERMISSION`). There is no endpoint that authorizes spend. |
| Runner (`runner.ts`, `machines.ts`, `permissions.ts`) | `requirePermission` before every change; job transitions and take rules name their roles |
| Spend gate (`gate.ts`) | `OPERATOR_NOT_AUTHORIZED` unless the dispatcher holds DISPATCH |
| Database | Approval-event checks (spend kinds by FOUNDER; APPROVE/REJECT by FOUNDER; SELECT by FOUNDER or AUTHORIZED_EDITOR; HOLD and continuity by reviewing roles). Take and job authority triggers. RLS. Service-role-only functions. |
| Asset access | Signed links name the project and expire within 15 minutes. The API serves only media a record of that project names. The bucket has no client policy. |
| Budget authorization | Founder only, in the runner (AUTHORIZE_SPEND) and the database (`spend_founder` check) |

A hidden button is not the control. Every refusal above is tested with the button's action called directly.

## 3. Tests

| Check | Result |
| --- | --- |
| Unauthorized access denied: wrong role at API, runner and database | PASS (unit tests; durable tests; dry-run steps 4 and 13) |
| Authorized access preserved: founder, editor selection, reviewer hold and continuity | PASS |
| Cross-project access denied: API, store scope, RLS, signed links | PASS (durable tests; dry-run step 17) |
| Approval escalation blocked: a reviewer's APPROVE or a non-founder authorization written straight to the database | PASS: refused by check constraints |
| Private asset access restricted | PASS (deliverable 07) |
| Provider credentials server-side: OpenArt session variables in the server environment disable the route | PASS. The client bundle check is in deliverable 09. |
| Anon: no table, view or function | PASS |
| Authenticated non-member: no row | PASS |

## 4. #1696 revalidated (§08)

#1696 repairs two `service_role_all` policies created without a TO clause (`site00_brand_creative_context`, `site00_page_concept_generation_runs`). On the integration tree:

- B1's `scripts/production/verify-role-policies.sh` passes 16 of 16 on a throwaway cluster.
- **Production, read-only.** Both policies still apply to `public`: #1696 is not deployed, so the exposure is live.
- **Correction to #1696's deliverable 08.** `site00_page_concept_generation_runs` *is* applied in production. That deliverable listed it as "likely not applied".

## 5. Further production findings (read-only) and what this sprint did

| Finding | Scope | Action |
| --- | --- | --- |
| RLS disabled on `site00_production_dependency_edges` and `site00_production_invalidation_events` (advisor ERROR); no app code uses them | SITE00 | Migration `20261026090000` (security follow-up branch): RLS on, service_role only. 20/20 isolated checks. |
| `site00_allocate_access_credential_code()` is SECURITY DEFINER and executable by anon and authenticated | SITE00 | The same migration revokes it from anon, authenticated and public, and grants it to service_role |
| `studio_world_atomic_reserve_budget` is SECURITY DEFINER and executable by anon and authenticated | Defined outside this repository | Reported only: no migration here defines it. Founder decision (deliverable 19). |
| 15 more SECURITY DEFINER functions open to anon/authenticated (hairstyle, psa, lounge, slay/trend) | FS Website | Reported only: another product |
| `storage.objects` policies "wig-preview 16ieuhz_0/1" allow public INSERT/UPDATE on the public `live-preview` bucket | FS Website | Reported only. The spine refuses `live-preview` by name. |
| Mutable `search_path` on 2 functions; leaked-password protection off; 95 tables with RLS and no policy (INFO, deny-all) | mixed | Reported only |
| Migration drift: production lacks fiction canon (20261022), the invitation system and DF messaging | SITE00 | Reported in the rollout plan (deliverable 18) |

## 6. Deployment and rollback

The plan and rollback for each step are in deliverable 18: #1696's migration, the security follow-up, then the spine migration on staging and later production. The security follow-up's rollback SQL is in the migration header. The spine migration drops nothing; its rollback is `drop` of the nine new tables, two views, eleven functions and one bucket, run only by the founder.
