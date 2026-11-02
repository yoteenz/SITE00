# JURNL identity downstream impact matrix

Forensic sprint only. No runtime visual changes in this branch.

| Area | Usage | Classification | This sprint |
| --- | --- | --- | --- |
| F01 ENTRY package screens | `jurnl-logo-official.png` via `JurnlLogo` | SUPERSEDED_IDENTITY | Documented; not swapped |
| F01 ENTRY v2 Welcome | Sprig PNG + live serif JURNL | CORRECT_CURRENT_IDENTITY | Verified against F09 source |
| F02 SETUP lockups | Horizontal rose rearrangement PNGs | SUPERSEDED_IDENTITY | Remain excluded from packs |
| F03 TODAY / F04 ACTIVITY parents | In-scene vertical mark on draft parents | SUPERSEDED_IDENTITY | Do not regen; do not copy attach list |
| F09 Safe to Spend | `ReferenceLockup` + F09 plates | CORRECT_CURRENT_IDENTITY | Source = F09_LOCKUP lineage |
| Global hubs (Today, Money, Plan, Credit) | `ReferenceLockup` | CORRECT_CURRENT_IDENTITY | No change |
| Account / Quick Add / Check purchase | `ReferenceLockup` | CORRECT_CURRENT_IDENTITY | No change |
| Email authorities (draft branches) | Mixed; not audited file-by-file in this pass | UNVERIFIED_SOURCE | Regen still blocked |
| Design viewport / review packs | Authority PNGs | NO_IDENTITY_REQUIRED on many plates | N/A |
| `f01/contract.ts` JURNL.LOGO.OFFICIAL | Points at superseded PNG | SUPERSEDED_IDENTITY | Registry candidate documents fix; contract unchanged |
| Reference hygiene dispatcher | Blocks superseded attach paths | CORRECT_CURRENT_IDENTITY | Unchanged behavior |
| Image generation attach | PACK_A sprig + word | RECOVERED_CANDIDATE | Provenance registered; founder gate remains |

### F09 parent lockup removal

Memory records intentional lockup removal on some F09 parent behaviors. This sprint does not restore a corner stamp on those parents.

### Separation

- **A. Registry cleanup:** `RECOVERED_IDENTITY_REGISTRY.json`, manifest reconciliation — done as candidate.
- **B. Asset import correction:** Not applied to `contract.ts` or `primitives.tsx` pending founder approval.
- **C. Visual composition change:** None.
