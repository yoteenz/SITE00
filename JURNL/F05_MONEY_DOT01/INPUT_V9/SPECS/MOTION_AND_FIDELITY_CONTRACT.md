# Motion and Fidelity Contract — F05 Money DOT 01

## Screen class mapping

- **SK01** — MONEY parent and DOT 01 central 4-card account group. The four-dot collection changes only dynamic panel data/art. Do not animate the background or the fixed nav on each swipe.
- **SK02** — bank/rideshare/cash/credit expanded pages, account directory and history surfaces; many detail screens will require a different static arrangement of existing paper components, not a forced same-pixel scene.
- **SK03** — receipt capture, receipt preview/review, document exception and paper-overlay surfaces. Actual user receipt photo, OCR extracted values, labels, scanning indicators are runtime content.

## Motion transitions

- Parent entry: static environment → decorative paper settles → headings, balances and panel content reveal. Do not replay on every carousel swipe.
- Four-dot collection swipe: move the **central panel group only**; parent statue, architecture, JURNL identity and nav remain in place. No unrelated auto-carousel rotation.
- Account select: 100–160 ms tactile paper lift; 350–500 ms transition into detail; preserve account state and selected dot when returning.
- Details: heading and balance settle, action strips stagger 25–45 ms; dynamic numeric balance updates must not count through false intermediate values.
- Contextual overlay: independent paper surface 220–320 ms, focus trap where modal, escape/back, close restores previous context.
- Receipt scan: camera preview live; processing state accurately follows backend extraction, not a fake countdown. User verifies and approves before persistence.
- Reduced motion: remove parallax and stagger; short fade or instant switch; no information conveyed solely through animation.

## Mandatory QA gates

- SIDEKICK retains original backdrop positions and paper geometry with no ghost text and no remaining baked live controls; small torn upper-left identity paper remains.
- Real pixels source-to-runtime screenshot comparison on representative iPhone dimensions. Minor art differences need founder review; do not claim pixel-exact reconstructions from separately generated imagery.
- All 22 PNGs alpha-verified, feather/halo checked, anchor positions and scale documented; alpha verification alone DOES NOT guarantee visual match.
- Layers separated appropriately; avoid moving whole flattened screenshots. Keep stationery underlayer clean behind moving paper/foliage.
- No duplicate account entries, double-counted transfer reservations, receipt double-logging or fake credit-card payments.
- Existing repository code and PR #1706 before UI work; create draft PR only, never deploy or merge.

## Missing from this archive (do not misrepresent)

- No approved pixel-aligned matte/anchor coordinates for PNG assets yet.
- No final independently tested interactive mobile prototypes are included.
- No all-screen live functional implementation or completed browser screenshots.
