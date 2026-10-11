import { describe, expect, it } from 'vitest';
import { toClientBlueprintEstimate } from '../../../studioos/estimation/clientContract';
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
    const config = toEstimateConfig(selection);
    const outcome = estimateProject(config);
    if (!outcome.ok) throw new Error('spatial estimate failed');
    const canonical = toClientBlueprintEstimate(config, outcome.result);
    expect(view.productionWindow).toBe(canonical.productionWindow);
    const ends = view.productionWindow.match(/^(\d+)–(\d+) (WEEKS|MONTHS)$/);
    expect(ends).not.toBeNull();
    expect(Number(ends?.[1]) % 2).toBe(0);
    expect(Number(ends?.[2]) % 2).toBe(0);
    expect(view.productionWindow).not.toMatch(/BUSINESS DAY/i);
    expect(view.investment).toMatch(/\$/);
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
