# JURNL functional copy replacement matrix

Extract: `JURNL_PLAIN_LANGUAGE_AUDIT.csv` (**245** strings). Below: **priority hub replacements** (functional layer only; tagline preserved).

| string_id | current_text | recommended_text | rationale | data_requirements |
| --- | --- | --- | --- | --- |
| parent.F07.question | WHAT IS COMING, AND WHEN? | UPCOMING PAYMENTS | Direct noun phrase | none |
| parent.F08.question | WHAT DO I WANT IT TO DO? | WHERE YOUR MONEY IS ASSIGNED | Matches plan assign | none |
| parent.F09.question | WHAT CAN I SPEND WITHOUT UNDOING THE PLAN? | WHAT YOU CAN SPEND NOW | Plain STS | STS computed |
| parent.F05.question | WHAT DO I HAVE, AND WHERE IS IT? | YOUR ACCOUNTS AND BALANCES | Factual | account list |
| F07.task (UpcomingScreens) | BILLS, SUBSCRIPTIONS AND INCOME IN THE ORDER THEY ARRIVE. | BILLS, SUBSCRIPTIONS, AND INCOME BY DUE DATE. | Remove poetic “arrive” | none |
| F08.cta | ADD AN INTENTION | ADD A PLAN LINE | Less abstract | none |
| PlanScreens | ACROSS N INTENTIONS | ASSIGNED ACROSS N PLANS | Plain | plan count |
| GoalsScreens lead | SET ASIDE | SET MONEY ASIDE | Founder example | none |
| AheadScreens | NO INCOME, BILLS OR PLANS ARE DATED YET | ADD INCOME AND BILLS TO SEE WHAT IS NEXT | Actionable empty | none |
| HomeScreens attention | RENT IS CLOSE | **Dynamic:** `{name} IS DUE {relativeDate}` | Specific fact | upcoming item |
| SafeToSpend STATE_LINE | (completeness variants) | Keep; already factual | — | STS completeness |

**Total proposals in CSV backlog:** 38 flagged ABSTRACT/EDITORIAL/VAGUE (see `plain_language_extract_meta.json`).

**Brand tagline:** PLAN TODAY. GROW FREELY. — **unchanged**.

**Founder approval:** PENDING for all replacements.
