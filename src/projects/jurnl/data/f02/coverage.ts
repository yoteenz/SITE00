/**
 * What the JURNL runtime implements for F02. Proven by tests/jurnlF02Runtime.test.tsx.
 */

import type { RuntimeCoverage } from '../../../../../shared/site00-product-families/familyGate.js';
import { F02_SCREENS } from './screens';

export const JURNL_F02_COVERAGE: RuntimeCoverage = {
  screens: F02_SCREENS.map((s) => s.id),
  states: [
    'F02.00.RESUME',
    'F02.02.CONNECTED',
    'F02.02.1.VALIDATION',
    'F02.03.VALIDATION',
    'F02.04.VALIDATION',
    'F02.05.1.VALIDATION',
    'F02.06.VALIDATION',
  ],
  interactions: ['F02.IN.PERMISSION', 'F02.IN.ADD', 'F02.IN.SKIP', 'F02.NAV.BACK', 'F02.NAV.CONTINUE'],
  components: ['JURNL_BUTTON_PRIMARY', 'JURNL_DRAWER_LONG', 'JURNL_DRAWER_SHORT', 'JURNL_ICON_BUTTON'],
  responsive: ['MOBILE', 'TABLET', 'DESKTOP'],
};
