/**
 * P0.CBI.1 — BrandCreativeContextQA
 */

import { assertProjectFirewall } from './projectFirewall.js';
import { computeBrandSpecificityScore } from './brandSpecificityScore.js';
import { detectGenericBrandOutput } from './genericBrandOutputDetector.js';
import type { BrandCreativeContext, BrandCreativeContextQAResult } from './types.js';

export function runBrandCreativeContextQA(
  outputText: string,
  context: BrandCreativeContext,
  targetBrandId: string,
): BrandCreativeContextQAResult {
  const firewall = assertProjectFirewall(context, targetBrandId);
  const genericIssues = detectGenericBrandOutput(outputText, context);
  const specificityScore = computeBrandSpecificityScore(outputText, context);

  const boundaryViolations = context.creativeBoundaries.filter((b) => {
    if (b.severity !== 'BLOCK') return false;
    return outputText.toLowerCase().includes(b.rule.toLowerCase().slice(0, 20));
  });

  const offerAccuracy =
    !outputText.toLowerCase().includes('deferred') ||
    !context.offers.some((o) => o.status === 'DEFERRED');
  const offerAccuracyBool = Boolean(offerAccuracy);
  const audienceAccuracy = Boolean(
    !context.audience.primary.isUnknown || !outputText.toLowerCase().includes('women 18-35'),
  );
  const voiceFit = genericIssues.filter((i) => i.severity === 'FAIL').length === 0;
  const visualFit = firewall.pass;
  const worldFit = Boolean(
    specificityScore.worldSpecificity >= 0.3 || context.worldBuilding.locations.isUnknown === true,
  );

  const pass =
    firewall.pass &&
    boundaryViolations.length === 0 &&
    genericIssues.filter((i) => i.severity === 'FAIL').length === 0 &&
    specificityScore.overall >= 0.35;

  return {
    pass,
    offerAccuracy: offerAccuracyBool,
    audienceAccuracy,
    voiceFit,
    visualFit,
    worldFit,
    boundaryViolations,
    crossProjectLeakage: firewall.violations,
    genericIssues,
    specificityScore,
  };
}

export class BrandCreativeContextQA {
  evaluate(outputText: string, context: BrandCreativeContext, targetBrandId: string): BrandCreativeContextQAResult {
    return runBrandCreativeContextQA(outputText, context, targetBrandId);
  }
}

export const brandCreativeContextQA = new BrandCreativeContextQA();
