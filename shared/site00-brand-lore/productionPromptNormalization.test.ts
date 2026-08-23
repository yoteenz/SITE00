/**
 * Production prompt normalization + format-proof enforcement + replay preflight tests.
 */

import { describe, expect, it } from 'vitest';
import { enrichFormationInputPayload, enrichDesPayload, enrichIdentityArtDirectionPayload, enrichHeroConceptPayload, buildVisualBriefProductionContext, inspectProductionPayload, buildIdentityArtDirectorSystemPrompt } from './productionPromptNormalization.js';
import { formatsAreResizeOnlyAliases } from './formatNativeExpression.js';
import { validateBoardProofComposition, requiredSocialFirstBoardZones } from './boardProofEnforcement.js';
import { buildReplayProductionPreflightReport, assertReplayProductionReadyForDownstream } from './replayProductionPreflight.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { buildCoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationInputBuilder.js';
import { compileIdentityNativeVisualBrief } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeVisualPromptCompiler.js';
import { buildDeterministicIdentityArtDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/identityNativeArtDirectorService.js';
import { briefToGptImage2Input } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { composeBoardSvg } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/boardCompositorV2.js';
import { desktopMapFromExpression } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/markedUpCopyBoardPlanV4.js';
import { assertReplayFormationInputAllowed } from './personalityReplayLeakage.js';
import { runDefaultHardcodingAudit } from './personalityReplayHardcodingAudit.js';

const PERSONALITY_ANSWERS: Record<string, string | string[]> = {
  'social-instinct': ['notices-missed', 'uncomfortable-question'],
  confidence: ['receipts', 'curiosity'],
  humor: ['dry-observation', 'contradiction'],
  humanity: ['candid', 'unfiltered'],
  disagreement: ['shows-evidence', 'reframes'],
  edge: 'sharp',
  charm: ['wit', 'honesty'],
  observation: 'The receipt nobody reads.',
  memorability: 'The line that changes on second read.',
  'emotional-range': ['skeptical', 'curious'],
  restraint: ['humor-cheapens'],
  'personality-tension': ['intelligent-playful'],
  'social-reaction': ['bring-receipts'],
  'self-correction': ['update-record'],
  'anti-personality': 'Try-hard slang and corporate inspiration.',
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

describe('Core Direction prompt normalization', () => {
  it('1. NDXBOOK exact display name reaches Core Direction prompt', () => {
    const input = buildCoreDirectionFormationInput({
      profile: ndxProfile(),
      orgSlug: 'ndxbook',
      includeLegacyExplorations: false,
    });
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    expect(JSON.stringify(payload)).toContain('NDXBOOK');
    expect(JSON.stringify(payload)).not.toMatch(/\bNDX\s+BOOK\b/);
  });

  it('2. Core Direction visible typography policy = uppercase', () => {
    const input = buildCoreDirectionFormationInput({ profile: ndxProfile(), orgSlug: 'ndxbook' });
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    expect(JSON.stringify(payload)).toContain('UPPERCASE');
  });
});

describe('Direction Expression prompt normalization', () => {
  it('3-7. NDXBOOK, typography, personality, context, format profile reach DES', () => {
    const input = buildCoreDirectionFormationInput({ profile: ndxProfile(), orgSlug: 'ndxbook' });
    const payload = enrichDesPayload({ task: 'DES' }, 'ndxbook', input);
    const inspect = inspectProductionPayload(payload, 'NDXBOOK');
    expect(inspect.hasDisplayName).toBe(true);
    expect(inspect.hasTypographyPolicy).toBe(true);
    expect(inspect.hasExpressionContext).toBe(true);
    expect(inspect.hasFormatProfile).toBe(true);
    expect(inspect.forbiddenBrandVariant).toBe(false);
  });
});

describe('Identity Art Direction prompt normalization', () => {
  it('9-12. IAD receives personality, context, format profile, canonical identity', () => {
    const payload = enrichIdentityArtDirectionPayload({ task: 'IAD' }, 'ndxbook', 'SOCIAL_FIRST_EDITORIAL');
    const inspect = inspectProductionPayload(payload, 'NDXBOOK');
    expect(inspect.hasDisplayName).toBe(true);
    expect(inspect.hasExpressionContext).toBe(true);
    expect(inspect.hasFormatProfile).toBe(true);
    expect(buildIdentityArtDirectorSystemPrompt('ndxbook')).toContain('NDXBOOK');
  });
});

describe('Hero concept normalization', () => {
  it('13-14. Hero receives personality context and native proof format requirement', () => {
    const payload = enrichHeroConceptPayload({ task: 'HERO' }, 'ndxbook', 'SOCIAL_FIRST_EDITORIAL');
    expect(JSON.stringify(payload)).toContain('primaryProofFormat');
    expect(JSON.stringify(payload)).toContain('CAROUSEL_COVER');
  });
});

describe('Visual Brief + GPT Image normalization', () => {
  it('15-19. Visual brief and GPT Image compiler receive canonical identity', () => {
    const profile = ndxProfile();
    const briefCtx = buildVisualBriefProductionContext({
      orgSlug: 'ndxbook',
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      personality: profile.brandPersonality,
    });
    expect(briefCtx.canonicalBrandIdentity.displayName).toBe('NDXBOOK');
    expect(briefCtx.nativeFormat).toBeTruthy();

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
    expect(brief.compiledPrompt).toContain('NDXBOOK');
    expect(brief.compiledPrompt).toContain('UPPERCASE');
    expect(brief.compiledPrompt).not.toMatch(/\bNDX\s+BOOK\b/);

    const gpt = briefToGptImage2Input({ brief: { ...brief, negativeInstructions: [] } as never });
    expect(String(gpt.input.prompt)).not.toMatch(/\bNDX\s+BOOK\b/);
  });
});

describe('Board proof enforcement', () => {
  it('32-36. Social-first board requires native proofs; rejects resize-only', () => {
    const pass = validateBoardProofComposition({
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      presentZoneIds: requiredSocialFirstBoardZones(),
    });
    expect(pass.pass).toBe(true);
    expect(pass.highPriorityCount).toBeGreaterThanOrEqual(2);

    const failPoster = validateBoardProofComposition({
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
      presentZoneIds: ['heroEditorialSpread'],
    });
    expect(failPoster.pass).toBe(false);

    expect(formatsAreResizeOnlyAliases(['FEED_TILE', 'FEED_TILE'])).toBe(true);
    expect(formatsAreResizeOnlyAliases(['FEED_TILE', 'CAROUSEL_SEQUENCE'])).toBe(false);
  });
});

describe('Code-native compositor', () => {
  it('22-25. Active SVG output uses NDXBOOK uppercase labels', () => {
    const mockSys = {
      recurringContentFranchises: [],
      conceptualWorld: 'test',
      signatureMoments: [],
      visualThesis: 'test',
    } as never;
    const map = desktopMapFromExpression(mockSys);
    const svg = composeBoardSvg({
      plan: { directionName: 'TEST', boardPlanVersion: 'v4' } as never,
      map,
      assets: [],
      hideBrand: false,
    });
    expect(svg).toContain('NDXBOOK');
    expect(svg).not.toMatch(/\bNDX\s+BOOK\b/);
  });
});

describe('Replay isolation + preflight', () => {
  it('28-31. Replay formation input has no direction leakage', () => {
    const input = buildCoreDirectionFormationInput({
      profile: ndxProfile(),
      orgSlug: 'ndxbook',
      includeLegacyExplorations: false,
    });
    const guard = assertReplayFormationInputAllowed({
      includeLegacyExplorations: false,
      existingCreativeExplorations: input.existingCreativeExplorations,
    });
    expect(guard.allowed).toBe(true);
    expect(JSON.stringify(input)).not.toContain('THE MARKED-UP COPY');
  });

  it('40-41. Preflight report gates production readiness including typography', () => {
    const report = buildReplayProductionPreflightReport('ndxbook');
    expect(report.personalityReplayInfrastructureReady).toBe(true);
    expect(report.personalityReplayProductionReady).toBe(true);
    expect(report.coreDirectionPromptNormalized).toBe(true);
    expect(report.boardProofPriorityEnforced).toBe(true);
    expect(report.hostUiTypographySeparated).toBe(true);
    expect(report.hostFontLeakagePassed).toBe(true);
    expect(report.typographyInitiallyUnresolved).toBe(true);
    expect(() => assertReplayProductionReadyForDownstream('ndxbook')).not.toThrow();
  });

  it('39. Hardcoding audit passes', () => {
    expect(runDefaultHardcodingAudit().passed).toBe(true);
  });
});

describe('Lineage continuity', () => {
  it('37-38. Personality and format lineage continuous in production context', () => {
    const input = buildCoreDirectionFormationInput({ profile: ndxProfile(), orgSlug: 'ndxbook' });
    const payload = enrichFormationInputPayload(input, 'ndxbook');
    const inspect = inspectProductionPayload(payload, 'NDXBOOK');
    expect(inspect.hasPersonalityLineage).toBe(true);
    expect(inspect.hasFormatLineage).toBe(true);
  });
});
