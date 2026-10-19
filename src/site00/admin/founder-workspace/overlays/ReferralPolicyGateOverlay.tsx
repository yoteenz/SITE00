import { REFERRAL_COMMISSION_POLICY } from '../config/referralPolicy';

type Props = {
  overlayId: string;
  onClose: () => void;
};

export function ReferralPolicyGateOverlay({ overlayId, onClose }: Props) {
  return (
    <div className="ifw-blocked-panel">
      <p className="ifw-blocked-panel__title">Blocked by policy</p>
      <p>
        {overlayId} requires verified payment evidence and authorized backend recording. Commissions are fixed-dollar (
        {REFERRAL_COMMISSION_POLICY.standardUsd}/{REFERRAL_COMMISSION_POLICY.establishedUsd} up to $
        {REFERRAL_COMMISSION_POLICY.universalCapUsd} cap) with a {REFERRAL_COMMISSION_POLICY.holdDaysAfterVerifiedPayment}
        -day hold after verified payment.
      </p>
      <p>Payout execution remains external manual · record-only when audit trail exists.</p>
      <button type="button" className="ifw-btn ifw-btn--primary" onClick={onClose}>
        Understood
      </button>
    </div>
  );
}
