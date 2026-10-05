/**
 * High-fidelity structural seed for NDX overview mobile — used when vision API unavailable in tests
 * or as parse fallback after validated vision JSON.
 */

import type { LiteralRegionSpec, VisionReplicationObservation } from './types.js';

export function buildNdxHeroStructuralObservation(): VisionReplicationObservation {
  return {
    regionId: 'hero-editorial',
    authorityDescription:
      'Black dominant hero band; left editorial copy column with kicker, headline, CTA; center stack of 3 grayscale photo slices with vertical dividers; lime NDX graphic overlay block; right-side visual structure with supporting graphic; strong internal segmentation.',
    twinDescription: 'Single media frame with placeholder or one background image; collapsed copy column; empty decorative side cell.',
    visibleDifferences: [
      'Missing multi-slice grayscale photography stack',
      'Missing lime NDX graphic overlay',
      'Collapsed to single media block',
      'CTA not visually anchored in copy column',
    ],
    missingElements: ['image slices', 'lime ndx graphic', 'internal dividers', 'CTA button'],
    extraElements: ['large beige placeholder'],
    geometryDifferences: ['Authority split 3-column hero vs twin single block'],
    surfaceDifferences: ['Authority black field vs twin neutral/beige media area'],
    typographyDifferences: ['Editorial kicker/headline hierarchy weaker on twin'],
    assetDifferences: ['Twin missing bound hero photography and NDX graphic slots'],
    layoutRelationships: ['copy leftOf imagery', 'lime overlaps imagery', 'graphic rightOf copy'],
    literalCorrections: [
      'ADD subregion left_copy_region',
      'ADD subregion center_image_slices',
      'ADD subregion lime_ndx_region',
      'ADD subregion right_visual_region',
      'REMOVE generic single hero placeholder',
      'BIND image slots or mark ASSET_MISSING with literal geometry',
    ],
    confidence: 'HIGH',
    status: 'OK',
  };
}

export function observationToLiteralRegionSpec(observation: VisionReplicationObservation): LiteralRegionSpec {
  if (observation.regionId === 'hero-editorial') {
    return {
      regionId: 'hero-editorial',
      bounds: '0,208,390,212',
      surface: 'black dominant field',
      subregions: [
        { id: 'left_copy_region', role: 'editorial copy + CTA', bounds: '0-38% width', surface: 'black', relationships: [{ type: 'leftOf', targetId: 'center_image_region' }] },
        { id: 'center_image_region', role: 'grayscale image slices', bounds: '38-72% width', surface: 'grayscale photography', relationships: [{ type: 'rightOf', targetId: 'left_copy_region' }, { type: 'leftOf', targetId: 'right_visual_region' }] },
        { id: 'lime_ndx_region', role: 'lime NDX overlay', bounds: 'over center_image_region', surface: 'lime accent', relationships: [{ type: 'overlaps', targetId: 'center_image_region' }] },
        { id: 'right_visual_region', role: 'right graphic structure', bounds: '72-100% width', surface: 'black + graphic', relationships: [{ type: 'rightOf', targetId: 'center_image_region' }] },
      ],
      textBlocks: [
        { id: 'hero_kicker', role: 'kicker', approximateLines: 1 },
        { id: 'hero_headline', role: 'headline', approximateLines: 2 },
        { id: 'hero_cta', role: 'cta', approximateLines: 1 },
      ],
      imageSlots: [
        { slotId: 'slice_a', expectedAssetType: 'photography', authorityCrop: 'hero-center-top', existingAssetCandidate: null, selectedAsset: null, bindingStatus: 'ASSET_MISSING', fallbackStatus: 'LITERAL_SLOT' },
        { slotId: 'slice_b', expectedAssetType: 'photography', authorityCrop: 'hero-center-mid', existingAssetCandidate: null, selectedAsset: null, bindingStatus: 'ASSET_MISSING', fallbackStatus: 'LITERAL_SLOT' },
        { slotId: 'slice_c', expectedAssetType: 'photography', authorityCrop: 'hero-center-bottom', existingAssetCandidate: null, selectedAsset: null, bindingStatus: 'ASSET_MISSING', fallbackStatus: 'LITERAL_SLOT' },
      ],
      graphicSlots: [
        { slotId: 'lime_ndx', expectedAssetType: 'graphic', authorityCrop: 'hero-lime-overlay', existingAssetCandidate: null, selectedAsset: null, bindingStatus: 'ASSET_MISSING', fallbackStatus: 'LITERAL_SLOT' },
        { slotId: 'right_graphic', expectedAssetType: 'graphic', authorityCrop: 'hero-right', existingAssetCandidate: null, selectedAsset: null, bindingStatus: 'ASSET_MISSING', fallbackStatus: 'LITERAL_SLOT' },
      ],
      controls: [{ id: 'hero_cta', kind: 'button' }],
      dividers: ['vertical between image slices', 'hero bottom edge'],
      relationships: [
        { type: 'leftOf', a: 'left_copy_region', b: 'center_image_region' },
        { type: 'overlaps', a: 'lime_ndx_region', b: 'center_image_region' },
        { type: 'rightOf', a: 'right_visual_region', b: 'center_image_region' },
      ],
      spacing: ['tight editorial copy', 'image slices flush stack'],
      dominantColors: ['#000000', '#ffffff', '#c4ff00', 'grayscale'],
      sourceConfidence: observation.confidence,
    };
  }

  if (observation.regionId === 'host-header') {
    return {
      regionId: 'host-header',
      bounds: '0,0,390,52',
      surface: 'white host chrome',
      subregions: [
        { id: 'host_brand', role: 'SITE 00 wordmark + red diamond', bounds: 'left', surface: 'white', relationships: [] },
        { id: 'host_actions', role: 'menu + avatar', bounds: 'right', surface: 'white', relationships: [{ type: 'rightOf', targetId: 'host_brand' }] },
      ],
      textBlocks: [{ id: 'wordmark', role: 'SITE 00', approximateLines: 1 }],
      imageSlots: [],
      graphicSlots: [{ slotId: 'red_diamond', expectedAssetType: 'icon', authorityCrop: 'host-diamond', existingAssetCandidate: null, selectedAsset: 'Site00Diamond', bindingStatus: 'BOUND', fallbackStatus: 'NONE' }],
      controls: [{ id: 'menu', kind: 'icon-button' }, { id: 'avatar', kind: 'avatar' }],
      dividers: ['bottom hairline divider'],
      relationships: [{ type: 'alignedTop', a: 'host_brand', b: 'host_actions' }],
      spacing: ['14px horizontal padding'],
      dominantColors: ['white', 'red diamond', 'black text'],
      sourceConfidence: observation.confidence,
    };
  }

  return {
    regionId: observation.regionId,
    bounds: observation.regionId,
    surface: 'measured band',
    subregions: [{ id: `${observation.regionId}_main`, role: observation.authorityDescription.slice(0, 80), bounds: 'full', relationships: [] }],
    textBlocks: [],
    imageSlots: [],
    graphicSlots: [],
    controls: [],
    dividers: [],
    relationships: [],
    spacing: [],
    dominantColors: [],
    sourceConfidence: observation.confidence,
  };
}

export function buildNdxHostHeaderObservation(): VisionReplicationObservation {
  return {
    regionId: 'host-header',
    authorityDescription: 'SITE 00 wordmark, red diamond, menu icon, avatar, fixed header height, bottom divider, balanced left/right alignment.',
    twinDescription: 'Similar host chrome but spacing and divider weight may drift from authority.',
    visibleDifferences: ['Divider weight', 'Avatar/menu spacing'],
    missingElements: [],
    extraElements: [],
    geometryDifferences: [],
    surfaceDifferences: [],
    typographyDifferences: [],
    assetDifferences: [],
    layoutRelationships: ['diamond leftOf wordmark', 'actions anchoredToEdge right'],
    literalCorrections: ['MATCH header height', 'ALIGN menu and avatar spacing', 'REPRODUCE bottom divider'],
    confidence: 'MEDIUM',
    status: 'OK',
  };
}
