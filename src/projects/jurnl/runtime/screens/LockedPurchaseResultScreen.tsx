/**
 * Locked-shell Check a Purchase results.
 * The photograph is the derived screen: logo, tagline, arch, horizon, and dock are the parent pixels.
 * The design viewport shows that image. The coded purchases/checked screen stays the live interaction.
 */

import doesntFit from '../../../../../JURNL/F09_SAFE/PURCHASE_OUTCOMES_INCREMENT1/PURCHASE_RESULT_DOESNT_FIT.png';
import goodToGo from '../../../../../JURNL/F09_SAFE/PURCHASE_OUTCOMES_INCREMENT1/PURCHASE_RESULT_GOOD_TO_GO.png';
import quickCheckIn from '../../../../../JURNL/F09_SAFE/PURCHASE_OUTCOMES_INCREMENT1/PURCHASE_RESULT_QUICK_CHECK_IN.png';

const RESULTS = {
  'F09.RESULT.GOOD': goodToGo,
  'F09.RESULT.CHECK_IN': quickCheckIn,
  'F09.RESULT.OVER': doesntFit,
} as const;

export type LockedPurchaseResultId = keyof typeof RESULTS;

export function LockedPurchaseResultScreen({ screenId }: { screenId: LockedPurchaseResultId }) {
  return (
    <div className="jrn-locked-result" data-jrn-screen={screenId}>
      <img src={RESULTS[screenId]} alt="" />
    </div>
  );
}
