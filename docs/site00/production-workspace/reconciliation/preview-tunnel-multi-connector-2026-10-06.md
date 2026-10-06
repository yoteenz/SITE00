# Preview tunnel “branch switching” — multi-connector load balancing

**Date:** 2026-10-06  
**Symptom:** The preview tunnel hostname (`SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`) alternates between `main.tsx?v=dev-local` (correct `origin/main` dev server) and stale `index.*.js` production bundles from other checkouts.

## Root cause

| Factor | Effect |
| --- | --- |
| Same `SITE00_CLOUDFLARE_TUNNEL_TOKEN` on every Cursor Cloud agent | Each running agent registers a **Cloudflare tunnel connector** pointing at **its own** `localhost:5174`. |
| Cloudflare ingress for one hostname | Traffic is **load-balanced** across all healthy connectors. |
| Idle / Grok / CI-preview agents still running `cloudflared` | Connectors serve old `vite preview` dists or wrong worktrees. |

This is **not** git changing branch on a single server. It is **which connector** answers the request.

## Verify on your machine

```bash
# Local (this agent) — should match /tmp/site00-preview-runtime-lineage.txt
curl -sI http://127.0.0.1:5174/ | grep -i x-site00-preview-commit

# Public — repeat; bundle fingerprint may change each request
for i in 1 2 3 4 5 6; do
  curl -s "https://${SITE00_CLOUDFLARE_TUNNEL_HOSTNAME}/" | grep -oE 'index\.[A-Za-z0-9_-]+\.js|main\.tsx\?v=dev-local' | head -1
done
```

Mixed output ⇒ multi-connector roulette.

## Fix (repo + ops)

### 1. Canonical connector gate (code)

`run-site00-preview-tunnel.sh` runs `cloudflared` **only** when:

`SITE00_CLOUDFLARE_TUNNEL_CANONICAL=1`

in **Cursor Cloud Secrets** for that environment.

All other agents exit the tunnel terminal without registering a connector.

Set the flag on **exactly one** SITE 00 preview environment (the one that runs `serve-site00-preview-from-main.sh` on current `origin/main`).

### 2. Stop stale connectors (founder / Cloudflare)

- **Cursor:** Archive or stop idle cloud agents that still run old tunnel scripts.
- **This VM:** `bash .cursor/scripts/stop-site00-preview-tunnel-local.sh` then restart tunnel only on the canonical environment.
- **Cloudflare Zero Trust:** Remove dead connectors for the tunnel, or rotate the token if connectors cannot be pruned.

### 3. Vite authority (already on main)

Use `serve-site00-preview-from-main.sh` + `ensure-site00-preview-main-authority.sh` so **this** agent’s `:5174` is always `origin/main` dev mode when canonical.

Do **not** use `ensure-grok-environment-unified-preview.sh` for #1404+ workspace review unless reviewing that branch explicitly.

## Good vs bad page source

| Good | Bad |
| --- | --- |
| `/src/main.tsx?v=dev-local` | Only `index.CR09zRNl.js` or other hashed prod chunk |
| Header `X-Site00-Preview-Commit` matches `origin/main` | No dev entry; old manifest SHA |

Production marketing site: **site00.com** (GoDaddy ZIP) — not the tunnel.

## Single git branch for founder preview (2026-10-06)

| Branch | Purpose |
| --- | --- |
| **`preview/tunnel`** | What the canonical tunnel worktree mounts (`PREVIEW_AUTHORITY=origin/preview/tunnel`). |
| **`main`** | All agent PRs merge here; CI fast-forwards `preview/tunnel` on every push to `main`. |

Work on `cursor/*` is **not** on the tunnel until merged. After merge, run `bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh` on the canonical preview environment (or wait for CI + vite restart).
