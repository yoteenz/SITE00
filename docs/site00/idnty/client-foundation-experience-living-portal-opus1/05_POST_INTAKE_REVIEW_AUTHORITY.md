# 05 — Post-Intake Review Authority (Family A)

Boards: **M01**, M02, TP02, TL02, D02, D03, UW02, X03, X12.

## Locked copy

| Slot | Copy |
|---|---|
| Rail | `01 —— FOUNDATION REVIEW` |
| Headline | **YOUR FOUNDATION IS TAKING SHAPE.** Phone breaks: YOUR / FOUNDATION / IS TAKING / SHAPE. Tablet+ breaks: YOUR FOUNDATION / IS TAKING SHAPE. Red square period |
| Lede | YOUR INTAKE HAS BEEN RECEIVED. WE'RE REVIEWING YOUR REQUIREMENTS AND PREPARING YOUR PERSONALIZED FOUNDATION PROPOSAL. |
| Trust line | NO PAYMENT IS TAKEN DURING REVIEW. |

## Composition

1. **Hero:** rail, headline, lede, and the crown object (`DfCrownObject`, etched "UNDER REVIEW" on tablet+).
2. **Truth strip:** STATUS (IN REVIEW / IN PERSONAL REVIEW) · RECEIVED (event time) · REFERENCE. On TP+ it also holds `STATUS AS OF h:mm` + REFRESH.
3. **Route notice** (conditional, see below).
4. **Progress:**
   - Phone: 7 ticks with "STAGE 2 OF 7 · FOUNDATION REVIEW" and "NO PERCENTAGES. STAGES ONLY."
   - Tablet+: the 7-cell strip.
5. **WHAT HAPPENS NEXT**, three steps:
   - 01 SITE 00 REVIEWS YOUR REQUIREMENTS: "EVERY PROPOSAL IS APPROVED BY SITE 00 BEFORE YOU SEE IT."
   - 02 YOUR PERSONALIZED PROPOSAL: "WE EMAIL YOU WHEN IT'S READY."
   - 03 APPROVE AND PAY SECURELY: "ON STRIPE. NOTHING IS CHARGED UNTIL YOU ACCEPT."
6. **WHAT WE RECEIVED:** the intake summary (business, domain path, mailboxes, devices). It ends with: "SUBMITTED … · YOUR ANSWERS ARE LOCKED WHILE SITE 00 REVIEWS THEM. NEED TO CHANGE SOMETHING? REPLY TO YOUR CONFIRMATION EMAIL."
7. **COME BACK ANYTIME:** home screen › access card › email.
   - Phone/tablet: inline.
   - Desktop: in the status column.

On desktop, WHAT HAPPENS NEXT and WHAT WE RECEIVED sit side by side, and the status column carries the next step, access and activity.

## States

| State | Trigger (canonical) | Visible difference |
|---|---|---|
| RECEIVED · STANDARD | INTAKE_COMPLETE / RECOMMENDATION_READY, review route AUTO (auto-prepared, awaiting founder approval) | none: same hero |
| RECEIVED · CLOSER LOOK | same states, review route FOUNDER (complex) | ink notice: "SOME OF YOUR REQUIREMENTS NEED A CLOSER LOOK. SITE 00 WILL REVIEW THEM PERSONALLY BEFORE YOUR PROPOSAL IS READY. YOU DON'T NEED TO DO ANYTHING RIGHT NOW." |
| QUESTION FROM SITE 00 | OPEN client action CUSTOM_REQUEST before proposal | red notice "SITE 00 HAS ONE QUESTION FOR YOU" + NEEDS YOU badge |
| SCOPE BEING ADJUSTED | founder adjusting (quote v+1 in DRAFT) | nothing extra. Adjustments surface as a versioned proposal with a founder note (`14`) |

## Truthfulness rules

- No percentage, no countdown, no "reviewing now", no live typing or presence indicators.
- No promised date. The proposal sets the timeline.
- The auto path and the founder path are never distinguished as "machine" versus "human". Every proposal is founder-approved (direction 3–5).
- "RECEIVED" is the `INTAKE_COMPLETED` event time, not page-load time.

## Data dependencies

| Datum | Source | Status |
|---|---|---|
| received time | `INTAKE_COMPLETED` event | G-08 (events stripped from payload). Fallback: `artifact.updated_at` at INTAKE_COMPLETE |
| review route AUTO/FOUNDER | founder review queue | **G-01** |
| proposal hidden until founder approval | quote `founder_commercial_ready` + server gate | **G-02** |
| intake summary | `payload.intake` | exists |

## Server gate (G-02): what changes in Composer's backend phase

Today `completeIntake` creates a CLIENT_REVIEW quote immediately. The authority needs one of two options:
- **(a)** keep auto-preparation but create the quote in DRAFT and expose it only after founder approval; or
- **(b)** keep CLIENT_REVIEW but have `getArtifactPayload` withhold `quote` until `founder_commercial_ready`.

The recommendation is **(a)**, because it keeps the client payload honest. This is a backend change and is out of scope for this sprint. Until it ships, the review page can render only under the launch gate (INTAKE_SUBMITTED surface).

## Email

"YOUR FOUNDATION IS TAKING SHAPE" (`20`) replaces FNDATN-01 email 02's subject when G-02 lands. Sending stays disabled.
