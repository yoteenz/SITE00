# 04 · Authority comparison (OPUS3, after the founder correction)

Founder correction (2026-11-06): *"you're using the wrong sidekick image for the safe to spend buffer. recheck ALL references against the
authorities again for consistency."* The first OPUS3 draft drew BUFFER and PRIVACY on the CH01 / CH02 ChatGPT clean plates (the sprint's
"optional draft environment"). Every founder authority for these two screens is drawn on the shared OV08 menu environment, so both now
mount OV08, and every other reference was rechecked against its authority. The founder re-sent the full-resolution BUFFER
authority (941 × 1672): scored against each candidate plate on regions free of UI, it matches OV08 (arch + coast PSNR 16.8 dB,
left drape 21.7 dB) and not the CH01 clean plate (8.3 dB, 14.6 dB), so OV08 stands. That full-resolution authority was then
measured directly and the live layer re-fitted to it (title 5.55 cqw, BUFFER 1.12×, italic serif script, V laurel between
rules at x 0.318–0.67, JURNL tilted −9° with its tag paper, help 2.85 cqw on a 2.33 % pitch, rule at 0.427, BUFFER AMOUNT
3.4 cqw, amount x 0.107–0.736 with its divider at 71 %, effect x 0.0895–0.745, BACK 0.095–0.368 and SAVE 0.394–0.745 on
0.851–0.909). Side-by-side runtime captures are in `captures/` and the
evidence ZIPs.

| Surface | Authority | Before this correction | Now | Match |
|---|---|---|---|---|
| SAFE TO SPEND BUFFER · L0 | BUFFER-AUTHORITY-VS-ARTWORK (OV08 environment) | CH01 clean plate (wrong sidekick) | OV08 menu environment, once | ✔ |
| BUFFER · tag | JURNL on the small tag paper | — | live JURNL wordmark on the blank tag | ✔ |
| BUFFER · headline | SAFE TO SPEND / BUFFER, *a cushion you keep aside*, laurel ornament between rules, on the baked title paper | title on the CH01 parchment, no ornament | live two-line title, script, live ornament on the OV08 title paper; no second header | ✔ |
| BUFFER · help, rule, label | SET ASIDE A CUSHION THAT ALWAYS REMAINS OUTSIDE YOUR SPENDABLE AMOUNT · gold rule · BUFFER AMOUNT | different copy, label inside the paper | authority copy (plus *type it in EUR; jurnl keeps it in USD* only for a non-USD display), gold rule, BUFFER AMOUNT | ✔ |
| BUFFER · amount paper | $ 0.00 \| USD ▾ | amount only | live field with symbol, divider and currency selector (opens DISPLAY CURRENCY) | ✔ |
| BUFFER · effect paper | EFFECT ON SAFE TO SPEND \| NO BUFFER SET (i) | KEPT ASIDE NOW figure | EFFECT ON / SAFE TO SPEND \| NO BUFFER SET (one line) or `<amount> KEPT ASIDE` (+ USD for a non-USD display) · the (i) discloses *SAFE TO SPEND LEAVES THIS AMOUNT OUT OF WHAT YOU CAN SPEND* (true: `safeToSpend.ts` subtracts the buffer) | ✔ |
| BUFFER · coin still life | lower left of the field | withheld | CH01_COIN_RESERVE at the authority origin, 1:1, sliver clipped | ✔ (art not pixel-perfect, see 05) |
| BUFFER · BACK / SAVE BUFFER | cream BACK paper · warm olive SAVE with a thin gold rim | same papers on CH01 | BACK paper at 42 % of the row; SAVE BUFFER the V3 olive control in the authority's warm olive with a 1.5 px gold rim, one line | ◐ SAVE paper withheld (no rim) |
| PRIVACY & CONSENTS · L0 | PRIVACY-AUTHORITY-VS-ARTWORK (OV08 environment) | CH02 clean plate (wrong sidekick) | OV08 menu environment, once | ✔ |
| PRIVACY · headline | PRIVACY & / CONSENTS, *what jurnl may keep and use*, ornament | one line on the CH02 parchment | live two-line title, script, ornament | ✔ |
| PRIVACY · YOUR CONSENTS | REMEMBER SETUP · LINKED ACCOUNTS OPTIONAL · NOTHING SOLD · ASK JURNL CONTEXT, icons, lowercase script lines, switches on all four | two switches, a separate HOW JURNL WORKS section | the authority order and copy; LINKED ACCOUNTS OPTIONAL and NOTHING SOLD are statements without a switch (sprint rule: policy, not consent) | ◐ by design |
| PRIVACY · YOUR DATA | AI ACCESS · YOUR DATA · DATA EXPORT *request a copy of your data.* · REMOVE ACCESS on oxblood | same rows, uppercase subs | authority rows with icons and script lines; DATA EXPORT reads *not available yet.* (export honesty) | ◐ copy kept truthful |
| PRIVACY · REMOVE ACCESS / BACK | oxblood row above a wide cream BACK | inside the scrolling list | REMOVE ACCESS paper and BACK paper at their authority placements, always on screen; only the list scrolls | ✔ |
| GLOBAL MENU | OV08 sectioned menu (Grok2 OV08 PASS) | port into the leaf tip and the torn foot | port y 0.306–0.885; live JURNL on the tag (family consistency with BUFFER / PRIVACY on the same environment — founder to confirm) | ✔ / ◐ tag is a consistency decision |
| SEARCH | Grok2 OV05: open paper x 0.32–0.90, y 0.27–0.76 | column to x 0.935 (into the paper's edge notches) | column `[0.335, 0.258, 0.905, 0.772]` | ✔ |
| MANAGE POCKET | OPUS3 sprint: independent RENAME / DELETE papers on the compact popover; never OV04-MANAGE-NOTE | — | compact popover with paperclip and landscape, the two text-free papers, live labels, live-page blur | ✔ (Grok2's map mounted the note; the later OPUS3 sprint forbids it) |

Close control: the authorities draw a circular close; the sprint forbids circular tappable buttons, so the approved square-rounded JURNL
close stays. Switches: the authority draws round olive switches; the approved JURNL switch stays (its hit area is 44 px).
Script: the authorities' lowercase lines are an italic serif, not the brush script: the serif's own italic (Playfair Display
Italic, unmodified, OFL, `public/site00/projects/jurnl/fonts/playfair-display-*-italic.woff2`) now sets the BUFFER / PRIVACY scripts,
the privacy row lines and — for the family on the same environment — the menu's script. Icons: YOUR DATA is a database, DATA EXPORT a
download, as drawn.
