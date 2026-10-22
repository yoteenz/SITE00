# 20 · Tunnel repin and review

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


The founder tunnel (`https://site00.fsbw-dev.com`, local Vite :5174, sessions `site00_vite` / `site00_preview_tunnel`) was
last reported pinned to `fd4139a81`. It is not reachable from this container, so its served source was **not** verified
and is **not** claimed updated.

To repin on the canonical preview environment:

```bash
bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh <FINAL_SHA from the PR head>
```

Then open `https://site00.fsbw-dev.com/admin/site00/founder-workspace/overview` and walk Foundations → a record → Reviews →
Operations → Correspondence → Referrals (Card Studio) → System (Test Lab), opening overlays from their triggers.
Confirm the served SHA before review.

TUNNEL_ACTIVE: NOT VERIFIED · TUNNEL_SOURCE_SHA: NOT VERIFIED (last reported fd4139a81)
