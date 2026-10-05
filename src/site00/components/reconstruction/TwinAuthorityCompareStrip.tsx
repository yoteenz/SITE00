/**
 * P0.VR.REPLICATION.4R1 — Side-by-side authority vs twin strip on preview (?twinCompare=1).
 */

import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import '../../styles/site00-twin-authority-compare.css';

type Props = {
  session: ReconstructionTwinSession;
};

export function TwinAuthorityCompareStrip({ session }: Props) {
  const [params] = useSearchParams();
  if (params.get('twinCompare') !== '1') return null;

  const authority =
    session.designAuthorityAssetRef ?? '/assets/ndxbook-reconstruction/ndxbook-mobile-authority.jpg';
  const blueprint =
    session.forensicAuthorityBlueprint?.sourceBlueprintAsset ??
    '/assets/ndxbook-reconstruction/ndxbook-mobile-forensic-blueprint.jpg';

  return (
    <div className="site00-twin-compare-strip" aria-hidden="true">
      <div className="site00-twin-compare-strip__cell">
        <p>AUTHORITY</p>
        <img src={authority} alt="" />
      </div>
      <div className="site00-twin-compare-strip__cell">
        <p>BLUEPRINT</p>
        <img src={blueprint} alt="" />
      </div>
      <div className="site00-twin-compare-strip__cell site00-twin-compare-strip__cell--live">
        <p>TWIN (LIVE DOM BELOW)</p>
      </div>
    </div>
  );
}
