# Astral World — Asset Slot Registry

Semantic slot keys — components never hardcode media URLs.

## Environment slots

| Slot | FT3 crop fallback |
|------|-------------------|
| ASTRAL_WORLD_HERO_DESKTOP | ASTRAL_WORLD_HERO |
| ASTRAL_WORLD_HERO_MOBILE | ASTRAL_WORLD_HERO_MOBILE |
| ASTREA_DISTRICT_PANORAMA_DESKTOP | ASTREA_DISTRICT |
| ASTREA_DISTRICT_PANORAMA_MOBILE | ASTREA_DISTRICT_MOBILE |
| TAROT_SUITE_HERO_DESKTOP | TAROT_SUITE |
| TAROT_SUITE_HERO_MOBILE | TAROT_SUITE_MOBILE |
| ASTRAL_MALL_HERO_DESKTOP | ASTRAL_MALL |
| ASTRAL_MALL_HERO_MOBILE | ASTRAL_MALL_MOBILE |
| COFFEE_SHOP_HERO_DESKTOP | COFFEE_SHOP |
| COFFEE_SHOP_HERO_MOBILE | COFFEE_SHOP_MOBILE |

## Dynamic portrait slots

- `READER_PORTRAIT_<id>`
- `FRIEND_AVATAR_<id>`

## Resolution order

1. ACTIVE generated asset
2. READY generated asset
3. Reference crop (FT3)
4. Controlled fallback

See `assetResolver.ts` and `useAstralAssets.ts`.
