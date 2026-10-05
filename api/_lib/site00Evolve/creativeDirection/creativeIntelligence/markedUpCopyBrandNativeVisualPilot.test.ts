/**
 * Brand-native visual prompt compiler + pilot tests (THE MARKED-UP COPY only).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compileBrandNativeVisualBrief,
  financeTopicAvoidsCalculator,
  promptWorldPremisePrecedesTopic,
  transformTopicIntoDirectionNativeSubject,
  TOPIC_CLICHE_BLACKLIST,
} from './brandNativeVisualPromptCompiler.js';
import { briefToGptImage2Input } from './gptImage2VisualProviderAdapter.js';
import { evaluateRawImageQaFromScores } from './brandNativeVisualRawInspector.js';
import {
  buildMarkedUpCopyExpressionSystemFallback,
  BRAND_NATIVE_PILOT_ASSET_ROLE,
  BRAND_NATIVE_PILOT_TOPIC,
  runMarkedUpCopyBrandNativeVisualPilot,
} from './markedUpCopyBrandNativeVisualPilot.js';
import { FAL_REFERENCE_EDIT_MODEL, FAL_TEXT_TO_IMAGE_MODEL } from './creativeDirectionBoardTypes.js';
import * as gptAdapter from './gptImage2VisualProviderAdapter.js';
import * as storage from '../../../site00Assts/storage.js';
import * as rawInspector from './brandNativeVisualRawInspector.js';
import * as refResolver from './boardReferenceResolver.js';
import * as refCrops from './boardReferenceCrops.js';

const expressionSystem = buildMarkedUpCopyExpressionSystemFallback({ directionId: 'marked-up-copy' });

describe('BrandNativeVisualPromptCompiler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. prompt world premise precedes topic', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(promptWorldPremisePrecedesTopic(brief)).toBe(true);
  });

  it('2. topic transformation avoids stock nouns', () => {
    const t = transformTopicIntoDirectionNativeSubject('credit utilization');
    expect(t.transformed.toLowerCase()).not.toContain('calculator');
    expect(t.transformed.toLowerCase()).not.toContain('office desk');
    expect(t.transformed).toContain('proof');
  });

  it('3. finance topic cannot default to calculator', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: 'credit score',
    });
    expect(financeTopicAvoidsCalculator(brief)).toBe(true);
    expect(brief.subjectTransformation.toLowerCase()).not.toMatch(/\bcalculator\b/);
  });

  it('4. photography system included', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('PHOTOGRAPHY SYSTEM');
    expect(brief.photographyRules.some((r) => r.toLowerCase().includes('close'))).toBe(true);
  });

  it('5. material system included', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('MATERIAL LANGUAGE');
    expect(brief.materialRules.length).toBeGreaterThan(0);
  });

  it('6. semantic color ownership included', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.compiledPrompt).toContain('COLOR SEMANTIC ROLES');
    expect(brief.colorRules.some((r) => r.includes('red pencil') || r.includes('revision'))).toBe(true);
  });

  it('7. asset role affects prompt', () => {
    const hero = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    const evidence = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'PHOTOGRAPHIC_EVIDENCE',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(hero.visualObjective).not.toBe(evidence.visualObjective);
    expect(hero.compiledPrompt).not.toBe(evidence.compiledPrompt);
  });

  it('8. required brand-specific signals included', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.requiredBrandSpecificSignals.length).toBeGreaterThanOrEqual(3);
    expect(brief.compiledPrompt).toContain('REQUIRED DIRECTION-NATIVE SIGNALS');
  });

  it('9. topic-cliche blacklist enforced', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: 'debt payoff',
    });
    for (const cliche of TOPIC_CLICHE_BLACKLIST.finance.slice(0, 5)) {
      expect(brief.forbiddenTopicCliches).toContain(cliche);
    }
    expect(brief.compiledPrompt).toContain('FORBIDDEN');
  });

  it('10. GPT Image 2 adapter receives BrandNativeVisualBrief', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: BRAND_NATIVE_PILOT_ASSET_ROLE,
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    const textOnly = briefToGptImage2Input({ brief });
    expect(textOnly.model).toBe(FAL_TEXT_TO_IMAGE_MODEL);
    expect(textOnly.input.prompt).toContain(brief.worldPremise.slice(0, 40));
    expect(textOnly.input.quality).toBe('high');

    const withRef = briefToGptImage2Input({
      brief,
      referenceImageUrls: ['https://example.com/ref.webp'],
    });
    expect(withRef.model).toBe(FAL_REFERENCE_EDIT_MODEL);
    expect(withRef.input.image_urls).toEqual(['https://example.com/ref.webp']);
  });

  it('11. reference traits passed separately from subject', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
      referenceInfluence: [
        {
          referenceId: 'ref-editorial-spread-modern',
          cropId: 'REF-COMP-01',
          traitsBorrowed: ['asymmetrical paper overlap', 'close crop'],
          traitsForbidden: ['copy subject', 'copy publication identity'],
        },
      ],
    });
    expect(brief.compiledPrompt).toContain('Reference influence');
    expect(brief.compiledPrompt).toContain('asymmetrical paper overlap');
    expect(brief.compiledPrompt).toContain('DO NOT copy subject');
    expect(brief.subjectTransformation.toLowerCase()).not.toContain('asymmetrical');
  });

  it('12. raw pre-overlay recognition required', () => {
    const brief = compileBrandNativeVisualBrief({
      expressionSystem,
      role: 'HERO_EDITORIAL_WORLD',
      topic: BRAND_NATIVE_PILOT_TOPIC,
    });
    expect(brief.recognitionTest).toContain('PRE_OVERLAY');
    expect(brief.compiledPrompt).toContain('RECOGNITION TEST');
  });

  it('13. raw image can be rejected before compositor', () => {
    const qa = evaluateRawImageQaFromScores({
      directionNativeScore: 1,
      topicClicheScore: 5,
      stockLikeness: 5,
      materialFidelity: 1,
      photographySystemFidelity: 1,
      colorRoleFidelity: 1,
      referenceTranslation: 1,
      roleFit: 1,
      reasons: ['Stock office desk visible'],
      visionInspected: true,
    });
    expect(qa.result).toBe('REJECT');
    expect(qa.preOverlayDirectionRecognitionTest).toBe('FAIL');
  });

  it('14. only one hero generated in pilot', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.spyOn(refResolver, 'resolveMarkedUpCopyBoardReferences').mockResolvedValue({
      resolved: [],
      missing: [],
    });
    vi.spyOn(refCrops, 'createReferenceCrops').mockResolvedValue([]);
    const generateSpy = vi.spyOn(gptAdapter, 'generateBrandNativeImageFromBrief').mockResolvedValue({
      url: 'https://example.com/hero.webp',
      model: FAL_TEXT_TO_IMAGE_MODEL,
      costEstimateUsd: 0.045,
    });
    vi.spyOn(storage, 'downloadUrlToBuffer').mockResolvedValue(Buffer.from('fake'));
    vi.spyOn(storage, 'uploadSite00AssetBuffer').mockResolvedValue({
      publicUrl: 'https://storage.example/hero.webp',
      storagePath: 'site00/assts/batches/ndxbook-brand-native-pilot/generated/x.webp',
    });
    vi.spyOn(rawInspector, 'inspectRawBrandNativeImage').mockResolvedValue({
      directionNativeScore: 4,
      topicClicheScore: 0,
      stockLikeness: 1,
      materialFidelity: 4,
      photographySystemFidelity: 4,
      colorRoleFidelity: 4,
      referenceTranslation: 3,
      roleFit: 4,
      preOverlayDirectionRecognitionTest: 'PASS',
      result: 'ACCEPT',
      reasons: [],
      visionInspected: true,
    });

    const result = await runMarkedUpCopyBrandNativeVisualPilot({ dryRun: false });
    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(result.otherAssetsGenerated).toBe(0);
    expect(result.pilot?.assetRole).toBe('HERO_EDITORIAL_WORLD');
    vi.unstubAllEnvs();
  });

  it('15. no remaining board assets generated', async () => {
    const dry = await runMarkedUpCopyBrandNativeVisualPilot({ dryRun: true });
    expect(dry.otherAssetsGenerated).toBe(0);
    expect(dry.otherDirectionsGenerated).toBe(0);
    expect(dry.status).toBe('PILOT_DRY_RUN');
  });

  it('16. directions 02–06 untouched', async () => {
    const dry = await runMarkedUpCopyBrandNativeVisualPilot({ dryRun: true });
    expect(dry.otherDirectionsGenerated).toBe(0);
  });
});
