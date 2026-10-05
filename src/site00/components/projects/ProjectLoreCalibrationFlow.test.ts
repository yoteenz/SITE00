import { describe, expect, it } from 'vitest';
import { missingDomainsToLoreSteps } from '../../../../shared/site00-brand-lore/readiness';
import type { ReadinessDomain } from '../../../../shared/site00-brand-lore/types';
import { getLoreQuestion } from '../../../../shared/site00-brand-lore/idnty-lore-questions';

describe('project lore calibration step mapping', () => {
  it('maps missing domains to canonical lore step ids', () => {
    const missing: ReadinessDomain[] = [
      'AUDIENCE_RELATIONSHIP',
      'EMOTIONAL_PROMISE',
      'CULTURAL_TENSION',
      'REFERENCE_CONTEXT',
      'ANTI_DIRECTION',
    ];
    const steps = missingDomainsToLoreSteps(missing);
    expect(steps).toContain('role');
    expect(steps).toContain('feeling');
    expect(steps).toContain('enemy');
    expect(steps).toContain('lineage');
    expect(steps).toContain('no-go');
  });

  it('every mapped step resolves a lore question definition', () => {
    const steps = missingDomainsToLoreSteps(['WORLDVIEW', 'REFERENCE_CONTEXT']);
    for (const id of steps) {
      expect(getLoreQuestion(id)).toBeTruthy();
    }
  });
});
