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
import {
  evaluateBlueprintLightStyleRetry,
  evaluateBlueprintLightStyleRetryFromPipeline,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
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
  it('authority panel mounts mobile blueprint retry strip near recovery strip', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3AuthorityReviewPanel.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinBlueprintRetryStrip');
    expect(src.indexOf('DesignPageV3AuthorityRecoveryStrip')).toBeLessThan(
      src.indexOf('DesignPageV3MobileTwinBlueprintRetryStrip'),
    );
  });

  it('locked provider panel embeds retry block when twin pair exists', () => {
    const src = readFileSync('src/site00/components/designWorkspace/DesignPageV3MobileTwinLockedProviderPanel.tsx', 'utf8');
    expect(src).toContain('DesignPageV3MobileTwinBlueprintRetryBlock');
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

  it('legacy blueprint without styleContractId still shows retry when NBP locked', async () => {
    const session = await runMobileAtomicTwinGeneration({ session: await promotedSession() });
    const pipeline = session.mobileTwinPipeline!;
    const bp = pipeline.blueprintTwins.at(-1)!;
    const legacyPipeline = {
      ...pipeline,
      blueprintTwins: pipeline.blueprintTwins.map((b) =>
        b.id === bp.id ?
          {
            ...b,
            styleContractId: null,
            outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER' as const,
            promptContractVersion: null,
          }
        : b,
      ),
    };
    const view = evaluateBlueprintLightStyleRetryFromPipeline(legacyPipeline);
    expect(view.showRetryStrip).toBe(true);
  });
});
