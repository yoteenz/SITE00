/** Editorial discovery links between hub families (W0.7 / GS.FAMILY_DISCOVERY). */

import { JURNL_FAMILY_DISCOVERY } from '../../data/foundation/familyRegistry';
import { JurnlInlineAction } from './primitives';

export function FamilyDiscoveryLinks({ hubFamily, onGo }: { hubFamily: keyof typeof JURNL_FAMILY_DISCOVERY; onGo: (target: string) => void }) {
  const links = JURNL_FAMILY_DISCOVERY[hubFamily];
  if (!links?.length) return null;
  return (
    <div className="jrn-home__sec jrn-discovery" data-jrn-zone="discovery">
      <span>MORE</span>
      <div className="jrn-discovery__row">
        {links.map((link) => (
          <JurnlInlineAction key={link.targetFamily} trigger={`discovery-${hubFamily}-${link.targetFamily}`} onClick={() => onGo(link.targetFamily)}>
            {link.label}
          </JurnlInlineAction>
        ))}
      </div>
    </div>
  );
}
