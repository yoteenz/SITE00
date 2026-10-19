# 19 · Live tunnel source verification

| Field | Value |
| --- | --- |
| Tunnel URL | `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` / PR #1665 handoff |
| Review route | `/admin/site00/founder-workspace/overview` (after sign-in) |
| Pin command | `bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh fd4139a81` |
| Active Vite SHA | `fd4139a813cdcb719efc2862d810e2f820ac5759` (includes `ba4012d5` visual recovery + compile fix) |
| Lineage | `/tmp/site00-preview-runtime-lineage.txt` → `PREVIEW_AUTHORITY=PINNED`, `PREVIEW_SHA=fd4139a8…` |
| Verified 2026-10-19 UTC | Public URL HTTP 200; `main.tsx?v=dev-local`; `wsKit.tsx` + `ifw-authority.css` HTTP 200 via tunnel; `/api/admin/site00-foundation?action=list` returns JSON (no `cards.ts satisfies` error) |
| tmux | `site00_vite` (5174), `site00-preview-tunnel` active |
| Authenticated visual | **Pending founder login** on device |
| Revert after review | `bash .cursor/scripts/serve-site00-preview-from-main.sh` |
