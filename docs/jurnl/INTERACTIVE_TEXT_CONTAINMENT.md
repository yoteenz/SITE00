# JURNL interactive-text containment

This is the global rule for all JURNL user-facing text. Clickable text takes priority: links, inline actions, secondary actions, SKIP / CONNECT / LEARN / SEE WHY labels, and compact navigation.

The machine-readable contract is `typographic_containment` in `JURNL/MANIFEST/JURNL_GLOBAL_COMPOSITION_RULES.json`.

## Rule

- **One line.** A short or medium clickable label (32 characters or fewer) is one compact interactive unit on one line.
- **Compact before wrapping.** Before a label may wrap, try these in order:
  1. a modest size step, at most 1 px;
  2. tracking, down to 0.08 em;
  3. gap;
  4. max-width;
  5. local alignment;
  6. only then, a controlled balanced wrap.
- **Never widen into the environment.** A control never grows into the environment breathing zone to avoid a wrap.
- **The rule fits the words.** Underlines are `text-decoration` on the label, never a box border sized to the container.
- **Readable floor.** Compact fit never takes an interactive label below 10 px. Navigation labels are 10 px.
- **Hit area is separate from type size.** Every control is at least 24 × 24 px. Inline links grow their hit area with `::before`, not with bigger type.

## Implementation

- **`useCompactFit()`** (in `src/projects/jurnl/runtime/components/primitives.tsx`) runs the order above after layout, on font load and on resize. It is used by `JurnlButton`, standalone `JurnlTextLink`, `JurnlChoice` and clickable `JurnlRow`. The `data-jrn-fit` attribute records the strategy it used: `size`, `tracking`, `size-floor` or `controlled-wrap`.
- **F02 head rail** keeps the headline and helper clear of the curtain where it leans furthest left. `useFittedHeadline` in `SetupScreens.tsx` only ever shrinks a headline line that would not fit, and never below 24 px.

## QA

```bash
node scripts/jurnl/interactive-text-qa.mjs http://127.0.0.1:5174 artifacts/jurnl-interactive-text/INTERACTIVE_TEXT_QA.json
```

The audit covers 79 views (F01, F02, F03, F04 and F05–F16 parents, plus their overlays) at 393×852, 834×1194 and 1440×900. For each label it measures:

- single_line_expected and actual_line_count;
- font size and tracking;
- available and single-line width;
- underline width and alignment;
- tap target size;
- controlled wrap;
- fit strategy;
- environment overlap.

Environment overlap uses traced plate edges for F02. For every other family it probes the bare plate for sheer-white pixels just right of each bare label.

**Current result:** 1,134 / 1,134 labels pass. INTERACTIVE_TEXT_CONTAINMENT_DRIFT = 0.
