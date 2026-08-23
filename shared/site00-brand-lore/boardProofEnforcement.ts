/**
 * Format-proof priority enforcement for Creative Direction boards.
 */

import type { BrandExpressionContext } from './types.js';
import {
  resolveFormatProofPriorities,
  formatsAreResizeOnlyAliases,
  type FormatProofPriority,
} from './formatNativeExpression.js';

export type BoardZoneFormatMapping = {
  zoneId: string;
  formatKeys: string[];
  priority: FormatProofPriority;
};

const SOCIAL_ZONE_MAPPINGS: BoardZoneFormatMapping[] = [
  { zoneId: 'socialExpression', formatKeys: ['FEED_TILE', 'STORY_FRAME', 'STORY_SEQUENCE'], priority: 'HIGH' },
  { zoneId: 'motionSeedStrip', formatKeys: ['REEL_HOOK', 'REEL_FRAME', 'MOTION_KEYFRAME', 'TIKTOK_VERTICAL'], priority: 'HIGH' },
  { zoneId: 'primaryRevisionArtifact', formatKeys: ['CAROUSEL_COVER', 'CAROUSEL_SEQUENCE'], priority: 'HIGH' },
  { zoneId: 'typographicInterruption', formatKeys: ['TYPOGRAPHY_SPECIMEN'], priority: 'MEDIUM' },
  { zoneId: 'heroEditorialSpread', formatKeys: ['GENERIC_POSTER', 'WEBSITE_PAGE'], priority: 'LOW' },
  { zoneId: 'supportingPhotography', formatKeys: ['MATERIAL_SPECIMEN'], priority: 'MEDIUM' },
];

const LOW_PRIORITY_FORMATS = new Set(['WEBSITE_PAGE', 'GENERIC_POSTER', 'DESKTOP_MOCKUP']);

export function mapBoardZonesToFormatProofs(zoneIds: string[]): string[] {
  const formats: string[] = [];
  for (const zoneId of zoneIds) {
    const mapping = SOCIAL_ZONE_MAPPINGS.find((m) => m.zoneId === zoneId);
    if (mapping) formats.push(...mapping.formatKeys);
  }
  return [...new Set(formats)];
}

export function validateBoardProofComposition(params: {
  expressionContext: BrandExpressionContext;
  presentZoneIds: string[];
  presentFormatKeys?: string[];
  resizeOnlyFormats?: string[];
}): {
  pass: boolean;
  violations: string[];
  highPriorityCount: number;
  lowPriorityPrimaryOnly: boolean;
} {
  const violations: string[] = [];
  const priorities = resolveFormatProofPriorities(params.expressionContext);

  if (params.expressionContext !== 'SOCIAL_FIRST_EDITORIAL') {
    return { pass: true, violations: [], highPriorityCount: 0, lowPriorityPrimaryOnly: false };
  }

  const formatsFromZones = mapBoardZonesToFormatProofs(params.presentZoneIds);
  const allFormats = [...new Set([...formatsFromZones, ...(params.presentFormatKeys ?? [])])];

  const highPriorityFormats = allFormats.filter((f) => priorities[f] === 'HIGH');
  const highPriorityCount = highPriorityFormats.length;

  if (highPriorityCount < 2) {
    violations.push(
      `Social-first board requires at least 2 HIGH-priority native format proofs; found ${highPriorityCount}`,
    );
  }

  const hasSocialZone = params.presentZoneIds.some((z) =>
    ['socialExpression', 'motionSeedStrip', 'primaryRevisionArtifact'].includes(z),
  );
  if (!hasSocialZone) {
    violations.push('Social-first board missing required social-native zones (socialExpression, motionSeedStrip, or primaryRevisionArtifact)');
  }

  const onlyLowZones =
    params.presentZoneIds.length > 0 &&
    params.presentZoneIds.every((z) => {
      const mapping = SOCIAL_ZONE_MAPPINGS.find((m) => m.zoneId === z);
      return mapping?.priority === 'LOW';
    });
  if (onlyLowZones) {
    violations.push('Board cannot consist primarily of LOW-priority proofs (generic poster / website mockup)');
  }

  const lowAsPrimary =
    highPriorityCount === 0 &&
    allFormats.some((f) => LOW_PRIORITY_FORMATS.has(f));
  if (lowAsPrimary) {
    violations.push('Generic poster or website mockup cannot satisfy primary proof for social-first brand');
  }

  if (params.resizeOnlyFormats?.length && formatsAreResizeOnlyAliases(params.resizeOnlyFormats)) {
    violations.push('Resize-only format aliases rejected — format adaptation ≠ resizing');
  }

  return {
    pass: violations.length === 0,
    violations,
    highPriorityCount,
    lowPriorityPrimaryOnly: lowAsPrimary,
  };
}

/** Standard social-first board zone set that satisfies proof requirements. */
export function requiredSocialFirstBoardZones(): string[] {
  return ['socialExpression', 'motionSeedStrip', 'primaryRevisionArtifact', 'typographicInterruption'];
}

export function assertSocialFirstBoardProof(params: {
  expressionContext: BrandExpressionContext;
  presentZoneIds: string[];
}): void {
  const result = validateBoardProofComposition({
    expressionContext: params.expressionContext,
    presentZoneIds: params.presentZoneIds,
  });
  if (!result.pass) {
    throw new Error(`Board proof enforcement failed: ${result.violations.join('; ')}`);
  }
}
