/**
 * Blueprint light retry visibility (P6F1 UX) — strip + pipeline CTA
 */

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  ensureMobileDesignReferenceAuthority,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { applyFounderNbpMobileTwinPromotion } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { evaluateBlueprintLightStyleRetry } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { recordFounderTwinCapabilityDecision } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/recordFounderTwinCapabilityDecision.js';
import { resolveMobileTwinReviewSlots } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { runMobileTwinCapabilityTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileTwinCapabilityTest.js';
import { runMobileAtomicTwinGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runMobileAtomicTwinGeneration.js';
import * as falReferenceImageJob from '../shared/site00-visual-generation/falReferenceImageJob.js';
import { resolveFocusedHybridNbpModel } from '../shared/site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';

async function promotedSession() {
  let session = ensureMobileDesignReferenceAuthority(
    applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession({ projectId: 'ndxbook' })),
  );
  session = await runMobileTwinCapabilityTest({ session });
  session = recordFounderTwinCapabilityDecision(session, 'FLOW_A_MORE_ACCURATE');
  return applyFounderNbpMobileTwinPromotion(session);
}

describe('Blueprint light retry UX visibility', () => {
  it('authority panel mounts mobile blueprint retry strip', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinBlueprintRetryStrip');
  });

  it('after atomic twin, strip offers retry even when receipt auto-PASS (unknown background)', async () => {
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockImplementation(async (input) => ({
      url: `vitest-fal://${input.jobKey}`,
      jobRef: `job-${input.jobKey}`,
      model: resolveFocusedHybridNbpModel(),
    }));
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    vi.restoreAllMocks();
    const pipeline = session.mobileTwinPipeline!;
    const slots = resolveMobileTwinReviewSlots(pipeline);
    const view = evaluateBlueprintLightStyleRetry({
      actualRender: slots.actualRender,
      blueprintTwin: slots.blueprintTwin,
      artifactsById: pipeline.artifactsById,
    });
    expect(view.showRetryStrip).toBe(true);
    expect(view.canRetryLightBlueprint).toBe(true);
  });

  it('urgent flag when style receipt marks dark violation', async () => {
    vi.spyOn(falReferenceImageJob, 'runFalReferenceImageJob').mockImplementation(async (input) => ({
      url:
        input.jobKey.includes('blueprint') ? 'vitest-fal://dark-blueprint-test'
        : `vitest-fal://${input.jobKey}`,
      jobRef: `job-${input.jobKey}`,
      model: resolveFocusedHybridNbpModel(),
    }));
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    vi.restoreAllMocks();
    const pipeline = session.mobileTwinPipeline!;
    const slots = resolveMobileTwinReviewSlots(pipeline);
    const view = evaluateBlueprintLightStyleRetry({
      actualRender: slots.actualRender,
      blueprintTwin: slots.blueprintTwin,
      artifactsById: pipeline.artifactsById,
    });
    expect(view.urgentLightStyleRequired).toBe(true);
    expect(view.showRetryStrip).toBe(true);
  });
});
