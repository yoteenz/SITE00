/**
 * Typography provenance — HOST UI vs CLIENT brand separation tests.
 */

import { describe, expect, it } from 'vitest';
import {
  inspectHostUiTypography,
  buildReplayClientTypographyState,
  buildDirectionDerivedTypographyRoles,
  brandTypographicBehaviorBlock,
  assertNoHostFontInPayload,
  runHostFontLeakageTest,
  runSite00VisualDnaLeakageTest,
  runClientTypographyProvenanceTest,
  runFontAvailabilityIsNotCanonTest,
  runHistoricalOutputIsNotCanonTest,
  classifyTypographyOccurrence,
  TYPOGRAPHY_FIXTURE_BRANDS,
  SITE00_HOST_FONT_FAMILY,
} from './typographyProvenance.js';
import { brandPromptTypographyBlock, normalizeBrandPromptContext } from './brandIdentity.js';
import {
  enrichFormationInputPayload,
  enrichDesPayload,
  enrichIdentityArtDirectionPayload,
  enrichHeroConceptPayload,
  buildProductionBrandContext,
  inspectProductionPayload,
} from './productionPromptNormalization.js';
import { buildReplayProductionPreflightReport } from './replayProductionPreflight.js';
import { buildCoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationInputBuilder.js';
import { buildDeterministicCreativeExpression } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeExpressionService.js';
import { buildClientTypographyRolesForProduction } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/martianMonoTypography.js';
import { compileIdentityNativeV2VisualBrief, v2BriefExcludesHostTypography } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { briefToGptImage2Input } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { compileIdentityNativeVisualBrief } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeVisualPromptCompiler.js';
import { buildDeterministicIdentityArtDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js';
import { buildVisualBriefProductionContext } from './productionPromptNormalization.js';
import { buildDeterministicHeroConcept } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeExpressionService.js';

const PERSONALITY_ANSWERS: Record<string, string | string[]> = {
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

function ndxProfile() {
  return synthesizeBrandLoreProfile({
    loreAnswers: {
      feeling: ['curious'],
      role: ['guide'],
      belief: 'everyday knowledge should feel accessible',
      audience: ['peer'],
      tension: ['clarity-vs-mystery'],
      anti: ['preachy'],
    },
    personalityAnswers: PERSONALITY_ANSWERS,
    orgSlug: 'ndxbook',
    sourceIntakeId: 'test',
    organizationId: 'org-ndx',
  });
}

describe('HOST_UI typography classification', () => {
  it('classifies Martian Mono as SITE 00 host typography', () => {
    const host = inspectHostUiTypography();
    expect(host.provenance).toBe('HOST_UI');
    expect(host.fontFamily).toBe(SITE00_HOST_FONT_FAMILY);
    expect(host.available).toBe(true);
    expect(classifyTypographyOccurrence('Martian Mono admin label', 'host_ui')).toBe('HOST_UI');
  });
});

describe('CLIENT typography at replay start', () => {
  it('NDXBOOK begins UNRESOLVED with uppercase behavior only', () => {
    const state = buildReplayClientTypographyState('ndxbook');
    expect(state.typographyIdentityStatus).toBe('UNRESOLVED');
    expect(state.clientTypographyUnresolved).toBe(true);
    expect(state.typographicBehavior.headlineCase).toBe('UPPERCASE');
    expect(state.fontSelectionStatus).toBe('UNRESOLVED');
    expect(runClientTypographyProvenanceTest(state)).toBe(true);
  });

  it('uppercase survives independently of font family in prompt block', () => {
    const block = brandPromptTypographyBlock('ndxbook');
    expect(block).toContain('UPPERCASE');
    expect(block).toContain('NOT A FONT-FAMILY DECISION');
    expect(block).not.toMatch(/\bmartian\s*mono\b/i);
  });
});

describe('Production path — no host font leakage', () => {
  const profile = ndxProfile();
  const input = buildCoreDirectionFormationInput({
    profile,
    orgSlug: 'ndxbook',
    includeLegacyExplorations: false,
  });

  it('1. Core Direction payload excludes Martian Mono', () => {
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    expect(runHostFontLeakageTest(payload)).toBe(true);
    expect(inspectProductionPayload(payload, 'NDXBOOK').hostFontLeakage).toBe(false);
  });

  it('2. DES payload excludes host font', () => {
    const payload = enrichDesPayload({ task: 'DES' }, 'ndxbook', input);
    expect(runHostFontLeakageTest(payload)).toBe(true);
  });

  it('3. IAD payload excludes host font and includes typography provenance', () => {
    const payload = enrichIdentityArtDirectionPayload({ task: 'IAD' }, 'ndxbook', 'SOCIAL_FIRST_EDITORIAL');
    expect(runHostFontLeakageTest(payload)).toBe(true);
    expect(JSON.stringify(payload)).toContain('typographyProvenance');
    expect(JSON.stringify(payload)).toContain('UNRESOLVED');
  });

  it('4. Hero payload excludes host font', () => {
    const payload = enrichHeroConceptPayload({ task: 'HERO' }, 'ndxbook', 'SOCIAL_FIRST_EDITORIAL');
    expect(runHostFontLeakageTest(payload)).toBe(true);
  });

  it('5. CES deterministic output excludes host font', () => {
    const roles = buildClientTypographyRolesForProduction();
    const ces = buildDeterministicCreativeExpression({
      artDirection: {
        artDirectionId: 'ad-1',
        directionId: 'dir-1',
        expressionSystemId: 'des-1',
        identityPremise: 'test',
        proprietaryVisualDNA: [],
        paletteSystem: {},
        artifactDesignLanguage: '',
      } as never,
      typographyRoles: roles,
      upstreamPersonality: profile.brandPersonality,
    });
    expect(assertNoHostFontInPayload(ces).passed).toBe(true);
    expect(JSON.stringify(ces.typographyPersonality)).not.toMatch(/\bmartian\s*mono\b/i);
  });

  it('6. V2 visual brief excludes host typography', () => {
    const roles = buildClientTypographyRolesForProduction();
    const mockSys = {
      expressionSystemId: 'test',
      visualThesis: 't',
      governingVisualBehavior: 'g',
      photographySystem: { grainTexture: 'fine', humanPresence: 'none', subjectMatter: 'e' },
      typographySystem: { cleanVoice: 'b', revisionVoice: 's', scaleRelationships: 'x' },
      graphicGrammar: { selectedDevices: ['strike'] },
      annotationGrammar: { disagreementBehavior: 'm', correctionBehavior: 'r', secondaryOpinionBehavior: 'n' },
      materialLanguage: { paperTypes: ['newsprint'], justifiedMaterials: ['paper'] },
      colorSystem: { semanticRoles: { ink: 'black' } },
      antiGenericRules: ['no stock'],
      spatialBehavior: 'asymmetric',
      recurringDevices: ['strike'],
      imageTreatment: 'editorial',
    } as never;
    const artDirection = buildDeterministicIdentityArtDirection({ expressionSystem: mockSys, directionId: 'd1' });
    const ces = buildDeterministicCreativeExpression({ artDirection, typographyRoles: roles });
    const hero = buildDeterministicHeroConcept('credit utilization');
    const brief = compileIdentityNativeV2VisualBrief({
      artDirection,
      creativeExpression: ces,
      heroConcept: hero,
      copyQualityScores: { editorialVoice: 5, wit: 5, specificity: 5, memorability: 5, directionFit: 5, pass: true, reasons: [] },
      role: 'HERO_EDITORIAL_WORLD',
      topic: 'credit utilization',
    });
    expect(v2BriefExcludesHostTypography(brief)).toBe(true);
  });

  it('7. GPT Image 2 input excludes host typography', () => {
    const briefCtx = buildVisualBriefProductionContext({
      orgSlug: 'ndxbook',
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      personality: profile.brandPersonality,
    });
    const mockSys = {
      expressionSystemId: 'test',
      visualThesis: 't',
      governingVisualBehavior: 'g',
      photographySystem: { grainTexture: 'fine', humanPresence: 'none', subjectMatter: 'e' },
      typographySystem: { cleanVoice: 'b', revisionVoice: 's', scaleRelationships: 'x' },
      graphicGrammar: { selectedDevices: ['strike'] },
      annotationGrammar: { disagreementBehavior: 'm', correctionBehavior: 'r', secondaryOpinionBehavior: 'n' },
      materialLanguage: { paperTypes: ['newsprint'], justifiedMaterials: ['paper'] },
      colorSystem: { semanticRoles: { ink: 'black' } },
      antiGenericRules: ['no stock'],
      spatialBehavior: 'asymmetric',
      recurringDevices: ['strike'],
      imageTreatment: 'editorial',
    } as never;
    const ad = buildDeterministicIdentityArtDirection({ expressionSystem: mockSys, directionId: 'd1' });
    const brief = compileIdentityNativeVisualBrief({
      artDirection: ad,
      role: 'HERO_EDITORIAL_SPREAD',
      topic: 'credit utilization',
      brandSlug: 'ndxbook',
      productionContext: briefCtx,
    });
    const gpt = briefToGptImage2Input({ brief: { ...brief, negativeInstructions: [] } as never });
    expect(runHostFontLeakageTest(gpt)).toBe(true);
  });
});

describe('Anti-contamination tests', () => {
  it('HOST_FONT_LEAKAGE_TEST', () => {
    const ctx = buildProductionBrandContext({ orgSlug: 'ndxbook', profile: ndxProfile() });
    expect(runHostFontLeakageTest({ displayName: ctx.displayName, policy: ctx.typographyPolicy })).toBe(true);
  });

  it('SITE00_VISUAL_DNA_LEAKAGE_TEST', () => {
    const input = buildCoreDirectionFormationInput({ profile: ndxProfile(), orgSlug: 'ndxbook' });
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    expect(runSite00VisualDnaLeakageTest(payload)).toBe(true);
  });

  it('CLIENT_TYPOGRAPHY_PROVENANCE_TEST', () => {
    expect(runClientTypographyProvenanceTest(buildReplayClientTypographyState('ndxbook'))).toBe(true);
  });

  it('FONT_AVAILABILITY_IS_NOT_CANON_TEST', () => {
    expect(runFontAvailabilityIsNotCanonTest()).toBe(true);
  });

  it('HISTORICAL_OUTPUT_IS_NOT_CANON_TEST', () => {
    const input = buildCoreDirectionFormationInput({ profile: ndxProfile(), orgSlug: 'ndxbook' });
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    expect(
      runHistoricalOutputIsNotCanonTest('Martian Mono footer historical pilot', payload),
    ).toBe(true);
  });

  it('fixture brands can derive different typography architectures', () => {
    const ndx = buildDirectionDerivedTypographyRoles();
    const bloom = buildDirectionDerivedTypographyRoles({ provenance: 'CREATIVE_EXPLORATION' });
    bloom.displayVoice = 'Warm serif editorial — organic luxury botanical authority';
    expect(TYPOGRAPHY_FIXTURE_BRANDS.ndxbook.headlineCase).toBe('UPPERCASE');
    expect(TYPOGRAPHY_FIXTURE_BRANDS.bloomBotanical.headlineCase).toBe('TITLE_CASE');
    expect(ndx.displayVoice).not.toBe(bloom.displayVoice);
  });
});

describe('Replay preflight typography gates', () => {
  it('all typography preflight gates pass for NDXBOOK', () => {
    const report = buildReplayProductionPreflightReport('ndxbook');
    expect(report.hostUiTypographySeparated).toBe(true);
    expect(report.clientTypographyProvenanceValid).toBe(true);
    expect(report.hostFontLeakagePassed).toBe(true);
    expect(report.typographyInitiallyUnresolved).toBe(true);
    expect(report.typographyDerivationEnabled).toBe(true);
    expect(report.benchmarkTypographyExcluded).toBe(true);
    expect(report.personalityReplayProductionReady).toBe(true);
  });
});

describe('Uppercase policy independent of host font', () => {
  it('NDXBOOK ctx retains uppercase; behavior block may cite prohibited host font', () => {
    const ctx = normalizeBrandPromptContext('ndxbook');
    expect(ctx.typographyPolicy.headlineCase).toBe('UPPERCASE');
    const block = brandTypographicBehaviorBlock('ndxbook');
    expect(block).toContain('UPPERCASE');
    expect(assertNoHostFontInPayload({ typography: block }).passed).toBe(true);
  });
});
