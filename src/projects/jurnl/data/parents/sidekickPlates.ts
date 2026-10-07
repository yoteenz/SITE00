import today from '../../families/F03_TODAY/ENVIRONMENTS/F03_SIDEKICK_PLATE.jpg';
import money from '../../families/F05_MONEY/ENVIRONMENTS/F05_SIDEKICK_PLATE.jpg';
import plan from '../../families/F08_PLAN/ENVIRONMENTS/F08_SIDEKICK_PLATE.jpg';
import credit from '../../families/F12_CREDIT/ENVIRONMENTS/F12_SIDEKICK_PLATE.jpg';
import type { FamilyPlate } from '../../runtime/screens/JurnlScreen';

/** Parent sidekick plates. Environment only. Live type sits above them. Children keep the earlier family plates. */
export const SIDEKICK_PLATES: Record<'F03' | 'F05' | 'F08' | 'F12', FamilyPlate> = {
  F03: { family: 'F03', scene: 'ENV.DAY', src: today, assetId: 'TODAY.ENVIRONMENT.DAY.001', width: 2016, height: 3584 },
  F05: { family: 'F05', scene: 'ENV.CABINET', src: money, assetId: 'MONEY.ENVIRONMENT.CABINET.001', width: 2016, height: 3584 },
  F08: { family: 'F08', scene: 'ENV.FOLIO', src: plan, assetId: 'PLAN.ENVIRONMENT.FOLIO.001', width: 2016, height: 3584 },
  F12: { family: 'F12', scene: 'ENV.DOSSIER', src: credit, assetId: 'CREDIT.ENVIRONMENT.DOSSIER.001', width: 2016, height: 3584 },
};
