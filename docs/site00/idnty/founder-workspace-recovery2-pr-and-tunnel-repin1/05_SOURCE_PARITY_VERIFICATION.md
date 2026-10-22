# 05 — Source parity verification

Compare review branch founder-workspace tree to Opus Recovery2 head:

```bash
git diff origin/cursor/founder-workspace-full-authority-implementation-composer1-be3b HEAD -- src/site00/admin/founder-workspace
# (empty — 0 lines)
```

**Result:** `src/site00/admin/founder-workspace/**` on the review branch is **byte-identical** to `cfa83e9b7`.

## Page families (routes in `FounderWorkspaceApp.tsx`)

| Family | Route | Present |
| --- | --- | --- |
| Overview | `/admin/site00/founder-workspace/overview` | yes |
| Foundations | `/admin/site00/founder-workspace/foundations` | yes |
| Client record | `/admin/site00/founder-workspace/foundations/:artifactId` | yes |
| Reviews | `/admin/site00/founder-workspace/reviews` | yes |
| Operations | `/admin/site00/founder-workspace/operations` | yes |
| Correspondence | `/admin/site00/founder-workspace/correspondence` | yes |
| Referrals (+ Card studio tab) | `/admin/site00/founder-workspace/referrals` | yes |
| System (+ Test lab) | `/admin/site00/founder-workspace/system` | yes |

## Overlays (`overlayRegistry.ts`)

- OL-01 … OL-20 — registered
- RO-01 … RO-20 — registered
- `OverlayHost.tsx`, `ToastStack.tsx` — present

## Styles

- `ifw-authority.css`, `ifw-recovery2.css`, `ifw-referrals.css` — present
