# 07 — Empty and error states

The rule: **no invented values.** A panel without data says so in plain words, with its amount slot reading "NONE" or "—" (muted) and a caption naming what is missing.

| Situation | What shows |
|---|---|
| No places | Collection 01: one wide paper, NO PLACES YET · ADD A BANK ACCOUNT, CARD OR CASH. Band: HELD and OWED $0; COMMITTED and AVAILABLE "—" with ADD A PLACE TO SEE WHAT IS COMMITTED AND AVAILABLE. RESERVED and SAFE TO SPEND "—" · ADD A PLACE FIRST. |
| 1–3 places | their papers, then ADD A PLACE and (2+) MOVE MONEY in the free slots |
| More than 4 places | 3 papers + ALL PLACES · +n MORE (opens the full list) |
| Several cards | each is its own liability paper with OWED; OWED in the band is their sum |
| Long names | balanced two lines, scaled down, then clipped; the full name stays in the accessible name |
| Large amounts | scaled down to fit the column; never abbreviated |
| Zero / negative balances | shown as recorded; an overdrawn place shows its negative amount (never hidden) |
| No transfers in progress | IN TRANSIT / PENDING / SCHEDULED read NONE · NOTHING IN TRANSIT / NOTHING PENDING / NOTHING PLANNED |
| No bills | BILLS + SUBSCRIPTIONS: NONE · NO BILLS ADDED |
| No goals | SAVINGS: NONE · NO GOALS YET |
| A goal, nothing set aside | SAVINGS: $0 · SET ASIDE FOR GOALS (a real goal with $0; for example the goal setup creates) |
| No expected income date | NEXT INCOME: NOT SET · ADD A DATE (opens INCOME's add sheet) |
| Income date, amount unknown | NEXT INCOME: NOT SET · IN n DAYS |
| No spending recorded | SPENDING INSIGHTS: NONE · NOTHING RECORDED |
| Sample preview (no places of the user's own) | figures that depend on real places show "—"; sample figures are never shown as the user's |
| Loading / error | The page reads the device repository synchronously, so there is no loading phase. A repository error falls back to the shell's existing error handling (unchanged). |
