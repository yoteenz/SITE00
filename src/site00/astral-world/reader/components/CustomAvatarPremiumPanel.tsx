import { Link } from 'react-router-dom';
import { CUSTOM_ASTRAL_AVATAR_PRODUCT_KEY, CUSTOM_AVATAR_ENTITLEMENT_POLICY } from '../../../../../shared/site00-astral-world/readerAccount/customAvatarEntitlement.js';
import type { CustomAvatarEntitlementState } from '../../../../../shared/site00-astral-world/readerAccount/types.js';
import { ASTRAL_READER_ROUTE_BASE } from '../../../../../shared/site00-astral-world/readerAccount/readerRoutes.js';

type CustomAvatarPremiumPanelProps = {
  entitlement: CustomAvatarEntitlementState;
  onPurchase?: () => void;
  onUploadReference?: (file: File) => void;
};

export function CustomAvatarPremiumPanel({ entitlement, onPurchase, onUploadReference }: CustomAvatarPremiumPanelProps) {
  const canGenerate = entitlement === 'PURCHASED' || entitlement === 'REGENERATION_PURCHASE_REQUIRED';
  const canSelect = entitlement === 'READY_FOR_SELECTION';

  return (
    <section className="aw-reader-custom-avatar">
      <p className="aw-label">Premium path</p>
      <h2 className="aw-display aw-display--section">Create My Astral Self</h2>
      <p className="aw-muted">
        Translate your reference into Astral World&apos;s cinematic visual language — recognizably you, never stock.
      </p>

      <dl className="aw-reader-custom-avatar__meta">
        <div><dt>Product</dt><dd>{CUSTOM_ASTRAL_AVATAR_PRODUCT_KEY}</dd></div>
        <div><dt>Status</dt><dd>{entitlement}</dd></div>
        <div><dt>Candidates / purchase</dt><dd>{CUSTOM_AVATAR_ENTITLEMENT_POLICY.candidatesPerPurchase}</dd></div>
      </dl>

      {entitlement === 'NOT_PURCHASED' ? (
        <button type="button" className="aw-btn-primary" onClick={onPurchase}>
          Unlock Premium Custom Avatar
        </button>
      ) : null}

      {canGenerate ? (
        <label className="aw-reader-custom-avatar__upload">
          <span className="aw-label">Reference photo (private generation input)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onUploadReference) onUploadReference(file);
            }}
          />
          <p className="aw-muted">Reference images are not automatically public profile images.</p>
        </label>
      ) : null}

      {canSelect ? (
        <p className="aw-muted">Generation complete — select your preferred candidate to activate.</p>
      ) : null}

      {entitlement === 'ACTIVE' ? (
        <Link to={`${ASTRAL_READER_ROUTE_BASE}/avatar`} className="aw-btn-primary">
          Manage Custom Avatar
        </Link>
      ) : null}
    </section>
  );
}
