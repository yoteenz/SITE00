# 30 — Visual Board Manifest

> **Amended by LOCK1.** M09, D11 and AH06–AH10 are retired; AH01, AH05, M08, TP08, TL08, X08 and X10 are revised; AH11–AH15, M21 and D21 are new. The active count stays at 87, and every active board was re-rendered after the change.

**87 boards**, all rendered by `boards/render-boards.mjs` (Vite SSR data + Playwright Chromium, DSF 2). Each board is a set of static authority specimens at true viewport widths. **None is a screenshot of the live application.** The machine-readable index with per-board sha256, live-frame, font, lowercase and layout audits is `boards/board-manifest.json`.

| Tier | Required | Delivered |
|---|---|---|
| MOBILE 320–767 | 20 | **20** |
| TABLET PORTRAIT 768–1023 | 10 | **10** |
| TABLET LANDSCAPE 1024–1279 | 10 | **10** |
| DESKTOP 1280–1919 | 20 | **20** |
| ULTRA-WIDE 1920+ | 5 | **5** |
| CROSS-TIER | 10 | **12** |
| HOME SCREEN + LAUNCH + RETURN (was ACCESS CARD / HOME SCREEN) | 10 | **10** |
| **TOTAL** | **85** | **87** |

Every board shows a distinct implementation decision or state. Families (A–T) per board are listed below. Board source: `boards/src/board-<ID>-<slug>.html` (shell) + `boards/src/boards.js` (content).

## MOBILE 320–767

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [M01](boards/png/board-M01-your-foundation-is-taking-shape.png) | Your Foundation Is Taking Shape | A | 4/4 | 3400×2871 | 0 |
| [M02](boards/png/board-M02-overview-before-payment.png) | Overview Before Payment | B | 4/4 | 3400×2787 | 0 |
| [M03](boards/png/board-M03-overview-after-payment.png) | Overview After Payment | B | 4/4 | 3400×2821 | 0 |
| [M04](boards/png/board-M04-roadmap-in-client-language.png) | Roadmap In Client Language | C | 4/4 | 3317×3082 | 0 |
| [M05](boards/png/board-M05-needs-you.png) | Needs You | D | 4/4 | 3341×2966 | 0 |
| [M06](boards/png/board-M06-one-action-start-to-finish.png) | One Action, Start To Finish | D | 4/4 | 3400×2801 | 0 |
| [M07](boards/png/board-M07-records-only-when-they-exist.png) | Records Only When They Exist | E | 4/4 | 3376×2725 | 0 |
| [M08](boards/png/board-M08-save-your-foundation.png) | Save Your Foundation | F | 4/4 | 3400×2845 | 0 |
| [M10](boards/png/board-M10-coming-back-the-happy-path.png) | Coming Back: The Happy Path | H | 4/4 | 3400×2528 | 0 |
| [M11](boards/png/board-M11-reentry-expiry-and-bad-links.png) | Reentry: Expiry And Bad Links | H | 4/4 | 3400×2443 | 0 |
| [M12](boards/png/board-M12-reentry-revoked-wrong-identity-unavailable-retry.png) | Reentry: Revoked, Wrong Identity, Unavailable, Retry | H | 4/4 | 3400×2461 | 0 |
| [M13](boards/png/board-M13-personalized-proposal.png) | Personalized Proposal | I | 4/4 | 3303×2466 | 0 |
| [M14](boards/png/board-M14-choose-what-fits.png) | Choose What Fits | J | 4/4 | 3400×2493 | 0 |
| [M15](boards/png/board-M15-accept-the-exact-version.png) | Accept The Exact Version | K | 5/5 | 3400×3907 | 0 |
| [M16](boards/png/board-M16-your-foundation-is-ready-to-begin.png) | Your Foundation Is Ready To Begin | L | 5/5 | 3400×3907 | 0 |
| [M17](boards/png/board-M17-confirmed-by-stripe-not-by-the-redirect.png) | Confirmed By Stripe, Not By The Redirect | M | 4/4 | 3400×2493 | 0 |
| [M18](boards/png/board-M18-setup-and-final-verification.png) | Setup And Final Verification | NO | 4/4 | 3400×2493 | 0 |
| [M19](boards/png/board-M19-established-and-what-happened.png) | Established, And What Happened | PQ | 4/4 | 3400×2578 | 0 |
| [M20](boards/png/board-M20-updates-errors-and-global-overlays.png) | Updates, Errors And Global Overlays | RST | 5/5 | 3400×3907 | 0 |
| [M21](boards/png/board-M21-launch-experience-on-phones.png) | Launch Experience On Phones | F | 4/4 | 3400×2744 | 0 |

## TABLET PORTRAIT 768–1023

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [TP01](boards/png/board-TP01-four-areas-as-tabs.png) | Four Areas As Tabs | — | 3/3 | 3256×2152 | 0 |
| [TP02](boards/png/board-TP02-post-intake-review.png) | Post-Intake Review | A | 3/3 | 3276×2152 | 0 |
| [TP03](boards/png/board-TP03-proposal-options-acceptance.png) | Proposal, Options, Acceptance | IJK | 3/3 | 3279×2152 | 0 |
| [TP04](boards/png/board-TP04-payment-and-confirmation.png) | Payment And Confirmation | LM | 4/4 | 3400×3420 | 0 |
| [TP05](boards/png/board-TP05-setup-and-verification.png) | Setup And Verification | NO | 3/3 | 3277×2152 | 0 |
| [TP06](boards/png/board-TP06-needs-you-and-action-detail.png) | Needs You And Action Detail | D | 3/3 | 3277×2152 | 0 |
| [TP07](boards/png/board-TP07-records.png) | Records | E | 3/3 | 3268×2152 | 0 |
| [TP08](boards/png/board-TP08-home-screen-launch-and-email-return.png) | Home Screen, Launch And Email Return | FH | 3/3 | 3278×2152 | 0 |
| [TP09](boards/png/board-TP09-secure-reentry.png) | Secure Reentry | H | 4/4 | 3400×3420 | 0 |
| [TP10](boards/png/board-TP10-completion-errors-overlays.png) | Completion, Errors, Overlays | PST | 4/4 | 3400×3420 | 0 |

## TABLET LANDSCAPE 1024–1279

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [TL01](boards/png/board-TL01-compact-rail.png) | Compact Rail | — | 2/2 | 3284×2066 | 0 |
| [TL02](boards/png/board-TL02-review-and-needs-you-overview.png) | Review And Needs-You Overview | AB | 2/2 | 3303×2066 | 0 |
| [TL03](boards/png/board-TL03-proposal-and-options.png) | Proposal And Options | IJ | 2/2 | 3306×2066 | 0 |
| [TL04](boards/png/board-TL04-acceptance-and-payment.png) | Acceptance And Payment | KL | 2/2 | 3305×2066 | 0 |
| [TL05](boards/png/board-TL05-confirmation-and-setup.png) | Confirmation And Setup | MN | 2/2 | 3304×2066 | 0 |
| [TL06](boards/png/board-TL06-needs-you.png) | Needs You | D | 2/2 | 3304×2066 | 0 |
| [TL07](boards/png/board-TL07-records.png) | Records | E | 2/2 | 3295×2066 | 0 |
| [TL08](boards/png/board-TL08-home-screen-and-launch.png) | Home Screen And Launch | F | 2/2 | 3305×2066 | 0 |
| [TL09](boards/png/board-TL09-secure-reentry.png) | Secure Reentry | H | 2/2 | 3305×2066 | 0 |
| [TL10](boards/png/board-TL10-completion-and-dialogs.png) | Completion And Dialogs | PT | 2/2 | 3284×2066 | 0 |

## DESKTOP 1280–1919

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [D01](boards/png/board-D01-desktop-shell-anatomy.png) | Desktop Shell Anatomy | — | 2/2 | 3316×2526 | 0 |
| [D02](boards/png/board-D02-post-intake-review.png) | Post-Intake Review | A | 2/2 | 3316×2002 | 0 |
| [D03](boards/png/board-D03-overview-review-and-proposal.png) | Overview: Review And Proposal | B | 2/2 | 3316×2002 | 0 |
| [D04](boards/png/board-D04-overview-payment-and-underway.png) | Overview: Payment And Underway | B | 2/2 | 3316×2002 | 0 |
| [D05](boards/png/board-D05-overview-waiting-provider-verification-complete.png) | Overview: Waiting, Provider, Verification, Complete | B | 4/4 | 3316×3064 | 0 |
| [D06](boards/png/board-D06-roadmap.png) | Roadmap | C | 3/3 | 3316×3064 | 0 |
| [D07](boards/png/board-D07-needs-you.png) | Needs You | D | 3/3 | 3316×3064 | 0 |
| [D08](boards/png/board-D08-action-states.png) | Action States | D | 2/2 | 3316×2002 | 0 |
| [D09](boards/png/board-D09-records.png) | Records | E | 4/4 | 3316×3064 | 0 |
| [D10](boards/png/board-D10-keep-it-one-click-away.png) | Keep It One Click Away | F | 2/2 | 3316×2002 | 0 |
| [D12](boards/png/board-D12-secure-reentry.png) | Secure Reentry | H | 4/4 | 3316×3064 | 0 |
| [D13](boards/png/board-D13-personalized-proposal.png) | Personalized Proposal | I | 3/3 | 3316×3064 | 0 |
| [D14](boards/png/board-D14-recommendation-selection.png) | Recommendation Selection | J | 3/3 | 3316×3064 | 0 |
| [D15](boards/png/board-D15-quote-acceptance.png) | Quote Acceptance | K | 4/4 | 3316×3064 | 0 |
| [D16](boards/png/board-D16-awaiting-payment.png) | Awaiting Payment | L | 4/4 | 3316×3064 | 0 |
| [D17](boards/png/board-D17-payment-confirmation.png) | Payment Confirmation | M | 4/4 | 3316×3064 | 0 |
| [D18](boards/png/board-D18-project-in-progress.png) | Project In Progress | N | 3/3 | 3316×3064 | 0 |
| [D19](boards/png/board-D19-verification-and-completion.png) | Verification And Completion | OP | 4/4 | 3316×3064 | 0 |
| [D20](boards/png/board-D20-activity-updates-errors-overlays.png) | Activity, Updates, Errors, Overlays | QRST | 4/4 | 3316×3064 | 0 |
| [D21](boards/png/board-D21-launch-experience-on-desktop.png) | Launch Experience On Desktop | — | 4/4 | 3316×3056 | 0 |

## ULTRA-WIDE 1920+

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [UW01](boards/png/board-UW01-ultra-wide-shell.png) | Ultra-Wide Shell | — | 2/2 | 3284×1902 | 0 |
| [UW02](boards/png/board-UW02-review-and-proposal-at-ultra-wide.png) | Review And Proposal At Ultra-Wide | AI | 2/2 | 3288×1902 | 0 |
| [UW03](boards/png/board-UW03-payment-and-confirmation-at-ultra-wide.png) | Payment And Confirmation At Ultra-Wide | LM | 2/2 | 3288×1902 | 0 |
| [UW04](boards/png/board-UW04-setup-and-completion-at-ultra-wide.png) | Setup And Completion At Ultra-Wide | NP | 2/2 | 3288×1902 | 0 |
| [UW05](boards/png/board-UW05-needs-you-and-records-at-1920.png) | Needs You And Records At 1920 | DE | 2/2 | 3316×1908 | 0 |

## CROSS-TIER

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [X01](boards/png/board-X01-tier-ladder-one-overview-five-compositions.png) | Tier Ladder: One Overview, Five Compositions | — | 6/6 | 3200×3160 | 0 |
| [X02](boards/png/board-X02-navigation-model-per-tier.png) | Navigation Model Per Tier | — | 4/4 | 3376×2622 | 0 |
| [X03](boards/png/board-X03-hero-type-scale.png) | Hero Type Scale | — | 4/4 | 3386×2358 | 0 |
| [X04](boards/png/board-X04-progress-representation-per-tier.png) | Progress Representation Per Tier | — | 3/3 | 3200×2276 | 0 |
| [X05](boards/png/board-X05-canonical-state-client-experience.png) | Canonical State → Client Experience | — | 0/0 | 3376×1958 | 0 |
| [X06](boards/png/board-X06-founder-client-parity.png) | Founder / Client Parity | — | 0/0 | 3376×1446 | 0 |
| [X07](boards/png/board-X07-payment-truth-gates.png) | Payment Truth Gates | — | 2/2 | 3200×2686 | 0 |
| [X08](boards/png/board-X08-access-and-privacy-boundaries.png) | Access And Privacy Boundaries | — | 3/3 | 3376×2686 | 0 |
| [X09](boards/png/board-X09-motion-refresh-and-status-truth.png) | Motion, Refresh And Status Truth | — | 3/3 | 3200×2686 | 0 |
| [X10](boards/png/board-X10-component-interaction-registry-summary.png) | Component Interaction Registry (Summary) | — | 0/0 | 3400×1842 | 0 |
| [X11](boards/png/board-X11-empty-error-and-blocked-catalogue.png) | Empty, Error And Blocked Catalogue | — | 8/8 | 3200×3700 | 0 |
| [X12](boards/png/board-X12-email-designs-design-only-nothing-sent.png) | Email Designs (Design Only — Nothing Sent) | — | 4/4 | 3200×2516 | 0 |

## HOME SCREEN + LAUNCH + RETURN (was ACCESS CARD / HOME SCREEN)

| Board | Title | Families | Live frames | Image (px) | Layout failures |
|---|---|---|---|---|---|
| [AH01](boards/png/board-AH01-return-methods.png) | Return Methods | — | 3/3 | 3377×2765 | 0 |
| [AH02](boards/png/board-AH02-iphone-and-ipad-guidance.png) | Iphone And Ipad Guidance | — | 3/3 | 3397×2416 | 0 |
| [AH03](boards/png/board-AH03-android-guidance.png) | Android Guidance | — | 3/3 | 3399×2416 | 0 |
| [AH04](boards/png/board-AH04-desktop-bookmark.png) | Desktop Bookmark | — | 2/2 | 3399×2002 | 0 |
| [AH05](boards/png/board-AH05-approved-home-screen-icon.png) | Approved Home-Screen Icon | — | 5/5 | 3398×2750 | 0 |
| [AH11](boards/png/board-AH11-approved-launch-experience.png) | Approved Launch Experience | — | 3/3 | 3356×2526 | 0 |
| [AH12](boards/png/board-AH12-launch-responsive-compositions.png) | Launch Responsive Compositions | — | 10/10 | 3375×4262 | 0 |
| [AH13](boards/png/board-AH13-launch-behaviour.png) | Launch Behaviour | — | 5/5 | 3400×4746 | 0 |
| [AH14](boards/png/board-AH14-secure-return-flow.png) | Secure Return Flow | — | 7/7 | 3377×4082 | 0 |
| [AH15](boards/png/board-AH15-post-submission-email-how-to-return.png) | Post-Submission Email: How To Return | — | 2/2 | 3377×2784 | 0 |

## RETIRED / SUPERSEDED (archived — NOT FOR IMPLEMENTATION)

LOCK1 retired the client access card (L-05) and superseded the placeholder icon (L-01). These boards are kept as design history only and are **not** part of the active manifest or the client build.

| Board | Status | Archived image |
|---|---|---|
| AH06 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-AH06-access-card-anatomy.png](boards/archive/retired-access-card/board-AH06-access-card-anatomy.png) |
| AH07 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-AH07-card-exports.png](boards/archive/retired-access-card/board-AH07-card-exports.png) |
| AH08 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-AH08-wallet-style-not-a-wallet-pass.png](boards/archive/retired-access-card/board-AH08-wallet-style-not-a-wallet-pass.png) |
| AH09 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-AH09-qr-security-and-validation.png](boards/archive/retired-access-card/board-AH09-qr-security-and-validation.png) |
| AH10 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-AH10-download-share-replace-errors.png](boards/archive/retired-access-card/board-AH10-download-share-replace-errors.png) |
| D11 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-D11-access-card.png](boards/archive/retired-access-card/board-D11-access-card.png) |
| M09 | RETIRED · NOT FOR IMPLEMENTATION · SUPERSEDED BY HOME SCREEN ACCESS (LOCK1 L-05) | [board-M09-access-card.png](boards/archive/retired-access-card/board-M09-access-card.png) |
| AH05-placeholder | SUPERSEDED · placeholder icon/splash replaced by founder-approved assets (LOCK1 L-01/L-02) | [board-AH05-icon-splash-manifest.png](boards/archive/superseded-placeholder-icon/board-AH05-icon-splash-manifest.png) |

