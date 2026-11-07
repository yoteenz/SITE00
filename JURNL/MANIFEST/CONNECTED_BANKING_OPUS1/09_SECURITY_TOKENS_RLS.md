# 09 / 21 · SECURITY, TOKEN STORAGE, RLS

## Provider tokens

- **Encryption:** AES-256-GCM with a 12-byte random IV. The **item id is bound as AAD**, so a ciphertext moved to another Item will not open. The key is `JURNL_BANK_TOKEN_KEY` (32 bytes, base64), held by the API process only.
- **Key rotation:** `JURNL_BANK_TOKEN_KEY_VERSION`, with `_PREVIOUS` keeping old tokens readable.
- **Storage:** `jurnl_bank_item_secrets` has RLS on and **no policy**, and every privilege is revoked from `anon` and `authenticated`. Only the service role reads it.
- **Exposure:** a decrypted token exists only in memory for one provider call. It is never in a response, a URL or localStorage. Log payloads pass through `redactSecrets`.
- **Tests** (`bankingService.test.ts` → token security):
  - no `access-sandbox-…` string appears in item rows, logs or responses;
  - a tampered ciphertext and a moved ciphertext both fail;
  - rotation works.

## Row-level security (`migrationRls.test.ts`, disposable Postgres, real policies)

| Check | Result |
|---|---|
| Every `jurnl_*` table has RLS enabled | PASS |
| A user reads only their own items, accounts and transactions (requirement I) | PASS |
| No end user can read the secrets or webhook tables, not even their own rows | PASS |
| A browser cannot UPDATE or INSERT banking rows, or call the apply / disconnect functions (no forged CONNECTED) | PASS |
| Snapshots are owner-only | PASS |
| A snapshot write must go through the compare-and-swap; direct INSERT / UPDATE and forged audit rows are refused | PASS |
| An anonymous caller cannot write | PASS |
| Deleting the auth user cascades every banking row | PASS |

## API

- **Authentication:** every banking op validates the Supabase JWT server-side (`/auth/v1/user`).
- **Authorization:** access to banking needs a server-resolved FOUNDER_FULL grant. A client flag, an email allowlist or a hard-coded address does not give access.
- **Ownership:** every Item op checks `item.user_id === caller`. A stranger gets 404.
- **Webhooks:** verified with an ES256 JWT over the raw body (`plaidAdapter.test.ts`, 3 cases with real signatures).
- **Credentials:** secrets are server env only. Sandbox and production use separate `PLAID_ENV` credentials, and sandbox and production snapshots can never replace each other (`JR422`).
- **Privacy:** no banking data goes to any AI provider; classification is deterministic and local.

## Not covered here

- A penetration test or an external security review.
- Plaid's own production security questionnaire. Plaid asks for it at the Production request; that is founder action F-4.
