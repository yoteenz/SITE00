import { describe, expect, it } from 'vitest';
import { emptySpatialState } from './spatialStudio/types';
import { resolveScopeEstimate } from './scopeEstimateResult';
import { snapshotFromSpatialState } from './spatialStudio/blueprintSessionContract';

describe('resolveScopeEstimate', () => {
  it('returns ESTIMATED ranges for SIMPLE · MODERN · PAGES · FLEXIBLE (founder-reported case)', () => {
    const state = {
      ...emptySpatialState(),
      room: 'BLUEPRINT' as const,
      placePath: 'SIMPLE' as const,
      feelVibe: 'MODERN' as const,
      workModules: ['PAGES'] as const,
      pace: 'FLEXIBLE' as const,
    };
    const { scope, estimate } = resolveScopeEstimate(state);
    expect(scope.quoteStatus).toBe('ESTIMATED');
    expect(scope.priceMinimum).toBeGreaterThan(0);
    expect(scope.priceMaximum).toBeGreaterThan(scope.priceMinimum!);
    expect(scope.timelineMinimum).toBeGreaterThan(0);
    expect(scope.timelineUnit).toBe('WEEKS');
    expect(estimate?.investment).toMatch(/\$/);
    expect(estimate?.productionWindow).toMatch(/WEEKS|MONTHS/);
  });

  it('computes on Blueprint even when client preview flag would hide figures', () => {
    const state = {
      ...emptySpatialState(),
      room: 'BLUEPRINT' as const,
      placePath: 'SIMPLE' as const,
      feelVibe: 'MODERN' as const,
      workModules: ['PAGES'] as const,
      pace: 'STANDARD' as const,
    };
    const snap = snapshotFromSpatialState(state, { computeEstimate: true });
    expect(snap.estimate).not.toBeNull();
    expect(snap.scope_estimate?.quoteStatus).toBe('ESTIMATED');
  });

  it('marks WORLD builds as REQUIRES_REVIEW while still returning indicative numbers', () => {
    const state = {
      ...emptySpatialState(),
      room: 'BLUEPRINT' as const,
      placePath: 'WORLD' as const,
      feelVibe: 'IMMERSIVE' as const,
      workModules: ['PAGES'] as const,
      pace: 'STANDARD' as const,
    };
    const { scope, estimate } = resolveScopeEstimate(state);
    expect(scope.quoteStatus).toBe('REQUIRES_REVIEW');
    expect(estimate).not.toBeNull();
    expect(scope.clientMessage).toMatch(/founder/i);
  });

  it('returns INCOMPLETE without dashes when rooms are unfinished', () => {
    const { scope, estimate } = resolveScopeEstimate({ ...emptySpatialState(), room: 'WORK' });
    expect(scope.quoteStatus).toBe('INCOMPLETE');
    expect(estimate).toBeNull();
    expect(scope.clientMessage).toBeTruthy();
  });
});
