# Entry 002 authority-board crops — FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2

Source: the committed Entry 002 pre-storyboard authority boards in
`public/assets/expression-engine/entry-002/pre-storyboard-authority/`. The production hub already uses these boards
as the cast and look node art.

Each file here is a crop of one board at native resolution. Nothing is generated or upscaled.
`scripts/production-authority/derive-entry002-media.py` writes the crops and `manifest.json`.
The manifest records each crop box as fractions of its board (x0, y0, x1, y1).

Registered in `src/site00/productionAssets/productionAssetRegistry.ts` as `entry002.<id>`.
They are `PROJECT_CANON` and `USED_BY_AUTHORITY`.
They feed the Expression media resolver (`expression/expressionMedia.ts`):
- character portraits: Subject Woman and NDX;
- era looks: 2016 and 2026;
- wardrobe, beauty and hair aspect tiles.

Data note: the board subject is dark-haired, while the seed actor SW-017's Character Fabrication receipt shows a
blonde subject. So characters use these crops, and actor surfaces keep their own receipts. Every image carries its
provenance in the media inspector.

| File | Board | Box (x0, y0, x1, y1) | Size | Board caption |
|---|---|---|---|---|
| subject-2016-full.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.022, 0.146, 0.292, 0.668 | 276×802 | 2016 · SAME WOMAN · EARLIER ERA |
| subject-2016-portrait.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.302, 0.146, 0.488, 0.425 | 191×429 | 2016 · RECOGNIZABLE · SAME FACE |
| subject-details.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.302, 0.434, 0.488, 0.662 | 191×350 | SAME DETAILS · CHOKER · OVERLINED LIPS |
| subject-2016-selfie.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.240, 0.672, 0.488, 0.925 | 254×389 | 2016 · JUST A GIRL FIGURING IT OUT |
| subject-2026-full.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.506, 0.146, 0.780, 0.925 | 281×1197 | 2026 · SAME WOMAN · LATER ERA |
| subject-2026-portrait.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.788, 0.146, 0.978, 0.425 | 194×429 | 2026 · OLDER · WISER · STILL HER |
| subject-codes.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.788, 0.434, 0.978, 0.650 | 194×331 | SAME CODES · NEW CONTEXT |
| subject-2026-audience.jpg | ndx-entry-002-pre-sba-subject-dual-era-001.jpg | 0.770, 0.660, 0.978, 0.925 | 213×407 | 2026 · DIFFERENT AUDIENCE · SAME WOMAN |
| look-2016-full.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.022, 0.128, 0.285, 0.620 | 269×755 | 2016 LOOK · SAME FASHION LANGUAGE |
| look-2016-portrait.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.294, 0.128, 0.492, 0.343 | 203×330 | 2016 LOOK · PORTRAIT |
| look-2016-mirror.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.294, 0.350, 0.492, 0.620 | 203×414 | 2016 LOOK · MIRROR |
| look-2026-full.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.508, 0.128, 0.761, 0.620 | 259×755 | 2026 LOOK · SAME FASHION LANGUAGE |
| look-2026-portrait.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.771, 0.128, 0.978, 0.343 | 211×330 | 2026 LOOK · PORTRAIT |
| look-2026-street.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.771, 0.350, 0.978, 0.620 | 211×414 | 2026 LOOK · HIGHER STANDARDS |
| wardrobe-bodycon-dress.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.022, 0.662, 0.211, 0.755 | 193×143 | BLACK BODYCON DRESS · ALWAYS |
| wardrobe-choker.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.218, 0.662, 0.400, 0.755 | 187×143 | CHOKER · ALWAYS |
| wardrobe-bomber-jacket.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.407, 0.662, 0.592, 0.755 | 189×143 | BOMBER JACKET · ALWAYS |
| wardrobe-thigh-high-boots.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.600, 0.662, 0.787, 0.755 | 192×143 | THIGH HIGH BOOTS · ALWAYS |
| wardrobe-clear-heels.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.795, 0.662, 0.978, 0.755 | 187×143 | NUDE / CLEAR HEELS · ALWAYS |
| beauty-overlined-lips.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.022, 0.781, 0.211, 0.869 | 193×135 | OVERLINED LIPS · ALWAYS |
| beauty-french-nails.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.218, 0.781, 0.400, 0.869 | 187×135 | FRENCH TIP NAILS · ALWAYS |
| beauty-french-toes.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.407, 0.781, 0.592, 0.869 | 189×135 | FRENCH TIP TOES · ALWAYS |
| wardrobe-statement-bag.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.600, 0.781, 0.787, 0.869 | 192×135 | STATEMENT BAG · ALWAYS |
| hair-sleek-straight.jpg | ndx-entry-002-pre-sba-fashion-continuity-001.jpg | 0.795, 0.781, 0.978, 0.869 | 187×135 | SLEEK STRAIGHT HAIR · ALWAYS |
| ndx-over-shoulder.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.022, 0.142, 0.566, 0.405 | 512×440 | OVER-SHOULDER · ALWAYS LOOKING |
| ndx-shadow.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.580, 0.142, 0.978, 0.405 | 374×440 | SHADOW · PRESENT BUT UNSEEN |
| ndx-phone-interaction.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.022, 0.416, 0.462, 0.622 | 414×344 | PHONE INTERACTION · SMALL DETAILS |
| ndx-partial-profile.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.472, 0.416, 0.978, 0.622 | 476×344 | PARTIAL PROFILE · A PRESENCE |
| ndx-reflection.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.022, 0.636, 0.510, 0.905 | 459×450 | REFLECTION · THE OBSERVER |
| ndx-observer.jpg | ndx-entry-002-pre-sba-ndx-presence-001.jpg | 0.522, 0.636, 0.978, 0.905 | 429×450 | OBSERVER · DETACHED BY DESIGN |
