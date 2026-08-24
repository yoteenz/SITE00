/**
 * P0.5E.4 — NDX types extending generic founder discovery run.
 */

import type { EmbodiedCharacterFounderDiscoveryRun } from '../../site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import type { NDX_FOUNDER_CHARACTER_DISCOVERY_RUN_ID } from './constants.js';

export type NdxFounderCharacterDiscoveryRun = EmbodiedCharacterFounderDiscoveryRun & {
  runId: typeof NDX_FOUNDER_CHARACTER_DISCOVERY_RUN_ID;
  ndxBookTerminologyIntegrated: true;
};
