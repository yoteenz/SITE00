# Astral World — Take Me Somewhere (P0.E.1 Prototype)

**Router:** `shared/site00-astral-world/takeMeSomewhereRouter.ts`  
**Logic type:** Deterministic seeded prototype — **not production AI**

---

## Primary prompt

"What's going on today?"

---

## Quick response chips

| Chip | Intent | Routes to |
|------|--------|-----------|
| I NEED CLARITY | `NEED_CLARITY` | Tarot Suite |
| I HAVE 10 MINUTES | `TEN_MINUTES` | Astral Mall |
| I NEED COMFORT | `NEED_COMFORT` | Coffee Shop |
| I'M CELEBRATING | `CELEBRATING` | Astral Mall |
| I WANT CONNECTION | `WANT_CONNECTION` | Coffee Shop |
| SOMETHING ELSE | `SOMETHING_ELSE` | Tarot Suite |

Deep/private energy state (`PRIVATE`) maps to `DEEP_PRIVATE` → Tarot Suite via `energyToIntent()`.

---

## Routing inputs (future)

Architecture supports later replacement by Studio World recommendation logic considering:
- intent, available time, tone
- destination purpose
- reader availability
- friend / favorite reader presence

Current implementation returns `{ destination, label, reason, isPrototypeLogic: true }`.

---

## UI

- Desktop: home dashboard panel + destination pages (compact variant)
- Mobile: dedicated screen state in home flow

Component: `src/site00/astral-world/components/TakeMeSomewherePanel.tsx`
