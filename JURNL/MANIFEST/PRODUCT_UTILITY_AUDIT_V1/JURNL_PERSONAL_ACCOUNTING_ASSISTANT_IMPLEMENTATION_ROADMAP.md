# JURNL personal accounting assistant — implementation roadmap

**Audit-only.** No implementation authorized here.

## P0 count: 8 · P1: 7 · P2: 5

### Sprint A — Canonical recurring obligations & subscriptions (P0)

- **Objective:** Subscriptions as first-class F07 obligations with dedicated panel  
- **Preserve:** `JurnlObligation`, `projectUpcoming`, repository API  
- **Scope:** kind selector, renewal date on create, filter SUBSCRIPTIONS, monthly equivalent header  
- **Stop if:** doubles STS without funding model agreement  

### Sprint B — Bill funding & reservation coordination (P0)

- **Objective:** Funded / remaining / add money per obligation  
- **Preserve:** `computeSafeToSpend` single formula owner (F09)  
- **Data:** `funded_amount` or plan `linked_obligation_id` + STS net upcoming  
- **Tests:** FIN-13 regression suite  

### Sprint C — Upcoming payments & TODAY operating flow (P0)

- **Objective:** TODAY shows next commitments + funding facts; reduce family hopping  
- **Visual:** FUNCTIONAL_LAYOUT_REFINEMENT_REQUIRED on F03 only  
- **Language:** F03/F07 task strings from copy matrix  

### Sprint D — Cross-family actions & task fluidity (P1)

- Quick Add → subscription/bill  
- Mark paid → F04 ledger  
- Edit due date on obligation  

### Sprint E — Plain-language convergence (P1)

- Roll functional replacements hub-by-hub  
- Keep tagline + approved editorial in secondary tier  

### Sprint F — Assistive intelligence (P2)

- FACT/CALCULATION cards per proactive blueprint  
- No new chatbot primary UX  

### Sprint G — Full integrity & UX acceptance (P1)

- Replay journey E2E suite on preview build  
- Close DEF-001–005  

**Next recommended sprint:** **Sprint B** (funding + STS math) depends on A schema tweaks — **start Sprint A** if parallel UI; **B before STS copy claims “set aside”.**
