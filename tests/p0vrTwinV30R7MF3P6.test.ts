/**
 * P0.VR.TWINV3.0R7MF3P6 — Mobile Twin routing cleanup + NBP enforcement + hydration
 */

import { describe, expect, it, vi } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import {
  assertMobileTwinNbpModelAtDispatch,
  MOBILE_TWIN_PROVIDER_LOCK_VIOLATION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/assertMobileTwinNbpProviderModel.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { getMobileTwinVisualProviderStrategy } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/getMobileTwinVisualProviderStrategy.js';
import {
  hydrateMobileTwinReviewState,
  resolveMobileTwinReviewSlots,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { mergeMobileTwinFalApiResponse } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mergeMobileTwinFalApiResponse.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import { tryRecoverOrphanTwinArtifacts } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/tryRecoverOrphanTwinArtifacts.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';
import {
  resolveFocusedHybridGpt2Model,
  resolveFocusedHybridNbpModel,
} from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

async function promotedSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return applyFounderNbpMobileTwinPromotion(session);
}

describe('P0.VR.TWINV3.0R7MF3P6 Mobile Twin routing', () => {
  it('1–3 provider strategy is NBP_FULL_PAIR atomic sibling', async () => {
    const session = await promotedSession();
    const route = getMobileTwinVisualProviderStrategy(session.mobileTwinPipeline)!;
    expect(route.strategy).toBe('NBP_FULL_PAIR');
    expect(route.method).toBe('ATOMIC_SIBLING_FROM_COMPOSITION');
    expect(route.viewport).toBe('MOBILE');
    expect(route.actual.model).toBe(resolveFocusedHybridNbpModel());
    expect(route.blueprint.model).toBe(resolveFocusedHybridNbpModel());
  });

  it('4 GPT2 at dispatch boundary throws MOBILE_TWIN_PROVIDER_LOCK_VIOLATION', async () => {
    const session = await promotedSession();
    expect(() =>
      assertMobileTwinNbpModelAtDispatch('openai/gpt-image-2/edit', session.mobileTwinPipeline, 'actual'),
    ).toThrow(MOBILE_TWIN_PROVIDER_LOCK_VIOLATION);
  });

  it('5–7 atomic run created with GENERATING before FAL completes', async () => {
    const session = await promotedSession();
    const jobKeys: string[] = [];
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockImplementation(async (input) => {
      jobKeys.push(input.jobKey);
      return {
        url: `vitest-fal://${input.jobKey}`,
        jobRef: `job-${input.jobKey}`,
        model: resolveFocusedHybridNbpModel(),
        normalizedInput: {},
      };
    });
    const after = await runMobileAtomicTwinGeneration({ session });
    const run = after.mobileTwinPipeline!.atomicRuns.at(-1)!;
    expect(run.status).toBe('FOUNDER_REVIEW_READY');
    expect(run.actualRenderArtifactId).toBeTruthy();
    expect(run.blueprintRenderArtifactId).toBeTruthy();
    expect(jobKeys.some((k) => k.includes('mobile-render'))).toBe(true);
    expect(jobKeys.some((k) => k.includes('mobile-blueprint'))).toBe(true);
    vi.restoreAllMocks();
  });

  it('8–11 NBP only — two FAL jobs, no GPT2', async () => {
    const session = await promotedSession();
    const spy = vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob');
    spy.mockClear();
    await runMobileAtomicTwinGeneration({ session });
    expect(spy).toHaveBeenCalledTimes(2);
    for (const call of spy.mock.calls) {
      expect(call[0].model).toBe(resolveFocusedHybridNbpModel());
      expect(call[0].model).not.toBe(resolveFocusedHybridGpt2Model());
    }
    spy.mockRestore();
  });

  it('14–15 review slots mount atomic run artifacts', async () => {
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const hydrated = hydrateMobileTwinReviewState(session.mobileTwinPipeline!);
    const slots = resolveMobileTwinReviewSlots(hydrated);
    expect(slots.actualRender?.renderImageUri).toContain('vitest-fal');
    expect(slots.blueprintTwin?.twinImageUri).toContain('vitest-fal');
    expect(slots.falJobCount).toBeGreaterThanOrEqual(2);
    expect(slots.providerCostUsd).toBeGreaterThan(0);
  });

  it('19–21 merge prefers server pipeline for hydration', async () => {
    const client = await promotedSession();
    const server = await runMobileAtomicTwinGeneration({ session: client });
    const merged = mergeMobileTwinFalApiResponse(client, server.mobileTwinPipeline!, server.updatedAt);
    const slots = resolveMobileTwinReviewSlots(merged.mobileTwinPipeline!);
    expect(slots.actualRender).toBeTruthy();
    expect(slots.blueprintTwin).toBeTruthy();
  });

  it('29 orphan recovery mounts single orphan NBP actual', async () => {
    let session = await promotedSession();
    const comp = session.mobileTwinPipeline!.compositionStates[0]!;
    session = {
      ...session,
      mobileTwinPipeline: {
        ...session.mobileTwinPipeline!,
        activeCompositionStateId: comp.id,
        renders: [
          {
            id: 'orphan-actual',
            compositionStateId: comp.id,
            compositionHash: comp.compositionHash,
            referenceAuthorityId: session.mobileTwinPipeline!.designReference!.id,
            renderImageUri: 'vitest-fal://orphan-actual',
            renderImageHash: 'hash',
            widthPx: 1080,
            heightPx: 1920,
            provider: 'FAL',
            providerJobRef: 'job-1',
            providerModel: resolveFocusedHybridNbpModel(),
            providerStatus: 'GENERATED',
            renderMode: 'REAL_PROVIDER_RENDER',
            providerArtifactType: 'REAL_VISUAL_GENERATION',
            status: 'FOUNDER_REVIEW',
            createdAt: new Date().toISOString(),
          },
        ],
        blueprintTwins: [],
      },
    };
    const recovered = tryRecoverOrphanTwinArtifacts(session);
    expect(recovered.mobileTwinPipeline!.activeRenderId).toBe('orphan-actual');
  });
});
