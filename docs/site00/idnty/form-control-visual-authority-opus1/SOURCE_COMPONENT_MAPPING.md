# Source and component mapping

This maps every audit ID (FC-001 to FC-052) to its source, family, board and treatment. The audit's IDs, classes and source references are preserved. Line numbers are the audit's, at `5f4d26c3`.

| FC | Surface | Control | Source (audit) | Family (§ in specs) | Board | Treatment | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | P01 | BEGIN | `EntryIntake.tsx` ~88 | CTA (1.14) | 04 | Unchanged | I |
| 002 | P01 | Menu open | `shell.tsx` `DfMenu` | Drawer (§4) | 04 | Unchanged (approved drawer) | L |
| 003 | P02 | Business name | `EntryIntake.tsx` 185–186 | Field (1.1) | 02 | Focus frame, mark, error mark, 16 px touch | P |
| **004** | P02 | **Business type** | `EntryIntake.tsx` 188–207 | Selector (1.4) | **01A, 01B, 06** | IdntySelect: B sheet on phones, A listbox elsewhere (FD-1) | P |
| 005 | P02 | Primary contact | 209–211 | Field (1.1) | 02 | As 003 plus `enterkeyhint` | P |
| 006 | P02 | Email | 212–220 | Field (1.2) | 02 | As 003 | P |
| 007 | P02 | Phone | 222–235 | Field (1.2) | 02 | Mask kept; `OPTIONAL` tag (FD-2) | P |
| 008 | P02 | CONTINUE | 237 | CTA (1.14) / blocked (§4) | 04 | Section summary when 2+ items block | P |
| 009 | P02 | Save chip | `SaveChip` | Status (§5.1) | 05 | Marks; `UNSAVED CHANGES` while dirty (NF-03); RESTORED; OFFLINE | P |
| 010 | P03 | Domain row | 413–423 | Service row (1.6) | 03 | Locked | L |
| 011 | P03 | Domain path radios | 429–448 | Radio (1.5) | 03 | Group error; focusable hidden input | P |
| 012 | P03 | Your domain | 453–467 | Field (1.2) | 02 | `inputmode="url"`, error mark | P |
| 013 | P03 | Registrar | 469–477 | Field (1.1) | 02 | `autocomplete="off"` | P |
| 014 | P03 | DONE link | 481–484 | Link | — | Unchanged | I |
| 015 | P03 | Email team stepper | 316–340, 512–518 | Stepper (1.10) | 03 | IdntyStepper extraction | P |
| 016 | P03 | Professional email (locked) | 494–507 | Service row (1.6) | 03 | Locked (ink check) | L |
| 017 | P03 | Device setup | 534–543 | Service row (1.6) | 03 | Locked | L |
| 018 | P03 | Email migration | 545–568 | Service row (1.6) | 03 | Locked | L |
| 019 | P03 | Migration provider | 561–568 | Field (1.1) | 02 | `autocomplete="off"` | P |
| 020 | P03 | Additional services ×4 | 344–354, ~580+ | Service row (1.6) | 03 | Locked | L |
| 021 | P03 | VIEW MY RECOMMENDATION | submit | CTA / blocked (§4) | 04 | Section summary (Board 04) | P |
| 022 | P03 | Bottom sheet | `DfSheet` | Overlay (1.12) | 07 | FD-6 skin | P |
| 023 | P04 | Add-on toggle | `Recommendation.tsx` 69–76 | Add-on (1.9) | 03 | The single control | P |
| **024** | P04 | Add-on decorative check | 100–109 | Add-on (1.9) | 03 | **Removed as a button**; becomes an `aria-hidden` span | P |
| 025 | P04 | Add-on stepper | 90–97 | Stepper (1.10) | 03 | IdntyStepper | P |
| 026 | P04 | CONTINUE TO REVIEW | — | CTA (1.14) | 04 | Unchanged (busy `UPDATING YOUR QUOTE…`) | I |
| 027 | P05 | Disclosure acks | `CheckoutActivation.tsx` 347–360 | Checkbox (1.7) | 03, 04 | Count, post-attempt invalid line, focus ring | P |
| 028 | P05 | Spec row sheet trigger | `SpecRow` | Overlay trigger | — | Unchanged | I |
| 029 | P05 | Accept / Pay | — | CTA, gated (§4) | 04 | Counter plus explanatory line; Stripe untouched | P |
| 030 | P05 | Scope sheets | `DfBottomSheet` | Overlay (1.12) | 07 | FD-6 skin | P |
| 031 | P06 | Payment verification | `FoundationClient.tsx` | Feedback (§5.2) | 05 | Ladder level 03/04 copy kept | I |
| 032 | P06 | Portal entry CTA | `P06Activation` | CTA | — | Unchanged | I |
| 033 | Portal | Action notes | `ProjectPortal.tsx` 228–230 | Textarea (1.3) | 02 | Field shell plus `OPTIONAL` tag | P |
| 034 | Portal | Approve / request / submit | 232–235 | CTA | — | Unchanged | I |
| 035 | Portal | Record filter chips | 324–329 | Tabs (1.11) | 03 | **NF-02**: CSS written from scratch; roving focus | P |
| **036** | Portal | Communication preferences | 414–428 | Checkbox (1.8) | 03 | DfCheckbox row; the native box goes (FD-3) | P |
| 037 | Portal | SAVE PREFERENCES | 431 | CTA plus toast (§5.3) | 05 | Success toast only after the save resolves | P |
| 038 | Complete | Configure / save | `DigitalFoundationCompleteSurface.tsx` 72–79 | Completion (1.16) | 07 | FD-4: DfButton plus ink marks; layout untouched | P |
| 039 | Admin | Test email | `FoundationReadinessPage.tsx` 306 | Admin (1.15) | — | Deferred | U-5 |
| 040 | Admin | Display name | 312 | Admin (1.15) | — | Deferred | U-5 |
| 041 | Admin | Send approval checkbox | 405 | Admin (1.15) | — | Deferred | U-5 |
| 042 | Admin | Journey buttons | 315–420 | Admin (1.15) | — | Out of scope (audit) | — |
| 043 | LIB | `DfSelect` | `components.tsx` 252–464 | Selector (1.4) | 01A, 01B | Territory A engine; C-1 collision fix | P |
| 044 | LIB | `DfCheckbox` / `DfRadio` / `DfToggle` | 497–586 | Checkbox, radio, toggle | 03 | Adopt checkbox and radio; toggle kept out of client flows (U-3) | P |
| 045 | LIB | `DfModal` / `DfPopover` / `DfTooltip` | — | Overlay | 07 | FD-6 skin for the modal | P |
| 046 | LIB | `DfToastProvider` | — | Feedback (§5) | 05 | Usage rule | P |
| 047 | Checkout | Stripe | `api.ts` `start-checkout` | External (1.17) | — | No change promised | — |
| 048 | System | Invalid / unavailable panels | `FoundationClient.tsx` | Feedback (§5.2) | 05 | Kept | I |
| 049 | System | TRY AGAIN | 171 | Feedback (§5.2) | 05 | Kept | I |
| 050 | Review | Static P02/P03 demos | `DigitalFoundationReviewPage.tsx` | QA route | — | Used for this sprint's captures | — |
| 051 | All | Progress / menu drawer | `shell.tsx` | Progression (§4) | 04 | Drawer locked; in-page strip (FD-5) | L / P |
| 052 | All | Header menu button | `shell.tsx` | — | — | Unchanged | I |

**Status key:**
- **L:** locked (founder evidence or approval)
- **I:** implemented and kept
- **P:** proposed
- **U-n:** unresolved item in the approval register
