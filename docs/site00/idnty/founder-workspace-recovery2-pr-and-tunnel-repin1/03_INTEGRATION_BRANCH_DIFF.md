# 03 — Integration branch diff

**Integration head before review branch:** `d68038a872643bc156e65e6cd1e9f952893181bf`

**Excluded from Recovery2 PR (already on integration, unrelated to Recovery2):**

- `58b9ef97` — DF menu drawer step states (#1666)
- `c0f16337` — DF intake uppercase (#1667)

**Recovery2 delta (implementation − integration at merge-base):**

- 97 files under `src/site00/admin/founder-workspace` + Recovery2 docs/evidence + `tests/idntyFounderWorkspaceVisualRecovery2.test.ts`
- ~9.5k insertions / ~1.5k deletions vs integration at `d68038a8`

**Review PR file scope check:**

```bash
git diff --stat origin/cursor/idnty-founder-readiness-e2e-be3b..HEAD
```

Only founder-workspace source, Recovery2 doc pack, and workspace test adjustments — no DF client intake files.
