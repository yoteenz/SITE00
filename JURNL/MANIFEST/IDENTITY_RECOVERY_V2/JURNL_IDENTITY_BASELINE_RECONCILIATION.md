# JURNL identity baseline reconciliation

**Sprint:** P0.JURNL.IDENTITY.CANONICAL-APPROVAL-AND-CLEAN-ASSET-EXTRACTION1  
**Date:** 2026-11-02 (America/Chicago)

## Integration strategy

**Selected: B — new branch from PR #1701 lineage, extending verified V1 artifacts.**

| Item | Value |
| --- | --- |
| Default branch (`main`) at reconciliation | `e413590e1318be18c41e59c598880322c1f10a5c` |
| PR #1701 | **OPEN** — `cursor/jurnl-logo-forensic-recovery-4e5a` @ `4e11ece9441a369847c86e991105c6ebc8eb7061` |
| V2 branch | `cursor/jurnl-identity-canonical-extraction-v2-4e5a` (contains #1701 commit + V2 deliverables) |
| Duplicate registries | **None** — `RECOVERED_IDENTITY_REGISTRY.json` updated in place |
| Duplicate extraction paths | V2 candidates under `JURNL/MANIFEST/IDENTITY_RECOVERY_V2/assets/`; committed F09 layers unchanged |

**Why not re-import only onto `main`?** PR #1701 is unmerged but is the authoritative forensic bundle (manifest, tests, pack links). V2 stacks on that commit to avoid divergent inventories and conflicting SHAs.

## Reference hygiene (merged)

- **PR #1511** merged 2026-10-11 — six packs, superseded vertical mark excluded from attach lists.
- `ready_for_corrected_generation`: **false** (unchanged).

## Superseded mark

- `public/site00/projects/jurnl/brand/jurnl-logo-official.png` — **SUPERSEDED_IDENTITY_REFERENCE**; still referenced by legacy `JurnlLogo` (runtime not modified this sprint).

## Canonical visual authority

- **Source frame:** `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png` (commit `f29774719…`).
- **Corroboration:** Safe to Spend reference crop, ENTRY v2 Welcome sprig geometry.
- **Lineage status:** `CANONICAL_IDENTITY_LINEAGE_CONFIRMED` (design authority — not the same as production-import ready).

## Technical distinction (founder correction preserved)

| Layer | Status |
| --- | --- |
| Visual design authority | Confirmed on approved pages |
| Layer extraction fidelity vs source crops | **PASS** (MAE 0 on ink) |
| Full-frame isolated logo | **BLOCKED** (plaster + arch in frame) |
| Transparent reuse on arbitrary backgrounds | **PARTIAL** (edge alpha may retain low plaster tint — see technical report) |

## Runtime consumers (unchanged)

- `ReferenceLockup` → committed `LOCKUP_SPRIG.png` + `LOCKUP_WORD.png`.
- `JurnlLogo` → superseded vertical PNG (migration **NOT_STARTED**).

## Related PRs

- **#1701** — forensic recovery (draft, not merged).
- **#1702** — sign-in autofill (merged to `main`; unrelated to identity assets).
