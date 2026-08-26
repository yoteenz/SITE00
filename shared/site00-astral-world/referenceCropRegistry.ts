/**
 * P0.E.FT3 — Centralized reference-board crop registry.
 * Reference artwork powers prototype surfaces until standalone assets replace them.
 */

import { ASTRAL_REFERENCE_DESKTOP, ASTRAL_REFERENCE_MOBILE } from './referenceAssets.js';

export type CropSpec = {
  src: string;
  position: string;
  size: string;
  aspectRatio?: string;
  focalPoint?: string;
};

export type ReferenceCropKey =
  | 'ASTRAL_WORLD_HERO'
  | 'ASTRAL_WORLD_HERO_MOBILE'
  | 'ASTREA_DISTRICT'
  | 'ASTREA_DISTRICT_MOBILE'
  | 'TAROT_SUITE'
  | 'TAROT_SUITE_MOBILE'
  | 'ASTRAL_MALL'
  | 'ASTRAL_MALL_MOBILE'
  | 'COFFEE_SHOP'
  | 'COFFEE_SHOP_MOBILE'
  | 'SOCIAL_PRESENCE'
  | 'SOCIAL_PRESENCE_MOBILE'
  | 'JOURNAL'
  | 'JOURNAL_MOBILE'
  | 'DAILY_CARD'
  | 'CREATE_DECK'
  | 'CUSTOM_AVATAR'
  | 'FIND_MY_READER_MOBILE'
  | 'TAKE_ME_SOMEWHERE_MOBILE';

const D = ASTRAL_REFERENCE_DESKTOP.publicPath;
const M = ASTRAL_REFERENCE_MOBILE.publicPath;

/** Environment / scene crops — coordinates tuned to ingested reference boards */
export const ASTRAL_REFERENCE_CROPS: Record<ReferenceCropKey, CropSpec> = {
  ASTRAL_WORLD_HERO: { src: D, position: '42% 6%', size: '185% auto', aspectRatio: '16/9', focalPoint: 'center top' },
  ASTRAL_WORLD_HERO_MOBILE: { src: M, position: '68% 12%', size: '320% auto', aspectRatio: '941/520', focalPoint: 'center 30%' },
  ASTREA_DISTRICT: { src: D, position: '50% 38%', size: '160% auto', aspectRatio: '4/3', focalPoint: 'center' },
  ASTREA_DISTRICT_MOBILE: { src: M, position: '68% 22%', size: '280% auto', aspectRatio: '1/1', focalPoint: 'center' },
  TAROT_SUITE: { src: D, position: '18% 72%', size: '220% auto', aspectRatio: '4/5', focalPoint: 'center' },
  TAROT_SUITE_MOBILE: { src: M, position: '68% 48%', size: '300% auto', aspectRatio: '4/5', focalPoint: 'center' },
  ASTRAL_MALL: { src: D, position: '50% 72%', size: '220% auto', aspectRatio: '4/5', focalPoint: 'center' },
  ASTRAL_MALL_MOBILE: { src: M, position: '68% 58%', size: '300% auto', aspectRatio: '4/5', focalPoint: 'center' },
  COFFEE_SHOP: { src: D, position: '82% 72%', size: '220% auto', aspectRatio: '4/5', focalPoint: 'center' },
  COFFEE_SHOP_MOBILE: { src: M, position: '68% 38%', size: '300% auto', aspectRatio: '4/5', focalPoint: 'center' },
  SOCIAL_PRESENCE: { src: D, position: '88% 28%', size: '400% auto', aspectRatio: '3/4', focalPoint: 'top' },
  SOCIAL_PRESENCE_MOBILE: { src: M, position: '68% 32%', size: '280% auto', aspectRatio: '3/4', focalPoint: 'top' },
  JOURNAL: { src: D, position: '88% 55%', size: '350% auto', aspectRatio: '3/4', focalPoint: 'center' },
  JOURNAL_MOBILE: { src: M, position: '68% 78%', size: '320% auto', aspectRatio: '3/4', focalPoint: 'center' },
  DAILY_CARD: { src: M, position: '68% 85%', size: '400% auto', aspectRatio: '2/3', focalPoint: 'center' },
  CREATE_DECK: { src: M, position: '15% 55%', size: '250% auto', aspectRatio: '4/3', focalPoint: 'center' },
  CUSTOM_AVATAR: { src: D, position: '12% 55%', size: '280% auto', aspectRatio: '1/1', focalPoint: 'center' },
  FIND_MY_READER_MOBILE: { src: M, position: '68% 68%', size: '300% auto', aspectRatio: '3/4', focalPoint: 'top' },
  TAKE_ME_SOMEWHERE_MOBILE: { src: M, position: '68% 45%', size: '280% auto', aspectRatio: '16/10', focalPoint: 'center' },
};

/** Portrait crops from reference boards — keyed by fixture id */
export type PortraitKey =
  | 'friend-jane'
  | 'friend-marcus'
  | 'friend-luna'
  | 'friend-lux'
  | 'reader-madame-j'
  | 'reader-kai'
  | 'reader-earth-mama'
  | 'reader-sage'
  | 'reader-orion'
  | 'reader-aria'
  | 'user-demo-teena';

export const ASTRAL_PORTRAIT_CROPS: Record<PortraitKey, CropSpec> = {
  'friend-jane': { src: M, position: '72% 34%', size: '900% auto' },
  'friend-marcus': { src: M, position: '74% 36%', size: '900% auto' },
  'friend-luna': { src: M, position: '76% 38%', size: '900% auto' },
  'friend-lux': { src: M, position: '78% 40%', size: '900% auto' },
  'reader-madame-j': { src: D, position: '86% 32%', size: '800% auto' },
  'reader-kai': { src: D, position: '88% 36%', size: '800% auto' },
  'reader-earth-mama': { src: D, position: '90% 40%', size: '800% auto' },
  'reader-sage': { src: D, position: '87% 44%', size: '800% auto' },
  'reader-orion': { src: M, position: '70% 70%', size: '850% auto' },
  'reader-aria': { src: M, position: '72% 72%', size: '850% auto' },
  'user-demo-teena': { src: D, position: '12% 58%', size: '600% auto' },
};

export function getReferenceCrop(key: ReferenceCropKey): CropSpec {
  return ASTRAL_REFERENCE_CROPS[key];
}

export function getPortraitCrop(personId: string): CropSpec | null {
  return (ASTRAL_PORTRAIT_CROPS as Record<string, CropSpec>)[personId] ?? null;
}

export type CropBackgroundStyle = {
  backgroundImage: string;
  backgroundPosition: string;
  backgroundSize: string;
  backgroundRepeat: 'no-repeat';
};

export function cropToBackgroundStyle(crop: CropSpec, overlay = true): CropBackgroundStyle {
  const gradient = overlay
    ? 'linear-gradient(180deg, rgba(6,8,15,0.05) 0%, rgba(6,8,15,0.55) 55%, rgba(6,8,15,0.92) 100%), '
    : '';
  return {
    backgroundImage: `${gradient}url(${crop.src})`,
    backgroundPosition: crop.position,
    backgroundSize: crop.size,
    backgroundRepeat: 'no-repeat',
  };
}

/** Prefer mobile crop when defined; otherwise fall back to desktop key */
export function mobileCropKey(key: ReferenceCropKey): ReferenceCropKey {
  const mobile = `${key}_MOBILE` as ReferenceCropKey;
  return mobile in ASTRAL_REFERENCE_CROPS ? mobile : key;
}

export const DESTINATION_CROP_KEYS = {
  'tarot-suite': { desktop: 'TAROT_SUITE' as ReferenceCropKey, mobile: 'TAROT_SUITE_MOBILE' as ReferenceCropKey },
  'astral-mall': { desktop: 'ASTRAL_MALL' as ReferenceCropKey, mobile: 'ASTRAL_MALL_MOBILE' as ReferenceCropKey },
  'coffee-shop': { desktop: 'COFFEE_SHOP' as ReferenceCropKey, mobile: 'COFFEE_SHOP_MOBILE' as ReferenceCropKey },
} as const;
