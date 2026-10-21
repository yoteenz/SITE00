# Form Control Gap Matrix — Audit 1

Rows are **component families**. Columns summarize implementation, gaps, and recommended future treatment. Counts reference inventory IDs in `FORM_CONTROL_INVENTORY.md`.

---

## Master matrix

| Family | Existing implementation | Inconsistencies (class) | Surfaces (FC IDs) | Key states | Mobile impact | Functional risk (F) | Recommended treatment | Priority |
|--------|-------------------------|-------------------------|-------------------|------------|---------------|---------------------|----------------------|----------|
| Primary / secondary CTA | `DfButton` / `DfCta` — APP | C: busy/saved adjacent copy | P01–P06, portal | default, busy, disabled | Touch targets OK | Low | **APPROVED** — tokenize only | P3 |
| Text single-line | Native `<input class="df-input">` | — | P02, P03 | focus, error, disabled | 16px anti-zoom CSS | Low | `IdntyTextInput` thin wrapper | P2 |
| Email / tel / URL | Typed inputs + phone mask | Storage format for phone | P02 | keyboard types | iOS keyboards native | Low | Document + optional normalize on save | P2 |
| **Native `<select>`** | P02 industry only | **A, G** — iOS open UI | FC-004 | **open = OS** | **High — visual break** | Medium — must preserve values | **`DfSelect` or mobile sheet** | **P1** |
| Custom combobox (`DfSelect`) | LIB unused in intake | G — authority not chosen | FC-043 | open list, keyboard | Needs WebKit QA | Medium — list placement | Opus spec + adopt FC-004 | **P1** |
| Textarea | `.df-input--area` | B — minor padding drift | FC-033 | focus | Keyboard resize | Low | Match text input field shell | P2 |
| Radio group (domain) | Hidden native + `.df-path` | E — pointer-events on input | FC-011 | focus-within, on | OK on founder shot | Low | Keep pattern; fix keyboard if needed | P2 |
| Custom row checkbox | `ServiceRow` button | — | FC-010, 016–020 | checked, active, expanded | Good touch rows | Medium — domainPath/null | Document toggle semantics | P2 |
| Checkbox (disclosures) | HYBRID ack row | B — parallel to `DfCheckbox` | FC-027 | on, disabled fieldset | OK | **High** — accept gate | Consolidate to `DfCheckbox` | P1 |
| Checkbox (portal prefs) | **Native visible** | **B, A** | FC-036 | unchecked default | Likely iOS native box | Medium — prefs API | **DfCheckbox** | **P1** |
| Addon selector | Button + optional stepper | E — duplicate check button | FC-023–025 | locked, blocked | Row layout dense | **High** — quote sync | Single focusable control | P1 |
| Stepper | `.df-stepper` ± | — | FC-015, FC-025 | min/max | 44px-ish buttons | Medium — team_size/qty | Shared `IdntyStepper` | P2 |
| Segmented / chips | `.df-chip` tabs | — | FC-035 | selected | Horizontal scroll? | Low | Opus chip styling | P3 |
| Bottom sheet / modal | `DfBottomSheet`, `DfModal` | G — when vs dropdown | FC-022, 030 | open, drag dismiss | Safe area in CSS | Low | Opus overlay rules | P2 |
| Loading / save / error | `DfLoading`, `SaveChip`, `DfAlert` | C — error copy styles | FC-009, 031 | saving, retry | — | Low | Token alignment | P3 |
| Admin HTML inputs | Unstyled | A, B | FC-039–041 | — | Desktop-first | Low (internal) | Defer or admin pass | P3 |
| Legacy complete CTAs | `site00-digital-foundation.css` | B | FC-038 | — | — | Low | Board 04 | P2 |
| Stripe Checkout | Hosted redirect | A (external) | FC-047 | payment | Mobile Safari OK | **High** — URLs | Keep hosted | P3 |

---

## Interaction model recommendations (selectors)

| Use case | Current | Recommended (for Opus approval) | Rationale |
|----------|---------|----------------------------------|-----------|
| Business Type (10 fixed enums) | Native `<select>` | **C — mobile sheet** or **B — anchored `DfSelect` listbox** | Long labels; iOS native breaks brand |
| Domain path (4 options + fields) | Inline reveal + custom radios | **Keep B — inline panel** | Already on-brand; spatial context |
| Additional services (4 toggles) | Row checkboxes | Keep custom rows | Matches P03 composition |
| Addon lines (catalog-driven) | Row + stepper | Keep; fix a11y duplicate | Commerce-critical |
| Record category filter | Chips | Keep chips | Short enum set |

---

## Style drift hotspots (CLASS B)

1. Portal comm prefs vs P05 acks vs LIB `DfCheckbox` — three checkbox visual systems.
2. Complete surface buttons vs `.df-cta` — separate stylesheet.
3. Readiness desk inputs vs client artifact — intentional but visually disjoint.
4. P02 select **closed** mimics custom select; **open** reveals native — **false consistency**.

---

## State gaps (CLASS C)

1. Native select: no app-controlled open/selected/hover states.
2. Focus ring: global `:focus-visible` red outline; some hidden inputs rely on `:focus-within` on parent only.
3. Invalid select: no `df-select--invalid` on P02 (field optional — N/A unless required later).

---

## Responsive notes (CLASS D)

1. **UNVERIFIED:** long addon list + keyboard on iPhone SE.
2. **UNVERIFIED:** `DfSelect` list max-height near viewport bottom (CSS variable in components.css — needs device pass).

---

## Data contract touchpoints (CLASS F summary)

| Control area | Fields / APIs | Must not change |
|--------------|---------------|-----------------|
| P02 | `business_name`, `industry`, `contact_name`, `current_email`, `phone` | Intake JSON keys, validation messages |
| P03 | `domainPath`, `needs[]`, `team_size`, domain/migration strings | `needsFromDraft` / `domainPathFromNeeds` mapping |
| Autosave | `saveIntake` debounce 900ms | Timing, endpoint |
| P04 | addon ids, quantities | Quote engine selections |
| P05 | `DF_DISCLOSURES` checklist | Accept payload |
| Checkout | Stripe success/cancel query params | URL shape |

See `FORM_CONTROL_MIGRATION_PLAN.md` for regression suite mapping.
