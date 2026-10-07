/** GS.SETTINGS — canonical account / preferences surface (W1.1). */

import { useMemo, useState } from 'react';
import { consentGranted } from '../../data/foundation/consent';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { getRepository } from '../../data/repository/deviceRepository';
import { syncDeviceAiToRepository } from '../../data/repository/consentSync';
import { useSetup, patchSetup } from '../../data/f02/setupDraft';
import { CURRENCIES, setCurrency, useCurrency } from '../../data/home/money';
import { F03_DAY_PLATE } from '../../data/f03/plates';
import { JurnlProductNav } from '../components/ProductNav';
import { FramePanel, JurnlFamilyFrame, useFrameBack } from '../components/FamilyFrame';
import { JurnlButton, JurnlDrawer, JurnlIconButton, JurnlInput, JurnlPanel, JurnlToggle } from '../components/primitives';
import { useJurnl } from '../state/store';

/** Settings chrome: back walks continuation screens before leaving for Today. */
function SettingsChrome({ onBack }: { onBack: () => void }) {
  const frame = useFrameBack();
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <JurnlIconButton icon="back" label={frame.screenIndex > 0 ? `BACK TO SCREEN ${frame.screenIndex}` : 'BACK TO TODAY'} trigger="settings-back" onClick={() => (frame.back() ? undefined : onBack())} />
      <span className="jrn-home__mark">JURNL</span>
      <span className="jrn-home__mark" aria-hidden />
    </div>
  );
}

export function AccountSettingsScreen() {
  const { go, session, device, setDevice, signOut, showToast } = useJurnl();
  const draft = useSetup();
  const currency = useCurrency();
  const settings = useMemo(() => getRepository().getSettings(), []);
  const consent = useMemo(() => getRepository().getConsent(), []);
  const [buffer, setBuffer] = useState(settings.safeToSpendBuffer);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  return (
    <JurnlFamilyFrame
      screenId="GS.SETTINGS"
      familyId="GS"
      familyPlate={F03_DAY_PLATE}
      label="ACCOUNT"
      archetype="DETAIL"
      chrome={<SettingsChrome onBack={() => go('F03')} />}
      nav={<JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => go('F03')} />}
      overlays={currencyOpen ? <CurrencySheet onClose={() => setCurrencyOpen(false)} /> : null}
    >
      <FramePanel id="intro">
        <div className="jrn-home__intro" data-jrn-zone="intro" data-jrn-state="connected">
          <h1 className="jrn-home__h">ACCOUNT</h1>
          <p className="jrn-home__sub">ONE SETTINGS OWNER.</p>
        </div>
      </FramePanel>
      <FramePanel id="profile">
        <JurnlPanel role="editorial" className="jrn-home__panel" data-jrn-zone="content-rail">
          <b>PROFILE</b>
          <p>{session.account ? `${session.account.firstName} ${session.account.lastName}` : 'PREVIEW GUEST'}</p>
          <p>{session.account?.email ?? 'NO EMAIL ON DEVICE'}</p>
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="currency">
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>DISPLAY CURRENCY</b>
          <p>{currency.code} · {currency.name}</p>
          <JurnlButton variant="secondary" trigger="settings-currency" onClick={() => setCurrencyOpen(true)}>
            CHANGE
          </JurnlButton>
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="connection">
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>CONNECTION</b>
          <p>{honestAccountsConnectionLabel(draft.accounts)}</p>
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="ask-context">
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>ASK JURNL CONTEXT</b>
          <JurnlToggle
            checked={consentGranted(consent, 'ASK_JURNL_CONTEXT')}
            label="ALLOW STRUCTURED CONTEXT"
            trigger="settings-ask-context"
            onChange={(granted) => {
              getRepository().patchConsent('ASK_JURNL_CONTEXT', granted, 'GS.SETTINGS');
              const ai = { ...device.ai, naturalLanguage: granted || device.ai.naturalLanguage };
              setDevice({ ai });
              syncDeviceAiToRepository({ ...device, ai });
            }}
          />
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="buffer">
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>SAFE TO SPEND BUFFER</b>
          <JurnlInput label="BUFFER" value={buffer} onValue={setBuffer} trigger="settings-buffer" />
          <JurnlButton
            variant="secondary"
            trigger="settings-buffer-save"
            onClick={() => {
              getRepository().patchSettings({ safeToSpendBuffer: buffer });
              showToast({ tone: 'success', title: 'BUFFER SAVED', body: 'F09 READS THIS WHEN EXPANDED.', testId: 'toast-buffer' });
            }}
          >
            SAVE BUFFER
          </JurnlButton>
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="consents">
        <JurnlPanel role="editorial" className="jrn-home__panel">
          <b>SETUP CONSENTS</b>
          <JurnlToggle checked={draft.consentRemember} label="REMEMBER SETUP" trigger="settings-consent-remember" onChange={(v) => patchSetup({ consentRemember: v })} />
          <JurnlToggle checked={draft.consentLinks} label="LINKED ACCOUNTS OPTIONAL" trigger="settings-consent-links" onChange={(v) => patchSetup({ consentLinks: v })} />
          <JurnlToggle checked={draft.consentSale} label="NOTHING SOLD" trigger="settings-consent-sale" onChange={(v) => patchSetup({ consentSale: v })} />
        </JurnlPanel>
      </FramePanel>
      <FramePanel id="sign-out">
        <JurnlButton variant="secondary" trigger="settings-sign-out" onClick={() => signOut()}>
          SIGN OUT
        </JurnlButton>
      </FramePanel>
    </JurnlFamilyFrame>
  );
}

function CurrencySheet({ onClose }: { onClose: () => void }) {
  const currency = useCurrency();
  return (
    <JurnlDrawer expression="filter" size="long" testId="settings-currency-sheet" title="DISPLAY CURRENCY" lead="CANONICAL OWNER IS ACCOUNT SETTINGS." onClose={onClose}>
      <div className="jrn-currency__list" role="group" aria-label="CURRENCY">
        {CURRENCIES.map((item) => (
          <button
            key={item.code}
            type="button"
            className="jrn-btn jrn-btn--secondary jrn-currency__row"
            aria-pressed={currency.code === item.code}
            data-jrn-trigger={`settings-currency-${item.code.toLowerCase()}`}
            onClick={() => {
              void setCurrency(item.code).then((ok) => {
                if (ok) getRepository().patchSettings({ displayCurrency: item.code });
                onClose();
              });
            }}
          >
            <span className="jrn-currency__code">{item.code}</span>
            <span className="jrn-currency__name">{item.name}</span>
          </button>
        ))}
      </div>
    </JurnlDrawer>
  );
}
