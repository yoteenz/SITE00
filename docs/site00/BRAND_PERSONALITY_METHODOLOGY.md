# Brand Personality Intelligence Methodology

## Intelligence stack

| Layer | Question |
|-------|----------|
| **Brand Lore** | WHAT WORLD IS TRUE? |
| **Brand Personality** | WHO IS THE BRAND INSIDE THAT WORLD? |
| **Primary Expression Context** | WHERE DOES THIS BRAND ACTUALLY LIVE? |
| **Format-Native Expression Profile** | HOW MUST THE BRAND BE EXPERIENCED IN THOSE CHANNELS? |
| **Core Direction** | WHAT CREATIVE WORLD EXPRESSES IT? |
| **Direction Expression System** | HOW DOES THAT WORLD BECOME A VISUAL SYSTEM? |
| **Creative Expression Layer** | HOW DOES PERSONALITY BEHAVE INSIDE THAT SYSTEM AND FORMAT? |
| **Creative Direction Board** | WHAT VISUAL EVIDENCE PROVES THE SYSTEM IN THE CHANNELS THAT MATTER? |
| **Visual DNA** | WHAT RULES ARE NOW APPROVED CANON? |
| **Controlled Expansion** | HOW DO WE MAKE MORE WITHOUT DRIFT? |

## Format-native doctrine

**We do not design a moodboard in a vacuum.**

We design a brand for the mediums in which it actually lives.

- **FORMAT ADAPTATION ≠ RESIZING** — feed, carousel, Story, and Reel are native behaviors, not cropped versions of one poster.
- **SOCIAL_FIRST_EDITORIAL** brands prove direction through feed, carousel, Story, Reel/TikTok, franchises, and motion — not website-first defaults.
- **Board proof** curates social-native specimens; the board is presentation, the content is channel-native.

## Brand identity display language

Typography canon includes **CASING**, **WORDMARK SPELLING**, and **DISPLAY NAME** — not only font family.

- Machine slug `ndxbook` remains lowercase for routes/keys.
- Client/creative display name for NDXBOOK is **NDXBOOK** (one word, uppercase).
- Prompt compilation inherits `normalizeBrandPromptContext()` — models must not guess spelling or casing.

## Principle

**We do not invent personality at the moodboard stage.**

By Creative Direction, the system should already know how the brand speaks, jokes, disagrees, reacts, and what it would never do. Creative Direction **translates** those truths into form.

## Canonical storage

`BrandPersonalityProfile` is nested inside `site00_brand_lore_profiles.profile` JSONB as `brandPersonality` — a sibling envelope to lore fields, not a parallel table.

## Lineage

Founder answer → Brand Personality field → Creative Expression behavior → asset decision.

Downstream `PROPOSED_CREATIVE_OUTPUT` (e.g. pilot CES artifacts) never auto-promotes to founder canon.
