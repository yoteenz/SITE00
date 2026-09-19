# Astral World — Destination Behavior (P0.E.1)

**Hierarchy:** Astral World → District (Astréa) → Destination → Experience

---

## Astréa (flagship district)

Contains three destinations. Future districts remain structurally possible — destinations are not flattened to top-level projects.

---

## Tarot Suite

| Attribute | Value |
|-----------|-------|
| Purpose | Deep / private / intentional |
| Tone | Premium intimate |
| Actions | Enter Suite, Choose Reader, Take Me Somewhere |
| Privacy | Private reading identities protected in UI |

Route: `/projects/astral-world/experience/astrea/tarot-suite`

---

## Astral Mall

| Attribute | Value |
|-----------|-------|
| Purpose | Fast / spontaneous / quick |
| Tone | Energetic discovery |
| Actions | Pick a Kiosk, view mall readers |
| Pricing | `priceState: DEMO` — non-canonical |

Route: `/projects/astral-world/experience/astrea/astral-mall`

Kiosk examples: 1 Card Pull (5 min), 3 Card Insight (10 min), Yes/No, Love Snapshot, Career Check-In.

---

## Coffee Shop

| Attribute | Value |
|-----------|-------|
| Purpose | Conversation / comfort / community |
| Tone | Warm social |
| Actions | Join Her Table, Leave Table, view live tables |
| Tables | The Empath Circle, Morning Magic, Soul Talk, Moonlight Musings |

Route: `/projects/astral-world/experience/astrea/coffee-shop`

Table join updates local presence to `AT_TABLE`. Full tables reject new joins.

---

## Product logic

Destinations are **not interchangeable skins**. Available actions, routing logic, and content differ by purpose model in `shared/site00-astral-world/types.ts` (`DESTINATION_PURPOSES`).
