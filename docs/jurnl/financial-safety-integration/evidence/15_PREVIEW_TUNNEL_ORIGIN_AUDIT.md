# Preview tunnel origin audit

**File:** `/tmp/site00-preview-runtime-lineage.txt` (canonical env)

```
PREVIEW_AUTHORITY=PINNED
PREVIEW_BRANCH=detached
PREVIEW_SHA=ad7ac17732e3f9a582eb09667de4913979b913f6
PREVIEW_PIN_REF=integration/jurnl-production-workspace
PREVIEW_WORKTREE=/tmp/site00-preview-main
PREVIEW_MODE=dev
```

**Assessment:** Tunnel serves a **pinned detached SHA** associated with PR #1709 / integration pin — **not** this sprint's candidate (`cursor/jurnl-financial-safety-integration-4e5a`). **LIVE_TUNNEL_ALIGNMENT: NOT ALIGNED.**

**Host:** `/tmp/site00-cloud-preview-url.txt` on VM (founder historical `site00.fsbw-dev.com` — verify live DNS separately).
