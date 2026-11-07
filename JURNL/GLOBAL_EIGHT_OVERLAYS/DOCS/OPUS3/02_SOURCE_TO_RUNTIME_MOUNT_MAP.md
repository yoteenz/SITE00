# 02 · Source-to-runtime mount map (OPUS3, regenerated shells)

The founder named `JURNL_REGENERATED_SCREEN_CANDIDATES.zip` the correct clean sidekicks / shells (2026-11-06). Six overlays are
drawn on them; the menu stays on the OV08 sectioned environment.

Layers: **L0+L1** the shell (environment and its compositional art, opaque) · **L1** independent paper backings · **L2** live UI.
Regions are fractions of the art `[x0, y0, x1, y1]`. Every shell is drawn at one uniform contain scale with its own aspect ratio
(`Shell.tsx useShellPlate`, `Editorial.tsx PlateOverlay`): nothing is stretched, cropped (except a measured crop line) or recentred.
Papers are `<img>` with `object-fit: contain` inside an element whose `aspect-ratio` is the art's own. Type is in container units of
the plate, clamped. Only the named list / body regions scroll; the page never scrolls.

| Overlay | Shell (runtime id, size) | Component | Live regions | Art not drawn twice |
|---|---|---|---|---|
| SAFE TO SPEND BUFFER | `CH01_BUFFER_SHELL` 560×887 | `ChildEnvironments.tsx` `CH01_BOX` | head `[0.3, 0.235, 0.96, 0.368]` cream headline, script, gold ornament · intro `[0.3, 0.378, 0.95, 0.46]` help · column `[0.14, 0.466, 0.95, 0.785]` rule, BUFFER AMOUNT, **amount paper**, warnings, **effect paper** + (i) · actions `[0.38, 0.8, 0.95, 0.872]` **BACK paper** + SAVE BUFFER | the shell's coins and sprig (no coin still life), no header paper, no wordmark (the shell has no tag paper) |
| PRIVACY & CONSENTS | `CH02_PRIVACY_SHELL` 1024×1536 | `PrivacyEnvironment` `CH02_BOX` | tag `[0.3, 0.04, 0.63, 0.118]` JURNL · head `[0.2, 0.135, 0.8, 0.262]` · list `[0.105, 0.292, 0.765, 0.772]` (only scroll) · remove `[0.15, 0.782, 0.775, 0.852]` **REMOVE ACCESS paper** · back `[0.22, 0.858, 0.72, 0.928]` **BACK paper** | the shell's title and tag papers, sprig and arch |
| ADD A POCKET | `OV02_ADD_POCKET_SHELL` 1024×1536 | `MoneyScreens.tsx` `OV02_PLATE` (plate mode) | head `[0.14, 0.255, 0.86, 0.352]` · body `[0.1, 0.36, 0.88, 0.748]` (scrolls) name, type grid, balance, extras, note · foot `[0.17, 0.756, 0.88, 0.83]` CANCEL / SAVE POCKET papers | the statue, purse medallion, drape, plants and coins (no EdArt decor, no CSS ground, no headline paper) |
| MOVE MONEY / PAY A CARD | `OV03_MOVE_MONEY_SHELL` 941×1672 | `FinanceSheets.tsx` `OV03_PLATE` (plate mode) | head `[0.12, 0.232, 0.9, 0.366]` headline + honesty note, above the seal · body `[0.1, 0.56, 0.9, 0.795]` (scrolls) FROM, TO, amount, date, status, effect, note · foot `[0.08, 0.8, 0.92, 0.866]` CANCEL / RECORD papers, above the coins | the twine and direction seal (no EdSeal), the olive branch, lemons, arch, coins |
| MANAGE POCKET | `OV04_MANAGE_NOTE` 642×741 | `PocketManager.tsx` `OV04_NOTE_BOX` | head `[0.16, 0.375, 0.86, 0.485]` MANAGE POCKET + name · items `[0.14, 0.5, 0.88, 0.85]` **RENAME / DELETE papers** | the note's own paperclip and coastline tear (the old separate clip and pocket art are removed); clipped to its measured outline (`ov04NoteOutline.ts`) |
| SEARCH | `OV05_SEARCH_SHELL` 581×887 | `SearchDrawer.tsx` `OV05_OPEN` | head `[0.4, 0.14, 0.95, 0.245]` · column `[0.36, 0.25, 0.95, 0.83]` field, filters, count, results (only scroll), ALL ACTIVITY / ADVANCED SEARCH | the bust, lemon, arch, ledgers; its 7 px / 1 px crop line clipped (`inset(0% 0.344% 0% 1.377%)`) |
| GLOBAL MENU | `OV08_MENU_ENVIRONMENT` 2016×3584 | `GlobalMenu.tsx` `OV08_REGION` | tag JURNL · head MENU · port `[0.075, 0.306, 0.745, 0.885]` (only scroll) 3 sections, 12 / 12 rows | unchanged |

The MANAGE POCKET note is placed by the popover (anchored to the pocket) and scales uniformly to the room it has
(`--jrn-pop-maxh`), with its live page blurred behind it.

Not mounted: the CH01 / CH02 clean plates, the OV05 open composition, the coin still life (the CH01 shell has its own), both header
parchments, the SAVE BUFFER olive paper. Excluded as before (`07_EXCLUDED_AND_GATES/DO_NOT_USE.txt`): Grok2 OV07 / OV01 (pending),
unapproved OV06, the OV02 / OV03 Grok shells, the OV04 full compositions; `overlays/eight/registry.ts` keeps OV01–05 / 07 / 08 RETIRED
and OV06 INSTALLED_NOT_MOUNTED. FD-12 / the approved F09 drawer is untouched; OV01 MONEY action sheet and OV07 ARCHIVE BLOCKED keep their
live editorial compositions.
