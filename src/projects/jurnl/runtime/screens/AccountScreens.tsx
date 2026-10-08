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

import { useId, useMemo, useState, type CSSProperties } from 'react';
import { consentGranted } from '../../data/foundation/consent';
import { honestAccountsConnectionLabel } from '../../data/foundation/connectionProvider';
import { getRepository } from '../../data/repository/deviceRepository';
import { syncDeviceAiToRepository } from '../../data/repository/consentSync';
import { patchSetup, useSetup } from '../../data/f02/setupDraft';
import { useCurrency } from '../../data/home/money';
import accountPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_ACCOUNT_PLATE.jpg';
import leafRight from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_RIGHT.png';
import leafLeft from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_LEFT.png';
import { REF_ACCT1, REF_ACCT2, REF_ACCT3, type RefBox, type RefType } from '../layout/referenceLayout';
import { JurnlProductNav } from '../components/ProductNav';
import { ReferenceStage, RefIcon, RefText, at, type RefIconName } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { JurnlDrawer, JurnlToggle, OverlayLayer, useOverlayFocus } from '../components/primitives';
import { ACCOUNT_MENU_SHELL, OverlayArrow, OverlayCloseGlyph, useOverlayFit } from '../components/OverlayAuthority';
import accountMenuShell from '../global/overlays/ACCOUNT_MENU_SHELL.webp';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { CurrencySheet } from './SettingsScreens';
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

    </ReferenceStage>
  );
}

/**
 * ACCOUNT, drawer expression: the personal JURNL index (approved authority JURNL/OVERLAYS_EDITORIAL_REDESIGN1/HAMBURGER_MENU).
 * A tabbed paper folio slides in from the right over the live screen; the bust print is the PROFILE portrait and a
 * burgundy bookmark hangs under it (both on the shell). Tapping the scrim, the close mark or Escape closes it.
 */
export function AccountDrawer({ onClose }: { onClose: () => void }) {
  const { go, signOut } = useJurnl();
  const s = useAccountState();
  const currency = useCurrency();
  const [sheet, setSheet] = useState<'currency' | 'consents' | null>(null);
  const { fit, ref: rootRef } = useOverlayFit('drawer');
  const { ref } = useOverlayFocus(onClose);
  const bufferId = useId();
  const longest = Math.max(...s.name.split(/\s+/).map((w) => w.length));
  const nameSize = longest > 9 ? Math.max(17, Math.floor((25 * 9) / longest)) : 25;
  const height = Math.max(ACCOUNT_MENU_SHELL.minHeight, fit.H / fit.s);
  return (
    <OverlayLayer>
      <div ref={rootRef} className="jrn-ovl jrn-ovl--drawer" data-jrn-overlay="account-drawer" data-jrn-sheet="account-drawer" style={{ '--s': fit.s, '--hd': height } as CSSProperties}>
        <div className="jrn-ovl__scrim" onClick={onClose} aria-hidden />
        <div ref={ref} role="dialog" aria-modal="true" aria-label="ACCOUNT" className="jrn-menu" data-jrn-overlay-authority="HAMBURGER_MENU">
          <div className="jrn-ovl__paper" aria-hidden data-asset-id="OVERLAY.ACCOUNT_MENU.SHELL.001" style={{ '--shell': `url("${accountMenuShell}")` } as CSSProperties}>
            <span className="jrn-ovl__paper-top" />
            <span className="jrn-ovl__paper-foot" />
          </div>
          <div className="jrn-menu__hit" aria-hidden />
          <button type="button" className="jrn-ovl__close jrn-menu__close" aria-label="CLOSE ACCOUNT" data-jrn-trigger="account-drawer-close" onClick={onClose}>
            <OverlayCloseGlyph />
          </button>
          <span className="jrn-menu__lockup">JURNL</span>
          <button type="button" className="jrn-menu__title" data-jrn-trigger="drawer-account" aria-label="ACCOUNT" onClick={() => { onClose(); go('account'); }}>ACCOUNT</button>

          <button type="button" className="jrn-menu__profile" data-jrn-trigger="drawer-profile" onClick={() => { onClose(); go('account'); }}>
            <span className="jrn-menu__who">
              <span className="jrn-menu__k jrn-menu__k--soft">PROFILE</span>
              <span className="jrn-menu__name" style={{ fontSize: nameSize }}>{s.name}</span>
              <span className="jrn-menu__email">{s.email ?? 'NO EMAIL ON DEVICE'}</span>
            </span>
            <span className="jrn-menu__go"><OverlayArrow /></span>
          </button>

          <div className="jrn-menu__index">
            <div className="jrn-menu__sec jrn-menu__sec--cols">
              <section className="jrn-menu__col" aria-label="DISPLAY CURRENCY">
                <span className="jrn-menu__k">DISPLAY CURRENCY</span>
                <span className="jrn-menu__v">{s.currency}</span>
                <button type="button" className="jrn-menu__link" data-jrn-trigger="drawer-currency" onClick={() => setSheet('currency')}>CHANGE <OverlayArrow width={11} /></button>
              </section>
              <span className="jrn-menu__vrule" aria-hidden />
              <section className="jrn-menu__col" aria-label="CONNECTION">
                <span className="jrn-menu__k">CONNECTION</span>
                <span className="jrn-menu__v">{s.connection}</span>
                <button type="button" className="jrn-menu__link" data-jrn-trigger="drawer-connection" onClick={() => { onClose(); go('money/places'); }}>SET UP <OverlayArrow width={11} /></button>
              </section>
            </div>

            <section className="jrn-menu__sec jrn-menu__sec--ask" aria-label="ASK JURNL CONTEXT">
              <span className="jrn-menu__k">ASK JURNL CONTEXT</span>
              <span className="jrn-menu__d">HELP JURNL GIVE YOU PERSONALIZED INSIGHTS BASED ON YOUR SPENDING, PLANS AND GOALS.</span>
              <button type="button" role="switch" aria-checked={s.askOn} aria-label="ASK JURNL CONTEXT" className="jrn-menu__toggle" data-on={s.askOn ? 'true' : 'false'} data-jrn-trigger="drawer-ask-context" onClick={() => s.setAsk(!s.askOn)}>
                <i aria-hidden />
              </button>
            </section>

            <section className="jrn-menu__sec" aria-label="SAFE TO SPEND BUFFER">
              <label className="jrn-menu__k" htmlFor={bufferId}>SAFE TO SPEND BUFFER</label>
              <span className="jrn-menu__d">AMOUNT TO KEEP AS A BUFFER IN YOUR SAFE TO SPEND CALCULATION.</span>
              <span className="jrn-menu__buffer">
                <span className="jrn-menu__field">
                  {currency.symbolPosition === 'prefix' ? <span aria-hidden>{currency.symbol}</span> : null}
                  <input id={bufferId} inputMode="decimal" autoComplete="off" placeholder="0" value={s.buffer} data-jrn-trigger="drawer-buffer" onChange={(e) => s.setBuffer(e.target.value)} />
                  {currency.symbolPosition === 'suffix' ? <span aria-hidden>{currency.symbol}</span> : null}
                </span>
                <button type="button" className="jrn-menu__save" data-jrn-trigger="drawer-buffer-save" onClick={s.saveBuffer}>
                  SAVE BUFFER <OverlayArrow width={13} />
                </button>
              </span>
            </section>

            <button type="button" className="jrn-menu__sec jrn-menu__row" data-jrn-trigger="drawer-privacy" onClick={() => setSheet('consents')}>
              <span className="jrn-menu__k">PRIVACY & CONSENTS</span>
              <span className="jrn-menu__d">MANAGE YOUR PRIVACY SETTINGS AND DATA CONSENTS.</span>
              <span className="jrn-menu__go"><OverlayArrow width={16} /></span>
            </button>
          </div>

          <button type="button" className="jrn-menu__out" data-jrn-trigger="drawer-sign-out" onClick={() => signOut()}>
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
              <path d="M9.5 2.5H3.2a.7.7 0 0 0-.7.7v9.6a.7.7 0 0 0 .7.7h6.3M7 8h8M12 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            SIGN OUT
          </button>
        </div>
      </div>
      {sheet === 'currency' ? <CurrencySheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'consents' ? <ConsentsSheet onClose={() => setSheet(null)} /> : null}
    </OverlayLayer>
  );
}
