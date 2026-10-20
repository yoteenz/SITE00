# 07 — Tunnel repin result

Filled after repin command (see sprint close for final SHA).

```bash
bash .cursor/scripts/serve-site00-preview-from-pin-ref.sh cursor/founder-workspace-opus-recovery2-review-be3b
bash .cursor/scripts/restart-site00-preview-tunnel.sh
cat /tmp/site00-preview-runtime-lineage.txt
```

**Pass criteria:** `PREVIEW_SHA` equals review branch head; `curl` to `:5174` returns HTML with `/src/main.tsx?v=dev-local`; public tunnel returns HTTP 200 HTML (not 502).

See [08_PUBLIC_ROUTE_SMOKE_TEST.md](./08_PUBLIC_ROUTE_SMOKE_TEST.md) for route-level checks.
