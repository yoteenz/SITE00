# Astral World — Social Presence System (P0.E.1 Prototype)

**Status:** Prototype — local React state, realtime-ready abstraction  
**Truth layer:** `CREATIVE_EXPLORATION`

---

## Presence states

`OFFLINE` · `ONLINE` · `IN_WORLD` · `IN_DISTRICT` · `AT_DESTINATION` · `AT_TABLE` · `READING` · `AVAILABLE` · `JOINABLE` · `PRIVATE`

---

## User presence record

```typescript
{
  userId, state, district, destination, tableId,
  activity, privacy, joinable, updatedAt
}
```

---

## Privacy levels

| Level | Behavior |
|-------|----------|
| `EVERYONE` | Visible to all |
| `FRIENDS` | Visible to friends (default prototype) |
| `HIDDEN` | No friend-location exposure |

---

## Friend presence

Seeded friends in `PROTOTYPE_FRIENDS` express district, destination, table, joinability.

Examples:
- "Jane Doe is at the Coffee Shop."
- "3 friends are in Astréa." (derived from fixture counts)

Actions: **See Who's Here**, **Join Here**, **Join Table**

---

## Reader presence

States: `AVAILABLE` · `READING_NOW` · `JOINABLE` · `APPOINTMENTS_ONLY` · `OFFLINE`

Reader cards include specialty, destination, availability, rating.

---

## Relationship alerts (prototype)

Types: `FAVORITE_READER` · `SUBSCRIBED_READER` · `REGULAR_READER`

Alert example: "A regular is back" — only when `canAlertRegularReturn(clientPermitsSharing)` is true.

No invasive automatic tracking.

---

## Implementation

- Service: `shared/site00-astral-world/presenceService.ts`
- Context: `src/site00/astral-world/context/AstralWorldContext.tsx`
- UI panels: `WhosHerePanel.tsx`, `AstralWorldRightRail.tsx`

Future: swap fixture layer for Supabase realtime without changing UI contracts.
