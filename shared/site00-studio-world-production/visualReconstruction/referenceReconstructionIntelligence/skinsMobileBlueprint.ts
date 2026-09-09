/**
 * SKINS mobile authority — ReferenceReconstructionBlueprint preset.
 */

import { SKINS_GEOMETRY_TOKENS, SKINS_FAMILY_LINE_BREAKS } from '../p0vr6/skinsReferenceFidelity.js';
import { getSkinsDesignAuthority } from '../p0vr6/skinsAuthorityRegistry.js';
import { approvedVisualAssetExists } from '../p0vr6/skinsCanonicalBindings.js';
import { measureReference } from './referenceMeasurementEngine.js';
import { inferReferenceLayout } from './referenceLayoutInferenceEngine.js';
import { buildReferenceReconstructionBlueprint } from './referenceReconstructionBlueprint.js';
import type { ReferenceRegion, ReferenceTypographySpec } from './types.js';

const MOBILE_REF_WIDTH = 941;
const MOBILE_REF_HEIGHT = 1672;

export function buildSkinsMobileRegionPreset(): ReferenceRegion[] {
  const geo = SKINS_GEOMETRY_TOKENS.mobile;
  const contentW = MOBILE_REF_WIDTH - 32;
  const familyY = Math.round(MOBILE_REF_HEIGHT * 0.335);
  const familyH = geo.familyThumbHeight + 28;

  return [
    {
      regionId: 'family-row',
      parentRegionId: 'shell',
      role: 'CARD',
      bbox: { x: 16, y: familyY, width: contentW, height: familyH },
      normalizedBbox: { x: 16 / MOBILE_REF_WIDTH, y: familyY / MOBILE_REF_HEIGHT, width: contentW / MOBILE_REF_WIDTH, height: familyH / MOBILE_REF_HEIGHT },
      zLayer: 12,
      visibility: 'VISIBLE',
      expectedOverflow: 'SCROLL_X' as const,
      expectedPositioning: 'FLEX',
      confidence: 0.92,
    },
    {
      regionId: 'screen-pack',
      parentRegionId: 'shell',
      role: 'SECTION',
      bbox: { x: 16, y: familyY + familyH + 20, width: contentW, height: geo.screenTileMinHeight * 4 + 24 },
      normalizedBbox: { x: 0.02, y: (familyY + familyH + 20) / MOBILE_REF_HEIGHT, width: contentW / MOBILE_REF_WIDTH, height: 0.25 },
      zLayer: 13,
      visibility: 'VISIBLE',
      expectedOverflow: 'VISIBLE',
      expectedPositioning: 'GRID',
      confidence: 0.9,
    },
    {
      regionId: 'preview-card',
      parentRegionId: 'shell',
      role: 'PANEL',
      bbox: { x: 16, y: MOBILE_REF_HEIGHT * 0.68, width: contentW, height: geo.previewThumbWidth + 80 },
      normalizedBbox: { x: 0.02, y: 0.68, width: contentW / MOBILE_REF_WIDTH, height: 0.15 },
      zLayer: 15,
      visibility: 'VISIBLE',
      expectedOverflow: 'HIDDEN',
      expectedPositioning: 'FLEX',
      confidence: 0.88,
    },
  ];
}

function buildSkinsTypographyPreset(): ReferenceTypographySpec[] {
  const geo = SKINS_GEOMETRY_TOKENS.mobile;
  const specs: ReferenceTypographySpec[] = [
    {
      regionId: 'experience-header',
      fontFamily: 'Martian Mono',
      fontSize: geo.sectionHeadSize,
      fontWeight: 700,
      letterSpacing: 0.06,
      lineHeight: 1.15,
      textTransform: 'UPPERCASE',
      alignment: 'LEFT',
      textWidth: null,
      lineCount: 1,
      lineBreakPositions: [],
      wrapMode: 'AUTO',
    },
    {
      regionId: 'family-name',
      fontFamily: 'Martian Mono',
      fontSize: geo.familyNameSize,
      fontWeight: 600,
      letterSpacing: 0.05,
      lineHeight: 1.15,
      textTransform: 'UPPERCASE',
      alignment: 'CENTER',
      textWidth: geo.familyCardWidth,
      lineCount: 1,
      lineBreakPositions: [],
      wrapMode: 'INTENTIONAL',
    },
  ];

  for (const [brandKey, lines] of Object.entries(SKINS_FAMILY_LINE_BREAKS)) {
    specs.push({
      regionId: `family-name-${brandKey}`,
      fontFamily: 'Martian Mono',
      fontSize: geo.familyNameSize,
      fontWeight: 600,
      letterSpacing: 0.05,
      lineHeight: 1.15,
      textTransform: 'UPPERCASE',
      alignment: 'CENTER',
      textWidth: geo.familyCardWidth,
      lineCount: lines.length,
      lineBreakPositions: lines.map((_, i) => i),
      wrapMode: 'INTENTIONAL',
    });
  }
  return specs;
}

export function buildSkinsMobileReferenceBlueprint() {
  const authority = getSkinsDesignAuthority('MOBILE');
  if (!authority) return null;

  const measurement = measureReference({
    authorityId: authority.authorityId,
    referenceImageUrl: authority.publicUrl,
    referenceNaturalWidth: MOBILE_REF_WIDTH,
    referenceNaturalHeight: MOBILE_REF_HEIGHT,
    viewport: 'mobile',
    authorityMode: 'DESIGN_AUTHORITY',
    fidelityMode: 'EXACT',
    liveCssViewportWidth: 390,
    liveCssViewportHeight: 844,
    regionPreset: buildSkinsMobileRegionPreset(),
    spacingPreset: {
      horizontalInset: 16,
      cardGap: geoToken().familyGap,
      internalPadding: 5,
      screenScopedTokens: {
        '--skins-mobile-family-w': `${geoToken().familyCardWidth}px`,
        '--skins-mobile-family-thumb-h': `${geoToken().familyThumbHeight}px`,
        '--skins-mobile-family-gap': `${geoToken().familyGap}px`,
      },
    },
    typographyPreset: buildSkinsTypographyPreset(),
    lineBreakPreset: Object.entries(SKINS_FAMILY_LINE_BREAKS).map(([brandKey, lines]) => ({
      regionId: `family-name-${brandKey}`,
      expectedLineCount: lines.length,
      expectedBreakPositions: lines,
      maxTextWidth: geoToken().familyCardWidth,
    })),
  });

  const layoutPlan = inferReferenceLayout(measurement);
  const assetRequirements = [
    { slotId: 'BRAND_FAMILY_NDXBOOK_THUMBNAIL', required: true, bound: approvedVisualAssetExists('MOBILE', 'BRAND_FAMILY_NDXBOOK') },
    { slotId: 'BRAND_FAMILY_FRONTAL_SLAYER_THUMBNAIL', required: true, bound: false },
    { slotId: 'BRAND_FAMILY_AIO_THUMBNAIL', required: true, bound: false },
    { slotId: 'BRAND_FAMILY_ASTRAL_WORLD_THUMBNAIL', required: true, bound: false },
    { slotId: 'BRAND_FAMILY_STUDIO_WORLD_THUMBNAIL', required: true, bound: false },
  ];

  return buildReferenceReconstructionBlueprint({
    authorityId: authority.authorityId,
    viewport: 'mobile',
    route: '/projects/site00/design?tab=SKINS',
    measurement,
    layoutPlan,
    assetRequirements,
    status: 'READY',
  });
}

function geoToken() {
  return SKINS_GEOMETRY_TOKENS.mobile;
}
