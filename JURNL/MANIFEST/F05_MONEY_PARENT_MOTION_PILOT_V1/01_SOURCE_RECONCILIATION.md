# 01 — Source reconciliation

Sprint: `P0.JURNL.F05-MONEY.PARENT-ANIMATED-COLLAGE-RECONSTRUCTION-AND-FIDELITY-PILOT.OPUS1`, 2026-11-03.

## Input package: verified

`JURNL_F05_PARENT_MOTION_PILOT_V0.zip` was attached to the session and extracted into an isolated directory. There were no unsafe paths. It is committed unmodified at `JURNL/F05_MONEY_MOTION_PILOT/INPUT/`.

| File | Size | Format | Alpha | SHA-256 (abridged; full in 02) | Used as |
|---|---|---|---|---|---|
| `reference/approved_parent.png` | 1024 × 1536 | RGB PNG | **none** | `7135b2f3…f53ef2a` | The only native-resolution source: extraction input and fidelity target |
| `reference/asset_system_study.png` | 1536 × 1024 | RGB PNG | none | `5c303077…3f007634` | Planning reference only. Its "transparent PNGs" panel is a flattened picture of layers. |
| `reference/concept_board_composed_crop.png` | 360 × 683 | RGB PNG | none | `c8b3062f…f51ac` | Reference only (low resolution) |
| `assets/sidekick_preview_crop.png` | 333 × 683 | RGB PNG | none | `efc0dae8…1474a` | **Not used at runtime.** Low resolution, and its composition differs from the approved parent (larger statue, shifted arch), so it is not pixel-matched. |
| `prototype.html` | — | HTML | — | — | Motion and interaction intent only |
| `MOTION_AND_INTERACTION_SPEC.md`, `README.md`, `asset_manifest.json` | — | — | — | — | Read in full. The timing targets, invariants and the "no transparent pack is claimed" limitations are adopted. |

No asset in the package has an alpha channel. Every alpha in this pilot was produced here and is labelled with how it was made (doc 02).

## Repository state

| Item | Value |
|---|---|
| `main` | `e413590e1318be18c41e59c598880322c1f10a5c` (unchanged) |
| PR #1705: unified financial OS | OPEN · DRAFT · head `c56691ec` |
| PR #1706: stabilization (stacked on #1705) | OPEN · DRAFT · head `274d7956` |
| PR #1704 (audit), #1703 (identity), #1701 (logo) | open drafts, not touched |
| Merged since #1705 | none relevant |

## Integration baseline

- **Base:** PR #1706 head `274d79566…` (`claude/jurnl-financial-os-stabilization-um0u93`).
  - #1706 holds the stabilized transfer-settlement model (in-transit money is in no account). The MONEY parent must show that model correctly.
  - Building on `main` or #1705 would have meant a competing transfer model. No transfer logic was written in this sprint.
- **Branch:** `claude/jurnl-f05-money-motion-pilot-um0u93`.
- **Draft PR:** stacked on #1706. Merge order is #1705 → #1706 → this PR.

## Addendum: financial source reconciliation

After the first delivery, an in-flight addendum named PR #1706 (`274d7956`) as the authoritative financial baseline. The pilot was already based on exactly that commit, and #1706 has not moved since, so nothing was reset, rebased or cherry-picked. The transfer and card-payment visuals were then bound to #1706's settlement states. Doc 17 has the details and the retest results.

## What already existed (inspected before building)

| Area | Existing | Used by the pilot |
|---|---|---|
| F05 parent | `MoneyHubScreen` (cabinet composition on `MONEY.ENVIRONMENT.CABINET.001`), RootAuthorityStage | Kept as the **default** MONEY parent. The pilot is opt-in (`/money?parent=motion`). |
| Account detail route | `money/places/:placeId` (`MoneyPlaceDetailScreen`) | The transition target. Only a `view-transition-name` was added to its title; no redesign. |
| Account registry and balances | `listActiveAccounts`, `computeMoneyPicture`, `summarizePositions` | HELD, OWED, per-account amounts, transfer states |
| Safe to Spend | `computeSafeToSpend` (F09, 30 days) | AVAILABLE and COMMITTED (doc 08) |
| Transfers | `TransferSheet` / `recordTransfer` (settlement states from #1706) | MOVE MONEY, unchanged |
| Add a place | `AddPlaceSheet` / `createManualAccount` | ADD A PLACE (now exported), unchanged |
| Global nav | `JurnlProductNav` (five items, portaled to the viewport dock) | Same component and behaviour, re-seated on the nav paper by CSS variables |
| Quick Add, Ask | `QuickAddV2Sheet`, `AskJurnlSheet` | unchanged |
| Planning period | `SafeHorizonSheet` (from #1706) | Opened from COMMITTED and AVAILABLE |
| Corner chrome | Global menu chip (account drawer) on every app screen | Kept (doc 07: one deviation from the approved image) |
| Fonts | JURNL Authority Serif (Playfair Display), JURNL Sans (Barlow) | + Pinyon Script (OFL, added) for the lowercase script line |
