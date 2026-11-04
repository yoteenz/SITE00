/**
 * F03 TODAY and F04 ACTIVITY.
 * Authorities are reference files. These screens paint the plates plus live type, rows, and sheets.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  EMPTY_FILTER,
  applyActivityFilter,
  deleteLedgerEntry,
  updateLedgerEntry,
  filterIsActive,
  filterSummary,
  formatMoney,
  ledgerEntries,
  useCurrency,
  safeToSpend,
  todayModeFromQuery,
  upcomingFor,
  useAddedEntries,
  entryWhenLabel,
  type ActivityFilter,
  type LedgerEntry,
  type TodayMode,
} from '../../data/home/money';
import { SIDEKICK_PLATES } from '../../data/parents/sidekickPlates';
import { RaLayer, RaPara, RaRule, RootAuthorityStage, hangY, objectTransform, spreadT, wallTransform } from '../components/RootAuthorityStage';
import { ReferenceLockup } from '../components/ReferenceLockup';
import { RefIcon, RefText, at } from '../components/ReferenceStage';
import { RA_TODAY } from '../layout/rootAuthorityLayout';
import { TODAY_SCENE, TODAY_SLIP } from '../layout/rootAuthorityScene';
import type { RefType } from '../layout/referenceLayout';
import { JURNL_FAMILY_DISCOVERY } from '../../data/foundation/familyRegistry';
import todaySlip from '../../families/F03_TODAY/ROOT_AUTHORITY/TODAY_ATTENTION_SLIP.png';
import { F04_LEDGER_PLATE } from '../../data/f04/plates';
import { useSetup } from '../../data/f02/setupDraft';
import { JurnlIcon } from '../components/icons';
import { JurnlProductNav } from '../components/ProductNav';
import { JurnlTransactionRow } from '../components/TransactionRow';
import { JurnlButton, JurnlDrawer, JurnlErrorPanel, JurnlIconButton, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';
import { accountDisplayOptions } from '../../data/foundation/accounts';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { TodayMoneySheet } from '../finance/TodayMoneySheet';
import { SpendingSheet, TransferDetailSheet } from '../finance/FinanceSheets';
import { legSettlement, transferViews, CARD_PAYMENT_STATE_LABEL, TRANSFER_STATE_LABEL } from '../../data/ledger/transferSettlement';
import { getTodayKey } from '../../data/foundation/dates';
import { computeTodayOperating } from '../../data/f03/todayOperating';
import { TXN_CLASS_LABEL, entryClass, resolveEntryAccount } from '../../data/ledger/accounting';
import { linkedEntries, removeLinkedEvent } from '../../data/ledger/ledgerOps';
import { getRepository } from '../../data/repository/deviceRepository';
import { useSearchParams } from 'react-router-dom';

function useHomeOverlay() {
  const j = useJurnl();
  const overlay = j.overlay;
  return { ...j, overlay };
}

const TL = RA_TODAY;
const TODAY_SHEET = TODAY_SCENE.objects.sheet!;
const onSheet = (t: RefType) => spreadT(t, TODAY_SHEET);
const sheetY = (y: number) => TODAY_SHEET.from[1] + (y - TODAY_SHEET.from[1]) * (TODAY_SHEET.stretch ?? 1);
/** Compact rows for the opened COMING list: pitch in sheet px, below the COMING rule. */
const OPEN_PITCH = 74;

export function TodayScreen() {
  const { go, openOverlay, closeOverlay, overlay, forcedState } = useHomeOverlay();
  useAddedEntries();
  useCurrency();
  const draft = useSetup();
  const mode: TodayMode = todayModeFromQuery(forcedState, draft);
  const signal = safeToSpend(draft);
  // The reference sheet holds two COMING rows and two MOVED rows; MORE opens the rest of COMING on the same sheet.
  const upcoming = upcomingFor(draft).slice(0, mode === 'EMPTY' ? 0 : 2);
  const recent = ledgerEntries().slice(0, 2);
  const [openUpcoming, setOpenUpcoming] = useState(false);
  const showSignal = mode === 'CONNECTED' || mode === 'CAUGHT_UP' || mode === 'ATTENTION' || mode === 'STALE';
  // The slip states a real, counted fact (bills due this week, an overdue bill, a card payment) — never fixed text.
  const operating = showSignal ? computeTodayOperating() : null;
  const attention =
    mode === 'CAUGHT_UP' ? 'ALL CAUGHT UP'
    : mode === 'STALE' ? 'THIS READING IS STALE'
    : operating?.attention ?? (mode === 'ATTENTION' ? 'NOTHING IS DUE THIS WEEK' : null);
  const basisLine = signal.cashSource === 'MOCK' ? 'SAMPLE NUMBERS. ADD ACCOUNTS.' : 'FROM BALANCES YOU ENTERED.';
  const W = TL.wall.text;
  const S = TL.sheet;
  const rows = S.text;
  const slot = [
    { n: rows.n1, w: rows.w1, a: rows.a1 },
    { n: rows.n2, w: rows.w2, a: rows.a2 },
  ];
  const moved = [
    { n: rows.n3, w: rows.w3, a: rows.a3 },
    { n: rows.n4, w: rows.w4, a: rows.a4 },
  ];
  const openList = upcomingFor(draft).slice(0, 5);
  const footer = JURNL_FAMILY_DISCOVERY.F03 ?? [];
  const why = TL.wall.box.why;

  return (
    <RootAuthorityStage
      screenId="F03.00"
      plate={SIDEKICK_PLATES.F03}
      framing={TODAY_SCENE.framing}
      nav={<JurnlProductNav marks="parent" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'see-why' ? <TodayMoneySheet onClose={closeOverlay} /> : null}
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F03" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F03" nodeId="F03.00" onClose={closeOverlay} /> : null}
          {overlay === 'today-more' ? <TodayMoreSheet onClose={closeOverlay} onAsk={() => openOverlay('ask')} /> : null}
        </>
      }
    >
      {(fit) => (
        <>
          <RaLayer transform={wallTransform(fit, 0, 0)} className="jrn-ra__layer--top">
            <ReferenceLockup L={{ box: { sprig: TL.wall.box.sprig, word: TL.wall.box.word }, text: { desc1: W.desc1, desc2: W.desc2 } }} />
          </RaLayer>

          {/* Headline and signal hang from the clipboard: the reference keeps SEE WHY just above the clip. */}
          <RaLayer
            transform={wallTransform(fit, 0, hangY(fit, TODAY_SCENE.hang))}
            data-jrn-zone="intro"
            data-jrn-state={mode.toLowerCase()}
            data-jrn-signal="safe-to-spend"
            aria-label="TODAY"
          >
            <RefText t={W.kicker} as="h1">TODAY</RefText>
            <RefText t={W.head} as="p">YOUR MONEY.</RefText>
            {showSignal ?
              <div data-jrn-panel="signal">
                <RefText t={W.label} as="p">SAFE TO SPEND</RefText>
                <RefText t={W.amount} as="p">{formatMoney(signal.value)}</RefText>
                <RefText t={W.status} as="p">{basisLine}</RefText>
                <button type="button" className="jrn-ra__cta" data-jrn-trigger="today-why" onClick={() => openOverlay('see-why')} style={at(why)}>
                  <RefText t={W.why} origin={why} as="span">SEE WHY</RefText>
                  <span className="jrn-ra__cta-div" aria-hidden style={at(TL.wall.box.whyDiv, why)} />
                  <RefIcon name="arrow" box={TL.wall.box.whyArrow} origin={why} stroke={2} />
                </button>
              </div>
            : null}
            {attention ?
              <div className="jrn-ra__slip" data-jrn-trigger="today-attention">
                <img className="jrn-ra__img" src={todaySlip} alt="" draggable={false} style={{ left: TODAY_SLIP.box[0], top: TODAY_SLIP.box[1], width: TODAY_SLIP.box[2] - TODAY_SLIP.box[0], height: TODAY_SLIP.box[3] - TODAY_SLIP.box[1] }} />
                <div className="jrn-ra__layer" style={{ transform: `translate(${TODAY_SLIP.turn.at[0]}px, ${TODAY_SLIP.turn.at[1]}px) rotate(${TODAY_SLIP.turn.deg}deg) translate(${-TODAY_SLIP.turn.at[0]}px, ${-TODAY_SLIP.turn.at[1]}px)` }}>
                  <RefText t={TL.slip.text.note} as="p">{`${attention}.`}</RefText>
                  {mode === 'STALE' ?
                    <button type="button" className="jrn-ra__hit" data-jrn-trigger="today-refresh" onClick={() => go('F03')} style={at([TL.slip.box.noteRule[0] - 20, TL.slip.box.noteRule[1] - 14, TL.slip.box.noteRule[2] + 40, TL.slip.box.noteRule[3] + 22])}>
                      <RefText t={{ ...TL.slip.text.note, size: 15, ls: 4, top: 7, left: 20 }} as="span">REFRESH</RefText>
                    </button>
                  : <RaRule from={[TL.slip.box.noteRule[0], TL.slip.box.noteRule[1] + 1.5]} to={[TL.slip.box.noteRule[2], TL.slip.box.noteRule[1] + 1.5]} soft />}
                </div>
              </div>
            : null}
          </RaLayer>

          {/* The clipboard sheet: reference 01's sheet straightened, turned and scaled onto the shell's sheet. */}
          <RaLayer transform={objectTransform(fit, TODAY_SHEET)} data-jrn-zone="content-rail" data-jrn-rhythm={openUpcoming ? 'sequence' : 'rest'}>
            {mode === 'LOADING' ? <RefText t={onSheet(rows.coming)} as="p" data-jrn-state="loading">READING TODAY</RefText> : null}
            {mode === 'ERROR' ?
              <div data-testid="today-error">
                <RefText t={onSheet(rows.n1)} as="p">COULD NOT READ TODAY</RefText>
                <RaPara t={onSheet(rows.w1)} width={560} className="jrn-ra__soft">THE HOME IS STILL HERE. TRY THE READING AGAIN.</RaPara>
                <button type="button" className="jrn-ra__line" data-jrn-trigger="today-retry" onClick={() => go('F03')} style={at([rows.n2.left, sheetY(1086), rows.n2.left + 260, sheetY(1086) + 70])}>
                  <RefText t={{ ...rows.more, top: 24, left: 70 }} as="span">RETRY</RefText>
                </button>
              </div>
            : null}
            {mode === 'EMPTY' ?
              <div data-jrn-trigger="today-empty">
                <RefText t={onSheet(rows.n1)} as="p">NO ACCOUNTS YET</RefText>
                <RaPara t={onSheet(rows.w1)} width={560} className="jrn-ra__soft">THIS HOME NEEDS A MONEY SOURCE. NOTHING HERE IS A BALANCE.</RaPara>
                <button type="button" className="jrn-ra__line" data-jrn-trigger="today-empty-setup" onClick={() => go('F02.02')} style={at([rows.n2.left, sheetY(1086), rows.n2.left + 420, sheetY(1086) + 70])}>
                  <RefText t={{ ...rows.more, top: 24, left: 46 }} as="span">RETURN TO ACCOUNTS</RefText>
                </button>
              </div>
            : null}
            {showSignal || mode === 'PARTIAL' ?
              <>
                <RefText t={onSheet(rows.coming)} as="p">COMING</RefText>
                <RaRule from={[S.box.comingRule[0], sheetY(S.box.comingRule[1]) + 1.5]} to={[S.box.comingRule[2], sheetY(S.box.comingRule[1]) + 1.5]} />
                {openUpcoming ?
                  openList.map((item, i) => {
                    const top = sheetY(rows.n1.top) + i * OPEN_PITCH;
                    return (
                      <div key={item.id} data-jrn-row={item.id}>
                        <RefText t={{ ...rows.n1, top }} as="span">{item.name}</RefText>
                        <RefText t={{ ...rows.w1, top: top + 30, size: 15 }} as="span" className="jrn-ra__soft">{`${item.when} · ${item.kindLabel ?? item.kind}`}</RefText>
                        <RefText t={{ ...rows.a1, size: 30, top: top + 2, left: 410 }} as="b">{item.amount ? formatMoney(item.amount) : '—'}</RefText>
                      </div>
                    );
                  })
                : upcoming.map((item, i) => (
                    <div key={item.id} data-jrn-row={item.id}>
                      <RefText t={onSheet(slot[i]!.n)} as="span">{item.name}</RefText>
                      <RefText t={onSheet(slot[i]!.w)} as="span" className="jrn-ra__soft">{`${item.when} · ${item.kindLabel ?? item.kind}`}</RefText>
                      <RefText t={onSheet(slot[i]!.a)} as="b">{item.amount ? formatMoney(item.amount) : '—'}</RefText>
                    </div>
                  ))}
                {!openUpcoming && upcoming.length > 1 ? <RaRule from={[S.box.rule1[0], sheetY(S.box.rule1[1]) + 3]} to={[S.box.rule1[2], sheetY(S.box.rule1[1]) + 3]} soft /> : null}
                {!upcoming.length && mode === 'PARTIAL' ? <RefText t={onSheet(rows.w1)} as="p" className="jrn-ra__soft">NO OBLIGATIONS YET</RefText> : null}
                {!upcoming.length && showSignal ?
                  <div data-testid="today-coming-empty">
                    <RefText t={onSheet(rows.n1)} as="span">NO BILLS ADDED</RefText>
                    <RefText t={onSheet(rows.w1)} as="span" className="jrn-ra__soft">ADD ONE IN UPCOMING</RefText>
                  </div>
                : null}
                <button type="button" className="jrn-ra__hit" data-jrn-role="panel_header_action" data-jrn-trigger="today-upcoming" data-expanded={openUpcoming ? 'true' : undefined} onClick={() => setOpenUpcoming((v) => !v)} style={at([rows.more.ink[0] - 14, sheetY(rows.more.ink[1]) - 16, S.box.moreArrow[2] + 14, sheetY(rows.more.ink[1]) + 32])}>
                  <RefText t={{ ...rows.more, top: 16 - (rows.more.ink[1] - rows.more.top), left: 14 }} as="span">{openUpcoming ? 'LESS' : 'MORE'}</RefText>
                  <RefIcon name="arrow" box={[S.box.moreArrow[0] - rows.more.ink[0] + 14, 18, S.box.moreArrow[2] - rows.more.ink[0] + 14, 32]} stroke={2} />
                </button>
                <RaRule from={[S.box.vdiv[0] + 2, sheetY(S.box.vdiv[1])]} to={[S.box.vdiv[2] - 2, sheetY(S.box.vdiv[3])]} soft />
                {mode === 'PARTIAL' ?
                  <div data-jrn-trigger="today-partial">
                    <RefText t={onSheet(rows.moved)} as="p">STILL LEARNING</RefText>
                    <RaPara t={onSheet(rows.w3)} width={230} className="jrn-ra__soft">{draft.accounts === 'SKIPPED' ? 'ACCOUNTS WERE SKIPPED.' : 'INCOME IS STILL QUIET.'}</RaPara>
                    <RaPara t={{ ...onSheet(rows.w4), top: sheetY(rows.w4.top) - 40 }} width={230} className="jrn-ra__soft">SAFE TO SPEND STAYS UNSTATED UNTIL THOSE FACTS EXIST.</RaPara>
                  </div>
                : null}
                {showSignal ?
                  <>
                    <RefText t={onSheet(rows.moved)} as="p">MOVED</RefText>
                    <RaRule from={[S.box.movedRule[0], sheetY(S.box.movedRule[1]) + 1.5]} to={[S.box.movedRule[2], sheetY(S.box.movedRule[1]) + 1.5]} />
                    {recent.map((entry, i) => (
                      <button key={entry.id} type="button" className="jrn-ra__hit" data-jrn-trigger={`tx-${entry.id}`} data-jrn-tx={entry.id} data-direction={entry.direction} data-status={entry.status} onClick={() => go('F04')} style={at([moved[i]!.n.ink[0] - 12, sheetY(moved[i]!.n.ink[1]) - 12, S.box.rule2[2], sheetY(moved[i]!.a.ink[3]) + 12])}>
                        <RefText t={{ ...moved[i]!.n, left: 12, top: 12 - (moved[i]!.n.ink[1] - moved[i]!.n.top) }} as="span">{entry.merchant}</RefText>
                        <RefText t={{ ...moved[i]!.w, left: 12 + moved[i]!.w.left! - moved[i]!.n.ink[0], top: sheetY(moved[i]!.w.top) - sheetY(moved[i]!.n.ink[1]) + 12 }} as="span" className="jrn-ra__soft">{entryWhenLabel(entry)}</RefText>
                        <RefText t={{ ...moved[i]!.a, left: 12 + moved[i]!.a.left! - moved[i]!.n.ink[0], top: sheetY(moved[i]!.a.top) - sheetY(moved[i]!.n.ink[1]) + 12 }} as="b">{formatMoney(entry.amount, entry.direction === 'INCOME')}</RefText>
                      </button>
                    ))}
                    {recent.length > 1 ? <RaRule from={[S.box.rule2[0], sheetY(S.box.rule2[1]) + 3]} to={[S.box.rule2[2], sheetY(S.box.rule2[1]) + 3]} soft /> : null}
                    <button type="button" className="jrn-ra__hit" data-jrn-role="panel_header_action" data-jrn-trigger="today-activity" onClick={() => go('F04')} style={at([rows.activity.ink[0] - 14, sheetY(rows.activity.ink[1]) - 16, S.box.activityArrow[2] + 14, sheetY(rows.activity.ink[1]) + 32])}>
                      <RefText t={{ ...rows.activity, top: 16 - (rows.activity.ink[1] - rows.activity.top), left: 14 }} as="span">ACTIVITY</RefText>
                      <RefIcon name="arrow" box={[S.box.activityArrow[0] - rows.activity.ink[0] + 14, 18, S.box.activityArrow[2] - rows.activity.ink[0] + 14, 32]} stroke={2} />
                    </button>
                  </>
                : null}
                <RaRule from={[S.box.footRule[0], sheetY(1325)]} to={[S.box.footRule[2], sheetY(1325)]} soft />
                <nav aria-label="ALSO TODAY" data-jrn-zone="discovery">
                  {footer.map((link, i) => {
                    const t = i === 0 ? rows.f1 : rows.f2;
                    return (
                      <button key={link.targetFamily} type="button" className="jrn-ra__hit" data-jrn-role="panel_header_action" data-jrn-trigger={`discovery-F03-${link.targetFamily}`} onClick={() => go(link.targetFamily)} style={at([t.ink[0] - 16, sheetY(t.ink[1]) - 16, t.ink[2] + 16, sheetY(t.ink[1]) + 30])}>
                        <RefText t={{ ...t, left: 16, top: 16 - (t.ink[1] - t.top) }} as="span">{link.label}</RefText>
                      </button>
                    );
                  })}
                  {/* MORE was printed text with nothing behind it; it now opens the rest of TODAY (incl. ASK JURNL). */}
                  <button type="button" className="jrn-ra__hit" data-jrn-role="panel_header_action" data-jrn-trigger="today-more" onClick={() => openOverlay('today-more')} style={at([rows.f3.ink[0] - 16, sheetY(rows.f3.ink[1]) - 16, rows.f3.ink[2] + 16, sheetY(rows.f3.ink[1]) + 30])}>
                    <RefText t={{ ...rows.f3, left: 16, top: 16 - (rows.f3.ink[1] - rows.f3.top) }} as="span">MORE</RefText>
                  </button>
                  <RaRule from={[S.box.fdiv1[0] + 1, sheetY(S.box.fdiv1[1])]} to={[S.box.fdiv1[0] + 1, sheetY(S.box.fdiv1[3])]} soft />
                  <RaRule from={[S.box.fdiv2[0] + 1, sheetY(S.box.fdiv2[1])]} to={[S.box.fdiv2[0] + 1, sheetY(S.box.fdiv2[3])]} soft />
                </nav>
              </>
            : null}
          </RaLayer>
        </>
      )}
    </RootAuthorityStage>
  );
}

/** TODAY → MORE: the actions that do not fit on the clipboard sheet. */
function TodayMoreSheet({ onClose, onAsk }: { onClose: () => void; onAsk: () => void }) {
  const { go } = useJurnl();
  const links: [string, string, string, Record<string, string>?][] = [
    ['today-more-earnings', 'ADD DAILY EARNINGS', 'income', { add: 'earnings' }],
    ['today-more-spending', 'RECORD SPENDING', 'activity', { record: 'spending' }],
    ['today-more-move', 'MOVE MONEY', 'money/places', { move: '' }],
    ['today-more-subscriptions', 'SUBSCRIPTIONS', 'upcoming/subscriptions'],
    ['today-more-credit', 'CREDIT CARDS', 'credit'],
  ];
  return (
    <JurnlDrawer expression="detail" size="long" testId="today-more" title="MORE" onClose={onClose}>
      <JurnlButton variant="secondary" trigger="today-ask" onClick={onAsk}>ASK JURNL</JurnlButton>
      {links.map(([trigger, label, route, query]) => (
        <JurnlButton key={trigger} variant="secondary" trigger={trigger} onClick={() => { onClose(); go(route, query); }}>{label}</JurnlButton>
      ))}
    </JurnlDrawer>
  );
}

/** @deprecated import QuickAddV2Sheet — kept for parent imports during Wave 1. */

/** @deprecated import QuickAddV2Sheet — kept for parent imports during Wave 1. */
export function QuickAddSheet({ onClose, familyId = 'F04' }: { onClose: () => void; familyId?: string }) {
  return <QuickAddV2Sheet familyId={familyId} onClose={onClose} />;
}

export function AskSheet({ onClose, familyId = 'F03', nodeId = 'F03.00' }: { onClose: () => void; familyId?: string; nodeId?: string }) {
  return <AskJurnlSheet familyId={familyId} nodeId={nodeId} onClose={onClose} />;
}

export function ActivityScreen() {
  const { go, back, hasPrevious, openOverlay, closeOverlay, overlay, forcedState } = useHomeOverlay();
  const added = useAddedEntries();
  useCurrency();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>(EMPTY_FILTER);
  const [selected, setSelected] = useState<LedgerEntry | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 160);
    return () => window.clearTimeout(id);
  }, [query]);
  const mode = (forcedState ?? '').toLowerCase();
  const entries = useMemo(() => ledgerEntries(), [added]);
  const [params] = useSearchParams();
  useEffect(() => {
    // TODAY's "RECORD SPENDING" step opens the sheet once on arrival.
    if (params.get('record') === 'spending') openOverlay('spend');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const active = { ...filter, query: mode === 'no_results' ? 'ZZZZ' : debounced };
  const shown = mode === 'empty' ? [] : applyActivityFilter(entries, active);
  const summary = filterSummary(filter);

  return (
    <JurnlScreen screenId="F04.00" familyPlate={F04_LEDGER_PLATE} productNav>
      <div className="jrn-act" data-jrn-state={mode || 'connected'} data-jrn-expression={query ? 'investigative' : 'ledger'}>
        <div className="jrn-home__top" data-jrn-zone="chrome">
          <JurnlIconButton icon="back" label={hasPrevious ? 'BACK' : 'BACK TO TODAY'} trigger="activity-back" onClick={() => { if (!back()) go('F03'); }} />
          <span className="jrn-home__mark">JURNL</span>
          <JurnlIconButton icon="gear" label="ACCOUNT" trigger="activity-account" onClick={() => go('account')} />
          <JurnlIconButton icon="info" label="ASK JURNL" trigger="activity-ask" onClick={() => openOverlay('ask')} />
        </div>
        <div className="jrn-home__intro" data-jrn-zone="intro">
          <h1 className="jrn-home__h jrn-home__h--act">ACTIVITY</h1>
          <p className="jrn-home__sub">RECENT TRANSACTIONS.</p>
        </div>
        <div className="jrn-act__stage" data-jrn-zone="content-rail">
        <div className="jrn-act__tools">
          <JurnlInput label="SEARCH" value={query} onValue={setQuery} icon="search" trigger="activity-search" />
          <JurnlButton variant="utility" icon={<JurnlIcon name="filter" size={14} />} trigger="activity-filter" onClick={() => openOverlay('filter')}>
            FILTER
          </JurnlButton>
          <JurnlButton variant="utility" icon={<JurnlIcon name="plus" size={14} />} trigger="activity-record-spending" onClick={() => openOverlay('spend')}>
            SPENDING
          </JurnlButton>
        </div>
        {query ? (
          <p className="jrn-act__query" data-jrn-trigger="activity-query">
            <span>LOOKING FOR {query.toUpperCase()}</span>
            <JurnlButton variant="inline" trigger="activity-clear-search" onClick={() => setQuery('')}>
              CLEAR SEARCH
            </JurnlButton>
          </p>
        ) : null}
        {summary ? (
          <p className="jrn-act__filters" data-jrn-trigger="activity-filter-state">
            <span>{summary}</span>
            <JurnlButton variant="inline" trigger="activity-clear-filter" onClick={() => setFilter(EMPTY_FILTER)}>
              CLEAR FILTERS
            </JurnlButton>
          </p>
        ) : null}
        {mode === 'loading' ? <p className="jrn-home__wait" data-jrn-state="loading">READING ACTIVITY</p> : null}
        {mode === 'error' ? (
          <JurnlErrorPanel block testId="activity-error" title="COULD NOT READ ACTIVITY" body="THE LEDGER IS STILL HERE." action={{ label: 'RETRY', trigger: 'activity-retry', onClick: () => go('F04') }} />
        ) : null}
        {mode !== 'loading' && mode !== 'error' ? (
          <JurnlPanel role="ledger" className="jrn-ledger" data-jrn-zone="ledger">
            {mode !== 'empty' && shown.length > 0 ? <p className="jrn-ledger__count">{shown.length} {shown.length === 1 ? 'TRANSACTION' : 'TRANSACTIONS'}</p> : null}
            {mode === 'empty' ? (
              <div className="jrn-ledger__empty" data-jrn-panel="empty" data-jrn-trigger="activity-empty">
                <b>NO TRANSACTIONS YET</b>
                <p>RECORD SPENDING, INCOME OR A TRANSFER TO SEE IT HERE.</p>
              </div>
            ) : null}
            {mode !== 'empty' && shown.length === 0 ? (
              <div className="jrn-ledger__empty" data-jrn-panel="empty" data-jrn-trigger="activity-none">
                <b>NO MATCHES</b>
                <p>NO TRANSACTION MATCHES THIS SEARCH OR FILTER.</p>
                {query ? (
                  <button type="button" className="jrn-btn jrn-btn--secondary" data-jrn-trigger="activity-clear-search-empty" onClick={() => setQuery('')}>
                    CLEAR SEARCH
                  </button>
                ) : null}
                {filterIsActive(filter) ? (
                  <button type="button" className="jrn-btn jrn-btn--secondary" data-jrn-trigger="activity-clear-filter-empty" onClick={() => setFilter(EMPTY_FILTER)}>
                    CLEAR FILTERS
                  </button>
                ) : null}
              </div>
            ) : null}
            {shown.length > 0 ? (
              <ul className="jrn-act__list" aria-label="ACTIVITY">
                {shown.map((entry) => (
                  <li key={entry.id}>
                    <JurnlTransactionRow
                      entry={entry}
                      onOpen={(item) => {
                        setSelected(item);
                        openOverlay('detail');
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </JurnlPanel>
        ) : null}
        </div>
        <JurnlProductNav current="ACTIVITY" onGo={go} onAdd={() => openOverlay('quick-add')} />
      </div>
      {overlay === 'filter' ? <FilterSheet filter={filter} onChange={setFilter} onClose={closeOverlay} /> : null}
      {overlay === 'detail' && selected ? (
        <DetailSheet
          entry={selected}
          onClose={closeOverlay}
          onUpdated={(next) => setSelected(next)}
          onDeleted={() => {
            setSelected(null);
            closeOverlay();
          }}
        />
      ) : null}
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F04" onClose={closeOverlay} /> : null}
      {overlay === 'spend' ? <SpendingSheet onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F04" nodeId="F04.00" onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

function FilterSheet({ filter, onChange, onClose }: { filter: ActivityFilter; onChange: (next: ActivityFilter) => void; onClose: () => void }) {
  const accounts = useMemo(() => ['ALL', ...accountDisplayOptions().map((a) => a.id)], []);
  const directions = ['ALL', 'INCOME', 'EXPENSE'] as const;
  const statuses = ['ALL', 'PENDING', 'CLEARED'] as const;
  const whens = ['ALL', 'YESTERDAY', 'FRIDAY', 'THURSDAY', 'MONDAY', 'TODAY'];
  return (
    <JurnlDrawer
      expression="filter"
      size="long"
      testId="activity-filter-sheet"
      title="FILTER"
      lead="SHOWS FEWER TRANSACTIONS. NOTHING IS CHANGED OR DELETED."
      onClose={onClose}
      footer={
        <JurnlButton variant="secondary" trigger="activity-filter-reset" onClick={() => onChange(EMPTY_FILTER)}>
          CLEAR
        </JurnlButton>
      }
    >
      <fieldset className="jrn-filter">
        <legend>ACCOUNT</legend>
        {accounts.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.account === item} data-active={filter.account === item ? 'true' : 'false'} onClick={() => onChange({ ...filter, account: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>DIRECTION</legend>
        {directions.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.direction === item} data-active={filter.direction === item ? 'true' : 'false'} onClick={() => onChange({ ...filter, direction: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>STATUS</legend>
        {statuses.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.status === item} data-active={filter.status === item ? 'true' : 'false'} onClick={() => onChange({ ...filter, status: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>WHEN</legend>
        {whens.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.when === item} data-active={filter.when === item ? 'true' : 'false'} onClick={() => onChange({ ...filter, when: item })}>
            {item}
          </button>
        ))}
      </fieldset>
    </JurnlDrawer>
  );
}

const CONFIRMATION_LABEL: Record<string, string> = {
  RECORDED_BY_YOU: 'RECORDED BY YOU · NOT CONFIRMED BY A BANK',
  PENDING_CONFIRMATION: 'RECORDED BY YOU · STILL ON ITS WAY',
  BANK_CONFIRMED: 'CONFIRMED BY YOUR BANK',
  SAMPLE: 'SAMPLE ENTRY',
};

const OWNER_OF: Record<string, { label: string; route: (e: LedgerEntry) => string }> = {
  DAILY_EARNINGS: { label: 'CHANGE THIS IN INCOME', route: () => 'income' },
  BILL_PAYMENT: { label: 'CHANGE THIS ON THE BILL', route: (e) => `upcoming/${e.obligation_id ?? ''}` },
  CARD_PAYMENT: { label: 'OPEN THE CARD', route: (e) => `credit/${e.counterparty_account_id && e.link?.leg === 'OUT' ? e.counterparty_account_id : e.account_id ?? ''}` },
  TRANSFER: { label: 'OPEN POCKETS', route: () => 'money/places' },
  BALANCE_CORRECTION: { label: 'OPEN THE ACCOUNT', route: (e) => `money/places/${e.account_id ?? ''}` },
};

function DetailSheet({
  entry,
  onClose,
  onUpdated,
  onDeleted,
}: {
  entry: LedgerEntry;
  onClose: () => void;
  onUpdated: (next: LedgerEntry) => void;
  onDeleted: () => void;
}) {
  useCurrency();
  const { go } = useJurnl();
  const accounts = getRepository().listAccounts();
  const account = resolveEntryAccount(entry, accounts);
  const cls = entryClass(entry, account);
  // Linked entries belong to one event (a day of earnings, a transfer, a bill payment): change them where they were made.
  const linkKind = entry.link?.kind ?? null;
  const owner = linkKind ? OWNER_OF[linkKind] : null;
  const editable = entry.source === 'ADDED' && !linkKind;
  const removableTogether = entry.source === 'ADDED' && (linkKind === 'TRANSFER' || linkKind === 'CARD_PAYMENT' || linkKind === 'BALANCE_CORRECTION');
  const [mode, setMode] = useState<'view' | 'edit' | 'delete' | 'transfer'>('view');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [merchant, setMerchant] = useState(entry.merchant);
  const [amount, setAmount] = useState(String(entry.amount));
  const [account2, setAccount] = useState(entry.account);
  const accountOptions = useMemo(() => accountDisplayOptions(), []);
  const legs = linkedEntries(getRepository().listTransactions(), entry).filter((e) => e.id !== entry.id);
  const rows: [string, string][] = [
    ['WHAT', entry.merchant],
    ['AMOUNT', formatMoney(entry.amount, entry.direction === 'INCOME')],
    ['TYPE', TXN_CLASS_LABEL[cls]],
    ['WHEN', entryWhenLabel(entry)],
    ['ACCOUNT', account?.display_name ?? `${entry.account || 'NONE'} (NOT FOUND)`],
    ['CATEGORY', entry.category],
    ['STATUS', (() => {
      if (entry.link && (linkKind === 'TRANSFER' || linkKind === 'CARD_PAYMENT')) {
        const v = transferViews(getRepository().listTransactions(), getTodayKey()).find((x) => x.linkId === entry.link!.id);
        if (v) return (linkKind === 'CARD_PAYMENT' ? CARD_PAYMENT_STATE_LABEL : TRANSFER_STATE_LABEL)[v.state];
      }
      return legSettlement(entry, getTodayKey()) === 'SCHEDULED' ? 'SCHEDULED' : entry.status === 'PENDING' ? 'PENDING' : 'CLEARED';
    })()],
    ['SOURCE', entry.source === 'MOCK' ? CONFIRMATION_LABEL.SAMPLE : 'RECORDED BY YOU · NOT CONFIRMED BY A BANK'],
  ];
  if (entry.memo) rows.push(['NOTE', entry.memo]);
  if (entry.recurring) rows.push(['REPEATS', 'YES']);
  for (const l of legs) rows.push(['OTHER SIDE', `${l.merchant} · ${formatMoney(l.amount, l.direction === 'INCOME')} · ${resolveEntryAccount(l, accounts)?.display_name ?? l.account}`]);
  if (cls === 'TRANSFER' || cls === 'CREDIT_PAYMENT') rows.push(['COUNTS AS', 'NOT INCOME AND NOT SPENDING']);
  if (cls === 'ADJUSTMENT') rows.push(['COUNTS AS', 'A BALANCE CORRECTION. NOT INCOME OR SPENDING.']);

  if (mode === 'transfer' && entry.link) {
    return <TransferDetailSheet linkId={entry.link.id} onClose={() => setMode('view')} />;
  }

  if (mode === 'delete') {
    return (
      <JurnlDrawer
        expression="confirmation"
        size="long"
        testId="activity-delete"
        title={removableTogether ? 'REMOVE BOTH SIDES?' : 'DELETE TRANSACTION'}
        lead={removableTogether ? 'THIS REMOVES THE WHOLE TRANSFER. BOTH ACCOUNTS GO BACK TO WHAT THEY WERE.' : 'THIS REMOVES THE ENTRY YOU ADDED. THE ACCOUNT BALANCE CHANGES BACK.'}
        onClose={() => setMode('view')}
        footer={
          <>
            {deleteError ? <p className="jrn-field__error" role="alert">{deleteError}</p> : null}
            <JurnlButton trigger="activity-delete-confirm" onClick={() => {
              if (removableTogether && entry.link) {
                const r = removeLinkedEvent(entry.link.id);
                if (r.ok) onDeleted();
                else setDeleteError(r.error);
                return;
              }
              if (deleteLedgerEntry(entry.id)) onDeleted();
            }}>
              DELETE
            </JurnlButton>
            <JurnlButton variant="secondary" trigger="activity-delete-cancel" onClick={() => setMode('view')}>
              CANCEL
            </JurnlButton>
          </>
        }
      >
        <p className="jrn-currency__note">{entry.merchant} · {formatMoney(entry.amount)}</p>
      </JurnlDrawer>
    );
  }

  if (mode === 'edit' && editable) {
    return (
      <JurnlDrawer
        expression="form"
        size="long"
        testId="activity-edit"
        title="EDIT TRANSACTION"
        lead="ONLY ENTRIES YOU ADDED CAN CHANGE."
        onClose={() => setMode('view')}
        footer={
          <JurnlButton
            trigger="activity-edit-save"
            disabled={merchant.trim().length === 0 || !/^\d+(\.\d{1,2})?$/.test(amount.trim())}
            onClick={() => {
              const next = updateLedgerEntry(entry.id, {
                merchant: merchant.trim().toUpperCase(),
                amount: Number(amount),
                account: account2,
              });
              if (next) {
                onUpdated(next);
                setMode('view');
              }
            }}
          >
            SAVE
          </JurnlButton>
        }
      >
        <JurnlInput label="WHAT WAS IT FOR?" value={merchant} onValue={setMerchant} trigger="activity-edit-merchant" />
        <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="activity-edit-amount" inputMode="decimal" />
        <div className="jrn-home__choices" role="group" aria-label="ACCOUNT">
          {accountOptions.map((item) => (
            <button key={item.id} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={account2 === item.id} data-active={account2 === item.id ? 'true' : 'false'} onClick={() => setAccount(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </JurnlDrawer>
    );
  }

  return (
    <JurnlDrawer
      expression="detail"
      size="long"
      testId="activity-detail"
      title={entry.merchant}
      lead={entry.obligation_id ? 'A PAYMENT TOWARD A BILL. THE BILL ITSELF LIVES IN UPCOMING.' : 'ONE TRANSACTION.'}
      onClose={onClose}
      footer={
        editable ?
          <>
            <JurnlButton variant="secondary" trigger="activity-edit" onClick={() => setMode('edit')}>
              EDIT
            </JurnlButton>
            <JurnlButton variant="secondary" trigger="activity-delete" onClick={() => setMode('delete')}>
              DELETE
            </JurnlButton>
          </>
        : owner && entry.source === 'ADDED' ?
          <>
            {linkKind === 'TRANSFER' || linkKind === 'CARD_PAYMENT' ? (
              <JurnlButton variant="secondary" trigger="activity-open-transfer" onClick={() => setMode('transfer')}>
                {linkKind === 'CARD_PAYMENT' ? 'PAYMENT STATUS' : 'TRANSFER STATUS'}
              </JurnlButton>
            ) : null}
            <JurnlButton variant="secondary" trigger="activity-open-owner" onClick={() => { onClose(); go(owner.route(entry)); }}>
              {owner.label}
            </JurnlButton>
            {removableTogether ? (
              <JurnlButton variant="secondary" trigger="activity-delete" onClick={() => setMode('delete')}>
                DELETE BOTH SIDES
              </JurnlButton>
            ) : null}
          </>
        : undefined
      }
    >
      <ul className="jrn-why">
        {rows.map(([label, value]) => (
          <li key={label + value}>
            <span>{label}</span>
            <b>{value}</b>
          </li>
        ))}
        {entry.related ? (
          <li>
            <span>RELATED</span>
            <b>
              {entry.related.kind} · {entry.related.name}
            </b>
          </li>
        ) : null}
      </ul>
      {entry.source !== 'ADDED' ? <p className="jrn-currency__note">SAMPLE ENTRIES CANNOT BE CHANGED.</p> : null}
    </JurnlDrawer>
  );
}
