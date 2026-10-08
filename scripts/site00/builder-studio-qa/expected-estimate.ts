/**
 * QA helper: the canonical estimate for a SpatialBuilderState, straight from Composer's contract.
 *   npx tsx scripts/site00/builder-studio-qa/expected-estimate.ts '<SpatialBuilderState JSON>'
 * Prints { investment, productionWindow, submission_ready } so the browser QA can compare the Blueprint with it.
 */
import { snapshotFromSpatialState } from '../../../src/site00/builder-experience/spatialStudio/blueprintSessionContract';
import type { SpatialBuilderState } from '../../../src/site00/builder-experience/spatialStudio/types';

const state = JSON.parse(process.argv[2] ?? '{}') as SpatialBuilderState;
const snap = snapshotFromSpatialState({ ...state, room: 'BLUEPRINT' }, { allowEstimate: true });
process.stdout.write(
  JSON.stringify({
    investment: snap.estimate?.investment ?? null,
    productionWindow: snap.estimate?.productionWindow ?? null,
    submission_ready: snap.submission_ready,
  }),
);
