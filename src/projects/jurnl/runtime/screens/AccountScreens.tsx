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
import { formatAmountInput, useCurrency } from '../../data/home/money';
import accountPlate from '../../families/F09_SAFE/REFERENCE_REPLICA/plates/F09_ACCOUNT_PLATE.jpg';
import leafRight from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_RIGHT.png';
import leafLeft from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/PILL_BOTANICAL_LEFT.png';
import { REF_ACCT1, REF_ACCT2, REF_ACCT3, type RefBox, type RefType } from '../layout/referenceLayout';
import { JurnlProductNav } from '../components/ProductNav';
import { ReferenceStage, RefIcon, RefText, at, type RefIconName } from '../components/ReferenceStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { JurnlDrawer, JurnlToggle, OverlayLayer, useOverlayFocus } from '../components/primitives';
import { REPLICA_H, REPLICA_W, drawerScale, fitSize, useKeyboardViewport, useOverlayHost } from '../components/OverlayAuthority';
import { OVR_DRAWER } from '../layout/overlayReferenceLayout';
import drawerShell from '../global/overlays/F09_ACCOUNT_DRAWER_SHELL.webp';
import profileThumb from '../global/overlays/F09_DRAWER_PROFILE_THUMB.jpg';
import privacyCard from '../global/overlays/F09_DRAWER_PRIVACY_PHOTO.jpg';
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
      <RefText t={t} origin={origin} as="span" aria-hidden>{`$${formatAmountInput(value) || '0'}`}</RefText>
      <input className="jrn-ref__money-input" inputMode="decimal" autoComplete="off" aria-label={label} value={formatAmountInput(value)} data-jrn-trigger={trigger} onChange={(e) => onValue(e.target.value)} style={{ left: 0, top: 0, width: origin[2] - origin[0], height: origin[3] - origin[1] }} />
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

/** Drawer shell in the reference frame: the registered handoff shell, stretched 0.6% to meet the screen's right edge. */
const DRAWER_SHELL: RefBox = [228.5, 3, REPLICA_W, 1671];
/**
 * The reference's panel: a clean rounded sheet from x 295, y 70 to 1608, running off the right edge (corner radii 30 top,
 * 40 bottom). The shell is clipped to it; only the olive branch overhangs the top (x ≥ 540). Taps on the panel never fall
 * through to the scrim.
 */
const DRAWER_PANEL: RefBox = [295, 70, REPLICA_W, 1608];
const DRAWER_CLIP = `path('M540 0H${REPLICA_W}V1608H335A40 40 0 0 1 295 1568V100A30 30 0 0 1 325 70H540Z')`;
/** The ACCOUNT title's tap area (it opens the full ACCOUNT page). */
const DRAWER_TITLE: RefBox = [330, 284, 700, 372];
/** Measured advance per character of each live line at its reference size, and the room it has. */
const FIT = { name: [14.2, 296], email: [11.9, 296], currency: [17, 311], connection: [19, 309] } as const;

const sizedType = (t: RefType, text: string, [perChar, room]: readonly [number, number], min: number): RefType => {
  const size = fitSize(text, t.size, perChar, room, min);
  return size === t.size ? t : { ...t, size, ls: (t.ls * size) / t.size, top: t.top + (t.size - size) * 0.7 };
};

/**
 * ACCOUNT, drawer expression, replicated from the founder reference
 * (JURNL/F09_SAFE/AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg). The torn collage panel (the founder's handoff
 * shell) slides in from the right over the live screen, which softens behind it; every card, line and control sits where
 * the reference has it. Tapping outside the panel, the close mark or Escape closes it.
 */
export function AccountDrawer({ onClose }: { onClose: () => void }) {
  const { go, signOut } = useJurnl();
  const s = useAccountState();
  const currency = useCurrency();
  const [sheet, setSheet] = useState<'currency' | 'consents' | null>(null);
  const [typing, setTyping] = useState(false);
  const { host, ref: rootRef } = useOverlayHost();
  const vv = useKeyboardViewport(typing);
  const { ref } = useOverlayFocus(onClose);
  const bufferId = useId();
  const D = OVR_DRAWER;
  const k = drawerScale(host.W, host.H);
  const top = Math.max(0, (host.H - REPLICA_H * k) / 2);
  // While the buffer is typed into, lift the panel so the field and SAVE BUFFER stay above the keyboard.
  const lift = vv ? Math.max(0, top + (D.box.save[3] + 16) * k - (vv.top + vv.height)) : 0;
  const email = s.email ?? 'NO EMAIL ON DEVICE';
  const card = (b: RefBox) => at(b);
  return (
    <OverlayLayer>
      <div ref={rootRef} className="jrn-ovl jrn-ovl--drawer" data-jrn-overlay="account-drawer" data-jrn-sheet="account-drawer">
        <div className="jrn-ovl__scrim" onClick={onClose} aria-hidden />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="ACCOUNT"
          className="jrn-dr"
          data-jrn-overlay-authority="F09_ACCOUNT_DRAWER_OVERLAY_SOURCE"
          style={{ '--k': k, top: top - lift } as CSSProperties}
        >
          <span className="jrn-dr__panel" style={at(DRAWER_PANEL)} aria-hidden />
          <span className="jrn-dr__paper" style={{ clipPath: DRAWER_CLIP }} aria-hidden>
            <img className="jrn-dr__shell" src={drawerShell} alt="" draggable={false} data-asset-id="F09_ACCOUNT_DRAWER_OVERLAY_SHELL" style={at(DRAWER_SHELL)} />
          </span>
          <span className="jrn-dr__rim" style={at(DRAWER_PANEL)} aria-hidden />

          <ReferenceLockup L={{ box: { sprig: D.box.sprig, word: D.box.word }, text: { desc1: D.text.desc1, desc2: D.text.desc2 } }} />
          <button type="button" className="jrn-dr__title" data-jrn-trigger="drawer-account" aria-label="ACCOUNT" onClick={() => { onClose(); go('account'); }} style={at(DRAWER_TITLE)}>
            <RefText t={D.text.title} origin={DRAWER_TITLE} as="span">ACCOUNT</RefText>
          </button>
          <span className="jrn-dr__rule" style={at(D.box.rule)} />

          <button type="button" className="jrn-dr__card" data-jrn-trigger="drawer-profile" onClick={() => { onClose(); go('account'); }} style={card(D.box.profile)}>
            <img className="jrn-dr__thumb" src={profileThumb} alt="" draggable={false} style={at(D.box.thumb, D.box.profile)} />
            <span className="jrn-dr__vr" style={at(D.box.divProfile, D.box.profile)} />
            <RefText t={D.text.profileKicker} origin={D.box.profile} as="span" className="jrn-dr__k">PROFILE</RefText>
            <RefText t={sizedType(D.text.profileTitle, s.name, FIT.name, 13)} origin={D.box.profile} as="span">{s.name}</RefText>
            <RefText t={sizedType(D.text.profileGray, email, FIT.email, 9)} origin={D.box.profile} as="span" className="jrn-dr__gray">{email}</RefText>
            <RefIcon name="arrow" box={D.box.arrowProfile} origin={D.box.profile} stroke={2.2} />
          </button>

          <button type="button" className="jrn-dr__card" data-jrn-trigger="drawer-currency" aria-label={`DISPLAY CURRENCY ${s.currency}. CHANGE`} onClick={() => setSheet('currency')} style={card(D.box.currency)}>
            <RefText t={D.text.currencyKicker} origin={D.box.currency} as="span" className="jrn-dr__k">DISPLAY CURRENCY</RefText>
            <RefText t={sizedType(D.text.currencyTitle, s.currency, FIT.currency, 16)} origin={D.box.currency} as="span">{s.currency}</RefText>
            <span className="jrn-dr__vr" style={at(D.box.divCurrency, D.box.currency)} />
            <RefText t={D.text.currencyChange} origin={D.box.currency} as="span" className="jrn-dr__k">CHANGE</RefText>
            <RefIcon name="arrow" box={D.box.arrowCurrency} origin={D.box.currency} stroke={2.2} />
          </button>

          <button type="button" className="jrn-dr__card" data-jrn-trigger="drawer-connection" aria-label={`CONNECTION ${s.connection}. SET UP`} onClick={() => { onClose(); go('money/places'); }} style={card(D.box.connection)}>
            <RefText t={D.text.connectionKicker} origin={D.box.connection} as="span" className="jrn-dr__k">CONNECTION</RefText>
            <RefText t={sizedType(D.text.connectionTitle, s.connection, FIT.connection, 15)} origin={D.box.connection} as="span">{s.connection}</RefText>
            <span className="jrn-dr__vr" style={at(D.box.divConnection, D.box.connection)} />
            <RefText t={D.text.connectionSetup} origin={D.box.connection} as="span" className="jrn-dr__k">SET UP</RefText>
            <RefIcon name="arrow" box={D.box.arrowConnection} origin={D.box.connection} stroke={2.2} />
          </button>

          <section className="jrn-dr__card" aria-label="ASK JURNL CONTEXT" style={card(D.box.ask)}>
            <RefText t={D.text.askKicker} origin={D.box.ask} as="span" className="jrn-dr__k">ASK JURNL CONTEXT</RefText>
            <RefText t={D.text.ask1} origin={D.box.ask} as="span" className="jrn-dr__gray">HELP JURNL GIVE YOU</RefText>
            <RefText t={D.text.ask2} origin={D.box.ask} as="span" className="jrn-dr__gray">PERSONALIZED INSIGHTS</RefText>
            <RefText t={D.text.ask3} origin={D.box.ask} as="span" className="jrn-dr__gray">BASED ON YOUR SPENDING,</RefText>
            <RefText t={D.text.ask4} origin={D.box.ask} as="span" className="jrn-dr__gray">PLANS AND GOALS.</RefText>
            <button type="button" role="switch" aria-checked={s.askOn} aria-label="ASK JURNL CONTEXT" className="jrn-dr__toggle" data-on={s.askOn ? 'true' : 'false'} data-jrn-trigger="drawer-ask-context" onClick={() => s.setAsk(!s.askOn)} style={at(D.box.toggle, D.box.ask)}>
              <span className="jrn-dr__knob" />
            </button>
          </section>

          <section className="jrn-dr__card" aria-label="SAFE TO SPEND BUFFER" style={card(D.box.buffer)}>
            <RefText t={D.text.bufferKicker} origin={D.box.buffer} as="label" htmlFor={bufferId} className="jrn-dr__k">SAFE TO SPEND BUFFER</RefText>
            <RefText t={D.text.buffer1} origin={D.box.buffer} as="span" className="jrn-dr__gray">AMOUNT TO KEEP AS A BUFFER</RefText>
            <RefText t={D.text.buffer2} origin={D.box.buffer} as="span" className="jrn-dr__gray">IN YOUR SAFE TO SPEND CALCULATION.</RefText>
            <span className="jrn-dr__field" style={at(D.box.bufferField, D.box.buffer)}>
              <span className="jrn-dr__money" style={{ paddingLeft: (D.text.bufferValue.left ?? 0) - D.box.bufferField[0], fontSize: D.text.bufferValue.size, letterSpacing: D.text.bufferValue.ls }}>
                {currency.symbolPosition === 'prefix' ? <span aria-hidden>{currency.symbol}</span> : null}
                <input
                  id={bufferId}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={formatAmountInput(s.buffer)}
                  data-jrn-trigger="drawer-buffer"
                  size={Math.max(1, formatAmountInput(s.buffer).length || 1)}
                  onChange={(e) => s.setBuffer(e.target.value)}
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
                />
                {currency.symbolPosition === 'suffix' ? <span aria-hidden>{currency.symbol}</span> : null}
              </span>
            </span>
            <button type="button" className="jrn-dr__save" data-jrn-trigger="drawer-buffer-save" onClick={s.saveBuffer} style={at(D.box.save, D.box.buffer)}>
              <RefText t={D.text.save} origin={D.box.save} as="span">SAVE BUFFER</RefText>
              <RefIcon name="arrow" box={D.box.saveArrow} origin={D.box.save} stroke={2} />
            </button>
          </section>

          <button type="button" className="jrn-dr__card jrn-dr__card--image" data-jrn-trigger="drawer-privacy" onClick={() => setSheet('consents')} style={card(D.box.privacy)}>
            <img className="jrn-dr__photo" src={privacyCard} alt="" draggable={false} />
            <RefText t={D.text.privacyKicker} origin={D.box.privacy} as="span" className="jrn-dr__k">PRIVACY & CONSENTS</RefText>
            <RefText t={D.text.privacy1} origin={D.box.privacy} as="span" className="jrn-dr__photo-gray">MANAGE YOUR PRIVACY</RefText>
            <RefText t={D.text.privacy2} origin={D.box.privacy} as="span" className="jrn-dr__photo-gray">SETTINGS AND DATA CONSENTS.</RefText>
            <RefIcon name="arrow" box={D.box.privacyArrow} origin={D.box.privacy} stroke={2.2} className="jrn-dr__light" />
          </button>

          <button type="button" className="jrn-dr__card" data-jrn-trigger="drawer-sign-out" onClick={() => signOut()} style={card(D.box.signout)}>
            <RefIcon name="sign-out" box={D.box.signoutIcon} origin={D.box.signout} stroke={2.6} />
            <RefText t={D.text.signout} origin={D.box.signout} as="span" className="jrn-dr__k">SIGN OUT</RefText>
            <RefIcon name="arrow" box={D.box.signoutArrow} origin={D.box.signout} stroke={2.2} />
          </button>

          <button type="button" className="jrn-dr__close" aria-label="CLOSE ACCOUNT" data-jrn-trigger="account-drawer-close" onClick={onClose} style={at(D.box.close)}>
            <RefIcon name="close" box={D.box.closeX} origin={D.box.close} stroke={2.4} />
          </button>
        </div>
      </div>
      {sheet === 'currency' ? <CurrencySheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'consents' ? <ConsentsSheet onClose={() => setSheet(null)} /> : null}
    </OverlayLayer>
  );
}
