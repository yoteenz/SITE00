# Full intake E2E matrix

| Step | Live staging | Local / automated |
| --- | --- | --- |
| Founder authenticates | NOT RUN (needs real session) | N/A |
| Readiness desk loads | PARTIAL — UI shell loads; 401 on readiness API without auth | PASS smoke (sign-in redirect unauth) |
| Create synthetic client | NOT RUN | PASS via unit/e2e memory tests |
| Supabase persist create | PASS (isolated vitest) | PASS |
| Personalized link open | NOT RUN on staging | PASS token routes in unit tests |
| Partial save + refresh | NOT RUN on staging | Covered by persistence repair tests |
| Business Type sheet | NOT RUN on staging (stale SPA) | PASS Phase 2 tests + local dev with flag |
| System B selections | NOT RUN on staging | PASS Sprint A component tests |
| Phone validation UI | NOT RUN on staging | PASS consolidated A tests |
| Server completion guard | NOT on staging API commit | PASS on integration code |
| Intake complete | NOT RUN on staging | PASS commerce tests with phone helper |
| Founder dashboard parity | NOT RUN | Partial founder readiness tests |

**Master journey (§09):** **BLOCKED** until staging redeploy + founder auth.
