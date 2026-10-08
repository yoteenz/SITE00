import { describe, expect, it } from 'vitest';
import { emptySpatialState } from './types';
import {
  applyLegacyIntakeHints,
  envelopeFromSpatialState,
  parseBuilderSpatialDraft,
  resolveSpatialDraftConflict,
} from './intakeDraft';

describe('spatial intake draft', () => {
  it('parses builder-spatial-v1 envelope', () => {
    const env = envelopeFromSpatialState({ ...emptySpatialState(), placePath: 'SIMPLE' }, null);
    const parsed = parseBuilderSpatialDraft(env as unknown as Record<string, unknown>);
    expect(parsed?.spatialStudio.placePath).toBe('SIMPLE');
    expect(parsed?.clientRevision).toBe(1);
  });

  it('prefers server when server is newer', () => {
    const serverEnv = envelopeFromSpatialState({ ...emptySpatialState(), placePath: 'WORLD', feelVibe: 'MODERN' }, null);
    const local = { ...emptySpatialState(), placePath: 'SIMPLE', savedAt: '2020-01-01T00:00:00.000Z' };
    const result = resolveSpatialDraftConflict({
      serverEnvelope: parseBuilderSpatialDraft(serverEnv as unknown as Record<string, unknown>),
      localState: local,
      serverLastSavedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.kind).toBe('use_server');
    expect(result.state.placePath).toBe('WORLD');
  });

  it('maps legacy build class hints without overwriting spatial choices', () => {
    const base = { ...emptySpatialState(), placePath: 'ADVANCED' as const };
    const merged = applyLegacyIntakeHints(base, { buildClass: 'world', answers: { type: ['ecommerce'] } });
    expect(merged.placePath).toBe('ADVANCED');
    expect(merged.workModules).toContain('SHOP');
  });
});
