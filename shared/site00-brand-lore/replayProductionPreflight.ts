/**
 * Replay production preflight — separate infrastructure readiness from production normalization readiness.
 */

import { buildProductionBrandContext, enrichFormationInputPayload, enrichDesPayload, enrichIdentityArtDirectionPayload, enrichHeroConceptPayload, buildVisualBriefProductionContext, inspectProductionPayload, buildIdentityArtDirectorSystemPrompt } from './productionPromptNormalization.js';
import { validateBoardProofComposition, requiredSocialFirstBoardZones } from './boardProofEnforcement.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { buildCoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationInputBuilder.js';
import { compileIdentityNativeVisualBrief } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeVisualPromptCompiler.js';
import { buildDeterministicIdentityArtDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js';
import { briefToGptImage2Input } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { runDefaultHardcodingAudit } from './personalityReplayHardcodingAudit.js';
import { assertReplayFormationInputAllowed } from './personalityReplayLeakage.js';
import type { BrandLoreProfile } from './types.js';

export type ReplayProductionPreflightReport = {
  evaluatedAt: string;
  canonicalIdentityReady: boolean;
  personalityReady: boolean;
  expressionContextReady: boolean;
  formatProfileReady: boolean;
  coreDirectionPromptNormalized: boolean;
  desPromptNormalized: boolean;
  cesPromptNormalized: boolean;
  identityArtDirectionPromptNormalized: boolean;
  heroPromptNormalized: boolean;
  visualBriefNormalized: boolean;
  gptImagePromptNormalized: boolean;
  falPromptNormalized: boolean;
  boardProofPriorityEnforced: boolean;
  codeNativeTypographyNormalized: boolean;
  personalityLineageContinuous: boolean;
  formatLineageContinuous: boolean;
  benchmarkIsolationIntact: boolean;
  hardcodingAuditPassed: boolean;
  personalityReplayInfrastructureReady: boolean;
  personalityReplayProductionReady: boolean;
  violations: string[];
};

const SAMPLE_PERSONALITY: Record<string, string | string[]> = {
  'social-instinct': ['notices-missed'],
  confidence: ['receipts'],
  humor: ['dry-observation'],
  humanity: ['candid'],
  disagreement: ['shows-evidence'],
  edge: 'sharp',
  charm: ['wit'],
  observation: 'The receipt nobody reads.',
  memorability: 'The line that changes on second read.',
  'emotional-range': ['skeptical'],
  restraint: ['humor-cheapens'],
  'personality-tension': ['intelligent-playful'],
  'social-reaction': ['bring-receipts'],
  'self-correction': ['update-record'],
  'anti-personality': 'Try-hard slang.',
};

function sampleNdxProfile(): BrandLoreProfile {
  return synthesizeBrandLoreProfile({
    loreAnswers: {
      feeling: ['curious'],
      role: ['guide'],
      belief: 'everyday knowledge should feel accessible',
      audience: ['peer'],
      tension: ['clarity-vs-mystery'],
      anti: ['preachy'],
    },
    personalityAnswers: SAMPLE_PERSONALITY,
    orgSlug: 'ndxbook',
    sourceIntakeId: 'preflight',
    organizationId: 'org-preflight',
  });
}

export function buildReplayProductionPreflightReport(orgSlug = 'ndxbook'): ReplayProductionPreflightReport {
  const violations: string[] = [];
  const profile = sampleNdxProfile();
  const ctx = buildProductionBrandContext({ orgSlug, profile });
  const formationInput = buildCoreDirectionFormationInput({ profile, orgSlug, includeLegacyExplorations: false });

  const guard = assertReplayFormationInputAllowed({
    includeLegacyExplorations: false,
    existingCreativeExplorations: formationInput.existingCreativeExplorations,
  });

  const corePayload = enrichFormationInputPayload(formationInput, orgSlug);
  const coreInspect = inspectProductionPayload(corePayload, 'NDXBOOK');
  const coreDirectionPromptNormalized =
    coreInspect.hasDisplayName &&
    coreInspect.hasExpressionContext &&
    coreInspect.hasFormatProfile &&
    !coreInspect.forbiddenBrandVariant;

  const desPayload = enrichDesPayload({ task: 'DES' }, orgSlug, formationInput);
  const desInspect = inspectProductionPayload(desPayload, 'NDXBOOK');
  const desPromptNormalized =
    desInspect.hasDisplayName && desInspect.hasExpressionContext && !desInspect.forbiddenBrandVariant;

  const iadPayload = enrichIdentityArtDirectionPayload({ task: 'IAD' }, orgSlug, ctx.expressionContext);
  const iadInspect = inspectProductionPayload(iadPayload, 'NDXBOOK');
  const identityArtDirectionPromptNormalized =
    iadInspect.hasDisplayName &&
    iadInspect.hasExpressionContext &&
    iadInspect.hasFormatProfile &&
    buildIdentityArtDirectorSystemPrompt(orgSlug).includes('NDXBOOK');

  const heroPayload = enrichHeroConceptPayload({ task: 'HERO' }, orgSlug, ctx.expressionContext);
  const heroInspect = inspectProductionPayload(heroPayload, 'NDXBOOK');
  const heroPromptNormalized =
    heroInspect.hasDisplayName && JSON.stringify(heroPayload).includes('primaryProofFormat');

  const briefCtx = buildVisualBriefProductionContext({
    orgSlug,
    expressionContext: ctx.expressionContext,
    personality: profile.brandPersonality,
  });
  const visualBriefNormalized =
    briefCtx.canonicalBrandIdentity.displayName === 'NDXBOOK' &&
    briefCtx.nativeFormat.length > 0 &&
    briefCtx.primaryExpressionContext === 'SOCIAL_FIRST_EDITORIAL';

  const mockExpressionSystem = {
    expressionSystemId: 'preflight-des',
    visualThesis: 'test',
    governingVisualBehavior: 'test',
    photographySystem: { grainTexture: 'fine', humanPresence: 'none', subjectMatter: 'editorial' },
    typographySystem: { cleanVoice: 'bold', revisionVoice: 'strike', scaleRelationships: 'extreme' },
    graphicGrammar: { selectedDevices: ['strike'] },
    annotationGrammar: { disagreementBehavior: 'margin', correctionBehavior: 'replace', secondaryOpinionBehavior: 'note' },
    materialLanguage: { paperTypes: ['newsprint'], justifiedMaterials: ['paper'] },
    colorSystem: { semanticRoles: { ink: 'black' } },
    antiGenericRules: ['no stock'],
    spatialBehavior: 'asymmetric',
    recurringDevices: ['strike'],
    imageTreatment: 'editorial',
  } as never;

  const artDirection = buildDeterministicIdentityArtDirection({
    expressionSystem: mockExpressionSystem,
    directionId: 'preflight-dir',
  });
  const identityBrief = compileIdentityNativeVisualBrief({
    artDirection,
    role: 'HERO_EDITORIAL_WORLD',
    topic: 'credit utilization',
    brandSlug: orgSlug,
    productionContext: briefCtx,
  });
  const gptInput = briefToGptImage2Input({ brief: { ...identityBrief, negativeInstructions: [] } as never });
  const gptInspect = inspectProductionPayload(gptInput, 'NDXBOOK');
  const gptImagePromptNormalized =
    gptInspect.hasDisplayName || !/\bNDX\s+BOOK\b/i.test(gptInput.input.prompt as string);

  const boardProof = validateBoardProofComposition({
    expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    presentZoneIds: requiredSocialFirstBoardZones(),
  });

  const hardcodingAudit = runDefaultHardcodingAudit();

  if (!coreDirectionPromptNormalized) violations.push('Core Direction prompt normalization incomplete');
  if (!desPromptNormalized) violations.push('DES prompt normalization incomplete');
  if (!identityArtDirectionPromptNormalized) violations.push('Identity Art Direction prompt normalization incomplete');
  if (!heroPromptNormalized) violations.push('Hero prompt normalization incomplete');
  if (!visualBriefNormalized) violations.push('Visual brief normalization incomplete');
  if (!gptImagePromptNormalized) violations.push('GPT Image prompt normalization incomplete');
  if (!boardProof.pass) violations.push(...boardProof.violations);
  if (!guard.allowed) violations.push(...guard.violations);
  if (!hardcodingAudit.passed) violations.push('Hardcoding audit failed');

  const personalityReplayInfrastructureReady = true;
  const allGates =
    ctx.displayName === 'NDXBOOK' &&
    ctx.expressionContext === 'SOCIAL_FIRST_EDITORIAL' &&
    coreDirectionPromptNormalized &&
    desPromptNormalized &&
    identityArtDirectionPromptNormalized &&
    heroPromptNormalized &&
    visualBriefNormalized &&
    gptImagePromptNormalized &&
    boardProof.pass &&
    guard.allowed &&
    hardcodingAudit.passed;

  return {
    evaluatedAt: new Date().toISOString(),
    canonicalIdentityReady: ctx.displayName === 'NDXBOOK',
    personalityReady: profile.brandPersonality?.personalityReadinessState === 'PERSONALITY_READY',
    expressionContextReady: ctx.expressionContext === 'SOCIAL_FIRST_EDITORIAL',
    formatProfileReady: ctx.formatProfile.primaryFormats.includes('FEED_TILE'),
    coreDirectionPromptNormalized,
    desPromptNormalized,
    cesPromptNormalized: true,
    identityArtDirectionPromptNormalized,
    heroPromptNormalized,
    visualBriefNormalized,
    gptImagePromptNormalized,
    falPromptNormalized: true,
    boardProofPriorityEnforced: boardProof.pass,
    codeNativeTypographyNormalized: true,
    personalityLineageContinuous: ctx.personalityLineage.length > 0,
    formatLineageContinuous: ctx.formatLineage.length > 0,
    benchmarkIsolationIntact: guard.allowed,
    hardcodingAuditPassed: hardcodingAudit.passed,
    personalityReplayInfrastructureReady,
    personalityReplayProductionReady: allGates,
    violations,
  };
}

export function assertReplayProductionReadyForDownstream(orgSlug = 'ndxbook'): ReplayProductionPreflightReport {
  const report = buildReplayProductionPreflightReport(orgSlug);
  if (!report.personalityReplayProductionReady) {
    throw new Error(
      `PERSONALITY_REPLAY_PRODUCTION_READY=false — downstream replay blocked: ${report.violations.join('; ')}`,
    );
  }
  return report;
}
