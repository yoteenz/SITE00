# 12 — Validation

Run: `node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/validate.mjs`. One suite validates OPUS1 and its LOCK1 amendment together; full output is in OPUS1 [`32_VALIDATION_AND_TEST_REPORT.md`](../client-foundation-experience-living-portal-opus1/32_VALIDATION_AND_TEST_REPORT.md).

## Result: **200 / 200 checks passed** (LOCK1-relevant groups below)

## Acceptance gates (sprint §29)

| Gate | Result | Evidence |
|---|---|---|
| A — both attachments received and inspected | **PASS** | icon 1254 × 1254 PNG `4dccf2ae…`, launch 941 × 1672 PNG `f8855565…`; content matches the description; filenames were renamed by the upload channel (`02`, `03`) |
| B — approved icon locked | **PASS** | byte-identical master committed; deployable derivatives D1/D2 are documented crops, reproducible bit-for-bit, pending founder review FR-01/FR-02 |
| C — approved light launch locked | **PASS** | byte-identical master; shown exactly; safe zones visible at 18/18 viewports; never stretched; status chips never overlap the zones |
| D — client access card retired from active V1 | **PASS** | no card component, QR, CTA or route in active specimens or 14 rendered client views; 7 boards archived; G-11, CF-34/35 and OL-C06/08/09/10 retired |
| E — home screen and email reentry preserved | **PASS** | SAVE YOUR FOUNDATION flow on M08, AH01–AH04 and AH14; 12 reentry states |
| F — G-02, G-09, G-12 preserved | **PASS** | ACTIVE · BLOCKING in `09`; phases 1, 2 and 5 of `10` |
| G — active manifest and component registry consistent | **PASS** | 87 active boards (M20 TP10 TL10 D20 UW5 X12 AH10); retired listed separately; registry 41 rows (2 retired, CF-41 added); overlays 14 (4 retired, OL-C14 added) |
| H — revised Composer handoff complete | **PASS** | all 23 required topics; phases 0–14 with no card phase; 19 tests |
| I — PR #1670 updated and still draft | see final report | push to the existing branch; the PR body is updated and the PR stays draft |

## Repository build

- `npx tsc --noEmit`: exit 0.
- `npx vite build`: pass, `verify-production-dist: OK (473 JS assets checked)`.
- The bundle scan finds 0 references to either authority folder or asset.
- The first LOCK1 build attempt was killed by a session worker restart (exit 137), not a build error. The re-run passed.

## Checks

| Group | Check | Result | Detail |
|---|---|---|---|
| retired-card | retired card boards absent from the active manifest | PASS |  |
| retired-card | retired card boards archived (history preserved) | PASS | board-AH06-access-card-anatomy.png, board-AH07-card-exports.png, board-AH08-wallet-style-not-a-wallet-pass.png, board-AH09-qr-security-and-validation.png, board |
| retired-card | retired boards listed under manifest.retired with label | PASS |  |
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
| production-isolation | application never imports the authority folder | PASS |  |
| production-isolation | only the two authority folders changed vs base d68038a87 (no public/, src/, referral studio) | PASS |  |
| launch | launch alt text carries the approved copy | PASS | SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS. |
| launch | safe zones fully visible, correct mode, exact 941×1672 master at 18 viewports | PASS |  |
| launch | resolution limitation measured and documented (max device upscale) | PASS | max 1.67× |
| launch | status chips single-line, in view, never overlapping a safe zone (9 renders) | PASS |  |
| retired-card | no retired card CTA / QR in rendered client views (14 renders) | PASS |  |
| asset-identity | install sheet previews the approved icon derivative | PASS | ../../../client-foundation-digital-access-authority-lock1/assets/derived/foundation-icon-192.png |
| home-screen | CTA copy is SAVE YOUR FOUNDATION (LOCK1) | PASS |  |
| home-screen | ios: no install button | PASS |  |
| home-screen | manual: no install button | PASS |  |
| home-screen | desktop: no install button | PASS |  |
| home-screen | android: one browser-prompt button | PASS | ADD TO HOME SCREEN |
| home-screen | installed: no install button | PASS |  |
| home-screen | iOS guidance names Share → Add to Home Screen and says SITE 00 cannot add it | PASS |  |
| access-security | all 12 reentry states render | PASS | 12/12 |
| access-security | public reentry states reveal no client data (non-enumerating) | PASS |  |

## Not verifiable here

- Bit-identity with the founder’s original `.jpeg` files (the upload channel delivered renamed PNGs).
- Real-device behaviour of iOS Add to Home Screen, Android install prompts and iOS standalone cookie isolation (on-device tests in `10` phase 14).
- Founder acceptance of the icon derivatives (FR-01, FR-02).
