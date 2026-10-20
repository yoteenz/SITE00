# 06 — Tunnel worktree and process audit

## Expected topology

| Item | Value |
| --- | --- |
| Public URL | Cloudflare dev tunnel (see `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` secret / `/tmp/site00-cloud-preview-url.txt`) |
| Local port | `5174` |
| Worktree | `/tmp/site00-preview-main` |
| Pin script | `bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh <ref>` |
| Lineage file | `/tmp/site00-preview-runtime-lineage.txt` |
| Tunnel restart | `bash .cursor/scripts/restart-site00-preview-tunnel.sh` |

## Policy

- Do **not** repin to PR #1665-only head (`8761463e`) — Recovery2 missing.
- Do **not** merge to `main` or integration for founder review.
- Pin **review branch head** only.

## Worktree hygiene

If worktree has no uncommitted changes, `git -C /tmp/site00-preview-main checkout --detach <review-sha>` is used by the pin script. Agent local repo uncommitted files are **not** copied into the worktree.
