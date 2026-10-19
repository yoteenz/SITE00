# Founder Workspace — single-branch tunnel review (Composer1)

**Purpose:** Let the founder inspect the **real React Founder Workspace** on PR **#1665** via the existing Cloudflare dev tunnel — **no Railway preview**, **no merge to `main`**, **no production deploy**.

## Quick start (founder)

1. Open the **SITE 00 cloud preview URL** from PR #1665 description or `TUNNEL_CONFIGURATION.md` (verified smoke test 2026-10-19).
2. Sign in with your normal SITE 00 / Supabase founder account (same flow as prior dev tunnel reviews).
3. Go to **Founder Workspace overview:** `/admin/site00/founder-workspace/overview`  
   (legacy `/admin/site00/foundation-readiness` redirects to **System**).
4. Review mobile (iPhone Safari), tablet, and desktop using the checklists in `RESPONSIVE_REVIEW_CHECKLIST.md`.
5. Report visual defects in GitHub PR **#1665** comments or your usual sprint channel; corrections stay on branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` until you approve.

## Source

| Field | Value |
| --- | --- |
| Review branch | `cursor/founder-workspace-full-authority-implementation-composer1-be3b` |
| Review SHA | `b8f0bcf0553f7e770ad1c0ad109fb9e690554955` |
| PR | [#1665](https://github.com/yoteenz/SITE00/pull/1665) (draft) |
| Pin method | `.cursor/scripts/serve-site00-preview-from-pin-ref.sh` |

## Revert tunnel to merged integration

When review ends, canonical environment should run:

```bash
bash .cursor/scripts/serve-site00-preview-from-main.sh
```

(restores `origin/preview/tunnel` worktree on `:5174`.)

## Doc index

- `SINGLE_BRANCH_SOURCE_VERIFICATION.md`
- `TUNNEL_CONFIGURATION.md`
- `TUNNEL_SMOKE_TEST.md`
- `AUTHENTICATION_AND_ORIGIN_CHECK.md`
- `FOUNDER_WORKSPACE_ROUTE_MAP.md`
- `OVERLAY_REVIEW_ACCESS.md`
- `RESPONSIVE_REVIEW_CHECKLIST.md`
- `KNOWN_BACKEND_POLICY_GATES.md`
- `FOUNDER_VISUAL_APPROVAL_REGISTER.md`
- `PREMERGE_READINESS.md`
