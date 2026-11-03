# F05 MONEY parent / motion + overlays

## Visual composition
- Mediterranean editorial collage: classical stone bust, sunlit coastal arch, olive and lemon branches, antique engraving, layered parchment, wax seal, oxblood and deep olive contrast.
- Intentional asymmetry, physical torn edges, tactile print imperfections; not generic fintech cards.
- Live uppercase text except lowercase cursive tagline. Financial numbers remain stable and accessible.

## Entrance (target total 650 ms, never blocks input)
| Phase | Time | Behavior |
|---|---|---|
| Environment | 0–140 ms | SIDEKICK present immediately; minimal exposure/scale settling |
| Foreground | 100–280 ms | statue/branch/seal slight depth translation; no looping sway |
| Title | 160–380 ms | text-free title paper settles, uppercase MONEY + lowercase cursive tagline fade/mask reveal |
| Metrics | 270–470 ms | summary paper rises a few px; values never count up |
| Accounts | 340–610 ms | four separate paper objects settle with stagger ≤50 ms |
| Navigation | 0 ms | global nav **always available**, does not wait for entrance |

## Account selection
- Pointer hover (desktop): 2–3 px elevation, 5–8% shadow increase.
- Pointer/touch press: ≤130 ms tactile compression.
- Selecting a card: raise + shift toward camera 6–10 px, then transition to correct account route.
- Never delay route transition to complete a decorative animation. Use shared-layout transition when available; fallback instant navigation.
- Cash label is two lines `CASH` / `ON HAND`; credit is liability, not available funds.

## Overlay system
- Parent `ADD` global button invokes canonical Quick Add. Do not replace it with MONEY-only action.
- MONEY-local actions open contextual sheets: transfer, add place, usual account preferences.
- Overlay appearance: clipped torn parchment atop dimmed-but-readable environment; tab/focus trap, Escape closes, return focus to trigger.
- Transfer overlay first requires source, destination, amount; movement status must be state-bound to canonical ledger.
- `PENDING` must never increase destination *available* balance. `IN TRANSIT` must reflect confirmed source debit and unconfirmed destination receipt.
- Overlay is allowed its own scroll, page root is not.

## Accessibility and performance
- `prefers-reduced-motion`: instant transitions, no parallax.
- Semantic buttons, visible focus state, contrast sufficient on textured background (use parchment backing behind text).
- Stabilize layout before entrance; avoid shifting tap targets.
- GPU transforms only for animated decorative layers; avoid animation of actual financial totals.
- Use responsive image assets; keep final runtime source text and numbers outside background.

## Stop/go for Opus
Go only when founder approves motion behavior **and** a native-resolution transparent alpha extraction can reproduce the approved page without ugly halos, lost elements, or duplicate printed words. The current preview kit is not proof that the asset extraction method works.
