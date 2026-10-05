import type { RuntimeCoverage } from '../../../../../shared/site00-product-families/familyGate.js';

export const JURNL_F03_COVERAGE: RuntimeCoverage = {
  screens: ['F03.00'],
  states: ['F03.00.LOADING', 'F03.00.EMPTY', 'F03.00.PARTIAL', 'F03.00.CONNECTED', 'F03.00.ERROR', 'F03.00.CAUGHT_UP', 'F03.00.ATTENTION', 'F03.00.STALE'],
  interactions: ['F03.IN.SEE_WHY', 'F03.IN.QUICK_ADD', 'F03.IN.ASK', 'F03.IN.UPCOMING', 'F03.IN.ACTIVITY', 'F03.NAV.BACK'],
  components: ['JURNL_DRAWER_LONG', 'JURNL_DRAWER_SHORT', 'JURNL_BUTTON_PRIMARY', 'JURNL_BUTTON_SECONDARY', 'JURNL_ICON_BUTTON', 'JURNL_TRANSACTION_ROW', 'JURNL_NAV'],
  responsive: ['MOBILE', 'TABLET', 'DESKTOP'],
};
