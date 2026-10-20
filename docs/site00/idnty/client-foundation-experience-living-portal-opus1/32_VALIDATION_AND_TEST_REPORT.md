# 32 — Validation and Test Report

Generated from `boards/validation-report.json`, written by `boards/validate.mjs` against base `d68038a87`. Re-run it with:

```bash
node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/validate.mjs
```

## Result: **139 / 139 checks passed** — no failed checks.

| Sprint §47 check | Pass | Fail |
|---|---|---|
| Authority file validation | 35 | 0 |
| Board manifest validation | 17 | 0 |
| Component registry validation | 14 | 0 |
| Composer handoff completeness | 20 | 0 |
| State machine consistency | 5 | 0 |
| Quote / payment flow consistency | 12 | 0 |
| Documentation link check | 4 | 0 |
| Access security review (automated part) | 4 | 0 |
| Home screen install platform check | 9 | 0 |
| Brand asset audit | 6 | 0 |
| Production isolation | 2 | 0 |
| Responsive spec validation (layout audit) | 3 | 0 |
| Access card QR security check | 3 | 0 |
| Truthfulness (no fabricated progress) | 5 | 0 |

## Repository build (board renderer uses the application toolchain)

| Check | Result |
|---|---|
| `npx tsc --noEmit` (repo `tsconfig.json`, includes `src` + `shared`; docs not included) | **exit 0** |
| `npx vite build --outDir <scratch>` (production config, `index.html` entry) | **built in 24 s · `verify-production-dist: OK (473 JS assets checked)`** |
| Bundle scan for `client-foundation-experience-living-portal`, `NORTHLINE TRANSPORT`, `cf-access`, `AC9T2W7HKX` | **0 matches**: boards are not in production bundles |
| `git grep` for the authority path in `src`, `shared`, `api`, `server`, `index.html`, `vite.config.ts`, `package.json` | **0 matches** |
| Files changed vs base | only `docs/site00/idnty/client-foundation-experience-living-portal-opus1/**` |

The full `npm run build` script also writes a release manifest and `.htaccess` into `dist/`. It was not run, so no tracked file could be touched. The two steps it wraps (`tsc`, `vite build`) were run as above. The vitest suite was not re-run because no application, shared or server source changed. The base branch has known pre-existing failures that are unrelated to this sprint.

## Iterations (honest history)

The first validation run passed 132/139. Each failure and its fix:

| Failure | Cause | Fix |
|---|---|---|
| Layout: `p=recs&st=declined-required` @320 overflow | recommendation card header could not wrap the REQUIRED chip | header `flex-wrap`, 104px label column on phones |
| Layout: `p=reentry&st=sent` @320 overflow | six 44px code boxes + gaps wider than 276px | `repeat(6, minmax(0, 44px))` |
| Layout: roadmap workstreams @1280/1366 collision | the unbreakable domain name overflowed the narrow side-column card | `overflow-wrap: anywhere` on secondary text |
| Earlier render: overflow on 4 boards (domain value in spec blocks at 390) | same unbreakable domain | `overflow-wrap: anywhere` on spec values; grid children `min-width: 0` |
| Quote/payment: pay page contained “YOUR FOUNDATION IS UNDERWAY” | an explanatory step reused the post-payment headline, which a reviewer could misread as a claim | step renamed “YOUR SETUP STARTS” |
| Truthfulness: “LIVE” on roadmap/progress | workstream copy “ONCE EMAIL IS LIVE” | “ONCE EMAIL WORKS” |
| Fonts: AH05 icon frames | frames without Saira text never loaded the face (audit false positive) | specimens preload both faces before ready |
| Access security: token-shaped URL in 10/29 | regex matched the icon path `/foundation/foundation-icon-maskable-512`, then the source path `pages/foundation/DigitalFoundationCompleteSurface.tsx` | regex tightened to the real token shape (exactly 32 base64url chars, not followed by a file extension) |
| Brand: font-family check | regex backtracking false positive | check parses declared values |
| Accessibility review (manual) | `--df-muted` on `--df-bg` measures 4.23:1 (< AA) | PENDING chip moved off `--df-faint`; darkening proposed as OD-08, not silently applied |

## All checks

| Group | Check | Result | Detail |
|---|---|---|---|
| authority-files | README.md | PASS | 6355 chars |
| authority-files | 01_SOURCE_AND_PRODUCT_AUDIT.md | PASS | 9853 chars |
| authority-files | 02_CLIENT_EXPERIENCE_NARRATIVE.md | PASS | 4271 chars |
| authority-files | 03_CLIENT_INFORMATION_ARCHITECTURE.md | PASS | 3594 chars |
| authority-files | 04_CANONICAL_LIFECYCLE_UI_MATRIX.md | PASS | 5997 chars |
| authority-files | 05_POST_INTAKE_REVIEW_AUTHORITY.md | PASS | 4107 chars |
| authority-files | 06_FOUNDATION_ROADMAP_AUTHORITY.md | PASS | 2517 chars |
| authority-files | 07_NEEDS_YOU_AUTHORITY.md | PASS | 2864 chars |
| authority-files | 08_RECORDS_AUTHORITY.md | PASS | 1891 chars |
| authority-files | 09_HOME_SCREEN_INSTALL_AUTHORITY.md | PASS | 3939 chars |
| authority-files | 10_HOME_SCREEN_ICON_AND_LAUNCH.md | PASS | 2619 chars |
| authority-files | 11_FOUNDATION_ACCESS_CARD_AUTHORITY.md | PASS | 4340 chars |
| authority-files | 12_ACCESS_CARD_SECURITY_AND_QR.md | PASS | 3575 chars |
| authority-files | 13_SECURE_CLIENT_REENTRY.md | PASS | 4182 chars |
| authority-files | 14_PERSONALIZED_PROPOSAL_AUTHORITY.md | PASS | 2750 chars |
| authority-files | 15_RECOMMENDATION_SELECTION.md | PASS | 1741 chars |
| authority-files | 16_QUOTE_VERSION_AND_ACCEPTANCE.md | PASS | 2438 chars |
| authority-files | 17_PAYMENT_AND_CONFIRMATION.md | PASS | 3426 chars |
| authority-files | 18_PROJECT_OPERATIONS_EXPERIENCE.md | PASS | 2430 chars |
| authority-files | 19_COMPLETION_AND_HANDOFF.md | PASS | 1806 chars |
| authority-files | 20_ACTIVITY_AND_NOTIFICATIONS.md | PASS | 3370 chars |
| authority-files | 21_GLOBAL_CLIENT_OVERLAY_REGISTRY.md | PASS | 2442 chars |
| authority-files | 22_RESPONSIVE_GRID_SPECIFICATION.md | PASS | 2191 chars |
| authority-files | 23_TYPOGRAPHY_AND_DESIGN_TOKENS.md | PASS | 2552 chars |
| authority-files | 24_APPROVED_ASSET_MANIFEST.md | PASS | 1670 chars |
| authority-files | 25_MOTION_AND_TRANSITIONS.md | PASS | 1161 chars |
| authority-files | 26_COMPONENT_REGISTRY.md | PASS | 11277 chars |
| authority-files | 27_BACKEND_GAP_REGISTER.md | PASS | 4898 chars |
| authority-files | 28_SECURITY_AND_PRIVACY_REVIEW.md | PASS | 4409 chars |
| authority-files | 29_OPUS_TO_COMPOSER_HANDOFF.md | PASS | 10567 chars |
| authority-files | 30_VISUAL_BOARD_MANIFEST.md | PASS | 11746 chars |
| authority-files | 31_FOUNDER_APPROVAL_REGISTER.md | PASS | 4019 chars |
| authority-files | 32_VALIDATION_AND_TEST_REPORT.md | PASS | 504 chars |
| authority-files | 33_IMPLEMENTATION_READINESS.md | PASS | 2990 chars |
| authority-files | no unexpected documents | PASS |  |
| board-manifest | tier M ≥ 20 | PASS | 20 |
| board-manifest | tier TP ≥ 10 | PASS | 10 |
| board-manifest | tier TL ≥ 10 | PASS | 10 |
| board-manifest | tier D ≥ 20 | PASS | 20 |
| board-manifest | tier UW ≥ 5 | PASS | 5 |
| board-manifest | tier X ≥ 10 | PASS | 12 |
| board-manifest | tier AH ≥ 10 | PASS | 10 |
| board-manifest | total ≥ 85 | PASS | 87 |
| board-manifest | every board source rendered | PASS | 87 sources / 87 manifest |
| board-manifest | png sha256 matches manifest | PASS |  |
| board-manifest | all live frames ready | PASS |  |
| board-manifest | fonts loaded in every frame | PASS |  |
| board-manifest | no page errors / failed requests | PASS |  |
| board-manifest | no lowercase client copy | PASS |  |
| board-manifest | no per-frame layout failures | PASS |  |
| board-manifest | every board labels frames as specimens (not live screenshots) | PASS |  |
| board-manifest | families A–T all present | PASS |  |
| component-registry | 40 components | PASS | 40 |
| component-registry | each component defines 13 interaction fields + id + name | PASS | 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15 |
| component-registry | example control mapped: SAVE YOUR FOUNDATION | PASS |  |
| component-registry | example control mapped: DOWNLOAD ACCESS CARD | PASS |  |
| component-registry | example control mapped: REFRESH STATUS | PASS |  |
| component-registry | example control mapped: VIEW INTAKE SUMMARY | PASS |  |
| component-registry | example control mapped: VIEW PROPOSAL | PASS |  |
| component-registry | example control mapped: ACCEPT QUOTE | PASS |  |
| component-registry | example control mapped: REQUEST CLARIFICATION | PASS |  |
| component-registry | example control mapped: CONTINUE TO CHECKOUT | PASS |  |
| component-registry | example control mapped: OPEN ROADMAP | PASS |  |
| component-registry | example control mapped: VIEW RECORDS | PASS |  |
| component-registry | example control mapped: RETURN TO FOUNDATION | PASS |  |
| component-registry | 13 overlays registered | PASS | 13 |
| handoff | handoff section: Source route map | PASS |  |
| handoff | handoff section: Current component map | PASS |  |
| handoff | handoff section: New component map | PASS |  |
| handoff | handoff section: Reusable visual primitives | PASS |  |
| handoff | handoff section: Grid, type, tokens, fonts, assets, motion | PASS |  |
| handoff | handoff section: Lifecycle UI matrix, post-intake mapping | PASS |  |
| handoff | handoff section: Proposal / quote versioning | PASS |  |
| handoff | handoff section: Home-screen install contract | PASS |  |
| handoff | handoff section: Safe reentry architecture | PASS |  |
| handoff | handoff section: Access card file contract, QR security | PASS |  |
| handoff | handoff section: Email event contract | PASS |  |
| handoff | handoff section: Payment event gates | PASS |  |
| handoff | handoff section: Backend gaps | PASS |  |
| handoff | handoff section: Accessibility | PASS |  |
| handoff | handoff section: Error states | PASS |  |
| handoff | handoff section: Test matrix | PASS |  |
| handoff | handoff section: Migration impact | PASS |  |
| handoff | handoff section: Implementation order | PASS |  |
| handoff | handoff section: Acceptance criteria | PASS |  |
| handoff | phases 0–14 present | PASS |  |
| state-machine | source union equals sprint canonical list (17) | PASS | INVITED,OPENED,INTAKE_IN_PROGRESS,INTAKE_COMPLETE,RECOMMENDATION_READY,QUOTE_READY,AWAITING_ACCEPTANCE,AWAITING_PAYMENT,PAID,PROJECT_ACTIVE,IN_PROGRESS,WAITING_ON_CLIENT,WAITING_ON |
| state-machine | every canonical state mapped in 04 | PASS |  |
| state-machine | specimen phases reference only canonical states | PASS | INTAKE_COMPLETE,INTAKE_COMPLETE,QUOTE_READY,AWAITING_ACCEPTANCE,AWAITING_PAYMENT,IN_PROGRESS,WAITING_ON_CLIENT,WAITING_ON_PROVIDER,WAITING_ON_CLIENT,FINAL_VERIFICATION,COMPLETE |
| state-machine | roadmap = locked 7 client stages | PASS | INTAKE RECEIVED · FOUNDATION REVIEW · PERSONALIZED PROPOSAL · APPROVAL & PAYMENT · FOUNDATION SETUP · FINAL VERIFICATION · COMPLETE |
| state-machine | no client state machine / transition table in specimens | PASS |  |
| quote-payment | example add-on prices equal sprint example pricing | PASS | {"ADDITIONAL MAILBOX":75,"NEW DOMAIN":100,"DOMAIN TRANSFER":100,"DOMAIN RECOVERY":150,"EMAIL MIGRATION":200,"MULTI-USER SETUP":150,"EMAIL ROUTING":100,"EMAIL SIGNATURE":150,"DEVICE |
| quote-payment | base Digital Foundation $500 | PASS |  |
| quote-payment | example pricing labelled as not a charge | PASS |  |
| quote-payment | no card input anywhere in specimens | PASS |  |
| quote-payment | disclosures from source (DF_DISCLOSURES), not retyped | PASS |  |
| doc-links | all relative markdown links resolve | PASS |  |
| doc-links | all `NN` document references resolve | PASS |  |
| doc-links | every G-xx reference is defined in 27 | PASS |  |
| doc-links | every OD-xx reference is defined in 31 | PASS |  |
| access-security | no bearer-token-shaped /foundation/<token> URL in boards or docs | PASS |  |
| access-security | no secret-shaped strings (sk_live, sk_test, service_role key, JWT) | PASS |  |
| home-screen | manifest start_url has no token and targets /foundation/return | PASS | /foundation/return?src=home |
| home-screen | manifest short_name MY FOUNDATION | PASS |  |
| home-screen | manifest theme/background from --df-bg | PASS |  |
| brand-assets | cf.css colours ⊂ DF tokens + object glass + neutral device chrome | PASS |  |
| brand-assets | only the two approved font families | PASS |  |
| brand-assets | no external image or stock photo references | PASS |  |
| brand-assets | no AIO / referral card art reused | PASS |  |
| brand-assets | no "Anthony" demo data | PASS |  |
| production-isolation | application never imports the authority folder | PASS |  |
| production-isolation | only the authority folder changed vs base d68038a87 | PASS |  |
| responsive-spec | layout audit 22 pages × 16 viewports (352 renders) | PASS |  |
| responsive-spec | all five tiers audited | PASS | M,TP,TL,D,UW |
| responsive-spec | each tier has a distinct composition | PASS | {"M":{"bnav":true,"tabs":false,"side":0,"aside":0},"TP":{"bnav":false,"tabs":true,"side":0,"aside":0},"TL":{"bnav":false,"tabs":false,"side":112,"aside":0},"D":{"bnav":false,"tabs" |
| qr-security | rendered QR decodes to /foundation/return?card=<id> | PASS | https://site00.com/foundation/return?card=AC9T2W7HKX |
| qr-security | decoded QR contains no bearer token | PASS | https://site00.com/foundation/return?card=AC9T2W7HKX |
| qr-security | card text: no password, email address or private link | PASS | SITE 00 DIGITAL FOUNDATION MY FOUNDATION NORTHLINE TRANSPORT LLC REF DF-7Q4M-K2 · CARD 2 SCAN · CONFIRM BY EMAIL SCAN TO RETURN |
| brand-assets | specimen requests stay on the local origin | PASS |  |
| quote-payment | p=confirm: “RETURNING HERE DOES NOT MARK IT PAID” and never “YOUR FOUNDATION IS UNDERWAY”; no inputs | PASS |  |
| quote-payment | p=confirm&st=delayed: “STILL” and never “YOUR FOUNDATION IS UNDERWAY”; no inputs | PASS |  |
| quote-payment | p=confirm&st=confirmed: “VERIFIED BY STRIPE”; no inputs | PASS |  |
| quote-payment | p=pay: “YOUR FOUNDATION IS READY TO BEGIN” and never “UNDERWAY”; no inputs | PASS |  |
| quote-payment | p=accept&st=changed: “CAN NO LONGER BE ACCEPTED”; no inputs | PASS |  |
| quote-payment | p=proposal&st=superseded: “PROPOSAL V1 CAN NO LONGER BE ACCEPTED OR PAID”; no inputs | PASS |  |
| quote-payment | ACCEPT disabled until three disclosures confirmed | PASS |  |
| truthfulness | p=review: no percentage / countdown / “just updated” | PASS |  |
| truthfulness | p=overview&st=underway: no percentage / countdown / “just updated” | PASS |  |
| truthfulness | p=roadmap&st=underway: no percentage / countdown / “just updated” | PASS |  |
| truthfulness | p=progress: no percentage / countdown / “just updated” | PASS |  |
| truthfulness | p=verify: no percentage / countdown / “just updated” | PASS |  |
| home-screen | ios: no install button | PASS |  |
| home-screen | manual: no install button | PASS |  |
| home-screen | desktop: no install button | PASS |  |
| home-screen | android: one browser-prompt button | PASS | ADD TO HOME SCREEN |
| home-screen | installed: no install button | PASS |  |
| home-screen | iOS guidance names Share → Add to Home Screen and says SITE 00 cannot add it | PASS |  |
| access-security | all 12 reentry states render | PASS | 12/12 |
| access-security | public reentry states reveal no client data (non-enumerating) | PASS |  |

## Manual reviews

- **Access security review:** `28` (15 risks, 6 access levels). The verdict is shippable only after G-09 and G-12.
- **Visual review:** every board image was opened and inspected during the sprint. Fixes from that review: the card face layout (QR squashed), the ultrawide reading-column cap, the roadmap hero object on TL, and section titles.
- **Not verifiable here:** behaviour on real iOS / Android devices (install prompts, standalone cookie jars). The guidance follows platform documentation and is flagged OD-03 for on-device verification in phase 14.
