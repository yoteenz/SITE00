# JURNL EDITORIAL CORRESPONDENCE — creative doctrine

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

> A JURNL EMAIL SHOULD FEEL LIKE SOMETHING RECEIVED FROM A BEAUTIFUL PRIVATE FINANCIAL ATELIER — NOT SOMETHING SENT BY A FINTECH CRM.

**ENVIRONMENT AS INTERFACE** is the app. **ARTIFACT AS INTERFACE** is the email.

## Principles
- The email itself behaves like a physical correspondence artifact: a letter, a financial brief, a clipped note, a correspondence card, an invitation, a dossier, an archival index, a printed review, a ledger insert, a milestone notice, a private access credential.
- The surrounding imagery may reference the larger JURNL world, but the communication artifact is the primary object.
- The artifact carries the message; the message itself is live HTML. Imagery never carries words, numbers, links or anything the reader must act on.
- Every email belongs to a family and inherits its artifact grammar, mood and restraint; states are variants of one template, not new designs.
- Correspondence has lineage: emails in one family share materials, so a reader recognizes JURNL across the whole lifecycle.
- Security and account mail is the plainest family: clarity, trust and legibility outrank expression.

## JURNL emails are not
- mini app screens
- generic newsletters
- SaaS email templates
- HTML replicas of the mobile product
- Canva-style marketing cards
- giant flattened images
- repetitive Mediterranean arches
- generic fintech CRM emails
- entire app screenshots as email backgrounds
- one universal email design for every message type
- scrapbook collage

## They feel like receiving
- a letter
- a financial brief
- a clipped note
- a correspondence card
- an invitation
- a dossier
- an archival index
- a printed review
- a ledger insert
- a milestone notice
- a private access credential

**Legacy:** LEGACY IMPLEMENTATION IS NOT VISUAL AUTHORITY. Existing triggers, providers, routes, auth flows and delivery may be preserved where valid; their templates are not the design.

## Layer model
| Layer | Name | Owner | Holds |
|---|---|---|---|
| L0 | EMAIL CANVAS | HTML | email-safe outer background colour, fallback field when images are blocked |
| L1 | ENVIRONMENTAL / CAMPAIGN ART | IMAGE | generated still life, architectural scene, crop, texture, contextual photograph (optional) |
| L2 | CORRESPONDENCE ARTIFACT | IMAGE | letter, broadside, dossier, invitation, clipped briefing sheet, archival index, ledger sheet |
| L3 | LIVE EMAIL CONTENT | HTML | headline, copy, personalization, financial figures, status, dates, account details |
| L4 | LIVE ACTIONS | HTML | CTA, secondary link, security action, preference controls where appropriate |
| L5 | SYSTEM / LEGAL | HTML | sender identity, unsubscribe where required, preferences, privacy / legal, mailing address / compliance, security footer where appropriate |

**DO NOT FLATTEN L3–L5 INTO GENERATED IMAGERY.**

## Ownership: image vs live HTML
| Generated / static imagery may own | Live HTML must own |
|---|---|
| environment photography | user's name |
| classical fragments | email address |
| paper texture | financial values |
| envelope | Safe to Spend values |
| dossier | bill amounts |
| card stock | due dates |
| clipped paper | dates |
| brass objects | percentages |
| ribbon | dynamic state |
| botanical elements | account status |
| still-life compositions | CTA labels |
| background collage | links |
| nonfunctional embellishment | verification codes |
| physical artifact shells | reset links |
|  | security information |
|  | unsubscribe links |
|  | preference controls |
|  | personalized recommendations |
|  | legally required text |
|  | subject, preheader and headline |

## Restraint
**ONE PRIMARY EDITORIAL GESTURE + ONE SECONDARY TACTILE DETAIL + ONE CONTRAST ANCHOR**

EMAIL MUST NOT BECOME SCRAPBOOK COLLAGE. Do not use every motif at once.

E06 uses at most the artifact and one tactile detail (no environment art); E07 may add one more editorial gesture.

## Typography
| Role | Face | Case | Desktop px | Mobile px | Tracking | Note |
|---|---|---|---|---|---|---|
| DISPLAY HEADLINE | EDITORIAL_SERIF | UPPERCASE_OR_DESIGNED_TITLE_CASE | 34–44 | 28–34 | -0.01em | Per authority: uppercase for short declaratives, designed title case for longer lines. |
| EYEBROW | SANS | UPPERCASE | 11–12 | 11–12 | 0.22em | Family label or date line above the headline. |
| SECTION LABEL | SANS | UPPERCASE | 11–12 | 11–12 | 0.2em | COMING · MOVED · YOUR PLAN. |
| FIGURE | EDITORIAL_SERIF | UPPERCASE | 32–48 | 28–40 | 0 | Lining figures; live HTML only. |
| CTA | SANS | UPPERCASE | 13–14 | 14–15 | 0.18em | Descriptive verb + object: VERIFY MY EMAIL, OPEN MY WEEK. |
| SHORT STATUS COPY | SANS | UPPERCASE | 12–13 | 12–13 | 0.14em | Five words or fewer: ON TRACK. NEEDS A LOOK. |
| LONG-FORM BODY | SANS | SENTENCE_CASE | 16–17 | 16–17 | 0.01em | Never uppercase. Line height 1.55–1.65. 60–70 characters per line on desktop. |
| LEGAL / SUPPORTING BODY | SANS | SENTENCE_CASE | 12–13 | 12–13 | 0.01em | Sentence case, never below 12 px. |

Stacks: serif `'Playfair Display', Georgia, 'Times New Roman', serif`; sans `'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif`. Web fonts are progressive: many clients drop them, so every role must read in its fallback. The app ships a renamed Playfair (JURNL Authority Serif) and Jost; email may only link the original Google-hosted families or fall back.

## Voice
Is: calm confidence, clarity, precision, human, direct. Is not: finance-bro, robotic, flowery for ordinary system communication.

## Financial nudges
**JURNL INFORMS, IT DOES NOT SHAME.**

Avoid: fear language; guilt; moral judgment; panic; manipulative urgency; “bad spending” language; countdown pressure; loss framing for engagement.

Prefer: THIS MAY NEED A SECOND LOOK. · HERE’S WHAT CHANGED. · THIS PURCHASE WOULD CHANGE YOUR PLAN. · YOU STILL HAVE OPTIONS.

## Material grammar
- **Base:** ivory, bone, warm cream, stone, plaster, linen, deckled paper
- **Contrast:** deep olive, black editorial ink, burgundy / oxblood, dark green marble, aged brass
- **Signature details:** olive emboss, burgundy registration strip, linen-bound folio, brass fastener, clipped note, archival index, correspondence envelope, antiquarian print, architectural engraving, classical relief / sculpture fragment, botanical study
- **HTML tokens:** canvas #EFE9DF · paper #F7F2E8 · ink #16130E · inkSoft #3D372D · mute #6F6658 · olive #2C3220 · burgundy #6B1F22 · rule #CFC5B4 · brass #9C7A3C · darkCanvas #1C1A16 · darkPaper #26231D · darkInk #EFE8DB
- At most one arch or loggia view per lineage group; never in E06.
- Classical fragments are cropped and partial — never a full statue as a mascot.
- One botanical per email.

## Families
| Family | Artifact grammar | Mood | Consent | Expressiveness | Environment art |
|---|---|---|---|---|---|
| E01 WELCOME / ARRIVAL | INVITATION, WELCOME_LETTER, ENTRY_CARD | ceremonial, optimistic, aspirational | LIFECYCLE_SERVICE | 4 | EXPECTED |
| E02 GUIDANCE / EDUCATION | FIELD_GUIDE, ANNOTATED_NOTE, EDITORIAL_EXPLAINER | clear, intelligent, human | LIFECYCLE_SERVICE, MARKETING | 3 | OPTIONAL |
| E03 FINANCIAL BRIEF / DIGEST | BRIEFING_SHEET, LEDGER_INSERT, CLIPBOARD_BRIEF, PRINTED_REVIEW | informative, calm, useful | LIFECYCLE_SERVICE | 2 | OPTIONAL |
| E04 MILESTONE / CELEBRATION | CEREMONIAL_NOTE, MILESTONE_CARD, EMBOSSED_LETTER | warm, elegant, rewarding | LIFECYCLE_SERVICE | 4 | OPTIONAL |
| E05 REMINDER / NUDGE | PINNED_NOTE, SMALL_MEMO, DESK_SLIP | concise, supportive, not alarmist | LIFECYCLE_SERVICE | 2 | NONE |
| E06 SECURITY / ACCOUNT / TRANSACTIONAL | ACCESS_CREDENTIAL, FORMAL_NOTICE, PRIVATE_CORRESPONDENCE | clear, restrained, trustworthy | TRANSACTIONAL | 1 | NONE |
| E07 MARKETING / EDITORIAL CAMPAIGN | MAGAZINE_SPREAD, BROADSIDE, CAMPAIGN_LETTER, CULTURAL_EDITORIAL | the most expressive family | MARKETING | 5 | EXPECTED |

Inheritance: EMAIL FAMILY → MESSAGE TYPE → TRIGGER / CAMPAIGN → STATE / VARIANT → RESPONSIVE AUTHORITY → ASSET PACKAGE → IMPLEMENTED TEMPLATE. States are variants of one template (same artifact, same assets, different live content and status line). Never force every state into a separate unrelated template.

## Failures this system prevents
| Failure | Prevention |
|---|---|
| generic newsletter templates | Every template derives from a family artifact grammar (families.ts); no family is a newsletter. |
| giant image-only emails | Layer model: L3–L5 are HTML; the image-blocked state must still read completely (responsive.ts IMAGE_BLOCKED). |
| duplicated Mediterranean scenes | Asset lineage: environments are reused per lineage group, and arches are capped (assets.ts). |
| baked text that cannot personalize | Ownership matrix: names, figures, dates, CTAs and links are HTML only. |
| illegible mobile email layouts | Responsive rules: 16 px body minimum, single column under 480 px, 44 px tap targets. |
| inconsistent hierarchy | One primary gesture + one secondary detail + one contrast anchor; heading order gates. |
| random art-history motifs | Motifs come from the material grammar and the lineage group, not per email. |
| every email receiving a completely unrelated design | Family inheritance and lineage groups; states are variants of one template. |
| marketing language leaking into security messages | Consent firewall: TRANSACTIONAL forbids marketing modules (EC05 campaign use, EC17 promo) and promotional copy. |
| transactional messages becoming promotional | Firewall + component permissions per consent class. |
| typography drift | Typography rules per role (TYPOGRAPHY) with case rules. |
| inaccessible CTAs | CTA is live HTML, ≥ 44 px tall, descriptive label, ≥ 4.5:1 contrast. |
| broken dark-mode / mobile rendering | Dark-mode approximation and fallback backgrounds are QA gates. |
| asset duplication | Asset manifest + REUSE / DERIVE / REGENERATE / CREATE_NEW decision rules. |
| unclear trigger ownership | Trigger contracts name the source system and its status (exists / state exists / proposed). |
| no correspondence lineage across the lifecycle | Lineage manifest: every template names its lineage group and the assets it inherits. |
