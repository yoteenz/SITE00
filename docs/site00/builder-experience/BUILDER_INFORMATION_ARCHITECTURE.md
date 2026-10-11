# Builder information architecture

Sprint `P0.SITE00.BUILDER.TEMPLATE-AND-ESTIMATE-SELECTION-EXPERIENCE1`. Contract code: `src/site00/builder-experience/` (not routed yet).

> **TEMPLATES PROVIDE GRAMMAR, NOT IDENTITY.**
> Reusable structural grammar + reusable visual grammar + the client's brand DNA = a unique digital location.

## 1. The decision: four rooms and a reveal, not twelve screens

The sprint lists twelve decisions (01 BUILD to 12 ESTIMATE). Twelve screens in a row would read as a tax form. Most clients cannot answer most of them in words anyway.

The decisions fall into four questions a client already understands. Each question is one **room**. The Blueprint and the Estimate are one **reveal**.

| Room | The client's question | Decisions inside | Screens (Simple / Advanced) |
|---|---|---|---|
| **I · THE PLACE** | What am I making, and how does it behave? | 01 BUILD · 02 STRUCTURE (or WORLD FORM) | 2 / 2–3 |
| **II · THE FEEL** | How should it look, sound and move? | BRAND readiness · 03 EXPRESSION · 04 TYPE · 05 COLOR · 06 IMAGE WORLD · 07 MOTION | 2 / 6 |
| **III · THE WORK** | What does it need to do? | 08 FEATURES · 09 FAMILIES | 2 / 2 |
| **IV · THE PACE** | How soon? | 10 DELIVERY | 1 / 1 |
| **REVEAL** | What have we made? | 11 BLUEPRINT · 12 ESTIMATE | 1 (two states) |

TYPE, COLOR, IMAGE WORLD and MOTION are **tuning layers** on the chosen expression. Every expression system brings defaults for all four, so a Simple client accepts them and never sees four extra screens. An Advanced or Custom client opens them in place. `builderSteps()` returns the primary steps and the optional tuning steps; this is the progressive disclosure rule in code.

BRAND comes first in Room II. The Visual Authority Development Gate loads brand DNA before anything visual, and brand readiness decides whether "your brand colours" is offered at all. A client without a brand is routed to IDNTY as its own project. That project is never folded into the site range.

## 2. The persistent element: the Blueprint sheet

Progress is not a stepper. It is a technical drawing that fills in as the client chooses.

```
┌──────────────────────── PROJECT BLUEPRINT ─────────────────────────┐
│ BUILD TYPE ........ SITE                                        ● │
│ STRUCTURE ......... SERVICE                                     ● │
│ VISUAL SYSTEM ..... ARCHITECTURAL MINIMAL · ESSENTIAL           ● │
│ TYPOGRAPHY ........ modern grotesk (from system)                ○ │
│ COLOR ............. neutral architectural (from system)         ○ │
│ FEATURES .......... EDIT IT YOURSELF                            ● │
│ EXPERIENCES ....... front door · services · proof               ◐ │
│ DELIVERY .......... — not chosen                                ┄ │
│ ───────────────────────────────────────────────────────────────── │
│ SCOPE  ▮▯▯▯  LIGHT · a focused build              SIMPLE BUILD     │
└────────────────────────────────────────────────────────────────────┘
```

It answers the four progress questions directly:

| Question | Sheet behavior |
|---|---|
| WHERE AM I | The current room's lines are highlighted. The room name sits above the sheet. |
| WHAT HAVE I CHOSEN | Filled lines (●). Lines inherited from the expression say "from system" (○). |
| WHAT REMAINS | Dotted lines (┄) marked NOT CHOSEN. Open decisions (NEEDS_DECISION notices) sit at the top in the accent colour. |
| HOW CHANGES AFFECT SCOPE | The scope meter (LIGHT · MODERATE · DEEP · EXPANSIVE) and the build level. When a choice moves either, the line that caused it pulses once and a one-line note appears. |

Example notes, from `scopeImpact()` and `builderNotices()`:
- "+ BOOKING · scope stays LIGHT"
- "+ MEMBERSHIP · comes with ACCOUNTS · moves to ADVANCED BUILD"

Every line is tappable and returns to that decision. Editing is never forced to be linear.

**Placement:**
- **Desktop:** the sheet is the right-hand column.
- **Mobile:** it is a 56px strip pinned to the bottom (`BLUEPRINT · 5 / 9 · LIGHT`). Dragging the strip up opens the full sheet.

There are no money figures and no dates on the sheet until the reveal (see `BUILDER_BLUEPRINT_AND_ESTIMATE.md` §4).

## 3. Selection primitives (used in every room)

| Primitive | What it does | Rule |
|---|---|---|
| **STAGE** | Shows one option large: a structure schematic, an expression specimen, or a world map. | Never a fake screenshot. Registry preview slots are `null` until an approved authority exists; then the real preview replaces the schematic. |
| **RAIL** | All options in the room, small and scannable. On mobile it is a filmstrip; on desktop, a column. | The last card in every rail is **NONE OF THESE · BUILD SOMETHING CUSTOM**. |
| **PREVIEW** | Toggles the stage between PHONE, DESKTOP and SPACE. SPACE is shown only for world forms and spatial expressions. | Slots are ready for real assets. An empty slot says "PREVIEW IN DEVELOPMENT" and keeps the schematic. It never shows stand-in imagery that could be mistaken for SITE 00 work. |
| **COMPARE** | Pins options side by side with the **same content** in each, so only the dimension being chosen changes. | Two options on mobile (a split with a drag divider), three on desktop. |
| **KEEP** | Saves an option to a shortlist on the sheet. | Unlimited. Keeping something has no scope effect. |
| **ADD AS INFLUENCE** | Makes a second expression the secondary influence. | One secondary by default. A second one prompts "this becomes a custom direction". |
| **I LIKE PARTS OF THIS** | Facet chips on any expression: COMPOSITION · TYPE · COLOR · IMAGE · MATERIAL · MOTION. | One facet is a note for the creative team (no scope change). Two or more facets from one system count as an influence. Three systems in total is a custom direction. |
| **NONE OF THESE** | Routes to CUSTOM CREATIVE DIRECTION. | Framed as a direction, not a failure (see the journey doc). |

These primitives exist because clients often cannot say what they want, but they can react to what they see. The Builder records reactions (keeps, liked parts, compares) as Blueprint notes for the creative team. The three creative directions SITE 00 later develops (the Visual Authority Development Gate's three territories) start from those reactions.

## 4. Information hierarchy per screen

Every selection screen uses the same hierarchy, top to bottom on mobile and left to right on desktop:

1. **Room and question.** For example: `II · THE FEEL / HOW SHOULD IT FEEL?`
2. **Stage.** The option, large.
3. **What it means.** Three to five facts in client words. For a structure: behaviour, navigation, ideal for, composition logic, scope hint. For an expression: feels, composition, type, imagery, material, motion.
4. **Actions.** CHOOSE · KEEP · COMPARE · I LIKE PARTS OF THIS.
5. **Rail.** The other options, with NONE OF THESE last.
6. **Sheet.** The Blueprint strip or column.

## 5. Responsive behavior

| | Phone (360–430) | Tablet (768–1024) | Desktop (≥ 1200) |
|---|---|---|---|
| **Layout** | One decision per screen; the stage takes about 60% of the height. | Stage on top, rail below, sheet as a side drawer. | Three columns: rail (about 280px) · stage · sheet (about 340px). |
| **Rail** | Horizontal filmstrip with snap scrolling. | Horizontal, two rows. | Vertical list with small schematics. |
| **Compare** | A/B split over the same content with a drag divider, plus an A \| B toggle. | Two side by side. | Up to three side by side. |
| **Blueprint** | 56px bottom strip, drag up for the full sheet. | Drawer, open by default at the reveal. | Always visible. |
| **Primary action** | Thumb zone, bottom right. | Below the stage. | Under the "what it means" text. |
| **World preview** | Map schematic; SPACE preview full-bleed when an asset exists. | Same. | Stage switches to the spatial slot. |
| **Estimate reveal** | One column: window, investment, then sections that open on tap. | Two columns. | Blueprint and Estimate side by side. |

Two rules hold at every width:
- **Reduced motion.** With `prefers-reduced-motion`, every motion demo becomes a still frame with a one-line caption describing the movement.
- **Accessibility.** Every visual option carries its words (behaviour, feels, plain description) as real text, so a screen-reader user can choose without the visual stage.

## 6. Superseded

These patterns are superseded and are not to be extended:

- **Long BLDR questionnaires.** The SITE / WORLD / ENTERPRISE intake phases in `config/bldr-intake-phases.ts` and `config/bldr-assessment.ts` are superseded as the primary path. They can stay as a "describe it instead" fallback.
- **The generic template list at `/bldr/templates`** (`BldrTemplatesPage`, with search, category tabs and "VIEW TEMPLATE") is superseded. It is a template marketplace, and SITE 00 is not Squarespace.
- **Page-count pricing and fixed quote cards disconnected from scope.**
- **"Describe your dream website" prompts as the main input.**

The implementation sprint replaces them. Nothing was changed in this sprint.
