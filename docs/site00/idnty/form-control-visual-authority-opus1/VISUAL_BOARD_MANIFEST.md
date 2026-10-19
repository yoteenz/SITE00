# Visual board manifest

All boards exist and were rendered in this sprint. The paths below are the generated files. Full SHA-256 hashes, font checks and page-error logs are in [`boards/board-manifest.json`](boards/board-manifest.json).

| Required board | Title | Image | Source | Pixels (2×) | Size | SHA-256 (first 16) | Covers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BOARD 01 | Selector territories · iPhone | [`boards/board-01a-selector-territories-mobile.png`](boards/board-01a-selector-territories-mobile.png) | [`boards/src/board-01a-selector-territories-mobile.html`](boards/src/board-01a-selector-territories-mobile.html) | 4400 × 7294 | 1106 KB | `24f22c2d970cfcab` | FC-004, FC-043 · FD-1 |
| BOARD 01 | Selector territories · desktop | [`boards/board-01b-selector-territories-desktop.png`](boards/board-01b-selector-territories-desktop.png) | [`boards/src/board-01b-selector-territories-desktop.html`](boards/src/board-01b-selector-territories-desktop.html) | 3980 × 4121 | 539 KB | `17c999240aca2494` | FC-004, FC-043 · FD-1 |
| BOARD 02 | Text input system | [`boards/board-02-text-input-system.png`](boards/board-02-text-input-system.png) | [`boards/src/board-02-text-input-system.html`](boards/src/board-02-text-input-system.html) | 4400 × 6543 | 930 KB | `f34ebfc4147147de` | FC-003/005/006/007/012/013/019/033 · NF-01 |
| BOARD 03 | Choice control system | [`boards/board-03-choice-control-system.png`](boards/board-03-choice-control-system.png) | [`boards/src/board-03-choice-control-system.html`](boards/src/board-03-choice-control-system.html) | 3424 × 4862 | 837 KB | `cea82b9f726b0386` | FC-010/011/016–020/023–025/027/035/036 · FD-3 · NF-02 |
| BOARD 04 | Progression system | [`boards/board-04-progression-system.png`](boards/board-04-progression-system.png) | [`boards/src/board-04-progression-system.html`](boards/src/board-04-progression-system.html) | 3480 × 4177 | 597 KB | `33f79d9e5f6bb5b4` | FC-001/008/021/026/029/051 · FD-5 |
| BOARD 05 | Validation + feedback | [`boards/board-05-validation-feedback.png`](boards/board-05-validation-feedback.png) | [`boards/src/board-05-validation-feedback.html`](boards/src/board-05-validation-feedback.html) | 3560 × 4883 | 634 KB | `171c8cd423b0fd2f` | FC-009/031/048/049 · NF-03/NF-04 |
| BOARD 06 | Mobile interaction states | [`boards/board-06-mobile-interaction-states.png`](boards/board-06-mobile-interaction-states.png) | [`boards/src/board-06-mobile-interaction-states.html`](boards/src/board-06-mobile-interaction-states.html) | 3564 × 6156 | 776 KB | `7bf2b6a020c1a1cb` | FC-004 (B), D-class findings, NF-01 |
| BOARD 07 | Component system overview | [`boards/board-07-component-system-overview.png`](boards/board-07-component-system-overview.png) | [`boards/src/board-07-component-system-overview.html`](boards/src/board-07-component-system-overview.html) | 4400 × 8814 | 1006 KB | `d57f02043c639df6` | all families · FD-1/3/4/5/6 · FC-022/030/038 |

Board 01 is split into a mobile image (01A) and a desktop image (01B), because one combined image would not be readable (sprint §17).

## How they were made

- **Pipeline:** the repository's own Vite server plus Playwright Chromium (`/opt/pw-browsers/chromium`), at device scale factor 2. This is the same tooling as `scripts/site00/df-client-qa`. No image generation, no OpenArt, no invented scenes.
- **Existing states:** rendered with the **live stylesheets** (`src/site00/styles/site00-df-client.css`, `site00-df-components.css`, and `site00-digital-foundation.css` on Board 07), linked read-only.
- **Proposed states:** `boards/src/proposal.css` (`ix-` prefix), which builds only on DF tokens.
- **Real data:** glyphs from `icons/glyphs.ts` and `icons/meta.ts`; `BUSINESS_TYPES`, `DOMAIN_PATHS`, `DF_DISCLOSURES`, `DF_VIEW_META`, `buildDfMenu()` and the validation messages from `model.ts`; the add-on catalog from `shared/site00-digital-foundation/addonCatalog.ts` plus `addonPresentation()`. All are loaded through Vite SSR at render time and nothing is copied by hand. The exception is `RECORD_FILTERS`, which is not exported; it is copied verbatim with its source line cited on Board 03.
- **Fonts:** SITE 00 Display and Saira Semi Condensed, loaded and verified per board (`fonts_loaded: true` for both on all 8). Zero page errors and zero failed requests.
- **System UI** (iOS keyboard, Safari toolbar): drawn only as labelled grey hatched placeholders, never imitated.
- **Evidence images embedded:**
  - the founder's iPhone P02 (`../form-control-authority-audit1/evidence/founder-p02-intake-reference.jpg`) on Board 01A
  - the current Chromium P02 capture (`evidence/current-p02-chromium-390.png`) on Board 02

## Reproduce

```bash
npm ci
node docs/site00/idnty/form-control-visual-authority-opus1/boards/render-boards.mjs        # all boards
node docs/site00/idnty/form-control-visual-authority-opus1/boards/render-boards.mjs 01a 03 # some boards
node docs/site00/idnty/form-control-visual-authority-opus1/boards/verify-findings.mjs      # NF-01, NF-02, C-1 measurements
```

The board sources live under `docs/` and are never imported by the application. The production build only bundles `index.html`, and tests only glob `*.test|spec.ts(x)`.
