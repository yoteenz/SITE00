# Brand Personality Intelligence Methodology

## Intelligence stack

| Layer | Question |
|-------|----------|
| **Brand Lore** | WHAT WORLD IS TRUE? |
| **Brand Personality** | WHO IS THE BRAND INSIDE THAT WORLD? |
| **Core Direction** | WHAT CREATIVE WORLD EXPRESSES IT? |
| **Direction Expression System** | HOW DOES THAT WORLD BECOME A VISUAL SYSTEM? |
| **Creative Expression Layer** | HOW DOES THE PERSONALITY BEHAVE INSIDE THAT SYSTEM? |
| **Visual DNA** | WHAT RULES ARE NOW APPROVED CANON? |
| **Controlled Expansion** | HOW DO WE MAKE MORE WITHOUT DRIFT? |

## Principle

**We do not invent personality at the moodboard stage.**

By Creative Direction, the system should already know how the brand speaks, jokes, disagrees, reacts, and what it would never do. Creative Direction **translates** those truths into form.

## Canonical storage

`BrandPersonalityProfile` is nested inside `site00_brand_lore_profiles.profile` JSONB as `brandPersonality` — a sibling envelope to lore fields, not a parallel table.

## Lineage

Founder answer → Brand Personality field → Creative Expression behavior → asset decision.

Downstream `PROPOSED_CREATIVE_OUTPUT` (e.g. pilot CES artifacts) never auto-promotes to founder canon.
