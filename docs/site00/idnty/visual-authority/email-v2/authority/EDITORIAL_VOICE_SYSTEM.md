# SITE 00 correspondence — editorial voice system (V2)

Status: benchmark draft, pending founder review. Applies to Digital Foundation and IDNTY email. V1 lean-pack files are not edited.

## The idea underneath every message

A business has an address. The Digital Foundation is the ground at that address: the domain, the mail that comes from it, and the records that make both trustworthy. BLDR is where something gets built on that ground.

This is not a tagline to repeat. It is the logic that decides what a message is about and how it is composed. It already exists in shipped SITE 00 copy ("YOUR BUSINESS HAS AN ADDRESS.", "WELCOME TO YOUR NEXT ADDRESS", "FROM FOUNDATION TO DIGITAL LOCATION.").

## Who is writing

An experienced studio that does careful, unglamorous technical work and takes pride in it. It knows the reader is busy. It has opinions about how things should be built and keeps most of them to itself. It is never in a hurry to sell.

## Voice properties

| Property | In practice |
|---|---|
| Assured | Says what is true without hedging or over-qualifying. |
| Attentive | Starts from the reader's situation, not from SITE 00's process. |
| Specific | Names the actual thing (the registrar, the mailbox, the records other inboxes check) instead of "your digital presence". |
| Warm, not intimate | Friendly and direct. Does not pretend to a relationship that has not happened. |
| Quietly funny | Allowed once per message at most, and only where it relieves real friction ("IF NOBODY QUITE REMEMBERS, SAY SO."). |
| Restrained | Facts said once. Pauses are allowed. Silence is allowed. |

## Emotional registers

Different messages need different registers. Choose one before writing.

| Register | Use for | Sentence behavior | Red | CTA posture |
|---|---|---|---|---|
| LETTER | Invitations, first contact, personal access | Full sentences, second person, a sign-off, optional P.S. | One accent and one button | Inline, sized to the words |
| RECORD | Completion, confirmations, receipts | Short declaratives, ledgers, numerals where they are real | Seal or rule only | Quiet, often outlined or black |
| NOTICE | Failures, action required, deadlines | One fact, one consequence, one action. No mood. | Status mark only | Clear and singular |
| FEATURE | Marketing education, BLDR, discovery | Editorial lede, sections that move somewhere, a turn or revelation | Allowed to flood once | Full-width band permitted |
| BRIEF | Quotes, scope changes, approvals | Numbers first, then what changed and why | Highlight only | Decision-focused |

## Sentence rules

1. Each paragraph adds new information, a new perspective, or new value. If it restates the headline, cut it.
2. Vary sentence length. A long sentence that carries detail, then a short one that lands.
3. Prefer concrete nouns: domain, mailbox, registrar, records, scope, price.
4. Second person ("YOU", "YOUR") by default. "WE" only when SITE 00 is actually doing something.
5. One idea per headline. No subheads that rephrase it.
6. Openings never start with DISCOVER, INTRODUCING, MEET, WE ARE EXCITED, or BECAUSE.
7. Do not use the contrast formulas flagged by the expression engine: "IT'S NOT X. IT'S Y.", "THIS ISN'T X. IT'S Y.", "YOU DIDN'T X. YOU Y.", "NOT X. Y." One plain "TO YOU, NOT TO US" style clause is acceptable when it carries a real fact.
8. No generic luxury language: TIMELESS, ELEVATE, INDULGE, CURATED, SEAMLESS, UNLOCK, JOURNEY, EMPOWER, WHERE SOPHISTICATION MEETS.
9. No NDX voice markers (RECEIPT, DIAGNOSTIC, CONFESSION, HOT TAKE).

## Truth without narration

The safety rules stay. They move out of the copy and into the contract, delivery validation, and QA. The customer reads the consequence in human terms, or nothing at all.

| Internal rule | Where it lives | What the customer reads |
|---|---|---|
| No payment is confirmed by the invitation | Copy contract, QA | "YOU READ BOTH BEFORE ANYTHING IS CHARGED." |
| Completion email carries no upsell | Copy contract `opt_out`, QA blocks BLDR terms in B02 | Nothing. BLDR is simply absent. |
| M06 must not claim interest or a booking | Copy contract, trigger rules, QA | Invitation to look, with no date, deadline, or "your request". |
| Marketing sends require opt-in | Consent rules, dispatch gate | A standard footer: why they receive it, manage preferences, unsubscribe. |
| Sender identity unregistered | Delivery validation | Nothing in the body. The from-line stays a placeholder in review only. |
| Records availability is a separate message | Event map | "YOUR FULL RECORD ARRIVES IN ITS OWN EMAIL." |

Forbidden in customer copy: CLASSIFICATION, PLANNED_CONTRACT, IS CLAIMED, IS INTRODUCED, IS RECORDED COMPLETE, NO UPSELL, SENDER IDENTITY, UNREGISTERED, REQUIRES MARKETING OPT-IN, TEMPLATE, PLACEHOLDER, SAMPLE LAYOUT, TRANSACTIONAL, and any internal enum or event name.

## Personalization

- Only fields the contract supplies. Today: `business_name`, `public_token`, `recipient_email` (invitation); `business_name`, `public_token` (completion); `business_name`, `preference_url` (M06).
- Every field has a fallback that removes the line rather than inventing a value.
- Never use a first name, a referrer name, or a shared history that the data does not provide.
- Client names, email addresses, domains, URLs, and tokens keep their original case inside uppercase copy.

## Uppercase typography

Uppercase is the type style. It is not the voice.

| Element | Face | Weight | Size (desktop / mobile) | Tracking | Leading |
|---|---|---|---|---|---|
| Display headline (FEATURE) | Saira Semi Condensed | 700 | 46–52 / 34–38 px | 0 to −0.01em | 0.95 |
| Headline (LETTER, RECORD) | Saira Semi Condensed | 600 | 30–34 / 26–28 px | 0.01em | 1.08 |
| Lede | Saira Semi Condensed | 500 | 17–18 / 16 px | 0.02em | 1.5 |
| Body | Saira Semi Condensed | 400 | 15 / 15 px | 0.03em | 1.62 |
| Labels and metadata | Saira Semi Condensed | 500 | 10–11 px | 0.16–0.2em | 1.3 |

Body copy is never bold and never set in the display weight. Long uppercase passages need the extra tracking and leading above to stay legible. Body text is `#1E1E1E` on white (contrast 16.7:1). Secondary text is `#5E5E5E` (6.5:1). Small labels are `#72706C` (4.9:1). White on red `#D90C0C` is 5.2:1. Red is never used for body text.

## In voice and out of voice

| Out of voice (V1 lean pack) | In voice (V2) |
|---|---|
| "SITE 00 HAS PREPARED A PERSONAL FOUNDATION. THE LINK BELOW OPENS YOUR PROJECT. NO PAYMENT IS CONFIRMED IN THIS MESSAGE." | "BEFORE WE SET ANYTHING UP, WE'D LIKE TO KNOW HOW YOU WORK." |
| "THE FOUNDATION SERVICE IS RECORDED COMPLETE." | "THE GROUNDWORK IS DONE. IT'S THE PART OF RUNNING A BUSINESS NOBODY APPLAUDS AND EVERYONE NOTICES WHEN IT'S MISSING." |
| "BLDR IS INTRODUCED. NO INTEREST IS CLAIMED. NO BOOKING IS CLAIMED." | "AN ADDRESS DESERVES A BUILDING." |

## Sign-off

LETTER register signs off `SITE 00` with the department line `DIGITAL FOUNDATION`. RECORD and FEATURE use the footer only. There is no invented individual signatory until a real sender identity is registered.
