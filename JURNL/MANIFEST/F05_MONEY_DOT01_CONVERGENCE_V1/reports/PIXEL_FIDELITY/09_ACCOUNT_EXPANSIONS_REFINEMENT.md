# 09 · Account expansions refinement (02–05)

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Screen | Changed | MAD before → after | Remaining |
|---|---|---|---|
| 02 BANK ACCOUNT | authority stat words over canonical values; label/figure weight 600; CURRENT BALANCE lowered 16 px; strip labels tightened 0.10→0.05 em; Batch 01 coins + column in strips; paper back tile + ink arrow | 6.9 → 6.8 % | ACCOUNT HISTORY open-book art (ORNAMENT.LEDGER.BOOK, no batch); back tile surface awaits Batch 05 |
| 03 RIDESHARE CARD | AVAILABLE BALANCE / SPENDABLE words; Batch 01 ledger + card in strips; paper back tile | 21.4 → 21.3 % | authority composition differs: dark band with gold figure, keychain art, SPENDABLE paper (keychain art requires source recovery) |
| 04 CASH ON HAND | BILLS SET ASIDE / SPENDING CASH words; Batch 01 coins + receipt; paper back tile | 22.2 → 22.2 % | authority composition differs: large amphora left, cream figure on dark band, two-row paper (amphora layer requires source recovery) |
| 05 CREDIT CARD | CREDIT LIMIT / AVAILABLE CREDIT / DUE DATE (date, as drawn); alternating moss / terracotta strip tiles; paper back tile | 19.9 → 19.6 % | authority composition differs: figure on dark band with OWED rule, stats paper right, coin art (coin layer requires source recovery) |

Values: AVAILABLE / SPENDABLE / SPENDING CASH = `accountReservationHealth().notSetAside` (F07, canonical); HELD / SET ASIDE / BILLS SET ASIDE = active reservations; PENDING / NOT LEFT YET = waiting to leave; card figures = canonical limit, available credit and due date. No arithmetic was added to the money model.

The four pages share one layout architecture (SK02 papers, same strip rhythm), which is exactly the drift the founder warned about for 03–05: their authorities use distinct compositions. Rebuilding them needs the keychain, amphora and coin layers (source recovery) and is the first item of doc 20.
