# Dependency diagram

```
            ┌──────────── A  restore menu visibility & routing (UI only) ───────────┐
            │                                                                        │
            │   B  design missing authorities (Grok/OpenArt, founder-approved) ──┐   │
            │                                                                   │   │
FIA Phase 0 ┼─► C  provider-agnostic connection UI contracts (mock-free) ◄──────┘   │
(baseline,  │        │                                                               │
 merge order│        ▼                                                               │
 OD-10)     │   D  ingestion integration  ◄── FIA Phase 1–2 + vendor OD-01 + webhook host OD-07
            │        │
            │        ▼
            │   E  classification & rule-management UX ◄── FIA Phase 3–4
            │        │
            │        ▼
            │   F  connect Safe to Spend, currency, privacy, Ask JURNL to the intelligence ◄── FIA Phase 5–6
            │        │
            └──────► G  end-to-end, security, accessibility validation ◄── FIA Phase 7
```