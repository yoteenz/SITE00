# 14 · Motion and transition non-regression

Sprint `P0.JURNL.F05-MONEY.DOT01.ACCOUNTS.PIXEL-FIDELITY-AND-RESPONSIVE-CONVERGENCE.OPUS1` · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

No keyframe, duration or reduced-motion guard was changed. New: the popover rises 160 ms (transform / opacity), inside `prefers-reduced-motion: no-preference`. The probe measures resting positions after motion settles; the E2E reduced-motion and motion-pilot / carousel suites ran on the final code (doc 19).

| Check | Result |
|---|---|
| Carousel + motion pilot E2E | 135 passed · 0 failed · 5 skipped |
| Reduced motion (E2E "no animation runs …") | see doc 19 |
| Overlay entry 260 ms, strip stagger 34 ms, View Transition 420 ms | unchanged (CSS / code untouched) |
| Layout after motion | probe: 0 page scroll, 0 cut, 0 unreachable controls |
