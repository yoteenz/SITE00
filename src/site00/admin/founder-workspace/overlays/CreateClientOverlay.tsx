import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foundationAdminApi, digitalFoundationClientIntakePath } from '../../services/foundationAdminApi';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { WsBanner, WsButton, WsChip, WsChoice, WsChoiceGroup, WsField, WsInput } from '../shell/wsKit';

type Props = {
  onClose: () => void;
  payload?: Record<string, unknown>;
  onDirty?: (dirty: boolean) => void;
};

const SOURCES: Array<[string, string, string]> = [
  ['DIRECT', 'DIRECT', 'NO REFERRAL'],
  ['AIO', 'AIO', 'PLANNED PARTNER · ATTRIBUTION ONLY · NOT ACTIVE'],
  ['CLIENT_REFERRAL', 'CLIENT REFERRAL', 'AN EXISTING CLIENT INTRODUCED THEM'],
  ['SITE00', 'SITE 00', 'SITE 00 OUTREACH'],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * OL-01 CREATE A FOUNDATION — OPUS2 family: phone full screen · tablet/desktop dialog. Creates the persistent
 * artifact and its permanent personal link through the admin API; nothing is emailed. Success (OL-02) only after the
 * server returns the link; a failed write keeps every entry.
 */
export function CreateClientOverlay({ onClose, payload, onDirty }: Props) {
  const navigate = useNavigate();
  const { pushToast, openOverlay, closeOverlay } = useFounderWorkspaceOverlay();
  const [contactEmail, setContactEmail] = useState(String(payload?.contact_email ?? ''));
  const [contactName, setContactName] = useState(String(payload?.contact_name ?? ''));
  const [businessName, setBusinessName] = useState(String(payload?.business_name ?? ''));
  const [referralKind, setReferralKind] = useState(String(payload?.referral_kind ?? 'DIRECT'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailErr = contactEmail.trim() && !EMAIL_RE.test(contactEmail.trim()) ? 'CHECK THIS EMAIL ADDRESS' : null;
  const touch = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    onDirty?.(true);
  };

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
      if (!full) throw new Error('THE SERVER DID NOT RETURN A PERSONAL LINK');
      onDirty?.(false);
      let artifactId: string | undefined;
      try {
        const list = await foundationAdminApi.list();
        artifactId = list.artifacts?.find((a) => a.public_token === token)?.artifact_id;
      } catch {
        artifactId = undefined;
      }
      pushToast('FOUNDATION CREATED · CONFIRMED BY THE SERVER', 'success');
      onClose();
      openOverlay('OL-02', { link: full, artifact_id: artifactId, business_name: businessName.trim() || undefined });
      if (artifactId) navigate(IDNTY_FOUNDER_WORKSPACE_ROUTES.client(artifactId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="ws-ov__b" data-overlay-body="OL-01">
        <WsChoiceGroup label="FOUNDATION TYPE" cols={2}>
          <WsChoice on title="CLIENT FOUNDATION" desc="CREATES THE ARTIFACT + PERSONAL LINK" onSelect={() => undefined} />
          <WsChoice on={false} disabled title="SYNTHETIC TEST CLIENT" tag={<WsChip kind="test">TEST</WsChip>} desc="USE 07 SYSTEM → TEST LAB" onSelect={() => undefined} />
        </WsChoiceGroup>
        <div className="ifw-grid2">
          <WsField label="BUSINESS NAME">
            <WsInput value={businessName} onChange={touch(setBusinessName)} readOnly={busy} ariaLabel="BUSINESS NAME" placeholder="ENTER BUSINESS NAME" />
          </WsField>
          <WsField label="CONTACT NAME">
            <WsInput value={contactName} onChange={touch(setContactName)} readOnly={busy} ariaLabel="CONTACT NAME" placeholder="ENTER CONTACT NAME" />
          </WsField>
        </div>
        <WsField label="CONTACT EMAIL" opt err={emailErr}>
          <WsInput value={contactEmail} onChange={touch(setContactEmail)} type="email" inputMode="email" readOnly={busy} err={Boolean(emailErr)} ariaLabel="CONTACT EMAIL" placeholder="ENTER EMAIL ADDRESS" />
        </WsField>
        <div>
          <div className="ws-label" style={{ marginBottom: 10 }}>
            REFERRAL SOURCE
          </div>
          <WsChoiceGroup label="REFERRAL SOURCE" cols={2}>
            {SOURCES.map(([v, t, d]) => (
              <WsChoice
                key={v}
                on={referralKind === v}
                title={t}
                desc={d}
                disabled={busy}
                onSelect={() => {
                  setReferralKind(v);
                  onDirty?.(true);
                }}
              />
            ))}
          </WsChoiceGroup>
        </div>
        {error ? (
          <WsBanner tone="red" icon="warning">
            NOT CREATED — THE SERVER DID NOT CONFIRM A DURABLE WRITE. NOTHING WAS SAVED. RETRY; YOUR ENTRIES ARE KEPT. <span className="ws-data">{error}</span>
          </WsBanner>
        ) : null}
      </div>
      <div className="ws-ov__f">
        <span className="ws-meta" style={{ marginRight: 'auto', alignSelf: 'center' }}>
          NO EMAIL IS SENT
        </span>
        <WsButton tone="out" disabled={busy} onClick={() => closeOverlay()}>
          CANCEL
        </WsButton>
        <WsButton tone="red" arrow={!error} icon={error ? 'retry' : undefined} busy={busy} disabled={Boolean(emailErr)} onClick={() => void submit()}>
          {busy ? 'CREATING…' : error ? 'RETRY' : 'CREATE FOUNDATION'}
        </WsButton>
      </div>
    </>
  );
}
