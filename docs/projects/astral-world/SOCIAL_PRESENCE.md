# Astral World — Social Presence System

**Status:** Prototype — local React state, realtime-ready abstraction  
**Truth layer:** `CREATIVE_EXPLORATION` · Fast Track: `FAST_TRACK_PROTOTYPE`

---

## Presence states

`OFFLINE` · `ONLINE` · `IN_WORLD` · `IN_DISTRICT` · `AT_DESTINATION` · `AT_TABLE` · `READING` · `AVAILABLE` · `JOINABLE` · `PRIVATE`

---

## Privacy (FT1)

| Level | Behavior |
|-------|----------|
| `EVERYONE` | Visible to all |
| `FRIENDS` | Friends only (default) |
| `HIDDEN` | No friend-location discovery |

**Allow friends to join me** — toggle on/off (joinability)

---

## Reader-client relationships (prototype fixtures)

`FAVORITE_READER` · `SUBSCRIBED_READER` · `REGULAR_READER`

Reader-side alert concept: "A regular is back" — requires client presence permission.

---

## Implementation

- Service: `shared/site00-astral-world/presenceService.ts`
- Fixtures: `shared/site00-astral-world/fixtureService.ts`
- Context: `src/site00/astral-world/context/AstralWorldContext.tsx`

See also: `docs/projects/astral-world/FOUNDER_FAST_TRACK.md`
