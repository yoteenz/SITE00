# Astral World — Experience Prototype (P0.E.1)

**Visual state:** `CREATIVE_EXPLORATION`  
**Founder judgment:** `AWAITING_FOUNDER_JUDGMENT`  
**Canon promoted by this sprint:** NO

---

## Purpose

Transform Astral World from identity/data workflow into a navigable, responsive experience prototype matching founder-selected references (REFERENCE A desktop, REFERENCE B mobile).

Implementation is a **review surface** — not automatic canon promotion.

---

## Entry

| Surface | Route |
|---------|-------|
| Founder project command | `/projects/astral-world` → **OPEN EXPERIENCE** |
| Direct | `/projects/astral-world/experience/home` |

Gated: `astral-world` slug + `BRAND_INTELLIGENCE` capability.

---

## Shell architecture

| Viewport | Layout |
|----------|--------|
| Desktop (≥1024px) | Left nav + main canvas + right rail (notifications, journey) |
| Mobile (<1024px) | Single column + fixed bottom nav (HOME · WORLD · JOURNAL · FRIENDS · PROFILE) |

**Host/client firewall:** Experience renders without `Site00Layout` / `EcosystemShell`. Uses Astral World client CSS (`astral-world.css`) — Cinzel/Cormorant gold celestial system, not SITE 00 Martian Mono red DNA.

---

## Routes

```
/projects/astral-world/experience/home
/projects/astral-world/experience/astrea
/projects/astral-world/experience/astrea/tarot-suite
/projects/astral-world/experience/astrea/astral-mall
/projects/astral-world/experience/astrea/coffee-shop
/projects/astral-world/experience/readers
/projects/astral-world/experience/friends
/projects/astral-world/experience/journal
/projects/astral-world/experience/profile
```

---

## Data boundary

| Layer | Location |
|-------|----------|
| Prototype fixtures | `shared/site00-astral-world/fixtures.ts` |
| Presence logic | `shared/site00-astral-world/presenceService.ts` |
| Take Me Somewhere router | `shared/site00-astral-world/takeMeSomewhereRouter.ts` |
| React state | `src/site00/astral-world/context/AstralWorldContext.tsx` |

All fixture records carry `source: 'PROTOTYPE_FIXTURE'`. Mall kiosk prices carry `priceState: 'DEMO'`.

---

## Key files

- Shell: `src/site00/astral-world/components/AstralWorldExperienceShell.tsx`
- Router: `src/site00/astral-world/pages/AstralWorldExperienceRouter.tsx`
- Entry gate: `src/site00/pages/ProjectAstralWorldExperiencePage.tsx`
- Creative exploration registry: `shared/site00-astral-world/creativeExploration.ts`
