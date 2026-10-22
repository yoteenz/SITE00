# Tunnel smoke test

**Executed:** 2026-10-19 UTC against the canonical tunnel URL (see `TUNNEL_CONFIGURATION.md`)

| Test | Result |
| --- | --- |
| Root `/` HTTP | **200** |
| `/admin/site00/founder-workspace/overview` HTTP | **200** (SPA shell) |
| `/admin/site00/foundation-readiness` HTTP | **200** (SPA shell; client redirect to workspace System) |
| Page source entry | **`/src/main.tsx?v=dev-local`** (Vite dev — correct for cloud tunnel) |
| `/src/main.tsx?v=dev-local` HTTP | **200** |
| Worktree module `FounderWorkspaceApp.tsx` | **200** |
| `POST /api/dev/site00-digital-foundation-preview-bootstrap` | **200** (preview-only bootstrap) |

## Not automated (founder session)

| Test | Status |
| --- | --- |
| Supabase login completion | **Founder-controlled** |
| Authenticated workspace render | **Founder review step** |
| Overlay open/close on device | **Founder review step** |

## How to re-run (agent)

```bash
T="${SITE00_CLOUDFLARE_TUNNEL_HOSTNAME:?set in Cloud Secrets}"
T="${T%/}"
curl -sS -o /dev/null -w 'root=%{http_code}\n' "$T/"
curl -sS -o /dev/null -w 'fw=%{http_code}\n' "$T/admin/site00/founder-workspace/overview"
curl -sS "$T/" | rg -o 'main\.tsx\?v=dev-local|index\.[A-Za-z0-9_-]+\.js' | head -1
cat /tmp/site00-preview-runtime-lineage.txt
```

**Pass criteria:** HTTP 200 + `main.tsx?v=dev-local` + `PREVIEW_SHA` matches review branch HEAD.
