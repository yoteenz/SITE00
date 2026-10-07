/**
 * ACCOUNT (GS.SETTINGS) in the SAFE TO SPEND family, built to the founder references (P0.JURNL.F09.REFERENCE-REPLICA1).
 *
 * Two sibling expressions (EXPRESSION_PAIR_RULE):
 *   · full page — three continuation screens joined by BACK / NEXT and page dots. Page 1's shell (photograph, lockup,
 *     menu, title, dock) stays fixed on all three (CONTINUATION_RULE); each page's cards follow its own reference.
 *   · drawer — the compact expression, opened from the menu. The stone panel it sits on is part of its photograph.
 *
 * Rows whose feature does not exist yet say so instead of pretending.
 */

import { useCallback, useMemo, useState } from 'react';
import { consentGranted } from '../../data/foundation/consent';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { getRepository } from '../../data/repository/deviceRepository';
import { syncDeviceAiToRepository } from '../../data/repository/consentSync';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { useCurrency } from '../../data/home/money';
import accountPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_ACCOUNT_PLATE.jpg';
import drawerPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_ACCOUNT_DRAWER_PLATE.jpg';
import leafRight from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_RIGHT.png';
import leafLeft from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_LEFT.png';
import profileArch from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PROFILE_ARCH.jpg';
import privacyCard from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PRIVACY_CARD.jpg';
import { REF_ACCT1, REF_ACCT2, REF_ACCT3, REF_DRAWER, type RefBox, type RefType } from '../layout/referenceLayout';
import { JurnlProductNav } from '../components/ProductNav';
import { ReferenceStage, RefIcon, RefText, at, type RefIconName } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { JurnlDrawer, JurnlToggle } from '../components/primitives';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { CurrencySheet } from './SettingsScreens';
import { useCornerMenu } from '../components/JurnlCornerChrome';
import { useJurnl } from '../state/store';

const ACCOUNT_PLATE = { src: accountPlate, assetId: 'SAFE.REFERENCE_REPLICA.ACCOUNT_PLATE.INTERIM' };
const NOT_YET = 'NOT IN THIS PREVIEW YET.';

/** Shared account state: currency, connection, Ask context consent, buffer. */
function useAccountState() {
  const { session, device, setDevice, showToast } = useJurnl();
  const draft = useSetup();
  const currency = useCurrency();
  const settings = useMemo(() => getRepository().getSettings(), []);
  const [consent, setConsent] = useState(() => getRepository().getConsent());
  const [buffer, setBuffer] = useState(String(settings.safeToSpendBuffer ?? ''));
  const askOn = consentGranted(consent, 'ASK_JURNL_CONTEXT');
  return {
    name: session.account ? `${session.account.firstName} ${session.account.lastName}`.toUpperCase() : 'PREVIEW GUEST',
    email: session.account?.email?.toUpperCase() ?? null,
    currency: `${currency.code} · ${currency.name}`.toUpperCase(),
    connection: honestAccountsConnectionLabel(draft.accounts),
    askOn,
    setAsk: (granted: boolean) => {
      getRepository().patchConsent('ASK_JURNL_CONTEXT', granted, 'GS.SETTINGS');
      setConsent(getRepository().getConsent());
      const ai = { ...device.ai, naturalLanguage: granted || device.ai.naturalLanguage };
      setDevice({ ai });
      syncDeviceAiToRepository({ ...device, ai });
    },
    buffer,
    setBuffer: (v: string) => setBuffer(v.replace(/[^0-9.]/g, '').slice(0, 9)),
    saveBuffer: () => {
      getRepository().patchSettings({ safeToSpendBuffer: buffer });
      showToast({ tone: 'success', title: 'BUFFER SAVED', body: 'SAFE TO SPEND NOW KEEPS THIS AMOUNT ASIDE.', testId: 'toast-buffer' });
    },
    notYet: (what: string) => showToast({ tone: 'error', title: what, body: NOT_YET, testId: 'toast-not-yet' }),
  };
}

/** Setup consents, opened from PRIVACY & CONSENTS. */
function ConsentsSheet({ onClose }: { onClose: () => void }) {
  const draft = useSetup();
  return (
    <JurnlDrawer expression="form" size="long" testId="settings-consents-sheet" title="PRIVACY & CONSENTS" lead="WHAT JURNL MAY KEEP AND USE." onClose={onClose}>
      <JurnlToggle checked={draft.consentRemember} label="REMEMBER SETUP" trigger="settings-consent-remember" onChange={(v) => patchSetup({ consentRemember: v })} />
      <JurnlToggle checked={draft.consentLinks} label="LINKED ACCOUNTS OPTIONAL" trigger="settings-consent-links" onChange={(v) => patchSetup({ consentLinks: v })} />
      <JurnlToggle checked={draft.consentSale} label="NOTHING SOLD" trigger="settings-consent-sale" onChange={(v) => patchSetup({ consentSale: v })} />
    </JurnlDrawer>
  );
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
function MoneyField({ t, origin, value, onValue, trigger, label }: { t: RefType; origin: RefBox; value: string; onValue: (v: string) => void; trigger: string; label: string }) {
  return (
    <>
      <RefText t={t} origin={origin} as="span" aria-hidden>{`$${value || '0'}`}</RefText>
      <input className="jrn-ref__money-input" inputMode="decimal" autoComplete="off" aria-label={label} value={value} data-jrn-trigger={trigger} onChange={(e) => onValue(e.target.value)} style={{ left: 0, top: 0, width: origin[2] - origin[0], height: origin[3] - origin[1] }} />
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
  const { go, overlay, openOverlay, closeOverlay, signOut } = useJurnl();
  const s = useAccountState();
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState<'currency' | 'consents' | null>(null);
  const [drawer, setDrawer] = useState(false);
  const openDrawer = useCallback(() => setDrawer(true), []);
  useCornerMenu(openDrawer, drawer);
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
            <button type="button" className="jrn-ref__card" data-jrn-trigger="account-profile" onClick={() => s.notYet('PROFILE')} style={at(card('profile'))}>
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
              <button type="button" className="jrn-ref__inline" data-jrn-trigger="settings-currency" onClick={() => setSheet('currency')} style={at([570, 800, 735, 856], card('currency'))}>
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
                <MoneyField t={A.text.bufferValue} origin={A.box.bufferField} value={s.buffer} onValue={s.setBuffer} trigger="settings-buffer" label="BUFFER" />
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
                { card: 'c1', icon: 'bell', kicker: 'NOTIFICATIONS', title: 'REMINDERS & UPDATES', gray: ['MANAGE YOUR NOTIFICATIONS', 'AND PREFERENCES.'], onClick: () => s.notYet('NOTIFICATIONS'), trigger: 'account-notifications' },
                { card: 'c2', icon: 'lock', kicker: 'PRIVACY & CONSENTS', title: 'MANAGE DATA', gray: ['REVIEW YOUR PRIVACY SETTINGS', 'AND DATA CONSENTS.'], onClick: () => setSheet('consents'), trigger: 'account-privacy' },
                { card: 'c3', icon: 'shield', kicker: 'SECURITY', title: 'FACE ID / PASSCODE', gray: ['MANAGE YOUR SIGN-IN', 'PREFERENCES.'], onClick: () => s.notYet('SECURITY'), trigger: 'account-security' },
                { card: 'c4', icon: 'calendar', kicker: 'WEEK START & DATE FORMAT', title: 'CALENDAR PREFERENCES', gray: ['CHOOSE YOUR WEEK START', 'AND DATE FORMAT.'], onClick: () => s.notYet('CALENDAR PREFERENCES'), trigger: 'account-calendar' },
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
                { card: 'c1', icon: 'file', kicker: 'DATA EXPORT', title: 'DOWNLOAD YOUR DATA', gray: ['EXPORT A COPY OF YOUR DATA', 'ANYTIME.'], onClick: () => s.notYet('DATA EXPORT'), trigger: 'account-export' },
                { card: 'c2', icon: 'help', kicker: 'HELP & SUPPORT', title: 'GET SUPPORT', gray: ['FIND ANSWERS, CONTACT OUR', 'TEAM, OR BROWSE GUIDES.'], onClick: () => s.notYet('HELP & SUPPORT'), trigger: 'account-help' },
                { card: 'c3', icon: 'document', kicker: 'LEGAL', title: 'TERMS & POLICIES', gray: ['REVIEW OUR TERMS OF SERVICE', 'AND PRIVACY POLICY.'], onClick: () => s.notYet('LEGAL'), trigger: 'account-legal' },
                { card: 'c4', icon: 'sign-out', kicker: 'ACCOUNT', title: 'SIGN OUT', gray: ['SIGN OUT OF YOUR JURNL', 'ACCOUNT ON THIS DEVICE.'], onClick: () => signOut(), trigger: 'settings-sign-out' },
              ]}
            />
            <Pill kind="back" box={REF_ACCT3.box.back} arrow={REF_ACCT3.box.backArrow} leaf={REF_ACCT3.box.backLeaf} label="BACK" t={REF_ACCT3.text.back} onClick={() => setPage(1)} trigger="account-back" />
            <Dots page={2} boxes={[REF_ACCT3.box.dot1, REF_ACCT3.box.dot2, REF_ACCT3.box.dot3]} onPage={setPage} />
          </>
        ) : null}
      </div>

      {drawer ? <AccountDrawer onClose={() => setDrawer(false)} /> : null}
    </ReferenceStage>
  );
}

/**
 * ACCOUNT, drawer expression. Opens from the menu over the current screen; tapping outside the stone panel closes it.
 * Rendered inside the reference stage, so it shares the stage's scale.
 */
export function AccountDrawer({ onClose }: { onClose: () => void }) {
  const { go, signOut } = useJurnl();
  const s = useAccountState();
  const [sheet, setSheet] = useState<'currency' | 'consents' | null>(null);
  const D = REF_DRAWER;
  const c = (k: 'profile' | 'currency' | 'connection' | 'ask' | 'buffer' | 'privacy' | 'signout') => D.box[k] as RefBox;
  return (
    <div className="jrn-ref__drawer" role="dialog" aria-modal="true" aria-label="ACCOUNT" data-jrn-sheet="account-drawer" onKeyDown={(e) => (e.key === 'Escape' ? onClose() : undefined)}>
      <img className="jrn-ref__plate" src={drawerPlate} alt="" width={853} height={1844} draggable={false} data-asset-id="SAFE.REFERENCE_REPLICA.ACCOUNT_DRAWER_PLATE.INTERIM" />
      <button type="button" className="jrn-ref__drawer-out" aria-label="CLOSE ACCOUNT" data-jrn-trigger="account-drawer-close" onClick={onClose} style={at([0, 0, 296, 1844])} />
      <div className="jrn-ref__drawer-panel">
        <ReferenceLockup L={D} />
        <RefText t={D.text.title} as="h2">ACCOUNT</RefText>

        <button type="button" className="jrn-ref__card jrn-ref__card--drawer" data-jrn-trigger="drawer-profile" onClick={() => { onClose(); go('account'); }} style={at(c('profile'))}>
          <img className="jrn-ref__thumb" src={profileArch} alt="" draggable={false} style={at(D.box.thumb, c('profile'))} />
          <span className="jrn-ref__vrule" style={at(D.box.divProfile, c('profile'))} />
          <RefText t={D.text.profileKicker} origin={c('profile')} as="span">PROFILE</RefText>
          <RefText t={D.text.profileTitle} origin={c('profile')} as="span" className="jrn-ref__card-title">{s.name}</RefText>
          <RefText t={D.text.profileGray1} origin={c('profile')} as="span" className="jrn-ref__muted">{s.email ?? 'NO EMAIL ON DEVICE'}</RefText>
          <RefIcon name="arrow" box={D.box.arrowProfile} origin={c('profile')} stroke={2} />
        </button>

        <section className="jrn-ref__card jrn-ref__card--drawer" style={at(c('currency'))} aria-label="DISPLAY CURRENCY">
          <RefText t={D.text.currencyKicker} origin={c('currency')} as="span">DISPLAY CURRENCY</RefText>
          <RefText t={D.text.currencyTitle} origin={c('currency')} as="span" className="jrn-ref__card-title">{s.currency}</RefText>
          <span className="jrn-ref__vrule" style={at(D.box.divCurrency, c('currency'))} />
          <button type="button" className="jrn-ref__inline" data-jrn-trigger="drawer-currency" onClick={() => setSheet('currency')} style={at([650, 640, 832, 722], c('currency'))}>
            <RefText t={D.text.currencyChange} origin={[650, 640, 832, 722]} as="span">CHANGE</RefText>
            <RefIcon name="arrow" box={D.box.arrowCurrency} origin={[650, 640, 832, 722]} stroke={2} />
          </button>
        </section>

        <section className="jrn-ref__card jrn-ref__card--drawer" style={at(c('connection'))} aria-label="CONNECTION">
          <RefText t={D.text.connectionKicker} origin={c('connection')} as="span">CONNECTION</RefText>
          <RefText t={D.text.connectionTitle} origin={c('connection')} as="span" className="jrn-ref__card-title">{s.connection}</RefText>
          <span className="jrn-ref__vrule" style={at(D.box.divConnection, c('connection'))} />
          <button type="button" className="jrn-ref__inline" data-jrn-trigger="drawer-connection" onClick={() => { onClose(); go('money/places'); }} style={at([650, 780, 832, 858], c('connection'))}>
            <RefText t={D.text.connectionSetup} origin={[650, 780, 832, 858]} as="span">SET UP</RefText>
            <RefIcon name="arrow" box={D.box.arrowConnection} origin={[650, 780, 832, 858]} stroke={2} />
          </button>
        </section>

        <section className="jrn-ref__card jrn-ref__card--drawer" style={at(c('ask'))} aria-label="ASK JURNL CONTEXT">
          <RefText t={D.text.askKicker} origin={c('ask')} as="span">ASK JURNL CONTEXT</RefText>
          <RefText t={D.text.askGray1} origin={c('ask')} as="span" className="jrn-ref__muted">HELP JURNL GIVE YOU</RefText>
          <RefText t={D.text.askGray2} origin={c('ask')} as="span" className="jrn-ref__muted">PERSONALIZED INSIGHTS</RefText>
          <RefText t={D.text.askGray3} origin={c('ask')} as="span" className="jrn-ref__muted">BASED ON YOUR SPENDING,</RefText>
          <RefText t={D.text.askGray4} origin={c('ask')} as="span" className="jrn-ref__muted">PLANS AND GOALS.</RefText>
          <Toggle on={s.askOn} box={D.box.toggle} origin={c('ask')} onChange={s.setAsk} trigger="drawer-ask-context" />
        </section>

        <section className="jrn-ref__card jrn-ref__card--drawer" style={at(c('buffer'))} aria-label="SAFE TO SPEND BUFFER">
          <RefText t={D.text.bufferKicker} origin={c('buffer')} as="span">SAFE TO SPEND BUFFER</RefText>
          <RefText t={D.text.bufferGray1} origin={c('buffer')} as="span" className="jrn-ref__muted">AMOUNT TO KEEP AS A BUFFER</RefText>
          <RefText t={D.text.bufferGray2} origin={c('buffer')} as="span" className="jrn-ref__muted">IN YOUR SAFE TO SPEND CALCULATION.</RefText>
          <div className="jrn-ref__field jrn-ref__abs" style={at(D.box.bufferField, c('buffer'))}>
            <MoneyField t={D.text.bufferValue} origin={D.box.bufferField} value={s.buffer} onValue={s.setBuffer} trigger="drawer-buffer" label="BUFFER" />
          </div>
          <button type="button" className="jrn-ref__cta jrn-ref__cta--drawer" data-jrn-trigger="drawer-buffer-save" onClick={s.saveBuffer} style={at(D.box.save, c('buffer'))}>
            <RefText t={D.text.save} origin={D.box.save} as="span">SAVE BUFFER</RefText>
            <RefIcon name="arrow" box={D.box.saveArrow} origin={D.box.save} stroke={2} />
          </button>
        </section>

        <button type="button" className="jrn-ref__card jrn-ref__card--image" data-jrn-trigger="drawer-privacy" onClick={() => setSheet('consents')} style={at(c('privacy'))}>
            <img src={privacyCard} alt="" draggable={false} style={{ left: 0, top: 0, width: c('privacy')[2] - c('privacy')[0], height: c('privacy')[3] - c('privacy')[1] }} />
            <RefText t={D.text.privacyKicker} origin={c('privacy')} as="span">PRIVACY & CONSENTS</RefText>
            <RefText t={D.text.privacy1} origin={c('privacy')} as="span">MANAGE YOUR PRIVACY</RefText>
            <RefText t={D.text.privacy2} origin={c('privacy')} as="span">SETTINGS AND DATA CONSENTS.</RefText>
            <RefIcon name="arrow" box={D.box.privacyArrow} origin={c('privacy')} stroke={2} className="jrn-ref__icon--light" />
        </button>

        <button type="button" className="jrn-ref__card jrn-ref__card--drawer" data-jrn-trigger="drawer-sign-out" onClick={() => signOut()} style={at(c('signout'))}>
          <RefIcon name="sign-out" box={D.box.signoutIcon} origin={c('signout')} stroke={2.6} />
          <RefText t={D.text.signout} origin={c('signout')} as="span">SIGN OUT</RefText>
          <RefIcon name="arrow" box={D.box.signoutArrow} origin={c('signout')} stroke={2} />
        </button>
      </div>
      {sheet === 'currency' ? <CurrencySheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'consents' ? <ConsentsSheet onClose={() => setSheet(null)} /> : null}
    </div>
  );
}
