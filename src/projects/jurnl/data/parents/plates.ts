import f05 from '../../families/F05_MONEY/ENVIRONMENTS/F05_ENVIRONMENT_CABINET.jpg';
import f06 from '../../families/F06_INCOME/ENVIRONMENTS/F06_ENVIRONMENT_ARRIVAL.jpg';
import f07 from '../../families/F07_UPCOMING/ENVIRONMENTS/F07_ENVIRONMENT_HORIZON.jpg';
import f08 from '../../families/F08_PLAN/ENVIRONMENTS/F08_ENVIRONMENT_LAYOUT.jpg';
import f09 from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_LOGGIA.jpg';
import f10 from '../../families/F10_PURCHASES/ENVIRONMENTS/F10_ENVIRONMENT_NICHE.jpg';
import f11 from '../../families/F11_TRIPS/ENVIRONMENTS/F11_ENVIRONMENT_TERRACE.jpg';
import f12 from '../../families/F12_CREDIT/ENVIRONMENTS/F12_ENVIRONMENT_GRID.jpg';
import f13 from '../../families/F13_PAYDOWN/ENVIRONMENTS/F13_ENVIRONMENT_STEPS.jpg';
import f14 from '../../families/F14_GOALS/ENVIRONMENTS/F14_ENVIRONMENT_COURSE.jpg';
import f15 from '../../families/F15_AHEAD/ENVIRONMENTS/F15_ENVIRONMENT_OVERLOOK.jpg';
import f16 from '../../families/F16_RECORDS/ENVIRONMENTS/F16_ENVIRONMENT_ARCHIVE.jpg';
import type { FamilyPlate } from '../../runtime/screens/JurnlScreen';

export const PARENT_PLATES: Record<string, FamilyPlate> = {
  F05: { family: 'F05', scene: 'ENV.CABINET', src: f05, assetId: 'MONEY.ENVIRONMENT.CABINET.001' },
  F06: { family: 'F06', scene: 'ENV.ARRIVAL', src: f06, assetId: 'INCOME.ENVIRONMENT.ARRIVAL.001' },
  F07: { family: 'F07', scene: 'ENV.HORIZON', src: f07, assetId: 'UPCOMING.ENVIRONMENT.HORIZON.001' },
  F08: { family: 'F08', scene: 'ENV.LAYOUT', src: f08, assetId: 'PLAN.ENVIRONMENT.LAYOUT.001' },
  F09: { family: 'F09', scene: 'ENV.LOGGIA', src: f09, assetId: 'SAFE.ENVIRONMENT.LOGGIA.001' },
  F10: { family: 'F10', scene: 'ENV.NICHE', src: f10, assetId: 'PURCHASES.ENVIRONMENT.NICHE.001' },
  F11: { family: 'F11', scene: 'ENV.TERRACE', src: f11, assetId: 'TRIPS.ENVIRONMENT.TERRACE.001' },
  F12: { family: 'F12', scene: 'ENV.GRID', src: f12, assetId: 'CREDIT.ENVIRONMENT.GRID.001' },
  F13: { family: 'F13', scene: 'ENV.STEPS', src: f13, assetId: 'PAYDOWN.ENVIRONMENT.STEPS.001' },
  F14: { family: 'F14', scene: 'ENV.COURSE', src: f14, assetId: 'GOALS.ENVIRONMENT.COURSE.001' },
  F15: { family: 'F15', scene: 'ENV.OVERLOOK', src: f15, assetId: 'AHEAD.ENVIRONMENT.OVERLOOK.001' },
  F16: { family: 'F16', scene: 'ENV.ARCHIVE', src: f16, assetId: 'RECORDS.ENVIRONMENT.ARCHIVE.001' },
};
