# JURNL canonical identity source audit

Sprint: `P0.JURNL.REFERENCE-HYGIENE.CANONICAL-LOGO-FORENSIC-RECOVERY-AND-AUTHORITY-REGISTRATION1`

## Repository reconciliation

| Field | Value |
| --- | --- |
| Default branch | `main` |
| Branch SHA at audit start | `159c0fa9be1f3c878e165e8e54861f2a3ce5c30c` |
| Forensic work branch | `cursor/jurnl-logo-forensic-recovery-4e5a` |

### Reference hygiene (merged)

PR **#1511** (`cursor/jurnl-reference-hygiene-4e5a`) merged **2026-10-11**. It classifies `jurnl-logo-official.png` as superseded for image-to-image, keeps six reference packs, and blocks bad attach sets via `attachedReferencePaths`.

### Discovery PRs (not automatic approval)

| PR | Topic |
| --- | --- |
| #1494 | ENTRY composition grammar |
| #1497 | ENTRY v2 live authority integration |
| #1503 | ENTRY flow integration |
| #1511 | Reference hygiene (merged) |

## Founder correction applied

The replacement identity already exists on newer approved pages. The gap was registry and reusable-source registration, not design.

## What the repo actually uses

| Surface | Identity treatment | Classification |
| --- | --- | --- |
| ENTRY v2 Welcome (live) | `LOCKUP_SPRIG.png` + live serif **JURNL** + descriptor line | Decorative page composition |
| Safe to Spend reference replica | `ReferenceLockup` sprig + word PNG + descriptor + tagline | Editorial lockup on authority |
| Home / Money / Plan / Credit hubs | Same `ReferenceLockup` | Editorial lockup |
| F01 package screens (`JurnlLogo`) | `jurnl-logo-official.png` small img | **Superseded** vertical mark (runtime legacy) |

## Recovered primary source

**File:** `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png`

| Field | Value |
| --- | --- |
| Introduced | commit `f29774719` (2026-10-07) — *JURNL F09: align logo, icons, and purchase panel to the authority* |
| SHA-256 | `de0b877a2b5477f27753dd5fe2bef49ca94904e9e8789bc2b1710dffced404e2` |
| Dimensions | 282 × 118 RGBA |
| Treatment | Horizontal olive sprig above horizontal outlined **JURNL** (not the vertical rose stem) |

This file is the standalone source asset committed for the Safe to Spend authority alignment. It is not a generative reinterpretation.

## Approved page authorities showing the same treatment

1. **`JURNL/F09_SAFE/REFERENCE_REPLICA1/REFERENCES/01_SAFE_TO_SPEND.png`** — founder reference photograph; lockup geometry in `referenceLayout.ts` (`REF_PARENT.box.sprig` / `word`).
2. **`ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png`** — ENTRY v2 parent; sprig box in `entryV2Layout.ts`; **JURNL** letterforms are live type on the runtime plate, matching the authority ink.

## Superseded filename trap

`public/site00/projects/jurnl/brand/jurnl-logo-official.png` remains in contract and `JurnlLogo` for F01 package screens. The filename says official. The visual is the **old vertical botanical** mark. It must not drive image-to-image or canonical registration.

## Extraction reproducibility

Layers are produced by `scripts/jurnl/reference-replica/export_assets.py` (`lockup` step). Forensic re-run matches committed bytes (`JURNL/MANIFEST/IDENTITY_RECOVERY_V1/reports/JURNL_IDENTITY_FIDELITY_REPORT.json`).

## Open decision

No separate transparent lockup exists without the plaster edge in `F09_LOCKUP.png`. Components are exact cuts. Founder confirmation is required before `FINAL_CANONICAL_APPROVED` and before replacing runtime `jurnl-logo-official.png` consumers.
