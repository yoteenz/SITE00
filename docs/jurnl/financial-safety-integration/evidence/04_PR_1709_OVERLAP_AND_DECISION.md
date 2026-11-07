# PR #1709 overlap and decision

**Decision:** PORT (cherry-pick onto integration candidate), do not merge PR #1709 to main in this sprint.

| Check | Result |
|-------|--------|
| A. Already in #1707? | **No** — #1707 lacks `computeF05BoardScale` width-first logic and `jurnl-root-authority.css` F05 viewport-anchoring rules. |
| B. Useful correction? | **Yes** — fixes short-phone clipping / pillarboxing (393×660 class viewports). |
| C. Visual conflict? | **None observed** — adapts Opus Dot01Frame to shared scale helper; conflict resolved in cherry-pick (dock-less Opus hook). |
| D. New scroll/clipping? | **Not in automated tests** — responsive matrix still founder-verify on tunnel. |
| E. Duplicate on integration/jurnl-production-workspace? | **Partial** — integration branch at 7752eae2 includes Composer rail/label commits but not identical to #1709 root-authority fix set until this candidate. |

**Recommendation (FD-02):** Keep PR #1709 open until founder accepts candidate; then close as superseded by integrated cherry-picks.
