/**
 * P0.E.FT4 — Artifact prompt contracts (journal, tarot, deck, avatar, circle).
 */

import type { VisualAssetContract } from './types.js';
import { AW_VISUAL_FOUNDATION_BATCH, ASTRAL_WORLD_PROJECT_ID } from './types.js';
import { astralNegativeBlock } from './masterVisualContract.js';

function artifactContract(
  assetKey: string,
  targetSlot: string,
  promptTemplateId: string,
  assetType: VisualAssetContract['assetType'],
  aspectRatio: string,
  w: number,
  h: number,
): VisualAssetContract {
  return {
    assetContractId: `${assetKey}@v1`,
    projectId: ASTRAL_WORLD_PROJECT_ID,
    worldScope: 'astral-world',
    districtScope: null,
    destinationScope: null,
    assetKey,
    assetType,
    role: 'artifact',
    targetSlot,
    referenceSources: ['reference-artifact-crop'],
    promptTemplateId,
    promptVersion: 'v1',
    negativeConstraints: astralNegativeBlock().split('. ').filter(Boolean),
    aspectRatio,
    widthTarget: w,
    heightTarget: h,
    focalPoint: 'center',
    safeZones: ['overlay_safe'],
    mobileBehavior: 'SHARED',
    desktopBehavior: 'SHARED',
    generationMode: 'IMAGE_REFERENCE_EDIT',
    assetClass: assetType === 'TAROT_CARD' ? 'TAROT_CARD' : 'PRODUCT_ARTIFACT',
    priority: 'P2',
    batchId: AW_VISUAL_FOUNDATION_BATCH,
  };
}

export const ARTIFACT_PROMPT_BODIES: Record<string, string> = {
  JOURNAL_ARTIFACT: `Create the user's personal Astral World tarot journal as a premium physical artifact — elegant open journal in warm low light.

Aged cream paper, dark leather or midnight cover, antique gold detailing, subtle celestial embossing, handwritten-style texture, small tarot imagery, bookmarks.

Accumulated, intimate and real. Visual writing texture but NO important legible generated copy.`,

  DAILY_CARD_ARTIFACT: `Create a single premium Astral World tarot card object for the Daily Card experience.

Traditional tarot archetype through contemporary life, ornate antique-gold framing, warm cinematic imagery, personal and emotionally resonant.

Prefer clean art with coded label overlay — no final card title typography unless controlled.`,

  CREATE_A_DECK_HERO: `Create a beautiful presentation of several personalized Astral World tarot cards representing real people transformed into tarot archetypes.

Deeply personal family artifacts. Antique-gold frame system, rich cinematic environments, warm realistic people, premium print quality.

Display 3–5 cards in sophisticated composition suitable for Create a Deck feature.`,

  CUSTOM_AVATAR_HERO: `Create a premium Astral World avatar preview scene showing one contemporary person as an elegant inhabitant of Astral World.

Modern and recognizable. Subtle district-inspired styling rather than fantasy costume. Communicates "This is how you appear inside Astral World."`,

  CIRCLE_COMMUNITY_HERO: `Create a warm Astral World community-circle scene — small diverse group gathered naturally in intimate celestial social setting.

Belonging, conversation, reflection and shared guidance. Not ritual ceremony, not cult-like, not horror stock photography.`,
};

export const ARTIFACT_CONTRACTS: VisualAssetContract[] = [
  artifactContract('JOURNAL_ARTIFACT', 'JOURNAL_ARTIFACT', 'JOURNAL_ARTIFACT', 'PRODUCT_ARTIFACT', '3:4', 900, 1200),
  artifactContract('DAILY_CARD_ARTIFACT', 'DAILY_CARD_ARTIFACT', 'DAILY_CARD_ARTIFACT', 'TAROT_CARD', '2:3', 600, 900),
  artifactContract('CREATE_A_DECK_HERO', 'CREATE_A_DECK_HERO', 'CREATE_A_DECK_HERO', 'TAROT_CARD', '4:3', 1200, 900),
  artifactContract('CUSTOM_AVATAR_HERO', 'CUSTOM_AVATAR_HERO', 'CUSTOM_AVATAR_HERO', 'CHARACTER_PORTRAIT', '1:1', 1024, 1024),
  artifactContract('CIRCLE_COMMUNITY_HERO', 'CIRCLE_COMMUNITY_HERO', 'CIRCLE_COMMUNITY_HERO', 'CINEMATIC_ENVIRONMENT', '16:9', 1600, 900),
];
