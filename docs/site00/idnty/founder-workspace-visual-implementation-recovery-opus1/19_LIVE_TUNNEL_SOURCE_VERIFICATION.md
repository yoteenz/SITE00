# 19 · Live tunnel source verification

| Field | Value |
| --- | --- |
| Tunnel URL | https://site00.fsbw-dev.com |
| Review route | /admin/site00/founder-workspace/overview (after sign-in) |
| Last documented pin | `b8f0bcf0` (tunnel review README). That is older than the reported `b446db3f`, which explains why the founder still saw the compile error |
| Corrected source | `ba4012d59` on `cursor/founder-workspace-full-authority-implementation-composer1-be3b` (pushed; PR #1665 head) |
| Agent environment | The tunnel, the `site00_vite` / `site00_preview_tunnel` sessions and `/tmp/site00-preview-runtime-lineage.txt` are **not present** in this agent's container. Requests to the tunnel host did not connect (HTTP 000) |
| Verified here | Vite dev server on the implementation worktree (port 5310): compile error gone; Overview, shell, routes and overlays render; fonts and assets load; 0 page errors |
| Required step (canonical environment) | `bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh ba4012d59` (or the branch name). Then read the lineage file and confirm it reports `ba4012d59`. Then smoke `/admin/site00/founder-workspace/overview` |
| Revert after review | `bash .cursor/scripts/serve-site00-preview-from-main.sh` |
| Tunnel serving corrected revision | **Not verified by the agent** (blocker above) |
