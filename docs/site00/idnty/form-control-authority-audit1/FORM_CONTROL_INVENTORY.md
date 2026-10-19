# Form Control Inventory — IDNTY Digital Foundation

Audit IDs **`FC-001`–`FC-052`**.  
**Legend — implementation class:** `NATIVE` = OS/browser chrome dominates when open; `APP` = app CSS owns visible UI; `HYBRID` = native input hidden, custom paint; `LIB` = `components.tsx` primitive; `EXT` = third-party hosted.

**Legend — authority:** `APPROVED` = board/docs explicitly approve treatment; `IMPLEMENTED` = shipped code; `INFERRED` = matches neighboring approved patterns; `UNRESOLVED` = needs founder/Opus decision.

---

## P01 — Foundation entry

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-001 | P01 | BEGIN (`DfCta` → `DfButton`) | `EntryIntake.tsx` ~88 | Submit / primary button | APP | Red rectilinear CTA, arrow | default, busy, disabled | `onBegin` → intake started API | Native `<button>`, focus-visible in CSS | — | — | Keep; extend token sharing |
| FC-002 | P01 | Menu open | `shell.tsx` `DfMenu` | Icon button → drawer | APP | Header menu control | open/closed | Navigation only | Drawer focus trap in components | — | — | Opus: align with form family |

---

## P02 — Business intake

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-003 | P02 | Business name | `EntryIntake.tsx` 185–186 | Text | APP | `.df-input` in `.df-field` | empty, filled, error, disabled, focus | `draft.business_name` → `intakeFromDraft` | `<label>` via `Field`, `aria-invalid` | — | — | Optional `IdntyTextInput` wrapper |
| FC-004 | P02 | Business type | `EntryIntake.tsx` 188–207 | **Native `<select>`** | **NATIVE** | Closed: `.df-select` + chevron; **open: iOS picker** | empty, selected, disabled; **open = OS UI** | `draft.industry`; values from `BUSINESS_TYPES`; `__custom` option edge case | `<select id="df-industry">`; no `aria-describedby` for optional field | **A, G** | **P1** | Replace with `DfSelect` or mobile sheet; preserve enum strings |
| FC-005 | P02 | Primary contact | `EntryIntake.tsx` 209–211 | Text | APP | `.df-input` | + validation | `contact_name` required | Same as FC-003 | — | — | Shared text primitive |
| FC-006 | P02 | Email | `EntryIntake.tsx` 212–220 | Email | APP/HYBRID | `.df-input` | + invalid email | `current_email` | `type="email"`, autocomplete | — | — | — |
| FC-007 | P02 | Phone | `EntryIntake.tsx` 222–235 | Tel (masked display) | APP | Dashes via `formatUsPhoneDisplay` | typing mask | `phone` optional string | `type="tel"` | — | — | Document storage format (dashed) for API |
| FC-008 | P02 | CONTINUE | `EntryIntake.tsx` 237 | Submit | APP | `DfCta type="submit"` | busy via parent | Triggers `validateBusinessInfo` | Form submit | — | — | — |
| FC-009 | P02 | Save chip | `EntryIntake.tsx` `SaveChip` | Status / retry | APP | Text button on error | idle/saving/saved/error | Autosave side effect | `role="status"` | C | P3 | Opus: saved state typography |

---

## P03 — Foundation configurator

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-010 | P03 | DOMAIN row toggle | `EntryIntake.tsx` 413–423 | Custom checkbox row | APP | `ServiceRow` + `.df-check` | checked/unchecked/active/expanded | `domainPath`, clear on toggle | `role="checkbox"` on button | — | — | Document interaction spec |
| FC-011 | P03 | Domain path radios (×4) | `EntryIntake.tsx` 429–448 | Radio group | HYBRID | `.df-path` + hidden radio | selected, focus-within | `domainPath` → `needsFromDraft` flags | Native radio hidden (`pointer-events: none`) | E | P2 | Ensure keyboard: label click only |
| FC-012 | P03 | Your domain | `EntryIntake.tsx` 453–467 | Text (domain) | APP | `.df-input` | validation error | `existing_domain` when OWN/LOST | Field + error | — | — | — |
| FC-013 | P03 | Registrar | `EntryIntake.tsx` 469–477 | Text | APP | `.df-input` | optional | `existing_registrar` | — | — | — | — |
| FC-014 | P03 | DONE link | `EntryIntake.tsx` 481–484 | Text button | APP | `.df-link` | — | Closes panel only | — | — | — | — |
| FC-015 | P03 | Email team stepper | `EntryIntake.tsx` 316–340, 512–518 | Quantity stepper | APP | `.df-stepper` ± buttons | min/max disabled | `team_size` → multi-mailbox need | `role="group"`, aria labels | — | — | Shared stepper primitive |
| FC-016 | P03 | Professional email row | `EntryIntake.tsx` 494–507 | Locked check row | APP | Locked `.df-check` | expanded email panel | Core included | Locked control | — | — | — |
| FC-017 | P03 | Device setup row | `EntryIntake.tsx` 534–543 | Toggle need | APP | `toggleNeed('NEED_DEVICE')` | on/off | `needs[]` | checkbox role | — | — | — |
| FC-018 | P03 | Email migration row | `EntryIntake.tsx` 545–568 | Toggle + reveal | APP | Opens migration panel | | `NEED_MIGRATION`, `existing_email_provider` | — | — | — | — |
| FC-019 | P03 | Migration provider | `EntryIntake.tsx` 561–568 | Text | APP | `.df-input` | — | `existing_email_provider` | — | — | — | — |
| FC-020 | P03 | Additional service cards (×4) | `EntryIntake.tsx` 344–354, ~580+ | Checkbox cards | APP | Same row pattern | toggle needs | `ConfigurableNeed` flags | — | — | — | — |
| FC-021 | P03 | VIEW RECOMMENDATION | `EntryIntake.tsx` submit | Primary CTA | APP | Validates `validateForRecommendation` | errors → open domain | Submits intake complete | — | — | — | — |
| FC-022 | P03 | Bottom sheet extras | `EntryIntake.tsx` `DfSheet` | Sheet | LIB/APP | `DfBottomSheet` | open/closed | Informational | Focus trap | — | — | Opus: sheet vs dropdown policy |

---

## P04 — Recommendation

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-023 | P04 | Addon toggle (per row) | `Recommendation.tsx` 69–76 | Checkbox button | APP | `.df-addon__main` | selected, locked, blocked | Quote sync via `useQuoteSelections` | `role="checkbox"` | F | P2 | Preserve addon_id mapping |
| FC-024 | P04 | Addon decorative check | `Recommendation.tsx` 100–109 | Button (tabIndex -1) | APP | `.df-check` | mirrors selection | Same | **E** duplicate control | P2 | Remove redundant control for a11y |
| FC-025 | P04 | Addon quantity stepper | `Recommendation.tsx` 90–97 | Stepper | APP | Same as P03 | quantity bounds | Catalog quantity units | — | — | — |
| FC-026 | P04 | CONTINUE / navigation CTAs | `Recommendation.tsx` | Buttons | APP | `DfCta` | sync busy states | Route to P05 | — | — | — | — |

---

## P05 — Review + checkout

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-027 | P05 | Disclosure acks (×N) | `CheckoutActivation.tsx` 347–360 | Checkbox | HYBRID | Hidden input + `.df-check` | all required for accept | `DF_DISCLOSURES` → accept API | Label + focus-within | — | — | Align with `DfCheckbox` |
| FC-028 | P05 | Spec row “open sheet” | `CheckoutActivation.tsx` `SpecRow` | Disclosure trigger | APP | Button rows | — | Read-only + sheets | — | — | — | — |
| FC-029 | P05 | Accept / Pay CTAs | `CheckoutActivation.tsx` | Primary/secondary | APP | State machine `deriveReviewState` | disabled until acks | `acceptQuote`, `start-checkout` | busy buttons | F | P2 | Do not alter Stripe URLs |
| FC-030 | P05 | Scope / third-party sheets | `CheckoutActivation.tsx` | Modal sheet | LIB | `DfBottomSheet` | — | Display quote | — | — | — | — |

---

## P06 — Activation / payment return

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-031 | P06 | Payment verification polling | `FoundationClient.tsx`, `usePaymentVerification` | Loading / status | APP | Copy + spinner | return URL | `checkout=return` | Live region partial | C | P2 | — |
| FC-032 | P06 | Portal entry CTA | `CheckoutActivation.tsx` `P06Activation` | Navigation | APP | — | paid states | localStorage `activation-seen` | — | — | — | — |

---

## Client portal (post-payment)

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-033 | Portal | Action notes | `ProjectPortal.tsx` 228–230 | Textarea | APP | `.df-input--area` | — | Client action API notes | Label present | B | P2 | Match single-line field chrome |
| FC-034 | Portal | Approve / request / submit | `ProjectPortal.tsx` 232–235 | Buttons | APP | `DfCta` | busy | `completeClientAction` | — | — | — | — |
| FC-035 | Portal | Record filter chips | `ProjectPortal.tsx` 324–329 | Segmented tabs | APP | `.df-chip` | selected | UI filter only | `role="tablist"` | — | — | — |
| FC-036 | Portal | Comm prefs checkboxes (×3) | `ProjectPortal.tsx` 414–428 | Checkbox | **NATIVE/APP drift** | Missing `DfCheckMark` / `df-choice__input` | on/off | `CommunicationPrefs` API | Native checkbox likely visible | **B** | **P1** | Use `DfCheckbox` pattern |
| FC-037 | Portal | SAVE PREFERENCES | `ProjectPortal.tsx` 431 | Primary | APP | — | busy | Persist prefs | — | — | — | — |

---

## Complete / build upsell (legacy shell)

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-038 | Complete | Configure / save CTAs | `DigitalFoundationCompleteSurface.tsx` 72–79 | Button | APP (legacy CSS) | `site00-digital-foundation.css` | — | `captureBuildInterest` | — | **B** | P2 | Board 04 rebuild deferred |

---

## Founder readiness desk

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-039 | Admin | Test email input | `FoundationReadinessPage.tsx` 306 | Email | NATIVE | Default admin HTML | — | Synthetic client create | `<label>` wrapper | **A, B** | P2 | Optional admin design pass |
| FC-040 | Admin | Display name input | `FoundationReadinessPage.tsx` 312 | Text | NATIVE | Default admin | — | createTestClient | — | **B** | P2 | — |
| FC-041 | Admin | Send approval checkbox | `FoundationReadinessPage.tsx` 405 | Checkbox | NATIVE | Unstyled | gates email send | Safety gate | — | **B** | P3 | — |
| FC-042 | Admin | Journey action buttons | `FoundationReadinessPage.tsx` 315–420 | Buttons | NATIVE/APP | `Site00AdminShell` | busy | Test APIs only | — | — | — | Out of client Opus scope |

---

## Shared library (not wired into P02 intake)

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-043 | LIB | `DfSelect` | `components.tsx` 252–464 | Custom combobox/listbox | APP | `.df-select__*` in components CSS | open/closed, keyboard | **Not bound in P02** | Combobox ARIA tested SSR | **G** | P1 | **Candidate** for Business Type replacement |
| FC-044 | LIB | `DfCheckbox` / `DfRadio` / `DfToggle` | `components.tsx` 497–586 | Choice | HYBRID | `.df-choice` | — | — | Hidden native input | — | — | Adopt in portal + acks |
| FC-045 | LIB | `DfModal` / `DfPopover` / `DfTooltip` | `components.tsx` | Overlays | APP | `.df-portal` scope | — | — | Focus traps | — | — | — |
| FC-046 | LIB | `DfToastProvider` | `components.tsx` | Toast | APP | — | — | — | — | — | — | — |

---

## External / system

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-047 | Checkout | Stripe Checkout | `api.ts` `start-checkout` redirect | Hosted payment | **EXT** | Stripe brand UI | success/cancel URLs | Session id, webhook | Stripe a11y | **A** (expected) | P3 | Keep hosted; brand return URLs only |
| FC-048 | System | Invalid / unavailable panels | `FoundationClient.tsx` | Static | APP | `DfSystemPanel` | — | — | — | — | — | — |
| FC-049 | System | Load error TRY AGAIN | `FoundationClient.tsx` 171 | Button | APP | — | — | retry fetch | — | — | — | — |

---

## Design review route (non-production intake)

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-050 | Review | Static P02/P03 demos | `DigitalFoundationReviewPage.tsx` | Same as production parents | APP | Fixed draft | — | **No persistence** | — | — | — | QA only |

---

## Aggregate navigation

| ID | Surface | Control | Source | Family | Class | Visual | States | Data contract | A11y | Finding | Sev | Future action |
|----|---------|---------|--------|--------|-------|--------|--------|---------------|------|---------|-----|---------------|
| FC-051 | All | Progress / menu drawer | `shell.tsx`, `DfMenu` | Drawer + links | APP | Right drawer | — | History `dfView` | Focus trap | — | — | — |
| FC-052 | All | Header menu button | `shell.tsx` | Icon button | APP | — | — | — | — | — | — | — |

---

## Business Type dropdown — dedicated finding (FC-004)

| Field | Detail |
|-------|--------|
| **Classification** | A (native visual break), G (approval gap on replacement pattern) |
| **Severity** | P1 visual |
| **Closed state** | IMPLEMENTED — matches board: rectilinear field, uppercase placeholder, chevron (`site00-df-client.css` `.df-select`) |
| **Open state** | **Native iOS `<select>`** — wheel or bottom sheet with SF typography, frosted container, system checkmark; **cannot be fully skinned with CSS** |
| **Founder evidence** | `evidence/founder-p02-intake-reference.jpg` (closed); open state per founder sprint description |
| **Existing alternative in repo** | `DfSelect` (custom listbox) — tested in `tests/digitalFoundationComponents.test.ts`, **unused** in `P02Intake` |
| **Data contract** | Must continue storing plain string `industry`; values must remain `BUSINESS_TYPES` tokens (+ legacy custom values via `__custom` option) |
| **Recommended pattern** | **C — branded mobile selection sheet** or anchored **DfSelect** listbox on mobile; founder to approve sheet vs inline list |
