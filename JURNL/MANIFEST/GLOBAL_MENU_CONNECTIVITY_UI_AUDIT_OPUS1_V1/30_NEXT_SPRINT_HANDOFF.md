# 30 · Next sprint handoff

## Ready to run without further decisions

1. **Phase A, menu reach restoration (engineering, UI only).** It needs FD-01 / FD-02. Scope is in 05 (smallest safe restoration), 06 and 24.
   * Fixes D-01, D-02, D-03, D-04, D-05 and D-07, plus the currency disclosure (MR-5).
   * Tests: every menu row reaches its owner; return navigation goes to the menu; no page scroll at 393 × 660 and 360 × 780.
2. **Batch B02 authority production (Grok / OpenArt).** GLOBAL MENU (sectioned) · CONNECTED ACCOUNTS & SYNC · NEEDS ATTENTION · IMPORTED HISTORY
   COVERAGE. Four mobile viewports on one board, text-free art, live text regions as in 22. Then B01.

## Blocked

| Work | Blocked on |
|---|---|
| Phase C connection UI build | FIA Phase 0 + FD-05 |
| Phase D ingestion | vendor OD-01, webhook host OD-07, window OD-08 |
| Phases E–F intelligence UX | FIA Phases 3–5; FD-10 for Ask JURNL |

## Documentation placement

This audit lives in `JURNL/MANIFEST/GLOBAL_MENU_CONNECTIVITY_UI_AUDIT_OPUS1_V1/`, on the docs-only branch
`claude/jurnl-menu-connectivity-ui-audit-um0u93`, cut from `main` `e413590e1`. It is a draft documentation PR to `main`, docs only and non-conflicting.
Nothing else is merged, rebased or deployed.

## Files

* 30 deliverables, plus `03_HISTORICAL_MENU_VERSIONS_NOTE.md` and `README.md`.
* Evidence in `evidence/`: a route map, a dependency diagram, F02 and F09 reference contact sheets, and source hashes.

## Return

Return `JURNL_MENU_CONNECTIVITY_UI_AUDIT_COMPACT.zip` (≤ 3.8 MB) through ChatGPT for founder review and for screen-authority production planning.
