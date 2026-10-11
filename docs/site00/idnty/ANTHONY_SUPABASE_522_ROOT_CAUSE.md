# Anthony — Supabase 522 / timeout root-cause analysis

**Project:** FS Website · ref `hyycomvcaqxxvyrfupes` · region `us-east-1`  
**Audit UTC:** 2026-10-10  
**Sprint:** P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-ANTHONY-INFRASTRUCTURE-UNBLOCK-DATABASE-RECOVERY-AND-DEPLOYMENT-EXECUTION5

## Executive summary

| Layer | Result |
| --- | --- |
| Supabase **management plane** | `ACTIVE_HEALTHY` (MCP `get_project`) |
| Supabase **edge / auth** | Reachable; invalid-key requests fail fast (**401**, ~70–130 ms) |
| Supabase **PostgREST + Postgres data path** | **BLOCKED** — authenticated REST and MCP SQL hang then fail (~12–20 s) |
| **Production Railway API → Supabase** | **FAIL** — `action=payload` hangs ~20 s → **500** `{ "error": "[object Object]" }` |
| **Cursor cloud VM → Supabase data path** | **FAIL** — same timeout pattern |

**Classification:** **CONFIRMED upstream database / PostgREST connectivity failure**, not DNS failure to the API hostname and not “management says down.”

Cloudflare **522** (connection timed out) is the edge symptom when PostgREST cannot obtain a timely Postgres response. From this environment, requests often **client-timeout** before returning 522, but the failure mode is the same class.

## Evidence (sanitized)

### A — Management API

- MCP `get_project` → `status: ACTIVE_HEALTHY`, Postgres 17.6, host `db.hyycomvcaqxxvyrfupes.supabase.co`

### B — REST / Auth (no valid DB round-trip)

| Target | HTTP | Latency | Interpretation |
| --- | --- | --- | --- |
| `GET …/rest/v1/` + invalid apikey | 401 | ~0.07 s | Edge alive |
| `GET …/auth/v1/health` (no key) | 401 | ~0.06 s | Edge alive |

### B — REST (requires PostgREST → Postgres)

| Target | HTTP | Latency | Interpretation |
| --- | --- | --- | --- |
| `GET …/rest/v1/site00_df_artifacts?…` + valid anon key | *(timeout)* | **12 s** (client abort) | Data path stuck |
| Service-role REST (env present, key not logged) | *(timeout)* | **15 s** | Data path stuck |

### C — MCP SQL / migrations (management → Postgres)

| Tool | Result |
| --- | --- |
| `execute_sql` `SELECT 1` | Connection timeout |
| `list_migrations` | Connection timeout |
| `list_tables` | Connection timeout |

### D — Logs (ClickHouse — works without live SQL editor)

- MCP `query_logs` on unified `logs` stream: **OK** (storage + edge sources present).
- `postgres_logs` last 6 h: **empty result** in sampled window (no recent postgres log lines returned — not proof of health).

### E — Production API (Railway)

```http
GET https://api.site00.com/api/health
→ 200, gitCommit 56cae6852f0c, digitalFoundation.persistSupabaseEnv true, launchGateIntakeOnly true
```

```http
GET …/digital-foundation-artifact?action=catalog
→ 200 ~0.14 s (no Supabase read)
```

```http
GET …/digital-foundation-artifact?action=payload&token=<disposable-uuid>
→ 500 ~20.0 s, error "[object Object]" (Supabase read via service role — **PR #1585 maps this to 503**)
```

**Conclusion:** Railway **does** reach Supabase edge but **cannot complete** artifact table reads within the client timeout.

### F — Direct Postgres hostname (VM)

- `db.hyycomvcaqxxvyrfupes.supabase.co:5432` — Python connect: **No address associated with hostname** (IPv4 resolver on VM; DB host advertises **IPv6** in `getent`).
- `aws-0-us-east-1.pooler.supabase.com:6543` — TCP connect **OK** (~0.01 s). Pool reachability alone does not prove query success without credentials.

## Ruled out (this sprint)

| Hypothesis | Why unlikely |
| --- | --- |
| Wrong Supabase project ref on API | Health shows `hyycomvcaqxxvyrfupes.supabase.co` |
| Invalid API credentials only | Invalid key returns **401** quickly; valid key **hangs** |
| Total Supabase project pause | Management `ACTIVE_HEALTHY` |
| Cursor-only egress block | **Railway production reproduces** |

## Still open (needs Supabase dashboard / support)

- Postgres process hung, connection pool exhausted, or storage I/O stall
- PostgREST unable to connect to Postgres socket
- Platform incident localized to database compute (not control plane)
- IPv6-only DB host vs IPv4-only clients (secondary; REST path fails from Railway too)

## Least-destructive recovery options (founder approval each)

1. **Supabase Dashboard → Project → Database** — check status, connections, disk, recent restarts.
2. **SQL Editor** (if it loads) — run `SELECT 1;` then `\dt site00_df_*` (read-only inventory).
3. **Support package** — project ref, timestamps above, “authenticated REST and MCP SQL timeout ~15–20 s while management ACTIVE_HEALTHY.”
4. **Do not** restart database, rotate keys, or change network restrictions from this agent without explicit approval.

## Related PR (not merged)

- **#1585** (`cursor/df-gate-a-error-shape-a9f7`) — maps provider failures to **503** instead of **500 `[object Object]`**. Does **not** fix database connectivity; merge **after** DB path is healthy.
