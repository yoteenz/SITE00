import type { RuntimeCoverage } from '../../../../../shared/site00-product-families/familyGate.js';

export const JURNL_F04_COVERAGE: RuntimeCoverage = {
  screens: ['F04.00'],
  states: ['F04.00.LOADING', 'F04.00.EMPTY', 'F04.00.NO_RESULTS', 'F04.00.FILTERED', 'F04.00.ERROR'],
  interactions: ['F04.IN.SEARCH', 'F04.IN.FILTER', 'F04.IN.DETAIL', 'F04.NAV.BACK', 'F04.IN.QUICK_ADD', 'F04.IN.ASK'],
  components: ['JURNL_INPUT', 'JURNL_DRAWER_LONG', 'JURNL_DRAWER_SHORT', 'JURNL_ICON_BUTTON', 'JURNL_TRANSACTION_ROW', 'JURNL_NAV'],
  responsive: ['MOBILE', 'TABLET', 'DESKTOP'],
};
