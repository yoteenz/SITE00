/** Shared top row for F05–F16. Back and the menu live in the viewport corner chrome, in the Safe to Spend position. */

import { JurnlIconButton } from './primitives';

export function FamilyChrome({
  familyId,
  nodeId,
  onAsk,
}: {
  familyId: string;
  nodeId: string;
  /** Kept so existing call sites still type-check. The corner back owns the action. */
  backLabel?: string;
  onBack?: () => void;
  onAsk: () => void;
}) {
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <span className="jrn-home__mark">JURNL</span>
      <JurnlIconButton icon="info" label="ASK JURNL" trigger={`${familyId.toLowerCase()}-ask`} onClick={onAsk} data-family-node={nodeId} />
    </div>
  );
}
