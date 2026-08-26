/**
 * P0.E.FT4 — Resolve Astral World visual assets for UI slots.
 * Resolution: ACTIVE → READY → reference crop → fallback
 */

import {
  cropToBackgroundStyle,
  getPortraitCrop,
  getReferenceCrop,
  type ReferenceCropKey,
} from '../referenceCropRegistry.js';
import {
  getIsolatedPortrait,
  isolatedPortraitStyle,
} from '../portraitAssetRegistry.js';
import { ASTRAL_REFERENCE_DESKTOP, ASTRAL_REFERENCE_MOBILE } from '../referenceAssets.js';
import {
  cropKeyFromSlot,
  portraitSlotFromPersonId,
  slotKeyFromCrop,
  type AstralAssetSlotKey,
} from './assetSlotRegistry.js';
import type { AstralAssetRecord, ResolvedAstralAsset } from './types.js';

export type AstralAssetStoreSnapshot = Record<string, AstralAssetRecord>;

function isUsableGenerated(record: AstralAssetRecord | undefined): boolean {
  if (!record?.outputUrl) return false;
  return record.status === 'ACTIVE' || record.status === 'READY';
}

function referenceForSlot(slotKey: AstralAssetSlotKey, origin?: string): ResolvedAstralAsset | null {
  const cropKey = cropKeyFromSlot(slotKey);
  if (cropKey) {
    const spec = getReferenceCrop(cropKey);
    const style = cropToBackgroundStyle(spec, true);
    const urlMatch = style.backgroundImage.match(/url\(([^)]+)\)/);
    const url = urlMatch?.[1]?.replace(/['"]/g, '') ?? spec.src;
    const absoluteUrl = url.startsWith('http') ? url : `${origin ?? ''}${url}`;
    return {
      slotKey,
      source: 'REFERENCE',
      url: absoluteUrl,
      backgroundPosition: spec.position,
      backgroundSize: spec.size,
      aspectRatio: spec.aspectRatio,
    };
  }
  return null;
}

export function resolveAstralAsset(
  slotKey: AstralAssetSlotKey,
  store: AstralAssetStoreSnapshot,
  origin?: string,
): ResolvedAstralAsset {
  const record = store[slotKey];
  if (record && isUsableGenerated(record) && record.outputUrl) {
    return {
      slotKey,
      source: record.status === 'ACTIVE' ? 'ACTIVE' : 'READY',
      url: record.outputUrl,
    };
  }

  const ref = referenceForSlot(slotKey, origin);
  if (ref) return ref;

  return {
    slotKey,
    source: 'FALLBACK',
    url: `${origin ?? ''}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
  };
}

export function resolveAstralAssetForCrop(
  cropKey: ReferenceCropKey,
  store: AstralAssetStoreSnapshot,
  origin?: string,
): ResolvedAstralAsset {
  const slot = slotKeyFromCrop(cropKey);
  if (slot) {
    return resolveAstralAsset(slot, store, origin);
  }
  const spec = getReferenceCrop(cropKey);
  const style = cropToBackgroundStyle(spec, true);
  const urlMatch = style.backgroundImage.match(/url\(([^)]+)\)/);
  const url = urlMatch?.[1]?.replace(/['"]/g, '') ?? spec.src;
  return {
    slotKey: cropKey,
    source: 'REFERENCE',
    url: url.startsWith('http') ? url : `${origin ?? ''}${url}`,
    backgroundPosition: spec.position,
    backgroundSize: spec.size,
    aspectRatio: spec.aspectRatio,
  };
}

export function resolvePortraitAsset(
  personId: string,
  store: AstralAssetStoreSnapshot,
  origin?: string,
): ResolvedAstralAsset {
  const slot = portraitSlotFromPersonId(personId);
  const resolved = resolveAstralAsset(slot, store, origin);
  if (resolved.source !== 'FALLBACK') return resolved;

  const isolated = getIsolatedPortrait(personId);
  if (isolated) {
    const style = isolatedPortraitStyle(isolated);
    const url = style.backgroundImage.match(/url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '') ?? isolated.src;
    return {
      slotKey: isolated.falSlotKey,
      source: 'REFERENCE',
      url: url.startsWith('http') ? url : `${origin ?? ''}${url}`,
      backgroundPosition: style.backgroundPosition,
      backgroundSize: style.backgroundSize,
    };
  }

  const crop = getPortraitCrop(personId);
  if (crop) {
    const urlMatch = cropToBackgroundStyle(crop, false).backgroundImage.match(/url\(([^)]+)\)/);
    const url = urlMatch?.[1]?.replace(/['"]/g, '') ?? crop.src;
    return {
      slotKey: slot,
      source: 'REFERENCE',
      url: url.startsWith('http') ? url : `${origin ?? ''}${url}`,
      backgroundPosition: crop.position,
      backgroundSize: crop.size,
    };
  }

  return resolved;
}

/** Reference image URLs for FAL conditioning by contract reference source id */
export function resolveReferenceUrlsForContract(
  referenceSources: string[],
  origin: string,
): string[] {
  const base = origin.replace(/\/$/, '');
  const map: Record<string, string> = {
    'reference-desktop-full': `${base}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
    'reference-mobile-full': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-desktop-astrea': `${base}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
    'reference-mobile-astrea': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-desktop-suite': `${base}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
    'reference-mobile-suite': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-desktop-mall': `${base}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
    'reference-mobile-mall': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-desktop-coffee': `${base}${ASTRAL_REFERENCE_DESKTOP.publicPath}`,
    'reference-mobile-coffee': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-portrait-crop': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
    'reference-artifact-crop': `${base}${ASTRAL_REFERENCE_MOBILE.publicPath}`,
  };
  return referenceSources.map((s) => map[s]).filter(Boolean);
}

export function sanitizeClientAssetMap(
  store: AstralAssetStoreSnapshot,
  origin?: string,
): Record<string, { url: string; source: ResolvedAstralAsset['source'] }> {
  const out: Record<string, { url: string; source: ResolvedAstralAsset['source'] }> = {};
  for (const slotKey of Object.keys(store)) {
    const resolved = resolveAstralAsset(slotKey as AstralAssetSlotKey, store, origin);
    if (resolved.source === 'ACTIVE' || resolved.source === 'READY') {
      out[slotKey] = { url: resolved.url, source: resolved.source };
    }
  }
  return out;
}
