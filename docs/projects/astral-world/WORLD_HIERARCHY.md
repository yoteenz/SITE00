# Astral World — World Hierarchy

**Project:** Astral World  
**Slug:** `astral-world`  
**WORLD formation:** NOT FORMED

---

## Current hierarchy (CLIENT_FOUNDER_TRUTH)

```
Astral World (WORLD — MASTER_PRODUCT_UNIVERSE)
└── Astréa (DISTRICT — FLAGSHIP_DISTRICT)
    ├── Tarot Suite (DESTINATION)
    ├── Astral Mall (DESTINATION)
    └── Coffee Shop (DESTINATION)
```

---

## Semantics

| Node | Type | Notes |
|------|------|-------|
| Astral World | WORLD | Master company/platform/universe name |
| Astréa | DISTRICT | First hero district; NOT the company name |
| Tarot Suite | DESTINATION | Client concept — tarot reading environment |
| Astral Mall | DESTINATION | Client concept — on-the-spot reading / mall |
| Coffee Shop | DESTINATION | Client concept — Sims-like social space |

All nodes stored with `is_canonical: false` until explicitly promoted.

---

## Future expansion

Additional districts may be added as sibling DISTRICT nodes under Astral World:

```
Astral World
├── Astréa (flagship)
├── [District 02]
└── [District 03]
```

Each district may contain its own destinations, aesthetic system, reader experiences, commerce, and interaction logic.

No hardcoded limit on districts or destinations per district.

---

## What this is NOT

- Not formed world runtime
- Not environment generation
- Not visual canon for Astréa or destinations
- Not reader marketplace implementation

Hierarchy records founder-directed structure only.
