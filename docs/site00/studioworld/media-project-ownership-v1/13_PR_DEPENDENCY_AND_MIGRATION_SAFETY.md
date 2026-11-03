# 13 — PR dependency and migration safety

Related open PRs (#1690–#1699) **not merged** by this sprint.

| PR | Relationship |
| --- | --- |
| #1697 production spine | Overlaps managed registry + switcher — **compatible**; this branch ports minimal spine flags without spine JSON bulk |
| #1692 directorial engine | Fiction tooling; independent |
| #1693 living-world audit | Read-only audit data |

Baseline: `origin/main`. No automatic merges. No Supabase org migration executed (production UUID documented in `orgRegistry.ts`).
