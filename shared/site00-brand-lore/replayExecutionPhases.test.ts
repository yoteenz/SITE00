import { describe, expect, it } from 'vitest';
import {
  REPLAY_EXECUTION_PHASE_LABELS,
  replayExecutionPhaseLabel,
} from './replayExecutionPhases';

describe('replayExecutionPhases', () => {
  it('exposes founder-facing progression labels', () => {
    expect(replayExecutionPhaseLabel('FORMING_CORE_DIRECTION')).toBe('FORMING CORE DIRECTION');
    expect(REPLAY_EXECUTION_PHASE_LABELS.GENERATING_HERO).toBe('GENERATING HERO');
    expect(replayExecutionPhaseLabel('REPLAY_COMPLETE')).toBe('REPLAY COMPLETE');
  });
});
