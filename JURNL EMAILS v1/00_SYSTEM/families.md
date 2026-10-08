# Email families

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

## E01 — WELCOME / ARRIVAL

Entry, signup, account created, onboarding invitation and other major first-contact moments.

- **Examples:** welcome to JURNL; your Safe to Spend is ready; your account is open
- **Artifact grammar:** INVITATION / WELCOME_LETTER / ENTRY_CARD
- **Mood:** ceremonial, optimistic, aspirational
- **Visual language:** folded invitation, embossed stationery, olive seal, burgundy edge, Mediterranean still life, classical crop, substantial negative space
- **Forbidden:** promotional offers; feature lists; app screenshots; more than one call to action
- **Consent classes:** LIFECYCLE_SERVICE
- **Expressiveness:** 4 / 5 · **environment art:** EXPECTED · **max personalization:** P2
- **Priorities:** a single clear next step; warmth without hype
- **Lineage:** ARRIVAL
- **Components:** EC01 HERO CORRESPONDENCE, EC02 DECKLED NOTE, EC03 FINANCIAL SNAPSHOT, EC06 CHECKLIST / STEPS, EC07 SINGLE CTA, EC08 DUAL CTA, EC10 IMAGE + NOTE, EC15 APP DEEP-LINK MODULE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE

## E02 — GUIDANCE / EDUCATION

Teach JURNL concepts and guide behaviour.

- **Examples:** how Safe to Spend works; connect accounts; build a first plan; understand credit; organize upcoming obligations
- **Artifact grammar:** FIELD_GUIDE / ANNOTATED_NOTE / EDITORIAL_EXPLAINER
- **Mood:** clear, intelligent, human
- **Visual language:** numbered printed steps, clipped notes, architectural or botanical reference, annotated margin, paper layering
- **Forbidden:** jargon without explanation; more than five steps; stock-photo people
- **Consent classes:** LIFECYCLE_SERVICE, MARKETING
- **Expressiveness:** 3 / 5 · **environment art:** OPTIONAL · **max personalization:** P2
- **Priorities:** one concept per email; steps that match the app exactly
- **Lineage:** FIELD_GUIDE, ARRIVAL
- **Components:** EC01 HERO CORRESPONDENCE, EC02 DECKLED NOTE, EC03 FINANCIAL SNAPSHOT, EC05 EDITORIAL PULL QUOTE, EC06 CHECKLIST / STEPS, EC07 SINGLE CTA, EC08 DUAL CTA, EC10 IMAGE + NOTE, EC15 APP DEEP-LINK MODULE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE

## E03 — FINANCIAL BRIEF / DIGEST

Recurring financial correspondence.

- **Examples:** weekly brief; monthly brief; what's coming; what moved; plan status; financial snapshot
- **Artifact grammar:** BRIEFING_SHEET / LEDGER_INSERT / CLIPBOARD_BRIEF / PRINTED_REVIEW
- **Mood:** informative, calm, useful
- **Visual language:** data columns, clipped paper, ledger rules, editorial figures, restrained object photography
- **Forbidden:** charts rendered as images; figures in images; judgement words about spending; invented observations
- **Consent classes:** LIFECYCLE_SERVICE
- **Expressiveness:** 2 / 5 · **environment art:** OPTIONAL · **max personalization:** P3
- **Priorities:** accurate live figures; honest empty / incomplete states; scannable in ten seconds
- **Lineage:** BRIEFING
- **Components:** EC01 HERO CORRESPONDENCE, EC02 DECKLED NOTE, EC03 FINANCIAL SNAPSHOT, EC04 TWO-COLUMN BRIEF, EC07 SINGLE CTA, EC08 DUAL CTA, EC11 DOSSIER / RECORD ROW, EC12 STATUS NOTICE, EC14 PERSONALIZED INSIGHT, EC15 APP DEEP-LINK MODULE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE

## E04 — MILESTONE / CELEBRATION

Acknowledge real progress.

- **Examples:** goal funded; buffer established; debt milestone; plan completion; meaningful financial achievement
- **Artifact grammar:** CEREMONIAL_NOTE / MILESTONE_CARD / EMBOSSED_LETTER
- **Mood:** warm, elegant, rewarding
- **Visual language:** richer burgundy, embossing, seal, brass, special paper, stronger still life
- **Forbidden:** confetti; gamification clichés; trophy graphics; badges; streaks; leaderboards
- **Consent classes:** LIFECYCLE_SERVICE
- **Expressiveness:** 4 / 5 · **environment art:** OPTIONAL · **max personalization:** P2
- **Priorities:** only real, verified milestones; the achievement in the person’s own terms (goal name, amount)
- **Lineage:** CEREMONIAL
- **Components:** EC01 HERO CORRESPONDENCE, EC02 DECKLED NOTE, EC03 FINANCIAL SNAPSHOT, EC05 EDITORIAL PULL QUOTE, EC07 SINGLE CTA, EC09 MILESTONE SEAL, EC10 IMAGE + NOTE, EC11 DOSSIER / RECORD ROW, EC15 APP DEEP-LINK MODULE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE

## E05 — REMINDER / NUDGE

Timely short-form action.

- **Examples:** unfinished setup; bill approaching; unusual purchase; plan needs attention; credit utilization change; account connection issue
- **Artifact grammar:** PINNED_NOTE / SMALL_MEMO / DESK_SLIP
- **Mood:** concise, supportive, not alarmist
- **Visual language:** a single note or slip, pin or brass clip, short hand-set line, quiet desk surface crop
- **Forbidden:** more than one message; more than one primary action; fear or shame language; countdowns; red alert styling
- **Consent classes:** LIFECYCLE_SERVICE
- **Expressiveness:** 2 / 5 · **environment art:** NONE · **max personalization:** P2
- **Priorities:** one message; one primary action; NUDGE_COPY_CONSTRAINT
- **Lineage:** DESK_NOTE
- **Components:** EC02 DECKLED NOTE, EC03 FINANCIAL SNAPSHOT, EC06 CHECKLIST / STEPS, EC07 SINGLE CTA, EC11 DOSSIER / RECORD ROW, EC12 STATUS NOTICE, EC14 PERSONALIZED INSIGHT, EC15 APP DEEP-LINK MODULE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE

## E06 — SECURITY / ACCOUNT / TRANSACTIONAL

Critical account, security and system communication.

- **Examples:** verify email; reset password; new login; changed email; changed security setting; consent update; account alert
- **Artifact grammar:** ACCESS_CREDENTIAL / FORMAL_NOTICE / PRIVATE_CORRESPONDENCE
- **Mood:** clear, restrained, trustworthy
- **Visual language:** plain correspondence card, single emboss or seal, quiet paper texture
- **Forbidden:** marketing content; promotions; editorial storytelling; environment art; social links; cross-sell; tracking-wrapped security links; anything that could imitate phishing (urgent red, threats)
- **Consent classes:** TRANSACTIONAL
- **Expressiveness:** 1 / 5 · **environment art:** NONE · **max personalization:** P1
- **Priorities:** clarity; trust; legibility; security; what to do if this was not you
- **Lineage:** SECURE_CORRESPONDENCE
- **Components:** EC02 DECKLED NOTE, EC07 SINGLE CTA, EC11 DOSSIER / RECORD ROW, EC12 STATUS NOTICE, EC13 SECURITY NOTICE, EC16 EMAIL FOOTER

## E07 — MARKETING / EDITORIAL CAMPAIGN

Product storytelling, launches, editorial campaigns, seasonal financial narratives.

- **Examples:** feature launch; seasonal planning story; JURNL editorial; campaign content; lifestyle / financial storytelling
- **Artifact grammar:** MAGAZINE_SPREAD / BROADSIDE / CAMPAIGN_LETTER / CULTURAL_EDITORIAL
- **Mood:** the most expressive family
- **Visual language:** richer collage, art-history references, more dramatic photography, oversized editorial typography, unexpected cropping, cultural storytelling
- **Forbidden:** personal financial figures; account or security content; sending without marketing consent; scrapbook collage
- **Consent classes:** MARKETING
- **Expressiveness:** 5 / 5 · **environment art:** EXPECTED · **max personalization:** P1
- **Priorities:** explicit marketing consent; one-click unsubscribe
- **Lineage:** EDITORIAL
- **Components:** EC01 HERO CORRESPONDENCE, EC02 DECKLED NOTE, EC05 EDITORIAL PULL QUOTE, EC07 SINGLE CTA, EC08 DUAL CTA, EC10 IMAGE + NOTE, EC16 EMAIL FOOTER, EC17 MARKETING PREFERENCES / UNSUBSCRIBE
