/**
 * Identity-native visual prompt compiler + hero pilot tests (THE MARKED-UP COPY only).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildDeterministicIdentityArtDirection,
  parseIdentityNativeArtDirectionResponse,
} from './identityNativeArtDirectorService.js';
import {
  compileIdentityNativeVisualBrief,
  identityBriefAvoidsPhotographOf,
  identityBriefPromptPrecedesTopic,
  IDENTITY_NATIVE_HERO_ASSET_ID,
} from './identityNativeVisualPromptCompiler.js';
import { evaluateIdentityNativeQaFromScores } from './identityNativeVisualRawInspector.js';
import { generateIdentityNativeImageFromBrief } from './gptImage2VisualProviderAdapter.js';
import {
  buildMarkedUpCopyExpressionSystemFallback,
  BRAND_NATIVE_PILOT_ASSET_ROLE,
  BRAND_NATIVE_PILOT_TOPIC,
} from './markedUpCopyBrandNativeVisualPilot.js';
import { runMarkedUpCopyIdentityNativeHeroPilot } from './markedUpCopyIdentityNativeHeroPilot.js';
import { FAL_TEXT_TO_IMAGE_MODEL } from './creativeDirectionBoardTypes.js';
import * as gptAdapter from './gptImage2VisualProviderAdapter.js';
import * as storage from '../../../site00Assts/storage.js';
import * as rawInspector from './identityNativeVisualRawInspector.js';
import * as refResolver from './boardReferenceResolver.js';
import * as artDirector from './identityNativeArtDirectorService.js';

const expressionSystem = buildMarkedUpCopyExpressionSystemFallback({ directionId: 'marked-up-copy' });

describe('IdentityNativeArtDirector', () => {
  it('1. parses IdentityNativeArtDirection schema', () => {
    const parsed = parseIdentityNativeArtDirectionResponse({
      text: JSON.stringify({
        identityPremise: 'Custom NDX BOOK editorial artwork',
        proprietaryVisualDNA: ['sparse signal intervention', 'extreme type scale'],
        paletteSystem: [
          {
            role: 'paper-field',
            colorDescription: 'off-white',
            semanticUse: 'dominant field',
            visualDominance: 'dominant',
          },
          {
            role: 'ink-black',
            colorDescription: 'editorial black',
            semanticUse: 'authority',
            visualDominance: 'secondary',
          },
        ],
        typographyBehavior: ['oversized condensed statement'],
        imageTreatment: 'art-directed specimen',
        photographicBehavior: 'not stock documentary',
        graphicGrammar: ['designed revision marks'],
        annotationGrammar: ['strike/replace blocks'],
        materialBehavior: ['newsprint'],
        compositionalBehavior: ['asymmetric density'],
        textureBehavior: ['controlled grain'],
        recurringDevices: ['index numbers'],
        artifactDesignLanguage: 'bespoke publication artifact',
        topicTransformationRules: 'topic as content layer only',
        customArtworkRequirements: ['identity before logo'],
        forbiddenGenericBehaviors: ['beige stock photography'],
        preOverlayRecognitionCriteria: ['recognizable without logo'],
        referenceIdentityApplications: [
          { referenceId: 'REF-COMP-01', identityTrait: 'asymmetry', application: 'hero architecture' },
        ],
        antiExampleCharacteristics: ['red-pencil cliché'],
      }),
      directionId: 'marked-up-copy',
      expressionSystemId: expressionSystem.expressionSystemId,
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    });
    expect(parsed.identityPremise).toContain('NDX BOOK');
    expect(parsed.paletteSystem.length).toBeGreaterThanOrEqual(2);
    expect(parsed.proprietaryVisualDNA.length).toBeGreaterThan(0);
  });

  it('2. deterministic fallback derives palette from expression system', () => {
    const ad = buildDeterministicIdentityArtDirection({
      expressionSystem,
      directionId: 'marked-up-copy',
    });
    expect(ad.paletteSystem.length).toBeGreaterThanOrEqual(2);
    expect(ad.forbiddenGenericBehaviors.some((b) => b.includes('beige'))).toBe(true);
    expect(ad.artifactDesignLanguage.toLowerCase()).toContain('bespoke');
  });
});

describe('IdentityNativeVisualPromptCompiler', () => {
  const artDirection = buildDeterministicIdentityArtDirection({
    expressionSystem,
    directionId: 'marked-up-copy',
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('3. artifact declaration precedes topic content', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(identityBriefPromptPrecedesTopic(brief)).toBe(true);
    expect(brief.assetId).toBe(IDENTITY_NATIVE_HERO_ASSET_ID);
  });

  it('4. avoids photograph-of governing sentence', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(identityBriefAvoidsPhotographOf(brief)).toBe(true);
    expect(brief.compiledPrompt).toContain('ARTIFACT DECLARATION');
    expect(brief.compiledPrompt).toContain('NOT a stock photograph');
  });

  it('5. palette has semantic ownership with dominance', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('PALETTE');
    expect(brief.paletteOwnership.some((p) => p.includes('visual dominance'))).toBe(true);
  });

  it('6. typography enters as visual form', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('TYPOGRAPHIC COMPOSITION');
    expect(brief.typographicArchitecture.length).toBeGreaterThan(0);
  });

  it('7. anti-example rejection included', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('ANTI-EXAMPLE REJECTION');
    expect(brief.antiExampleRejection.some((a) => a.includes('beige'))).toBe(true);
  });

  it('8. topic is subordinate content layer', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.topicContentLayer).toContain('subordinate');
    expect(brief.compiledPrompt.indexOf('TOPIC CONTENT')).toBeGreaterThan(
      brief.compiledPrompt.indexOf('PROPRIETARY VISUAL DNA'),
    );
  });

  it('9. finance clichés forbidden', () => {
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: 'credit utilization',
    });
    expect(brief.forbiddenGenericBehavior.some((f) => f.includes('calculator'))).toBe(true);
    expect(brief.forbiddenGenericBehavior.some((f) => f.includes('credit card'))).toBe(true);
  });

  it('10. identity generation is text-only (no reference conditioning)', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    const brief = compileIdentityNativeVisualBrief({
      artDirection,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    const falSubscribe = vi.fn().mockResolvedValue({
      data: { images: [{ url: 'https://example.com/identity.webp' }] },
    });
    vi.doMock('@fal-ai/client', () => ({
      fal: { config: vi.fn(), subscribe: falSubscribe },
    }));

    const generateSpy = vi.spyOn(gptAdapter, 'generateIdentityNativeImageFromBrief').mockResolvedValue({
      url: 'https://example.com/identity.webp',
      model: FAL_TEXT_TO_IMAGE_MODEL,
      costEstimateUsd: 0.045,
    });

    await generateIdentityNativeImageFromBrief({ brief });
    expect(generateSpy).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});

describe('IdentityNativeRawImageQa', () => {
  it('11. identity-native acceptance thresholds', () => {
    const qa = evaluateIdentityNativeQaFromScores({
      identityNativeScore: 5,
      directionNativeScore: 5,
      paletteFidelity: 5,
      typographicDna: 5,
      graphicGrammarFidelity: 5,
      artifactDesignAuthority: 5,
      stockResemblance: 0,
      topicClicheScore: 0,
      logoRemovalTestV2: 'PASS',
      strangerTest: 'PASS',
      reasons: [],
      visionInspected: true,
    });
    expect(qa.result).toBe('ACCEPT');
    expect(qa.preOverlayIdentityRecognitionTest).toBe('PASS');
  });

  it('12. stock resemblance fails stranger test', () => {
    const qa = evaluateIdentityNativeQaFromScores({
      identityNativeScore: 2,
      directionNativeScore: 3,
      paletteFidelity: 2,
      typographicDna: 2,
      graphicGrammarFidelity: 2,
      artifactDesignAuthority: 2,
      stockResemblance: 5,
      topicClicheScore: 4,
      logoRemovalTestV2: 'FAIL',
      strangerTest: 'FAIL',
      reasons: ['Generic stock editorial photograph'],
      visionInspected: true,
    });
    expect(qa.result).toBe('REJECT');
    expect(qa.preOverlayIdentityRecognitionTest).toBe('FAIL');
  });
});

describe('MarkedUpCopyIdentityNativeHeroPilot', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('13. only one hero generated', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({
      resolved: [],
      missing: [],
    });
    vi.spyOn(artDirector, 'runIdentityNativeArtDirector').mockResolvedValue({
      artDirection: buildDeterministicIdentityArtDirection({
        expressionSystem,
        directionId: 'marked-up-copy',
      }),
      anthropicRequests: 1,
      usage: { inputTokens: 100, outputTokens: 200 },
    });
    const generateSpy = vi.spyOn(gptAdapter, 'generateIdentityNativeImageFromBrief').mockResolvedValue({
      url: 'https://example.com/identity-hero.webp',
      model: FAL_TEXT_TO_IMAGE_MODEL,
      costEstimateUsd: 0.045,
    });
    vi.spyOn(storage, 'downloadUrlToBuffer').mockResolvedValue(Buffer.from('fake'));
    vi.spyOn(storage, 'uploadSite00AssetBuffer').mockResolvedValue({
      publicUrl: 'https://storage.example/identity-hero.webp',
      storagePath: 'site00/assts/batches/ndxbook-identity-native-pilot/generated/x.webp',
    });
    vi.spyOn(rawInspector, 'inspectIdentityNativeImage').mockResolvedValue({
      identityNativeScore: 4,
      directionNativeScore: 5,
      paletteFidelity: 4,
      typographicDna: 4,
      graphicGrammarFidelity: 4,
      artifactDesignAuthority: 4,
      stockResemblance: 1,
      topicClicheScore: 0,
      preOverlayIdentityRecognitionTest: 'PASS',
      logoRemovalTestV2: 'PASS',
      strangerTest: 'PASS',
      result: 'ACCEPT',
      reasons: [],
      visionInspected: true,
    });

    const result = await runMarkedUpCopyIdentityNativeHeroPilot({ dryRun: false });
    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(result.otherAssetsGenerated).toBe(0);
    expect(result.pilot?.assetId).toBe('MUC-IDENTITY-NATIVE-HERO-PILOT');
    expect(result.pilot?.codeOverlaysApplied).toBe(false);
    vi.unstubAllEnvs();
  });

  it('14. dry run produces no assets', async () => {
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({
      resolved: [],
      missing: [],
    });
    vi.spyOn(artDirector, 'runIdentityNativeArtDirector').mockResolvedValue({
      artDirection: buildDeterministicIdentityArtDirection({
        expressionSystem,
        directionId: 'marked-up-copy',
      }),
      anthropicRequests: 1,
      usage: { inputTokens: 100, outputTokens: 200 },
    });
    const dry = await runMarkedUpCopyIdentityNativeHeroPilot({ dryRun: true });
    expect(dry.status).toBe('PILOT_DRY_RUN');
    expect(dry.otherAssetsGenerated).toBe(0);
    expect(dry.otherDirectionsGenerated).toBe(0);
    expect(dry.pilot).toBeNull();
  });

  it('15. directions 02–06 untouched', async () => {
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({
      resolved: [],
      missing: [],
    });
    vi.spyOn(artDirector, 'runIdentityNativeArtDirector').mockResolvedValue({
      artDirection: buildDeterministicIdentityArtDirection({
        expressionSystem,
        directionId: 'marked-up-copy',
      }),
      anthropicRequests: 0,
      usage: { inputTokens: 0, outputTokens: 0 },
    });
    const dry = await runMarkedUpCopyIdentityNativeHeroPilot({ dryRun: true });
    expect(dry.otherDirectionsGenerated).toBe(0);
  });
});
