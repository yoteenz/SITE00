# 01 · Repository baseline and PR reconciliation

Sprint `P0.JURNL.F05-MONEY.DOT01-ACCOUNTS.FULL-VISUAL-MOTION-AND-FINANCIAL-RUNTIME-CONVERGENCE.OPUS1` · draft PR #1707 · nothing deployed, nothing merged, no database touched, no new images generated, no paid provider used.

| Item | Value |
|---|---|
| Repository | `yoteenz/SITE00` |
| Branch | `claude/jurnl-f05-money-motion-pilot-um0u93` (PR #1707, draft) |
| SHA before this sprint | `162bcba382ee1db5ea98702a822476f6fbd42072` (carousel evidence) |
| `main` | `e413590e` (unchanged) |
| #1705 (financial OS unification) | open draft, head `c56691ec`, unchanged |
| #1706 (stabilization: transfer settlement, Safe to Spend, card minimums) | open draft, head `274d7956`, unchanged; this PR's base |
| #1707 | this sprint extends it (the F05 motion pilot and the four-collection carousel live here); no competing PR was opened |

## Financial baseline

The canonical ledger is #1706's:

- `ledgerOps` builds every entry: `buildExpense`, `buildTransfer`, `buildBalanceCorrection` and `applyOp`.
- `accounting` computes positions and entry classes.
- `transferSettlement` gives the canonical transfer states, with only recorded steps moving money.

DOT 01 adds no second ledger. Every write goes through these functions, and every figure comes from them.

## Input package

- The founder's V9 handoff: 7 FULL parts, plus the LITE zip used only as a skim reference.
- Every part's SHA-256 matches `FULL_PACKAGE_MANIFEST.json`, and 65 / 65 files match it byte for byte.
- Kept under `JURNL/F05_MONEY_DOT01/INPUT_V9/`:
  - `AUTHORITIES/`: the 37 screens as WebP q92, for comparison only;
  - `SIDEKICKS/`: the 3 original PNGs;
  - `SPECS/`: as supplied.
- `INPUT_V9/README.md` records every original hash.

## Commits in this sprint (oldest first)

| SHA | What |
|---|---|
| `0f5c3dd0` | V9 handoff layers; parent on SK01; bank account page on SK02 (prototypes A and B) |
| `c3565173` | directory, histories, detail, settings, review, entry, receipt, correction and archive overlays |
| `de6cabf7` | overlays cover the dock, legible notices, card statement signs, browser OCR core |
| `6406c93f` | financial invariants D01–D60; card overpayment and cash overdraw guards |
| `151e0a30` | browser journeys; heading/card text spacing, reversal confirmation, reduced motion |
| `396bd0b3` | CAPTURE RECEIPT on the full SK03; comparison script |
| `572f01fa` | founder correction: child pages follow their authorities (no bottom panel, full-bleed, authority chips) |
| `e3994f7f` | live camera preview on CAPTURE RECEIPT; 9:16 comparisons |
| `fc6e58be` | evidence 01–14 and 16, screenshots, comparisons, motion previews |
| `fc608eb3` | parent at tablet / desktop: panel paper rhythm; in-transit token clear of the band (found by the full regression) |
| (final) | browser results (15), responsive set, ZIPs 17 / 18 |
