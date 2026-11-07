# 03 · AUTHENTICATION

JURNL uses the existing Supabase Auth stack. JURNL never stores, hashes or logs a password.

| Capability | Implementation | Evidence | Verified against a real Supabase Auth server? |
|---|---|---|---|
| Registration | `supabaseAuthAdapter.signUp`. The email link returns to `/jurnl/app/entry/verify-email`. | browser E2E (stubbed auth) | NO |
| Duplicate email | Supabase answers an existing address with a user that has no identities, which maps to `EMAIL_IN_USE`. | stub E2E path | NO |
| Email verification | Default templates: the session arrives in the URL. Custom templates: `token_hash` is checked with `verifyOtp`. | E2E: an unverified sign-in is refused and returns to CHECK YOUR EMAIL | NO. Real delivery is **not verified**. |
| Resend verification | `auth.resend({type:'signup'})` with the same redirect | code | NO |
| Sign in | `signInWithPassword`. An unconfirmed address maps to `EMAIL_NOT_VERIFIED` and routes to F01.02. | E2E | NO |
| Invalid credentials | `invalid_credentials` maps to `INCORRECT_PASSWORD` | code | NO |
| Rate limiting | HTTP 429 or `*rate_limit*` maps to `RATE_LIMITED` (toast: TOO MANY ATTEMPTS). Supabase enforces the limits themselves. | code | NO |
| Password reset | `resetPasswordForEmail` with a redirect to `/jurnl/app/entry/new-password`. It gives the same answer whether or not the address exists (no account enumeration). The reset screen requires a recovery session or a `token_hash`. | code | NO |
| Password change | `changePassword`: the current password is re-checked, then `updateUser`. | code | NO |
| Session restore | supabase-js persisted session, then `onAuthStateChange`, then hydrate. | E2E: sign out, sign in, the records restore | NO |
| Sign out | `auth.signOut()`. The user's device financial cache is purged unless it holds unsynced changes. | unit (33-step, steps 27 and 30) and E2E | NO |
| Expired session | A 401 on hydrate or sync signs the user out with SESSION ENDED. | code (existing) | NO |
| Account deletion | `POST /api/jurnl/account-delete` revokes every bank Item first; nothing is deleted if any revocation fails. It then deletes the auth user (cascade). | code; cascade proven in the RLS tests | NO |

**Known constraint.** The founder's FOUNDER_FULL grant has append-only audit rows (FK RESTRICT, set by the grants migration). Deleting the founder's auth user is therefore refused by the database until a founder-approved retention decision is made. The endpoint reports `ACCOUNT_DELETE_FAILED` and does not claim the deletion happened.

**Not claimed.** The sprint forbids claiming email verification works based on mocked tests. Real delivery needs a JURNL Supabase project with SMTP configured; that is founder action F-2.
