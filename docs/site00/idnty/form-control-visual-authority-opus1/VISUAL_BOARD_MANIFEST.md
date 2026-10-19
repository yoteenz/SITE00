# Visual board manifest

**OPUS2:** all eight boards were updated for founder decisions FD-1 to FD-6 and re-rendered on 2026-10-19. Every board loads both fonts and has 0 page errors. Approved treatments carry black `FOUNDER APPROVED` stamps; superseded treatments stay as greyed history stamped `NOT APPROVED`. The paths below are the generated files. Full SHA-256 hashes, font checks and page-error logs are in [`boards/board-manifest.json`](boards/board-manifest.json).

| Required board | Title | Image | Source | Pixels (2×) | Size | SHA-256 (first 16) | Fonts ✓ / page errors | Covers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOARD 01 | Selector territories · iPhone | [`boards/board-01a-selector-territories-mobile.png`](boards/board-01a-selector-territories-mobile.png) | [`boards/src/board-01a-selector-territories-mobile.html`](boards/src/board-01a-selector-territories-mobile.html) | 4400 × 7528 | 1188 KB | `20879ed50c32f3e5` | ✓ / 0 | FC-004, FC-043 · **FD-1 APPROVED** (B on mobile); A and C greyed |
| BOARD 01 | Selector territories · desktop | [`boards/board-01b-selector-territories-desktop.png`](boards/board-01b-selector-territories-desktop.png) | [`boards/src/board-01b-selector-territories-desktop.html`](boards/src/board-01b-selector-territories-desktop.html) | 3980 × 4207 | 589 KB | `f876372415e87bc9` | ✓ / 0 | FC-004, FC-043 · **FD-1 APPROVED** (A desktop companion) |
| BOARD 02 | Text input system | [`boards/board-02-text-input-system.png`](boards/board-02-text-input-system.png) | [`boards/src/board-02-text-input-system.html`](boards/src/board-02-text-input-system.html) | 4400 × 9146 | 1409 KB | `91b912bf860857b0` | ✓ / 0 | FC-003/005/006/007/012/013/019/033 · **FD-2** CONTACT NUMBER states · NF-01 |
| BOARD 03 | Choice control system | [`boards/board-03-choice-control-system.png`](boards/board-03-choice-control-system.png) | [`boards/src/board-03-choice-control-system.html`](boards/src/board-03-choice-control-system.html) | 4400 × 5064 | 974 KB | `b25a82d6ccdf918c` | ✓ / 0 | FC-010/011/016–020/023–025/027/035/036 · **FD-3 System B** · NF-02 · NF-06 |
| BOARD 04 | Progression system | [`boards/board-04-progression-system.png`](boards/board-04-progression-system.png) | [`boards/src/board-04-progression-system.html`](boards/src/board-04-progression-system.html) | 4400 × 5584 | 789 KB | `84f128b28b91bc33` | ✓ / 0 | FC-001/008/021/026/029/051 · **FD-5** preserved + rejected proposals |
| BOARD 05 | Validation + feedback | [`boards/board-05-validation-feedback.png`](boards/board-05-validation-feedback.png) | [`boards/src/board-05-validation-feedback.html`](boards/src/board-05-validation-feedback.html) | 4400 × 6334 | 902 KB | `9c36be8039af9b3b` | ✓ / 0 | FC-009/031/048/049 · **FD-2** validation and save · FD-5 ladder · NF-03/NF-04 |
| BOARD 06 | Mobile interaction states | [`boards/board-06-mobile-interaction-states.png`](boards/board-06-mobile-interaction-states.png) | [`boards/src/board-06-mobile-interaction-states.html`](boards/src/board-06-mobile-interaction-states.html) | 3564 × 7438 | 985 KB | `a2f4de7f91cbf446` | ✓ / 0 | FC-004 (B) · **FD-1 / FD-6** Safari requirements · NF-01 |
| BOARD 07 | Component system overview | [`boards/board-07-component-system-overview.png`](boards/board-07-component-system-overview.png) | [`boards/src/board-07-component-system-overview.html`](boards/src/board-07-component-system-overview.html) | 4400 × 9625 | 1188 KB | `23fed26212c95d98` | ✓ / 0 | All families · **FD-1 to FD-6 incorporated** · FC-022/030/038 |

Board 01 is split into a mobile image (01A) and a desktop image (01B), because one combined image would not be readable (sprint §17).

## How they were made

- **Pipeline:** the repository's own Vite server plus Playwright Chromium (`/opt/pw-browsers/chromium`), at device scale factor 2. This is the same tooling as `scripts/site00/df-client-qa`. No image generation, no OpenArt, no invented scenes.
- **Existing states:** rendered with the **live stylesheets** (`src/site00/styles/site00-df-client.css`, `site00-df-components.css`, and `site00-digital-foundation.css` on Board 07), linked read-only.
- **Approved and historical proposal states:** `boards/src/proposal.css` (`ix-` prefix), which builds only on DF tokens. System B and the NF-06 repair are in its OPUS2 block. Stamps and the greyed-history treatment are in `boards/src/board.css`; the shared FD-2 field is `phoneField` in `boards/src/kit.js`.
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
node docs/site00/idnty/form-control-visual-authority-opus1/boards/verify-findings.mjs      # NF-01, NF-02, C-1, NF-06 measurements
```

The board sources live under `docs/` and are never imported by the application. The production build only bundles `index.html`, and tests only glob `*.test|spec.ts(x)`.
