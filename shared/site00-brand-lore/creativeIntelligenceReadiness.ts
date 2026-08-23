/**
 * Canonical creative-intelligence readiness aggregation — Lore + Personality + Expression Context.
 */

import type { BrandLoreProfile } from './types.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import {
  evaluateBrandPersonalityReadiness,
  canBeginCoreDirectionFormation,
} from './personalityReadiness.js';

export type CreativeIntelligenceReadiness = {
  brandLoreReadiness: ReturnType<typeof evaluateCreativeDirectionReadiness>;
  brandPersonalityReadiness: ReturnType<typeof evaluateBrandPersonalityReadiness>;
  expressionContextReadiness: {
    known: boolean;
    context: BrandLoreProfile['contextClassification'];
  };
  coreDirectionReady: boolean;
  missingLoreDomains: string[];
  missingPersonalityDomains: string[];
  missingExpressionContext: boolean;
};

export function resolveCreativeIntelligenceReadiness(profile: BrandLoreProfile): CreativeIntelligenceReadiness {
  const brandLoreReadiness = evaluateCreativeDirectionReadiness(profile);
  const brandPersonalityReadiness = evaluateBrandPersonalityReadiness(profile.brandPersonality, profile);
  const expressionContextReadiness = {
    known: profile.contextClassification !== null,
    context: profile.contextClassification,
  };
  const coreDirectionReady = canBeginCoreDirectionFormation({
    loreState: profile.readinessState,
    personalityState: brandPersonalityReadiness.state,
  });

  return {
    brandLoreReadiness,
    brandPersonalityReadiness,
    expressionContextReadiness,
    coreDirectionReady,
    missingLoreDomains: brandLoreReadiness.missingDomains ?? [],
    missingPersonalityDomains: brandPersonalityReadiness.missingDomains ?? [],
    missingExpressionContext: !expressionContextReadiness.known,
  };
}
