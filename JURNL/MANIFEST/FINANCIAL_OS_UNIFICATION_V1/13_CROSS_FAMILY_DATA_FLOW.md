# 13 · Cross-family dependency and data flow

```mermaid
flowchart LR
  subgraph Records["Stored records (one repository snapshot, user-scoped)"]
    ACC["accounts (F05)"]
    TX["transactions — the one ledger (F04)"]
    DE["dailyEarnings (F06)"]
    OB["obligations (F07)"]
    RES["reservations (F07 / F12)"]
    CA["creditAttributes (F12)"]
    SET["settings.purposeAccounts"]
  end
  DE -- "1 save → ≤2 INCOME legs (commit)" --> TX
  OB -- "mark paid → 1 entry (obligation_id)" --> TX
  TRF["MOVE MONEY / card payment"] -- "2 linked legs" --> TX
  ACC --> POS["computeLedgerPositions"]
  CA --> POS
  TX --> POS
  POS --> F05["F05 MONEY / PLACES"]
  POS --> STS["computeSafeToSpend (F09)"]
  OB --> STS
  RES --> STS
  CA --> CARD["cardFacts / guidance (F12)"]
  TX --> CARD
  RES --> CARD
  SET --> CARD
  CARD --> STS
  STS --> TODAY["computeTodayOperating (F03)"]
  DE --> TODAY
  CARD --> TODAY
  OB --> UP["projectUpcoming (F07)"]
  CARD --> UP
  UP --> TODAY
  SET --> SUG["suggestAccountForPurpose"]
  SUG --> F04S["RECORD SPENDING / QUICK ADD"]
  SUG --> F06S["DAILY EARNINGS"]
  SUG --> F07S["BILL PAID FROM"]
  SUG --> CARD
```

| Event | Writes (one commit) | Visible in |
| --- | --- | --- |
| Save daily earnings | dailyEarnings + 1–2 INCOME entries | F06 totals, F05 balances, F04 rows, F09 cash, F12 "free for this card", F03 earned / next steps |
| Edit / remove a day | same record + same legs rewritten / removed | same, by the difference |
| Record spending | 1 EXPENSE or CREDIT_PURCHASE entry | F04, F05, F12 (card owed), F09 (cash only for EXPENSE) |
| Move money | 2 TRANSFER legs | F05 both accounts; F04 two rows labelled TRANSFER; F09 unchanged unless an account is excluded |
| Card payment | 2 CREDIT_PAYMENT legs | F12 owed / minimum remaining, F05 source, F09 card minimums + cash |
| Add / edit bill | obligation | F07, F09 bills due, F03 slip + coming |
| Set money aside | reservation (no ledger entry) | F07 funding line, F09 "set aside inside", F03, F12 source plan |
| Mark paid | 1 entry + obligation advanced + reservations settled | F07, F04, F05, F09, F03 |
| Balance correction | 1 ADJUSTMENT entry (or entered balance if no entries yet) | F05, F09 |

No family keeps a copy of another family's figure. Every summary is a read of these records at render time (`useRepoTick` / `useSyncExternalStore` on the repository), so one change updates every view on the next render and on reload.
