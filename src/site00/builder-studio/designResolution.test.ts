import { describe, expect, it } from 'vitest';
import { emptySelection } from '../builder-experience/samples';
import type { BuilderSelection } from '../builder-experience/types';
import { snapshotFromSpatialState, emptySpatialState } from '../builder-experience/spatialStudio';
import { creativeExpressionSignature, designConflicts, resolveDesignDetails } from './designResolution';
import { pageDepthCopySignature } from './pageValueIntelligence';

const sel = (partial: Partial<BuilderSelection>): BuilderSelection => ({ ...emptySelection(), ...partial });

describe('designResolution — structure independent of aesthetic', () => {
  const editorialBase = {
    build: 'SITE' as const,
    structure: 'EDITORIAL' as const,
    capabilities: ['EDIT_CONTENT', 'SELL', 'PAYMENTS'] as const,
    expression: { primary: 'ARCHITECTURAL_MINIMAL' as const, secondary: null, likedParts: [], edition: 'FULL' as const },
  };

  const configA = sel({
    ...editorialBase,
    type: 'EXPRESSIVE_DISPLAY',
    color: 'HIGH_CONTRAST_MONO',
    imageWorld: 'PHOTOGRAPHIC',
    motion: 'QUIET',
  });

  const configB = sel({
    ...editorialBase,
    expression: { primary: 'POP_EDITORIAL', secondary: null, likedParts: [], edition: 'FULL' },
    type: 'CONDENSED_DISPLAY',
    color: 'SATURATED_EDITORIAL',
    imageWorld: 'EDITORIAL_COLLAGE',
    motion: 'KINETIC',
  });

  const configC = sel({
    ...editorialBase,
    expression: { primary: 'SOFT_ORGANIC', secondary: null, likedParts: [], edition: 'FULL' },
    type: 'HUMANIST_SANS',
    color: 'WARM_MINERAL',
    imageWorld: 'PHOTOGRAPHIC',
    motion: 'QUIET',
  });

  it('keeps the same structure while creative dimensions differ (A / B / C)', () => {
    for (const cfg of [configA, configB, configC]) {
      const structure = resolveDesignDetails(cfg).find((d) => d.key === 'STRUCTURE');
      expect(structure?.value).toBe('EDITORIAL');
      expect(structure?.provenance).toBe('CLIENT_SELECTED');
    }
    const sigs = [configA, configB, configC].map(creativeExpressionSignature);
    expect(new Set(sigs).size).toBe(3);
  });

  it('marks explicit tunables as client selections', () => {
    const type = resolveDesignDetails(configA).find((d) => d.key === 'TYPOGRAPHY');
    expect(type?.provenance).toBe('CLIENT_SELECTED');
    expect(type?.provenanceLabel).toBe('YOUR SELECTION');
  });

  it('marks system defaults as recommendations, not confirmed client choices', () => {
    const spatial = snapshotFromSpatialState(
      { ...emptySpatialState(), placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD', room: 'BLUEPRINT' },
      { computeEstimate: false },
    ).selection;
    const color = resolveDesignDetails(spatial).find((d) => d.key === 'COLOR_DIRECTION');
    expect(color?.provenance).toBe('SITE00_RECOMMENDED');
    expect(color?.provenanceLabel).toBe('OUR RECOMMENDATION');
  });

  it('does not overwrite explicit choices when structure changes', () => {
    const withOverride = sel({ ...configA, structure: 'COMMERCE' });
    const type = resolveDesignDetails(withOverride).find((d) => d.key === 'TYPOGRAPHY');
    expect(type?.value).toBe(resolveDesignDetails(configA).find((d) => d.key === 'TYPOGRAPHY')?.value);
  });

  it('surfaces conflicts without hiding client overrides', () => {
    const conflicts = designConflicts(configA);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.every((c) => c.recommendation.includes('KEEP YOUR SELECTION'))).toBe(true);
  });
});

describe('pageValueIntelligence — page-specific depth copy', () => {
  it('does not repeat the generic full-depth sentence for every page', () => {
    const selection = sel({
      build: 'SITE',
      structure: 'COMMERCE',
      expression: { primary: 'POP_EDITORIAL', secondary: null, likedParts: [], edition: 'FULL' },
      capabilities: ['SELL', 'PAYMENTS', 'EDIT_CONTENT', 'ACCOUNTS'],
      experiences: [
        { id: 'HOME', depth: 'FULL' },
        { id: 'ABOUT', depth: 'FULL' },
        { id: 'SHOP', depth: 'FULL' },
        { id: 'CHECKOUT', depth: 'FULL' },
      ],
    });
    const copies = pageDepthCopySignature(selection);
    expect(copies.length).toBe(4);
    expect(new Set(copies).size).toBe(4);
    expect(copies.join(' ')).not.toContain('EVERY STATE AND SUB-VIEW PEOPLE MEET');
  });

  it('does not promise checkout without sell', () => {
    const selection = sel({
      build: 'SITE',
      structure: 'EDITORIAL',
      expression: { primary: 'EDITORIAL_OBJECT', secondary: null, likedParts: [], edition: 'ESSENTIAL' },
      capabilities: ['EDIT_CONTENT'],
      experiences: [{ id: 'CHECKOUT', depth: 'FULL' }],
    });
    const copies = pageDepthCopySignature(selection);
    expect(copies[0]).toMatch(/NOT IN THIS BUILD/);
  });
});

describe('spatial feel paths — distinct creative resolution', () => {
  it('MODERN vs BOLD vs EDITORIAL on advanced builds resolve different expression rows', () => {
    const base = { placePath: 'ADVANCED' as const, workModules: ['PAGES', 'SHOP'] as const, pace: 'STANDARD' as const, room: 'BLUEPRINT' as const };
    const sigs = (['MODERN', 'BOLD', 'EDITORIAL'] as const).map((feelVibe) =>
      creativeExpressionSignature(snapshotFromSpatialState({ ...emptySpatialState(), ...base, feelVibe }, { computeEstimate: false }).selection),
    );
    expect(new Set(sigs).size).toBe(3);
  });
});
