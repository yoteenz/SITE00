JURNL F02 — SETUP
SONNET IMPLEMENTATION HANDOFF

This family is ready for structural implementation.

The visual sources are already mounted in this repository. Sonnet does not need a ZIP, and Sonnet does not search OpenArt.

## What this handoff is

Family id: `F02_SETUP`. Family name: SETUP. Do not call this family FINANCE.

The production package that generated these images remains at `JURNL/F02_SETUP/`. The implementation source Sonnet uses is:

`src/projects/jurnl/families/F02_SETUP/`

That folder is not wired into the live app. This sprint created no routes and no components. Sonnet builds the skeleton. Opus, Grok, and Composer refine it later. Do not do pixel-perfect final polish here.

Founder visual approval is still `IN_REVIEW`. `visual_approval` is false. That does not block structural implementation.

## Sonnet's job

- Build live routes.
- Build live forms.
- Build live inputs.
- Build live buttons.
- Build live progress.
- Build live states.
- Build live interaction triggers.
- Use the mounted environment plates and the mounted decorative assets.
- Match the authorities.
- Keep text live.
- Keep all interaction live.

## Sonnet must not

- Use full screen authorities as runtime backgrounds.
- Search OpenArt.
- Regenerate visuals.
- Invent new art.
- Redesign the family.
- Change JURNL brand language.
- Add circular tappable controls.
- Use lowercase user-facing UI copy.

## Screen authority rule

Screen authority = visual target.

It is not a runtime image.

Implement live UI over the runtime assets. Every file under `AUTHORITIES/` is `runtime_use = false` and `reference_only = true`.

## Implementation order

01. Family route and shell.
02. Parent.
03. Children in journey order.
04. Grandchildren.
05. State behavior.
06. Interaction triggers.
07. Responsive structure.
08. App canvas containment.
09. Asset mounts.
10. QA.

Journey order:

1. `F02.00` THE SHAPE OF YOUR LIFE — proposed route `setup`
2. `F02.01` WHO THIS IS FOR — `setup/household`
3. `F02.02` WHERE IT LIVES — `setup/accounts`
4. `F02.02.1` NAME AN ACCOUNT — `setup/accounts/name` (only from the name action)
5. `F02.03` WHAT ARRIVES — `setup/income`
6. `F02.04` WHAT REPEATS — `setup/commitments`
7. `F02.05` WHAT MATTERS FIRST — `setup/priorities`
8. `F02.05.1` NAME A GOAL — `setup/priorities/goal` (only when A GOAL is chosen)
9. `F02.06` WHAT SHOULD STAY — `setup/protected`
10. `F02.07` WHAT JURNL MAY KEEP — `setup/boundaries`
11. `F02.08` JURNL IS READY — `setup/ready`, then hand off to F03 TODAY

These routes are proposed. They are not registered yet. The family entry in the product record is already `setup`. Do not change F01 routes. `F01.13` CONTINUE TO SETUP is the entry into this family.

State sheets are overlays, not extra routes:

- `F02.ST.VALIDATION` — field needs a number or a name. Applies to `F02.03`, `F02.06`, `F02.02.1`, `F02.05.1`, and the add sheet.
- `F02.ST.CONNECTED` — account linked. Applies to `F02.02`.
- `F02.ST.RESUME` — continue an unfinished setup. Applies to `F02.00`.

Interaction sheets are overlays, not extra routes:

- `F02.IN.PERMISSION` — from connect on `F02.02`. Quiet plate. No header floral.
- `F02.IN.ADD` — from add on `F02.04`. Desk plate. No header floral.
- `F02.IN.SKIP` — shared by `F02.02`, `F02.04`, and `F02.06`.

`F02.NAV.BACK` and `F02.NAV.CONTINUE` are live controls. They have no images.

Code-only states, with no extra art: FOCUS, LOADING, EMPTY_LIST, SKIPPED_CHIP, PARTIAL_LIST, DISABLED_CONTINUE.

## Where each file lives

| Need | Path |
| --- | --- |
| Start here | `HANDOFF/SONNET_START_HERE.txt` |
| Screen tree | `MANIFEST/F02_SCREEN_TREE.json` |
| Screen to assets | `MANIFEST/F02_IMPLEMENTATION_SOURCE_MAP.json` |
| Components | `MANIFEST/F02_COMPONENT_ASSET_MAP.json` |
| Icons | `MANIFEST/F02_IMPLEMENTATION_ICON_MAP.json` |
| Readiness | `MANIFEST/F02_IMPLEMENTATION_READINESS.json` |
| Authorities | `AUTHORITIES/` |
| Plates | `ENVIRONMENTS/` |
| Header florals | `BOTANICALS/` |
| Lockups | `BRAND_LOCKUPS/` |

## Runtime assets

Mount these. Do not redraw them.

Four environment plates. One plate per room. Several screens share a room.

- `ENV.ARRIVAL` — `ENVIRONMENTS/F02_ENVIRONMENT_ARRIVAL.jpg` — `F02.00`, `F02.01`, `F02.08`, `F02.ST.RESUME`
- `ENV.DESK` — `ENVIRONMENTS/F02_ENVIRONMENT_DESK.jpg` — `F02.02`, `F02.02.1`, `F02.03`, `F02.04`, `F02.06`, `F02.ST.VALIDATION`, `F02.ST.CONNECTED`, `F02.IN.ADD`, `F02.IN.SKIP`
- `ENV.EDIT` — `ENVIRONMENTS/F02_ENVIRONMENT_EDIT.jpg` — `F02.05`, `F02.05.1`
- `ENV.QUIET` — `ENVIRONMENTS/F02_ENVIRONMENT_QUIET.jpg` — `F02.07`, `F02.IN.PERMISSION`

Each plate is clean of live UI, text, buttons, and form fields. Busts, books, trays, olives, and textiles stay inside the plate. Do not crop them out.

F02 botanical / brand header marks are canonical mounted assets.

They come from the completed repair `P0.JURNL.F02-BOTANICAL-BRAND-ASSET-REPAIR1`: 13 emblems in `BOTANICALS/`, 2 full lockups in `BRAND_LOCKUPS/`. Review contact sheet: `JURNL/F02_SETUP/SHEETS/J_BOTANICAL_LOCKUP_REPAIR.jpg`. Production manifest: `JURNL/F02_SETUP/MANIFEST/F02_VISUAL_ASSET_MANIFEST.json`. The mount used those post-repair files. Pre-repair copies are not the source.

Sonnet must not:

- Redraw them with CSS.
- Substitute emoji.
- Substitute generic icons.
- Rebuild them from text or fonts.
- Bake them into the environment plate.
- Search OpenArt for alternates.

Sonnet must use the mounted paths in `MANIFEST/F02_IMPLEMENTATION_SOURCE_MAP.json` and `MANIFEST/F02_COMPONENT_ASSET_MAP.json`.

Layer the screen in this order:

1. Environment plate.
2. Decorative / botanical asset.
3. Brand lockup, where the source map says `header_paint` is `LOCKUP`.
4. Live UI.
5. Interactions.

A full lockup already contains its wordmark and its botanical signature. Do not add a second JURNL, a second SETUP, or a second copy of that flower.

- Screens with `header_paint` `EMBLEM_PLUS_LIVE_WORDMARK` paint the listed emblem plus the word JURNL set in Instrument Serif.
- `F02.00` paints `BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_001.png` only. Emblem 001 is the sprig inside that lockup.
- `F02.ST.VALIDATION` paints `BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_SETUP_001.png` only. That file already contains JURNL, SETUP, and the burgundy rose. Emblem 012 stays registered and is not painted again.
- `F02.04` reuses emblem 004. That is the one collapsed duplicate. There is no separate commitments spray.
- `F02.IN.PERMISSION`, `F02.IN.ADD`, and `F02.IN.SKIP` have no header botanical.

## What stays code

The component map marks these `CODE_ONLY`:

- `LIVE_PAPER_CARD`
- `LIVE_PAPER_SHEET`
- `LIVE_BUTTON_PRIMARY`
- `LIVE_SELECTION_ROW`
- `LIVE_FIELD`
- `LIVE_PROGRESS`
- `LIVE_PROGRESS_SEGMENTS`
- `LIVE_WORDMARK` (live type, except where a lockup replaces it)

Bone paper, ivory fields, and the solid emerald button are CSS. Progress segments are square-rounded marks drawn in code. Do not turn them into images.

`OBJECTS/` and `MATERIALS/` contain classification files only. Those classes are baked into the plates or drawn in code. An empty list is the decision, not a missing file.

## Icons

Twelve inherited icons resolve in `src/projects/jurnl/runtime/components/icons.tsx`. Do not copy that module and do not generate a new icon pack. New F02 icon files: 0.

Semantics: back, check, alert, close, plus, chevron, link, account, shield, privacy, info, clock.

Apple, Google, and bank marks are not part of this family. Do not add a provider chooser.

## App canvas

No JURNL live content may fall above or below the app canvas unless the screen is explicitly scrollable.

Implement a contained project stage, a safe top, and a safe bottom. No accidental host-page overflow.

The F01 runtime already uses `data-jrn-app-stage="canvas"`. Follow that containment. Do not edit F01 to make F02 fit.

## Mobile first

Primary canvas: 393 × 852.

Secondary: 834 × 1194, then 1440 × 900.

Build the phone first. Tablet and desktop reuse the same plate with a wider or centered column. Do not scale the mobile screen up to fill those frames.

## Copy and controls

All user-facing JURNL UI copy is uppercase.

Exception: user-entered case-sensitive values stay as the user typed them.

Circular tappable JURNL controls: 0.

Use square-rounded geometry. The corrected `F02.08` authority uses square progress marks. The superseded circular attempt is not mounted.

## Monetization

F02 does not introduce paywall UI.

Entitlement metadata may exist. Do not add upgrade prompts, plan sales, or pricing UI.

## F01 firewall

Do not modify F01 files, plates, routes, or components. Shared icons and the official logo may be referenced. Do not duplicate them.

## Corrected authorities

`F02.07` mounted file is the correction `vrLuWNd4riH8JNGuJLVP`. Excluded predecessor: `8QeXrJ1VUU3REvZqxff9`.

`F02.08` mounted file is the correction `TivHik6Gd0eSXloheqG7`. Excluded predecessor: `PZC0QVXJzfqWSTXgSlEh`.

The quiet plate was generated from the pre-correction frame after the UI was removed, and it passed clean. Mount that plate. Do not remount the rejected screen.

## QA before handing to Opus

- Every screen id in the source map resolves to one authority file on disk.
- Every primary and grandchild screen resolves to one plate.
- Header paint matches `header_paint` in the source map.
- No authority image is used as a background.
- Copy on screen is uppercase, except typed values.
- No circular tappable control.
- Phone, tablet, and desktop stay inside the app canvas.
- No paywall.
- F01 still behaves as it did.
