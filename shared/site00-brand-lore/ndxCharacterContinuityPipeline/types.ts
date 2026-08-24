/**
 * P0.5E.5 — NDX types extending generic continuity pipeline run.
 */

import type { CharacterContinuityPipelineRun } from '../../site00-studio-world-production/characterContinuityPipeline/types.js';
import type { NDX_CHARACTER_CONTINUITY_RUN_ID } from './constants.js';

export type NdxCharacterContinuityPipelineRun = CharacterContinuityPipelineRun & {
  runId: typeof NDX_CHARACTER_CONTINUITY_RUN_ID;
  ndxBookTerminologyIntegrated: true;
  ndxMotionBehaviorIntegrated: true;
};
