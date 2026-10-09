# Digital Foundation — Client Board 01 + Board 02 implementation (V1)

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V1-OPUS-CLIENT-ENTRY-INTAKE-COMMERCE-VISUAL-IMPLEMENTATION1`
**Owner:** Opus (UX / UI / presentation). Composer owns contracts, Grok owns assets, the founder approves.
**Branch:** `claude/df-client-board-01-02-8d42xk` from `main` @ `d76723b0`.
**Status:** implemented and tested in a live browser against Composer's real handler. **Pending founder implementation review.**
**Production release:** NOT AUTHORIZED. No live funds, no live provider writes, nothing deployed.

## 00 — Authority

| Source | Role |
|---|---|
| Board 01 reference (P01 FOUNDATION ENTRY · P02 BUSINESS INTAKE · P03 FOUNDATION CONFIGURATOR) | Visual authority |
| Board 02 reference (P04 RECOMMENDATION · P05 REVIEW + CHECKOUT · P06 ACTIVATION) | Visual authority |
| `SITE00_DIGITAL_FOUNDATION_EXPERIENCE_AUTHORITY_BLUEPRINT_V1.md` (audit; recovered onto this branch) | Per-parent rulings, states, conflicts and corrections |
| `SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1.md`, `…_OPERATIONS_V1.md`, `…_CRITICAL_REPAIR_V1.md`, `…_FIVE_BOARD_HANDOFF.md` | Composer contracts and doctrine |
| `shared/site00-digital-foundation/*`, `api/site00/digital-foundation-artifact.ts`, `api/_lib/digitalFoundation/*` | Executable contracts (unchanged by this sprint) |

**Rule applied throughout:** keep the function, rebuild the look. Where the board conflicts with a contract or doctrine, the audit's *minimum correction* is used, and the result is listed in §07 as a visual mismatch.

## 01 — What shipped

`/foundation/:token` is rebuilt as the Board 01–02 client experience. It stays **one URL**:

- The server resolves the surface (`resolveArtifactSurface`).
- The client picks the parent inside it and keeps the choice in **history state, never in the path**. Back and forward work, and no stage or client data reaches the address bar.

| Area | Files |
|---|---|
| Route entry (unchanged route, new body) | `src/site00/pages/foundation/DigitalFoundationArtifactPage.tsx` |
| Client artifact | `src/site00/foundation-client/FoundationClient.tsx` (routing, actions), `model.ts` (pure state derivation), `useFoundationArtifact.ts` (payload, intake autosave, quote sync, payment verification), `api.ts` (thin wrappers over the existing endpoint) |
| Shell (DF-C01..C09, C26, C45..C48) | `src/site00/foundation-client/shell.tsx`, `icons.tsx` |
| Threshold architecture (DF-A01..A03) | `src/site00/foundation-client/objects.tsx`: vector stand-ins with a raster swap slot for Grok renders |
| Parents | `parents/EntryIntake.tsx` (P01–P03), `parents/Recommendation.tsx` (P04), `parents/CheckoutActivation.tsx` (P05, P06, interim overview) |
| Styles | `src/site00/styles/site00-df-client.css` |
| Fonts | `public/site00/fonts/barlow-condensed/barlow-condensed-{700,800,900}.woff2` (OFL; adds weights to the family already self-hosted), `public/site00/fonts/inter/inter-variable-latin.woff2` (byte-identical to the Builder branch copy) |
| Out-of-scope surfaces kept | `DigitalFoundationCompleteSurface.tsx`: Composer's COMPLETE / BUILD_UPSELL section moved out unchanged (Board 04 owns its rebuild) |
| QA | `scripts/site00/df-client-qa/` (memory-store harness, flow QA, responsive captures), `tests/digitalFoundationClientBoard0102.test.ts` |

Barlow Condensed Black was chosen over Anton (tried first) because it matches the board headline's proportions better. Anton is not added.

## 02 — Surface → parent routing

| Server surface | Parents the client may open | Lands on |
|---|---|---|
| `PROSPECT` | P01 · P02 · P03 | P01 |
| `INTAKE` | P01 · P02 · P03 | P02 (resumes saved answers) |
| `RECOMMENDATION` / `QUOTE` | P04 · P05 | P04; P05 when the acceptance is for an older quote version |
| `CHECKOUT` (accepted, awaiting payment) | P04 (read-only) · P05; P06 only on `?checkout=return` | P05; P06 on return |
| `PORTAL` (paid) | P06 · interim overview | P06 until the client opens the overview once (per-browser flag, CG-13), then the overview |
| `PAYMENT_RECOVERY` (refund / dispute) | P06 | P06 **PROJECT PAUSED** |
| `COMPLETE` / `BUILD_UPSELL` | Composer's existing complete section | — (Board 04, not this sprint) |
| `state = ARCHIVED` (not paid) | System panel "THIS LINK HAS BEEN CLOSED" | — |

The menu drawer lists 01–06 and greys out the parents the surface does not allow.

## 03 — Parents

Status vocabulary: **IMPLEMENTED** · **TESTED** (live browser QA against the real handler, plus unit tests) · **VISUALLY VERIFIED** (browser capture compared side by side with the board) · **PARTIAL** · **BLOCKED** · **DEFERRED** · **PENDING FOUNDER APPROVAL**.

### P01 — FOUNDATION ENTRY · IMPLEMENTED · TESTED · VISUALLY VERIFIED (architecture PARTIAL, asset blocked)

- Composition as the board:
  - Header, `01 — GET STARTED`, four-line headline with the red square terminal.
  - Lede, threshold chamber hero, scope triad, red CTA, trust line, `IDNTY / 001`.
- At 390×844 the whole composition fits one screen, with the CTA and trust line above the fold (measured: CTA bottom 816 px, trust 842 px).
- The turnaround copy is bound to the commercial config (`base_min/max_business_days`): "TYPICALLY 2–3 BUSINESS DAYS". It is not hardcoded and not a guarantee.
- **BEGIN** calls `update-intake {}` (INTAKE_STARTED), so a reload resumes at P02.

### P02 — BUSINESS INTAKE · IMPLEMENTED · TESTED · VISUALLY VERIFIED (one field omitted)

**Fields** (binding contract field):

| Board field | Contract field | Notes |
|---|---|---|
| BUSINESS NAME | `business_name` | Required |
| BUSINESS TYPE | `industry` | 10-value list, pending founder approval (CG-12) |
| PRIMARY CONTACT | `contact_name` | Required |
| EMAIL ADDRESS | `current_email` | Required; placeholder `YOU@EXAMPLE.COM` |
| PHONE NUMBER | `phone` | — |
| BUSINESS LOCATION | — | **Omitted**: no contract field (CG-11) |

**Behaviour:**

- Prefilled from the saved intake first, then the founder-entered lead.
- Debounced autosave (900 ms). The status chip reads SAVING… → **SAVED {time}** only after the server's 200, or **NOT SAVED — RETRY** on failure.
- Inline required-field errors block CONTINUE.

### P03 — FOUNDATION CONFIGURATOR · IMPLEMENTED · TESTED · VISUALLY VERIFIED

The eight board rows are kept in board order. Each row carries its class line (the brief's required distinction):

| Row | Class | Binding |
|---|---|---|
| DOMAIN | INCLUDED · CONFIGURABLE (LOST → PAID ADD-ON · MANUAL REVIEW) | Required single path: register new (`NEED_DOMAIN`), connect owned (`OWN_DOMAIN` + `existing_domain` + `existing_registrar`), recover (`LOST_DOMAIN`), not sure (`UNSURE`). `NEED_DOMAIN` and `OWN_DOMAIN` are never sent together |
| PROFESSIONAL EMAIL | CORE · INCLUDED (→ CORE · PAID ADD-ON when more than 1 person) | Locked included. "How many people need email?" stepper writes `team_size`; ≥ 2 adds `NEED_MULTI_MAILBOX` |
| EMAIL ALIASES / EMAIL SECURITY / EMAIL SIGNATURE | CORE · INCLUDED | Locked. No flag is sent; included in base scope and the runbook |
| DEVICE SETUP | INCLUDED · CONFIGURABLE (PAID ADD-ON for a team) | `NEED_DEVICE`: one device is included; the engine adds devices only for teams |
| EMAIL MIGRATION | PAID ADD-ON · MANUAL REVIEW | `NEED_MIGRATION` + `existing_email_provider` |
| ADDITIONAL SERVICES (arrow) | CONFIGURABLE | Sheet: `HAVE_WEBSITE` (paid · reviewed), `EVENTUAL_WEBSITE`, `NEED_BRANDING`, `UNSURE` |

**VIEW MY RECOMMENDATION** validates gate G01 (business info, exactly one domain path, a domain for OWN). It then calls `update-intake {intake, needs, markComplete:true}`, which runs `completeIntake`: recommendation, quote v1, QUOTE_READY.

### P04 — RECOMMENDATION · IMPLEMENTED · TESTED · VISUALLY VERIFIED

- **Included scope:** six rows with red check discs.
- **ADDITIONAL FEATURES:**
  - The board's four rows first (mailbox, transfer, migration, additional device), then any other line the quote holds.
  - **VIEW ALL ADD-ONS** sheet grouped DOMAIN / EMAIL / SETUP / PRIORITY / CUSTOM.
  - EXPEDITED is hidden until a premium is configured.
  - Custom work reads **QUOTED AFTER REVIEW**, never +$0.
  - STAFF SIGNATURE is dependency-locked ("REQUIRES MULTI-USER WORKSPACE"; "REQUIRED BY …" on removal).
- **Controls:** checkbox per add-on. Quantity add-ons swap the checkbox for an in-row stepper once selected, so rows keep the board height.
- **Sync:** edits debounce 400 ms into **one** request. A lone removal uses `remove-addon` (server dependency check); everything else uses `update-quote` with the full set. Totals dim with UPDATING… until the server answers. On error the controls revert and an alert explains.
- **Investment / turnaround** come from `payload.quote` only:
  - `subtotal_minor`.
  - Caption `base + addon_total ADD-ONS` (+ adjustment when present).
  - `projected_min–max BUSINESS DAYS`.
  - `+N DAYS (ADD-ONS)` against the configured base.
  - `· CONFIRMED AFTER REVIEW` when `timeline_custom_review`.
  - No mockup value ($775, 3–5) is in the code.
- **Manual-review notice** whenever a reviewed line lacks founder confirmation.
- **Expired quote:** an unaccepted expired quote shows REFRESH MY QUOTE (same selections, new version).
- **Third-party fees** row opens a sheet with the recommendation's `third_party_costs` and the quote notice.

### P05 — REVIEW + CHECKOUT · IMPLEMENTED · TESTED · VISUALLY VERIFIED

**Spec rows** bound to the quote:

| Row | Content |
|---|---|
| SERVICE | Add-on count; opens the scope sheet: included, lines, what we need, quote version and validity |
| INVESTMENT | TOTAL DUE AT CHECKOUT |
| TURNAROUND | Range and caption |
| THIRD-PARTY COSTS | BILLED SEPARATELY (opens a sheet) |
| PAYMENT | SECURE STRIPE CHECKOUT · ACTIVATES YOUR PROJECT |

**AGREEMENT & AUTHORIZATION** renders the three **canonical** disclosures the server requires verbatim.

**States** (`data-review-state`):

| State | How it is reached | CTA |
|---|---|---|
| READY TO REVIEW | Quote not accepted, nothing acknowledged | Disabled until 3/3 |
| AWAITING ACCEPTANCE | Acknowledging | PROCEED TO CHECKOUT, or **SUBMIT FOR CONFIRMATION** when reviewed items need founder pricing |
| AWAITING FOUNDER PRICING | Accepted; `assessQuotePayability` → `MANUAL_REVIEW_PENDING` / `CUSTOM_PRICING_PENDING` | Disabled "AWAITING CONFIRMATION" + CHECK FOR UPDATES. Server refuses checkout (verified) |
| READY FOR CHECKOUT | Accepted and payable | PROCEED TO CHECKOUT |
| CREATING CHECKOUT | `start-checkout` in flight | "OPENING SECURE CHECKOUT…", then `window.location.assign(checkout_url)` (**Stripe-hosted**; no card form) |
| CHECKOUT ERROR | `start-checkout` failed, or `payment_state = FAILED` | Client copy ("NOTHING WAS CHARGED") + TRY AGAIN |
| PAYMENT CANCELLED | `?checkout=cancel` | "CHECKOUT CANCELED — NOTHING WAS CHARGED." + TRY AGAIN |
| PAYMENT PENDING | `CHECKOUT_PENDING` with no return marker | CHECK PAYMENT STATUS. Reopening needs an explicit "I DIDN'T FINISH CHECKOUT" (CG-01, double-charge guard) |
| SCOPE CHANGED | Acceptance version ≠ quote version | Re-accept, then checkout at the new price |
| QUOTE EXPIRED | Expired | Unaccepted → back to P04 refresh. Accepted → SITE 00 must reissue (CG-08) |

### P06 — ACTIVATION · IMPLEMENTED · TESTED · VISUALLY VERIFIED

**Not another payment screen.** Everything comes from the server payload: `payment_state`, `project_state`, `stages`, `client_actions`, `timeline_readiness`, `operations_summary`.

**Payment verification:** on `?checkout=return` the page polls the payload every 3 s, 10 times. **The redirect never marks anything paid.** In the simulated (no-Stripe) adapter used outside production, the page says "TEST CHECKOUT — NO PAYMENT WAS TAKEN".

**States** (`data-activation-state`):

| State | Derivation |
|---|---|
| VERIFYING PAYMENT | Return marker; not PAID; polling |
| PAYMENT CONFIRMATION PENDING | Polling exhausted; still not PAID |
| PAYMENT CONFIRMED | PAID; project not started |
| ACTIVATION PENDING | PAID; project active; no stages yet |
| PROJECT ACTIVATED | PAID; stages; nothing outstanding; no production start |
| AWAITING REQUIRED INFORMATION | Open client action(s) or missing requirements |
| AWAITING CLIENT AUTHORIZATION | An open AUTHORIZE / APPROVE action |
| PRODUCTION READY | Production start stamped, **and** no open action, **and** no missing requirement (CG-04) |
| ACTIVATION ERROR | Payment status could not be read (3 failed polls) |
| PROJECT PAUSED | Refund / dispute |

**Truth corrections applied:**

| Board | Implemented |
|---|---|
| Lede "IN PRODUCTION" | Only in PRODUCTION READY |
| "FROM TODAY" | "ONCE WE HAVE WHAT WE NEED" (or "FROM {date}" when production is ready) |
| NEXT | The server's first open action (e.g. "CONNECT EXISTING DOMAIN") |
| "CONFIRMATION SENT" | **PORTAL READY** (no notifications exist, CG-14) |
| Triad | Cells dim until true |

### Interim P07 destination — IMPLEMENTED · TESTED (not the P07 design)

**VIEW PROJECT OVERVIEW** opens an overview labelled **INTERIM VIEW**:

- live project stages from the server
- the Needs You list (titles and details only)
- the turnaround

It says the full project portal arrives later on the same link. P07–P15 are **not** implemented.

### System states — IMPLEMENTED · TESTED

- Loading skeleton.
- Invalid link (404): "THIS LINK ISN'T ACTIVE".
- Disabled (503, or `VITE_SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1=0`): "TEMPORARILY UNAVAILABLE".
- Load error with retry.
- Closed (archived).

## 04 — Contract wiring (no new endpoints)

| Client action | Endpoint (`/api/site00/digital-foundation-artifact`) |
|---|---|
| Load / poll | `GET ?action=payload&token=` (client projection: no events, no referral accounting) |
| Add-on catalog + commercial config | `GET ?action=catalog` |
| BEGIN / autosave / VIEW MY RECOMMENDATION | `POST update-intake` (`intake`, `needs`, `markComplete`). Re-read afterwards (CG-06) |
| Add-on change | `POST update-quote` (full set) or `POST remove-addon` (single removal) |
| Acceptance | `POST accept-quote` (3 canonical disclosures) |
| Checkout handoff | `POST start-checkout` (`success_url …?checkout=return`, `cancel_url …?checkout=cancel`) |

**No pricing engine runs in the browser.** `assessQuotePayability` (a pure Composer function) is the only engine the UI calls, and only to *label* the P05 state; the server enforces the same gate.

## 05 — Client access and security

- The token is the only identity. Views live in history state, so there are no per-stage URLs and no PII in the URL (QA Q01).
- Only the client projection is rendered.
  - QA Q23 checks the DOM and payload for `events`, `referral_source`, the internal referral label, `internal_description`, `public_token`, `evt_` and `cs_sim`.
  - The unit test checks the payload for the same.
- No hidden fields stand in for authorization. Every gate is enforced by the server, and the UI reflects it.
- `<meta name="robots" content="noindex, nofollow">` is added while the artifact is open.
- Per-browser storage holds only the "activation seen" flag (artifact id, wrapped in try/catch).

## 06 — Feature flags

- **No flag was added or changed.** Builder flags, `VITE_SITE00_TEMPLATE_SYSTEM_V1` and `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` are untouched.
- The client honours Composer's `VITE_SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1`. The server honours its `ARTIFACT_V1` / `CHECKOUT_V1` pairs.
- **Exposure risk (CG-17):** the DF flags default ON and are not set in any env file or workflow. Merging this branch exposes the new UI on production for anyone holding a valid token. The founder and Composer must set the production exposure before merge.

## 07 — Visual fidelity

**Method.** Each parent was captured in Chromium (Playwright, deviceScaleFactor 2, reduced motion) at 390×844 and 393×852. Each capture was compared side by side with the board crop.

**Note on scale.** The boards' phone canvas is about 990 CSS px tall. At 844 px every parent except P01 scrolls; P01 was fitted to one screen.

| ID | Parent | Mismatch | Class | Reason |
|---|---|---|---|---|
| VM-01 | P01, P04–P06, P02+ corner | Architecture renders are **vector stand-ins**: same chamber, glass Foundation Plate with etching, red threshold plates, plinth, crown and fragment, but illustrative, not photoreal | **ASSET BLOCKED** | No matching asset exists. Grok DF-G01..G05 requested (`SITE00_DIGITAL_FOUNDATION_GROK_ASSET_MANIFEST_V1.md`). The swap slot is built |
| VM-02 | P02 | BUSINESS LOCATION field omitted | CONTRACT GAP | No field (CG-11). Not faked |
| VM-03 | P03 | Rows carry a class line (CORE · INCLUDED, PAID ADD-ON, MANUAL REVIEW…). Core rows show a locked black check instead of an empty box. DOMAIN opens a path selector. PROFESSIONAL EMAIL opens a people stepper | REQUIRED BY BRIEF / AUDIT | The brief requires the CORE / INCLUDED / CONFIGURABLE / PAID ADD-ON / MANUAL-REVIEW distinction. Core items are base scope (no double charge) |
| VM-04 | P01 | "DONE FOR YOU. IN 2–3 DAYS." → "DONE FOR YOU. TYPICALLY 2–3 BUSINESS DAYS." | TRUTH CORRECTION | Business days; config-bound; no guarantee |
| VM-05 | P04 | Selected quantity add-ons show an in-row stepper. RECOMMENDED / REVIEWED flags appear inline. VIEW ALL ADD-ONS row, manual-review notice and third-party fees row are added. CONFIRMED AFTER REVIEW appears in the turnaround caption | FUNCTION / TRUTH | Dynamic add-ons and the manual-review gate |
| VM-06 | P05 | Lede corrected (activation ≠ production). TOTAL DUE TODAY → AT CHECKOUT. ACTIVATES PRODUCTION → ACTIVATES YOUR PROJECT. The three canonical disclosures replace the board's three. STATUS line added | TRUTH CORRECTION | Doctrine §03; `acceptQuote` exact strings |
| VM-07 | P06 | Lede only says "IN PRODUCTION" when production is ready. FROM TODAY → ONCE WE HAVE WHAT WE NEED. CONFIRMATION SENT → PORTAL READY. SERVICE value shows the add-on count | TRUTH CORRECTION | CG-04, CG-14 |
| VM-08 | P02, P03 | Typed values render at 16 px (placeholders keep the board's small tracked caps) | PLATFORM | Prevents the iOS focus zoom |
| VM-09 | all | Display face is Barlow Condensed Black, close to but not identical to the board's face. Square red terminal drawn as a block | TYPE | SITE 00 self-hosted family; the board face is not identified |
| VM-10 | all | No phone frame, Dynamic Island or status bar, per the brief; header starts at the top of the page | BY DESIGN | — |

## 08 — Responsive review

| Viewport | Behaviour | Status |
|---|---|---|
| 390×844, 393×852 | Board composition. No horizontal overflow (checked) | VISUALLY VERIFIED |
| Tablet 834×1194 (native viewport shell) | Centred 640 px column. Crown and corner scale up. The artifact scrolls inside the shell | VISUALLY VERIFIED |
| Desktop 1440×900 | 520 px content column. P01 becomes two columns (chamber at right, 640 px, soft-edged). Crown at about 46 % width on the right. Sheets centre as dialogs | VISUALLY VERIFIED. Desktop composition is Opus's proposal (the boards are mobile only): **PENDING FOUNDER APPROVAL** |

## 09 — QA

### Live browser QA

**What runs:** Composer's real handler on the memory store, forwarded from the browser.

**How to run it:**

1. Start the harness: `npx tsx scripts/site00/df-client-qa/qa-df-api-server.ts`. It refuses to start with Supabase persistence or a Stripe key.
2. Start the app: `npx vite --port 5174 --host 127.0.0.1`.
3. Run `node scripts/site00/df-client-qa/df-client-flow.cjs`, then `node scripts/site00/df-client-qa/df-client-responsive.cjs`.

The first-visit SITE 00 world loader is pre-completed in QA contexts, because it is shared platform behaviour, not P01.

**Result: 32 / 32 PASS** (`df-client-board-01-02-qa/results-m390.json`):

| ID | Check |
|---|---|
| Q01 | P01 renders; server OPENED; no PII in URL |
| Q02 | BEGIN → INTAKE_IN_PROGRESS; P02 prefilled; same URL |
| Q03 | P02 required-field validation |
| Q04 | Autosave shows SAVED only after the server holds the values |
| Q05 | Reload resumes P02 with the saved answers |
| Q06 | A save failure shows NOT SAVED; retry persists |
| Q07 | P03 core rows locked as included |
| Q07b | Menu shows only the parents this surface allows; additional services sheet |
| Q08 | Domain path required |
| Q09 | Own domain + 2 people + migration + device → `OWN_DOMAIN, NEED_MULTI_MAILBOX, NEED_MIGRATION, NEED_DEVICE` (no `NEED_DOMAIN`) |
| Q10 | Completion → P04 shows the server quote (v1 $900, 3–5 days) |
| Q11 | Manual-review notice |
| Q12 | Add DOMAIN TRANSFER → one `update-quote`, $900 → $1,000, 3–5 → 4–7 (server) |
| Q13 | Mailbox stepper 2 → 3 on the server |
| Q14 | Single removal → `remove-addon` |
| Q15 | Dependency lock |
| Q16 | P05 READY TO REVIEW, canonical disclosures, quote-bound rows |
| Q17 | Acceptance recorded; AWAITING FOUNDER PRICING; server refuses checkout `MANUAL_REVIEW_PENDING` |
| Q18 | Founder confirms → READY FOR CHECKOUT |
| Q19 | Hosted-checkout handoff; return → VERIFYING; server still `CHECKOUT_PENDING` |
| Q20 | Poll exhausted → PAYMENT CONFIRMATION PENDING |
| Q21 | Webhook path → PAID → AWAITING REQUIRED INFORMATION (3 Needs You, stage Details received); return marker dropped |
| Q22 | Interim overview shows the server stages; reload lands there |
| Q23 | No internal data in the payload or DOM |
| Q24 | PAYMENT CANCELLED |
| Q25 | PAYMENT PENDING |
| Q26 | CHECKOUT ERROR; nothing charged |
| Q27 | AWAITING CLIENT AUTHORIZATION |
| Q28 | PROJECT PAUSED after refund |
| Q29 | Founder change after acceptance → SCOPE CHANGED → re-accept → checkout at the new price (exposes CG-03) |
| Q30 | Invalid link panel |
| Q31 | No app console errors or failed app requests. The proxy blocks one external Supabase host the shared app shell contacts; this is environmental |

### Unit and contract tests

- `tests/digitalFoundationClientBoard0102.test.ts`: **13 / 13**. Routing, intake mapping and validation, add-on rows and locks, sync planning, all P05 and P06 states, client projection. Payloads come from Composer's real service.
- All DF suites: `npx vitest run tests/digitalFoundation` → **53 passed, 1 skipped**. The skip is Composer's Supabase persistence test, which needs `SITE00_DF_PERSISTENCE_TEST=1`.

### Typecheck and production build

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npx vite build` | ✅ 31 s. `vendor` unchanged at 461.02 kB. DF is a lazy chunk: `DigitalFoundationArtifactPage` 84.22 kB JS (25.87 kB gzip) + 28.61 kB CSS |
| Lint | Not run: the repo has no ESLint config |

### Screenshots (`docs/site00/idnty/df-client-board-01-02-qa/`)

| File | Content |
|---|---|
| `01-p01-foundation-entry[-full].png` | P01 |
| `02-p02-business-intake[-full].png` | P02 |
| `03-p03-foundation-configurator[-full].png` | P03 |
| `03b-p03-selected-add-ons[-full].png` | **P03 selected add-ons** |
| `03c-menu-drawer.png` | Menu drawer |
| `03d-p03-additional-services-sheet.png` | Additional services sheet |
| `04-p04-recommendation[-full].png` | P04 |
| `04b-p04-recalculated-estimate.png` | **P04 recalculated estimate** |
| `04c-p04-manual-review-state.png` | **P04 manual-review state** |
| `04d-p04-all-add-ons-sheet.png` | All add-ons sheet |
| `05-p05-review-checkout[-full].png` | P05 |
| `05b-p05-checkout-blocked.png` | **P05 checkout blocked** |
| `05c-p05-ready-for-checkout.png` | P05 ready for checkout |
| `05d-p05-payment-cancelled.png` | P05 payment cancelled |
| `05e-p05-payment-pending.png` | P05 payment pending |
| `05f-p05-checkout-error.png` | P05 checkout error |
| `05g-p05-scope-changed.png` | P05 scope changed |
| `06a-p06-verifying-payment.png` | P06 verifying payment |
| `06b-p06-payment-confirmation-pending[-full].png` | **P06 payment confirmation pending** |
| `06c-p06-verified-activation[-full].png` | **P06 verified activation** |
| `06d-p06-awaiting-client-authorization.png` | P06 awaiting client authorization |
| `06e-p06-project-paused.png` | P06 project paused |
| `07-interim-project-overview[-full].png` | Interim overview |
| `00-invalid-link.png` | Invalid link |
| `r-m393-p0{1..6}[-full].png` | 393×852 |
| `r-tablet-p0{1..6}[-full].png` | Tablet 834×1194 |
| `r-desktop-p0{1..6}[-full].png` | Desktop 1440×900 |

## 10 — Founder preview handoff

**Not live.** This session cannot reach `site00.fsbw-dev.com` (agent proxy 403) or the tunnel machine. No preview URL is claimed.

**Option A — pin the tunnel** (no merge, no production deploy). On the canonical Cursor environment that serves `:5174`:

```bash
git fetch origin claude/df-client-board-01-02-8d42xk
SITE00_PREVIEW_PIN_REF=origin/claude/df-client-board-01-02-8d42xk SITE00_CLOUD_PREVIEW_MODE=dev \
  bash .cursor/scripts/run-site00-cloud-preview-server.sh
```

Dev mode serves `/api/*` in-process from Vite on the DF memory store (no Supabase write), with no Stripe key, so checkout uses the simulated adapter: no money moves, and nothing is ever marked paid by the redirect.

On the pinned preview, the founder can then:

1. Open `/admin/site00/foundation` (founder sign-in) and create a link. The new link opens P01 at `/foundation/<token>`.
2. Walk P01 → P06. Checkout returns as TEST CHECKOUT, then PAYMENT CONFIRMATION PENDING.
3. See paid, failed and paused states through the admin `materialize-fixture` action (`J_PAYMENT_SUCCESS`, `K_PAYMENT_FAILURE`, `L_REFUND`).

**Option B — merge to `main`.** This triggers the production deploy workflow. It needs founder authorization **and** the exposure decision in CG-17 first. Not done.

## 11 — Not in this sprint

- P07–P15.
- Any backend, persistence, engine, payment or provider change.
- New flags, deploys, live Stripe, live provider writes.
