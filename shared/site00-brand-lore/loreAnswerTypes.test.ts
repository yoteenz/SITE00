import { describe, expect, it } from 'vitest';
import { getLoreQuestion } from './idnty-lore-questions.js';
import {
  formatCompoundLabels,
  loreAnswersMateriallyChanged,
  normalizeLoreAnswersRecord,
  normalizeSelectedOptionIds,
  parseLoreRawAnswer,
  resolveOptionLabels,
  resolveResponseMode,
  serializeLoreAnswer,
} from './loreAnswerTypes.js';
import { synthesizeBrandLoreProfile } from './loreSynthesis.js';
import { buildLoreSummaryFromAnswers } from './loreSummary.js';
import { evaluateCreativeDirectionReadiness } from './readiness.js';

describe('SITE 00 brand lore — semantic response modes', () => {
  it('1. response-mode typing on role is MULTI_SELECT', () => {
    const role = getLoreQuestion('role')!;
    expect(role.responseMode).toBe('MULTI_SELECT');
  });

  it('2. status remains SINGLE_SELECT', () => {
    expect(getLoreQuestion('status')!.responseMode).toBe('SINGLE_SELECT');
  });

  it('3. MULTI_SELECT preserves multiple selections', () => {
    const step = getLoreQuestion('role')!;
    const ids = normalizeSelectedOptionIds(step, ['friend', 'tastemaker', 'entertainer']);
    expect(ids).toEqual(['friend', 'tastemaker', 'entertainer']);
  });

  it('4. MULTI_SELECT deselection removes one id', () => {
    const step = getLoreQuestion('role')!;
    const ids = normalizeSelectedOptionIds(step, ['friend', 'tastemaker']);
    expect(ids).toEqual(['friend', 'tastemaker']);
  });

  it('5. SINGLE_SELECT normalizes to one id', () => {
    const step = getLoreQuestion('status')!;
    expect(normalizeSelectedOptionIds(step, 'good-taste')).toEqual(['good-taste']);
  });

  it('6. legacy scalar role migrates to single-element array', () => {
    const step = getLoreQuestion('role')!;
    expect(normalizeSelectedOptionIds(step, 'guide')).toEqual(['guide']);
  });

  it('7. FREE_TEXT unaffected', () => {
    const parsed = parseLoreRawAnswer('world', 'A quiet library of ideas.');
    expect(parsed?.responseMode).toBe('FREE_TEXT');
    expect(parsed?.freeText).toContain('library');
  });

  it('8. serialize multi-select as array', () => {
    const step = getLoreQuestion('feeling')!;
    expect(serializeLoreAnswer(step, ['curious', 'inspired'])).toEqual(['curious', 'inspired']);
  });

  it('9. serialize single-select as string', () => {
    const step = getLoreQuestion('status')!;
    expect(serializeLoreAnswer(step, ['good-taste'])).toBe('good-taste');
  });

  it('10. normalize record preserves arrays', () => {
    const normalized = normalizeLoreAnswersRecord({
      role: ['friend', 'tastemaker'],
      feeling: ['curious'],
    });
    expect(normalized.role).toEqual(['friend', 'tastemaker']);
  });

  it('11. compound synthesis preserves all role selections', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        role: ['friend', 'tastemaker', 'entertainer'],
        feeling: ['curious'],
        enemy: ['boring'],
        world: 'A cultural dossier.',
        lineage: 'Magazines',
        'no-go': 'Stock photos',
      },
    });
    expect(profile.audienceRelationship.sourceSelectionIds).toEqual(['friend', 'tastemaker', 'entertainer']);
    expect(profile.audienceRelationship.value).toEqual([
      'THE FRIEND WHO KNOWS EVERYTHING',
      'THE TASTEMAKER',
      'THE ENTERTAINER WITH A POINT OF VIEW',
    ]);
  });

  it('12. provenance retains every contributing selection id', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        contradiction: ['polished-messy', 'serious-funny', 'loud-intelligent'],
        feeling: ['intrigued'],
        enemy: ['misinformation'],
        role: ['friend'],
        world: 'test',
        lineage: 'test',
        'no-go': 'test',
      },
    });
    expect(profile.creativeTensions.sourceSelectionIds).toEqual(['polished-messy', 'serious-funny', 'loud-intelligent']);
    expect(profile.creativeTensions.value).toHaveLength(3);
  });

  it('13. readiness satisfied with compound role array', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        role: ['friend', 'tastemaker'],
        belief: 'Knowledge should be accessible.',
        feeling: ['curious'],
        enemy: ['boring'],
        world: 'A library.',
        lineage: 'Magazines',
        objects: ['paper'],
        'no-go': 'Generic stock',
      },
      orgSlug: 'ndxbook',
    });
    const readiness = evaluateCreativeDirectionReadiness(profile);
    expect(readiness.satisfiedDomains).toContain('AUDIENCE_RELATIONSHIP');
  });

  it('14. confirmation invalidated when compound answer changes', () => {
    const prior = synthesizeBrandLoreProfile({
      loreAnswers: { role: ['friend'], feeling: ['curious'], enemy: ['boring'], world: 'x', lineage: 'y', 'no-go': 'z' },
    });
    prior.audienceRelationship.founderConfirmationState = 'CONFIRMED';
    prior.audienceRelationship.classification = 'FOUNDER_CONFIRMED';

    const next = synthesizeBrandLoreProfile({
      loreAnswers: { role: ['friend', 'tastemaker'], feeling: ['curious'], enemy: ['boring'], world: 'x', lineage: 'y', 'no-go': 'z' },
      priorProfile: prior,
    });
    expect(next.audienceRelationship.founderConfirmationState).toBe('PENDING');
  });

  it('15. WHAT WE HEARD renders compound role with + separator', () => {
    const sections = buildLoreSummaryFromAnswers({
      role: ['friend', 'tastemaker', 'entertainer'],
    });
    const role = sections.find((s) => s.key === 'role');
    expect(role?.value).toBe(formatCompoundLabels([
      'THE FRIEND WHO KNOWS EVERYTHING',
      'THE TASTEMAKER',
      'THE ENTERTAINER WITH A POINT OF VIEW',
    ]));
  });

  it('16. option labels resolve from ids for review', () => {
    const labels = resolveOptionLabels(['paper', 'screens', 'packaging'], getLoreQuestion('objects')!.options!);
    expect(labels).toEqual(['PAPER', 'SCREENS', 'PACKAGING']);
  });

  it('17. materialized change detection for edit invalidation', () => {
    expect(loreAnswersMateriallyChanged({ role: ['a'] }, { role: ['a', 'b'] }, 'role')).toBe(true);
    expect(loreAnswersMateriallyChanged({ role: ['a', 'b'] }, { role: ['a', 'b'] }, 'role')).toBe(false);
  });

  it('18. emotional promise compound labels not flattened to one', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        feeling: ['intrigued', 'seen', 'entertained', 'curious', 'inspired'],
        role: ['friend'],
        enemy: ['boring'],
        world: 'x',
        lineage: 'y',
        'no-go': 'z',
      },
    });
    expect(profile.emotionalPromise.value).toHaveLength(5);
  });

  it('19. creative tensions preserved as distinct pairs', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        contradiction: ['polished-messy', 'serious-funny', 'refined-raw'],
        role: ['friend'],
        feeling: ['curious'],
        enemy: ['boring'],
        world: 'x',
        lineage: 'y',
        'no-go': 'z',
      },
    });
    expect(profile.creativeTensions.value).toEqual(['POLISHED + MESSY', 'SERIOUS + FUNNY', 'REFINED + RAW']);
  });

  it('20. resolveResponseMode from legacy type fallback', () => {
    expect(resolveResponseMode({ type: 'multi' } as import('./idnty-lore-questions.js').LoreQuestionStep)).toBe('MULTI_SELECT');
    expect(resolveResponseMode({ type: 'single' } as import('./idnty-lore-questions.js').LoreQuestionStep)).toBe('SINGLE_SELECT');
  });
});
