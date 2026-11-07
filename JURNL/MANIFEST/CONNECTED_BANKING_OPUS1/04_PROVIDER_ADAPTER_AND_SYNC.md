# 04 · PROVIDER ADAPTER, SYNC ENGINE, WEBHOOKS, CONNECTION HEALTH

## Provider-neutral boundary

`api/_lib/jurnlBanking/provider.ts` defines `BankingProvider`. It has:
- `createLinkSession` (new or update mode);
- `exchangePublicToken`;
- `getItem`;
- `getAccounts` (cached balances);
- `syncTransactions`;
- `removeItem`;
- `searchInstitutions`;
- `verifyWebhook`.

The interface has **no method that can move money**: no payment, no transfer, no credential change. A second aggregator implements the same interface, and Money does not change.

## Plaid adapter (`plaidProvider.ts`, official `plaid` SDK 49.0.0)

| Endpoint | Use |
|---|---|
| `/link/token/create` | Server-side only. `user.client_user_id` is the auth user id, never an email. The product is Transactions; Auth is opt-in (`JURNL_PLAID_AUTH`). `days_requested` defaults to 90. Update mode is used to reconnect (`access_token`, optional `account_selection_enabled`). |
| `/item/public_token/exchange` | Server only. The access token is sealed immediately with AES-256-GCM. |
| `/item/get` | Institution, consent expiration, products, error |
| `/accounts/get` | **Cached** balances, with no per-call Balance fee. `/accounts/balance/get` is never called. |
| `/transactions/sync` | Cursor; `count` 500; personal finance category included |
| `/item/remove` | Revokes the provider's access (and its billing) |
| `/institutions/search` | Real catalog checks; no institution id is hard-coded |
| `/webhook_verification_key/get` | Webhook JWT verification key, cached by `kid` |

- **Credentials** go only in the `PLAID-CLIENT-ID` and `PLAID-SECRET` headers.
- **Errors** are normalised to: REAUTH_REQUIRED, PERMISSION_REVOKED, INSTITUTION_UNAVAILABLE, RATE_LIMITED, MUTATION_DURING_PAGINATION, PRODUCT_NOT_READY, INVALID_TOKEN, INVALID_CREDENTIALS_CONFIG, NOT_FOUND and PROVIDER_ERROR. An unknown code stays PROVIDER_ERROR and is never guessed.

## Sync engine (`bankingService.runItemSync`)

1. Pages are fetched until `has_more` is false, starting from the stored cursor.
2. Balances are read with `/accounts/get`.
3. `jurnl_bank_apply_sync` runs in **one SQL transaction**. It applies:
   - accounts;
   - added and modified rows, as upserts keyed by the provider id (idempotent);
   - removals, kept as `REMOVED` history.

   Then it moves the cursor. The cursor moves **only** if the stored cursor still equals the cursor the run started from. A concurrent run is refused with `JR409` and recorded as SUPERSEDED.

Failure handling:
- **Mutation during pagination:** the run restarts from the original cursor, up to 3 attempts.
- **Rate limit:** one retry after 1 s, then `SYNC_ERROR`. The cursor is unchanged.
- **Product not ready:** balances are kept, the Item stays ACTIVE, and the run waits for the webhook.
- **Any other provider failure:** the Item status is set (NEEDS_REAUTH, PERMISSION_REVOKED, INSTITUTION_UNAVAILABLE or SYNC_ERROR), and the cursor and rows are untouched.

## Webhooks (`POST /api/jurnl/bank-webhook`)

**Verification.** The `Plaid-Verification` header is an ES256 JWT. Its key comes from `/webhook_verification_key/get`. `iat` must be within 5 minutes, and `request_body_sha256` must equal the SHA-256 of the **exact raw body**. Express keeps the raw bytes for this route only. The comparison is constant-time.

**Recording.** Every delivery is recorded with its body hash. An unverified delivery is stored as REJECTED and answered with 401. A duplicate delivery is ignored with 200.

**Handling.** A webhook is **only a hint**: JURNL syncs from the stored cursor and never writes data from the webhook body. Duplicate and out-of-order deliveries therefore cannot double-apply or reorder anything.

| Webhook | Action |
|---|---|
| TRANSACTIONS `SYNC_UPDATES_AVAILABLE`, `INITIAL_UPDATE`, `HISTORICAL_UPDATE`, `DEFAULT_UPDATE` | sync |
| ITEM `ERROR` | set the Item status |
| ITEM `PENDING_EXPIRATION`, `PENDING_DISCONNECT` | record the consent expiry |
| ITEM `USER_PERMISSION_REVOKED`, `USER_ACCOUNT_REVOKED` | PERMISSION_REVOKED |
| ITEM `LOGIN_REPAIRED` | ACTIVE, then sync |
| ITEM `NEW_ACCOUNTS_AVAILABLE` | flag it (update mode then offers account selection) |

## HTTP API (`/api/jurnl/bank?op=…`)

The ops are config, link-token, exchange, reconnect, connections, transactions, sync, disconnect and catalog.
- Every op except `config` and the webhook requires a Supabase session.
- By default it also requires an active **FOUNDER_FULL** grant, resolved server-side (`JURNL_BANKING_ACCESS`).
- Responses never contain an access token or the sync cursor.
- User reads (connections, transactions) run under **RLS** with the user's own JWT.

## Connection health (`data/banking/health.ts`; UI in `ConnectedAccountsPanel.tsx`)

The states are: NOT CONNECTED, CONNECTING, CONNECTED (first update on its way), UPDATING, UP TO DATE AS OF [time], DELAYED (more than 24 h), NEEDS RECONNECTION, ACCESS REMOVED, BANK UNAVAILABLE, SYNC PROBLEM and DISCONNECTED.

Each state is built from the **server's Item record only**; a local account never shows as CONNECTED. The actions offered are UPDATE NOW, RECONNECT (Link update mode: same Item, accounts, history and cursor) and DISCONNECT (with confirmation and an optional deletion of imported data).
