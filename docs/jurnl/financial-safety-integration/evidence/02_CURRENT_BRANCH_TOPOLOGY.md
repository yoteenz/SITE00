# Current branch topology

| Ref | HEAD SHA | Role |
|-----|----------|------|
| `origin/main` | e413590e1318be18c41e59c598880322c1f10a5c | Production trunk (not merged this sprint) |
| PR #1705 `claude/jurnl-financial-os-unification-um0u93` | c56691ecb8d087cd38190dd1b1fd55d45706e262 | Financial OS unification (draft) |
| PR #1706 `claude/jurnl-financial-os-stabilization-um0u93` | 274d7956a5cef75911a9492c3fb43a00ca02249f | Stabilization stacked on #1705 |
| PR #1707 `claude/jurnl-f05-money-motion-pilot-um0u93` | eaf179bb73614cf8c4c11dd703eeb4ce99021007 | MONEY motion + DOT01 (draft) |
| PR #1708 `cursor/jurnl-founder-entitlements-isolated-v1-4e5a` | 470fc09a136c837189203fe1f5f8977f1fa9a073 | Founder entitlements (isolated) |
| PR #1709 `cursor/jurnl-f05-money-full-bleed-layout-4e5a` | ad7ac17732e3f9a582eb09667de4913979b913f6 | Short-phone full bleed (open, not draft) |
| `integration/jurnl-production-workspace` | 7752eae2fcf0e57df77c76f7e50f1f3ef8235476 | Composer integration overlay (≠ #1707 tip) |

Merge bases (verified):
- #1706 ∩ #1705 = c56691ecb8d087cd38190dd1b1fd55d45706e262
- #1707 ∩ #1706 = 274d7956a5cef75911a9492c3fb43a00ca02249f

**Integration candidate:** `cursor/jurnl-financial-safety-integration-4e5a` extends #1707 with safety + #1709 geometry ports.
