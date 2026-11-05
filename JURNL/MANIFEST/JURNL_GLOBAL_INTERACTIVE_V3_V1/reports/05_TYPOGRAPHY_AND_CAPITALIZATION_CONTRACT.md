# 05 · Typography and capitalization contract

Faces (established, none invented): **JURNL Authority Serif** (display / functional serif, 400–600), **JURNL Authority
Sans** / **JURNL Sans** (utility), **JURNL Display**, **JURNL Script** (Pinyon Script, cursive).

| Role (class) | Face · size / line · tracking | Case |
|---|---|---|
| EDITORIAL_HEADING `.jv3-t-editorial` | serif 500 · 22–30 px / 1.04 · .06em | UPPER |
| FOLIO_HEADING `.jv3-t-folio` | serif 500 · 19–24 px / 1.08 · .06em | UPPER |
| SECTION_LABEL `.jv3-t-section` | serif 600 · 12 px · .16em | UPPER |
| ACTION_LABEL `.jv3-t-action`, pills | serif 600 · 13.5–14 px · .10–.12em | UPPER |
| FIELD_LABEL `.jv3-t-field-label` | serif 600 · 11.5 px · .14em | UPPER |
| FIELD_VALUE `.jv3-well > input` | serif 500 · **16 px** (iOS never zooms) | UPPER (display) |
| FINANCIAL_AMOUNT `.jv3-t-amount` | serif 500 · 26 px · lining tabular | — |
| SECONDARY_METADATA / HELP `.jv3-t-meta` | serif 500 · 11 px / 1.4 · .10em | UPPER |
| WARNING_TEXT `.jv3-caution .jv3-t-meta` | serif 500 · 11 px on oxblood, ≥ 4.5:1 | UPPER |
| CURSIVE_ANNOTATION `.jv3-t-script` | Script 400 · 19 px | **lowercase only** (code lowercases + CSS) |

Rules enforced: (1) every non-cursive system label is authored UPPERCASE; (2) cursive is one sparse line per folio,
never a figure or an action; (3) user values (Pocket names, merchants, e-mail) are **displayed** uppercase by the `.jrn`
root but **stored as typed** — no data is rewritten; (4) accessible names stay meaningful (aria-labels authored
uppercase, not transformed text). The one mixed-case system screen (`JurnlProductionServiceScreen`) was corrected.
Audit results: report 23 / 22 (`lowerNonScript` = 0 on 90 V3 cells; unit tests M3, E1 assert no lowercase outside the
script role).
