/**
 * OV06 ACCOUNT SETTINGS drawer (founder Option B): the curated inner shell (OV06-IS-ACCOUNT-SETTINGS-DRAWER) with live rows
 * on the parchment and sign-out on the shell's dark strip. Replaces the torn F09 collage replica while keeping the same
 * destinations, buffer field and consent behaviour as the prior AccountDrawer.
 */
import { useId, useState } from 'react';
import { formatAmountInput, useCurrency } from '../../../data/home/money';
import { useJurnl } from '../../state/store';
import { useMenuPanels, type MenuDestination, type MenuPanel } from '../../global/menuPanels';
import { PrivacyConsentsFolio, SignOutConfirm, useAskContextConsent } from '../../global/MenuDestinations';
import { honestAccountsConnectionLabel } from '../../../data/foundation/connectionProvider';
import { useSetup } from '../../../data/f02/setupDraft';
import { BUFFER_COPY, useSafetyBuffer } from '../../../data/f09/safetyBuffer';
import { CurrencySheet } from '../../screens/SettingsScreens';
import profileThumb from '../../global/overlays/F09_DRAWER_PROFILE_THUMB.jpg';
import privacyCard from '../../global/overlays/F09_DRAWER_PRIVACY_PHOTO.jpg';
import { JurnlArtToggle } from '../../components/JurnlMicroArt';
import { EdGlyph } from './Editorial';
import { ShellOverlay, ShellSlot, type ShellBox } from './Shell';
import './jurnl-account-ov06.css';

function useAccountDrawerState() {
  const { session, showToast } = useJurnl();
  const draft = useSetup();
  const currency = useCurrency();
  const [askOn, setAsk] = useAskContextConsent();
  const buffer = useSafetyBuffer();
  return {
    name: session.account ? `${session.account.firstName} ${session.account.lastName}`.toUpperCase() : 'PREVIEW GUEST',
    email: session.account?.email?.toUpperCase() ?? null,
    currency: `${currency.code} · ${currency.name}`.toUpperCase(),
    connection: honestAccountsConnectionLabel(draft.accounts),
    askOn,
    setAsk,
    buffer: buffer.value,
    bufferBlocked: buffer.rateState === 'UNAVAILABLE',
    setBuffer: buffer.setValue,
    saveBuffer: () => {
      const r = buffer.save();
      if (r.ok) showToast({ tone: 'success', title: r.canonicalUsd > 0 ? 'BUFFER SAVED' : 'BUFFER CLEARED', body: r.canonicalUsd > 0 ? BUFFER_COPY.saved : BUFFER_COPY.cleared, testId: 'toast-buffer' });
      else showToast({ tone: 'error', title: 'BUFFER NOT SAVED', body: r.reason === 'RATE_UNAVAILABLE' ? BUFFER_COPY.rateUnavailable : BUFFER_COPY.invalid, testId: 'toast-buffer-error' });
    },
  };
}

function useOpenDestination(fallback: (d: 'currency' | 'consents' | 'sign-out') => void) {
  const panels = useMenuPanels();
  return (d: MenuDestination | MenuPanel, local?: 'currency' | 'consents' | 'sign-out') => {
    if (panels) panels.open(d);
    else if (local) fallback(local);
  };
}

/**
 * Fractions of the OV06 shell (2016 × 3584): headline under the laurel medallion; the scroll column sits on the three
 * parchment bands; sign-out lives on the painted dark strip (not the close).
 */
export const OV06_ACCOUNT = {
  head: [0.22, 0.1, 0.88, 0.19] as ShellBox,
  scroll: [0.17, 0.19, 0.9, 0.54] as ShellBox,
  signOut: [0.17, 0.555, 0.9, 0.675] as ShellBox,
} as const;

function RowChevron() {
  return (
    <svg className="ja6-chev" viewBox="0 0 10 16" aria-hidden>
      <path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AccountDrawer({ onClose }: { onClose: () => void }) {
  const { go } = useJurnl();
  const s = useAccountDrawerState();
  const currency = useCurrency();
  const panels = useMenuPanels();
  const [sheet, setSheet] = useState<'currency' | 'consents' | 'sign-out' | null>(null);
  const openDest = useOpenDestination(setSheet);
  const bufferId = useId();
  const email = s.email ?? 'NO EMAIL ON DEVICE';
  const leaveTo = (route: string) => {
    if (panels) panels.closeAll();
    else onClose();
    go(route);
  };
  return (
    <>
      <ShellOverlay
        testId="account-drawer"
        composition="account"
        shell="OV06_ACCOUNT_SHELL"
        overlayAuthority="OV06-IS-ACCOUNT-SETTINGS-DRAWER"
        hostClassName="jsh-host--drawer-end"
        widthShare={0.62}
        blur
        title="ACCOUNT"
        head={OV06_ACCOUNT.head}
        headTone="ink"
        titleSize={8.4}
        onClose={onClose}
        closeLabel="CLOSE ACCOUNT"
        closeTrigger="account-drawer-close"
        dialogTestId="account-drawer-folio"
      >
        <ShellSlot box={[0.24, 0.085, 0.86, 0.11]} className="ja6-taglines" aria-hidden>
          <p>FINANCIAL LIFE.</p>
          <p>BEAUTIFULLY ORGANIZED.</p>
        </ShellSlot>
        <button type="button" className="ja6-sr" data-jrn-trigger="drawer-account" onClick={() => leaveTo('account')}>
          OPEN ACCOUNT PAGE
        </button>
        <ShellSlot box={OV06_ACCOUNT.scroll} className="ja6-scroll" scroll testId="account-drawer-rows" role="region" ariaLabel="ACCOUNT SETTINGS">
          <button type="button" className="ja6-row" data-jrn-trigger="drawer-profile" onClick={() => leaveTo('account')}>
            <img className="ja6-thumb" src={profileThumb} alt="" draggable={false} data-asset-id="F09_DRAWER_PROFILE_THUMB" />
            <span className="ja6-row__body">
              <span className="ja6-kicker">PROFILE</span>
              <span className="ja6-title">{s.name}</span>
              <span className="ja6-sub">{email}</span>
            </span>
            <RowChevron />
          </button>

          <button type="button" className="ja6-row" data-jrn-trigger="drawer-currency" aria-label={`DISPLAY CURRENCY ${s.currency}. CHANGE`} onClick={() => openDest('currency', 'currency')}>
            <span className="ja6-row__body">
              <span className="ja6-kicker">DISPLAY CURRENCY</span>
              <span className="ja6-title">{s.currency}</span>
            </span>
            <span className="ja6-row__action">
              <span className="ja6-kicker">CHANGE</span>
              <RowChevron />
            </span>
          </button>

          <button type="button" className="ja6-row" data-jrn-trigger="drawer-connection" aria-label={`CONNECTION ${s.connection}. SET UP`} onClick={() => openDest('connections')}>
            <span className="ja6-row__body">
              <span className="ja6-kicker">CONNECTION</span>
              <span className="ja6-title">{s.connection}</span>
            </span>
            <span className="ja6-row__action">
              <span className="ja6-kicker">SET UP</span>
              <RowChevron />
            </span>
          </button>

          <section className="ja6-row ja6-row--ask" aria-label="ASK JURNL CONTEXT">
            <span className="ja6-row__body">
              <span className="ja6-kicker">ASK JURNL CONTEXT</span>
              <span className="ja6-sub">HELP JURNL GIVE YOU PERSONALIZED INSIGHTS BASED ON YOUR SPENDING, PLANS AND GOALS.</span>
            </span>
            <JurnlArtToggle checked={s.askOn} label="ASK JURNL CONTEXT" trigger="drawer-ask-context" slot="drawer-ask-context-switch" onChange={s.setAsk} />
          </section>

          <section className="ja6-row ja6-row--buffer" aria-label="SAFE TO SPEND BUFFER">
            <span className="ja6-row__body">
              <span className="ja6-kicker">SAFE TO SPEND BUFFER</span>
              <span className="ja6-sub">AMOUNT TO KEEP AS A BUFFER IN YOUR SAFE TO SPEND CALCULATION.</span>
            </span>
            <div className="ja6-buffer">
              <label className="ja6-buffer__field" htmlFor={bufferId}>
                <span className="ja6-sr">BUFFER</span>
                <span className="ja6-money" aria-hidden={undefined}>
                  {currency.symbolPosition === 'prefix' ? <span aria-hidden>{currency.symbol}</span> : null}
                  <input
                    id={bufferId}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={formatAmountInput(s.buffer)}
                    data-jrn-trigger="drawer-buffer"
                    aria-label={`SAFE TO SPEND BUFFER (${currency.code})`}
                    disabled={s.bufferBlocked}
                    onChange={(e) => s.setBuffer(e.target.value)}
                  />
                  {currency.symbolPosition === 'suffix' ? <span aria-hidden>{currency.symbol}</span> : null}
                </span>
              </label>
              <button type="button" className="ja6-save" data-jrn-trigger="drawer-buffer-save" onClick={s.saveBuffer}>
                <span>SAVE BUFFER</span>
                <RowChevron />
              </button>
            </div>
          </section>

          <button type="button" className="ja6-row ja6-row--photo" data-jrn-trigger="drawer-privacy" onClick={() => openDest('privacy', 'consents')}>
            <img className="ja6-photo" src={privacyCard} alt="" draggable={false} data-asset-id="F09_DRAWER_PRIVACY_PHOTO" />
            <span className="ja6-row__body ja6-row__body--on-photo">
              <span className="ja6-kicker">PRIVACY & CONSENTS</span>
              <span className="ja6-sub">MANAGE YOUR PRIVACY SETTINGS AND DATA CONSENTS.</span>
            </span>
            <RowChevron />
          </button>
        </ShellSlot>

        <ShellSlot box={OV06_ACCOUNT.signOut} className="ja6-signout-slot">
          <button type="button" className="ja6-signout" data-jrn-trigger="drawer-sign-out" onClick={() => openDest('sign-out', 'sign-out')}>
            <span className="ja6-signout__icon" aria-hidden>
              <EdGlyph name="signout" />
            </span>
            <span>SIGN OUT</span>
            <RowChevron />
          </button>
        </ShellSlot>
      </ShellOverlay>
      {sheet === 'currency' ? <CurrencySheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'consents' ? <PrivacyConsentsFolio onBack={() => setSheet(null)} onOpen={(d) => panels?.open(d)} /> : null}
      {sheet === 'sign-out' ? <SignOutConfirm onCancel={() => setSheet(null)} onSignedOut={onClose} /> : null}
    </>
  );
}
