import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pageConceptCgptQaStopAfterCgpt } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeSynthesis.js';
import { pageConceptChainGpt2MobileAfterCgptReviewGate } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import { pageConceptServerRunIsTerminal } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

describe('P0.VR.PAGE-CONCEPT-CGPT-GPT2-AUTO-CHAIN1', () => {
  it('CGPT QA stop is opt-in only (default off)', () => {
    const prev = process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP;
    delete process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP;
    expect(pageConceptCgptQaStopAfterCgpt()).toBe(false);
    process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'true';
    expect(pageConceptCgptQaStopAfterCgpt()).toBe(true);
    if (prev === undefined) delete process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP;
    else process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = prev;
  });

  it('canonical product chains GPT2 after CGPT review gate', () => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
    expect(pageConceptChainGpt2MobileAfterCgptReviewGate()).toBe(true);
  });

  it('CGPT awaiting founder review is a terminal poll status', () => {
    expect(pageConceptServerRunIsTerminal('CGPT_AWAITING_FOUNDER_REVIEW')).toBe(true);
  });

  it('generate dispatch chains continueGpt2AfterCgptReview when QA gate stops', () => {
    const hook = readFileSync(
      join(process.cwd(), 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('pageConceptChainGpt2MobileAfterCgptReviewGate');
    expect(hook).toContain("terminalRun.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW'");
    expect(hook).toContain('continueGpt2AfterCgptReview: true');
  });
});
