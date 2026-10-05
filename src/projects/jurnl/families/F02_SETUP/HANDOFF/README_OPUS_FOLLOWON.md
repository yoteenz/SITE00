JURNL F02 — SETUP
OPUS FOLLOW-ON NOTE

Read this after Sonnet has implemented the structural skeleton. This is a handoff note, not an Opus sprint.

Sonnet owns routes, forms, inputs, buttons, progress, states, and interaction triggers, using the mounted plates and header assets. The authorities in `AUTHORITIES/` are visual targets. They are not runtime images.

After Sonnet, Opus must:

- Audit the Sonnet implementation against `MANIFEST/F02_IMPLEMENTATION_SOURCE_MAP.json` and the authorities.
- Preserve working routes and data flow.
- Refine component architecture.
- Refine interactions.
- Refine responsive behavior at 393×852, 834×1194, and 1440×900 without scaling the phone screen.
- Refine viewport fit inside the app canvas. Live content stays inside the stage unless a screen is explicitly scrollable.
- Compare the live screens with the F02 authorities.
- Prepare the tree for a Grok final visual pass. Do not regenerate art in that audit.

Leave these constraints in place:

- Family name SETUP. Family id `F02_SETUP`.
- User-facing copy stays uppercase, except values the user typed.
- Square-rounded controls only.
- No paywall, upgrade prompt, or pricing UI.
- No F01 edits.
- Do not replace a mounted plate or floral with a screenshot crop.
- Founder visual approval is still pending until a later review says otherwise.

Start file for the sources: `HANDOFF/SONNET_START_HERE.txt`.
