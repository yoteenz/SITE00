/**
 * P0.E.FT4 — Environment asset prompt contracts (versioned).
 */

import type { VisualAssetContract } from './types.js';
import { AW_VISUAL_FOUNDATION_BATCH, ASTRAL_WORLD_PROJECT_ID } from './types.js';
import { astralNegativeBlock } from './masterVisualContract.js';

const NEG = astralNegativeBlock([
  'NO TAROT CARD COLLAGE',
  'NO PURPLE CRYSTAL CLICHÉ',
  'NO CYBERPUNK',
  'NO GOTHIC HORROR',
]);

function envContract(
  assetKey: string,
  targetSlot: string,
  promptTemplateId: string,
  aspectRatio: string,
  w: number,
  h: number,
  mobileBehavior: 'MOBILE_NATIVE' | 'DESKTOP_ONLY' | 'SHARED',
  priority: 'P0' | 'P1' | 'P2',
  referenceSources: string[],
  destinationScope: string | null = null,
): VisualAssetContract {
  return {
    assetContractId: `${assetKey}@v1`,
    projectId: ASTRAL_WORLD_PROJECT_ID,
    worldScope: 'astral-world',
    districtScope: destinationScope ? 'astrea' : null,
    destinationScope,
    assetKey,
    assetType: 'CINEMATIC_ENVIRONMENT',
    role: 'environment_hero',
    targetSlot,
    referenceSources,
    promptTemplateId,
    promptVersion: 'v1',
    negativeConstraints: NEG.split('. ').filter(Boolean),
    aspectRatio,
    widthTarget: w,
    heightTarget: h,
    focalPoint: 'center',
    safeZones: ['lower_third_for_ui', 'upper_third_for_title'],
    mobileBehavior,
    desktopBehavior: mobileBehavior === 'MOBILE_NATIVE' ? 'MOBILE_ONLY' : 'DESKTOP_NATIVE',
    generationMode: 'IMAGE_REFERENCE_EDIT',
    assetClass: 'CINEMATIC_ENVIRONMENT',
    priority,
    batchId: AW_VISUAL_FOUNDATION_BATCH,
  };
}

export const ENVIRONMENT_PROMPT_BODIES: Record<string, string> = {
  ASTRAL_WORLD_HERO_DESKTOP: `Create a cinematic establishing environment for ASTRAL WORLD, a luxurious living astral universe of intuition, tarot, community, spiritual reflection, and human connection.

Match the attached Astral World desktop reference as visual authority for atmosphere, city scale, lighting, palette, depth, and composition.

Show an expansive elevated view into a magnificent inhabited astral city at twilight/night, with layered architecture cascading into the distance, warm amber windows, subtle celestial illumination, elegant towers, intimate gathering spaces, distant lanterns, terraces, pathways, and hints of multiple districts.

The city must feel alive and populated without becoming crowded.

Visual language: midnight navy, near-black blue, antique gold, warm amber, candlelight, subtle cosmic atmosphere.

Camera: cinematic elevated overlook, wide establishing composition, strong depth, clear central visual path into the world.

Leave intentional darker/readable regions for coded interface overlays.

OUTPUT: clean environment-only cinematic artwork.`,

  ASTRAL_WORLD_HERO_MOBILE: `Create a vertical cinematic entrance into Astral World based directly on the supplied mobile reference.

The viewer is arriving at an elevated threshold overlooking the living astral city.

Preserve the same master visual system as the desktop environment but compose specifically for a vertical mobile viewport.

Create strong foreground-to-background depth. Keep important architectural/city imagery in upper and middle frame. Maintain readable darker zones for real coded title and CTA overlays.

Do not simply crop the desktop image. Create a mobile-native companion composition from the same world.`,

  ASTREA_DISTRICT_PANORAMA: `Create the flagship district ASTRÉA inside Astral World.

Astréa is an inhabited social reading district where three destinations coexist in one coherent neighborhood: Tarot Suite, Astral Mall, Coffee Shop.

Tarot Suite: private, intimate, mysterious, luxurious.
Astral Mall: active, warm, spontaneous, energetic.
Coffee Shop: warm, intimate, conversational, communal.

Use architecture, lighting and environmental variation to distinguish each destination while preserving one Astral World identity.

Show pathways, entrances, activity, people and visual depth. The district should feel explorable.`,

  TAROT_SUITE_HERO: `Create an intimate luxury tarot reading suite inside Astréa. Deep. Private. Intentional.

A sophisticated candlelit reading room with dark midnight interior, antique gold details, rich velvet, elegant tarot reading table, beautifully arranged tarot cards, subtle crystals used sparingly, celestial window or distant astral city view, comfortable luxurious seating, warm candlelight, books and meaningful personal artifacts, layered depth, understated mystical symbolism.

Must NOT resemble Halloween set, witch store, stage set, generic psychic booth, purple crystal room.

Leave areas where coded reader status / CTA overlays can sit.`,

  ASTRAL_MALL_HERO: `Create Astral Mall, the fast spontaneous high-energy quick-reading destination inside Astréa.

Luxurious mystical social mall with elegant reader kiosks and walk-up reading stations. Active, lively, contemporary while preserving antique-gold celestial visual language.

Include multiple distinctive kiosks, warm glowing storefronts, people moving naturally, readers at kiosks, layered architecture, antique brass and dark green accents, midnight/navy structure, warm amber illumination.

Feeling: quick, fun, social, on-the-go, alive.`,

  COFFEE_SHOP_HERO: `Create the Coffee Shop inside Astréa — warm inhabited social destination where readers, friends and seekers naturally meet.

Show multiple intimate tables, warm lamps, amber candlelight, dark wood, antique gold details, deep burgundy and caramel undertones, coffee cups, books, journals, people sitting naturally together, several clearly readable table zones.

Cozy, social, premium, real, welcoming, intimate, inhabited. People naturally engaged — not posing toward camera.`,

  COFFEE_SHOP_TABLE_SCENE: `A warm intimate table inside Astréa's Coffee Shop with a small diverse group of friends and seekers seated naturally together, engaged in genuine conversation.

Tarot cards, coffee, a journal and subtle personal objects on the table. Candid moment. Leave unobstructed space for JOIN HER TABLE UI overlays.`,
};

export const ENVIRONMENT_CONTRACTS: VisualAssetContract[] = [
  envContract('ASTRAL_WORLD_HERO_DESKTOP', 'ASTRAL_WORLD_HERO_DESKTOP', 'ASTRAL_WORLD_HERO_DESKTOP', '16:9', 1672, 941, 'DESKTOP_ONLY', 'P0', ['reference-desktop-full']),
  envContract('ASTRAL_WORLD_HERO_MOBILE', 'ASTRAL_WORLD_HERO_MOBILE', 'ASTRAL_WORLD_HERO_MOBILE', '9:16', 941, 1672, 'MOBILE_NATIVE', 'P0', ['reference-mobile-full']),
  envContract('ASTREA_DISTRICT_PANORAMA_DESKTOP', 'ASTREA_DISTRICT_PANORAMA_DESKTOP', 'ASTREA_DISTRICT_PANORAMA', '4:3', 1400, 1050, 'DESKTOP_ONLY', 'P0', ['reference-desktop-astrea']),
  envContract('ASTREA_DISTRICT_PANORAMA_MOBILE', 'ASTREA_DISTRICT_PANORAMA_MOBILE', 'ASTREA_DISTRICT_PANORAMA', '1:1', 941, 941, 'MOBILE_NATIVE', 'P0', ['reference-mobile-astrea']),
  envContract('TAROT_SUITE_HERO_DESKTOP', 'TAROT_SUITE_HERO_DESKTOP', 'TAROT_SUITE_HERO', '4:5', 1200, 1500, 'DESKTOP_ONLY', 'P0', ['reference-desktop-suite'], 'tarot-suite'),
  envContract('TAROT_SUITE_HERO_MOBILE', 'TAROT_SUITE_HERO_MOBILE', 'TAROT_SUITE_HERO', '4:5', 941, 1176, 'MOBILE_NATIVE', 'P0', ['reference-mobile-suite'], 'tarot-suite'),
  envContract('ASTRAL_MALL_HERO_DESKTOP', 'ASTRAL_MALL_HERO_DESKTOP', 'ASTRAL_MALL_HERO', '4:5', 1200, 1500, 'DESKTOP_ONLY', 'P0', ['reference-desktop-mall'], 'astral-mall'),
  envContract('ASTRAL_MALL_HERO_MOBILE', 'ASTRAL_MALL_HERO_MOBILE', 'ASTRAL_MALL_HERO', '4:5', 941, 1176, 'MOBILE_NATIVE', 'P0', ['reference-mobile-mall'], 'astral-mall'),
  envContract('COFFEE_SHOP_HERO_DESKTOP', 'COFFEE_SHOP_HERO_DESKTOP', 'COFFEE_SHOP_HERO', '4:5', 1200, 1500, 'DESKTOP_ONLY', 'P0', ['reference-desktop-coffee'], 'coffee-shop'),
  envContract('COFFEE_SHOP_HERO_MOBILE', 'COFFEE_SHOP_HERO_MOBILE', 'COFFEE_SHOP_HERO', '4:5', 941, 1176, 'MOBILE_NATIVE', 'P0', ['reference-mobile-coffee'], 'coffee-shop'),
  envContract('COFFEE_SHOP_TABLE_SCENE', 'COFFEE_SHOP_TABLE_SCENE', 'COFFEE_SHOP_TABLE_SCENE', '16:9', 1600, 900, 'SHARED', 'P1', ['reference-desktop-coffee'], 'coffee-shop'),
];
