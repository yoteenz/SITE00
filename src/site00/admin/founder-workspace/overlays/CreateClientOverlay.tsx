import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundationAdminApi, digitalFoundationClientIntakePath } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

type Props = {
  onClose: () => void;
  payload?: Record<string, unknown>;
  onDirty?: (dirty: boolean) => void;
};

export function CreateClientOverlay({ onClose, payload, onDirty }: Props) {
  const navigate = useNavigate();
  const { pushToast, openOverlay } = useFounderWorkspaceOverlay();
  const [contactEmail, setContactEmail] = useState(String(payload?.contact_email ?? 'prospect@example.com'));
  const [contactName, setContactName] = useState(String(payload?.contact_name ?? ''));
  const [businessName, setBusinessName] = useState(String(payload?.business_name ?? ''));
  const [referralKind, setReferralKind] = useState(String(payload?.referral_kind ?? 'DIRECT'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const json = await foundationAdminApi.createLeadLink({
        contact_email: contactEmail.trim() || undefined,
        contact_name: contactName.trim() || undefined,
        business_name: businessName.trim() || undefined,
        referral_kind: referralKind,
      });
      const token = json.personalized_url?.replace(/^\/foundation\//, '').split(/[?#]/)[0] ?? '';
      const intakePath = token ? digitalFoundationClientIntakePath(token) : json.personalized_url ?? '';
      const full = intakePath ? `${window.location.origin}${intakePath}` : '';
      setCreatedLink(full);
      onDirty?.(false);
      pushToast('Client created', 'ok');
      onClose();
      if (full) openOverlay('OL-02', { link: full });
      if (token) {
        const list = await foundationAdminApi.list();
        const row = list.artifacts?.find((a) => a.public_token === token);
        if (row?.artifact_id) {
          navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(row.artifact_id));
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Create failed';
      setError(msg);
      pushToast(msg, 'error', { sticky: true });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      pushToast('Copy completed', 'ok');
    } catch {
      pushToast('Copy failed', 'error');
    }
  };

  return (
    <div className="ifw-overlay-form">
      <p className="ifw-lede">Persistent artifact · permanent personalized link · real backend save</p>
      {error ? (
        <p role="alert" className="ifw-inline-error">
          {error}
        </p>
      ) : null}
      <label className="ifw-field">
        <span className="ifw-field__label">Contact email</span>
        <input
          className="ifw-field__input fw-data"
          type="email"
          value={contactEmail}
          onChange={(e) => {
            setContactEmail(e.target.value);
            onDirty?.(true);
          }}
        />
      </label>
      <label className="ifw-field">
        <span className="ifw-field__label">Contact name</span>
        <input className="ifw-field__input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
      </label>
      <label className="ifw-field">
        <span className="ifw-field__label">Business name</span>
        <input className="ifw-field__input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </label>
      <label className="ifw-field">
        <span className="ifw-field__label">Referral source kind</span>
        <select className="ifw-field__input fw-data" value={referralKind} onChange={(e) => setReferralKind(e.target.value)}>
          <option value="DIRECT">DIRECT</option>
          <option value="AIO">AIO</option>
          <option value="CLIENT_REFERRAL">CLIENT_REFERRAL</option>
          <option value="SITE00">SITE00</option>
        </select>
      </label>
      {createdLink ? (
        <p className="ifw-field">
          <span className="ifw-field__label">Intake link</span>
          <code className="fw-data ifw-code">{createdLink}</code>
        </p>
      ) : null}
      <footer className="ifw-overlay-form__actions">
        <button type="button" className="ifw-btn ifw-btn--ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        {createdLink ? (
          <button type="button" className="ifw-btn ifw-btn--primary" onClick={copyLink}>
            Copy link
          </button>
        ) : (
          <button type="button" className="ifw-btn ifw-btn--primary" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Saving…' : 'Create client'}
          </button>
        )}
      </footer>
    </div>
  );
}
