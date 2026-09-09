/**
 * P0.VR.6R8 — Calibrated family card regions (source of truth aligned with extract-skins-reference-assets.mjs).
 */

import type { NormalizedBbox } from '../types.js';
import { clampNormalizedBbox } from './cropGeometry.js';

export const SOURCE_WIDTH_MOBILE = 941;
export const SOURCE_HEIGHT_MOBILE = 1672;

export const MOBILE_FAMILY_BRAND_KEYS = [
  'NDXBOOK',
  'FRONTAL_SLAYER',
  'AIO',
  'ASTRAL_WORLD',
  'STUDIO_WORLD',
] as const;

/** Normalized card bounds per brand — full family card on authority screenshot. */
export const MOBILE_FAMILY_CARD_CROPS: Record<(typeof MOBILE_FAMILY_BRAND_KEYS)[number], NormalizedBbox> = {
  NDXBOOK: { x: 0.02, y: 0.335, width: 0.19, height: 0.095 },
  FRONTAL_SLAYER: { x: 0.21, y: 0.335, width: 0.19, height: 0.095 },
  AIO: { x: 0.4, y: 0.335, width: 0.19, height: 0.095 },
  ASTRAL_WORLD: { x: 0.59, y: 0.335, width: 0.19, height: 0.095 },
  STUDIO_WORLD: { x: 0.78, y: 0.335, width: 0.19, height: 0.095 },
};

/** Layout fallback when brand key is unknown — index-based card placement. */
export function layoutCardCropByIndex(index: number): NormalizedBbox {
  const cardW = 88 / SOURCE_WIDTH_MOBILE;
  const cardH = 100 / SOURCE_HEIGHT_MOBILE;
  const x = (16 + index * (88 + 12)) / SOURCE_WIDTH_MOBILE;
  return clampNormalizedBbox({ x, y: 0.335, width: cardW, height: cardH });
}

export function resolveFamilyCardCrop(brandKey: string, index: number): NormalizedBbox {
  const key = brandKey as (typeof MOBILE_FAMILY_BRAND_KEYS)[number];
  if (MOBILE_FAMILY_CARD_CROPS[key]) return { ...MOBILE_FAMILY_CARD_CROPS[key] };
  return layoutCardCropByIndex(index);
}

/**
 * Inner media region inside card — excludes label, border, and (for NDXBOOK) device chrome.
 */
export function resolveInnerMediaCrop(brandKey: string, card: NormalizedBbox): NormalizedBbox {
  if (brandKey === 'NDXBOOK') {
    return clampNormalizedBbox({
      x: card.x + card.width * 0.1,
      y: card.y + card.height * 0.06,
      width: card.width * 0.4,
      height: card.height * 0.5,
    });
  }
  return clampNormalizedBbox({
    x: card.x + card.width * 0.06,
    y: card.y + card.height * 0.05,
    width: card.width * 0.88,
    height: card.height * 0.72,
  });
}

/** Media + small padding — candidate B. */
export function resolveMediaWithPaddingCrop(_brandKey: string, media: NormalizedBbox, paddingPercent = 6): NormalizedBbox {
  const padX = (media.width * paddingPercent) / 100;
  const padY = (media.height * paddingPercent) / 100;
  return clampNormalizedBbox({
    x: media.x - padX,
    y: media.y - padY,
    width: media.width + padX * 2,
    height: media.height + padY * 2,
  });
}
