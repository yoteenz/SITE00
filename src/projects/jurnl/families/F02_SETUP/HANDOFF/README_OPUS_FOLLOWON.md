JURNL F02 — SETUP
OPUS FOLLOW-ON

Grok completed the live family. This is one final family-wide structural, responsive, and interaction audit. It is not a rebuild.

Inspect the complete live family. Compare every route to its authority. Test routing, states, interactions, responsiveness, app canvas bounds, and shared component consistency. Identify architectural debt. Fix structural defects. Preserve the successful Grok visual implementation.

Live routes are registered on the JURNL runtime. The design viewport family control is F02 SETUP. The route selector lists all eleven screens. Reference mode uses the authority file on each contract screen, and the state's authority file when a state is selected.

Start here:

- `src/projects/jurnl/families/F02_SETUP/MANIFEST/F02_LIVE_ROUTE_MATRIX.json`
- `src/projects/jurnl/families/F02_SETUP/MANIFEST/F02_IMPLEMENTATION_SOURCE_MAP.json`
- `src/projects/jurnl/data/f02/`
- `src/projects/jurnl/runtime/screens/SetupScreens.tsx`

Audit targets:

- 393 × 852, 834 × 1194, and 1440 × 900. Do not scale the phone.
- The app canvas stays the product stage. JURNL does not fill the SITE 00 host workspace.
- Plates, emblems, and lockups stay on their own layers. Authorities stay reference images.
- A lockup is the only header mark on F02.00 and on validation.
- Square-rounded controls. Uppercase copy, except values the user typed.
- No paywall, upgrade prompt, or pricing UI.
- No F03 product screens. The completion handoff is the existing family-boundary screen at `today`.
- Founder visual approval is still pending.

Do not regenerate art. Do not search OpenArt. Do not replace a mounted plate or floral with a screenshot crop.
