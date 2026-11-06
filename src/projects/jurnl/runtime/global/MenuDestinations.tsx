/**
 * The global menu's destinations that had no surface of their own (P0.JURNL.GLOBAL-EIGHT-OVERLAYS.MENU-FUNCTIONAL-
 * RECOVERY-AND-SECTIONED-NAVIGATION-CONVERGENCE). Each one is honest about what exists:
 *
 *   CONNECTED ACCOUNTS & SYNC   the provider is PROVIDER_UNAVAILABLE: no bank link, no sync, no CONNECTED badge; the
 *                               manual path (your pockets) is the working alternative
 *   SAFE TO SPEND BUFFER        the shared buffer field (typed in the display currency, kept in USD)
 *   CLASSIFICATION & RULES      nothing is learned or applied yet: no rules are shown, none are invented
 *   PREFERENCES                 general preferences only, plus the sign-in security tools (F01.12, after onboarding)
 *   PRIVACY & CONSENTS          the consents, ASK JURNL CONTEXT (its own switch) and the F01.11 tools after onboarding
 *   HELP & SUPPORT · LEGAL · PROFILE   what is and is not available, said on a surface (not a toast)
 *   SIGN OUT                    the F01.04 confirmation, then a real sign-out and the welcome screen
 *
 * Copy is uppercase; the one cursive line per folio is lowercase.
 */
import { useId, useState } from 'react';
import { consentGranted } from '../../data/foundation/consent';
import { JURNL_BANK_CONNECTION_PROVIDER, honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { listActiveAccounts } from '../../data/foundation/accounts';
import { getRepository } from '../../data/repository/deviceRepository';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { BUFFER_COPY, useSafetyBuffer } from '../../data/f09/safetyBuffer';
import { formatAmountInput, formatMoney } from '../../data/home/money';
import { F01_COPY as C } from '../../data/f01/copy';
import { JurnlModal, JurnlToggle } from '../components/primitives';
import { useJurnl } from '../state/store';
import { V3Field, V3Folio, V3Notice, V3Pill, V3Row, V3RuleLabel, V3Status } from '../surfaces/v3/V3Surfaces';
import type { MenuDestination, MenuPanel, SettingsToolId } from './menuPanels';
import { BufferEnvironment, PrivacyEnvironment } from './ChildEnvironments';

type Nav = { onBack: () => void; onOpen: (p: MenuDestination | MenuPanel) => void };
const tool = (id: SettingsToolId): MenuPanel => ({ tool: id });
const back = (onBack: () => void, trigger: string, label = 'BACK') => (
  <V3Pill tone="cream" trigger={trigger} onClick={onBack}>
    {label}
  </V3Pill>
);

/** ASK JURNL CONTEXT: its own consent, read from and written to the repository only (never derived from AI choices). */
export function useAskContextConsent(): [boolean, (granted: boolean) => void] {
  const [on, setOn] = useState(() => consentGranted(getRepository().getConsent(), 'ASK_JURNL_CONTEXT'));
  return [
    on,
    (granted: boolean) => {
      getRepository().patchConsent('ASK_JURNL_CONTEXT', granted, 'GS.SETTINGS');
      setOn(consentGranted(getRepository().getConsent(), 'ASK_JURNL_CONTEXT'));
    },
  ];
}

/* ── YOUR FINANCES · CONNECTED ACCOUNTS & SYNC ── */
export function ConnectionsFolio({ onBack, onManual }: { onBack: () => void; onManual: () => void }) {
  const draft = useSetup();
  const pockets = listActiveAccounts();
  const unavailable = JURNL_BANK_CONNECTION_PROVIDER.availability === 'PROVIDER_UNAVAILABLE';
  return (
    <V3Folio
      label="CONNECTED ACCOUNTS & SYNC"
      testId="global-connections"
      title="CONNECTED ACCOUNTS & SYNC"
      script="how your money gets into jurnl"
      onClose={onBack}
      footer={
        <>
          {back(onBack, 'connections-back')}
          <V3Pill tone="olive" trigger="connections-manual" onClick={onManual}>
            YOUR POCKETS
          </V3Pill>
        </>
      }
    >
      {unavailable ? (
        <V3Notice tone="attention" icon="warn" testId="connections-provider">
          NO BANK CONNECTION IS AVAILABLE IN THIS BUILD. JURNL DOES NOT CONNECT TO, READ FROM OR SYNC WITH ANY BANK.
        </V3Notice>
      ) : null}
      <V3RuleLabel>HOW YOUR NUMBERS GET HERE</V3RuleLabel>
      <V3Row icon="bank" label="BANK CONNECTION" sub={unavailable ? 'NOT AVAILABLE YET' : 'SEE YOUR PROVIDER'} aside={<V3Status state="UNAVAILABLE" />} testId="connections-bank" />
      <V3Row icon="arrows" label="AUTOMATIC SYNC" sub="OFF · NOTHING IS IMPORTED" testId="connections-sync" />
      <V3Row icon="wallet" label="YOUR POCKETS" sub={`${pockets.length} ${pockets.length === 1 ? 'POCKET' : 'POCKETS'} · BALANCES YOU RECORD`} onClick={onManual} trigger="connections-pockets" testId="connections-pockets" />
      {draft.accounts === 'CONNECTED' ? (
        <V3Notice icon="info" testId="connections-preview">
          {`YOUR SETUP SAYS ${honestAccountsConnectionLabel('CONNECTED')}. NO BANK WAS EVER LINKED.`}
        </V3Notice>
      ) : null}
    </V3Folio>
  );
}

/* ── YOUR FINANCES · SAFE TO SPEND BUFFER ── */
/**
 * The child environments (OPUS3): SAFE TO SPEND BUFFER and PRIVACY & CONSENTS are drawn on the shared OV08 menu environment
 * (the founder authorities; ChildEnvironments.tsx). The previous V3 folio stays reachable for side-by-side founder
 * comparison in design preview only (`?childenv=folio`); production never honours the switch.
 */
function useChildEnv(): 'environment' | 'folio' {
  const { mode } = useJurnl();
  if (mode !== 'design-preview' || typeof window === 'undefined') return 'environment';
  return new URLSearchParams(window.location.search).get('childenv') === 'folio' ? 'folio' : 'environment';
}

/** `onCurrency` opens the DISPLAY CURRENCY destination from the amount paper's currency selector. */
export function BufferFolio({ onBack, onCurrency }: { onBack: () => void; onCurrency?: () => void }) {
  return useChildEnv() === 'folio' ? <BufferFolioV3 onBack={onBack} /> : <BufferEnvironment onBack={onBack} onCurrency={onCurrency} />;
}

/** The V3 parchment folio (before OPUS3), kept for comparison. */
export function BufferFolioV3({ onBack }: { onBack: () => void }) {
  const b = useSafetyBuffer();
  const id = useId();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const code = b.currency.code;
  const blocked = b.rateState === 'UNAVAILABLE';
  const save = () => {
    const r = b.save();
    if (r.ok) {
      setError(null);
      setStatus(r.canonicalUsd > 0 ? `SAVED. ${BUFFER_COPY.saved}` : BUFFER_COPY.cleared);
    } else {
      setStatus(null);
      setError(r.reason === 'RATE_UNAVAILABLE' ? BUFFER_COPY.rateUnavailable : BUFFER_COPY.invalid);
    }
  };
  return (
    <V3Folio
      label="SAFE TO SPEND BUFFER"
      testId="global-buffer"
      title="SAFE TO SPEND BUFFER"
      script="a cushion you keep aside"
      onClose={onBack}
      footer={
        <>
          {back(onBack, 'buffer-back')}
          <V3Pill tone="olive" trigger="buffer-save" onClick={save} disabled={blocked}>
            SAVE BUFFER
          </V3Pill>
        </>
      }
    >
      <p className="jv3-t-meta">{`SAFE TO SPEND ALWAYS KEEPS THIS AMOUNT ASIDE. TYPE IT IN ${code}.${code === 'USD' ? '' : ' JURNL KEEPS IT IN USD.'}`}</p>
      <V3Field label={`BUFFER · ${code}`} htmlFor={id} error={error}>
        <span className="jv3-well">
          {b.currency.symbolPosition === 'prefix' ? <span aria-hidden>{b.currency.symbol}</span> : null}
          <input id={id} inputMode="decimal" autoComplete="off" placeholder="0" value={formatAmountInput(b.value)} data-jrn-trigger="buffer-input" disabled={blocked} onChange={(e) => b.setValue(e.target.value)} />
          {b.currency.symbolPosition === 'suffix' ? <span aria-hidden>{b.currency.symbol}</span> : null}
        </span>
      </V3Field>
      {blocked ? (
        <V3Notice tone="attention" icon="warn" testId="buffer-rate-unavailable">
          {BUFFER_COPY.rateUnavailable}
        </V3Notice>
      ) : null}
      {b.rateState === 'STALE' && b.exchange.disclosure ? (
        <V3Notice icon="clock" testId="buffer-rate-stale">
          {`${b.exchange.disclosure}. A CACHED RATE IS USED FOR THE CONVERSION.`}
        </V3Notice>
      ) : null}
      <p className="jv3-t-meta" data-testid="buffer-usd" data-usd={String(b.storedUsd)}>
        {b.storedUsd > 0 ? `KEPT ASIDE NOW: USD ${b.storedUsd.toFixed(2)}${code === 'USD' ? '' : ` · SHOWN AS ${formatMoney(b.storedUsd)}`}` : 'NO BUFFER IS KEPT ASIDE NOW.'}
      </p>
      {status ? (
        <p className="jv3-t-meta" role="status" data-testid="buffer-status">
          {status}
        </p>
      ) : null}
    </V3Folio>
  );
}

/* ── YOUR INTELLIGENCE · CLASSIFICATION & LEARNING RULES ── */
export function RulesFolio({ onBack, onOpen }: Nav) {
  return (
    <V3Folio label="CLASSIFICATION & LEARNING RULES" testId="global-rules" title="CLASSIFICATION & RULES" script="how jurnl sorts what you record" onClose={onBack} footer={back(onBack, 'rules-back')}>
      <V3Notice tone="attention" icon="info" testId="rules-unavailable">
        JURNL DOES NOT LEARN OR APPLY CATEGORY RULES YET. THERE ARE NO RULES TO SHOW, CHANGE OR TURN OFF.
      </V3Notice>
      <V3RuleLabel>WHAT HAPPENS TODAY</V3RuleLabel>
      <V3Row icon="tag" label="CATEGORIES" sub="THE ONE YOU CHOOSE WHEN YOU RECORD AN ENTRY" testId="rules-categories" />
      <V3Row icon="chart" label="LEARNING" sub="OFF · NOTHING IS LEARNED FROM YOUR ENTRIES" testId="rules-learning" />
      <V3Row icon="lock" label="AI ACCESS CHOICES" sub="RECORDED IN PRIVACY & CONSENTS · NOTHING USES THEM YET" onClick={() => onOpen(tool('privacy-ai-access'))} trigger="rules-ai-access" />
    </V3Folio>
  );
}

/* ── YOUR ACCOUNT · PREFERENCES (general only; financial items have their own rows) ── */
const BIO: Record<string, string> = { ENABLED: 'ON', DECLINED: 'OFF', UNAVAILABLE: 'NOT AVAILABLE ON THIS DEVICE', UNDECIDED: 'NOT SET' };
export function PreferencesFolio({ onBack, onOpen }: Nav) {
  const { device } = useJurnl();
  const settings = getRepository().getSettings();
  return (
    <V3Folio label="PREFERENCES" testId="global-preferences" title="PREFERENCES" script="how jurnl behaves for you" onClose={onBack} footer={back(onBack, 'preferences-back')}>
      <V3RuleLabel>GENERAL</V3RuleLabel>
      <V3Row icon="info" label="NOTIFICATIONS" sub="JURNL DOES NOT SEND NOTIFICATIONS YET" testId="pref-notifications" />
      <V3Row icon="calendar" label="WEEK START & DATE FORMAT" sub="NOT ADJUSTABLE YET" testId="pref-calendar" />
      <V3Row icon="clock" label="TIME ZONE" sub={settings.timezone.toUpperCase()} testId="pref-timezone" />
      <V3RuleLabel>SIGN-IN & SECURITY</V3RuleLabel>
      <V3Row icon="lock" label={device.biometricMethod === 'TOUCH_ID' ? 'TOUCH ID' : 'FACE ID'} sub={BIO[device.biometric] ?? 'NOT SET'} onClick={() => onOpen(tool('security-biometric'))} trigger="pref-security-biometric" />
      <V3Row icon="shield" label="TRUSTED DEVICE" sub={device.deviceTrust === 'TRUSTED' ? 'THIS DEVICE IS TRUSTED' : 'THIS DEVICE IS NOT TRUSTED'} onClick={() => onOpen(tool('security-device'))} trigger="pref-security-device" />
      <V3Row icon="person" label="SIGNED-IN SESSIONS" sub="SEE AND SIGN OUT OTHER SESSIONS" onClick={() => onOpen(tool('security-sessions'))} trigger="pref-security-sessions" />
    </V3Folio>
  );
}

/* ── YOUR ACCOUNT · PRIVACY & CONSENTS (one owner: the menu, the ACCOUNT page and the drawer all open this) ── */
export function PrivacyConsentsFolio({ onBack, onOpen }: Nav) {
  const env = useChildEnv();
  const [ask, setAsk] = useAskContextConsent();
  return env === 'folio' ? <PrivacyConsentsFolioV3 onBack={onBack} onOpen={onOpen} ask={ask} setAsk={setAsk} /> : <PrivacyEnvironment onBack={onBack} onOpen={onOpen} askOn={ask} setAsk={setAsk} />;
}

/** The V3 parchment folio (before OPUS3), kept for comparison. */
export function PrivacyConsentsFolioV3({ onBack, onOpen, ask, setAsk }: Nav & { ask: boolean; setAsk: (v: boolean) => void }) {
  const draft = useSetup();
  const rows: { on: boolean; label: string; note: string; trigger: string; set: (v: boolean) => void }[] = [
    { on: draft.consentRemember, label: 'REMEMBER SETUP', note: 'KEEP YOUR SETUP ANSWERS ON THIS DEVICE.', trigger: 'settings-consent-remember', set: (v) => patchSetup({ consentRemember: v }) },
    { on: draft.consentLinks, label: 'LINKED ACCOUNTS OPTIONAL', note: 'JURNL WORKS WITHOUT CONNECTING A BANK.', trigger: 'settings-consent-links', set: (v) => patchSetup({ consentLinks: v }) },
    { on: draft.consentSale, label: 'NOTHING SOLD', note: 'YOUR DATA IS NEVER SOLD.', trigger: 'settings-consent-sale', set: (v) => patchSetup({ consentSale: v }) },
    { on: ask, label: 'ASK JURNL CONTEXT', note: 'LET ASK JURNL READ THE SCREEN YOU ARE ON TO EXPLAIN IT. OFF STAYS OFF.', trigger: 'privacy-ask-context', set: setAsk },
  ];
  return (
    <V3Folio label="PRIVACY & CONSENTS" testId="settings-consents-sheet" title="PRIVACY & CONSENTS" script="what jurnl may keep and use" onClose={onBack} footer={back(onBack, 'privacy-back')}>
      <V3RuleLabel>YOUR CONSENTS</V3RuleLabel>
      {rows.map((r) => (
        <div key={r.trigger} className="jv3-toggle-row">
          <span className="jv3-row__text">
            <span>{r.label}</span>
            <small>{r.note}</small>
          </span>
          <JurnlToggle checked={r.on} label={r.label} trigger={r.trigger} onChange={r.set} />
        </div>
      ))}
      <V3RuleLabel>YOUR DATA</V3RuleLabel>
      <V3Row icon="lock" label={C.privacy.rows['ai-access']} sub="CHOOSE WHAT AI FEATURES MAY USE" onClick={() => onOpen(tool('privacy-ai-access'))} trigger="privacy-tool-ai-access" />
      <V3Row icon="book" label={C.privacy.rows['your-data']} sub="WHAT JURNL KEEPS ON THIS DEVICE" onClick={() => onOpen(tool('privacy-your-data'))} trigger="privacy-tool-your-data" />
      <V3Row icon="upload" label={C.privacy.rows['data-export']} sub="NOT AVAILABLE YET" onClick={() => onOpen(tool('privacy-data-export'))} trigger="privacy-tool-data-export" />
      <V3Row icon="trash" label={C.privacy.rows['remove-access']} sub="DELETE ACCOUNT · REVOKE ACCESS · TURN AI OFF" onClick={() => onOpen(tool('privacy-remove-access'))} trigger="privacy-tool-remove-access" tone="terracotta" />
    </V3Folio>
  );
}

/* ── YOUR ACCOUNT · HELP & SUPPORT ── */
export function HelpFolio({ onBack, onOpen }: Nav) {
  return (
    <V3Folio label="HELP & SUPPORT" testId="global-help" title="HELP & SUPPORT" script="answers inside jurnl" onClose={onBack} footer={back(onBack, 'help-back')}>
      <V3Notice tone="attention" icon="info" testId="help-unavailable">
        SUPPORT IS NOT AVAILABLE IN THIS PREVIEW YET. THERE IS NO SUPPORT CHANNEL, SO NO MESSAGE CAN REACH A PERSON FROM HERE.
      </V3Notice>
      <V3RuleLabel>ANSWERS IN JURNL</V3RuleLabel>
      <V3Row icon="bank" label="CONNECTING A BANK" sub="WHY THERE IS NO BANK LINK YET" onClick={() => onOpen('connections')} trigger="help-connections" />
      <V3Row icon="coins" label="SAFE TO SPEND BUFFER" sub="WHAT IT KEEPS ASIDE" onClick={() => onOpen('buffer')} trigger="help-buffer" />
      <V3Row icon="lock" label="PRIVACY & YOUR DATA" sub="CONSENTS, AI ACCESS, DELETING YOUR ACCOUNT" onClick={() => onOpen('privacy')} trigger="help-privacy" />
      <V3Row icon="book" label="TERMS & POLICIES" sub="NOT PUBLISHED YET" onClick={() => onOpen('legal')} trigger="help-legal" />
    </V3Folio>
  );
}

export function LegalFolio({ onBack, onOpen }: Nav) {
  return (
    <V3Folio label="TERMS & POLICIES" testId="global-legal" title="TERMS & POLICIES" script="the fine print" onClose={onBack} footer={back(onBack, 'legal-back')}>
      <V3Notice tone="attention" icon="info" testId="legal-unavailable">
        TERMS OF SERVICE AND A PRIVACY POLICY ARE NOT PUBLISHED IN THIS PREVIEW YET.
      </V3Notice>
      <V3Row icon="lock" label="YOUR CONSENTS" sub="WHAT YOU HAVE ALLOWED, AND CHANGE IT" onClick={() => onOpen('privacy')} trigger="legal-privacy" />
    </V3Folio>
  );
}

export function ProfileFolio({ onBack }: { onBack: () => void }) {
  const { session } = useJurnl();
  const a = session.account;
  return (
    <V3Folio label="PROFILE" testId="global-profile" title="PROFILE" script="who is signed in" onClose={onBack} footer={back(onBack, 'profile-back')}>
      <V3Row icon="person" label={a ? `${a.firstName} ${a.lastName}`.toUpperCase() : 'PREVIEW GUEST'} sub={a?.email?.toUpperCase() ?? 'NO EMAIL ON THIS DEVICE'} testId="profile-identity" />
      <V3Notice icon="info" testId="profile-edit-unavailable">
        CHANGING YOUR NAME OR EMAIL IS NOT AVAILABLE YET.
      </V3Notice>
    </V3Folio>
  );
}

/* ── SIGN OUT: one flow for the menu, the ACCOUNT page and the drawer (the F01.04 confirmation) ── */
export function SignOutConfirm({ onCancel, onSignedOut }: { onCancel: () => void; onSignedOut: () => void }) {
  const { signOut, go } = useJurnl();
  return (
    <JurnlModal
      testId="global-sign-out"
      title={C.unlock.signOutTitle}
      body={C.unlock.signOutBody}
      onCancel={onCancel}
      confirm={{
        label: C.unlock.signOut,
        trigger: 'sign-out-confirm',
        onClick: () => {
          signOut();
          onSignedOut();
          go('F01.00');
        },
      }}
    />
  );
}
