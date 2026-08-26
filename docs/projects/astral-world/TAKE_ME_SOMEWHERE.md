# Astral World — Take Me Somewhere

**Router:** `shared/site00-astral-world/takeMeSomewhereRouter.ts`  
**Context engine (FT1):** `shared/site00-astral-world/takeMeSomewhereContextEngine.ts`  
**Logic type:** Deterministic prototype — replaceable by Studio World AI

---

## Primary prompt

"What's going on today?"

---

## Quick chips

| Chip | Routes to |
|------|-----------|
| I NEED CLARITY | Tarot Suite (or favorite available reader) |
| I HAVE 10 MINUTES | Astral Mall |
| I NEED COMFORT | Coffee Shop |
| I WANT CONNECTION | Coffee Shop |
| I NEED SOMETHING DEEP | Tarot Suite |
| SOMETHING ELSE | Tarot Suite |

---

## Context engine output

Conversational line + reason + recommended destination + optional reader + alternates.

Example: *"You've only got ten minutes. Let's take you to the Mall."*

Inputs: intent, energy, reader availability, favorite reader, friend presence.

---

## UI

`src/site00/astral-world/components/TakeMeSomewherePanel.tsx`
