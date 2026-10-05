# OPUS_DESIGN_EXECUTION_PROTOCOL_V1

**Phase 1 of `P0.VR.OPUS-NATIVE1`.**
Canonical text: `shared/site00-opus-native/protocol.ts`
Version: `opus-design-execution-protocol-v1`

The protocol is the observable methodology that produced SITE 00's successful
visual reconstructions, written down so the native runtime can enforce it
rather than hope for it. It is the first and largest block of every compiled
context, and it carries the prompt cache breakpoint.

It records **operational method only**. No attempt was made to describe,
extract or reconstruct private model reasoning.

## How it was reconstructed

The sprint asked for a forensic account of what the successful Opus process
actually did. Chat transcripts are not evidence — they are a record of what was
said, not what happened. So the protocol was reconstructed from the artifacts
those sprints committed, which are:

| Evidence | What it shows |
|---|---|
| `scripts/design-bench/opus-direct/audit.mjs` | Pixel-level diffing against the golden, region-banded, tracked across iterations |
| `scripts/design-bench/opus-direct/rows.mjs`, `crop.mjs` | Element box measurement and ink-span probes — geometry measured, not estimated |
| `scripts/design-bench/opus-direct/viewmode-qa.mjs` | Functional and geometric QA driven through a real browser |
| `tests/p0vrDesignBenchOpusDirect.test.ts` | Guards added alongside behaviour changes, updated rather than deleted when intent changed |
| `motherboard/MEMORY.md` | Per-sprint root causes and corrections, including the failures |
| `docs/design-workspace/` | The authority order and the vocabulary discipline |

Seven shipped sprints form the lineage: `OPUS-DIRECT1`, `OPUS-DIRECT1R1`,
`OPUS-DIRECT1R2`, `OPUS-VIEWMODE1`, `OPUS-LIST-REFINE1`, `OPUS-VIEWMODE1R1` and
`OPUS-INTERACTION-CONTRACT1`.

## The fourteen rules

| § | Rule | The failure it prevents |
|---|---|---|
| 0 | Know where you are in SITE 00 → PROJECT → DESIGN → page | Context-free edits that ignore project canon |
| 1 | Authority order: architecture over reference over appearance | Inventing product behaviour from a picture |
| 2 | Inspect reference and source before any edit | Editing from memory of the golden |
| 3 | Map discrepancies in measurable terms first | "Spacing feels off" as an actionable instruction |
| 4 | Parent geometry before child geometry | A child nudged to hide a wrong parent |
| 5 | Measure typography; check contrast before adding weight | Indiscriminate bolding for a contrast problem |
| 6 | Redraw icons; route borders through the hierarchy | Substituted glyphs and ad-hoc greys |
| 7 | Never use the reference bitmap as page content | A "reconstruction" that is a screenshot |
| 8 | Render and screenshot; never certify from code | Code that reads right and renders wrong |
| 9 | Compare quantitatively, track across iterations | Movement mistaken for improvement |
| 10 | One discrepancy per loop; stop on convergence | Uninterpretable measurements, runaway spend |
| 11 | Run the existing guards; update, never delete | A green screenshot with a red test |
| 12 | Treat declared firewalls as hard constraints | Collateral damage to converged surfaces |
| 13 | Stop at the founder boundary | An agent marking its own work approved |
| 14 | Report honestly; state what was not verified | Claimed visual results nobody looked at |

Several of these are written the way they are because a specific sprint got
them wrong first. §4 comes from `OPUS-DIRECT1R1`, where child elements had been
positioned to compensate for an invented rounded page frame. §5 comes from
`OPUS-DIRECT1R2`, which found that apparent weight problems were contrast
problems. §8 and §9 come from the whole lineage: every sprint that converged
did so by rendering and measuring, and the audit harness exists because
eyeballing did not work.

## How the runtime enforces it

Writing a protocol into a prompt is necessary but not sufficient, so the parts
that can be made structural are:

| Rule | Structural enforcement |
|---|---|
| §7 asset boundary, §12 firewalls | Per-surface write allowlist in the tool layer; violations refused and recorded |
| §8 render before certifying | `capture_screenshot` returns the image to the model; a preview failure is reported to it explicitly rather than passed over |
| §9 quantitative comparison | `compare_screenshot` returns overall and per-band changed-pixel percentages |
| §10 stop on budget | Per-mode iteration and spend ceilings, checked before every dispatch |
| §11 run the guards | `run_typecheck` and `run_targeted_tests` as first-class tools |
| §13 founder boundary | Terminal state is `WAITING_FOR_FOUNDER_REVIEW`; the runtime has no code path that approves |

The rules that cannot be made structural — §1 authority order, §3 discrepancy
mapping, §14 honest reporting — remain prompt policy, and the review package
exists so the founder can check them.

## Changing it

The protocol text is hashed. The hash is recorded on every cost receipt, so a
prompt-cache miss can always be explained by pointing at a protocol change
rather than guessed at. Editing the text invalidates every warm cache, so it
should be edited deliberately and versioned when it changes materially.
