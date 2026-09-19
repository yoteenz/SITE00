/**
 * C1.7 — Campaign copy package cohesion QA.
 */

import type {
  CampaignCopyCohesionQA,
  CampaignCopySequence,
  CopyFailureClass,
  UnitCopyDirection,
} from '../../../shared/site00-expression-engine/campaign-copy/types.js';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

export function evaluateCampaignCopyCohesion(
  units: UnitCopyDirection[],
  sequence: CampaignCopySequence,
): CampaignCopyCohesionQA {
  const failures: CopyFailureClass[] = [];
  const captions = units.map((u) => normalize(u.finalCaption)).filter(Boolean);
  const uniqueCaptions = new Set(captions);

  if (captions.length > 2 && uniqueCaptions.size < captions.length * 0.6) {
    failures.push('COPY_CLONED_ACROSS_FORMATS');
    failures.push('PLATFORM_COPY_CLONED');
  }

  const ctaValues = Object.values(sequence.ctaUsedByUnit);
  const allSell = ctaValues.every((c) => c === 'SHOP' || c === 'SIGN_UP' || c === 'CLICK');
  if (allSell && ctaValues.length > 2) failures.push('EVERY_POST_SELLS');

  const rhetoricalSet = new Set(Object.values(sequence.rhetoricalBehaviorByUnit));
  const relationships = new Set(units.map((u) => u.visualRelationship));

  return {
    voiceConsistency: true,
    mediumNativeBehavior: units.every((u) => u.mediumNecessity.whyCopyBelongsHere.length > 10),
    visualComplementarity: units.some((u) =>
      ['COUNTERPOINT', 'AFTERSHOCK', 'WITHHOLD'].includes(u.visualRelationship),
    ),
    captionRoleClarity: units.every((u) => u.copyPackage.copyRole.length > 0),
    rhetoricalVariation: rhetoricalSet.size >= 3,
    ctaProgression: new Set(ctaValues).size >= 2,
    campaignSequence: sequence.openQuestions.length >= 1,
    brandSpecificity: units.every((u) => !u.finalCaption.toLowerCase().includes('generic brand')),
    repetitionRisk: failures.includes('COPY_CLONED_ACROSS_FORMATS'),
    conversionLogic: ctaValues.some((c) => c === 'SIGN_UP' || c === 'CLICK'),
    handoffStrength: units.some((u) => u.copyHandoff !== null),
    passed: failures.length === 0 && rhetoricalSet.size >= 3 && relationships.size >= 2,
    failureClasses: failures,
  };
}
