# 11 · Long and dynamic content

Probe `scripts/jurnl/f05-motion-pilot/probe_dot01_long_content.ts` (synthetic many-pocket world): the long pocket NEIGHBOURHOOD
CREDIT UNION EVERYDAY CHECKING holding $1,234,567.89, a zero-balance cash pocket, a long merchant and a six-figure amount typed
into RECORD TRANSACTION, the validation error, and an open keyboard (393 × 480 with AMOUNT focused). Before = `8e0b8d861`.

| Case | Viewport | Text leaving paper before | after | Visual ellipsis (after) | Unreachable controls | Primary action reachable | Page scroll |
|---|---|---|---|---|---|---|---|
| L02-long-pocket-page | 393x852 | 0 | 0 | — | — | — | False |
| L02-long-pocket-page-360 | 360x780 | 0 | 0 | — | — | — | False |
| L06-directory-many | 393x852 | 0 | 0 | NEIGHBOURHOOD CREDIT; UNION EVERYDAY CHECKING | — | — | False |
| L12-long-settings | 393x852 | 1 | 1 | — | — | — | False |
| L15-rename-long | 393x852 | 0 | 0 | — | — | — | False |
| L16-record-long-account | 393x852 | 2 | 1 | NEIGHBOURHOOD CREDIT UNION EVERYDAY CHEC | — | True | False |
| L16-record-keyboard | 393x480 | 2 | 1 | NEIGHBOURHOOD CREDIT UNION EVERYDAY CHEC | — | True | False |
| L16-record-error | 393x852 | 2 | 1 | NEIGHBOURHOOD CREDIT UNION EVERYDAY CHEC | — | True | False |
| L07-history-long | 393x852 | 0 | 0 | — | — | — | False |

Adaptations: a select's value ellipsises inside its own box (visual only — the full value is the button's accessible name and
the listbox lists it in full; no financial value is truncated: amounts, balances and differences are never ellipsised); the
directory card names wrap to two lines and ellipsise the rest with the full name in the card's aria-label; the record form
scrolls inside its content region under an open keyboard and RECORD TRANSACTION stays reachable.
