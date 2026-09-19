# P0.E.FT5 — Final Astral World Asset Manifest

**Resolution order:** ACTIVE → READY → reference crop → fallback  
**Registry:** `shared/site00-astral-world/generation/assetSlotRegistry.ts`

## Environment slots

| ASSET_KEY | SCOPE | SOURCE | STATUS | FALLBACK | FAL_CONTRACT |
|-----------|-------|--------|--------|----------|--------------|
| ASTRAL_WORLD_HERO_DESKTOP | env | reference crop | REFERENCE | bg-desktop-cinematic | ✓ |
| ASTRAL_WORLD_HERO_MOBILE | env | reference crop | REFERENCE | bg-mobile-cinematic | ✓ |
| ASTREA_DISTRICT_PANORAMA_DESKTOP | env | reference crop | REFERENCE | ASTREA_DISTRICT crop | ✓ |
| ASTREA_DISTRICT_PANORAMA_MOBILE | env | reference crop | REFERENCE | ASTREA_DISTRICT_MOBILE | ✓ |
| TAROT_SUITE_HERO_DESKTOP | env | reference crop | REFERENCE | TAROT_SUITE crop | ✓ |
| TAROT_SUITE_HERO_MOBILE | env | reference crop | REFERENCE | TAROT_SUITE_MOBILE | ✓ |
| ASTRAL_MALL_HERO_DESKTOP | env | reference crop | REFERENCE | ASTRAL_MALL crop | ✓ |
| ASTRAL_MALL_HERO_MOBILE | env | reference crop | REFERENCE | ASTRAL_MALL_MOBILE | ✓ |
| COFFEE_SHOP_HERO_DESKTOP | env | reference crop | REFERENCE | COFFEE_SHOP crop | ✓ |
| COFFEE_SHOP_HERO_MOBILE | env | reference crop | REFERENCE | COFFEE_SHOP_MOBILE | ✓ |
| COFFEE_SHOP_TABLE_SCENE | object | — | MISSING | COFFEE_SHOP crop | ✓ |
| JOURNAL_ARTIFACT | artifact | reference crop | REFERENCE | JOURNAL crop | ✓ |
| DAILY_CARD_ARTIFACT | artifact | reference crop | REFERENCE | DAILY_CARD crop | ✓ |
| CREATE_A_DECK_HERO | object | reference crop | REFERENCE | CREATE_DECK crop | ✓ |
| CUSTOM_AVATAR_HERO | portrait | reference crop | REFERENCE | CUSTOM_AVATAR crop | ✓ |
| CIRCLE_COMMUNITY_HERO | social | reference crop | REFERENCE | SOCIAL_PRESENCE crop | ✓ |

## Portrait slots (isolated semantic keys)

| ASSET_KEY | FIXTURE | STATUS |
|-----------|---------|--------|
| READER_MADAME_J | reader-madame-j | REFERENCE extraction |
| READER_KAI_ORACLE | reader-kai | REFERENCE extraction |
| READER_EARTH_MAMA | reader-earth-mama | REFERENCE extraction |
| READER_SAGE_MOONWATER | reader-sage | REFERENCE extraction |
| READER_ORION_VALE | reader-orion | REFERENCE extraction |
| READER_ARIA_BLOOM | reader-aria | REFERENCE extraction |
| FRIEND_JANE_DOE | friend-jane | REFERENCE extraction |
| FRIEND_MARCUS_CHEN | friend-marcus | REFERENCE extraction |
| FRIEND_LUNA_REYES | friend-luna | REFERENCE extraction |
| FRIEND_LOVE_LUX | friend-lux | REFERENCE extraction |

Automatic slot inhabitation: `resolveAstralAsset()` / `useAstralAssets()` — no component rewrite on READY.
