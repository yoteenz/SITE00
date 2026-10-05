/**
 * F01.09 BIOMETRIC SETUP · F01.10 DEVICE TRUST · F01.11 PRIVACY PRIMER · F01.12 SECURITY PRIMER · F01.13 ENTRY COMPLETE
 * + the F01 → F02 family boundary.
 */

import { useEffect, useState } from 'react';
import { F01_COPY } from '../../data/f01/copy';
import type { JurnlIconName } from '../components/icons';
import {
  JurnlButton,
  JurnlChoice,
  JurnlDrawer,
  JurnlErrorPanel,
  JurnlHeadline,
  JurnlLines,
  JurnlLogo,
  JurnlModal,
  JurnlNativeHandoff,
  JurnlRow,
  JurnlSheet,
  JurnlSuccessPanel,
  JurnlTextLink,
  JurnlTile,
  JurnlToggle,
} from '../components/primitives';
import type { JurnlSession } from '../state/adapters';
import { useJurnl, type AiKey } from '../state/store';
import { MailHandoff, useNetworkToast } from './EntryScreens';
import { JurnlScreen } from './JurnlScreen';

const C = F01_COPY;

/* ───────────── F01.09 BIOMETRIC SETUP ───────────── */
export function BiometricSetupScreen() {
  const { forcedState, overlay, openOverlay, closeOverlay, bridge, setDevice, showToast, go } = useJurnl();
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<'enabled' | 'failed' | 'unavailable' | null>(
    forcedState === 'biometric_enabled' ? 'enabled' : forcedState === 'biometric_unavailable' ? 'unavailable' : null,
  );

  const request = async () => {
    setWaiting(true);
    const outcome = await bridge.requestBiometric('ENABLE');
    setWaiting(false);
    if (outcome === 'GRANTED') {
      closeOverlay();
      setDevice({ biometric: 'ENABLED', biometricMethod: 'FACE_ID' });
      setResult('enabled');
      showToast({ tone: 'success', title: C.biometric.enabledTitle, body: C.biometric.enabledBody, testId: 'toast-biometric-enabled' });
    } else if (outcome === 'DENIED') {
      openOverlay('biometric-denied');
    } else {
      closeOverlay();
      setResult(outcome === 'UNAVAILABLE' ? 'unavailable' : 'failed');
    }
  };
  const decline = () => {
    setDevice({ biometric: 'DECLINED' });
    go('F01.10');
  };

  return (
    <JurnlScreen screenId="F01.09" scene="biometric">
      <div className="jrn-col__head jrn-hero-copy" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.biometric.headline} lg />
        <i className="jrn-rule" aria-hidden />
        <p className="jrn-body" data-claim="C08">
          {C.biometric.body}
        </p>
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        {result === 'enabled' ?
          <>
            <JurnlSuccessPanel testId="bio-enabled" title={C.biometric.enabledTitle} body={C.biometric.enabledBody} />
            <JurnlButton trigger="bio-enabled-continue" onClick={() => go('F01.10')}>
              {C.common.continue}
            </JurnlButton>
          </>
        : result === 'unavailable' ?
          <>
            <JurnlErrorPanel testId="bio-error-unavailable" title={C.biometric.unavailableTitle} body={C.biometric.unavailableBody} />
            <JurnlButton
              trigger="bio-unavailable-continue"
              onClick={() => {
                setDevice({ biometric: 'UNAVAILABLE' });
                go('F01.10');
              }}
            >
              {C.common.continue}
            </JurnlButton>
          </>
        : <>
            {result === 'failed' ?
              <JurnlErrorPanel testId="bio-error-failed" title={C.unlock.failedTitle} body={C.unlock.failedBody} />
            : null}
            <JurnlButton trigger="bio-enable" onClick={() => openOverlay('faceid-enable')}>
              {C.biometric.enable}
            </JurnlButton>
            <JurnlButton variant="secondary" trigger="bio-not-now" onClick={decline}>
              {C.biometric.notNow}
            </JurnlButton>
          </>
        }
      </div>
      {overlay === 'faceid-enable' ?
        <JurnlNativeHandoff
          testId="faceid-enable"
          title={C.biometric.handoffTitle}
          body={C.biometric.handoffBody}
          waiting={waiting}
          waitingLabel={C.biometric.waiting}
          continueLabel={C.common.continue}
          onContinue={() => void request()}
          onCancel={() => {
            setWaiting(false);
            closeOverlay();
          }}
        />
      : null}
      {overlay === 'biometric-denied' ?
        <JurnlDrawer
          size="short"
          testId="biometric-denied"
          title={C.biometric.deniedTitle}
          lead={C.biometric.deniedBody}
          onClose={closeOverlay}
          footer={
            <>
              <JurnlButton variant="secondary" trigger="bio-open-settings" onClick={() => void bridge.openExternal('SETTINGS')}>
                {C.biometric.openSettings}
              </JurnlButton>
              <JurnlButton trigger="bio-denied-continue" onClick={decline}>
                {C.biometric.continueWithout}
              </JurnlButton>
            </>
          }
        />
      : null}
    </JurnlScreen>
  );
}

/* ───────────── F01.10 DEVICE TRUST ───────────── */
export function DeviceTrustScreen() {
  const { forcedState, overlay, openOverlay, closeOverlay, setDevice, showToast, go } = useJurnl();
  const trust = () => {
    setDevice({ deviceTrust: 'TRUSTED' });
    showToast({ tone: 'success', title: C.deviceTrust.toastTitle, body: C.deviceTrust.toastBody, testId: 'toast-device-trusted' });
    go('F01.11');
  };
  return (
    <JurnlScreen screenId="F01.10" scene="trust">
      <div className="jrn-col__head jrn-hero-copy" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.deviceTrust.headline} xl />
        <i className="jrn-rule" aria-hidden />
        <p className="jrn-body" data-claim="C09">
          {C.deviceTrust.body}
        </p>
        <span style={{ marginTop: 10 }}>
          <JurnlTextLink underline trigger="trust-learn" onClick={() => openOverlay('device-learn')}>
            {C.deviceTrust.learn}
          </JurnlTextLink>
        </span>
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        {forcedState === 'device_trusted' ?
          <JurnlSuccessPanel testId="trust-trusted" title={C.deviceTrust.trustedTitle} body={C.deviceTrust.trustedBody} />
        : null}
        {forcedState === 'device_verify_required' ?
          <JurnlErrorPanel
            testId="trust-verify-required"
            title={C.deviceTrust.verifyTitle}
            body={C.deviceTrust.verifyBody}
            action={{ label: C.deviceTrust.verifyCta, onClick: () => openOverlay('mail'), trigger: 'trust-verify-device' }}
          />
        : null}
        <JurnlButton trigger="trust-confirm" onClick={trust}>
          {forcedState === 'device_trusted' ? C.common.continue : C.deviceTrust.trust}
        </JurnlButton>
        <JurnlButton
          variant="secondary"
          trigger="trust-not-now"
          onClick={() => {
            setDevice({ deviceTrust: 'NOT_NOW' });
            go('F01.11');
          }}
        >
          {C.deviceTrust.notNow}
        </JurnlButton>
      </div>
      {overlay === 'device-learn' ?
        <JurnlDrawer size="long" testId="device-learn" title={C.deviceTrust.learnTitle} onClose={closeOverlay} footer={<JurnlButton trigger="device-learn-got-it" onClick={closeOverlay}>{C.common.gotIt}</JurnlButton>}>
          <div className="jrn-list">
            {C.deviceTrust.learnItems.map((it, i) => (
              <JurnlRow key={it.title} icon={(['device', 'shield', 'account'] as JurnlIconName[])[i]} title={it.title} sub={it.body} />
            ))}
          </div>
        </JurnlDrawer>
      : null}
      {overlay === 'mail' ? <MailHandoff /> : null}
    </JurnlScreen>
  );
}

/* ───────────── F01.11 PRIVACY PRIMER ───────────── */
const PRIVACY_ROWS: { id: keyof typeof C.privacy.rows; icon: JurnlIconName }[] = [
  { id: 'your-data', icon: 'lock' },
  { id: 'connected-accounts', icon: 'link' },
  { id: 'ai-access', icon: 'chip' },
  { id: 'data-export', icon: 'document' },
  { id: 'remove-access', icon: 'trash' },
];

export function PrivacyPrimerScreen() {
  const { overlay, openOverlay, closeOverlay, go } = useJurnl();
  const privacyOverlay = overlay?.startsWith('privacy-') ? overlay.slice('privacy-'.length) : null;
  return (
    <JurnlScreen screenId="F01.11" scene="privacy" layout="card">
      <div className="jrn-meta">
        <JurnlLogo small />
        <span className="jrn-eyebrow">{C.privacy.eyebrow}</span>
      </div>
      <div className="jrn-card jrn-card--paper jrn-privacy-card" data-runtime-bounds="card">
        <JurnlHeadline lines={C.privacy.headline} />
        <p className="jrn-kicker">{C.privacy.body}</p>
        <div className="jrn-list" data-runtime-bounds="rows">
          {PRIVACY_ROWS.map((r) => (
            <JurnlRow key={r.id} icon={r.icon} title={C.privacy.rows[r.id]} trigger={`privacy-row-${r.id}`} onClick={() => openOverlay(`privacy-${r.id}`)} />
          ))}
        </div>
        <div className="jrn-stack jrn-stack--tight" style={{ marginTop: 8 }}>
          <JurnlButton trigger="privacy-continue" onClick={() => go('F01.12')}>
            {C.privacy.continue}
          </JurnlButton>
          <JurnlButton variant="secondary" trigger="privacy-details" onClick={() => openOverlay('privacy-details')}>
            {C.privacy.details}
          </JurnlButton>
        </div>
      </div>
      {privacyOverlay === 'details' ?
        <JurnlDrawer size="long" testId="privacy-details" eyebrow={C.privacy.detailsEyebrow} title={C.privacy.detailsTitle} lead={C.privacy.detailsLead} onClose={closeOverlay}>
          <div className="jrn-list">
            {PRIVACY_ROWS.map((r) => (
              <JurnlRow key={r.id} icon={r.icon} title={C.privacy.rows[r.id]} trigger={`privacy-details-${r.id}`} onClick={() => openOverlay(`privacy-${r.id}`)} />
            ))}
          </div>
          <p className="jrn-eyebrow" style={{ marginTop: 10 }}>
            {C.privacy.detailsFooter}
          </p>
        </JurnlDrawer>
      : null}
      {privacyOverlay && privacyOverlay !== 'details' ? <PrivacyDrawer id={privacyOverlay} /> : null}
      {overlay === 'delete-account' ? <DeleteAccountModal /> : null}
    </JurnlScreen>
  );
}

function PrivacyDrawer({ id }: { id: string }) {
  const { closeOverlay, openOverlay, device, setDevice, session, showToast } = useJurnl();
  const P = C.privacy;
  const [ai, setAi] = useState(device.ai);
  const [exportState, setExportState] = useState<'idle' | 'requested'>(device.exportRequested ? 'requested' : 'idle');
  const [revokeNote, setRevokeNote] = useState(false);
  const title = P.rows[id as keyof typeof P.rows] ?? '';
  if (id === 'your-data') {
    return (
      <JurnlDrawer size="long" testId="privacy-your-data" title={title} lead={P.yourData.lead} onClose={closeOverlay} footer={<JurnlButton trigger="privacy-your-data-done" onClick={closeOverlay}>{C.common.done}</JurnlButton>}>
        <div className="jrn-list">
          {P.yourData.items.map((it) => (
            <JurnlRow
              key={it.id}
              icon={it.id === 'profile' ? 'account' : it.id === 'financial' ? 'database' : it.id === 'usage' ? 'chip' : 'gear'}
              title={it.title}
              sub={it.id === 'profile' && session.account ? `${session.account.firstName} ${session.account.lastName} · ${session.account.email}` : it.sub}
            />
          ))}
        </div>
      </JurnlDrawer>
    );
  }
  if (id === 'connected-accounts') {
    return (
      <JurnlDrawer size="long" testId="privacy-connected-accounts" title={title} lead={P.connected.lead} onClose={closeOverlay} footer={<JurnlButton trigger="privacy-connected-done" onClick={closeOverlay}>{C.common.done}</JurnlButton>}>
        <div className="jrn-list">
          {P.connected.items.map((it) => (
            <JurnlRow key={it.id} icon={it.id === 'bank' ? 'database' : it.id === 'cards' ? 'document' : 'link'} title={it.title} end={<span className="jrn-badge jrn-badge--muted">{it.sub}</span>} />
          ))}
        </div>
        <p className="jrn-eyebrow">{P.connected.note}</p>
      </JurnlDrawer>
    );
  }
  if (id === 'ai-access') {
    return (
      <JurnlDrawer
        size="long"
        testId="privacy-ai-access"
        title={title}
        lead={P.ai.lead}
        onClose={closeOverlay}
        footer={
          <JurnlButton
            trigger="privacy-ai-save"
            onClick={() => {
              setDevice({ ai });
              closeOverlay();
              showToast({ tone: 'success', title: P.ai.savedTitle, body: P.ai.savedBody, testId: 'toast-ai-saved' });
            }}
          >
            {P.ai.save}
          </JurnlButton>
        }
      >
        <div className="jrn-list">
          {P.ai.toggles.map((t) => (
            <JurnlRow
              key={t.id}
              title={t.title}
              sub={t.sub}
              end={<JurnlToggle checked={ai[t.id as AiKey]} label={t.title} trigger={`privacy-ai-${t.id}`} onChange={(v) => setAi((a) => ({ ...a, [t.id]: v }))} />}
            />
          ))}
        </div>
      </JurnlDrawer>
    );
  }
  if (id === 'data-export') {
    return (
      <JurnlDrawer
        size="long"
        testId="privacy-data-export"
        title={title}
        lead={P.exportData.lead}
        onClose={closeOverlay}
        footer={
          exportState === 'requested' ?
            <JurnlButton trigger="privacy-export-done" onClick={closeOverlay}>
              {C.common.gotIt}
            </JurnlButton>
          : <JurnlButton
              trigger="privacy-export-request"
              onClick={() => {
                setDevice({ exportRequested: true });
                setExportState('requested');
              }}
            >
              {P.exportData.request}
            </JurnlButton>
        }
      >
        {exportState === 'requested' ?
          <JurnlSuccessPanel testId="privacy-export-requested" title={P.exportData.requestedTitle}>
            <p className="jrn-body" data-claim="C10">
              {P.exportData.requestedBody}
            </p>
          </JurnlSuccessPanel>
        : <div className="jrn-list">
            {P.exportData.items.map((it) => (
              <JurnlRow key={it.id} icon="download" title={it.title} end={<span className="jrn-badge jrn-badge--muted">{it.sub}</span>} />
            ))}
          </div>
        }
      </JurnlDrawer>
    );
  }
  if (id === 'remove-access') {
    return (
      <JurnlDrawer
        size="long"
        testId="privacy-remove-access"
        title={title}
        lead={P.remove.lead}
        onClose={closeOverlay}
        footer={
          <JurnlButton variant="destructive" trigger="privacy-delete-account" onClick={() => openOverlay('delete-account')}>
            {P.remove.deleteCta}
          </JurnlButton>
        }
      >
        <div className="jrn-list">
          <JurnlRow icon="trash" title={P.remove.items[0]!.title} sub={P.remove.items[0]!.sub} trigger="privacy-remove-delete" onClick={() => openOverlay('delete-account')} />
          <JurnlRow icon="link" title={P.remove.items[1]!.title} sub={P.remove.items[1]!.sub} trigger="privacy-remove-revoke" onClick={() => setRevokeNote(true)} />
          <JurnlRow
            icon="chip"
            title={P.remove.items[2]!.title}
            sub={P.remove.items[2]!.sub}
            trigger="privacy-remove-disable-ai"
            onClick={() => {
              setDevice({ ai: { personalizedInsights: false, smartCategorization: false, budgetRecommendations: false, naturalLanguage: false, marketTrends: false } });
              showToast({ tone: 'success', title: P.remove.aiDisabledTitle, body: P.remove.aiDisabledBody, testId: 'toast-ai-disabled' });
            }}
          />
        </div>
        {revokeNote ? <p className="jrn-eyebrow">{P.remove.nothingToRevoke}</p> : null}
        <JurnlErrorPanel testId="privacy-remove-warning" title={P.remove.warning} />
      </JurnlDrawer>
    );
  }
  return null;
}

function DeleteAccountModal() {
  const { auth, closeOverlay, session, signOut, setDevice, device, go } = useJurnl();
  const [loading, setLoading] = useState(false);
  const netToast = useNetworkToast();
  return (
    <JurnlModal
      testId="delete-account"
      icon="trash"
      tone="wine"
      title={C.privacy.remove.confirmTitle}
      body={C.privacy.remove.confirmBody}
      onCancel={closeOverlay}
      confirm={{
        label: C.privacy.remove.deleteCta,
        variant: 'destructive',
        loading,
        trigger: 'delete-account-confirm',
        onClick: async () => {
          setLoading(true);
          const res = await auth.deleteAccount(session.account?.email ?? '');
          setLoading(false);
          if (!res.ok) return netToast(res.code);
          setDevice({ remembered: device.remembered.filter((r) => r.email !== session.account?.email) });
          signOut();
          go('F01.00');
        },
      }}
    />
  );
}

/* ───────────── F01.12 SECURITY PRIMER ───────────── */
const SECURITY_ROWS: { id: keyof typeof C.security.rows; icon: JurnlIconName }[] = [
  { id: 'biometric', icon: 'fingerprint' },
  { id: 'device', icon: 'laptop' },
  { id: 'connected', icon: 'account' },
  { id: 'data', icon: 'database' },
  { id: 'sessions', icon: 'gear' },
];

export function SecurityPrimerScreen() {
  const { overlay, openOverlay, closeOverlay, go } = useJurnl();
  const sec = overlay?.startsWith('security-') ? overlay.slice('security-'.length) : null;
  return (
    <JurnlScreen screenId="F01.12" scene="security">
      <div className="jrn-col__head" data-runtime-bounds="copy">
        <div className="jrn-meta">
          <JurnlLogo />
          <span className="jrn-eyebrow">{C.security.eyebrow}</span>
        </div>
        <div style={{ marginTop: 24 }} />
        <JurnlHeadline lines={C.security.headline} />
      </div>
      <div className="jrn-list jrn-security-rows" data-runtime-bounds="rows">
        {SECURITY_ROWS.map((r) => (
          <JurnlRow key={r.id} icon={r.icon} title={C.security.rows[r.id].title} trigger={`security-row-${r.id}`} onClick={() => openOverlay(`security-${r.id}`)} />
        ))}
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton trigger="security-continue" onClick={() => go('F01.13')}>
          {C.security.continue}
        </JurnlButton>
        <JurnlButton variant="secondary" trigger="security-details" onClick={() => openOverlay('security-details')}>
          {C.security.details}
        </JurnlButton>
      </div>
      {sec === 'details' ?
        <JurnlSheet testId="security-details" title={C.security.detailsTitle} onClose={closeOverlay}>
          <JurnlHeadline lines={C.security.headline} />
          <div className="jrn-list">
            {SECURITY_ROWS.map((r) => (
              <JurnlRow key={r.id} icon={r.icon} title={C.security.rows[r.id].title} sub={C.security.rows[r.id].sub} trigger={`security-details-${r.id}`} onClick={() => openOverlay(`security-${r.id}`)} />
            ))}
          </div>
        </JurnlSheet>
      : null}
      {sec && sec !== 'details' ? <SecurityDrawer id={sec} /> : null}
      {overlay === 'revoke-session' ? <RevokeSessionModal /> : null}
    </JurnlScreen>
  );
}

function SecurityDrawer({ id }: { id: string }) {
  const { closeOverlay, openOverlay, device, setDevice, auth, showToast } = useJurnl();
  const S = C.security;
  const row = S.rows[id as keyof typeof S.rows];
  const [bio, setBio] = useState(device.biometric === 'ENABLED');
  const [method, setMethod] = useState(device.biometricMethod);
  const [sessions, setSessions] = useState<JurnlSession[]>([]);
  useEffect(() => {
    if (id !== 'sessions') return;
    let alive = true;
    void auth.listSessions().then((s) => alive && setSessions(s));
    return () => {
      alive = false;
    };
  }, [id, auth]);
  if (!row) return null;
  const done = <JurnlButton trigger={`security-${id}-done`} onClick={closeOverlay}>{C.common.done}</JurnlButton>;
  if (id === 'biometric') {
    const unavailable = device.biometric === 'UNAVAILABLE';
    return (
      <JurnlDrawer
        size="long"
        testId="security-biometric"
        title={row.title}
        lead={S.biometric.lead}
        onClose={closeOverlay}
        footer={
          <JurnlButton
            trigger="security-biometric-save"
            disabled={unavailable}
            onClick={() => {
              setDevice({ biometric: bio ? 'ENABLED' : 'DECLINED', biometricMethod: method });
              closeOverlay();
              showToast({ tone: 'success', title: S.biometric.savedTitle, testId: 'toast-biometric-saved' });
            }}
          >
            {S.biometric.save}
          </JurnlButton>
        }
      >
        {unavailable ?
          <JurnlErrorPanel testId="security-biometric-unavailable" title={S.biometric.unavailable} />
        : <div className="jrn-list">
            <JurnlRow icon="fingerprint" title={S.biometric.toggle} end={<JurnlToggle checked={bio} onChange={setBio} label={S.biometric.toggle} trigger="security-biometric-toggle" />} />
            <JurnlChoice selected={method === 'FACE_ID'} onSelect={() => setMethod('FACE_ID')} trigger="security-biometric-face">
              <span>{S.biometric.faceId}</span>
            </JurnlChoice>
            <JurnlChoice selected={method === 'TOUCH_ID'} onSelect={() => setMethod('TOUCH_ID')} trigger="security-biometric-touch">
              <span>{S.biometric.touchId}</span>
            </JurnlChoice>
          </div>
        }
      </JurnlDrawer>
    );
  }
  if (id === 'device') {
    const trusted = device.deviceTrust === 'TRUSTED';
    return (
      <JurnlDrawer size="long" testId="security-device" title={row.title} lead={S.device.lead} onClose={closeOverlay} footer={done}>
        <JurnlRow
          icon="device"
          title={S.device.thisDevice}
          sub={trusted ? S.device.trusted : S.device.notTrusted}
          end={
            <button
              type="button"
              className="jrn-badge"
              data-jrn-trigger="security-device-toggle"
              onClick={() => {
                setDevice({ deviceTrust: trusted ? 'NOT_NOW' : 'TRUSTED' });
                if (trusted) showToast({ tone: 'success', title: S.device.removedTitle, body: S.device.removedBody, testId: 'toast-device-removed' });
              }}
            >
              {trusted ? S.device.remove : S.device.trust}
            </button>
          }
        />
      </JurnlDrawer>
    );
  }
  if (id === 'connected') {
    return (
      <JurnlDrawer size="long" testId="security-connected" title={row.title} lead={S.connected.lead} onClose={closeOverlay} footer={done}>
        <div className="jrn-list">
          {C.privacy.connected.items.map((it) => (
            <JurnlRow key={it.id} icon={it.id === 'bank' ? 'database' : it.id === 'cards' ? 'document' : 'link'} title={it.title} end={<span className="jrn-badge jrn-badge--muted">{it.sub}</span>} />
          ))}
        </div>
      </JurnlDrawer>
    );
  }
  if (id === 'data') {
    return (
      <JurnlDrawer size="long" testId="security-data" title={row.title} lead={S.data.lead} onClose={closeOverlay} footer={done}>
        <div className="jrn-list">
          {S.data.items.map((t) => (
            <div key={t} className="jrn-checkline" data-done="true">
              <JurnlTile icon="check" tone="sage" size={14} />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <p className="jrn-eyebrow">{S.data.note}</p>
      </JurnlDrawer>
    );
  }
  if (id === 'sessions') {
    return (
      <JurnlDrawer size="long" testId="security-sessions" title={row.title} lead={S.sessions.lead} onClose={closeOverlay} footer={done}>
        <div className="jrn-list">
          {(sessions.length ? sessions : [{ id: 'this-device', label: S.sessions.thisDevice, detail: '', current: true }]).map((s) => (
            <JurnlRow
              key={s.id}
              icon={s.current ? 'device' : 'laptop'}
              title={s.label}
              sub={s.detail || undefined}
              end={
                s.current ?
                  <span className="jrn-badge">{S.sessions.current}</span>
                : <button type="button" className="jrn-badge jrn-badge--muted" data-jrn-trigger={`security-session-revoke-${s.id}`} onClick={() => openOverlay('revoke-session')}>
                    {S.sessions.revoke}
                  </button>
              }
            />
          ))}
        </div>
      </JurnlDrawer>
    );
  }
  return null;
}

function RevokeSessionModal() {
  const { auth, closeOverlay } = useJurnl();
  const [state, setState] = useState<'confirm' | 'loading' | 'revoked'>('confirm');
  const netToast = useNetworkToast();
  const S = C.security.sessions;
  if (state === 'revoked') {
    return (
      <JurnlModal testId="revoke-session" icon="check" tone="emerald" title={S.revokedTitle} body={S.revokedBody} onCancel={closeOverlay} cancelLabel={C.common.done}>
        <span data-claim="C11" hidden />
      </JurnlModal>
    );
  }
  return (
    <JurnlModal
      testId="revoke-session"
      icon="alert"
      tone="wine"
      title={S.revokeTitle}
      body={S.revokeBody}
      onCancel={closeOverlay}
      confirm={{
        label: S.revokeCta,
        variant: 'destructive',
        loading: state === 'loading',
        trigger: 'revoke-session-confirm',
        onClick: async () => {
          setState('loading');
          const res = await auth.revokeSession('preview-laptop');
          if (!res.ok) {
            setState('confirm');
            return netToast(res.code);
          }
          setState('revoked');
        },
      }}
    />
  );
}

/* ───────────── F01.13 ENTRY COMPLETE ───────────── */
export function EntryCompleteScreen() {
  const { session, device, go } = useJurnl();
  const checks = [
    { id: 'account', label: C.complete.checklist.account, done: !!session.account },
    { id: 'email', label: C.complete.checklist.email, done: !!session.account?.emailVerified },
    { id: 'security', label: C.complete.checklist.security, done: device.biometric !== 'UNDECIDED' && device.deviceTrust !== 'UNDECIDED' },
  ];
  return (
    <JurnlScreen screenId="F01.13" scene="complete">
      <div className="jrn-col__head jrn-hero-copy" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.complete.headline} lg />
        <i className="jrn-rule" aria-hidden />
        <JurnlLines lines={C.complete.sub} />
        <ul className="jrn-checklist" data-runtime-bounds="checklist">
          {checks.map((c) => (
            <li key={c.id} className="jrn-checkline" data-done={c.done ? 'true' : 'false'} data-jrn-trigger={`complete-check-${c.id}`}>
              <JurnlTile icon="check" tone={c.done ? 'sage' : undefined} size={15} />
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton trigger="complete-continue" onClick={() => go('F02')}>
          {C.complete.cta}
        </JurnlButton>
      </div>
    </JurnlScreen>
  );
}

/* ───────────── F01 → F02 FAMILY BOUNDARY ───────────── */
export function FamilyBoundaryScreen() {
  const { go } = useJurnl();
  return (
    <JurnlScreen screenId="F02.BOUNDARY" scene="boundary" family>
      <div className="jrn-col__head jrn-hero-copy--wide" data-runtime-bounds="copy">
        <JurnlLogo />
        <JurnlHeadline lines={C.boundary.headline} />
        <i className="jrn-rule" aria-hidden />
        <p className="jrn-body">{C.boundary.body}</p>
      </div>
      <div className="jrn-cta" data-runtime-bounds="cta">
        <JurnlButton variant="secondary" trigger="boundary-back" onClick={() => go('F01.13')}>
          {C.boundary.back}
        </JurnlButton>
      </div>
    </JurnlScreen>
  );
}
