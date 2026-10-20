# 32 — Validation and Test Report

Generated from `boards/validation-report.json`, written by `boards/validate.mjs` against base `d68038a87`. Re-run it with:

```bash
node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/validate.mjs
```

## Result: **200 / 200 checks passed** — no failed checks.

| Sprint §47 check | Pass | Fail |
|---|---|---|
| Authority file validation | 35 | 0 |
| Board manifest validation | 17 | 0 |
| LOCK1 retired access card gates | 5 | 0 |
| Component registry validation | 14 | 0 |
| Composer handoff completeness | 20 | 0 |
| State machine consistency | 5 | 0 |
| Quote / payment flow consistency | 12 | 0 |
| Documentation link check | 6 | 0 |
| LOCK1 amendment files | 14 | 0 |
| LOCK1 backend gap reconciliation | 1 | 0 |
| LOCK1 Composer handoff completeness | 24 | 0 |
| Access security review (automated part) | 4 | 0 |
| Home screen install platform check | 12 | 0 |
| LOCK1 asset identity (masters + derivatives) | 11 | 0 |
| Brand asset audit | 6 | 0 |
| Production isolation | 2 | 0 |
| Responsive spec validation (layout audit) | 3 | 0 |
| LOCK1 approved launch responsive validation | 4 | 0 |
| Truthfulness (no fabricated progress) | 5 | 0 |

## Repository build (board renderer uses the application toolchain)

| Check | Result |
|---|---|
| `npx tsc --noEmit` (repo `tsconfig.json`, includes `src` + `shared`; docs not included) | **exit 0** |
| `npx vite build --outDir <scratch>` (production config, `index.html` entry) | **pass** · OPUS1 run 24 s, LOCK1 re-run 1 min 10 s · `verify-production-dist: OK (473 JS assets checked)` |
| LOCK1 re-run note | the first LOCK1 build attempt was killed when the session worker restarted (exit 137, not a build error). The re-run passed |
| Bundle scan for both authority folder names, `SITE00_FOUNDATION_LAUNCH_MASTER`, `NORTHLINE TRANSPORT` | **0 matches**: nothing from either authority folder is in production bundles |
| `git grep` for the authority path in `src`, `shared`, `api`, `server`, `index.html`, `vite.config.ts`, `package.json` | **0 matches** |
| Files changed vs base | only `docs/site00/idnty/client-foundation-experience-living-portal-opus1/**` and `docs/site00/idnty/client-foundation-digital-access-authority-lock1/**`. No `public/`, `src/`, referral studio or founder workspace changes |

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

## LOCK1 amendment iterations

The first LOCK1 validation run passed 194/200. Each failure and its fix:

| Failure | Cause | Fix |
|---|---|---|
| doc-links: 30 linked retired PNGs | doc 30 was generated before the re-render and archive | doc 30 regenerated from the manifest, with a retired section |
| doc-links: LOCK1 04 refs `13`, `29` | ambiguous references to OPUS1 docs | prefixed “OPUS1” (the validator resolves prefixed refs against OPUS1) |
| doc-links: G-11 undefined | struck-through `~~G-11~~` not matched | regex accepts struck IDs (G-11 is retired, not deleted) |
| lock1-handoff: card-phase check | the check scanned the numbered test table, where test 17 says “no access card” | scoped to §24 implementation order |
| asset-identity: reproducibility | Python vs JS JSON spacing in the comparison; derivatives were bit-identical | compare parsed hash lists |
| brand: “Anthony” | the check’s own name inside generated report 32 | report 32 excluded from the scan |
| Visual review (AH13): launch status chips wrapped to two lines on phones and overlapped the headline safe zone | long chip copy | single-line chips (STILL OPENING / YOU’RE OFFLINE + TRY AGAIN); new check “chips never overlap a safe zone” at 320/390/1440 |

## All checks

| Group | Check | Result | Detail |
|---|---|---|---|
| authority-files | README.md | PASS | 6974 chars |
| authority-files | 01_SOURCE_AND_PRODUCT_AUDIT.md | PASS | 9919 chars |
| authority-files | 02_CLIENT_EXPERIENCE_NARRATIVE.md | PASS | 4453 chars |
| authority-files | 03_CLIENT_INFORMATION_ARCHITECTURE.md | PASS | 3648 chars |
| authority-files | 04_CANONICAL_LIFECYCLE_UI_MATRIX.md | PASS | 5997 chars |
| authority-files | 05_POST_INTAKE_REVIEW_AUTHORITY.md | PASS | 4227 chars |
| authority-files | 06_FOUNDATION_ROADMAP_AUTHORITY.md | PASS | 2517 chars |
| authority-files | 07_NEEDS_YOU_AUTHORITY.md | PASS | 2864 chars |
| authority-files | 08_RECORDS_AUTHORITY.md | PASS | 1891 chars |
| authority-files | 09_HOME_SCREEN_INSTALL_AUTHORITY.md | PASS | 4245 chars |
| authority-files | 10_HOME_SCREEN_ICON_AND_LAUNCH.md | PASS | 1675 chars |
| authority-files | 11_FOUNDATION_ACCESS_CARD_AUTHORITY.md | PASS | 1288 chars |
| authority-files | 12_ACCESS_CARD_SECURITY_AND_QR.md | PASS | 867 chars |
| authority-files | 13_SECURE_CLIENT_REENTRY.md | PASS | 4251 chars |
| authority-files | 14_PERSONALIZED_PROPOSAL_AUTHORITY.md | PASS | 2750 chars |
| authority-files | 15_RECOMMENDATION_SELECTION.md | PASS | 1741 chars |
| authority-files | 16_QUOTE_VERSION_AND_ACCEPTANCE.md | PASS | 2438 chars |
| authority-files | 17_PAYMENT_AND_CONFIRMATION.md | PASS | 3428 chars |
| authority-files | 18_PROJECT_OPERATIONS_EXPERIENCE.md | PASS | 2430 chars |
| authority-files | 19_COMPLETION_AND_HANDOFF.md | PASS | 1806 chars |
| authority-files | 20_ACTIVITY_AND_NOTIFICATIONS.md | PASS | 3370 chars |
| authority-files | 21_GLOBAL_CLIENT_OVERLAY_REGISTRY.md | PASS | 2579 chars |
| authority-files | 22_RESPONSIVE_GRID_SPECIFICATION.md | PASS | 2207 chars |
| authority-files | 23_TYPOGRAPHY_AND_DESIGN_TOKENS.md | PASS | 2525 chars |
| authority-files | 24_APPROVED_ASSET_MANIFEST.md | PASS | 1638 chars |
| authority-files | 25_MOTION_AND_TRANSITIONS.md | PASS | 1161 chars |
| authority-files | 26_COMPONENT_REGISTRY.md | PASS | 11814 chars |
| authority-files | 27_BACKEND_GAP_REGISTER.md | PASS | 4890 chars |
| authority-files | 28_SECURITY_AND_PRIVACY_REVIEW.md | PASS | 4377 chars |
| authority-files | 29_OPUS_TO_COMPOSER_HANDOFF.md | PASS | 11149 chars |
| authority-files | 30_VISUAL_BOARD_MANIFEST.md | PASS | 14110 chars |
| authority-files | 31_FOUNDER_APPROVAL_REGISTER.md | PASS | 5424 chars |
| authority-files | 32_VALIDATION_AND_TEST_REPORT.md | PASS | 22611 chars |
| authority-files | 33_IMPLEMENTATION_READINESS.md | PASS | 3303 chars |
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
| board-manifest | families A–T present (G retired by LOCK1) | PASS |  |
| retired-card | retired card boards absent from the active manifest | PASS |  |
| retired-card | retired card boards archived (history preserved) | PASS | board-AH06-access-card-anatomy.png, board-AH07-card-exports.png, board-AH08-wallet-style-not-a-wallet-pass.png, board-AH09-qr-security-and-validation.png, board-AH10-download-share |
| retired-card | retired boards listed under manifest.retired with label | PASS |  |
| component-registry | 41 registered components (CF-34/35 retired, CF-41 launch added) | PASS | 41 |
| component-registry | each component defines 13 interaction fields + id + name | PASS | 15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15 |
| component-registry | DOWNLOAD ACCESS CARD mapped as RETIRED (no component) | PASS |  |
| component-registry | example control mapped: SAVE YOUR FOUNDATION | PASS |  |
| component-registry | example control mapped: REFRESH STATUS | PASS |  |
| component-registry | example control mapped: VIEW INTAKE SUMMARY | PASS |  |
| component-registry | example control mapped: VIEW PROPOSAL | PASS |  |
| component-registry | example control mapped: ACCEPT QUOTE | PASS |  |
| component-registry | example control mapped: REQUEST CLARIFICATION | PASS |  |
| component-registry | example control mapped: CONTINUE TO CHECKOUT | PASS |  |
| component-registry | example control mapped: OPEN ROADMAP | PASS |  |
| component-registry | example control mapped: VIEW RECORDS | PASS |  |
| component-registry | example control mapped: RETURN TO FOUNDATION | PASS |  |
| component-registry | 14 overlays registered (4 retired, OL-C14 added) | PASS | 14 |
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
| lock1-files | README.md | PASS | 3411 chars |
| lock1-files | 01_FOUNDER_DECISION_LOCK.md | PASS | 2079 chars |
| lock1-files | 02_APPROVED_ICON_ASSET.md | PASS | 4602 chars |
| lock1-files | 03_APPROVED_LAUNCH_ASSET.md | PASS | 2676 chars |
| lock1-files | 04_CLIENT_ACCESS_CARD_RETIREMENT.md | PASS | 2641 chars |
| lock1-files | 05_HOME_SCREEN_INSTALL_CONTRACT.md | PASS | 4338 chars |
| lock1-files | 06_SECURE_REENTRY_CONTRACT.md | PASS | 3219 chars |
| lock1-files | 07_RESPONSIVE_LAUNCH_SPEC.md | PASS | 3946 chars |
| lock1-files | 08_ASSET_MANIFEST.md | PASS | 2978 chars |
| lock1-files | 09_BACKEND_GAP_RECONCILIATION.md | PASS | 1767 chars |
| lock1-files | 10_UPDATED_COMPOSER_HANDOFF.md | PASS | 9321 chars |
| lock1-files | 11_FOUNDER_APPROVAL_RECORD.md | PASS | 2199 chars |
| lock1-files | 12_VALIDATION.md | PASS | 9371 chars |
| lock1-files | no unexpected LOCK1 documents | PASS |  |
| doc-links | LOCK1 links resolve | PASS |  |
| doc-links | all `NN` document references resolve | PASS |  |
| doc-links | every G-xx reference is defined in 27 | PASS |  |
| doc-links | every OD-xx reference is defined in 31 | PASS |  |
| doc-links | every FR-xx reference is defined in LOCK1 11 | PASS |  |
| lock1-gaps | G-02, G-09, G-12 preserved as blocking; G-11 retired | PASS |  |
| lock1-handoff | implementation phases 0–14 present, no card/QR phase | PASS |  |
| lock1-handoff | handoff covers: Asset source files | PASS |  |
| lock1-handoff | handoff covers: Canonical repository paths | PASS |  |
| lock1-handoff | handoff covers: Icon export specification | PASS |  |
| lock1-handoff | handoff covers: Launch image contract | PASS |  |
| lock1-handoff | handoff covers: Responsive safe zones | PASS |  |
| lock1-handoff | handoff covers: PWA manifest | PASS |  |
| lock1-handoff | handoff covers: Apple touch icon | PASS |  |
| lock1-handoff | handoff covers: Android icons | PASS |  |
| lock1-handoff | handoff covers: theme colour | PASS |  |
| lock1-handoff | handoff covers: token-free start URL | PASS |  |
| lock1-handoff | handoff covers: Install flow | PASS |  |
| lock1-handoff | handoff covers: iOS guidance | PASS |  |
| lock1-handoff | handoff covers: Android guidance | PASS |  |
| lock1-handoff | handoff covers: Secure email reentry | PASS |  |
| lock1-handoff | handoff covers: session restoration | PASS |  |
| lock1-handoff | handoff covers: persistent identity | PASS |  |
| lock1-handoff | handoff covers: Backend security gates | PASS |  |
| lock1-handoff | handoff covers: Post-intake status flow | PASS |  |
| lock1-handoff | handoff covers: Quote approval gate | PASS |  |
| lock1-handoff | handoff covers: Payment verification gate | PASS |  |
| lock1-handoff | handoff covers: Client navigation | PASS |  |
| lock1-handoff | handoff covers: Removed card component list | PASS |  |
| lock1-handoff | handoff covers: Updated test requirements | PASS |  |
| access-security | no bearer-token-shaped /foundation/<token> URL in boards or docs | PASS |  |
| access-security | no secret-shaped strings (sk_live, sk_test, service_role key, JWT) | PASS |  |
| home-screen | manifest id and every field token-free | PASS |  |
| home-screen | manifest icons point at the approved-icon deploy paths (192 any, 512 any, 512 maskable) | PASS |  |
| home-screen | manifest start_url has no token and targets /foundation/return | PASS | /foundation/return?src=home |
| home-screen | manifest short_name MY FOUNDATION | PASS |  |
| home-screen | manifest theme/background from --df-bg | PASS |  |
| asset-identity | icon master byte-identical to founder attachment 01 | PASS |  |
| asset-identity | launch master byte-identical to founder attachment 02 | PASS |  |
| asset-identity | derivation record references the locked icon master | PASS |  |
| asset-identity | derivative derived/foundation-icon-512.png: hash, 512² opaque RGB, no metadata | PASS | 512 512 RGB 0 0 |
| asset-identity | derivative derived/foundation-icon-192.png: hash, 192² opaque RGB, no metadata | PASS | 192 192 RGB 0 0 |
| asset-identity | derivative derived/apple-touch-icon-foundation-180.png: hash, 180² opaque RGB, no metadata | PASS | 180 180 RGB 0 0 |
| asset-identity | derivative derived/foundation-icon-maskable-512.png: hash, 512² opaque RGB, no metadata | PASS | 512 512 RGB 0 0 |
| asset-identity | derivative derived/foundation-icon-face-crop-724.png: hash, 724² opaque RGB, no metadata | PASS | 724 724 RGB 0 0 |
| asset-identity | icon derivatives reproducible bit-for-bit from the master (derive-icons.py) | PASS | ["fc26dddb268b31e2378040e6e26f579e3510a443d92efb0cdf4fe41d98baac60", "150323881db019018d7ad96744b4a0c092b9cf9be7cd4aec2b |
| retired-card | active specimens contain no card component, QR library or ?card= route | PASS |  |
| asset-identity | specimens use the locked masters / derivatives, not the retired placeholder icon | PASS |  |
| brand-assets | cf.css colours ⊂ DF tokens + object glass + neutral device chrome | PASS |  |
| brand-assets | only the two approved font families | PASS |  |
| brand-assets | no external image or stock photo references | PASS |  |
| brand-assets | no AIO / referral card art reused | PASS |  |
| brand-assets | no "Anthony" demo data | PASS |  |
| production-isolation | application never imports the authority folder | PASS |  |
| production-isolation | only the two authority folders changed vs base d68038a87 (no public/, src/, referral studio) | PASS |  |
| responsive-spec | layout audit 22 pages × 16 viewports (352 renders) | PASS |  |
| responsive-spec | all five tiers audited | PASS | M,TP,TL,D,UW |
| responsive-spec | each tier has a distinct composition | PASS | {"M":{"bnav":true,"tabs":false,"side":0,"aside":0},"TP":{"bnav":false,"tabs":true,"side":0,"aside":0},"TL":{"bnav":false,"tabs":false,"side":112,"aside":0},"D":{"bnav":false,"tabs" |
| brand-assets | specimen requests stay on the local origin | PASS |  |
| launch | launch alt text carries the approved copy | PASS | SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS. |
| launch | safe zones fully visible, correct mode, exact 941×1672 master at 18 viewports | PASS |  |
| launch | resolution limitation measured and documented (max device upscale) | PASS | max 1.67× |
| launch | status chips single-line, in view, never overlapping a safe zone (9 renders) | PASS |  |
| retired-card | no retired card CTA / QR in rendered client views (14 renders) | PASS |  |
| asset-identity | install sheet previews the approved icon derivative | PASS | ../../../client-foundation-digital-access-authority-lock1/assets/derived/foundation-icon-192.png |
| home-screen | CTA copy is SAVE YOUR FOUNDATION (LOCK1) | PASS |  |
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
- **Not verifiable here:** whether the received PNG attachments are bit-identical to the founder’s original `.jpeg` files. The upload channel renamed them (LOCK1 `02`, `03`).
