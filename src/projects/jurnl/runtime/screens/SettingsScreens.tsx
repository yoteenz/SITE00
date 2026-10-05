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
import { JurnlButton, JurnlDrawer, JurnlIconButton, JurnlInput, JurnlPanel, JurnlToggle } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

export function AccountSettingsScreen() {
  const { go, session, device, setDevice, signOut, showToast } = useJurnl();
  const draft = useSetup();
  const currency = useCurrency();
  const settings = useMemo(() => getRepository().getSettings(), []);
  const consent = useMemo(() => getRepository().getConsent(), []);
  const [buffer, setBuffer] = useState(settings.safeToSpendBuffer);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  return (
    <JurnlScreen screenId="GS.SETTINGS" familyPlate={F03_DAY_PLATE} family>
      <div className="jrn-home" data-jrn-state="connected">
        <div className="jrn-home__top" data-jrn-zone="chrome">
          <JurnlIconButton icon="back" label="BACK TO TODAY" trigger="settings-back" onClick={() => go('F03')} />
          <span className="jrn-home__mark">JURNL</span>
          <span className="jrn-home__mark" aria-hidden />
        </div>
        <div className="jrn-home__intro" data-jrn-zone="intro">
          <h1 className="jrn-home__h">ACCOUNT</h1>
          <p className="jrn-home__sub">ONE SETTINGS OWNER.</p>
        </div>
        <div className="jrn-home__rail" data-jrn-zone="content-rail">
          <JurnlPanel role="editorial" className="jrn-home__panel">
            <b>PROFILE</b>
            <p>{session.account ? `${session.account.firstName} ${session.account.lastName}` : 'PREVIEW GUEST'}</p>
            <p>{session.account?.email ?? 'NO EMAIL ON DEVICE'}</p>
          </JurnlPanel>
          <JurnlPanel role="editorial" className="jrn-home__panel">
            <b>DISPLAY CURRENCY</b>
            <p>{currency.code} · {currency.name}</p>
            <JurnlButton variant="secondary" trigger="settings-currency" onClick={() => setCurrencyOpen(true)}>
              CHANGE
            </JurnlButton>
          </JurnlPanel>
          <JurnlPanel role="editorial" className="jrn-home__panel">
            <b>CONNECTION</b>
            <p>{honestAccountsConnectionLabel(draft.accounts)}</p>
          </JurnlPanel>
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
          <JurnlPanel role="editorial" className="jrn-home__panel">
            <b>SETUP CONSENTS</b>
            <JurnlToggle checked={draft.consentRemember} label="REMEMBER SETUP" trigger="settings-consent-remember" onChange={(v) => patchSetup({ consentRemember: v })} />
            <JurnlToggle checked={draft.consentLinks} label="LINKED ACCOUNTS OPTIONAL" trigger="settings-consent-links" onChange={(v) => patchSetup({ consentLinks: v })} />
            <JurnlToggle checked={draft.consentSale} label="NOTHING SOLD" trigger="settings-consent-sale" onChange={(v) => patchSetup({ consentSale: v })} />
          </JurnlPanel>
          <JurnlButton variant="secondary" trigger="settings-sign-out" onClick={() => signOut()}>
            SIGN OUT
          </JurnlButton>
        </div>
        <JurnlProductNav current="HOME" onGo={go} onAdd={() => go('F03')} />
      </div>
      {currencyOpen ?
        <JurnlDrawer expression="filter" size="long" testId="settings-currency-sheet" title="DISPLAY CURRENCY" lead="CANONICAL OWNER IS ACCOUNT SETTINGS." onClose={() => setCurrencyOpen(false)}>
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
                    setCurrencyOpen(false);
                  });
                }}
              >
                <span className="jrn-currency__code">{item.code}</span>
                <span className="jrn-currency__name">{item.name}</span>
              </button>
            ))}
          </div>
        </JurnlDrawer>
      : null}
    </JurnlScreen>
  );
}
