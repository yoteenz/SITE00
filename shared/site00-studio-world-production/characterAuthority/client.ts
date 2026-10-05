/** Browser-safe character authority exports (no node:crypto). */

export {
  CHARACTER_AUTHORITY_VERSION,
  CHARACTER_BLOCKER_HEADLINE,
  CHARACTER_BLOCKER_MESSAGE,
  CHARACTER_BLOCKER_SUBHEAD,
  CHARACTER_PLACEHOLDER_LABEL,
} from './constants.js';
export { summarizeCharacterReadiness, type CharacterReadinessSummary } from './readinessSummary.js';
export { filmCanPlanBeforeVisualLock, creditUtilizationPlanningAllowedBeforeLock } from './downstreamIntegration.js';
