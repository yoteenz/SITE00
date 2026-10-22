# 07 — Tunnel repin result

**Result (2026-10-20 UTC): PASS**

| Field | Value |
| --- | --- |
| PREVIEW_SHA | `a34e3c07a4f4851b1bd60c586885f432b46dd58f` |
| PREVIEW_PIN_REF | `cursor/founder-workspace-opus-recovery2-review-be3b` |
| Worktree | `/tmp/site00-preview-main` |
| Local :5174 | HTTP 200, Vite serves `main.tsx` |
| Public tunnel | HTTP 200 on root + workspace routes + fonts CSS |

Note: pin script logged `FATAL: could not checkout pin ref` from agent repo context; worktree was updated via `git -C /tmp/site00-preview-main checkout -f a34e3c07`.

```bash
bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh cursor/founder-workspace-opus-recovery2-review-be3b
bash .cursor/scripts/restart-site00-preview-tunnel.sh
cat /tmp/site00-preview-runtime-lineage.txt
```

**Pass criteria:** `PREVIEW_SHA` equals review branch head; `curl` to `:5174` returns HTML with `/src/main.tsx?v=dev-local`; public tunnel returns HTTP 200 HTML (not 502).

See [08_PUBLIC_ROUTE_SMOKE_TEST.md](./08_PUBLIC_ROUTE_SMOKE_TEST.md) for route-level checks.
