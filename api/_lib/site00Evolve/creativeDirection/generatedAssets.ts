/**
 * NDXBOOK Creative Direction — approved FAL-generated asset registry (reference-locked pass).
 *
 * Six real, inspected, background-treated assets produced this pass (see
 * docs/studio-world/ndxbook/NDXBOOK_CD_REFERENCE_DECOMPOSITION.md "Production priority").
 * Each is marked GENERATED, never APPROVED — only an explicit founder decision on the
 * territory promotes anything toward Visual DNA (see visualDnaContract.ts). This
 * registry exists purely to attach real imagery to matching structural specimens;
 * specimens without a registry entry render SVG-only, and structural rendering never
 * requires this registry (no FAL requirement at runtime — assets are pre-generated
 * and served as static files from public/site00/creative-direction/ndxbook/).
 */

import type { SpecimenImageAsset, TerritorySpecimenType } from './types.js';

const BASE = '/site00/creative-direction/ndxbook';
const MODEL = 'fal-ai/nano-banana-pro';

type RegistryKey = `${'editorial_utility' | 'index_signal' | 'kinetic_field'}:${TerritorySpecimenType}`;

export const NDXBOOK_GENERATED_ASSETS: Record<string, SpecimenImageAsset> = {
  'editorial_utility:branch_centerfold': {
    assetId: 'eu_centerfold_hero',
    url: `${BASE}/eu-branch-centerfold.webp`,
    classification: 'GENERATED_ASSET',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
  },
  'editorial_utility:branch_receipts': {
    assetId: 'eu_receipt_prop',
    url: `${BASE}/eu-branch-receipts-isolated.webp`,
    classification: 'HYBRID_COMPOSITION',
    generationMethod: 'FAL_TEXT_TO_IMAGE + fal-ai/birefnet/v2',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
    compositeMap: {
      assetId: 'eu_receipt_prop',
      desktop: { xPct: 58, yPct: 22, widthPct: 26, rotationDeg: -4, anchor: 'top-left', zIndex: 3 },
      mobile: { xPct: 24, yPct: 6, widthPct: 52, rotationDeg: -2, anchor: 'top-left', zIndex: 3 },
      overlapRelationship: 'Overlaps the tile\u2019s right edge by ~8% on desktop; recomposed to sit centered near the top on mobile rather than shrinking in place.',
      shadow: 'Soft drop shadow belongs to the receipt asset itself (baked into the isolated PNG alpha).',
      safeArea: 'Bottom 55% of tile reserved for the LIME "FACTS" stamp + headline, kept clear of the receipt on both breakpoints.',
    },
  },
  'index_signal:signal_scan': {
    assetId: 'is_scan_hero',
    url: `${BASE}/is-signal-scan.webp`,
    classification: 'GENERATED_ASSET',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
  },
  'index_signal:signal_pattern': {
    assetId: 'is_card_prop',
    url: `${BASE}/is-signal-pattern-isolated.webp`,
    classification: 'HYBRID_COMPOSITION',
    generationMethod: 'FAL_TEXT_TO_IMAGE + fal-ai/birefnet/v2',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
    compositeMap: {
      assetId: 'is_card_prop',
      desktop: { xPct: 55, yPct: 15, widthPct: 34, rotationDeg: 4, anchor: 'top-left', zIndex: 3 },
      mobile: { xPct: 18, yPct: 8, widthPct: 60, rotationDeg: 2, anchor: 'top-left', zIndex: 3 },
      overlapRelationship: 'Sits above the cobalt cross-reference SVG lines, connection lines terminate at the card\u2019s grommet.',
      shadow: 'Baked into the isolated PNG alpha.',
      safeArea: 'Left column reserved for COBALT connection-line diagram on both breakpoints.',
    },
  },
  'kinetic_field:motion_push': {
    assetId: 'kf_push_hero',
    url: `${BASE}/kf-motion-push.webp`,
    classification: 'GENERATED_ASSET',
    generationMethod: 'FAL_TEXT_TO_IMAGE',
    backgroundTreatment: 'KEEP_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
  },
  'kinetic_field:motion_momentum': {
    assetId: 'kf_numeral_prop',
    url: `${BASE}/kf-motion-momentum-isolated.webp`,
    classification: 'HYBRID_COMPOSITION',
    generationMethod: 'FAL_TEXT_TO_IMAGE + fal-ai/birefnet/v2',
    backgroundTreatment: 'REMOVE_BACKGROUND',
    fidelityMode: 'DIRECTED_VARIATION',
    model: MODEL,
    approvalState: 'GENERATED',
    compositeMap: {
      assetId: 'kf_numeral_prop',
      desktop: { xPct: 60, yPct: 18, widthPct: 34, rotationDeg: -6, anchor: 'top-left', zIndex: 4 },
      mobile: { xPct: 22, yPct: 4, widthPct: 58, rotationDeg: -3, anchor: 'top-left', zIndex: 4 },
      overlapRelationship: 'Floats over the code-native radial motion-path line; the path is drawn to terminate at the numeral\u2019s base on both breakpoints.',
      shadow: 'Baked into the isolated PNG alpha.',
      safeArea: 'Lower third reserved for the kinetic headline/callout on both breakpoints.',
    },
  },
};

export function getGeneratedAsset(
  territoryKey: 'editorial_utility' | 'index_signal' | 'kinetic_field',
  specimenType: TerritorySpecimenType,
): SpecimenImageAsset | undefined {
  const key: RegistryKey = `${territoryKey}:${specimenType}` as RegistryKey;
  return NDXBOOK_GENERATED_ASSETS[key];
}
