import { REFERRAL_COMMISSION_POLICY, CARD_STUDIO_COPY } from '../../config/referralPolicy';
import { OVERLAY_META, type ReferralOverlayId } from '../../overlay/overlayRegistry';
import { OverlayFormShell } from './OverlayFormShell';

type Props = {
  id: ReferralOverlayId;
  payload?: Record<string, unknown>;
  onClose: () => void;
  markDirty: (dirty: boolean) => void;
};

function policyBlock(id: ReferralOverlayId): string | undefined {
  const meta = OVERLAY_META[id];
  if (meta.blockedByPolicy) {
    return `Fixed fees cap $${REFERRAL_COMMISSION_POLICY.universalCapUsd}. No percentage commissions. Payment evidence required before accrual or payout recording.`;
  }
  if (meta.blockedByBackend) {
    return 'Partner commerce tables and durable commission ledger are not fully wired. Presentation only — no silent mutation.';
  }
  return undefined;
}

export function ReferralOverlayBody({ id, payload, onClose, markDirty }: Props) {
  const blocked = policyBlock(id);
  const partner = String(payload?.partner_label ?? CARD_STUDIO_COPY.partnerName);

  switch (id) {
    case 'RO-06':
      return (
        <OverlayFormShell
          id={id}
          lede="Referral link preview (read-only until verified)"
          primaryLabel="Copy invite path"
          primaryDisabled={!payload?.invite_path}
          onPrimary={() => {
            const path = String(payload?.invite_path ?? '/invite/demo');
            void navigator.clipboard.writeText(`${window.location.origin}${path}`);
          }}
          onClose={onClose}
        >
          <code className="ifw-code fw-data">{String(payload?.invite_path ?? '/invite/:code')}</code>
          <p className="ifw-muted">QR not generated for unverified destinations.</p>
        </OverlayFormShell>
      );

    case 'RO-07':
      return (
        <OverlayFormShell
          id={id}
          blockedReason={blocked}
          lede="QR validation"
          onClose={onClose}
        />
      );

    case 'RO-08':
      return (
        <OverlayFormShell id={id} lede="Share card assets digitally" primaryLabel="Copy link" onClose={onClose}>
          <p>{CARD_STUDIO_COPY.frontLine1}</p>
          <p>{CARD_STUDIO_COPY.frontLine2}</p>
          <p className="ifw-card-preview__partner">{partner}</p>
        </OverlayFormShell>
      );

    case 'RO-09':
      return (
        <OverlayFormShell
          id={id}
          lede="Export PNG preview locally (no print vendor)"
          primaryLabel="Export blocked"
          primaryDisabled
          onClose={onClose}
        >
          <p className="ifw-muted">Production files require verified link + proof gate (RO-10).</p>
        </OverlayFormShell>
      );

    case 'RO-10':
      return (
        <OverlayFormShell id={id} blockedReason={blocked ?? 'Print proof approval disabled'} onClose={onClose} />
      );

    case 'RO-11':
      return (
        <OverlayFormShell id={id} blockedReason={blocked} lede="Commission detail" onClose={onClose}>
          <p className="ifw-muted">No payable commission rows without verified payment evidence.</p>
        </OverlayFormShell>
      );

    default:
      return (
        <OverlayFormShell
          id={id}
          lede={OVERLAY_META[id].title}
          blockedReason={blocked}
          primaryLabel="Close"
          onClose={onClose}
        >
          {payload?.partner_kind ? (
            <p className="fw-data">
              Partner kind: {String(payload.partner_kind)}
            </p>
          ) : null}
          <p className="ifw-muted" onFocus={() => markDirty(false)}>
            Referral overlay mounted with policy/backend gates as authorized.
          </p>
        </OverlayFormShell>
      );
  }
}
