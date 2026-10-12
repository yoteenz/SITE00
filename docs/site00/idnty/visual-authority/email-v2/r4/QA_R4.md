# Email V2 R4 — QA report

`qa_r4.mjs`: 20/20 templates pass. Variety: PASS (reused crops 0, duplicate headlines 0).
`render.mjs`: 20 emails × 390 / 768 / 1024 × web fonts and fonts blocked = 120 renders; no document overflow,
no element outside the 640px message, no widened message table, no missing asset.

Checks per template: subject and primary CTA against the copy contract (the R3 benchmark contract for the invitation
and M06), secondary CTA, template tokens within the contract placeholders and destination, literal uppercase for
SITE 00 text, Barlow Condensed for display and Saira Semi Condensed for everything else, internal-term and filler
language, and line breaks at all three widths: no one-word last line in body copy, no one-word headline line from a
natural wrap, no word split across lines.

Fonts-blocked line notes (31) are advisory: this VM falls back to a wide Arial because Arial Narrow
is not installed. They never overflow; the width checks cover the fallback run.

| Code | Template | Class | Result | Subject source | Fallback notes |
|---|---|---|---|---|---|
| TR-01 | personal-foundation-invitation | P1 | PASS | R3 benchmark copy contract | 6 |
| TR-02 | intake-started | P2 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 2 |
| TR-03 | intake-completed | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 1 |
| TR-04 | quote-ready | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| TR-05 | quote-updated | P2 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| TR-06 | quote-accepted | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| TR-07 | checkout-link-ready | P2 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| TR-08 | payment-confirmed | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 2 |
| TR-09 | payment-failed | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 2 |
| TR-10 | project-activated | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| TR-11 | foundation-complete | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 1 |
| TR-12 | records-available | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| OP-01 | client-action-required | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| OP-02 | approval-requested | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 2 |
| OP-03 | approval-completed | P3 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 0 |
| MK-01 | foundation-credit-issued | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 1 |
| MK-02 | bldr-discovery | P2 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 4 |
| MK-03 | M01 | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 5 |
| MK-04 | M06 | P1 | PASS | R3 benchmark copy contract | 3 |
| MK-05 | M13 | P1 | PASS | DF_V2_EMAIL_COPY_AND_TOKEN_CONTRACTS.md | 2 |

Full machine output: `scripts/df-email-v2-benchmark/r4/qa/R4_QA.json`.
