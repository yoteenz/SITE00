import { describe, expect, it } from 'vitest';

import {
  pageConceptGenerationActivelyRunning,
  pageConceptPrimaryGenerateStartsNewBranch,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { computePageConceptModalGeneratePress } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptModalGeneratePress.js';
import { pageConceptGenerationGateFromEligibility } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationEligibility.js';

describe('P0.VR PAGE-CONCEPT GENERATE ALWAYS ENABLED', () => {
  it('GPT2 mobile awaiting selection is not actively running', () => {
    expect(pageConceptGenerationActivelyRunning('GPT2_MOBILE_AWAITING_SELECTION', false)).toBe(false);
    expect(pageConceptPrimaryGenerateStartsNewBranch('GPT2_MOBILE_AWAITING_SELECTION')).toBe(true);
  });

  it('modal GENERATE stays enabled on mobile review with session ready', () => {
    const press = computePageConceptModalGeneratePress({
      eligibility: { canGenerate: true, sessionReady: true } as never,
      mode: 'review',
      generating: false,
      generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
      executionError: null,
      failedNbp: false,
    });
    expect(press.canPress).toBe(true);
    expect(press.intendedAction).toBe('new_branch');
  });

  it('modal GENERATE stays enabled when captures blocked (preflight on click)', () => {
    const press = computePageConceptModalGeneratePress({
      eligibility: {
        canGenerate: false,
        sessionReady: true,
        confirmNotice: 'CAPTURE REQUIRED',
      } as never,
      mode: 'confirm',
      generating: false,
      generationStatus: 'IDLE',
      executionError: null,
      failedNbp: false,
    });
    expect(press.canPress).toBe(true);
    expect(press.blockReason).toBe('CAPTURE REQUIRED');
  });

  it('gallery gate stays enabled when eligibility blocked but not running', () => {
    const gate = pageConceptGenerationGateFromEligibility(
      {
        canGenerate: false,
        hydrationStatus: 'ready',
        blockerMessage: 'SIGN IN REQUIRED',
        confirmNotice: null,
        resolutionAction: null,
      } as never,
      false,
    );
    expect(gate.canPressGenerate).toBe(true);
    expect(gate.blockerMessage).toBe('SIGN IN REQUIRED');
  });
});
