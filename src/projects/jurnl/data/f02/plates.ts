/**
 * F02 runtime plates and header marks.
 * Imported from the canonical mount. Screen authorities are not imported here.
 */

import arrival from '../../families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_ARRIVAL.jpg';
import desk from '../../families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_DESK.jpg';
import edit from '../../families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_EDIT.jpg';
import quiet from '../../families/F02_SETUP/ENVIRONMENTS/F02_ENVIRONMENT_QUIET.jpg';
import e1 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_001.png';
import e2 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_002.png';
import e3 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_003.png';
import e4 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_004.png';
import e5 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_005.png';
import e6 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_006.png';
import e7 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_007.png';
import e8 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_008.png';
import e9 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_009.png';
import e10 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_010.png';
import e11 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_011.png';
import e12 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_012.png';
import e13 from '../../families/F02_SETUP/BOTANICALS/F02_BOTANICAL_EMBLEM_013.png';
import lockupJurnl from '../../families/F02_SETUP/BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_001.png';
import lockupSetup from '../../families/F02_SETUP/BRAND_LOCKUPS/F02_BRANDLOCKUP_JURNL_SETUP_001.png';

export type F02PlateId = 'ENV.ARRIVAL' | 'ENV.DESK' | 'ENV.EDIT' | 'ENV.QUIET';

export const F02_PLATES: Record<F02PlateId, { assetId: string; src: string }> = {
  'ENV.ARRIVAL': { assetId: 'SETUP.ENVIRONMENT.ARRIVAL.001', src: arrival },
  'ENV.DESK': { assetId: 'SETUP.ENVIRONMENT.DESK.001', src: desk },
  'ENV.EDIT': { assetId: 'SETUP.ENVIRONMENT.EDIT.001', src: edit },
  'ENV.QUIET': { assetId: 'SETUP.ENVIRONMENT.QUIET.001', src: quiet },
};

export const F02_EMBLEMS = {
  'F02.BOTANICAL.EMBLEM.001': e1,
  'F02.BOTANICAL.EMBLEM.002': e2,
  'F02.BOTANICAL.EMBLEM.003': e3,
  'F02.BOTANICAL.EMBLEM.004': e4,
  'F02.BOTANICAL.EMBLEM.005': e5,
  'F02.BOTANICAL.EMBLEM.006': e6,
  'F02.BOTANICAL.EMBLEM.007': e7,
  'F02.BOTANICAL.EMBLEM.008': e8,
  'F02.BOTANICAL.EMBLEM.009': e9,
  'F02.BOTANICAL.EMBLEM.010': e10,
  'F02.BOTANICAL.EMBLEM.011': e11,
  'F02.BOTANICAL.EMBLEM.012': e12,
  'F02.BOTANICAL.EMBLEM.013': e13,
} as const;

export const F02_LOCKUPS = {
  'F02.BRANDLOCKUP.JURNL.001': lockupJurnl,
  'F02.BRANDLOCKUP.JURNL_SETUP.001': lockupSetup,
} as const;

export type F02EmblemId = keyof typeof F02_EMBLEMS;
export type F02LockupId = keyof typeof F02_LOCKUPS;
