/** Shared top chrome for F05–F07 family screens (Wave 2). */

import { JurnlIconButton } from './primitives';
import { useJurnl } from '../state/store';

export function FamilyChrome({
  familyId,
  nodeId,
  backLabel,
  onBack,
  onAsk,
}: {
  familyId: string;
  nodeId: string;
  backLabel: string;
  onBack: () => void;
  onAsk: () => void;
}) {
  const { go } = useJurnl();
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <JurnlIconButton icon="back" label={backLabel} trigger={`${familyId.toLowerCase()}-back`} onClick={onBack} />
      <span className="jrn-home__mark">JURNL</span>
      <JurnlIconButton icon="gear" label="ACCOUNT" trigger={`${familyId.toLowerCase()}-account`} onClick={() => go('account')} />
      <JurnlIconButton icon="info" label="ASK JURNL" trigger={`${familyId.toLowerCase()}-ask`} onClick={onAsk} data-family-node={nodeId} />
    </div>
  );
}
