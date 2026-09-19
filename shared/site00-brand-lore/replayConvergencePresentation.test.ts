import { describe, expect, it } from 'vitest';
import {
  isLegacyInvalidComparisonReport,
  formatConvergenceScore,
  methodologyVerdictFromReport,
} from './replayConvergencePresentation.js';
import type { ReplayConvergenceReport } from './personalityReplayTypes.js';

describe('replayConvergencePresentation', () => {
  it('detects legacy stub 0/5 reports', () => {
    const legacy: ReplayConvergenceReport = {
      personalityDomains: [],
      scores: {
        personalityConvergence: 0,
        creativeConvergence: 0,
        identityConvergence: 0,
        heroConvergence: 0,
      },
      divergenceStage: null,
      shadowMarkedUpAnalogDirectionId: null,
      benchmarkLoadedAt: null,
    };
    expect(isLegacyInvalidComparisonReport(legacy)).toBe(true);
    expect(methodologyVerdictFromReport(legacy)).toContain('LEGACY INVALID');
  });

  it('shows NOT EVALUATED for new stub dimensions', () => {
    const modern: ReplayConvergenceReport = {
      personalityDomains: [],
      scores: {
        personalityConvergence: 2.5,
        creativeConvergence: 'NOT_EVALUATED',
        identityConvergence: 'NOT_EVALUATED',
        heroConvergence: 'NOT_EVALUATED',
      },
      divergenceStage: null,
      shadowMarkedUpAnalogDirectionId: null,
      benchmarkLoadedAt: null,
      scorerVersion: 'LEGACY_HEURISTIC_V1',
      legacyInvalidComparison: false,
    };
    expect(isLegacyInvalidComparisonReport(modern)).toBe(false);
    expect(formatConvergenceScore(modern.scores.creativeConvergence)).toBe('NOT EVALUATED');
  });
});
