/** Shared top chrome for F05–F16 family screens. Back is context-aware inside a paginated frame. */

import { JurnlIconButton } from './primitives';
import { useJurnl } from '../state/store';
import { useFrameBack } from './FamilyFrame';

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
  // Context-aware back: inside a paginated frame it walks continuation screens before leaving the route.
  const frame = useFrameBack();
  const label = frame.screenIndex > 0 ? `BACK TO SCREEN ${frame.screenIndex}` : backLabel;
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <JurnlIconButton icon="back" label={label} trigger={`${familyId.toLowerCase()}-back`} onClick={() => (frame.back() ? undefined : onBack())} />
      <span className="jrn-home__mark">JURNL</span>
      <JurnlIconButton icon="gear" label="ACCOUNT" trigger={`${familyId.toLowerCase()}-account`} onClick={() => go('account')} />
      <JurnlIconButton icon="info" label="ASK JURNL" trigger={`${familyId.toLowerCase()}-ask`} onClick={onAsk} data-family-node={nodeId} />
    </div>
  );
}
