import { describe, expect, it } from 'vitest';
import { estimateProject } from '../../../studioos/estimation/engine';
import { builderEstimateView } from '../clientView';
import { toEstimateConfig } from '../toEstimateConfig';
import { buildObjectParametersFromSpatialState } from './buildObjectContract';
import { snapshotFromSpatialState } from './blueprintSessionContract';
import { spatialSelectionToBuilder } from './mapping';
import { emptySpatialState } from './types';

describe('Hybrid Spatial Studio mapping', () => {
  it('maps a full spatial path to a valid estimator config', () => {
    const state = {
      ...emptySpatialState(),
      placePath: 'ADVANCED' as const,
      feelVibe: 'MODERN' as const,
      workModules: ['PAGES', 'SHOP'] as const,
      pace: 'STANDARD' as const,
    };
    const selection = spatialSelectionToBuilder(state);
    const view = builderEstimateView(selection);
    expect(view.productionWindow.toUpperCase()).toMatch(/WEEK|MONTH/);
    expect(view.productionWindow).not.toMatch(/BUSINESS DAY/i);
    expect(view.investment).toMatch(/\$/);
    const config = toEstimateConfig(selection);
    expect(estimateProject(config).ok).toBe(true);
    expect(selection.build).toBe('SITE');
  });

  it('never uses Digital Foundation day-count language in estimator output', () => {
    const selection = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'SIMPLE',
      feelVibe: 'EDITORIAL',
      workModules: ['PAGES'],
      pace: 'STANDARD',
    });
    const view = builderEstimateView(selection);
    expect(JSON.stringify(view)).not.toMatch(/2–3 BUSINESS/i);
    expect(JSON.stringify(view)).not.toMatch(/3–5 BUSINESS/i);
  });

  it('exposes build object parameters without image URLs', () => {
    const params = buildObjectParametersFromSpatialState({
      placePath: 'ADVANCED',
      feelVibe: 'MODERN',
      workModules: ['PAGES', 'SHOP'],
      pace: 'STANDARD',
    });
    expect(params.layer_count_hint).toBeGreaterThan(2);
    expect(params.build_kind).toBe('SITE');
    expect(JSON.stringify(params)).not.toMatch(/https:\/\//);
  });

  it('blueprint snapshot blocks submission until complete', () => {
    const snap = snapshotFromSpatialState({ ...emptySpatialState(), room: 'PLACE' });
    expect(snap.submission_ready).toBe(false);
    expect(snap.submission_blockers.length).toBeGreaterThan(0);
  });

  it('maps WORLD place path to WORLD build kind', () => {
    const selection = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'WORLD',
      feelVibe: 'IMMERSIVE',
      workModules: ['PAGES'],
      pace: 'FLEXIBLE',
    });
    expect(selection.build).toBe('WORLD');
    expect(selection.world).not.toBeNull();
  });
});
