/**
 * Intake synthesis gating — prevent public discovery from creating production intelligence.
 */

import { DISCOVERY_PROVENANCE } from '../site00-project-discovery/types.js';
import { isPostPurchaseIntelligenceQuestion } from '../site00-project-discovery/questionAudit.js';

export type IntakeSynthesisContext = {
  provenance: typeof DISCOVERY_PROVENANCE | 'POST_PURCHASE_INTELLIGENCE' | 'LEGACY_PRESERVE' | 'AUTHORIZED_PROJECT_INTAKE';
  commercialState?: string;
  projectActivated?: boolean;
  explicitProductionSynthesis?: boolean;
};

export function shouldSynthesizeBrandLoreFromIntake(ctx: IntakeSynthesisContext): boolean {
  if (ctx.explicitProductionSynthesis) return true;
  if (ctx.provenance === 'POST_PURCHASE_INTELLIGENCE' || ctx.provenance === 'AUTHORIZED_PROJECT_INTAKE') return true;
  if (ctx.provenance === 'LEGACY_PRESERVE') return true;
  if (ctx.projectActivated && (ctx.commercialState === 'PAID' || ctx.commercialState === 'ACTIVATED')) return true;
  return false;
}

export function shouldSynthesizeExperienceFromBuilderIntake(ctx: IntakeSynthesisContext): boolean {
  return shouldSynthesizeBrandLoreFromIntake(ctx);
}

export function publicDiscoveryCreatesZeroProductionProfiles(): boolean {
  return true;
}

export function publicPageVisitGeneratesZeroProviderRequests(): true {
  return true;
}

export function publicAutosaveGeneratesZeroProviderRequests(): true {
  return true;
}

export function loreAnswersInPublicIntakeShouldNotSynthesize(loreAnswers: Record<string, unknown>): boolean {
  const keys = Object.keys(loreAnswers);
  if (keys.length === 0) return true;
  return keys.some((k) => isPostPurchaseIntelligenceQuestion(k));
}

export function tagDraftPayloadDiscoveryProvenance<T extends Record<string, unknown>>(draft: T): T & { discoveryProvenance: typeof DISCOVERY_PROVENANCE } {
  return { ...draft, discoveryProvenance: DISCOVERY_PROVENANCE };
}

export function resolveIntakeSynthesisContext(params: {
  draftPayload: Record<string, unknown>;
  projectId?: string | null;
  intakeType: 'IDENTITY' | 'BUILDER';
}): IntakeSynthesisContext {
  const provenance = (params.draftPayload.discoveryProvenance as IntakeSynthesisContext['provenance']) ?? DISCOVERY_PROVENANCE;
  const commercialState = params.draftPayload.commercialState as string | undefined;
  const projectActivated = Boolean(params.projectId) && commercialState === 'ACTIVATED';
  const explicitProductionSynthesis = params.draftPayload.allowProductionIntelligenceSynthesis === true;

  if (params.intakeType === 'IDENTITY' && params.draftPayload.loreAnswers) {
    const loreKeys = Object.keys(params.draftPayload.loreAnswers as object);
    if (loreKeys.some((k) => isPostPurchaseIntelligenceQuestion(k)) && !explicitProductionSynthesis) {
      return { provenance: DISCOVERY_PROVENANCE, commercialState, projectActivated: false };
    }
  }

  return { provenance, commercialState, projectActivated, explicitProductionSynthesis };
}
