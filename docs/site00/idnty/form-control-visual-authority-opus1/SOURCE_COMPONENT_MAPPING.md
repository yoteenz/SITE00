# Source and component mapping

This maps every audit ID (FC-001 to FC-052) to its source, family, board and treatment. The audit's IDs, classes and source references are preserved. Line numbers are the audit's, at `5f4d26c3`.

| FC | Surface | Control | Source (audit) | Family (§ in specs) | Board | Treatment | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | P01 | BEGIN | `EntryIntake.tsx` ~88 | CTA (1.14) | 04 | Unchanged | I |
| 002 | P01 | Menu open | `shell.tsx` `DfMenu` | Drawer (§4) | 04 | Unchanged (approved drawer) | L |
| 003 | P02 | Business name | `EntryIntake.tsx` 185–186 | Field (1.1) | 02 | Focus frame, mark, error mark, 16 px touch | A (Board 07) |
| **004** | P02 | **Business type** | `EntryIntake.tsx` 188–207 | Selector (1.4) | **01A, 01B, 06** | IdntySelect: B sheet on coarse ≤ 600 px, A listbox otherwise | **A (FD-1)** |
| 005 | P02 | Primary contact | 209–211 | Field (1.1) | 02 | As 003 plus `enterkeyhint` | A |
| 006 | P02 | Email | 212–220 | Field (1.2) | 02 | As 003 | A |
| **007** | P02 | **Contact number** (`phone`) | 222–236 | Field (1.1a) | 02, 05 | **Required backup contact:** `CONTACT NUMBER *`, `ENTER PHONE NUMBER`, backup-contact helper; mask kept; client + server validation (`CONTACT_NUMBER_REQUIREMENT.md`) | **A (FD-2)** · messages U-2 |
| 008 | P02 | CONTINUE | 237 | CTA (1.14) / blocked (§4) | 04 | Implemented validate-on-press preserved; no summary | I (FD-5) |
| 009 | P02 | Save chip | `SaveChip` | Status (§5.1) | 05 | Marks per Board 07 grammar; new labels (`UNSAVED CHANGES`, RESTORED, OFFLINE) open | A (marks) · U-2 |
| 010 | P03 | Domain row | 413–423 | Service row (1.6) | 03 | Row locked; chosen mark System B | L · A (FD-3) |
| 011 | P03 | Domain path radios | 429–448 | Radio (1.5) | 03 | Group error; focusable hidden input; radio semantics kept | A (FD-3 retained proposal) |
| 012 | P03 | Your domain | 453–467 | Field (1.2) | 02 | `inputmode="url"`, error mark | A |
| 013 | P03 | Registrar | 469–477 | Field (1.1) | 02 | `autocomplete="off"` | A |
| 014 | P03 | DONE link | 481–484 | Link | — | Unchanged | I |
| 015 | P03 | Email team stepper | 316–340, 512–518 | Stepper (1.10) | 03 | IdntyStepper extraction | A (Board 07) |
| 016 | P03 | Professional email (locked) | 494–507 | Service row (1.6) | 03 | Locked (ink check) | L |
| 017 | P03 | Device setup | 534–543 | Service row (1.6) | 03 | Row locked; chosen mark System B | L · A (FD-3) |
| 018 | P03 | Email migration | 545–568 | Service row (1.6) | 03 | Row locked; chosen mark System B | L · A (FD-3) |
| 019 | P03 | Migration provider | 561–568 | Field (1.1) | 02 | `autocomplete="off"` | A |
| 020 | P03 | Additional services ×4 | 344–354, ~580+ | Service row (1.6) | 03 | Row locked; chosen mark System B | L · A (FD-3) |
| 021 | P03 | VIEW MY RECOMMENDATION | submit | CTA / blocked (§4) | 04 | Implemented behaviour preserved; section summary rejected | I (FD-5) · R (summary) |
| 022 | P03 | Bottom sheet | `DfSheet` | Overlay (1.12) | 07 | Square red-edge skin; behaviour kept | A (FD-6) |
| 023 | P04 | Add-on toggle | `Recommendation.tsx` 69–76 | Add-on (1.9) | 03 | The single control; System B mark | A (FD-3) |
| **024** | P04 | Add-on decorative check | 100–109 | Add-on (1.9) | 03 | **Removed as a button**; becomes an `aria-hidden` span | A (FD-3 retained proposal) |
| 025 | P04 | Add-on stepper | 90–97 | Stepper (1.10) | 03 | IdntyStepper | A (Board 07) |
| 026 | P04 | CONTINUE TO REVIEW | — | CTA (1.14) | 04 | Unchanged (busy `UPDATING YOUR QUOTE…`) | I |
| 027 | P05 | Disclosure acks | `CheckoutActivation.tsx` 347–360 | Checkbox (1.7) | 03, 04 | System B marks, legend count, focus ring; invalid trigger open | A (FD-3) · U-8 |
| 028 | P05 | Spec row sheet trigger | `SpecRow` | Overlay trigger | — | Unchanged | I |
| 029 | P05 | Accept / Pay | — | CTA, gated (§4) | 04 | Disabled gate preserved; counter line rejected; Stripe untouched | I (FD-5) · R (counter) |
| 030 | P05 | Scope sheets | `DfBottomSheet` | Overlay (1.12) | 07 | Square red-edge skin; peek kept | A (FD-6) |
| 031 | P06 | Payment verification | `FoundationClient.tsx` | Feedback (§5.2) | 05 | Ladder level 03/04 copy kept | I |
| 032 | P06 | Portal entry CTA | `P06Activation` | CTA | — | Unchanged | I |
| 033 | Portal | Action notes | `ProjectPortal.tsx` 228–230 | Textarea (1.3) | 02 | Field shell plus `OPTIONAL` tag | A (Board 07) |
| 034 | Portal | Approve / request / submit | 232–235 | CTA | — | Unchanged | I |
| 035 | Portal | Record filter chips | 324–329 | Tabs (1.11) | 03 | **NF-02**: CSS written from scratch; roving focus | A (FD-3 retained proposal) |
| **036** | Portal | Communication preferences | 414–428 | Checkbox (1.8) | 03 | System B rows; the native box goes; payload unchanged | **A (FD-3)** |
| 037 | Portal | SAVE PREFERENCES | 431 | CTA plus toast (§5.3) | 05 | Success toast only after the save resolves | I · toast copy U-2 |
| 038 | Complete | Configure / save | `DigitalFoundationCompleteSurface.tsx` 72–79 | Completion (1.16) | 07 | DfButton plus ink done marks; composition preserved | **A (FD-4)** · copy U-9 |
| 039 | Admin | Test email | `FoundationReadinessPage.tsx` 306 | Admin (1.15) | — | Deferred | U-5 |
| 040 | Admin | Display name | 312 | Admin (1.15) | — | Deferred | U-5 |
| 041 | Admin | Send approval checkbox | 405 | Admin (1.15) | — | Deferred | U-5 |
| 042 | Admin | Journey buttons | 315–420 | Admin (1.15) | — | Out of scope (audit) | — |
| 043 | LIB | `DfSelect` | `components.tsx` 252–464 | Selector (1.4) | 01A, 01B | Territory A engine (desktop); C-1 collision fix | A (FD-1) |
| 044 | LIB | `DfCheckbox` / `DfRadio` / `DfToggle` | 497–586 | Checkbox, radio, toggle | 03 | Checkbox = System B; radio kept; toggle unused (U-3); unchecked edge NF-06 | A (FD-3) · U-3 |
| 045 | LIB | `DfModal` / `DfPopover` / `DfTooltip` | — | Overlay | 07 | Square red-edge skin for the modal | A (FD-6) |
| 046 | LIB | `DfToastProvider` | — | Feedback (§5) | 05 | Usage rule | I · copy U-2 |
| 047 | Checkout | Stripe | `api.ts` `start-checkout` | External (1.17) | — | No change promised | — |
| 048 | System | Invalid / unavailable panels | `FoundationClient.tsx` | Feedback (§5.2) | 05 | Kept | I |
| 049 | System | TRY AGAIN | 171 | Feedback (§5.2) | 05 | Kept | I |
| 050 | Review | Static P02/P03 demos | `DigitalFoundationReviewPage.tsx` | QA route | — | Used for this sprint's captures | — |
| 051 | All | Progress / menu drawer | `shell.tsx`, `DfProgress` | Progression (§4) | 04 | Drawer, rail and DfProgress preserved; index strip rejected | L · I (FD-5) · R (strip) |
| 052 | All | Header menu button | `shell.tsx` | — | — | Unchanged | I |

**Status key (OPUS2):**
- **A:** founder-approved (FD-n, or Board 07's approved treatments)
- **L:** locked (founder evidence or approval)
- **I:** implemented and kept
- **R:** rejected by the founder; do not implement
- **U-n:** unresolved item (`UNRESOLVED_ITEMS_REGISTER.md`)
