# JURNL F02 SETUP — OPUS final audit evidence

| File | What |
| --- | --- |
| `F02_FINAL_AUDIT_QA.json` | `scripts/jurnl/f02-final-audit-qa.mjs` on this branch. 63/63 route × viewport checks; 18/18 journey steps; 12/12 icons. |
| `F02_BEFORE_AUDIT_QA.json` | The same QA on the untouched `main` code. 19/63 route checks. The journey cascades after the first new check, so use it for route geometry and contrast only. |
| `captures/` | 21 routes, states and overlays × 393×852 / 834×1194 / 1440×900, from the real runtime route. `CAPTURE_METRICS.json` holds the layout facts. |
| `compare/` | Before / after contact sheets per viewport, plus mobile states and overlays. |

Re-run with the dev server on :5174:

```bash
node scripts/jurnl/capture-f02.mjs http://127.0.0.1:5174 artifacts/jurnl-f02-opus-audit/captures
node scripts/jurnl/f02-final-audit-qa.mjs http://127.0.0.1:5174 artifacts/jurnl-f02-opus-audit/F02_FINAL_AUDIT_QA.json
```

The decisions are in `src/projects/jurnl/families/F02_SETUP/HANDOFF/F02_OPUS_ARCHITECTURE_DECISIONS.md`. The maps are in `src/projects/jurnl/families/F02_SETUP/MANIFEST/F02_*`.
