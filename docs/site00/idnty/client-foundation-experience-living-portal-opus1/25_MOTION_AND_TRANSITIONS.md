# 25 — Motion and Transitions

Motion is functional only. Everything respects `prefers-reduced-motion: reduce`, which makes all transitions instant. The specimens apply this globally (`cf.css`).

| Token | Value | Use |
|---|---|---|
| `--cf-ease` | `cubic-bezier(.2,.7,.2,1)` | all |
| `--cf-t-press` | 120ms | CTA background / 1px press (existing `.df-cta`) |
| `--cf-t-sheet` | 180ms | sheet / drawer translate + scrim fade |
| `--cf-t-toast` | 160ms | toast fade/slide 8px |
| `--cf-t-view` | 0 | view changes: no page transitions; scroll to top; focus to h1 |

## Never animated

Stage strip, ticks, workstream chips, "status as of", the roadmap connector and totals. **Progress is never animated, because animation implies activity the client cannot verify.** There are no skeleton shimmers after first load. The single loading treatment is the existing `DfLoading`, and busy buttons say what they are doing ("OPENING STRIPE…", "CHECKING…").

## Reduced motion

Sheets appear in place, the drawer appears without a slide, and toasts appear without a slide. Smooth scrolling to anchors (`scrollIntoView({behavior:'smooth'})`, which exists) becomes `auto`.
