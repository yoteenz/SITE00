# 18 · Composer follow-on implementation handoff

Order after founder approval. Each step is one page, with the same method as doc 16:

| Step | Page | Authority source | Primitives to reuse | Data |
| --- | --- | --- | --- | --- |
| 1 | Foundations registry + inspector | OPUS2 `ws-pages foundations()`, `clientInspector()` | `.reg` (already used by the Overview), `.reg-toolbar`, `.ws-tabs`, `.ws-search`, `.ws-insp` | list + pipeline + detail |
| 2 | Client record | `record()` | `.ws-journey`, `.rec-head`, `.ws-kv` | detail |
| 3 | Reviews workbench | `reviews()` | `.q-item`, `.ws-focus` | pipeline |
| 4 | Operations | `operations()` | `.task`, `.stages` | operations API |
| 5 | Correspondence | `correspondence()` | `.con__r`, thread | messaging API |
| 6 | System + Test Lab | `system()`, `testlab()` | status rows | readiness API |
| 7 | Overlay host | `ws-overlays.js ov()` | `.ws-ov[data-m/t/d]` | — |
| 8 | Referrals (OPUS3) | `rf.css`, `rf-kit`, `rf-pages`, `rf-overlays` | port `rf.css` scoped like `ifw-authority.css` | referral APIs + policy config |

**Rules:**
- Never restyle authority classes ad hoc.
- Capture each page at 390 / 834 / 1194 / 1440 / 1920 against the authority specimen before declaring done.
- Keep the 40 overlay ids and the referral guardrails.
- Do not touch intake, payments or schema.
