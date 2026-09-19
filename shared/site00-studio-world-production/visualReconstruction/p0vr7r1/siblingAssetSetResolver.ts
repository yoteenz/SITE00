/**
 * P0.VR.7R1 — Detect sibling asset sets from spatial + semantic relationships.
 */

import type { ReferenceAssetCandidate } from '../referenceReconstructionIntelligence/referenceAssetMismatch.js';
import type { SiblingAssetSetResolution, SiblingAssetSetType, SpatialPattern } from './types.js';

const BRAND_FAMILY_ROW_KEYS = ['NDXBOOK', 'FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'] as const;

function isBrandFamilyRow(candidates: ReferenceAssetCandidate[]): boolean {
  if (candidates.length < 2) return false;
  const keys = candidates.map((c) => c.brandKey);
  const familySlots = keys.every((k) => k.includes('_') || BRAND_FAMILY_ROW_KEYS.includes(k as (typeof BRAND_FAMILY_ROW_KEYS)[number]));
  const thumbSlots = candidates.every((c) => c.semanticSlot.includes('BRAND_FAMILY_') && c.semanticSlot.includes('_THUMBNAIL'));
  return familySlots && thumbSlots && candidates.length >= 4;
}

function orderBrandFamilyRow(candidates: ReferenceAssetCandidate[]): ReferenceAssetCandidate[] {
  const order = new Map(BRAND_FAMILY_ROW_KEYS.map((k, i) => [k, i]));
  return [...candidates].sort((a, b) => (order.get(a.brandKey as (typeof BRAND_FAMILY_ROW_KEYS)[number]) ?? 99) - (order.get(b.brandKey as (typeof BRAND_FAMILY_ROW_KEYS)[number]) ?? 99));
}

function detectSetType(candidates: ReferenceAssetCandidate[]): SiblingAssetSetType {
  if (isBrandFamilyRow(candidates)) return 'BRAND_FAMILY_VISUAL_ROW';
  const slots = candidates.map((c) => c.semanticSlot.toUpperCase());
  if (slots.every((s) => s.includes('ICON'))) return 'ICON_SET';
  if (slots.every((s) => s.includes('NAV'))) return 'NAV_SET';
  if (slots.every((s) => s.includes('THUMB'))) return 'THUMBNAIL_SET';
  if (slots.every((s) => s.includes('CARD'))) return 'CARD_SET';
  if (candidates.length >= 4) return 'GRID';
  if (candidates.length >= 2) return 'ROW';
  return 'UNKNOWN';
}

function spatialPatternFor(setType: SiblingAssetSetType, candidateCount: number): SpatialPattern {
  if (setType === 'BRAND_FAMILY_VISUAL_ROW' || setType === 'ROW' || setType === 'CAROUSEL') {
    return 'HORIZONTAL_ROW_LEFT_TO_RIGHT';
  }
  if (setType === 'COLUMN') return 'VERTICAL_COLUMN_TOP_TO_BOTTOM';
  if (setType === 'GRID' && candidateCount >= 4) return 'GRID_LEFT_TO_RIGHT_TOP_TO_BOTTOM';
  return 'DOM_ORDER';
}

function orderCandidates(
  candidates: ReferenceAssetCandidate[],
  setType: SiblingAssetSetType,
  spatialPattern: SpatialPattern,
): ReferenceAssetCandidate[] {
  if (setType === 'BRAND_FAMILY_VISUAL_ROW') return orderBrandFamilyRow(candidates);
  if (spatialPattern === 'VERTICAL_COLUMN_TOP_TO_BOTTOM') {
    return [...candidates].sort((a, b) => a.referenceRegion.localeCompare(b.referenceRegion));
  }
  return [...candidates];
}

export function resolveSiblingAssetSet(input: {
  candidates: ReferenceAssetCandidate[];
  founderInstruction?: string | null;
  parentComponent?: string | null;
}): SiblingAssetSetResolution {
  const { candidates } = input;
  const setType = detectSetType(candidates);
  const spatialPattern = spatialPatternFor(setType, candidates.length);
  const ordered = orderCandidates(candidates, setType, spatialPattern);

  const instruction = (input.founderInstruction ?? '').toLowerCase();
  const batchIntent =
    instruction.includes('one by one') ||
    instruction.includes('each of these') ||
    instruction.includes('replace all') ||
    instruction.includes('five brand');

  const orderAmbiguous = setType === 'UNKNOWN' && candidates.length > 2 && !batchIntent;
  const confidence = setType === 'BRAND_FAMILY_VISUAL_ROW' ? 0.95 : setType === 'UNKNOWN' ? 0.4 : 0.75;

  return {
    setType,
    spatialPattern,
    orderedCandidateIds: ordered.map((c) => c.candidateId),
    sharedParentComponent: input.parentComponent ?? (setType === 'BRAND_FAMILY_VISUAL_ROW' ? 'brand-family-row' : null),
    confidence,
    orderAmbiguous,
  };
}

export function displayNameForCandidate(candidate: ReferenceAssetCandidate): string {
  return candidate.brandKey.replace(/_/g, ' ');
}
