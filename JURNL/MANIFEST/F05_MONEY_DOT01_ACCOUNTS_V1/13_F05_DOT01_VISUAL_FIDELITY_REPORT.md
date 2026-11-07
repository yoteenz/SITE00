# 13 · Visual fidelity

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

**Method:** `scripts/jurnl/f05-motion-pilot/compare_dot01.py`.

- Each runtime state is captured at **471 × 836**, the authorities' own 9:16 aspect. There the full-bleed board maps one to one (u = 0.5, no crop, no seam).
- The capture is compared with the authority scaled to the same size.
- Metrics:
  - **MAD:** mean absolute RGB difference;
  - **SSIM:** grayscale structural similarity;
  - **ENV:** MAD over the environment band (board y < 560: statue, arch, seal, JURNL tag).
- Side-by-side sheets (authority | runtime | difference) are in `13_FIDELITY/<id>_compare.webp`. Phone-size screenshots of every state are in `SCREENSHOTS/`.

**No screen is claimed to be pixel-perfect.** On the three pixel pairs (01, 02, 26), the runtime is the authority's own environment with its papers in place and live lettering. The remaining difference there is type rasterization and live values. Elsewhere, the authority was rendered separately from the SIDEKICK, so the environment itself differs (ENV 6–18 %). The runtime reproduces the paper arrangement, chrome and content of the screen on the SIDEKICK.

| # | Kind | MAD | SSIM | ENV | Note |
|---|---|---|---|---|---|
| 01 | parent | 6.17 % | 0.728 | 5.08 % | pixel pair (SK01) |
| 02 | page | 6.94 % | 0.699 | 6.47 % | pixel pair (SK02) |
| 03 | page | 21.42 % | 0.324 | 9.6 % | separate render: environment and art differ (doc 02) |
| 04 | page | 22.18 % | 0.309 | 9.17 % | separate render: environment and art differ (doc 02) |
| 05 | page | 19.88 % | 0.347 | 8.11 % | separate render: environment and art differ (doc 02) |
| 06 | page | 17.7 % | 0.409 | 7.35 % | separate render: environment and art differ (doc 02) |
| 07 | page | 15.54 % | 0.399 | 6.59 % | separate render: environment and art differ (doc 02) |
| 08 | page | 21.51 % | 0.36 | 6.84 % | separate render: environment and art differ (doc 02) |
| 09 | page | 20.73 % | 0.357 | 7.23 % | separate render: environment and art differ (doc 02) |
| 10 | page | 21.05 % | 0.362 | 7.62 % | separate render: environment and art differ (doc 02) |
| 11 | page | 20.08 % | 0.312 | 12.48 % | separate render: environment and art differ (doc 02) |
| 12 | page | 17.49 % | 0.355 | 9.38 % | separate render: environment and art differ (doc 02) |
| 13 | page | 24.49 % | 0.313 | 11.11 % | separate render: environment and art differ (doc 02) |
| 14 | overlay | 24.25 % | 0.297 | 11.65 % | separate render: environment and art differ (doc 02) |
| 15 | overlay | 19.72 % | 0.308 | 11.82 % | separate render: environment and art differ (doc 02) |
| 16 | overlay | 20.78 % | 0.242 | 17.59 % | separate render: environment and art differ (doc 02) |
| 17 | overlay | 23.7 % | 0.347 | 11.77 % | separate render: environment and art differ (doc 02) |
| 18 | overlay | 21.14 % | 0.304 | 11.91 % | separate render: environment and art differ (doc 02) |
| 19 | overlay | 17.58 % | 0.346 | 10.3 % | separate render: environment and art differ (doc 02) |
| 20 | overlay | 17.85 % | 0.328 | 12.16 % | separate render: environment and art differ (doc 02) |
| 21 | overlay | 21.21 % | 0.286 | 12.6 % | separate render: environment and art differ (doc 02) |
| 22 | page | 24.29 % | 0.277 | 12.54 % | separate render: environment and art differ (doc 02) |
| 23 | overlay | 20.73 % | 0.316 | 11.78 % | separate render: environment and art differ (doc 02) |
| 24 | overlay | 20.36 % | 0.302 | 12.15 % | separate render: environment and art differ (doc 02) |
| 25 | overlay | 23.08 % | 0.295 | 12.04 % | separate render: environment and art differ (doc 02) |
| 26 | overlay | 10.06 % | 0.67 | 6.99 % | pixel pair (SK03); remaining gap = the sample receipt printed in the authority |
| 27 | overlay | 22.5 % | 0.331 | 11.07 % | separate render: environment and art differ (doc 02) |
| 28 | overlay | 19.96 % | 0.314 | 12.29 % | separate render: environment and art differ (doc 02) |
| 29 | overlay | 27.03 % | 0.265 | 13.6 % | separate render: environment and art differ (doc 02) |
| 30 | overlay | 21.78 % | 0.293 | 13.4 % | separate render: environment and art differ (doc 02) |
| 31 | page | 18.34 % | 0.373 | 8.18 % | separate render: environment and art differ (doc 02) |
| 32 | page | 21.46 % | 0.368 | 7.64 % | separate render: environment and art differ (doc 02) |
| 33 | overlay | 17.0 % | 0.344 | 11.56 % | separate render: environment and art differ (doc 02) |
| 34 | overlay | 21.4 % | 0.327 | 11.64 % | separate render: environment and art differ (doc 02) |
| 35 | page | 23.28 % | 0.346 | 8.47 % | separate render: environment and art differ (doc 02) |
| 36 | overlay | 29.54 % | 0.265 | 11.66 % | separate render: environment and art differ (doc 02) |
| 37 | overlay | 18.82 % | 0.337 | 11.94 % | separate render: environment and art differ (doc 02) |

## Founder correction applied in this sprint

On review, the founder pointed out that the child pages carried a bottom panel the authorities don't draw.

- **Before:** a reserved strip under the composition, with SK01's nav paper pasted into it, plus the shell's corner menu chip.
- **Now:**
  - every DOT 01 page is full-bleed to the bottom landscape;
  - the dock appears only where its authority draws it (06, 31), on the nav paper inside the composition;
  - the chips are each authority's own.
- **Measured after the correction:** authority 02 is at 6.9 % MAD, and authority 06's dock sits where its authority draws it.
- **Tall phones:** the extra height is shared between the papers, as on the parent. The heading, tag and bottom landscape stay fixed.

## Known differences, by screen

| Screens | Difference | Why | What would fix it |
|---|---|---|---|
| 02 | stat labels SET ASIDE / NOT LEFT YET / ON ITS WAY IN (authority: AVAILABLE / HELD / PENDING) | the canonical #1706 terms; HELD would read as money held | founder decision |
| 03–05 | identity art: the SK01 card art of the kind (authority: keychain, amphora, coin) | that art is not among the supplied layers | layers of it |
| 02–37 | strip / row icons are live line icons (authority: engraved icons) | not supplied | an icon sheet |
| 03–37 (not 26) | seal icon is the SIDEKICK's laurel seal (authority: per-screen seal) | separate renders | per-screen seal layers |
| 06, 31 | card / table type a little smaller; ADD / REORDER buttons are the kit's | kit buttons are generic | per-button art or a tuning pass |
| 07–13, 16–37 | content papers use the 9-slice paper kit (motion PNGs 09 / 13 / 14 / 19); form type is larger than the authority (≥ 16 px inputs so iOS does not zoom) | accessibility floor | — |
| 26–29, 33, 34 | the user's own photo instead of the sample receipt | never fake a receipt | — |
| all | figures are the user's own (authority samples like $6,420, JAN 28, 2025) | live data | — |
