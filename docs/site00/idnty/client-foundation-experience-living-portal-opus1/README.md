# YOUR FOUNDATION — Client Living Portal & Access Authority (OPUS1)

**Sprint:** `P0.SITE00.IDNTY.CLIENT-FOUNDATION-EXPERIENCE.LIVING-PORTAL-AND-ACCESS-AUTHORITY.OPUS1`
**Base:** `cursor/idnty-founder-readiness-e2e-be3b` @ `d68038a87` (Merge PR #1667)
**Status:** AUTHORITY ONLY — founder visual review required. Production source, backend, database, email sending, Stripe and Railway are untouched.

This package is the visual and interaction authority for the client side of the Digital Foundation, from the moment intake is submitted to an established foundation. It covers:

- the review state;
- the personalized proposal;
- exact-version acceptance;
- Stripe hosted payment;
- fulfillment;
- verification;
- completion;
- the three ways back: home screen, then access card, then email.

The founder-approved direction (§00, fifteen points) is treated as locked. Nothing here re-opens it.

## What is in here

| Path | What |
|---|---|
| `01`–`33` | Authority documents (see index below) |
| `boards/png/` | 87 rendered boards (2× PNG) |
| `boards/src/` | Board source: specimen system (`cf.css`, `cf-kit.js`, `cf-pages.js`, `cf-access.js`, `specimen.js`), board kit, 87 board shells, `boards.js` |
| `boards/board-manifest.json` | Board index: source, image, size, sha256, frame/font/layout audit per board |
| `boards/render-boards.mjs` | Reproducible renderer (repo Vite server for SSR data + Playwright Chromium, DSF 2) |
| `boards/validate.mjs` | Validation suite behind `32_VALIDATION_AND_TEST_REPORT.md` |
| `boards/shoot.mjs` | Dev helper: render single specimens |

**Every board frame is a static authority specimen laid out at its true viewport width.** None of them is a screenshot of the running application. Icons, the red-glass threshold objects, the three acceptance disclosures and commercial config come from source through SSR. The client, *Northline Transport LLC*, and every date, price and reference are fictional. Example add-on prices are the sprint's example pricing and are never shown as live charges.

## Reproduce

```bash
ln -s /path/to/node_modules node_modules   # if the worktree has none; never commit it
node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/render-boards.mjs          # all 87
node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/render-boards.mjs M01 D05  # some
node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/validate.mjs
```

The application never imports anything from this folder. Vite's production build has no entry here, so the boards stay out of production bundles. `32` verifies this.

## Document index

| # | Document |
|---|---|
| 01 | [Source and product audit](01_SOURCE_AND_PRODUCT_AUDIT.md) |
| 02 | [Client experience narrative](02_CLIENT_EXPERIENCE_NARRATIVE.md) |
| 03 | [Client information architecture](03_CLIENT_INFORMATION_ARCHITECTURE.md) |
| 04 | [Canonical lifecycle UI matrix](04_CANONICAL_LIFECYCLE_UI_MATRIX.md) |
| 05 | [Post-intake review authority](05_POST_INTAKE_REVIEW_AUTHORITY.md) |
| 06 | [Foundation roadmap authority](06_FOUNDATION_ROADMAP_AUTHORITY.md) |
| 07 | [Needs You authority](07_NEEDS_YOU_AUTHORITY.md) |
| 08 | [Records authority](08_RECORDS_AUTHORITY.md) |
| 09 | [Home screen install authority](09_HOME_SCREEN_INSTALL_AUTHORITY.md) |
| 10 | [Home screen icon and launch](10_HOME_SCREEN_ICON_AND_LAUNCH.md) |
| 11 | [Foundation access card authority](11_FOUNDATION_ACCESS_CARD_AUTHORITY.md) |
| 12 | [Access card security and QR](12_ACCESS_CARD_SECURITY_AND_QR.md) |
| 13 | [Secure client reentry](13_SECURE_CLIENT_REENTRY.md) |
| 14 | [Personalized proposal authority](14_PERSONALIZED_PROPOSAL_AUTHORITY.md) |
| 15 | [Recommendation selection](15_RECOMMENDATION_SELECTION.md) |
| 16 | [Quote version and acceptance](16_QUOTE_VERSION_AND_ACCEPTANCE.md) |
| 17 | [Payment and confirmation](17_PAYMENT_AND_CONFIRMATION.md) |
| 18 | [Project operations experience](18_PROJECT_OPERATIONS_EXPERIENCE.md) |
| 19 | [Completion and handoff](19_COMPLETION_AND_HANDOFF.md) |
| 20 | [Activity and notifications](20_ACTIVITY_AND_NOTIFICATIONS.md) |
| 21 | [Global client overlay registry](21_GLOBAL_CLIENT_OVERLAY_REGISTRY.md) |
| 22 | [Responsive grid specification](22_RESPONSIVE_GRID_SPECIFICATION.md) |
| 23 | [Typography and design tokens](23_TYPOGRAPHY_AND_DESIGN_TOKENS.md) |
| 24 | [Approved asset manifest](24_APPROVED_ASSET_MANIFEST.md) |
| 25 | [Motion and transitions](25_MOTION_AND_TRANSITIONS.md) |
| 26 | [Component registry (with interaction authority)](26_COMPONENT_REGISTRY.md) |
| 27 | [Backend gap register](27_BACKEND_GAP_REGISTER.md) |
| 28 | [Security and privacy review](28_SECURITY_AND_PRIVACY_REVIEW.md) |
| 29 | [Opus → Composer handoff](29_OPUS_TO_COMPOSER_HANDOFF.md) |
| 30 | [Visual board manifest](30_VISUAL_BOARD_MANIFEST.md) |
| 31 | [Founder approval register](31_FOUNDER_APPROVAL_REGISTER.md) |
| 32 | [Validation and test report](32_VALIDATION_AND_TEST_REPORT.md) |
| 33 | [Implementation readiness](33_IMPLEMENTATION_READINESS.md) |

## Five findings that shape everything

1. **The four-area portal exists but is not wired.** `parents/ProjectPortal.tsx` holds `P07ProjectOverview`, `P08Roadmap`, `P09StageDetail`, `P10NeedsYou`, `RecordsLibrary`, `RecordDetail` and `CommunicationPreferences`. Nothing imports it. `FoundationClient.tsx` renders `InterimOverview` for OVERVIEW and an empty frame for every other portal view. The regression traces to merge `b0b988db6` (PR #1527).
2. **There is no review moment today.** `completeIntake` moves INTAKE_COMPLETE → RECOMMENDATION_READY → QUOTE_READY in one call and the client lands on a priced recommendation. Founder direction 3–6 (founder approves before the client sees a proposal) needs a server gate. See G-02.
3. **`/foundation/:token` is a non-expiring bearer capability.** It has no session, expiry, revocation or rate limit, and CORS is `*`. The access card therefore never carries it, and the home-screen start route never contains it. See `12`, `13` and `28`.
4. **No PWA plumbing.** There is no manifest, apple-touch-icon, theme colour or service worker, and `/site00/favicon.svg` is referenced but missing.
5. **Email contradicts the screen.** FNDATN-01 email 02 says "OUR TEAM IS NOW REVIEWING IT" while the client sees an instant quote. Fixing finding 2 makes the email true.
