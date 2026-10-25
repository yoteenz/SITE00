# 07 — Studio World context switching

`shared/site00-production-graph/projectScope.ts` unchanged: project slug in path or `?project=` determines active records.

Switch tests:

- `/production/the-exchange/expression` ↔ `/production/ndxbook/expression` preserves tab, drops child state.

No cross-project cast import; global Actor Catalogue unchanged.
