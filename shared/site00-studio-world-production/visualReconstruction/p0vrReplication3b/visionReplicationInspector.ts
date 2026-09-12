/**
 * P0.VR.REPLICATION.3B — Authority vs twin vision comparison orchestrator.
 */

import { NDX_REGION_CROP_BOUNDS } from './constants.js';
import { observationToLiteralRegionSpec } from './ndxStructuralVisionSeed.js';
import { isVisionOutputTooGeneric } from './visionGenericDetector.js';
import type {
  LiteralRegionSpec,
  VisionReplicationClient,
  VisionReplicationInspectInput,
  VisionReplicationObservation,
} from './types.js';

export type VisionReplicationInspectorInput = {
  authorityImage: string;
  twinScreenshot: string | null;
  viewport: VisionReplicationInspectInput['viewport'];
  regionIds: string[];
  client: VisionReplicationClient;
  domSummary?: string;
};

export type VisionReplicationInspectorResult = {
  wholePage: VisionReplicationObservation | null;
  regions: VisionReplicationObservation[];
  literalSpecs: LiteralRegionSpec[];
  genericFailures: string[];
};

export async function runVisionReplicationInspector(
  input: VisionReplicationInspectorInput,
): Promise<VisionReplicationInspectorResult> {
  const genericFailures: string[] = [];
  const regions: VisionReplicationObservation[] = [];
  const literalSpecs: LiteralRegionSpec[] = [];

  let wholePage: VisionReplicationObservation | null = null;
  if (input.authorityImage) {
    wholePage = await input.client.inspect({
      authorityImage: input.authorityImage,
      twinScreenshot: input.twinScreenshot,
      viewport: input.viewport,
      regionId: 'whole-page',
      regionBounds: NDX_REGION_CROP_BOUNDS['whole-page'],
      domSummary: input.domSummary,
      wholePage: true,
    });
    if (isVisionOutputTooGeneric(wholePage)) {
      wholePage = { ...wholePage, status: 'VISION_OUTPUT_TOO_GENERIC' };
      genericFailures.push('whole-page');
    }
  }

  for (const regionId of input.regionIds) {
    const observation = await input.client.inspect({
      authorityImage: input.authorityImage,
      twinScreenshot: input.twinScreenshot,
      viewport: input.viewport,
      regionId,
      regionBounds: NDX_REGION_CROP_BOUNDS[regionId] ?? regionId,
      domSummary: input.domSummary,
    });
    let finalObs = observation;
    if (isVisionOutputTooGeneric(observation)) {
      finalObs = { ...observation, status: 'VISION_OUTPUT_TOO_GENERIC' };
      genericFailures.push(regionId);
    }
    regions.push(finalObs);
    if (finalObs.status === 'OK') {
      literalSpecs.push(observationToLiteralRegionSpec(finalObs));
    }
  }

  return { wholePage, regions, literalSpecs, genericFailures };
}
