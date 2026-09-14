/**
 * Mobile twin dedicated LS — no regressive overwrite + recovery detection
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryStore = new Map<string, string>();

beforeEach(() => {
  memoryStore.clear();
  const stub = {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memoryStore.set(k, v);
    },
    removeItem: (k: string) => {
      memoryStore.delete(k);
    },
    clear: () => memoryStore.clear(),
    key: () => null,
    length: 0,
  };
  vi.stubGlobal('localStorage', stub);
  vi.stubGlobal('sessionStorage', stub);
});

import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import {
  readMobileTwinPipelineFromBrowser,
  writeMobileTwinPipelineToBrowser,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { evaluateMobileTwinPipelineRecovery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinPipelineRecovery.js';
import { emptyMobileTwinPipelineState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/types.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';
import { resolveFocusedHybridNbpModel } from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

async function richPipelineSession() {
  vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockImplementation(async (input) => ({
    url: `vitest-fal://${input.jobKey}`,
    jobRef: `job-${input.jobKey}`,
    model: resolveFocusedHybridNbpModel(),
  }));
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  session = applyFounderNbpMobileTwinPromotion(session);
  session = await runMobileAtomicTwinGeneration({ session });
  vi.restoreAllMocks();
  return session;
}

describe('mobile twin pipeline persistence recovery', () => {
  it('does not overwrite richer dedicated LS with empty session pipeline', async () => {
    const session = await richPipelineSession();
    const pipeline = session.mobileTwinPipeline!;
    writeMobileTwinPipelineToBrowser('ndxbook', pipeline);
    const before = readMobileTwinPipelineFromBrowser('ndxbook');
    expect((before?.falJobsDispatched ?? 0) > 0).toBe(true);

    const empty = { ...emptyMobileTwinPipelineState(), designReference: pipeline.designReference };
    writeMobileTwinPipelineToBrowser('ndxbook', empty);
    const after = readMobileTwinPipelineFromBrowser('ndxbook');
    expect(after?.falJobsDispatched).toBe(before?.falJobsDispatched);
    expect((after?.renders.length ?? 0) >= (before?.renders.length ?? 0)).toBe(true);
  });

  it('recovery strip when session pipeline regressed vs dedicated store', async () => {
    const session = await richPipelineSession();
    writeMobileTwinPipelineToBrowser('ndxbook', session.mobileTwinPipeline!);
    const regressed = {
      ...session,
      mobileTwinPipeline: { ...emptyMobileTwinPipelineState(), designReference: session.mobileTwinPipeline!.designReference },
    };
    const view = evaluateMobileTwinPipelineRecovery(regressed, 'ndxbook');
    expect(view.showRecoveryStrip).toBe(true);
    expect(view.storedFalJobs).toBeGreaterThan(view.sessionFalJobs);
  });
});
