# Email components (EC01–EC17)

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

## EC01 — HERO CORRESPONDENCE

Opening composition: environment or campaign art with the correspondence artifact, and the introductory live content set on or beside it.

- **Families:** E01, E02, E03, E04, E07 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** eyebrow; headline; intro sentence; personal greeting
- **Image may own:** L1 environment crop; L2 artifact shell (top edge / header area)
- **Desktop:** Art at 640 px wide; headline set in HTML below or inside a solid paper cell, never over busy imagery.
- **Mobile:** Art scales to 100% width with a mobile crop that keeps the artifact; headline drops below art.
- **Accessibility:** Art is decorative (alt="") unless it carries meaning; meaning is repeated in HTML. Headline is the first heading (h1).
- **Live data:** firstName
- **Variants:** ARTIFACT_LEFT, ARTIFACT_CENTRED, CROP_TIGHT, ARTIFACT_ONLY (no L1)
- **Never:** headline or figures baked into the art; E05 / E06 messages; full app screenshot; full-bleed arch every time

## EC02 — DECKLED NOTE

A short artifact-like message: two to four sentences set on a paper cell with a deckled or torn edge image.

- **Families:** E01, E02, E03, E04, E05, E06, E07 · **consent classes:** TRANSACTIONAL, LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** note text; signature line
- **Image may own:** deckled top / bottom edge strips (L2); paper tone matched by the HTML cell colour
- **Desktop:** Note cell 520–560 px inside the 640 container.
- **Mobile:** Full width minus 20 px gutters; edges scale with width.
- **Accessibility:** Edge strips alt="". Text contrast ≥ 4.5:1 on the paper colour.
- **Live data:** firstName
- **Variants:** TORN_TOP, DECKLED_BOTH, CLIPPED (brass clip insert)
- **Never:** text inside the edge images; more than ~60 words

## EC03 — FINANCIAL SNAPSHOT

One labelled figure with a short status: SAFE TO SPEND · $1,284 · THROUGH OCT 18.

- **Families:** E01, E02, E03, E04, E05 · **consent classes:** LIFECYCLE_SERVICE
- **HTML owns:** label; figure; status line; as-of date
- **Image may own:** nothing
- **Desktop:** Figure 40–48 px serif.
- **Mobile:** Figure 32–40 px; never wraps mid-number.
- **Accessibility:** Figure and label read as one sentence to screen readers (label first). Status is words, not colour alone.
- **Live data:** safeToSpend, availableThrough, asOf, currency
- **Variants:** SINGLE, WITH_DELTA, INCOMPLETE (honest empty state)
- **Never:** any figure in an image; invented or stale values; figures in TRANSACTIONAL or MARKETING mail

## EC04 — TWO-COLUMN BRIEF

Paired lists such as COMING / MOVED, ledger-ruled.

- **Families:** E03 · **consent classes:** LIFECYCLE_SERVICE
- **HTML owns:** column labels; item names; dates; amounts; MORE link
- **Image may own:** optional ledger-rule paper texture behind the table
- **Desktop:** Two 280 px columns.
- **Mobile:** Columns stack: COMING first, then MOVED.
- **Accessibility:** Each column is a list with a heading; amounts are text. Reading order matches visual order when stacked.
- **Live data:** upcomingItems[] (name, date, amount), movedItems[] (name, date, amount)
- **Variants:** THREE_ROWS, EMPTY_COLUMN (honest copy)
- **Never:** more than five rows per column; item rows as images

## EC05 — EDITORIAL PULL QUOTE

A single set-off line in large serif, used to carry the idea of an editorial or guide.

- **Families:** E02, E04, E07 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** quote text; attribution
- **Image may own:** optional rule or ornament
- **Desktop:** 28–32 px serif.
- **Mobile:** 24–28 px serif.
- **Accessibility:** Use blockquote semantics where supported; not a heading.
- **Live data:** none (static copy)
- **Variants:** RULED, HANGING_PUNCTUATION
- **Never:** E06 security mail; financial claims or promises; quotes attributed to real people without permission

## EC06 — CHECKLIST / STEPS

Numbered steps or a short checklist that mirrors the app exactly.

- **Families:** E01, E02, E05 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** step numbers; step titles; one-line descriptions; done / not done state
- **Image may own:** optional printed-numeral ornament
- **Desktop:** Up to five rows, numeral column 40 px.
- **Mobile:** Same, single column.
- **Accessibility:** Ordered list semantics; state in words (DONE / TO DO).
- **Live data:** setupSteps[] (title, done)
- **Variants:** NUMBERED, CHECKED, REMAINING_ONLY
- **Never:** steps that do not exist in the app; more than five steps

## EC07 — SINGLE CTA

The one primary action.

- **Families:** E01, E02, E03, E04, E05, E06, E07 · **consent classes:** TRANSACTIONAL, LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** bulletproof button (table cell + link); uppercase descriptive label; plain-link fallback below for security mail
- **Image may own:** nothing
- **Desktop:** Min 44 px tall, 240–320 px wide, left- or centre-aligned per authority.
- **Mobile:** Full width minus gutters, min 48 px tall.
- **Accessibility:** Real <a> with descriptive text (VERIFY MY EMAIL, not CLICK HERE). Contrast ≥ 4.5:1; focus outline not removed.
- **Live data:** ctaUrl
- **Variants:** OLIVE_SOLID, INK_SOLID, OUTLINE (secondary only)
- **Never:** image buttons; more than one primary CTA; tracking redirects on security links

## EC08 — DUAL CTA

A primary action and a quieter secondary one.

- **Families:** E01, E02, E03, E07 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** primary button; secondary text link or outline button
- **Image may own:** nothing
- **Desktop:** Side by side.
- **Mobile:** Stacked, primary first.
- **Accessibility:** Both descriptive; secondary visually distinct but ≥ 4.5:1.
- **Live data:** ctaUrl, secondaryCtaUrl
- **Variants:** BUTTON_LINK, BUTTON_OUTLINE
- **Never:** E05 nudges (one action only); E06 security mail; two equally weighted buttons

## EC09 — MILESTONE SEAL

A ceremonial seal or emboss that marks a real milestone, with the milestone named in HTML beside it.

- **Families:** E04 · **consent classes:** LIFECYCLE_SERVICE
- **HTML owns:** milestone name; amount reached; date
- **Image may own:** wax / blind-emboss seal (L2 decorative insert)
- **Desktop:** Seal 96–120 px beside the figure.
- **Mobile:** Seal 80 px above the figure.
- **Accessibility:** Seal alt="" ; the milestone is stated in text.
- **Live data:** goalName, goalAmount, reachedOn
- **Variants:** WAX_SEAL, BLIND_EMBOSS, BRASS_MEDALLION
- **Never:** trophies; confetti; badges; numbers inside the seal image

## EC10 — IMAGE + NOTE

A small contextual image (print, botanical, object) paired with a short note.

- **Families:** E01, E02, E04, E07 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** note text; caption
- **Image may own:** EMAIL_THUMBNAIL or EMAIL_DECORATIVE_INSERT
- **Desktop:** Image 200–240 px column + text column.
- **Mobile:** Image above text, max 280 px wide.
- **Accessibility:** Image alt describes it only if it carries meaning.
- **Live data:** none (static copy)
- **Variants:** IMAGE_LEFT, IMAGE_RIGHT, TAPED_PRINT
- **Never:** text in the image; E06 security mail

## EC11 — DOSSIER / RECORD ROW

Label / value rows set like an archival index card: ACCOUNT · CHECKING, DATE · OCT 8.

- **Families:** E03, E04, E05, E06 · **consent classes:** TRANSACTIONAL, LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** labels; values
- **Image may own:** optional index-card edge
- **Desktop:** Label column 160 px.
- **Mobile:** Label above value.
- **Accessibility:** Table with header cells or definition-list semantics.
- **Live data:** any contract personalization input
- **Variants:** INDEX_CARD, LEDGER_RULED
- **Never:** sensitive values in TRANSACTIONAL mail beyond what the action needs (no balances in security mail)

## EC12 — STATUS NOTICE

A short uppercase status line with one sentence of context: NEEDS A SECOND LOOK.

- **Families:** E03, E05, E06 · **consent classes:** TRANSACTIONAL, LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** status label; context sentence
- **Image may own:** nothing
- **Desktop:** Inline under the headline.
- **Mobile:** Same.
- **Accessibility:** Status in words; colour is secondary.
- **Live data:** status
- **Variants:** NEUTRAL, ATTENTION (burgundy text, never red alert)
- **Never:** alarm styling; shame language

## EC13 — SECURITY NOTICE

What happened, when, and what to do if it was not you.

- **Families:** E06 · **consent classes:** TRANSACTIONAL
- **HTML owns:** request time; expiry; device / location if known; not-you instruction; support contact
- **Image may own:** nothing
- **Desktop:** Plain block under the CTA.
- **Mobile:** Same.
- **Accessibility:** Plain language; no reliance on images; link text is the URL host for verification.
- **Live data:** requestedAt, expiresInMinutes, device, approxLocation
- **Variants:** VERIFY, RESET, NEW_LOGIN, CHANGE_CONFIRMATION
- **Never:** marketing content; urgency theatre; asking for passwords or codes by reply

## EC14 — PERSONALIZED INSIGHT

A sentence or two of insight derived only from the person’s real data.

- **Families:** E03, E05 · **consent classes:** LIFECYCLE_SERVICE
- **HTML owns:** insight sentence; supporting figure
- **Image may own:** nothing
- **Desktop:** Note cell.
- **Mobile:** Same.
- **Accessibility:** Plain sentence; figures as text.
- **Live data:** insight (generated only from source truth, with its inputs logged)
- **Variants:** OBSERVATION, WHAT_CHANGED
- **Never:** fabricated observations; advice framed as instruction; judgement words; AI-generated claims without source data

## EC15 — APP DEEP-LINK MODULE

Take the reader to the exact JURNL screen the email is about.

- **Families:** E01, E02, E03, E04, E05 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** link label; destination description
- **Image may own:** optional small thumbnail of the destination object (never a screenshot)
- **Desktop:** Text link row.
- **Mobile:** Full-width tap row ≥ 48 px.
- **Accessibility:** Descriptive link text naming the destination.
- **Live data:** deepLink
- **Variants:** ROW, CARD
- **Never:** app screenshots; links to routes that do not exist

## EC16 — EMAIL FOOTER

Sender identity, why you received this, privacy, legal and mailing address.

- **Families:** E01, E02, E03, E04, E05, E06, E07 · **consent classes:** TRANSACTIONAL, LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** sender identity; reason for receiving; privacy link; legal / mailing address; security footer (E06)
- **Image may own:** optional small JURNL mark
- **Desktop:** 12–13 px sentence case.
- **Mobile:** Same, links on their own lines.
- **Accessibility:** Real text ≥ 12 px; links distinguishable.
- **Live data:** recipientEmail, reason
- **Variants:** TRANSACTIONAL, LIFECYCLE, MARKETING
- **Never:** hiding required legal text in images; promo in E06 footers

## EC17 — MARKETING PREFERENCES / UNSUBSCRIBE

One-click unsubscribe and a link to preferences for the email’s own category.

- **Families:** E01, E02, E03, E04, E05, E07 · **consent classes:** LIFECYCLE_SERVICE, MARKETING
- **HTML owns:** unsubscribe link (category-scoped); manage preferences link; List-Unsubscribe header (not body)
- **Image may own:** nothing
- **Desktop:** In footer.
- **Mobile:** In footer, own line.
- **Accessibility:** Plain, findable text; never hidden by colour.
- **Live data:** unsubscribeUrl, preferencesUrl, category
- **Variants:** FOOTER_LINE
- **Never:** E06 transactional mail (account/security mail cannot be unsubscribed); categories the product does not support yet
