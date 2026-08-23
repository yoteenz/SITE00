/**
 * Creative-refined identity hero V2 tests (THE MARKED-UP COPY only).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inspectMartianMonoAvailability } from './martianMonoTypography.js';
import {
  buildDeterministicCreativeExpression,
  buildDeterministicHeroConcept,
} from './creativeExpressionService.js';
import { evaluateCopyQualityFromScores } from './copyQualityGate.js';
import {
  compileIdentityNativeV2VisualBrief,
  IDENTITY_NATIVE_V2_MAX_PROMPT_CHARS,
  v2BriefIncludesCreativeExpression,
  v2BriefIncludesMartianMono,
} from './identityNativeVisualBriefV2Compiler.js';
import { evaluateIdentityNativeV2QaFromScores } from './identityNativeVisualRawInspectorV2.js';
import { buildDeterministicIdentityArtDirection } from './identityNativeArtDirectorService.js';
import { buildMarkedUpCopyExpressionSystemFallback, BRAND_NATIVE_PILOT_ASSET_ROLE, BRAND_NATIVE_PILOT_TOPIC } from './markedUpCopyBrandNativeVisualPilot.js';
import { runMarkedUpCopyIdentityNativeHeroPilotV2 } from './markedUpCopyIdentityNativeHeroPilotV2.js';
import { IDENTITY_NATIVE_HERO_V2_ASSET_ID } from './creativeExpressionTypes.js';
import * as gptAdapter from './gptImage2VisualProviderAdapter.js';
import * as storage from '../../../site00Assts/storage.js';
import * as rawInspector from './identityNativeVisualRawInspectorV2.js';
import * as refResolver from './boardReferenceResolver.js';
import * as artDirector from './identityNativeArtDirectorService.js';
import * as creativeExpression from './creativeExpressionService.js';
import * as copyGate from './copyQualityGate.js';

const expressionSystem = buildMarkedUpCopyExpressionSystemFallback({ directionId: 'marked-up-copy' });
const artDirection = buildDeterministicIdentityArtDirection({ expressionSystem, directionId: 'marked-up-copy' });
const typographyRoles = inspectMartianMonoAvailability();

describe('MartianMonoTypography', () => {
  it('1. detects Martian Mono in project fonts', () => {
    expect(typographyRoles.martianMonoAvailable).toBe(true);
    expect(typographyRoles.actualSource).toContain('site00-fonts.css');
  });

  it('2. defines multi-voice typographic roles', () => {
    expect(typographyRoles.displayVoice).toContain('DISPLAY');
    expect(typographyRoles.systemVoice.toLowerCase()).toContain('martian mono');
    expect(typographyRoles.marginVoice).toContain('MARGIN');
  });
});

describe('CreativeExpressionLayer', () => {
  it('3. builds CreativeExpressionSystem fallback', () => {
    const ce = buildDeterministicCreativeExpression({ artDirection, typographyRoles });
    expect(ce.editorialPersonality.length).toBeGreaterThan(0);
    expect(ce.witMechanics.length).toBeGreaterThan(0);
    expect(ce.secondReadDiscoveryRules.length).toBeGreaterThan(0);
  });

  it('4. builds HeroCreativeConcept with authored copy', () => {
    const concept = buildDeterministicHeroConcept('credit utilization');
    expect(concept.cleanClaim.length).toBeGreaterThan(5);
    expect(concept.marginCounterpoint.length).toBeGreaterThan(5);
    expect(concept.martianMonoApplication.length).toBeGreaterThan(0);
    expect(concept.graphicInterventions.every((g) => g.semanticPurpose)).toBe(true);
  });
});

describe('CopyQualityGate', () => {
  it('5. enforces copy thresholds', () => {
    const fail = evaluateCopyQualityFromScores({
      editorialVoice: 3,
      wit: 3,
      specificity: 3,
      memorability: 3,
      directionFit: 4,
      reasons: [],
    });
    expect(fail.pass).toBe(false);

    const pass = evaluateCopyQualityFromScores({
      editorialVoice: 4,
      wit: 4,
      specificity: 4,
      memorability: 4,
      directionFit: 5,
      reasons: [],
    });
    expect(pass.pass).toBe(true);
  });
});

describe('IdentityNativeV2BriefCompiler', () => {
  it('6. includes creative expression and Martian Mono in prompt', () => {
    const ce = buildDeterministicCreativeExpression({ artDirection, typographyRoles });
    const concept = buildDeterministicHeroConcept(BRAND_NATIVE_PILOT_TOPIC);
    const brief = compileIdentityNativeV2VisualBrief({
      artDirection,
      creativeExpression: ce,
      heroConcept: concept,
      copyQualityScores: { editorialVoice: 4, wit: 4, specificity: 4, memorability: 4, directionFit: 5, pass: true, reasons: [] },
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.assetId).toBe(IDENTITY_NATIVE_HERO_V2_ASSET_ID);
    expect(v2BriefIncludesCreativeExpression(brief)).toBe(true);
    expect(v2BriefIncludesMartianMono(brief)).toBe(true);
    expect(brief.compiledPrompt).toContain(concept.cleanClaim);
    expect(brief.compiledPrompt.length).toBeLessThanOrEqual(IDENTITY_NATIVE_V2_MAX_PROMPT_CHARS);
  });
});

describe('IdentityNativeV2Qa', () => {
  it('7. extended personality dimensions required for accept', () => {
    const qa = evaluateIdentityNativeV2QaFromScores({
      identityNativeScore: 5,
      directionNativeScore: 5,
      paletteFidelity: 5,
      typographicDna: 5,
      graphicGrammarFidelity: 5,
      artifactDesignAuthority: 5,
      stockResemblance: 0,
      topicClicheScore: 0,
      voicePersonality: 5,
      wit: 5,
      compositionalArtistry: 5,
      secondReadDepth: 5,
      visualSurprise: 5,
      restraint: 5,
      martianMonoIntegration: 5,
      memorability: 5,
      artDirectionQa: 'PASS',
      textPrecisionQa: 'NEEDS_HUMAN_REVIEW',
      threeSecondTest: 'PASS',
      thirtySecondTest: 'PASS',
      personalityRemovalTest: 'PASS',
      logoRemovalTestV2: 'PASS',
      strangerTest: 'PASS',
      reasons: [],
      visionInspected: true,
    });
    expect(qa.result).toBe('ACCEPT');
  });
});

describe('MarkedUpCopyIdentityNativeHeroPilotV2', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('8. generates exactly one V2 hero', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({ resolved: [], missing: [] });
    vi.spyOn(artDirector, 'runIdentityNativeArtDirector').mockResolvedValue({
      artDirection,
      anthropicRequests: 1,
      usage: { inputTokens: 100, outputTokens: 200 },
    });
    vi.spyOn(creativeExpression, 'runCreativeExpressionDirector').mockResolvedValue({
      creativeExpression: buildDeterministicCreativeExpression({ artDirection, typographyRoles }),
      heroConcept: buildDeterministicHeroConcept(BRAND_NATIVE_PILOT_TOPIC),
      anthropicRequests: 2,
    });
    vi.spyOn(copyGate, 'runCopyQualityGate').mockResolvedValue({
      scores: { editorialVoice: 4, wit: 4, specificity: 4, memorability: 4, directionFit: 5, pass: true, reasons: [] },
      revisedCopy: null,
      revisionRounds: 0,
      visionInspected: true,
    });
    const generateSpy = vi.spyOn(gptAdapter, 'generateIdentityNativeImageFromBrief').mockResolvedValue({
      url: 'https://example.com/v2.webp',
      model: 'openai/gpt-image-2',
      costEstimateUsd: 0.045,
    });
    vi.spyOn(storage, 'downloadUrlToBuffer').mockResolvedValue(Buffer.from('fake'));
    vi.spyOn(storage, 'uploadSite00AssetBuffer').mockResolvedValue({
      publicUrl: 'https://storage.example/v2.webp',
      storagePath: 'site00/assts/batches/ndxbook-identity-native-v2-pilot/generated/x.webp',
    });
    vi.spyOn(rawInspector, 'inspectIdentityNativeV2Image').mockResolvedValue({
      identityNativeScore: 4,
      directionNativeScore: 5,
      paletteFidelity: 4,
      typographicDna: 4,
      graphicGrammarFidelity: 4,
      artifactDesignAuthority: 4,
      stockResemblance: 1,
      topicClicheScore: 0,
      voicePersonality: 4,
      wit: 4,
      compositionalArtistry: 4,
      secondReadDepth: 4,
      visualSurprise: 4,
      restraint: 4,
      martianMonoIntegration: 4,
      memorability: 4,
      artDirectionQa: 'PASS',
      textPrecisionQa: 'NEEDS_HUMAN_REVIEW',
      threeSecondTest: 'PASS',
      thirtySecondTest: 'PASS',
      personalityRemovalTest: 'PASS',
      preOverlayIdentityRecognitionTest: 'PASS',
      logoRemovalTestV2: 'PASS',
      strangerTest: 'PASS',
      result: 'ACCEPT',
      reasons: [],
      visionInspected: true,
    });

    const result = await runMarkedUpCopyIdentityNativeHeroPilotV2({ dryRun: false });
    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(result.pilot?.assetId).toBe(IDENTITY_NATIVE_HERO_V2_ASSET_ID);
    expect(result.otherAssetsGenerated).toBe(0);
    vi.unstubAllEnvs();
  });

  it('9. dry run generates no assets', async () => {
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({ resolved: [], missing: [] });
    vi.spyOn(artDirector, 'runIdentityNativeArtDirector').mockResolvedValue({
      artDirection,
      anthropicRequests: 0,
      usage: { inputTokens: 0, outputTokens: 0 },
    });
    vi.spyOn(creativeExpression, 'runCreativeExpressionDirector').mockResolvedValue({
      creativeExpression: buildDeterministicCreativeExpression({ artDirection, typographyRoles }),
      heroConcept: buildDeterministicHeroConcept(BRAND_NATIVE_PILOT_TOPIC),
      anthropicRequests: 0,
    });
    vi.spyOn(copyGate, 'runCopyQualityGate').mockResolvedValue({
      scores: { editorialVoice: 4, wit: 4, specificity: 4, memorability: 4, directionFit: 5, pass: true, reasons: [] },
      revisedCopy: null,
      revisionRounds: 0,
      visionInspected: false,
    });
    const dry = await runMarkedUpCopyIdentityNativeHeroPilotV2({ dryRun: true });
    expect(dry.status).toBe('PILOT_DRY_RUN');
    expect(dry.otherDirectionsGenerated).toBe(0);
  });
});
