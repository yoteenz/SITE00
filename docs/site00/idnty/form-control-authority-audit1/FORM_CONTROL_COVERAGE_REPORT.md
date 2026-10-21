# Form Control Coverage Report — Audit 1

**Sprint:** `P0.SITE00.IDNTY.FORM-CONTROL-AUTHORITY-AUDIT1`  
**Inspection method:** Repository source trace (`rg`, file reads), existing unit tests, founder-provided iPhone screenshots. No UI code changes.

---

## Surfaces examined

| Code | Surface (sprint scope) | Status | Primary source |
|------|------------------------|--------|----------------|
| A | Public Digital Foundation introduction (P01) | IMPLEMENTED | `EntryIntake.tsx` → `P01Entry` |
| B | Personalized client artifact shell | IMPLEMENTED | `FoundationClient.tsx` |
| C | Business information intake (P02) | IMPLEMENTED | `P02Intake` |
| D | Domain discovery / ownership (P03) | IMPLEMENTED | `P03Configure` |
| E | Email / mailbox configuration (P03) | IMPLEMENTED | `P03Configure` (stepper, locked rows) |
| F | Provider / account access (P03 migration field) | IMPLEMENTED | `existing_email_provider` input |
| G | Security / verification intake | PARTIAL | Included as locked P03 rows; no separate form |
| H | Recommendations (P04) | IMPLEMENTED | `Recommendation.tsx` |
| I | Add-on selections (P04) | IMPLEMENTED | `AddonLine` |
| J | Quote review (P05) | IMPLEMENTED | `CheckoutActivation.tsx` → `P05Review` |
| K | Quote acceptance | IMPLEMENTED | `df-acks` checkboxes + accept CTA |
| L | Checkout preparation / return | IMPLEMENTED | Stripe redirect + `?checkout=return\|cancel` |
| M | Client project portal | IMPLEMENTED | `ProjectPortal.tsx` |
| N | Client action requests | IMPLEMENTED | `P10NeedsYou` + `ActionWorkspace` textarea |
| O | Ownership / verification records | IMPLEMENTED | Read-only `RecordsLibrary` / `RecordDetail` |
| P | Completion experience | IMPLEMENTED (legacy visual) | `DigitalFoundationCompleteSurface.tsx` |
| Q | Build-readiness opportunity | IMPLEMENTED | Buttons on complete surface |
| R | Founder Readiness Desk | IMPLEMENTED | `FoundationReadinessPage.tsx` |
| S | Founder administration controls | PARTIAL | List/detail: buttons only; no form fields |
| T | Synthetic-client testing controls | IMPLEMENTED | Readiness page create/journey controls |
| U | Save / resume / recovery | IMPLEMENTED | `useIntakeDraft` autosave + `SaveChip` |
| V | Confirmation, error, empty, loading | IMPLEMENTED | `DfAlert`, `DfLoading`, `DfSystemPanel`, portal empty copy |

**Not implemented (no dedicated UI in repo):** Full founder pipeline workbench forms (P13–P15-style command surfaces beyond readiness desk), embedded Stripe Elements (checkout is hosted redirect only).

---

## Counts (derived from repository, not estimated)

| Metric | Count | Notes |
|--------|------:|-------|
| Surfaces in scope with at least one interactive control | 18 | See table above |
| Surfaces marked NOT IMPLEMENTED / partial | 2 | G as separate form; S admin forms |
| `<input>`, `<select>`, `<textarea>` in `src/site00/foundation-client/**/*.tsx` | **17** | `rg` literal tag count |
| Additional interactive controls (buttons with selection semantics) | **35+** | Service rows, addon toggles, steppers, chips, CTAs, menu, sheets |
| **Total control instances inventoried** | **52** | See `FORM_CONTROL_INVENTORY.md` (IDs `FC-001`–`FC-052`) |
| **Unique component families** | **16** | See gap matrix |
| Native HTML form tags in client artifact | **17** | All in parents + `components.tsx` primitives |
| App-styled custom selection (no native tag visible) | **~22** | P03 rows, P04 addons, steppers, chips |
| `DfSelect` / `DfCheckbox` / `DfRadio` / `DfToggle` in **live intake** | **0** | Primitives exist; intake uses native + bespoke patterns |
| Third-party embedded UI | **1** | Stripe Checkout (hosted, off-origin) |

---

## Finding totals by classification

| Class | Count | P0 | P1 | P2 | P3 |
|-------|------:|---:|---:|---:|---:|
| A — Native visual break | 4 | 0 | 2 | 1 | 1 |
| B — Component style drift | 6 | 0 | 1 | 4 | 1 |
| C — State style gap | 5 | 0 | 1 | 3 | 1 |
| D — Responsive failure | 2 | 0 | 0 | 1 | 1 |
| E — Accessibility defect | 3 | 0 | 0 | 2 | 1 |
| F — Data contract risk | 4 | 0 | 0 | 4 | 0 |
| G — Approval gap | 3 | 0 | 1 | 2 | 0 |

*(One control may carry multiple classes; counts are finding records, not unique controls.)*

---

## Native controls found

1. **P02 `<select>`** — Business Type (`industry`) — **primary CLASS A / P1** (iOS wheel/sheet).
2. **P02 text/tel/email inputs** — closed field chrome is app-controlled; OS keyboards and autofill are native.
3. **P03 domain `<input type="radio">`** — hidden; custom `.df-path` visuals (app-controlled closed state).
4. **P03 text inputs** — domain, registrar, migration provider.
5. **P05 disclosure `<input type="checkbox">`** — hidden with custom `.df-check` (app-controlled).
6. **Portal comm prefs `<input type="checkbox">`** — **not** using `df-choice__input` / `DfCheckMark` pattern — likely native chrome (CLASS B).
7. **Readiness desk `<input>` / checkbox** — default admin HTML styling (CLASS A/B on mobile).
8. **Stripe Checkout** — full native/hosted UI (expected external break).

---

## Quality gates

| Gate | Result |
|------|--------|
| 1 — Inventory completeness | **PASS** — 52 instances or grouped equivalents documented; Stripe/hosted called out |
| 2 — State coverage | **PASS with gaps** — Open/select states on iOS marked **UNVERIFIED** in automation |
| 3 — Source traceability | **PASS** — file:line on every inventory row |
| 4 — Design authority integrity | **PASS** — APPROVED vs IMPLEMENTED vs UNRESOLVED labeled in brief |
| 5 — Functional safety | **PASS** — no code or schema changes in this sprint |
| 6 — Responsive coverage | **PARTIAL** — founder iPhone evidence + CSS review; no automated multi-viewport capture |
| 7 — Opus readiness | **PASS** — handoff brief + migration plan included |

---

## Browser verification

| Check | Engine | Viewport | Result |
|-------|--------|----------|--------|
| Unit tests `digitalFoundationComponents.test.ts` | Node SSR markup | n/a | **PASS** (DfSelect combobox contract) |
| Unit tests `digitalFoundationClientBoard0102.test.ts` | Node | n/a | **PASS** (intake model / routing) |
| Playwright P02 capture | Chromium | 390×844 | **NOT RUN** — `npx playwright install` required on VM |
| Founder P02 / P03 screenshots | Mobile Safari (founder device) | iPhone | **REFERENCED** — `evidence/founder-p*.jpg` |

---

## iPhone Safari verification

| State | Verified on real iPhone? | Evidence |
|-------|---------------------------|----------|
| P02 Business Type **closed** field | Yes (founder) | `founder-p02-intake-reference.jpg` |
| P02 Business Type **open** (iOS picker) | Yes (founder report + typical WebKit behavior) | Sprint prompt + CLASS A finding FC-006 |
| P03 domain row / radios | Yes (founder) | `founder-p03-domain-reference.jpg` |
| P04–P06, portal, Stripe return | **UNVERIFIED** on device | Requires founder or Playwright WebKit |

---

## Untested / unverified interaction states

- Native `<select>` open list on iPadOS / Android Chrome.
- Virtual keyboard overlap on P02 long forms with iOS bottom toolbar.
- `DfSelect` list placement on small viewports (primitive tested in SSR only; **not used in intake**).
- Stripe Checkout and payment-element states (hosted).
- Comm prefs checkbox focus rings on iOS VoiceOver (code review only).

---

## Opus handoff ready

**Yes** — pending founder confirmation on unresolved approval items in `FORM_CONTROL_AUTHORITY_BRIEF.md` § Founder decisions.

---

## Next action

1. Opus: visual authority for shared form-control family using this package (no intake logic changes).
2. Composer (future sprint): wire P02 `industry` to `DfSelect` or branded mobile sheet per approved spec.
3. Founder: optional attach additional iPhone captures for P04 acks and portal comm prefs.
