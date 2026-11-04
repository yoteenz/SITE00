# 01 · Tunnel and source verification

Sprint `P0.JURNL.F05-MONEY.DOT01.INTERACTIVE-SURFACES-AND-OVERLAY-AUTHORITY-CONVERGENCE.OPUS1` (addendum) · branch `claude/jurnl-f05-money-motion-pilot-um0u93` · `f23032ac` → `be8718b7` · draft PR #1707 · not merged, not deployed, no database touched, no image generated.

| Item | Finding | Evidence |
|---|---|---|
| Current Opus branch / SHA | `claude/jurnl-f05-money-motion-pilot-um0u93` @ `f23032ac` at start | `git ls-remote` |
| Tunnel source (documented) | `origin/preview/tunnel` = `main` `e413590e`, served by `serve-site00-preview-from-main.sh` from `/tmp/site00-preview-main` | `AGENTS.md`, `git ls-remote` |
| Does that source contain DOT 01? | **no** (no `dot01/` in `main`) | `git ls-tree` |
| Active tunnel URL / served bundle | **not reachable from this container** | — |
| Service worker | none registered by the JURNL runtime for these routes (no `navigator.serviceWorker.register` in `src/projects/jurnl`) | grep |
| Native controls in the current runtime | **yes**: 6 `<select>` (shared `SelectInput` × 13 uses + 5 history filters) and 6 `<input type="date">` | grep at `f23032ac` |

**Classification of the founder's screenshots: C + (likely) A.** The Record Transaction screen with SCAN RECEIPT / MANUAL ENTRY and the Mediterranean collage exists only on the DOT 01 heads (#1707 and the integration branch). Its category menu was a native `<select>`: on iOS the platform draws a translucent menu in system type over the page — exactly the described "translucent selection surface floating over the collage". So the component was current; its open state was the browser's. The founder's screenshots themselves were not attached to this session, so the exact build they show is unverified.

Fixed regardless of the build: no native select or date popup remains in DOT 01 (`be8718b7`).
