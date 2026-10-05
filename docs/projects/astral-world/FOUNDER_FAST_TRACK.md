# Astral World — Founder Fast Track (P0.E.FT1)

**Build mode:** `FOUNDER_FAST_TRACK`  
**Visual state:** `CREATIVE_EXPLORATION` + `FAST_TRACK_PROTOTYPE=TRUE`  
**Governance:** Does NOT bypass formal SITE 00 pipeline

---

## Dual-track strategy

| Track | Purpose |
|-------|---------|
| **A — Formal governance** | ORIGIN → IDENTITY → JUDGMENT → CANON → WORLD FORMATION → … |
| **B — Founder Fast Track** | Interactive product laboratory for founder/client review |

Prototype output may **inform** canon. It is **not** automatically canon.

---

## Entry route

**Primary:** `/projects/astral-world/debug/world/home`

From project command: **OPEN LIVE PROTOTYPE**

Also available (P0.E.1): `/projects/astral-world/experience/home`

---

## Governance bridge

```
FAST_TRACK_PROTOTYPE → FOUNDER REVIEW → PROMOTE SELECTED DECISIONS → FORMAL CANON
```

Founder verdicts: KEEP · REVISE · REJECT (via existing canon-promotion system when ready)

---

## Client-safe preview

Architecture supports isolated Astral World UI only — no SITE 00 host data, no founder admin surfaces.

Future: controlled preview token (documented in audit). Current: authenticated founder route.

---

## Key files

- Entry: `src/site00/pages/ProjectAstralWorldFastTrackPage.tsx`
- Registry: `shared/site00-astral-world/fastTrackRegistry.ts`
- Fixtures: `shared/site00-astral-world/fixtureService.ts`
- Context engine: `shared/site00-astral-world/takeMeSomewhereContextEngine.ts`
