import { useEffect, useRef, type ReactNode } from 'react';
import { useFounderWorkspaceOverlay } from './OverlayContext';
import { overlayTitle, isReferralOverlay } from './overlayRegistry';
import { CreateClientOverlay } from '../overlays/CreateClientOverlay';
import { ReferralPolicyGateOverlay } from '../overlays/ReferralPolicyGateOverlay';
import { GenericWorkspaceOverlay } from '../overlays/GenericWorkspaceOverlay';

export function OverlayHost() {
  const { open, closeOverlay } = useFounderWorkspaceOverlay();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    root?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
  }, [open]);

  if (!open) return null;

  const title = overlayTitle(open.id);
  const referral = isReferralOverlay(open.id);

  let body: ReactNode;
  if (open.id === 'CREATE_CLIENT' || open.id === 'OL-05') {
    body = <CreateClientOverlay onClose={closeOverlay} payload={open.payload} />;
  } else if (referral && ['RO-06', 'RO-08', 'RO-11'].includes(open.id)) {
    body = <ReferralPolicyGateOverlay overlayId={open.id} onClose={closeOverlay} />;
  } else if (referral) {
    body = <GenericWorkspaceOverlay variant="referral" overlayId={open.id} onClose={closeOverlay} payload={open.payload} />;
  } else {
    body = <GenericWorkspaceOverlay variant="workspace" overlayId={open.id} onClose={closeOverlay} payload={open.payload} />;
  }

  return (
    <div className="ifw-overlay-host" data-ifw-overlay={open.id}>
      <button type="button" className="ifw-overlay-host__scrim" aria-label="Close dialog" onClick={closeOverlay} />
      <div
        ref={dialogRef}
        className={`ifw-overlay-host__panel ${referral ? 'ifw-overlay-host__panel--referral' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ifw-overlay-title"
      >
        <header className="ifw-overlay-host__head">
          <h2 id="ifw-overlay-title" className="ifw-overlay-host__title">
            {title}
          </h2>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={closeOverlay}>
            Close
          </button>
        </header>
        <div className="ifw-overlay-host__body">{body}</div>
      </div>
    </div>
  );
}
