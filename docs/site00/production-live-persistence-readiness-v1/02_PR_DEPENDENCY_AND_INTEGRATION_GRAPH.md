# 02 — PR dependency and integration graph

Sprint P0.SITE00.STUDIOWORLD.PRODUCTION-LIVE-PERSISTENCE-SECURITY-AND-FIRST-SHOT-READINESS.V1, §01 and §02. Heads, bases and states were read from GitHub at the start of the sprint and again before this report. No PR was merged, rebased, force-pushed or edited.

## 1. The verified graph

```
main 159c0fa9
 ├─ #1690 canon lock                cursor/the-exchange-canon-lock-screenplay-8aec          3466534f
 │   └─ #1692 directorial engine V2 cursor/the-exchange-directorial-production-engine-8aec  b0a63b95
 │       └─ #1693 living-world audit + Character Studios audit   claude/ready-r60enh        d6fcbcf4
 │           ·  (f43aa1f0: the audit branch before its last commit)
 │           └─ #1694 living-world promotion   claude/the-exchange-living-world-promotion   d1f41ae3  (base = ready-r60enh at f43aa1f0)
 │               └─ #1695 S1-01 packet patches  claude/the-exchange-s101-packet-alignment   6dda1c51
 │                   └─ #1697 record spine + Takes  claude/studioworld-production-record-spine  0f987a3f (code 0877342e)
 └─ #1696 spend gates + policy repair  claude/production-spend-gates-and-policy-repair       30577615
     └─ #1698 security follow-up       claude/production-security-rls-hardening              fd899040
```

- **#1697 does not contain #1693's head.** #1694 was cut from `ready-r60enh` at f43aa1f0. #1693 then gained d6fcbcf4, the Character Studios / Director Composer audit: 24 files, all under `docs/studio-world/character-studios-director-composer-audit-v1/`.
- **#1696 shares no file with the stack.** It is based on `main`.
- **Before this sprint, #1696 added the only migration in the set:** `20261025120000_site00_restrict_service_role_all_policies.sql`. #1690, #1692, #1693, #1694, #1695 and #1697 add none.

## 2. New branches (this sprint)

| Branch | From | Contains | Why separate |
| --- | --- | --- | --- |
| `claude/production-security-rls-hardening` (**PR #1698**, base #1696's branch) | #1696 (30577615) | #1696 plus migration `20261026090000`: RLS on the two production-graph tables, and EXECUTE on `site00_allocate_access_credential_code()` limited to service_role | Security repairs deploy on their own, before any application change (§02: keep the deployment sequencing separate) |
| `claude/production-live-persistence-readiness` (**PR #1699**, base #1697's branch) | #1697 (0f987a3f) | `--no-ff` merges of the security branch (so #1696 too) and of #1693's d6fcbcf4, then this sprint's work: durable store migration `20261026100000`, store, roles, gate, runner, UI, scripts, tests and deliverables | The reviewable integration branch: every open PR head in one tree, with no history rewritten |

Both merges were clean. The audit merge brings in documentation only, and it is not duplicated anywhere.

## 3. Dependency map

| PR | Base | Commit | Required predecessor | Migration dependency | Code dependency | Test status | Merge readiness | Deployment readiness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #1690 | main | 3466534f | none | none | none | Its suites pass in the integration tree (deliverable 20) | Ready for founder review | Docs and canon only; nothing to deploy |
| #1692 | #1690 | b0a63b95 | #1690 | none | fiction-production engine on #1690's canon | As above | After #1690 | Canon/docs; scripts only |
| #1693 | #1692 | d6fcbcf4 | #1692 | none | none (documentation) | n/a (docs) | After #1692 | Nothing to deploy |
| #1694 | ready-r60enh @ f43aa1f0 | d1f41ae3 | #1693's f43aa1f0 (not its head) | none | promotion ledger on #1693's audit | As above | After #1693; retarget to #1693's head or merge in order | Canon only |
| #1695 | #1694 | 6dda1c51 | #1694 | none | S1-01 builders | `theExchangeS101PacketAlignment` passes | After #1694 | Canon only |
| #1696 | main | 30577615 | none | adds 20261025120000 (policy repair) | Expression Engine and ASSTS dispatch opt-in | 15/15 spend-gate tests; policy check 16/16 (B1) | Independent; can merge first | API redeploy (Railway) plus the migration, founder-approved (deliverable 18) |
| #1698 security follow-up | #1696 | fd899040 | #1696 | adds 20261026090000; needs the production-graph migration (20260823210000) and the access-credential migration (20260820000000) applied | none | 20/20 on a throwaway PostgreSQL 16 | After #1696 | Migration only, founder-approved, before any app change |
| #1697 | #1695 | 0f987a3f | #1695 | none (pilot JSON store) | fiction-production engine; spine | Its suites pass (now superseded by the integration branch) | After #1695 | Read-only planning catalogue; safe |
| #1699 integration | #1697 | branch head | #1697, security follow-up, #1693 head | adds 20261026100000; needs 20260826123000 (managed-project registry) and the auth and storage schemas | spine, API, Takes UI | deliverable 20 | After #1697 and the security follow-up | Staging first; production only after founder approval (deliverable 18) |

## 4. Suggested merge order (the founder's decision; nothing was merged)

1. **#1696**, then the security follow-up. Deploy and verify both on their own (deliverable 18, stages 1 and 2).
2. **The fiction stack in order:** #1690 → #1692 → #1693 → #1694 → #1695.
   - **#1694 is based on f43aa1f0, an earlier commit of #1693's branch.** If #1693 merges first, GitHub shows #1694's diff against the merged base, and nothing needs to be redone.
3. **#1697**, then the integration branch. Alternatively, merge only the integration branch in place of #1697: it contains #1697's commits.
