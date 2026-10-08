# JURNL reference audit

Sprint: `P0.JURNL.REFERENCE-HYGIENE.CANONICAL-LOGO-AND-VISUAL-AUTHORITY-RESET1`

No new screens were generated.

The last TODAY and ACTIVITY image-to-image set attached four files: the vertical botanical logo, the Safe to Spend plate, the Safe to Spend terrace, and the ENTRY value sheet. Three of those four are Mediterranean scenes. The fourth is the superseded mark. That set is why later parents kept reprinting the vertical rose stem inside arches.

## Identity

| Asset | Class | Attach |
| --- | --- | --- |
| `public/site00/projects/jurnl/brand/jurnl-logo-official.png` | SUPERSEDED | No. Vertical rose stem, rule, stacked JURNL on black. This is the file the repo still names as the official brand asset. It is the outdated treatment. |
| `public/site00/projects/jurnl/brand/jurnl-cover.png` | SUPERSEDED | No. Same mark on cream. |
| `public/site00/projects/jurnl/f01/authorities/reference/REFERENCE_JURNL_LOGO_OFFICIAL.jpg` | SUPERSEDED | No. Same mark on white. Source of the runtime PNG. |
| `JURNL/F01_ENTRY/ASSETS/REFERENCE_JURNL_LOGO_OFFICIAL.jpg` | SUPERSEDED | No. Duplicate. |
| `public/jurnl/f01-asset-first/assets/ENTRY.LOGO.OFFICIAL.001.jpg` | SUPERSEDED | No. Duplicate. |
| `JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1/ASSETS/jurnl-logo-official-hires.png` | SUPERSEDED | No. Hi-res duplicate used by an assembly script. |
| `JURNL/F02_SETUP/ASSETS/LOCKUPS/F02.BRANDLOCKUP.JURNL.001.png` | SUPERSEDED | No. Same rose stem and letters, turned horizontal. Attaching it teaches the same mark. |
| `src/projects/jurnl/families/F02_SETUP/BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_001.png` | SUPERSEDED | No. Runtime copy of that horizontal rearrangement. |
| `JURNL/F02_SETUP/ASSETS/LOCKUPS/F02.BRANDLOCKUP.JURNL_SETUP.001.png` | DO_NOT_USE | No. Painted rose plus the words JURNL. SETUP. Invented botanical substitute. |
| `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png` | CANONICAL treatment, not a clean file | Do not attach the whole frame. Horizontal olive sprig over a horizontal JURNL word. This is the lockup the live product cuts apart. The frame also shows plaster and an arch. |
| `src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png` | CANONICAL layer | Identity pack only. Plaster haze remains. |
| `src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png` | CANONICAL layer | Identity pack only. Plaster haze remains. |

Clean reusable decorative file: none. Do not draw a replacement and do not put the vertical file back in to fill the gap.

The package screens still mount `jurnl-logo-official.png` as a small runtime image. That mount is not an image-to-image reference. This pass does not change the live mark.

Typography authority, not an image reference: `jurnl-authority-serif`, `instrument-serif`, and `jost` under `public/site00/projects/jurnl/fonts/`.

## Editorial

| Asset | Class | Attach |
| --- | --- | --- |
| `ENTRY v2/02_VALUE_PROPOSITION/authority/entry-v2-value-proposition-authority.png` | SUPPORTING | One editorial reference. Torn sheet, column engraving, small olive. Do not pair it with the terrace and the plate. |
| `ENTRY v2/10_FORGOT_PASSWORD/authority/entry-v2-forgot-password-authority.png` | SUPPORTING | Correspondence object for email. Envelope, wax, brass opener, torn under-sheet. Not a room formula. |

## World

| Asset | Class | Attach |
| --- | --- | --- |
| `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_PLATE.png` | CANONICAL for Safe to Spend | Only on that lineage. Arch, sea, olive, standing folio. |
| `src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_TERRACE.png` | SUPPORTING | Same coastal world without the folio. Do not attach it together with the plate. |
| `ENTRY v2/01_WELCOME/authority/entry-v2-welcome-authority.png` | CANONICAL for ENTRY | One ENTRY world when the page family is ENTRY. Arch, bust, olive, burgundy. Not the default world for other families. |
| `ENTRY v2/08_BIOMETRIC_SETUP/authority/entry-v2-biometric-authority.png` | SUPPORTING | Default less-literal interior. Marble, plaster, sculpture, brass. No arch and no sea. |
| `JURNL/F02_SETUP/PARENT/F02.00_SETUP_PARENT.jpg` | SUPPORTING for page intent, not for attachment | Registry status is CANONICAL. The picture is arch, sea, olive, bust, and the rose lockup in the corner. Do not attach it as a generation reference. |

## Overused Mediterranean set

These were valid one at a time and were attached together:

- Safe to Spend plate
- Safe to Spend terrace
- ENTRY welcome
- SETUP parent

Count in the last TODAY / ACTIVITY attach set: 3 (plate, terrace, value sheet used as environment). Count required after this pass: 0. Optional maximum: 1, and only when the screen is Safe to Spend or ENTRY.

## Not opened this pass

ENTRY parents 03, 04, 05, 06, 07, 09, 11, 12, 13, and 14 were not re-opened. Their class for this audit is UNKNOWN. Do not add them to a pack from a written thesis alone.

## Dispatcher

`attachedReferencePaths` on a JURNL job is checked before spend. A superseded logo blocks as `SUPERSEDED_IDENTITY_REFERENCE`. More than one Mediterranean scene blocks as `REFERENCE_HYGIENE_FAILED`. Any attached set still blocks while `ready_for_corrected_generation` is false, because the clean identity file is missing. Jobs that omit the path list keep the previous dispatcher behavior.
