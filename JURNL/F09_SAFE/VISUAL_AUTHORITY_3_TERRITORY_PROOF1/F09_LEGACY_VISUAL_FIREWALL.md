# F09 SAFE TO SPEND — Legacy Visual Firewall

**Result: `LEGACY_VISUAL_LEAK = 0`.** The gate's `checkLegacyUse` over the declared uses returns `LEGACY_STATUS_KNOWN` with 0 leaks. Source data: `shared/studioos-visual-authority/projects/jurnl/f09-safe-to-spend.ts`, `JURNL_F09_LEGACY_SURFACES` and `JURNL_F09_LEGACY_USES`.

## How the firewall was enforced

1. **Isolated forensic read.** The current F09 screens were read by a separate agent. It was told to report function only: routes, states, actions, values, dependencies, copy strings, accessibility and tests. It was told never to report layout, geometry, ordering of blocks, sizes, styling, imagery or metaphor. The territory author received only that report and never opened `SafeToSpendScreens.tsx`, the F09 CSS, or any F09 screenshot or plate.
2. **No legacy images opened.** No legacy F09 image was opened: not the ENV.LOGGIA plate, not the F09.00 parent authority, and none of the refinement screenshots.
3. **Legacy composition as a negative check only.** The previous F09 composition was met as text during source discovery: the refinement-2 *family composition map* and archetype library. It was classified as legacy and used only to check that no territory converges on it.
4. **Global contracts declared as such.** CENTER_STAGE, the nav and the chrome are used because the sprint preserves them. They are declared in the data as `PARTIAL_AUTHORITY` with the founder's sprint text as the decision and only `NAV_VISUALS` and `GEOMETRY` promoted. They are not F09 legacy.

## Surfaces inspected and their class

| Surface | Route | Class | How it was read |
|---|---|---|---|
| `JURNL.LEGACY.F09.HUB` (`SafeToSpendScreens.tsx`) | `safe` (F09.00) | FUNCTIONAL_REFERENCE_ONLY | Firewalled agent, function only |
| `JURNL.LEGACY.F09.WHY` | `safe/why` | FUNCTIONAL_REFERENCE_ONLY | Firewalled agent |
| `JURNL.LEGACY.F09.HOLD` | `safe` hold sheet + confirm | FUNCTIONAL_REFERENCE_ONLY | Firewalled agent |
| `JURNL.LEGACY.F09.PLATE_LOGGIA` (ENV.LOGGIA; F09.00 parent authority) | `safe` | FUNCTIONAL_REFERENCE_ONLY (founder UNREVIEWED, interference FAIL) | Manifest status only. The image was **not opened**. |
| `JURNL.LEGACY.REFINEMENT2.F09_TENSION_THRESHOLD` (`docs/jurnl/refinements/mobile-creative-composition2/`) | `safe` archetype | FUNCTIONAL_REFERENCE_ONLY (not founder-promoted) | JSON text only. Screenshots **not opened**. |
| `JURNL.LEGACY.F03.TODAY_FIGURE` | `today` | FUNCTIONAL_REFERENCE_ONLY | Contract text only: the F03 / F09 distinctness boundary |
| `JURNL.GLOBAL.CENTER_STAGE_NAV_CHROME` | every nav-bearing route | PARTIAL_AUTHORITY, promoted `NAV_VISUALS` and `GEOMETRY` | Contracts: center-stage3 JSON, `ProductNav.tsx`, `FamilyChrome.tsx`, frame tokens |

## Functional facts retained

| Kind | Fact |
|---|---|
| ROUTE | `safe` (F09.00) and `safe/why` (F09.WHY). The hold sheet is local state. |
| STATE | COMPLETE · PARTIAL · UNSTATED · NEEDS_SETUP · NEEDS_ACCOUNT, plus BELOW ZERO and NOTHING HELD. The five state lines are kept verbatim. |
| VALUE | `value`, `cash`, `upcoming`, `protected`, `safetyBuffer`, `assigned`, `goalReserved`, `purchaseReserved`, `tripReserved`, `heldTotal`. All money goes through `formatMoney`. |
| LABEL | Number labels: CLEAR TO SPEND · OVER BY. <br>Summary: HELD BACK {held} OF {cash} CASH. <br>Held-back item labels: BILLS BEFORE NEXT INCOME · PROTECTED · ASSIGNED IN PLAN · SET ASIDE FOR GOALS · RESERVED FOR PURCHASES · RESERVED FOR TRIPS · SAFETY BUFFER. <br>Empty line: NOTHING IS HELD BACK YET … |
| ACTION | SEE THE FULL BREAKDOWN → `safe/why` <br>CHANGE WHAT’S HELD → hold sheet → CONFIRM THE HOLD → SAVE <br>PLAN → `plan` |
| CHROME | BACK TO TODAY (fixed) · JURNL · ACCOUNT (gear) · ASK JURNL (info) |
| NAV | HOME · MONEY · + · PLAN · CREDIT. HOME is current on F09. + is Quick Add (MOVEMENT only on F09). |
| DEPENDENCY | Upstream: F02 · F04 · F05 · F06 · F07 · F08 · F10 · F11 · F14 · settings · Quick Add. <br>Downstream: F03 · F10 · F11 · F15 · Ask. |
| ASK | Consent-gated. Explanation only. Context is value, obligation count, completeness and currency. |
| ACCESSIBILITY | Region label SAFE TO SPEND. Held-back section named WHAT IS HELD BACK. Dialogs trap focus. No live region for number changes (gap). |
| TEST HOOKS | `data-jrn-screen="F09.00"`, `.jrn-home__num` and the `data-jrn-trigger` names. Any future implementation must keep them or move the tests. |
| COPY RULES | Function label → state / task → editorial. No enums. Only real values. Zero bands hidden. |

## Visual facts retained

**From F09 legacy: NONE.**

From preserved global contracts only (not F09 legacy):

| Kind | Retained | Why it is allowed |
|---|---|---|
| Stage geometry | Field = nav footprint (340 on phone) on the + axis. Phone safe insets 59 / 34. Composition edge and nav reserve. | The sprint preserves CENTER_STAGE ("controls geometry, not creative composition"). |
| Navigation | Five equal cells, square-rounded, 44 high, icon over label, active = emerald | The sprint says: "Do not redesign navigation." |
| Chrome | Back · JURNL wordmark · account · ask, as square-rounded icon buttons | Global FamilyChrome, not F09 |
| Control primitives | Radius 8; primary button emerald; inline action = label + fine rule + chevron | Brand DNA / CORE "JURNL control expression" |
| Palette and type | jurnlProject palette and fonts | Brand DNA |

## Proof of no visual inheritance

The legacy F09 composition, as described in refinement-2 text:
- an **arched panel**
- a **horizontal threshold line**, clear to spend above it and held back below
- **hatched held bands**
- a **centred, symmetric figure-over-bands stack**
- an **action pair**, then the editorial line

| Legacy element | T01 THE OPEN FLOOR | T02 THE PLAIN ANSWER | T03 THE OPEN ENVELOPE |
|---|---|---|---|
| Arched panel | none (rectilinear plan drawing, no panel) | none (no panel; type set into the ground) | none (paper objects) |
| Threshold line, clear above / held below | none. Held back *encloses* the clear floor concentrically; it is not stacked against it. | One horizontal proportion rule under the figure: a horizontal ratio, not a vertical clear / held boundary. **Watched as the closest echo** (see below). | none. Open object vs sealed objects. |
| Hatched bands | none (solid poché courses) | none | none |
| Centred symmetric stack | Centred on the axis by CENTER_STAGE, but the hierarchy is concentric (figure inside walls), not stacked bands | Left-aligned reading column (asymmetric) | Open envelope above a sealed row. Hierarchy comes from scale and state, not bands. |
| Action pair + editorial line | One primary breakdown button aligned to the drawn door, inline actions, a legend + caption title block | Full-width primary, inline actions, footnote | Full-width primary, inline actions. Editorial printed on the envelope as its addressee line. |

**Closest echo, recorded honestly: T02's single proportion rule.** The canonical brief asks for *"A single mark"*, and T02 answers it with a single hairline whose solid length is `value ÷ cash`. The legacy used a line too, but as a vertical boundary between clear and held bands inside an arched panel. T02's rule is horizontal and inline in a sentence, and carries no bands. **Not a leak.** It is listed in the T02 risks so the founder can judge it.

## Metaphors not used, and why

| Rejected metaphor | Reason |
|---|---|
| “Decision threshold” / “threshold” | Appears only in the Experience Brain *sample* (non-canonical) and in the refinement-2 legacy composition. Never in a governing F09 contract. |
| “Open loggia” as the page identity | Canonical, but it describes an environment plate (arch and sea on the right). A territory whose identity is a photograph fails the blur test. It survives only as derivation: openness, air, plaster. |
| Safe / strongbox / vault | Forbidden departure `DARK_BANK_VAULT`. |
| Cabinet, object-in-niche, route, descending load, horizon, archive / drawer | Other families' legacy archetypes (F05, F10, F11, F13, F15, F16). Not F09 source truth. |
