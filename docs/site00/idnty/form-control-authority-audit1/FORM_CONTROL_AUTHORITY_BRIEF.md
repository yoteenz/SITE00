# Form Control Authority Brief — Opus Handoff

**Audience:** Claude Opus (visual authority sprint)  
**Scope:** Interactive form-control **family** for IDNTY Digital Foundation client artifact + aligned portal surfaces  
**Out of scope:** Page compositions, intake state machine, pricing, Supabase schema, Stripe integration logic

---

## 1. SITE 00 / IDNTY visual principles (APPROVED baseline)

Source: Board 01–02 docs, `site00-df-client.css` header comment, `SITE00_DIGITAL_FOUNDATION_CLIENT_BOARD_01_02_V1.md`.

| Principle | Implementation evidence |
|-----------|-------------------------|
| White / warm-white chambers | `--df-bg`, `--df-card`, `--df-field` |
| Black architectural typography | `--df-display`, uppercase labels |
| Red threshold accents | `--df-red`, active rows, primary CTA |
| Rectilinear geometry | `border-radius: 0` on inputs and CTAs |
| Uppercase tracked labels | `.df-field__label`, placeholders |
| Minimal decorative UI | No gradient decoration in client CSS |
| Strong vertical rhythm | `.df-form`, `.df-rows` spacing |
| Mobile-first intake width | `.df-screen` max-width 520px |

**Do not change:** headline composition, rail indices, footer `IDNTY / 00x`, hero/threshold object placement, lede copy structure.

---

## 2. APPROVED vs IMPLEMENTED vs UNRESOLVED

| Element | Status |
|---------|--------|
| `.df-input` text field closed state | **IMPLEMENTED** — treated as approved in board QA |
| `.df-cta` primary button | **IMPLEMENTED** — approved red CTA |
| P03 service rows + domain reveal | **IMPLEMENTED** — founder screenshots match intent |
| P02 Business Type **closed** chrome | **IMPLEMENTED** |
| P02 Business Type **open** picker | **UNRESOLVED** — native iOS; **not approved** as final authority |
| `DfSelect` listbox | **IMPLEMENTED** in library — **UNRESOLVED** for Business Type (founder not asked) |
| Portal comm prefs checkboxes | **IMPLEMENTED** — **not approved** (native chrome) |
| Complete surface (`site00-digital-foundation.css`) | **IMPLEMENTED** — **UNRESOLVED** (Board 04) |

---

## 3. Design constraints (hard)

1. No new rounded “app UI” containers for selectors on mobile.
2. No shadows as primary depth (existing row active uses inset/red border).
3. Typography: display headlines stay separate from control labels (Saira Semi Condensed / SITE 00 Display).
4. Red is semantic: primary action, active selection, errors — not decorative fills on neutral fields.
5. Accessibility: minimum 44px touch targets on primary toggles; visible focus; do not remove native semantics without replacement roles.
6. **Do not** restyle iOS `<select>` open state via CSS alone — replace control or use sheet.

---

## 4. Required component families (Opus deliverables)

Opus should produce visual specs (not code) for:

1. **Field shell** — label, input, hint, error (maps to `DfField` / `.df-field`)
2. **Text input** — single line, email, tel, domain
3. **Textarea** — portal notes
4. **Selector** — closed trigger + open panel (desktop listbox + **mobile sheet variant**)
5. **Radio card** — domain path row (existing layout, refine states)
6. **Checkbox row** — service row + disclosure ack + portal prefs (**one system**)
7. **Stepper** — quantity / team size
8. **Chip / tab** — records filter
9. **Button** — primary, outline, text, busy
10. **Form messages** — inline error, alert banner, save status
11. **Overlay** — bottom sheet used on P05 (scope/costs) — align with selector sheet language

---

## 5. Missing visual states (must be designed)

For each family above, Opus should specify:

- Default, empty, placeholder, focus, disabled, read-only
- Error / valid (where applicable)
- Open, selected, active option (selectors)
- Pressed / busy (buttons)
- Saved / saving / failed (autosave chip)

**Priority gap:** native select **open** and **selected option** on iOS — currently **missing** from brand system.

---

## 6. Responsive interaction requirements

| Breakpoint | Requirement |
|------------|-------------|
| iPhone compact (375×667+) | Full-width fields; no horizontal scroll; CTA above fold on P02 where possible |
| iPhone standard (390×844) | Founder reference viewport |
| iPhone large (428+) | Same patterns; watch long addon labels |
| Tablet | `.site00-desktop-artboard` scroll model — artifact scrolls inside shell |
| Desktop | Max 520px column; selectors may use anchored dropdown vs sheet |

**Mobile selector policy (recommendation — founder approval needed):**

- **Business Type:** full-width **selection sheet** with uppercase list, red selection marker, dismiss affordance.
- **Short in-context enums (domain path):** keep **inline panel** (current).

---

## 7. Accessibility constraints

- Preserve logical tab order in forms (P02 top-to-bottom).
- Combobox: `aria-expanded`, `aria-activedescendant`, Escape closes, Tab dismisses (already in `DfSelect` code — spec should match).
- Do not use `pointer-events: none` on focusable inputs without equivalent keyboard path (audit flag on domain radios).
- Required fields: P02 uses validation on submit; consider `aria-required` in implementation sprint.
- Reduced motion: sheet/modal transitions already respect `prefers-reduced-motion` in LIB.

---

## 8. Data contract constraints (for implementers after Opus)

- Field names and enum strings in `model.ts` / `intakeFromDraft` are frozen unless Composer explicitly versions API.
- `industry` values = `BUSINESS_TYPES` array (10 strings + legacy custom).
- Domain paths map to intake need flags via `DOMAIN_FLAG` — UI must not invent new path ids.
- Autosave debounce **900ms** — visual “saving” must not trigger extra saves.

---

## 9. Founder approval decisions (UNRESOLVED)

| # | Question |
|---|------------|
| FD-1 | Business Type: **custom listbox** vs **full-screen sheet** on mobile? |
| FD-2 | Is **phone** optional forever, or should it become required (affects error states)? |
| FD-3 | Portal comm prefs: same checkbox art as P05 acks? |
| FD-4 | Complete surface: rebuild with Board 04 now or after control family lands? |

---

## 10. Boundaries

| Opus may | Opus may not |
|----------|--------------|
| Redesign control chrome, states, motion | Reorder intake steps or remove fields |
| Unify checkbox/radio/select visuals | Change quote math or addon catalog |
| Specify sheet/dropdown behavior | Alter Stripe flow |
| Reference board PDFs / QA captures | Replace threshold hero art |

---

## 11. Reference assets for Opus

- Founder P02/P03: `evidence/founder-p02-intake-reference.jpg`, `evidence/founder-p03-domain-reference.jpg`
- Board implementation doc: `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_CLIENT_BOARD_01_02_V1.md`
- Live CSS tokens: `src/site00/styles/site00-df-client.css` (lines 6–27, 730–810, 989–1026, 1448–1510)
- Primitive behavior reference: `src/site00/foundation-client/components.tsx` (`DfSelect`, `DfCheckbox`)
- Inventory + matrix: sibling files in this folder
