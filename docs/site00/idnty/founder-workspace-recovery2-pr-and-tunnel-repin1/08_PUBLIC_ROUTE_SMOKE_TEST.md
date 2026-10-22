# 08 — Public route smoke test

Base: `$SITE00_CLOUD_PREVIEW_ORIGIN` (canonical dev tunnel origin from cloud secrets)

Routes from `src/site00/admin/founder-workspace/config/routes.ts` and app routes:

| Route | Path |
| --- | --- |
| Overview | `/admin/site00/founder-workspace/overview` |
| Foundations | `/admin/site00/founder-workspace/foundations` |
| Reviews | `/admin/site00/founder-workspace/reviews` |
| Operations | `/admin/site00/founder-workspace/operations` |
| Correspondence | `/admin/site00/founder-workspace/correspondence` |
| Referrals | `/admin/site00/founder-workspace/referrals` |
| System (Test lab) | `/admin/site00/founder-workspace/system` |
| Card studio | Tab on Referrals page (same URL + `#card` or in-page tab — no separate route) |
| Client record | `/admin/site00/founder-workspace/foundations/<artifactId>` (requires auth + id) |

**Note:** Unauthenticated requests may redirect to founder login — that is **expected**, not a broken route.

Smoke command template:

```bash
BASE="${SITE00_CLOUD_PREVIEW_ORIGIN:?set from cloud preview URL file}"
for p in overview foundations reviews operations correspondence referrals system; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/admin/site00/founder-workspace/$p")
  echo "$p $code"
done
curl -sS "$BASE/src/main.tsx?v=dev-local" | head -1
curl -sS "$BASE/site00-correspondence-fonts.css" | head -1
```

Results appended in sprint agent run output / gate C.
