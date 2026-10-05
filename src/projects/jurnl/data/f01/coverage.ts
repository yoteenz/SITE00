/**
 * What the JURNL runtime implements for F01 (declared here, PROVEN by tests/jurnlF01Runtime.test.tsx which renders
 * every screen, state, overlay and trigger listed). The host's family gate reads this.
 */

import type { RuntimeCoverage } from '../../../../../shared/site00-product-families/familyGate.js';
import { JURNL_COMPONENT_RUNTIME, F01_INTERACTION_MANIFEST, F01_BINDINGS } from './interactionBindings';
import { F01_SCREENS, F01_STATES } from './screens';

/** Extra runtime-only state selectors (interaction states that have no sheet of their own). */
export const F01_RUNTIME_EXTRA_STATES = {
  'F01.04': ['faceid_failed'],
  'F01.05': ['invalid_email'],
  'F01.06': ['expired_link'],
  'F01.07': ['mismatch', 'weak', 'network_error'],
} as const;

export const JURNL_F01_COVERAGE: RuntimeCoverage = {
  screens: F01_SCREENS.map((s) => s.id),
  states: F01_STATES.map((s) => s.id),
  interactions: F01_INTERACTION_MANIFEST.interactions.map((r) => r.interaction_id).filter((id) => !!F01_BINDINGS[id]),
  components: Object.keys(JURNL_COMPONENT_RUNTIME),
  responsive: ['MOBILE', 'TABLET', 'DESKTOP'],
};
