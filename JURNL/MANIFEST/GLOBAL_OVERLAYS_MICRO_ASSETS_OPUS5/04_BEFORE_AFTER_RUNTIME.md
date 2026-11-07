# 04 · BEFORE / AFTER RUNTIME

Every image is a **real capture of the running application**. They come from Chromium at device scale 3 with reduced motion, using synthetic records (`f05World`, `dot01World`) and stubbed exchange rates. The capture script is `scripts/jurnl/overlays-opus5/capture_ten_screens.ts`.
- **BEFORE** is the OPUS1 head `97fbdaeb4`, run from a separate worktree on :5175.
- **AFTER** is this branch, on :5174.

The labels on each image say which kind it is:

| Label | Meaning |
|---|---|
| ACTUAL RUNTIME | a screenshot of the live app |
| FOUNDER AUTHORITY | the authority frame from the GROK2 comparison JPGs |
| UNAPPROVED CANDIDATE · STATIC MOCKUP | a founder-review candidate shown beside the runtime; never mounted |

The images are in the evidence ZIPs:

| Folder (ZIP) | Content |
|---|---|
| `04_BEFORE_AFTER_RUNTIME/SCREENS/` | the ten screens and the MONEY parent at 393×852, BEFORE beside AFTER: `OV01_MONEY_ACTION` … `OV08_GLOBAL_MENU`, `CH01_SAFE_TO_SPEND_BUFFER`, `CH02_PRIVACY_CONSENTS` (plus `_SCROLLED`), `OV02_ADD_A_POCKET_SAVINGS_SELECTED`, `00_MONEY_PARENT` |
| `04_BEFORE_AFTER_RUNTIME/CLOSE_UPS/` | display-size element screenshots (DSF 3) of every converged slot group, BEFORE and AFTER |
| `04_BEFORE_AFTER_RUNTIME/AUTHORITY_VS_RUNTIME/` | per screen: the founder authority frame beside the actual runtime close-ups |
| `04_BEFORE_AFTER_RUNTIME/CANDIDATES/` | the three gated candidates beside what is mounted |
| `04_BEFORE_AFTER_RUNTIME/OV07_BLOCKER_EVIDENCE.jpg` | the exact defect: the only OV07 shell bakes its strips and pills; GROK2 laid papers over them; the runtime is unchanged |
| `RUNTIME_SCREENSHOTS/BEFORE`, `RUNTIME_SCREENSHOTS/AFTER` | the raw PNGs and `states.json`: every `data-asset-id`, duplicate count, line glyph, switch and slot box |

## The ten screens

| Screen | AFTER, in one line | Proof |
|---|---|---|
| OV01 MONEY ACTION | the two choices wear the dark GROK2 chevron | ACTUAL RUNTIME |
| OV02 ADD A POCKET | type icons (light bank when selected), the check disc, the authority CANCEL / SAVE papers | ACTUAL RUNTIME |
| OV03 MOVE MONEY | the source bank and destination pocket marks, the authority CANCEL / RECORD papers | ACTUAL RUNTIME |
| OV04 MANAGE POCKET | pencil, trash and dark chevrons on the existing independent papers | ACTUAL RUNTIME |
| OV05 SEARCH | the magnifier inside the live field, the POCKETS bank, result marks | ACTUAL RUNTIME |
| OV06 ACCOUNT / SETTINGS | unchanged (F09, FD-12) | ACTUAL RUNTIME |
| OV07 ARCHIVE BLOCKED | unchanged: **BLOCKED_ARTWORK** (see the blocker evidence) | ACTUAL RUNTIME + defect image |
| OV08 GLOBAL MENU | eleven row icons and twelve cream chevrons; SAFE TO SPEND BUFFER held | ACTUAL RUNTIME |
| CH01 SAFE TO SPEND BUFFER | the (i) mark on the effect paper | ACTUAL RUNTIME |
| CH02 PRIVACY & CONSENTS | eight row icons, cream chevrons, the consent switches on their own track and thumb | ACTUAL RUNTIME |

Two previews are kept in the repo, `PREVIEW_PRIVACY_AUTHORITY_VS_RUNTIME.jpg` and `PREVIEW_OV07_BLOCKER_EVIDENCE.jpg`. Everything else is in the ZIPs.
