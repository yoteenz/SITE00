/** Shared top chrome for F05–F16 family screens. Back returns to the previous route. */

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
  const { go, back, hasPrevious } = useJurnl();
  // Previous route, not the family's continuation screens. onBack is only the direct-open fallback.
  const label = hasPrevious ? 'BACK' : backLabel;
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <JurnlIconButton icon="back" label={label} trigger={`${familyId.toLowerCase()}-back`} onClick={() => { if (!back()) onBack(); }} />
      <span className="jrn-home__mark">JURNL</span>
      <JurnlIconButton icon="gear" label="ACCOUNT" trigger={`${familyId.toLowerCase()}-account`} onClick={() => go('account')} />
      <JurnlIconButton icon="info" label="ASK JURNL" trigger={`${familyId.toLowerCase()}-ask`} onClick={onAsk} data-family-node={nodeId} />
    </div>
  );
}
