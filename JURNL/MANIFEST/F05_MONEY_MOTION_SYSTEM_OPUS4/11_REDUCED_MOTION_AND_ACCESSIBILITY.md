# 11 · REDUCED MOTION AND ACCESSIBILITY

## Reduced motion (`prefers-reduced-motion: reduce`)

| Part | Behaviour | Where |
|---|---|---|
| director | mode OFF: no ambient grant, `play()` refuses every response, running responses are cancelled when the preference turns on | `director.ts setReduced` |
| ambient | animations removed **and** layers forced to opacity 0 | `jurnl-motion.css` reduce block |
| overlay entrance / note entrance / popover backdrop | none | reduce block; existing `.jed-folio` rule |
| closing copy | never made (the observer checks `reduced`), and hidden if any exists | `overlayMotion.ts`, reduce block |
| carousel | collection changes at once, the drag does not translate, no settle transition (unchanged behaviour, plus guards) | `useMoneyCarousel` (`reduced`), reduce block |
| press transitions (DOT 01 strips, cards, reorder, directory actions, VIEW ALL) | state changes at once, no travel | reduce block (gap closed in OPUS4) |
| warning seal / material responses | none | the seal animation lives in the no-preference block; `play()` refuses |

Proof:
- E2E R1: OFF, no ambience after the entrance period, no running animation, the menu opens without animation, no copy on close, a swipe changes the collection.
- Existing suites: motion pilot 14, carousel 22, DOT 01 reduced motion.
- Recording P05.

## Accessibility

- Closing copies are `inert` and `aria-hidden`, with no roles, labels or ids. Screen readers and `getByRole` never see them. They take no pointer events (E2E O1: `takesTap: false`).
- Focus restoration is unchanged: it returns to the trigger (E2E O1), and the note returns focus to its pocket.
- The ambient layers are `aria-hidden`, take no taps, and sit under live type in document order (they have no z-index).
- Financial figures and text never animate after the entrance. E2E A1 shows nothing but the two ambient layers running at rest, and E2E F1/F3 show the figures carry no animation during feedback.
- No flashing: the ambient light peaks at opacity 0.16 once per 18 s, and the sheen crosses the seal once per 14 s.
- Inputs respond immediately. No motion delays a control, and decorative motion never blocks a tap: the light, sheen and copies are all `pointer-events: none`.
- Polite announcements (`aria-live`) for the carousel are unchanged.
