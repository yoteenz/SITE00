# 25 · Financial non-regression

No financial module changed this sprint (data/, ledger/, finance/ untouched; git diff in report 29). The rebuilt pages read the
same canonical figures: `computeMoneyPicture` positions (held / owed), `reviewIssues`, `orderAccounts`. ZERO HELD BALANCE BEFORE
ARCHIVE (`HELD_BALANCE`), zero liability, no unresolved dependencies: unchanged and tested (jurnlF05Dot01 D53 / D53b,
jurnlF05Pockets P08b, E2E pockets T14 / T16). No automatic money movement; no ledger record is touched by any composition.
