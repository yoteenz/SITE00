# Tunnel runtime reconciliation — POST-MERGE-TUNNEL-RUNTIME-RECONCILIATION1

**Sprint:** `P0.SITE00.PRODUCTION-WORKSPACE.POST-MERGE-TUNNEL-RUNTIME-RECONCILIATION1`  
**Source authority:** PR #1404 @ `88043d6b` on `origin/main`  
**Date:** 2026-10-06

## Four states (mandatory for founder-facing runtime sprints)

| State | Meaning |
| --- | --- |
| **SOURCE MERGED** | Feature branch merged to `main` |
| **RUNTIME MOUNTED** | Worktree / dist / dev server checkout includes that SHA |
| **TUNNEL SERVING** | Cloudflare tunnel → `:5174` process serves that runtime |
| **FOUNDER VERIFIED** | Live navigation + captures on the tunnel URL |

PR merged ≠ tunnel updated. Tests on a feature branch ≠ founder's live runtime.

## TUNNEL_BEFORE

| Field | Value |
| --- | --- |
| URL | `site00.fsbw-dev.com` (from `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`) |
| Process | `cloudflared tunnel` → `localhost:5174` |
| Dev server | `vite preview --port 5174` (PID ~3164 at inspection) |
| Command path | **`ensure-grok-environment-unified-preview.sh`** (not `serve-site00-preview-from-main.sh`) |
| Worktree | `/workspace/.worktrees/grok-environment-unified-review` |
| Branch | `cursor/grok-plus-environment-unified-review-87ed` |
| SHA | `c0cc47d7cff4` (pre–#1404) |
| Dist | `site00-v272-c0cc47d` / `index.BiG_RmhR.js` |
| CONTAINS_1404 | **NO** |
| CONTAINS_88043d6b | **NO** |

Evidence: tmux `site00_vite` pane log showed Grok unified review checkout and local build at `c0cc47d7`; `curl localhost:5174/release-manifest.json` reported `commitSha: c0cc47d7cff4`.

## ROOT_CAUSE

The founder-facing tunnel was still bound to the **Grok unified review worktree** at an old SHA. That bundle predates PR #1404, so NDXBOOK fallbacks and pre-reconciliation routing remained in the served JavaScript. Git on `main` was correct; **runtime lineage was never remounted** after #1404 merged.

## RECONCILIATION

| Step | Action |
| --- | --- |
| Method | Kill stale `site00_vite` tmux session; restart **`serve-site00-preview-from-main.sh`** |
| Worktree | Created `/tmp/site00-preview-main` detached at `origin/main` (`88043d6b`) |
| Mode | `SITE00_CLOUD_PREVIEW_MODE=dev` — Vite dev server (not stale `vite preview` dist) |
| Preserved | Grok worktree left on disk; no hard reset; pin file removed (`/tmp/site00-cloud-preview-pinned-ref`) |
| Conflicts | None |

## TUNNEL_AFTER

| Field | Value |
| --- | --- |
| URL | Same tunnel hostname → `:5174` |
| Worktree | `/tmp/site00-preview-main` |
| SHA | `88043d6b8acb3c215c03d496bc0173c49891e048` |
| Dev server | `npm run dev` / Vite 5.4 on `:5174` (PID ~14501) |
| DEV_SERVER_RESTARTED | **YES** |
| CONTAINS_1404 | **YES** |

## Fallback verification (#1404)

Runtime source at `/tmp/site00-preview-main` matches [legacy-default-fallbacks.md](./legacy-default-fallbacks.md): workspace path uses `?? ''` (no NDXBOOK default) in `ProductionWorkspaceContext.tsx` and related files. Remaining `'ndxbook'` literals are **scoped** (NDXBOOK-only routes, Entry 002, reconstruction workspace under `/production/ndxbook/...`).

## Live proof (2026-10-06)

- **Mobile QA:** `BASE=http://127.0.0.1:5174 VIEWPORTS=mobile SHOTS=1` → **35/35 routes**, **17/17 flows**, **0 leaks**
- **Tests:** `productionProjectIsolation.test.tsx` 32/32; `productionProjectGraph` + `jurnlF01ProjectIngestion` 38/38
- **Captures:** `/opt/cursor/artifacts/post-reconcile-qa/mobile/` (all projects × tabs); manual `/opt/cursor/artifacts/*-post-reconcile.png`

## Release pipeline (separate)

`SITE 00 Production Release` on main **failed** for PR #1404 merge (run `37505982005`): CI tests hit `BrandLoreStoreUnavailableError` (missing `20260821050000_site00_brand_lore_profiles.sql`) and an orchestration assertion. **Not** the cause of the stale tunnel; tunnel reconciliation uses dev server on current `main` source.

## Restart procedure (founders / agents)

```bash
tmux -f /exec-daemon/tmux.portal.conf kill-session -t site00_vite 2>/dev/null || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s site00_vite -c /workspace -- \
  bash -lc 'bash .cursor/scripts/serve-site00-preview-from-main.sh 2>&1 | tee -a /tmp/site00-vite-restart.log'
```

Do **not** use `ensure-grok-environment-unified-preview.sh` for production workspace review after #1404 unless explicitly reviewing that Grok branch.

## Runtime sprint completion checklist

Any sprint affecting the founder tunnel must report:

- SOURCE_BRANCH, SOURCE_SHA, MERGE_STATUS  
- TUNNEL_BRANCH, TUNNEL_SHA_BEFORE, TUNNEL_SHA_AFTER, WORKTREE  
- DEV_SERVER_RESTARTED, TUNNEL_VERIFIED, POST_MOUNT_CAPTURES  

Without these, status cannot be **READY FOR FOUNDER REVIEW**.
