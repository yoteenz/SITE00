/**
 * ACCOUNT (GS.SETTINGS) in the SAFE TO SPEND family, built to the founder references (P0.JURNL.F09.REFERENCE-REPLICA1).
 *
 * Two sibling expressions (EXPRESSION_PAIR_RULE):
 *   · full page — three continuation screens joined by BACK / NEXT and page dots. Page 1's shell (photograph, lockup,
 *     menu, title, dock) stays fixed on all three (CONTINUATION_RULE); each page's cards follow its own reference.
 *   · drawer — the compact expression, opened from the menu: the account folio over the live screen (AccountDrawer).
 *
 * Rows whose feature does not exist yet say so instead of pretending.
 */

import { useState } from 'react';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { useSetup } from '../../data/f02/setupDraft';
import { BUFFER_COPY, useSafetyBuffer } from '../../data/f09/safetyBuffer';
import { formatAmountInput, useCurrency, type CurrencyPreference } from '../../data/home/money';
import { PrivacyConsentsFolio, SignOutConfirm, useAskContextConsent } from '../global/MenuDestinations';
import { useMenuPanels, type MenuDestination, type MenuPanel } from '../global/menuPanels';
import accountPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_ACCOUNT_PLATE.jpg';
import leafRight from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_RIGHT.png';
import leafLeft from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_LEFT.png';
import { REF_ACCT1, REF_ACCT2, REF_ACCT3, type RefBox, type RefType } from '../layout/referenceLayout';
import { JurnlProductNav } from '../components/ProductNav';
import { ReferenceStage, RefIcon, RefText, at, type RefIconName } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { CurrencySheet } from './SettingsScreens';
import { useJurnl } from '../state/store';

const ACCOUNT_PLATE = { src: accountPlate, assetId: 'SAFE.REFERENCE_REPLICA.ACCOUNT_PLATE.INTERIM' };
const NOT_YET = 'NOT IN THIS PREVIEW YET.';

/**
 * Shared account state: currency, connection, Ask context consent, buffer. The buffer is the shared field
 * (data/f09/safetyBuffer.ts: typed in the display currency, kept in USD); ASK JURNL CONTEXT is its own consent.
 */
function useAccountState() {
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
    notYet: (what: string) => showToast({ tone: 'error', title: what, body: NOT_YET, testId: 'toast-not-yet' }),
  };
}

/**
 * PRIVACY & CONSENTS. One owner (MenuDestinations.PrivacyConsentsFolio): the menu, the ACCOUNT page and the drawer all
 * open the same destination. Kept under this name for the screens that render it on their own.
 */
export function ConsentsSheet({ onClose }: { onClose: () => void }) {
  const panels = useMenuPanels();
  return <PrivacyConsentsFolio onBack={onClose} onOpen={(d) => panels?.open(d)} />;
}

/** Open a menu destination over this screen (the shared stack), or the screen's own sheet where there is no menu host. */
function useOpenDestination(fallback: (d: 'currency' | 'consents' | 'sign-out') => void) {
  const panels = useMenuPanels();
  return (d: MenuDestination | MenuPanel, local?: 'currency' | 'consents' | 'sign-out') => {
    if (panels) panels.open(d);
    else if (local) fallback(local);
  };
}

function Toggle({ on, box, origin, onChange, trigger }: { on: boolean; box: RefBox; origin: RefBox; onChange: (v: boolean) => void; trigger: string }) {
  const h = box[3] - box[1];
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="ASK JURNL CONTEXT" className="jrn-ref__toggle" data-on={on ? 'true' : 'false'} data-jrn-trigger={trigger} onClick={() => onChange(!on)} style={at(box, origin)}>
      <span className="jrn-ref__toggle-knob" style={{ width: h - 10, height: h - 10, left: on ? box[2] - box[0] - h + 5 : 5, top: 5 }} />
    </button>
  );
}

/** Amount field: the fitted figure is drawn; a transparent input takes the typing. */
function MoneyField({ t, origin, value, onValue, trigger, label, currency, disabled }: { t: RefType; origin: RefBox; value: string; onValue: (v: string) => void; trigger: string; label: string; currency: CurrencyPreference; disabled?: boolean }) {
  const figure = formatAmountInput(value) || '0';
  return (
    <>
      <RefText t={t} origin={origin} as="span" aria-hidden>{currency.symbolPosition === 'prefix' ? `${currency.symbol}${figure}` : `${figure} ${currency.symbol}`}</RefText>
      <input className="jrn-ref__money-input" inputMode="decimal" autoComplete="off" aria-label={`${label} (${currency.code})`} value={formatAmountInput(value)} data-jrn-trigger={trigger} disabled={disabled} onChange={(e) => onValue(e.target.value)} style={{ left: 0, top: 0, width: origin[2] - origin[0], height: origin[3] - origin[1] }} />
    </>
  );
}

function Pill({ kind, box, arrow, leaf, label, t, onClick, trigger }: { kind: 'next' | 'back'; box: RefBox; arrow: RefBox; leaf: RefBox; label: string; t: RefType; onClick: () => void; trigger: string }) {
  return (
    <button type="button" className="jrn-ref__pill jrn-ref__pill--leaf" data-jrn-trigger={trigger} onClick={onClick} style={at(box)}>
      <img className="jrn-ref__leaf" src={kind === 'next' ? leafRight : leafLeft} alt="" draggable={false} style={at(leaf, box)} />
      <RefText t={t} origin={box} as="span">{label}</RefText>
      <RefIcon name={kind === 'next' ? 'arrow' : 'arrow-left'} box={arrow} origin={box} stroke={2.4} />
    </button>
  );
}

function Dots({ page, boxes, onPage }: { page: number; boxes: readonly RefBox[]; onPage: (p: number) => void }) {
  return (
    <div className="jrn-ref__dots" role="tablist" aria-label="ACCOUNT PAGES">
      {boxes.map((b, i) => (
        <button key={i} type="button" role="tab" aria-selected={page === i} aria-label={`PAGE ${i + 1}`} className="jrn-ref__dot" data-jrn-trigger={`account-page-${i + 1}`} onClick={() => onPage(i)} style={at([b[0] - 10, b[1] - 10, b[2] + 10, b[3] + 10])}>
          <span style={{ left: 10, top: 10, width: b[2] - b[0], height: b[3] - b[1] }} />
        </button>
      ))}
    </div>
  );
}

type Row = { card: 'c1' | 'c2' | 'c3' | 'c4'; icon: RefIconName; kicker: string; title: string; gray: [string, string]; onClick: () => void; trigger: string };

function RowCards({ L, rows }: { L: typeof REF_ACCT2 | typeof REF_ACCT3; rows: Row[] }) {
  return (
    <>
      {rows.map((r, i) => {
        const card = L.box[r.card] as RefBox;
        const n = (i + 1) as 1 | 2 | 3 | 4;
        return (
          <button key={r.card} type="button" className="jrn-ref__card" data-jrn-trigger={r.trigger} onClick={r.onClick} style={at(card)}>
            <span className="jrn-ref__well" style={at(L.box[`well${n}`] as RefBox, card)} />
            <RefIcon name={r.icon} box={L.box[`icon${n}`] as RefBox} origin={card} stroke={2.6} />
            <RefText t={L.text[`${r.card}Kicker`]} origin={card} as="span">{r.kicker}</RefText>
            <RefText t={L.text[`${r.card}Title`]} origin={card} as="span" className="jrn-ref__card-title">{r.title}</RefText>
            <RefText t={L.text[`${r.card}Gray1`]} origin={card} as="span" className="jrn-ref__muted">{r.gray[0]}</RefText>
            <RefText t={L.text[`${r.card}Gray2`]} origin={card} as="span" className="jrn-ref__muted">{r.gray[1]}</RefText>
            <RefIcon name="arrow" box={L.box[`arrow${n}`] as RefBox} origin={card} stroke={2.2} />
          </button>
        );
      })}
    </>
  );
}

/** GS.SETTINGS — ACCOUNT, full page (three continuation screens). */
export function AccountScreen() {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  const s = useAccountState();
  const currency = useCurrency();
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState<'currency' | 'consents' | 'sign-out' | null>(null);
  const openDest = useOpenDestination(setSheet);
  const A = REF_ACCT1;
  const card = (k: 'profile' | 'currency' | 'connection' | 'ask' | 'buffer') => A.box[k] as RefBox;
  return (
    <ReferenceStage
      screenId="GS.SETTINGS"
      family="GS"
      plate={ACCOUNT_PLATE}
      label="ACCOUNT"
      outside={
        <>
          <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
          {sheet === 'currency' ? <CurrencySheet onClose={() => setSheet(null)} /> : null}
          {sheet === 'consents' ? <ConsentsSheet onClose={() => setSheet(null)} /> : null}
          {sheet === 'sign-out' ? <SignOutConfirm onCancel={() => setSheet(null)} onSignedOut={() => setSheet(null)} /> : null}
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId={null} onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="GS" nodeId="GS.SETTINGS" onClose={closeOverlay} /> : null}
        </>
      }
    >
      <ReferenceLockup L={A} />
      <RefText t={A.text.title} as="h1">ACCOUNT</RefText>
      <RefText t={A.text.sub}>ONE SETTINGS OWNER.</RefText>

      <div className="jrn-ref__page" data-jrn-page={page + 1} key={page}>
        {page === 0 ? (
          <>
            <button type="button" className="jrn-ref__card" data-jrn-trigger="account-profile" onClick={() => openDest('profile')} style={at(card('profile'))}>
              <span className="jrn-ref__well" style={at(A.box.well1, card('profile'))} />
              <RefIcon name="person" box={A.box.icon1} origin={card('profile')} stroke={2.6} />
              <RefText t={A.text.profileKicker} origin={card('profile')} as="span">PROFILE</RefText>
              <RefText t={A.text.profileTitle} origin={card('profile')} as="span" className="jrn-ref__card-title">{s.name}</RefText>
              <RefText t={A.text.profileGray1} origin={card('profile')} as="span" className="jrn-ref__muted">{s.email ?? 'NO EMAIL ON DEVICE.'}</RefText>
              <RefIcon name="arrow" box={A.box.arrow1} origin={card('profile')} stroke={2.2} />
            </button>
            <section className="jrn-ref__card" style={at(card('currency'))} aria-label="DISPLAY CURRENCY">
              <span className="jrn-ref__well" style={at(A.box.well2, card('currency'))} />
              <RefIcon name="dollar" box={A.box.icon2} origin={card('currency')} stroke={2.6} />
              <RefText t={A.text.currencyKicker} origin={card('currency')} as="span">DISPLAY CURRENCY</RefText>
              <RefText t={A.text.currencyTitle} origin={card('currency')} as="span" className="jrn-ref__card-title">{s.currency}</RefText>
              <button type="button" className="jrn-ref__inline" data-jrn-trigger="settings-currency" onClick={() => openDest('currency', 'currency')} style={at([570, 800, 735, 856], card('currency'))}>
                <RefText t={A.text.currencyChange} origin={[570, 800, 735, 856]} as="span">CHANGE</RefText>
                <RefIcon name="arrow" box={A.box.arrow2} origin={[570, 800, 735, 856]} stroke={2.2} />
              </button>
            </section>
            <button type="button" className="jrn-ref__card" data-jrn-trigger="account-connection" onClick={() => go('money/places')} style={at(card('connection'))}>
              <span className="jrn-ref__well" style={at(A.box.well3, card('connection'))} />
              <RefIcon name="bank" box={A.box.icon3} origin={card('connection')} stroke={2.4} />
              <RefText t={A.text.connectionKicker} origin={card('connection')} as="span">CONNECTION</RefText>
              <RefText t={A.text.connectionTitle} origin={card('connection')} as="span" className="jrn-ref__card-title">{s.connection}</RefText>
              <RefIcon name="arrow" box={A.box.arrow3} origin={card('connection')} stroke={2.2} />
            </button>
            <section className="jrn-ref__card" style={at(card('ask'))} aria-label="ASK JURNL CONTEXT">
              <span className="jrn-ref__well" style={at(A.box.well4, card('ask'))} />
              <RefIcon name="sparkles" box={A.box.icon4} origin={card('ask')} stroke={2.4} />
              <RefText t={A.text.askKicker} origin={card('ask')} as="span">ASK JURNL CONTEXT</RefText>
              <RefText t={A.text.askGray1} origin={card('ask')} as="span" className="jrn-ref__muted">ALLOW JURNL TO USE YOUR DATA</RefText>
              <RefText t={A.text.askGray2} origin={card('ask')} as="span" className="jrn-ref__muted">TO PROVIDE MORE PERSONALIZED</RefText>
              <RefText t={A.text.askGray3} origin={card('ask')} as="span" className="jrn-ref__muted">INSIGHTS.</RefText>
              <Toggle on={s.askOn} box={A.box.toggle} origin={card('ask')} onChange={s.setAsk} trigger="settings-ask-context" />
            </section>
            <section className="jrn-ref__card" style={at(card('buffer'))} aria-label="SAFE TO SPEND BUFFER">
              <span className="jrn-ref__well" style={at(A.box.well5, card('buffer'))} />
              <RefIcon name="shield" box={A.box.icon5} origin={card('buffer')} stroke={2.6} />
              <RefText t={A.text.bufferKicker} origin={card('buffer')} as="span">SAFE TO SPEND BUFFER</RefText>
              <div className="jrn-ref__field jrn-ref__abs" style={at(A.box.bufferField, card('buffer'))}>
                <RefText t={A.text.bufferLabel} origin={A.box.bufferField} as="span">BUFFER</RefText>
                <MoneyField t={A.text.bufferValue} origin={A.box.bufferField} value={s.buffer} onValue={s.setBuffer} trigger="settings-buffer" label="BUFFER" currency={currency} disabled={s.bufferBlocked} />
                <span className="jrn-ref__vrule" style={at(A.box.bufferDivider, A.box.bufferField)} />
                <button type="button" className="jrn-ref__cta jrn-ref__cta--pill" data-jrn-trigger="settings-buffer-save" onClick={s.saveBuffer} style={at(A.box.save, A.box.bufferField)}>
                  <RefText t={A.text.save} origin={A.box.save} as="span">SAVE BUFFER</RefText>
                  <RefIcon name="arrow" box={A.box.saveArrow} origin={A.box.save} stroke={2.2} />
                </button>
              </div>
            </section>
            <Pill kind="next" box={A.box.next} arrow={A.box.nextArrow} leaf={A.box.nextLeaf} label="NEXT" t={A.text.next} onClick={() => setPage(1)} trigger="account-next" />
            <Dots page={0} boxes={[A.box.dot1, A.box.dot2, A.box.dot3]} onPage={setPage} />
          </>
        ) : null}
        {page === 1 ? (
          <>
            <RowCards
              L={REF_ACCT2}
              rows={[
                { card: 'c1', icon: 'bell', kicker: 'NOTIFICATIONS', title: 'REMINDERS & UPDATES', gray: ['MANAGE YOUR NOTIFICATIONS', 'AND PREFERENCES.'], onClick: () => openDest('preferences'), trigger: 'account-notifications' },
                { card: 'c2', icon: 'lock', kicker: 'PRIVACY & CONSENTS', title: 'MANAGE DATA', gray: ['REVIEW YOUR PRIVACY SETTINGS', 'AND DATA CONSENTS.'], onClick: () => openDest('privacy', 'consents'), trigger: 'account-privacy' },
                { card: 'c3', icon: 'shield', kicker: 'SECURITY', title: 'FACE ID / PASSCODE', gray: ['MANAGE YOUR SIGN-IN', 'PREFERENCES.'], onClick: () => openDest({ tool: 'security-biometric' }), trigger: 'account-security' },
                { card: 'c4', icon: 'calendar', kicker: 'WEEK START & DATE FORMAT', title: 'CALENDAR PREFERENCES', gray: ['CHOOSE YOUR WEEK START', 'AND DATE FORMAT.'], onClick: () => openDest('preferences'), trigger: 'account-calendar' },
              ]}
            />
            <Pill kind="back" box={REF_ACCT2.box.back} arrow={REF_ACCT2.box.backArrow} leaf={REF_ACCT2.box.backLeaf} label="BACK" t={REF_ACCT2.text.back} onClick={() => setPage(0)} trigger="account-back" />
            <Pill kind="next" box={REF_ACCT2.box.next} arrow={REF_ACCT2.box.nextArrow} leaf={REF_ACCT2.box.nextLeaf} label="NEXT" t={REF_ACCT2.text.next} onClick={() => setPage(2)} trigger="account-next" />
            <Dots page={1} boxes={[REF_ACCT2.box.dot1, REF_ACCT2.box.dot2, REF_ACCT2.box.dot3]} onPage={setPage} />
          </>
        ) : null}
        {page === 2 ? (
          <>
            <RowCards
              L={REF_ACCT3}
              rows={[
                { card: 'c1', icon: 'file', kicker: 'DATA EXPORT', title: 'DOWNLOAD YOUR DATA', gray: ['EXPORT A COPY OF YOUR DATA', 'ANYTIME.'], onClick: () => openDest({ tool: 'privacy-data-export' }), trigger: 'account-export' },
                { card: 'c2', icon: 'help', kicker: 'HELP & SUPPORT', title: 'GET SUPPORT', gray: ['FIND ANSWERS, CONTACT OUR', 'TEAM, OR BROWSE GUIDES.'], onClick: () => openDest('help'), trigger: 'account-help' },
                { card: 'c3', icon: 'document', kicker: 'LEGAL', title: 'TERMS & POLICIES', gray: ['REVIEW OUR TERMS OF SERVICE', 'AND PRIVACY POLICY.'], onClick: () => openDest('legal'), trigger: 'account-legal' },
                { card: 'c4', icon: 'sign-out', kicker: 'ACCOUNT', title: 'SIGN OUT', gray: ['SIGN OUT OF YOUR JURNL', 'ACCOUNT ON THIS DEVICE.'], onClick: () => openDest('sign-out', 'sign-out'), trigger: 'settings-sign-out' },
              ]}
            />
            <Pill kind="back" box={REF_ACCT3.box.back} arrow={REF_ACCT3.box.backArrow} leaf={REF_ACCT3.box.backLeaf} label="BACK" t={REF_ACCT3.text.back} onClick={() => setPage(1)} trigger="account-back" />
            <Dots page={2} boxes={[REF_ACCT3.box.dot1, REF_ACCT3.box.dot2, REF_ACCT3.box.dot3]} onPage={setPage} />
          </>
        ) : null}
      </div>

    </ReferenceStage>
  );
}


export { AccountDrawer } from '../surfaces/editorial/AccountSettingsDrawer';
