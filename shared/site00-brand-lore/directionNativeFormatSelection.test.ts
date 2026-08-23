import { describe, expect, it } from 'vitest';
import {
  deriveNativeFormatForDirection,
  runFormatAssignmentContaminationTest,
  computeObservedFormatDiversity,
  auditPreservedDirectionFormat,
} from './directionNativeFormatSelection.js';
import type { FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import { deriveFormatNativeExpressionProfile } from './formatNativeExpression.js';

function direction(partial: Partial<FormedCoreDirection> & { directionName: string }): FormedCoreDirection {
  return {
    directionId: partial.directionId ?? 'dir-1',
    directionName: partial.directionName,
    bigIdea: partial.bigIdea ?? 'Big',
    oneLineThesis: partial.oneLineThesis ?? 'Thesis',
    brandConnection: partial.brandConnection ?? 'Conn',
    culturalReference: partial.culturalReference ?? 'Ref',
    emotionalPromise: partial.emotionalPromise ?? 'Promise',
    visualMetaphor: partial.visualMetaphor ?? 'Metaphor',
    governingBehavior: partial.governingBehavior ?? 'Behavior',
    materialImageryLanguage: partial.materialImageryLanguage ?? 'Material',
    typographicAttitude: partial.typographicAttitude ?? 'Type',
    coreColorLogic: partial.coreColorLogic ?? 'Color',
    signatureDevices: partial.signatureDevices ?? ['device'],
    primaryBrandArtifact: partial.primaryBrandArtifact ?? 'Artifact',
    proprietaryQuality: partial.proprietaryQuality ?? 'Prop',
    antiDirection: partial.antiDirection ?? ['generic'],
    loreLineage: partial.loreLineage ?? ['lore'],
    conceptualAncestor: partial.conceptualAncestor ?? 'ancestor',
    audienceRole: partial.audienceRole ?? 'audience',
    brandRole: partial.brandRole ?? 'brand',
    imageryLanguage: partial.imageryLanguage ?? 'imagery',
    colorLogic: partial.colorLogic ?? 'color',
    motionSeed: partial.motionSeed ?? 'motion',
    socialExpressionHypothesis: partial.socialExpressionHypothesis ?? 'social',
    risks: partial.risks ?? [],
  };
}

const formatProfile = deriveFormatNativeExpressionProfile({
  context: 'SOCIAL_FIRST_EDITORIAL',
  profile: null,
  personality: null,
});

describe('deriveNativeFormatForDirection', () => {
  it('selects format from direction signals without rotation input', () => {
    const d = direction({
      directionName: 'THE RECEIPT INDEX',
      oneLineThesis: 'Saveable reference checklist for credit rules',
      socialExpressionHypothesis: 'Pin this reference archive',
      primaryBrandArtifact: 'Saveable reference post',
    });
    const sel = deriveNativeFormatForDirection({ direction: d, formatProfile });
    expect(sel.formatSelectionDerivedFromDirection).toBe(true);
    expect(sel.selectionMethod).toBe('DIRECTION_DERIVED');
    expect(runFormatAssignmentContaminationTest(sel).rotationAlgorithmUsed).toBe(false);
  });

  it('allows duplicate formats as observed outcome', () => {
    const d1 = deriveNativeFormatForDirection({
      direction: direction({ directionName: 'A', socialExpressionHypothesis: 'carousel swipe cover' }),
      formatProfile,
    });
    const d2 = deriveNativeFormatForDirection({
      direction: direction({ directionName: 'B', socialExpressionHypothesis: 'carousel swipe cover editorial' }),
      formatProfile,
    });
    const observed = computeObservedFormatDiversity([d1.nativeFormat, d2.nativeFormat]);
    expect(observed.duplicateFormatsAllowed).toBe(true);
    if (d1.nativeFormat === d2.nativeFormat) {
      expect(observed.notes.some((n) => n.includes('independently selected'))).toBe(true);
    }
  });
});

describe('auditPreservedDirectionFormat', () => {
  it('records mechanical profile default when assigned format differs from direction-derived', () => {
    const d = direction({
      directionName: 'THE SIGNAL SCAN',
      socialExpressionHypothesis: 'reel hook motion vertical',
      motionSeed: 'kinetic loop',
    });
    const audit = auditPreservedDirectionFormat({
      direction: d,
      assignedFormat: 'CAROUSEL_COVER',
      formatProfile,
    });
    expect(audit.nativeFormat).toBe('CAROUSEL_COVER');
    expect(audit.formatSelectionEvidence.some((e) => e.includes('MECHANICAL'))).toBe(true);
  });
});
