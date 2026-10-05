# RECOVERY4 — White tee / red collar fabrication source authority

## Finding

The PR #1313 geometry batch used **`public/site00/production-authority-assets/shared/residents/*-portrait.jpg`** (forensics / OpenArt recovery lineage) as OpenArt `image2image` anchors. Those portraits show **outdated** styling (e.g. black tee Etta, beige/cream suits in uniform variants).

The **founder-approved white studio work look** already exists in git:

| Layer | Path | Commit (intro) | PR |
|-------|------|----------------|-----|
| **Work look + fabrication portrait** | `public/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-*.jpg` | `4cdac10c` | #1303 |
| **Full-body natural authority** | `public/site00/studio-world-residents/season1-v1/*/01-natural-authority/*` | `a59131ef` / `f8dff1c3` | #1302 |

**Visual verification:** casting-thumbnails-v1 images show **plain white T-shirt + thin red collar trim** on neutral studio background (all 8 residents).

**Not** the fabrication work look: `season1-v1/*/03-work-uniform-candidates/*` and `production-authority-assets/*-uniform.jpg` (ivory SW suit with SW embroidery) — same outdated cream uniform direction.

## Bundle branch

Both trees are present on **`origin/cursor/production-hub-descendants-opus1`** (and casting PR branch #1303). They are **not** on current `origin/main` (removed after merge divergence) — recovery checked out from hub-descendants.

## Supersession

- **Old fabrication anchor:** `production-authority-assets/shared/residents/*-portrait.jpg` → `SUPERSEDED_RESIDENT_SOURCE`
- **Generated geometry (SW-001, 16 frames):** preserved, marked `SUPERSEDED_OUTPUT_WRONG_SOURCE` / `INVALID_FOR_CANONICAL_REVIEW`
- **Pending frames:** remain `NOT_GENERATED`; OpenArt batch **halted** (0 credits this sprint)

## Next

Founder review → 16-image validation batch (portrait front + full-body front × 8) before resuming full 128-frame geometry run.
