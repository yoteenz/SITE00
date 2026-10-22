import type { RegisteredOverlayId, ReferralOverlayId, WorkspaceOverlayId } from '../overlay/overlayRegistry';
import { isReferralOverlay } from '../overlay/overlayRegistry';
import { CreateClientOverlay } from './CreateClientOverlay';
import { WorkspaceOverlayBody } from './bodies/WorkspaceOverlayBody';
import { ReferralOverlayBody } from './bodies/ReferralOverlayBody';

type Props = {
  id: RegisteredOverlayId;
  payload?: Record<string, unknown>;
  onClose: () => void;
  markDirty: (dirty: boolean) => void;
};

export function OverlayBody({ id, payload, onClose, markDirty }: Props) {
  if (id === 'OL-01') {
    return <CreateClientOverlay onClose={onClose} payload={payload} onDirty={markDirty} />;
  }
  if (isReferralOverlay(id)) {
    return <ReferralOverlayBody id={id as ReferralOverlayId} payload={payload} onClose={onClose} markDirty={markDirty} />;
  }
  return (
    <WorkspaceOverlayBody id={id as WorkspaceOverlayId} payload={payload} onClose={onClose} markDirty={markDirty} />
  );
}
