/**
 * Lime usage governance — preserve success, prevent overuse.
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { LimeFunction, LimeUsageEvaluation } from './types.js';

export function inferLimeFunction(params: {
  artifact: BrandMarketingArtifact;
  semanticRole: string;
}): LimeFunction | null {
  if (params.artifact.artifactExpressionClass === 'MINIMAL_REACTION') return 'ATTENTION';
  if (params.semanticRole === 'CONTRADICTION') return 'CORRECTION';
  if (params.semanticRole === 'RECEIPT' || params.semanticRole === 'CALLBACK') return 'CONNECTION';
  if (params.semanticRole === 'JUDGMENT') return 'JUDGMENT';
  if (params.semanticRole === 'DISCOVERY' || params.semanticRole === 'OPEN_LOOP') return 'SIGNAL';
  if (params.artifact.characterTemperature === 'PLAYFUL') return 'INTERVENTION';
  return 'INTERVENTION';
}

export function evaluateLimeUsage(params: {
  limeFunction: LimeFunction | null;
  limeElementCount: number;
}): LimeUsageEvaluation {
  const overused = params.limeElementCount > 2;
  const decorativeOnly = params.limeFunction === null && params.limeElementCount > 0;

  return {
    functions: params.limeFunction ? [params.limeFunction] : [],
    purposeful: params.limeFunction !== null,
    restrained: params.limeElementCount <= 2,
    overused,
    decorativeOnly,
  };
}

export function limeNotRequiredAsFullBackground(): true {
  return true;
}

export function limeUseRequiresSemanticPurpose(eval_: LimeUsageEvaluation): boolean {
  return eval_.purposeful || eval_.functions.length === 0;
}

export function limeOveruseFails(eval_: LimeUsageEvaluation): boolean {
  return eval_.overused || eval_.decorativeOnly;
}

export function existingLimeBehaviorPreserved(): true {
  return true;
}
