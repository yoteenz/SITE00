# Foundation security verification

**Scope:** Automated + spot checks this sprint; not a full penetration test.

| Test | Result | Notes |
| --- | --- | --- |
| Invalid / missing token | PASS | `ARTIFACT_NOT_FOUND`; handler returns 404 |
| Cross-client token guess | Not exhaustively tested | Opaque tokens; no IDOR test across two real artifacts on production |
| Forged founder message | Not tested | Admin requires auth (Bearer); cloud preview uses stub user only |
| Forged approval / payment UI | N/A browser | Server-side state from API |
| Replayed webhook | PASS (vitest) | Idempotency on stripe event id |
| Invalid quote version payment | PASS (vitest) | Rejected in webhook confirmation |
| Unauthorized file/record access | **BLOCKED** | Records E2E not run |
| Client calling founder admin API | Expected 401/403 off preview | Not curl-tested against production |
| Token in third-party analytics | Not audited | Founder should confirm tag managers exclude foundation URLs |
| Launch gate blocks checkout | PASS (vitest) | `LAUNCH_GATE_INTAKE_ONLY` |

## Fail-closed behaviors confirmed in code review

- Checkout disabled when intake-only gate on.
- Client messaging send gated on paid state.
- Communications default DRY_RUN.

## Recommended before production

- Run cross-artifact access test on staging with two disposable tokens.
- Verify production admin routes reject unauthenticated requests.
- Confirm Supabase RLS / service role usage for DF tables when persistence enabled.
