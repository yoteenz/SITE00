/**
 * F03 TODAY and F04 ACTIVITY.
 * Authorities are reference files. These screens paint the plates plus live type, rows, and sheets.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  EMPTY_FILTER,
  addLedgerEntry,
  applyActivityFilter,
  filterIsActive,
  formatMoney,
  ledgerEntries,
  safeToSpend,
  todayModeFromQuery,
  upcomingFor,
  useAddedEntries,
  type ActivityFilter,
  type LedgerEntry,
  type TodayMode,
} from '../../data/home/money';
import { F03_DAY_PLATE } from '../../data/f03/plates';
import { F04_LEDGER_PLATE } from '../../data/f04/plates';
import { useSetup } from '../../data/f02/setupDraft';
import { JurnlIcon } from '../components/icons';
import { JurnlProductNav } from '../components/ProductNav';
import { JurnlTransactionRow } from '../components/TransactionRow';
import { JurnlButton, JurnlDrawer, JurnlErrorPanel, JurnlIconButton, JurnlInput } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function useHomeOverlay() {
  const j = useJurnl();
  const overlay = j.overlay;
  return { ...j, overlay };
}

export function TodayScreen() {
  const { go, openOverlay, closeOverlay, overlay, forcedState } = useHomeOverlay();
  useAddedEntries();
  const draft = useSetup();
  const mode: TodayMode = todayModeFromQuery(forcedState, draft);
  const signal = safeToSpend(draft);
  const upcoming = upcomingFor(draft).slice(0, mode === 'EMPTY' ? 0 : 3);
  const recent = ledgerEntries().slice(0, 2);
  const [openUpcoming, setOpenUpcoming] = useState(false);
  const showSignal = mode === 'CONNECTED' || mode === 'CAUGHT_UP' || mode === 'ATTENTION' || mode === 'STALE';
  const attention =
    mode === 'CAUGHT_UP' ? 'ALL CAUGHT UP'
    : mode === 'ATTENTION' || (showSignal && upcoming.some((item) => item.name === 'RENT')) ? 'RENT IS CLOSE'
    : mode === 'STALE' ? 'THIS READING IS STALE'
    : null;

  return (
    <JurnlScreen screenId="F03.00" familyPlate={F03_DAY_PLATE} family>
      <div className="jrn-home" data-jrn-state={mode.toLowerCase()} data-jrn-signal="safe-to-spend">
        <div className="jrn-home__top">
          <JurnlIconButton icon="back" label="BACK TO SETUP" trigger="today-back" onClick={() => go('F02.08')} />
          <span className="jrn-home__mark">JURNL</span>
          <JurnlIconButton icon="info" label="ASK JURNL" trigger="today-ask" onClick={() => openOverlay('ask')} />
        </div>
        <h1 className="jrn-home__h">TODAY</h1>
        <p className="jrn-home__sub">WHAT IS TRUE.</p>
        {mode === 'LOADING' ? <p className="jrn-home__wait">READING TODAY</p> : null}
        {mode === 'ERROR' ? (
          <JurnlErrorPanel
            block
            testId="today-error"
            title="COULD NOT READ TODAY"
            body="THE HOME IS STILL HERE. TRY THE READING AGAIN."
            action={{ label: 'RETRY', trigger: 'today-retry', onClick: () => go('F03') }}
          />
        ) : null}
        {mode === 'EMPTY' ? (
          <div className="jrn-home__panel" data-jrn-trigger="today-empty">
            <b>NO ACCOUNTS YET</b>
            <p>THIS HOME NEEDS A MONEY SOURCE. NOTHING HERE IS A BALANCE.</p>
            <JurnlButton variant="secondary" trigger="today-empty-setup" onClick={() => go('F02.02')}>
              RETURN TO ACCOUNTS
            </JurnlButton>
          </div>
        ) : null}
        {mode === 'PARTIAL' ? (
          <div className="jrn-home__panel" data-jrn-trigger="today-partial">
            <b>STILL LEARNING</b>
            <p>{draft.accounts === 'SKIPPED' ? 'ACCOUNTS WERE SKIPPED.' : 'INCOME IS STILL QUIET.'}</p>
            <p>SAFE TO SPEND STAYS UNSTATED UNTIL THOSE FACTS EXIST.</p>
          </div>
        ) : null}
        {showSignal ? (
          <div className="jrn-home__signal">
            <p className="jrn-home__num">{formatMoney(signal.value)}</p>
            <p className="jrn-home__label">SAFE TO SPEND</p>
            <p className="jrn-home__hint">A COMPUTED SIGNAL. PREVIEW.</p>
            <JurnlButton trigger="today-why" onClick={() => openOverlay('see-why')}>
              SEE WHY
            </JurnlButton>
            {mode === 'STALE' ? (
              <JurnlButton variant="secondary" trigger="today-refresh" onClick={() => go('F03')}>
                REFRESH
              </JurnlButton>
            ) : null}
          </div>
        ) : null}
        {attention && showSignal ? <p className="jrn-home__note" data-jrn-trigger="today-attention">{attention}</p> : null}
        {showSignal || mode === 'PARTIAL' ? (
          <div className="jrn-home__panel">
            <div className="jrn-home__sec">
              <span>COMING</span>
              <button type="button" className="jrn-btn jrn-btn--quiet" data-jrn-trigger="today-upcoming" onClick={() => setOpenUpcoming((v) => !v)}>
                {openUpcoming ? 'LESS' : 'MORE'}
              </button>
            </div>
            <ul className="jrn-home__list">
              {(openUpcoming ? upcomingFor(draft) : upcoming).map((item) => (
                <li key={item.id} className="jrn-tx">
                  <span className="jrn-tx__mark" aria-hidden>
                    <JurnlIcon name={item.kind === 'SUBSCRIPTION' ? 'clock' : 'document'} size={16} />
                  </span>
                  <span className="jrn-tx__copy">
                    <span className="jrn-tx__name">{item.name}</span>
                    <small>
                      {item.when} · {item.kind}
                    </small>
                  </span>
                  <span className="jrn-tx__amt">{item.amount ? formatMoney(item.amount) : '—'}</span>
                </li>
              ))}
              {!upcoming.length && mode === 'PARTIAL' ? <li className="jrn-home__quiet">NO OBLIGATIONS YET</li> : null}
            </ul>
            {showSignal ? (
              <>
                <div className="jrn-home__sec">
                  <span>MOVED</span>
                  <button type="button" className="jrn-btn jrn-btn--quiet" data-jrn-trigger="today-activity" onClick={() => go('F04')}>
                    ACTIVITY
                  </button>
                </div>
                <div role="list" className="jrn-home__list">
                  {recent.map((entry) => (
                    <JurnlTransactionRow key={entry.id} entry={entry} onOpen={() => go('F04')} />
                  ))}
                </div>
              </>
            ) : null}
            {draft.priorities[0] ? <p className="jrn-home__goal">{draft.priorities[0]} FIRST</p> : null}
          </div>
        ) : null}
        <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      </div>
      {overlay === 'see-why' ? <SeeWhySheet onClose={closeOverlay} /> : null}
      {overlay === 'quick-add' ? <QuickAddSheet onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskSheet onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

function SeeWhySheet({ onClose }: { onClose: () => void }) {
  const signal = safeToSpend();
  const rows = [
    ['CASH POSITION', formatMoney(signal.cash), signal.cashSource],
    ['UPCOMING', formatMoney(signal.upcoming), 'DERIVED'],
    ['PROTECTED', formatMoney(signal.protected), signal.protectedSource],
    ['SAFE TO SPEND', formatMoney(signal.value), 'DERIVED'],
  ];
  return (
    <JurnlDrawer size="long" testId="see-why" title="SEE WHY" lead="SAFE TO SPEND IS CASH, MINUS WHAT IS COMING, MINUS WHAT YOU PROTECTED. THIS IS A PREVIEW READING." onClose={onClose}>
      <ul className="jrn-why">
        {rows.map(([label, value, source]) => (
          <li key={label}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{source}</small>
          </li>
        ))}
      </ul>
    </JurnlDrawer>
  );
}

export function QuickAddSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [account, setAccount] = useState('CHECKING');
  const valid = name.trim().length > 0 && /^\d+(\.\d{1,2})?$/.test(amount.trim());
  return (
    <JurnlDrawer
      size="long"
      testId="quick-add"
      title="QUICK ADD"
      lead="A MOVEMENT YOU ARE WRITING DOWN. IT JOINS THE PREVIEW LEDGER."
      onClose={onClose}
      footer={
        <JurnlButton
          trigger="quick-add-save"
          disabled={!valid}
          onClick={() => {
            addLedgerEntry({
              merchant: name.trim().toUpperCase(),
              amount: Number(amount),
              direction,
              when: 'TODAY',
              account,
              category: direction === 'INCOME' ? 'INCOME' : 'OTHER',
            });
            onClose();
          }}
        >
          SAVE
        </JurnlButton>
      }
    >
      <JurnlInput label="NAME" value={name} onValue={setName} trigger="quick-add-name" />
      <JurnlInput label="AMOUNT" value={amount} onValue={setAmount} trigger="quick-add-amount" inputMode="decimal" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="DIRECTION">
        {(['EXPENSE', 'INCOME'] as const).map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={direction === item} data-jrn-trigger={`quick-add-${item.toLowerCase()}`} onClick={() => setDirection(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="jrn-home__choices" role="radiogroup" aria-label="ACCOUNT">
        {['CHECKING', 'CARD'].map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={account === item} data-jrn-trigger={`quick-add-${item.toLowerCase()}`} onClick={() => setAccount(item)}>
            {item}
          </button>
        ))}
      </div>
    </JurnlDrawer>
  );
}

export function AskSheet({ onClose }: { onClose: () => void }) {
  const signal = safeToSpend();
  return (
    <JurnlDrawer size="short" testId="ask" title="ASK JURNL" lead="JURNL READS THE PREVIEW CASH, WHAT IS COMING, AND WHAT YOU PROTECTED." onClose={onClose}>
      <p className="jrn-home__ask">SAFE TO SPEND IS {formatMoney(signal.value)}. THIS IS NOT A PLAN AND NOT A BALANCE.</p>
    </JurnlDrawer>
  );
}

export function ActivityScreen() {
  const { go, openOverlay, closeOverlay, overlay, forcedState } = useHomeOverlay();
  const added = useAddedEntries();
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
  const active = { ...filter, query: mode === 'no_results' ? 'ZZZZ' : debounced };
  const shown = mode === 'empty' ? [] : applyActivityFilter(entries, active);
  const filtering = filterIsActive(filter) || debounced.trim().length > 0;

  return (
    <JurnlScreen screenId="F04.00" familyPlate={F04_LEDGER_PLATE}>
      <div className="jrn-act" data-jrn-state={mode || 'connected'}>
        <div className="jrn-home__top">
          <JurnlIconButton icon="back" label="BACK TO TODAY" trigger="activity-back" onClick={() => go('F03')} />
          <span className="jrn-home__mark">JURNL</span>
          <JurnlIconButton icon="info" label="ASK JURNL" trigger="activity-ask" onClick={() => openOverlay('ask')} />
        </div>
        <h1 className="jrn-home__h jrn-home__h--act">ACTIVITY</h1>
        <p className="jrn-home__sub">WHAT MOVED.</p>
        <div className="jrn-act__tools">
          <JurnlInput label="SEARCH" value={query} onValue={setQuery} icon="search" trigger="activity-search" />
          <JurnlButton variant="secondary" trigger="activity-filter" onClick={() => openOverlay('filter')}>
            <JurnlIcon name="filter" size={14} /> FILTER
          </JurnlButton>
          {query ? (
            <button type="button" className="jrn-btn jrn-btn--quiet" data-jrn-trigger="activity-clear-search" onClick={() => setQuery('')}>
              CLEAR
            </button>
          ) : null}
        </div>
        {filtering ? (
          <p className="jrn-act__filters" data-jrn-trigger="activity-filter-state">
            {filter.account !== 'ALL' ? filter.account : 'ALL ACCOUNTS'}
            {' · '}
            {filter.direction}
            {' · '}
            {filter.status}
            {filter.when !== 'ALL' ? ` · ${filter.when}` : ''}
            <button type="button" className="jrn-btn jrn-btn--quiet" data-jrn-trigger="activity-clear-filter" onClick={() => setFilter(EMPTY_FILTER)}>
              CLEAR FILTERS
            </button>
          </p>
        ) : null}
        {mode === 'loading' ? <p className="jrn-home__wait">READING ACTIVITY</p> : null}
        {mode === 'error' ? (
          <JurnlErrorPanel block testId="activity-error" title="COULD NOT READ ACTIVITY" body="THE LEDGER IS STILL HERE." action={{ label: 'RETRY', trigger: 'activity-retry', onClick: () => go('F04') }} />
        ) : null}
        {mode !== 'loading' && mode !== 'error' ? (
          <div className="jrn-act__list" role="list" aria-label="ACTIVITY">
            {mode === 'empty' ? <p className="jrn-home__quiet" data-jrn-trigger="activity-empty">NO MOVEMENT YET</p> : null}
            {mode !== 'empty' && shown.length === 0 ? (
              <p className="jrn-home__quiet" data-jrn-trigger="activity-none">NO MATCHES</p>
            ) : null}
            {shown.map((entry) => (
              <JurnlTransactionRow
                key={entry.id}
                entry={entry}
                onOpen={(item) => {
                  setSelected(item);
                  openOverlay('detail');
                }}
              />
            ))}
          </div>
        ) : null}
        <JurnlProductNav current="ACTIVITY" onGo={go} onAdd={() => openOverlay('quick-add')} />
      </div>
      {overlay === 'filter' ? <FilterSheet filter={filter} onChange={setFilter} onClose={closeOverlay} /> : null}
      {overlay === 'detail' && selected ? <DetailSheet entry={selected} onClose={closeOverlay} /> : null}
      {overlay === 'quick-add' ? <QuickAddSheet onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskSheet onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

function FilterSheet({ filter, onChange, onClose }: { filter: ActivityFilter; onChange: (next: ActivityFilter) => void; onClose: () => void }) {
  const accounts = ['ALL', 'CHECKING', 'CARD'];
  const directions = ['ALL', 'INCOME', 'EXPENSE'] as const;
  const statuses = ['ALL', 'PENDING', 'CLEARED'] as const;
  const whens = ['ALL', 'YESTERDAY', 'FRIDAY', 'THURSDAY', 'MONDAY', 'TODAY'];
  return (
    <JurnlDrawer
      size="long"
      testId="activity-filter-sheet"
      title="FILTER"
      lead="THE LEDGER STAYS PUT. THESE CHOICES ONLY NARROW IT."
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
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.account === item} onClick={() => onChange({ ...filter, account: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>DIRECTION</legend>
        {directions.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.direction === item} onClick={() => onChange({ ...filter, direction: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>STATUS</legend>
        {statuses.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.status === item} onClick={() => onChange({ ...filter, status: item })}>
            {item}
          </button>
        ))}
      </fieldset>
      <fieldset className="jrn-filter">
        <legend>WHEN</legend>
        {whens.map((item) => (
          <button key={item} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={filter.when === item} onClick={() => onChange({ ...filter, when: item })}>
            {item}
          </button>
        ))}
      </fieldset>
    </JurnlDrawer>
  );
}

function DetailSheet({ entry, onClose }: { entry: LedgerEntry; onClose: () => void }) {
  const rows: [string, string][] = [
    ['MERCHANT', entry.merchant],
    ['AMOUNT', formatMoney(entry.amount, entry.direction === 'INCOME')],
    ['WHEN', entry.when],
    ['ACCOUNT', entry.account],
    ['CATEGORY', entry.category],
    ['STATUS', entry.status],
    ['DIRECTION', entry.direction],
    ['SOURCE', entry.source],
  ];
  if (entry.memo) rows.push(['NOTE', entry.memo]);
  if (entry.recurring) rows.push(['RECURRING', 'YES']);
  return (
    <JurnlDrawer size="long" testId="activity-detail" title={entry.merchant} lead="A MOVEMENT. NOT A BILL, UNLESS A RELATED OBLIGATION IS NAMED." onClose={onClose}>
      <ul className="jrn-why">
        {rows.map(([label, value]) => (
          <li key={label}>
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
    </JurnlDrawer>
  );
}

export function MoneyBoundaryScreen() {
  return <NavBoundary screenId="F05.BOUNDARY" title="MONEY" body="MONEY IS THE NEXT FAMILY. IT IS NOT OPEN YET." />;
}
export function PlanBoundaryScreen() {
  return <NavBoundary screenId="F08.BOUNDARY" title="PLAN" body="PLAN IS NOT OPEN YET." />;
}
export function CreditBoundaryScreen() {
  return <NavBoundary screenId="F12.BOUNDARY" title="CREDIT" body="CREDIT IS NOT OPEN YET." />;
}

function NavBoundary({ screenId, title, body }: { screenId: string; title: string; body: string }) {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const current = title === 'MONEY' ? 'MONEY' : title === 'PLAN' ? 'PLAN' : 'CREDIT';
  return (
    <JurnlScreen screenId={screenId} field="bone" family>
      <div className="jrn-home">
        <h1 className="jrn-home__h">{title}</h1>
        <p className="jrn-home__sub">{body}</p>
        <JurnlButton variant="secondary" trigger="boundary-today" onClick={() => go('F03')}>
          BACK TO TODAY
        </JurnlButton>
        <JurnlProductNav current={current} onGo={go} onAdd={() => openOverlay('quick-add')} />
      </div>
      {overlay === 'quick-add' ? <QuickAddSheet onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}
