# Anthony — infrastructure access matrix

**Updated:** 2026-10-10 UTC  
**Composer environment:** Cursor cloud VM (this run)

| Path | Target | Protocol | Reachability | Auth | Data result | Environment |
| --- | --- | --- | --- | --- | --- | --- |
| **A** | Supabase Management API | HTTPS | OK | MCP OAuth | Project `ACTIVE_HEALTHY` | Cursor MCP |
| **B** | `hyycomvcaqxxvyrfupes.supabase.co` REST (invalid key) | HTTPS | OK | 401 | No DB round-trip | Cursor VM |
| **B** | Same REST (valid anon / service role) | HTTPS | Edge OK | Key accepted at edge | **Timeout ~12–15 s** | Cursor VM |
| **C** | `db.…supabase.co:5432` | Postgres | **IPv4 DNS fail** on VM | N/A | Not tested | Cursor VM |
| **D** | `aws-0-us-east-1.pooler.supabase.com:6543` | Postgres pooler TCP | **TCP open** | N/A | Query not run (no password in chat) | Cursor VM |
| **E** | `https://api.site00.com/api/health` | HTTPS | OK | Public | DF flags on disk | Production Railway |
| **E** | `…/digital-foundation-artifact?action=payload` | HTTPS | OK | Token | **500 ~20 s** (Supabase read) | Production Railway |
| **F** | `https://site00.com/` | HTTPS | OK | Public | SPA **Sep 2026** bundle | GoDaddy cPanel |
| **G** | Supabase SQL Editor | HTTPS | **Not exercised** | Founder session | Unknown | Browser |

## Tooling on Composer VM

| Tool | Status | Founder next step |
| --- | --- | --- |
| **Railway CLI** | Not installed / not authenticated | Railway dashboard → Project → **Connect GitHub** deploy from `main`, or add `RAILWAY_TOKEN` to Cursor Cloud Secrets and install CLI in environment |
| **Supabase CLI** | Not installed | Optional: `npm i -g supabase` + `supabase login` on a trusted machine; or use Dashboard SQL Editor |
| **cPanel / SFTP** | Not connected | GoDaddy → **File Manager** or SFTP to `public_html`; upload GitHub Release ZIP |
| **GitHub Releases** | **Connected** (gh) | ZIP artifacts available (`site00-deploy-2026-10-10-v11` = latest frontend build from `ce75811a`) |

## Credential handling

- Never commit `SUPABASE_SERVICE_ROLE_KEY`, Railway tokens, or cPanel passwords.
- Cursor Cloud Secrets: `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_*`, optional `RAILWAY_TOKEN`.
- Production API already has Supabase service role on Railway (configured — reads still timeout).

## Classification summary

| Question | Answer |
| --- | --- |
| Cursor vs Railway Supabase | **Both fail** on data reads |
| Network vs database | **Database / PostgREST backend** (edge fast, queries hang) |
| Management vs data plane | **Split-brain:** control plane healthy, data plane blocked |
