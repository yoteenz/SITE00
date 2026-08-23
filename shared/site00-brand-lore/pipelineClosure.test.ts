/**
 * Brand Personality + Primary Expression Context pipeline closure tests.
 */

import { describe, expect, it } from 'vitest';
import { classifyBrandExpressionContext } from './contextClassification.js';
import {
  deriveFormatNativeExpressionProfile,
  formatsAreResizeOnlyAliases,
  resolveFormatProofPriorities,
} from './formatNativeExpression.js';
import { buildFormatLineage } from './formatLineage.js';
import { buildContentBrainPersonalityInput } from './contentBrainPersonalityBridge.js';
import { deriveBrandVoiceBehavior } from './brandVoiceBehavior.js';
import { resolveCreativeIntelligenceReadiness } from './creativeIntelligenceReadiness.js';
import { computeBrandLoreFingerprint } from './fingerprint.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { buildCoreDirectionFormationInput } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/formationInputBuilder.js';
import { buildDeterministicCreativeExpression } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/creativeExpressionService.js';
import { inspectMartianMonoAvailability } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/martianMonoTypography.js';
import { synthesizeBuilderExperienceProfile } from '../../api/_lib/site00BrandLore/experienceSynthesis.js';
import {
  canonicalBrandDisplayName,
  isForbiddenBrandDisplayVariant,
  normalizeBrandPromptContext,
  brandPromptTypographyBlock,
  assertCreativeDisplayCase,
} from './brandIdentity.js';

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
  const lore = synthesizeBrandLoreProfile({
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
    sourceIntakeId: 'test-intake',
    organizationId: 'org-ndx',
  });
  return lore;
}

describe('PrimaryExpressionContext — NDXBOOK', () => {
  it('resolves SOCIAL_FIRST_EDITORIAL for ndxbook', () => {
    expect(classifyBrandExpressionContext({ orgSlug: 'ndxbook' })).toBe('SOCIAL_FIRST_EDITORIAL');
  });

  it('produces social-native format priorities', () => {
    const profile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
    });
    expect(profile.primaryFormats).toContain('FEED_TILE');
    expect(profile.primaryFormats).toContain('CAROUSEL_SEQUENCE');
    expect(profile.websiteFirstDefaultBlocked).toBe(true);
    const priorities = resolveFormatProofPriorities('SOCIAL_FIRST_EDITORIAL');
    expect(priorities.FEED_TILE).toBe('HIGH');
    expect(priorities.WEBSITE_PAGE).toBe('LOW');
  });

  it('blocks resize-only aliases', () => {
    expect(formatsAreResizeOnlyAliases(['FEED_TILE', 'FEED_TILE'])).toBe(true);
    expect(formatsAreResizeOnlyAliases(['FEED_TILE', 'CAROUSEL_SEQUENCE'])).toBe(false);
  });
});

describe('Core Direction Formation input', () => {
  it('receives personality, context, and format-native summaries', () => {
    const profile = ndxProfile();
    const input = buildCoreDirectionFormationInput({ profile, orgSlug: 'ndxbook' });
    expect(input.brandExpressionContext).toBe('SOCIAL_FIRST_EDITORIAL');
    expect(input.brandPersonalitySummary).toContain('socialInstinct');
    expect(input.formatNativeExpressionSummary).toContain('FEED_TILE');
    expect(input.formatLineageSummary).toContain('CAROUSEL');
    expect(input.contentBrainPersonalitySummary).toContain('witBehavior');
  });
});

describe('Content Brain personality bridge', () => {
  it('structures personality fields without flattening to one string', () => {
    const profile = ndxProfile();
    const input = buildContentBrainPersonalityInput(profile.brandPersonality);
    expect(input?.witBehavior).toBeTruthy();
    expect(input?.confidenceBehavior).toBeTruthy();
    expect(input?.antiPersonality).toBeTruthy();
  });
});

describe('Creative Expression format + personality lineage', () => {
  it('includes personality and format lineage in deterministic CES', () => {
    const profile = ndxProfile();
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
      typographyRoles: inspectMartianMonoAvailability(),
      upstreamPersonality: profile.brandPersonality,
      expressionContext: 'SOCIAL_FIRST_EDITORIAL',
    });
    expect(ces.personalityLineage.length).toBeGreaterThan(0);
    expect(ces.formatLineage.length).toBeGreaterThan(0);
  });
});

describe('Builder inheritance', () => {
  it('inherits personality snapshot and primary context', () => {
    const profile = ndxProfile();
    const experience = synthesizeBuilderExperienceProfile(
      { arrival: 'instantly' },
      profile,
      { 'digital-presence': ['through-copy'] },
    );
    expect(experience.inheritedBrandPersonalitySnapshot).toBeTruthy();
    expect(experience.inheritedLoreSnapshot?.contextClassification).toBe('SOCIAL_FIRST_EDITORIAL');
    expect(experience.personalityTranslation?.digitalPresenceBehavior.value?.length).toBeGreaterThan(0);
  });
});

describe('Readiness aggregation', () => {
  it('gates core direction on lore + personality + expression context', () => {
    const profile = ndxProfile();
    const readiness = resolveCreativeIntelligenceReadiness(profile);
    expect(readiness.expressionContextReadiness.known).toBe(true);
    expect(readiness.brandPersonalityReadiness.state).toBe('PERSONALITY_READY');
  });
});

describe('Fingerprint staleness on context change', () => {
  it('changes fingerprint when expression context changes', () => {
    const profile = ndxProfile();
    const fp1 = computeBrandLoreFingerprint(profile);
    const changed = { ...profile, contextClassification: 'ECOMMERCE_FIRST' as const };
    const fp2 = computeBrandLoreFingerprint(changed);
    expect(fp1).not.toBe(fp2);
  });
});

describe('NDXBOOK canonical naming + uppercase', () => {
  it('resolves displayName NDXBOOK one word', () => {
    expect(canonicalBrandDisplayName('ndxbook')).toBe('NDXBOOK');
  });

  it('rejects NDX BOOK as active creative variant', () => {
    expect(isForbiddenBrandDisplayVariant('NDX BOOK')).toBe(true);
    expect(isForbiddenBrandDisplayVariant('NDXBOOK')).toBe(false);
  });

  it('allows ndxbook slug in machine context', () => {
    expect(isForbiddenBrandDisplayVariant('ndxbook')).toBe(false);
  });

  it('applies uppercase creative display policy for NDXBOOK', () => {
    const ctx = normalizeBrandPromptContext('ndxbook');
    expect(ctx.typographyPolicy.displayCase).toBe('UPPERCASE');
    expect(assertCreativeDisplayCase('THE MARKED-UP COPY', ctx.typographyPolicy)).toBe(true);
  });

  it('includes NDXBOOK and uppercase in prompt block', () => {
    const block = brandPromptTypographyBlock('ndxbook');
    expect(block).toContain('NDXBOOK');
    expect(block).toContain('UPPERCASE');
    expect(block).not.toContain('NDX BOOK');
  });

  it('derives uppercase brand voice for NDXBOOK', () => {
    const profile = ndxProfile();
    const voice = deriveBrandVoiceBehavior({
      personality: profile.brandPersonality,
      brandSlug: 'ndxbook',
    });
    expect(voice?.feedHeadlineVoice).toBe(voice?.feedHeadlineVoice?.toUpperCase());
  });
});

describe('Format lineage for social-first NDX', () => {
  it('maps wit + correction to carousel and reel behaviors', () => {
    const profile = ndxProfile();
    const formatProfile = deriveFormatNativeExpressionProfile({
      context: 'SOCIAL_FIRST_EDITORIAL',
      personality: profile.brandPersonality,
    });
    const lineage = buildFormatLineage({
      context: 'SOCIAL_FIRST_EDITORIAL',
      formatProfile,
      personality: profile.brandPersonality,
    });
    expect(lineage.some((l) => l.targetFormat === 'CAROUSEL_SEQUENCE')).toBe(true);
  });
});

describe('BrandVoiceBehavior', () => {
  it('derives from personality without new canon table', () => {
    const personality = synthesizeBrandPersonalityProfile({ personalityAnswers: PERSONALITY_ANSWERS });
    const voice = deriveBrandVoiceBehavior({ personality, brandSlug: 'ndxbook' });
    expect(voice?.carouselProgressionVoice).toContain('STATEMENT');
  });
});
