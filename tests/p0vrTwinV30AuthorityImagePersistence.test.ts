/**
 * Actual + Blueprint authority images survive slim LS / empty render arrays
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';

const memoryStore = new Map<string, string>();

beforeEach(() => {
  memoryStore.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
    removeItem: (k: string) => memoryStore.delete(k),
    clear: () => memoryStore.clear(),
    key: () => null,
    length: 0,
  });
  vi.stubGlobal('sessionStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  });
});

import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import { rehydrateMobileTwinVisualArtifactsFromStore } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/rehydrateMobileTwinVisualArtifacts.js';
import {
  applyMobileTwinAuthorityImageSnapshot,
  writeMobileTwinAuthorityImageSnapshot,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinAuthorityImageSnapshot.js';
import { autoHealMobileTwinAuthorityImages } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/autoHealMobileTwinAuthorityImages.js';
import { reconcileMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/reconcileMobileTwinPipelineState.js';
import { resolveMobileTwinReviewSlots } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { writeMobileTwinPipelineToBrowser } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';

describe('mobile twin authority image persistence', () => {
  it('rehydrates renders from artifactsById when arrays were cleared', () => {
    const render = {
      id: 'render-a',
      compositionStateId: 'comp-1',
      compositionHash: 'hash-1',
      referenceAuthorityId: 'ref-1',
      renderImageUri: 'https://fal.media/files/actual-test.png',
      renderImageHash: 'h1',
      widthPx: 390,
      heightPx: 844,
      provider: 'FAL' as const,
      providerJobRef: 'job-a',
      status: 'FOUNDER_REVIEW' as const,
      createdAt: new Date().toISOString(),
    };
    const blueprint = {
      id: 'bp-a',
      compositionStateId: 'comp-1',
      compositionHash: 'hash-1',
      implementationRenderId: 'render-a',
      twinImageUri: 'https://fal.media/files/bp-test.png',
      twinImageHash: 'h2',
      provider: 'FAL' as const,
      providerJobRef: 'job-b',
      blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' as const,
      createdAt: new Date().toISOString(),
    };
    const pipeline = {
      ...emptyMobileTwinPipelineState(),
      renders: [],
      blueprintTwins: [],
      artifactsById: { [render.id]: render, [blueprint.id]: blueprint },
      activeRenderId: render.id,
    };
    const next = rehydrateMobileTwinVisualArtifactsFromStore(pipeline);
    expect(next.renders).toHaveLength(1);
    expect(next.blueprintTwins).toHaveLength(1);
    const slots = resolveMobileTwinReviewSlots(reconcileMobileTwinPipelineState(next, 'ndxbook'));
    expect(slots.actualRender?.renderImageUri).toContain('actual-test');
    expect(slots.blueprintTwin?.twinImageUri).toContain('bp-test');
  });

  it('authority image snapshot restores URIs after regressive pipeline', () => {
    const rich = {
      ...emptyMobileTwinPipelineState(),
      renders: [
        {
          id: 'render-snap',
          compositionStateId: 'comp-1',
          compositionHash: 'hash-1',
          referenceAuthorityId: 'ref-1',
          renderImageUri: 'https://fal.media/files/snap-actual.png',
          renderImageHash: 'h1',
          widthPx: 390,
          heightPx: 844,
          provider: 'FAL' as const,
          providerJobRef: 'job-s',
          status: 'FOUNDER_REVIEW' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      blueprintTwins: [
        {
          id: 'bp-snap',
          compositionStateId: 'comp-1',
          compositionHash: 'hash-1',
          implementationRenderId: 'render-snap',
          twinImageUri: 'https://fal.media/files/snap-bp.png',
          twinImageHash: 'h2',
          provider: 'FAL' as const,
          providerJobRef: 'job-bp',
          blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      activeRenderId: 'render-snap',
    };
    writeMobileTwinAuthorityImageSnapshot('ndxbook', rich);
    const empty = { ...emptyMobileTwinPipelineState(), renders: [], blueprintTwins: [] };
    const healed = applyMobileTwinAuthorityImageSnapshot(empty, 'ndxbook');
    expect(healed.renders.some((r) => r.renderImageUri.includes('snap-actual'))).toBe(true);
    expect(healed.blueprintTwins.some((b) => b.twinImageUri.includes('snap-bp'))).toBe(true);
  });

  it('autoHeal restores from snapshot when session pipeline arrays are empty', () => {
    const rich = {
      ...emptyMobileTwinPipelineState(),
      renders: [
        {
          id: 'render-auto',
          compositionStateId: 'comp-1',
          compositionHash: 'hash-1',
          referenceAuthorityId: 'ref-1',
          renderImageUri: 'https://fal.media/files/auto-actual.png',
          renderImageHash: 'h1',
          widthPx: 390,
          heightPx: 844,
          provider: 'FAL' as const,
          providerJobRef: 'job-a',
          status: 'FOUNDER_REVIEW' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      blueprintTwins: [
        {
          id: 'bp-auto',
          compositionStateId: 'comp-1',
          compositionHash: 'hash-1',
          implementationRenderId: 'render-auto',
          twinImageUri: 'https://fal.media/files/auto-bp.png',
          twinImageHash: 'h2',
          provider: 'FAL' as const,
          providerJobRef: 'job-b',
          blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      activeRenderId: 'render-auto',
      falJobsDispatched: 2,
    };
    writeMobileTwinAuthorityImageSnapshot('ndxbook', rich);
    writeMobileTwinPipelineToBrowser('ndxbook', rich);
    const empty = { ...emptyMobileTwinPipelineState(), falJobsDispatched: 2, packages: rich.packages };
    const healed = autoHealMobileTwinAuthorityImages(empty, 'ndxbook');
    const slots = resolveMobileTwinReviewSlots(reconcileMobileTwinPipelineState(healed, 'ndxbook'));
    expect(slots.actualRender?.renderImageUri).toContain('auto-actual');
    expect(slots.blueprintTwin?.twinImageUri).toContain('auto-bp');
  });
});
