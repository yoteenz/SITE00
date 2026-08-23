/**
 * Brand Personality Intelligence — shared module tests.
 */

import { describe, expect, it } from 'vitest';
import { IDNTY_PERSONALITY_QUESTIONS } from './idnty-personality-questions.js';
import { BLDR_PERSONALITY_TRANSLATION_QUESTIONS } from './bldr-personality-translation-questions.js';
import {
  synthesizeBrandPersonalityProfile,
  mergePreservingPersonalityConfirmations,
} from './personalitySynthesis.js';
import {
  evaluateBrandPersonalityReadiness,
  canBeginCoreDirectionFormation,
  missingPersonalityDomainsToSteps,
  REQUIRED_PERSONALITY_DOMAINS,
} from './personalityReadiness.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { computeBrandLoreFingerprint } from './fingerprint.js';
import { reconcileNdxbookPersonality, isProposedCreativePersonalitySource } from './ndxbookPersonalityReconciliation.js';
import { buildPersonalityLineageFromProfile } from './personalityLineage.js';
import { buildPersonalitySummaryFromAnswers } from './personalitySummary.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';
import type { BrandLoreProfile } from './types.js';

const FULL_PERSONALITY_ANSWERS: Record<string, string | string[]> = {
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

describe('Brand Personality questions', () => {
  it('1. registers 15 personality questions', () => {
    expect(IDNTY_PERSONALITY_QUESTIONS).toHaveLength(15);
  });

  it('2. response modes are correct', () => {
    const singles = IDNTY_PERSONALITY_QUESTIONS.filter((q) => q.responseMode === 'SINGLE_SELECT');
    const multis = IDNTY_PERSONALITY_QUESTIONS.filter((q) => q.responseMode === 'MULTI_SELECT');
    const free = IDNTY_PERSONALITY_QUESTIONS.filter((q) => q.responseMode === 'FREE_TEXT');
    expect(singles).toHaveLength(1);
    expect(multis.length).toBeGreaterThanOrEqual(10);
    expect(free).toHaveLength(3);
  });

  it('3. preserves multi-select arrays', () => {
    const profile = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    expect(profile.socialInstinct.value).toContain('NOTICES WHAT EVERYONE MISSED');
    expect(profile.witBehavior.sourceSelectionIds).toContain('dry-observation');
  });

  it('4. preserves free text', () => {
    const profile = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    expect(profile.observationalBehavior.value).toBe('The receipt nobody reads.');
    expect(profile.antiPersonality.value).toContain('Try-hard slang');
  });
});

describe('Brand Personality synthesis', () => {
  it('5. synthesis is deterministic', () => {
    const a = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    const b = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    expect(a.witBehavior.value).toEqual(b.witBehavior.value);
  });

  it('6. synthesis never invents answers without source', () => {
    const profile = synthesizeBrandPersonalityProfile({ personalityAnswers: {} });
    expect(profile.witBehavior.confidence).toBe('NONE');
    expect(profile.signatureMoves.value).toEqual([]);
  });

  it('7. provenance retained on every field', () => {
    const profile = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    expect(profile.confidenceBehavior.sourceAnswerIds).toContain('confidence');
    expect(profile.confidenceBehavior.sourceType).toBe('IDENTITY_LORE');
  });

  it('8. founder confirmation preserved on unchanged resynthesis', () => {
    const first = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    first.witBehavior = { ...first.witBehavior, founderConfirmationState: 'CONFIRMED', classification: 'FOUNDER_CONFIRMED' };
    const second = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS, prior: first });
    const merged = mergePreservingPersonalityConfirmations(first, second);
    expect(merged.witBehavior.founderConfirmationState).toBe('CONFIRMED');
  });
});

describe('Brand Personality readiness', () => {
  it('9. full answers reach PERSONALITY_READY', () => {
    const profile = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    const lore = synthesizeBrandLoreProfile({
      loreAnswers: {
        belief: 'test',
        role: ['friend'],
        world: 'world',
        feeling: ['curious'],
        enemy: ['boring'],
        contradiction: ['serious-funny'],
        lineage: 'refs',
        'no-go': 'no stock',
        language: 'real talk',
      },
      personalityAnswers: FULL_PERSONALITY_ANSWERS,
    });
    const readiness = evaluateBrandPersonalityReadiness(profile, lore);
    expect(readiness.state).toBe('PERSONALITY_READY');
  });

  it('10. incomplete personality blocks core direction formation', () => {
    expect(
      canBeginCoreDirectionFormation({
        loreState: 'CORE_DIRECTION_READY',
        personalityState: 'PERSONALITY_INCOMPLETE',
      }),
    ).toBe(false);
  });

  it('11. targeted calibration routes to humor question for WIT_BEHAVIOR', () => {
    const steps = missingPersonalityDomainsToSteps(['WIT_BEHAVIOR']);
    expect(steps).toContain('humor');
  });

  it('12. required domains count is 8', () => {
    expect(REQUIRED_PERSONALITY_DOMAINS).toHaveLength(8);
  });
});

describe('NDX BOOK personality reconciliation', () => {
  it('13. reconciliation is truthful — known domains populated', () => {
    const { personality, report } = reconcileNdxbookPersonality({ orgId: 'ndx-org', loreProfile: null });
    expect(personality.witBehavior.value!.length).toBeGreaterThan(0);
    expect(report.knownDomains.length).toBeGreaterThan(0);
  });

  it('14. proposed creative output does not silently become canon', () => {
    expect(isProposedCreativePersonalitySource('PROPOSED_CREATIVE_OUTPUT')).toBe(true);
    expect(isProposedCreativePersonalitySource('FOUNDER_CONFIRMED')).toBe(false);
  });
});

describe('Pipeline integration', () => {
  it('15. lore profile embeds brandPersonality', () => {
    const lore = synthesizeBrandLoreProfile({
      loreAnswers: { belief: 'x' },
      personalityAnswers: FULL_PERSONALITY_ANSWERS,
    });
    expect(lore.brandPersonality?.witBehavior.value?.length).toBeGreaterThan(0);
  });

  it('16. fingerprint includes personality fields', () => {
    const lore = synthesizeBrandLoreProfile({
      loreAnswers: { belief: 'x' },
      personalityAnswers: FULL_PERSONALITY_ANSWERS,
    });
    const fp1 = computeBrandLoreFingerprint(lore);
    const lore2 = { ...lore, brandPersonality: null };
    const fp2 = computeBrandLoreFingerprint(lore2);
    expect(fp1).not.toBe(fp2);
  });

  it('17. personality lineage cites upstream fields', () => {
    const personality = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY_ANSWERS });
    const lineage = buildPersonalityLineageFromProfile(personality);
    expect(lineage.some((e) => e.upstreamField === 'witBehavior')).toBe(true);
  });

  it('18. HOW YOU SHOW UP summary builds from answers', () => {
    const sections = buildPersonalitySummaryFromAnswers(FULL_PERSONALITY_ANSWERS);
    expect(sections.some((s) => s.label === 'YOUR HUMOR')).toBe(true);
  });

  it('19. Builder translation questions registered', () => {
    expect(BLDR_PERSONALITY_TRANSLATION_QUESTIONS.length).toBe(8);
  });

  it('20. existing lore readiness unaffected when personality absent', () => {
    const lore = synthesizeBrandLoreProfile({
      loreAnswers: {
        belief: 'b',
        role: ['friend'],
        world: 'w',
        feeling: ['curious'],
        enemy: ['boring'],
        contradiction: ['serious-funny'],
        lineage: 'l',
        'no-go': 'n',
        language: 'lang',
      },
    });
    expect(lore.brandPersonality).toBeNull();
    expect(evaluateCreativeDirectionReadiness(lore).state).toBe('CORE_DIRECTION_READY');
  });
});

describe('Legacy safety', () => {
  it('21. legacy profile without personality resolves PERSONALITY_INCOMPLETE', () => {
    const lore: BrandLoreProfile = synthesizeBrandLoreProfile({ loreAnswers: { belief: 'x' } });
    const readiness = evaluateBrandPersonalityReadiness(lore.brandPersonality, lore);
    expect(readiness.state).toBe('PERSONALITY_INCOMPLETE');
  });
});
