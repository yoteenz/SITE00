/**
 * Stage A Visual Proof Plans — handoff contract to FAL (recommendation only, no execution).
 */

import type { CoreDirectionFormationInput, FormedCoreDirection, VisualProofPlan } from './types.js';

function referenceIntents(input: CoreDirectionFormationInput): string[] {
  const intents: string[] = [];
  for (const ref of input.referenceEvidence.slice(0, 5)) {
    if (ref.founderNote?.trim()) {
      intents.push(`Extract behavior from reference note: ${ref.founderNote.trim()}`);
    }
  }
  if (input.currentReferenceSignals) {
    intents.push(`Current reference signal behavior: ${input.currentReferenceSignals}`);
  }
  intents.push('Do not extract literal layouts, protected marks, logos, or verbatim artwork.');
  return intents;
}

function mediumForExpression(context: CoreDirectionFormationInput['brandExpressionContext']): 'FAL_GENERATED' | 'CODE_NATIVE' {
  return context === 'SOCIAL_FIRST_EDITORIAL' ? 'FAL_GENERATED' : 'HYBRID_COMPOSITION';
}

export function buildVisualProofPlans(
  directions: FormedCoreDirection[],
  input: CoreDirectionFormationInput,
): VisualProofPlan[] {
  const refIntents = referenceIntents(input);
  const medium = mediumForExpression(input.brandExpressionContext);

  return directions.map((d) => ({
    directionId: d.directionId,
    directionName: d.directionName,
    heroWorld: {
      purpose: `Prove the ${d.governingBehavior} world at a glance`,
      mediumRecommendation: medium,
      referenceIntent: refIntents,
      generationNeed: `Hero scene embodying "${d.visualMetaphor}" — Stage A scope only`,
    },
    primaryArtifact: {
      purpose: `Stage A proof of ${d.primaryBrandArtifact}`,
      mediumRecommendation: 'FAL_GENERATED_AND_ISOLATED',
      referenceIntent: refIntents,
      generationNeed: d.primaryBrandArtifact,
    },
    socialExpression: {
      format: input.brandExpressionContext === 'SOCIAL_FIRST_EDITORIAL' ? 'social-first editorial card' : 'primary channel card',
      purpose: d.socialExpressionHypothesis || `Social expression hypothesis for ${d.directionName}`,
      mediumRecommendation: 'FAL_GENERATED',
    },
    typographicGraphicProof: {
      purpose: `Typographic attitude: ${d.typographicAttitude}`,
      mediumRecommendation: 'CODE_NATIVE',
      codeVsGeneratedDecision: 'Prefer code-native typography proof unless lore demands photographic type treatment',
    },
    materialObjectProof: {
      purpose: d.materialImageryLanguage
        ? `Material language sample: ${d.materialImageryLanguage.slice(0, 120)}`
        : `Material/object proof for ${d.directionName}`,
      mediumRecommendation: 'FAL_GENERATED' as const,
      generationNeed: d.materialImageryLanguage || d.primaryBrandArtifact,
    },
    motionSeed: {
      purpose: d.motionSeed || `Motion seed derived from ${d.governingBehavior}`,
      mediumRecommendation: 'FAL_GENERATED',
      proofType: 'motion-seed-loop-not-full-production',
    },
  }));
}
