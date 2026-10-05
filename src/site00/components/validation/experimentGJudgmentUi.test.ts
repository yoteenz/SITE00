import { describe, expect, it } from 'vitest';
import { EXPERIMENT_G_CONCEPT_JUDGMENTS } from '../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/constants';

describe('Experiment G founder judgment options', () => {
  it('exposes founder-facing judgments without REFORM_SET', () => {
    const founderOptions = EXPERIMENT_G_CONCEPT_JUDGMENTS.filter((j) => j !== 'REFORM_SET');
    expect(founderOptions).toContain('LOVE_THE_CONCEPT');
    expect(founderOptions).not.toContain('REFORM_SET');
    expect(founderOptions).toHaveLength(5);
  });
});
