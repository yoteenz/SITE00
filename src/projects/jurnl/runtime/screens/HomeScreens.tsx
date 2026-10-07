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
import { JurnlButton, JurnlDrawer, JurnlErrorPanel, JurnlIconButton, JurnlInlineAction, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { FramePanel, JurnlFamilyFrame } from '../components/FamilyFrame';
import { useJurnl } from '../state/store';
import { FamilyDiscoveryLinks } from '../components/FamilyDiscovery';
import { accountDisplayOptions } from '../../data/foundation/accounts';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';

function useHomeOverlay() {
  const j = useJurnl();
  const overlay = j.overlay;
  return { ...j, overlay };
}

/** Today's chrome. Back returns to the previous route, then setup when Today was opened directly. */
function TodayChrome({ onBack, onAccount, onAsk }: { onBack: () => void; onAccount: () => void; onAsk: () => void }) {
  const { back, hasPrevious } = useJurnl();
  return (
    <div className="jrn-home__top" data-jrn-zone="chrome">
      <JurnlIconButton icon="back" label={hasPrevious ? 'BACK' : 'BACK TO SETUP'} trigger="today-back" onClick={() => { if (!back()) onBack(); }} />
      <span className="jrn-home__mark">JURNL</span>
      <JurnlIconButton icon="gear" label="ACCOUNT" trigger="today-account" onClick={onAccount} />
      <JurnlIconButton icon="info" label="ASK JURNL" trigger="today-ask" onClick={onAsk} />
    </div>
  );
}

export function TodayScreen() {
  const { go, openOverlay, closeOverlay, overlay, forcedState } = useHomeOverlay();
  useAddedEntries();
  useCurrency();
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
    <JurnlFamilyFrame
      screenId="F03.00"
      familyId="F03"
      familyPlate={F03_DAY_PLATE}
      label="TODAY"
      archetype="FOCUS_REVEAL"
      chrome={<TodayChrome onAccount={() => go('account')} onAsk={() => openOverlay('ask')} onBack={() => go('F02.08')} />}
      nav={<JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />}
      overlays={
        <>
          {overlay === 'see-why' ? <SeeWhySheet onClose={closeOverlay} /> : null}
          {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F03" onClose={closeOverlay} /> : null}
          {overlay === 'ask' ? <AskJurnlSheet familyId="F03" nodeId="F03.00" onClose={closeOverlay} /> : null}
        </>
      }
    >
      {showSignal ?
        // CENTER_STAGE operating board: the day on one side, the reading on the other, the next step under both.
        <FramePanel id="snapshot">
          <section className="jrn-today__snap" data-jrn-zone="intro" data-jrn-state={mode.toLowerCase()} data-jrn-signal="safe-to-spend" aria-label="TODAY">
            <div className="jrn-today__day">
              <h1 className="jrn-home__h">TODAY</h1>
              <p className="jrn-home__sub">WHAT IS TRUE.</p>
            </div>
            <div className="jrn-home__signal jrn-today__signal" data-jrn-panel="signal">
              <p className="jrn-home__label">SAFE TO SPEND</p>
              <p className="jrn-home__num">{formatMoney(signal.value)}</p>
              <p className="jrn-home__hint">A COMPUTED SIGNAL. PREVIEW.</p>
            </div>
            <div className="jrn-today__act">
              <JurnlButton trigger="today-why" onClick={() => openOverlay('see-why')}>
                SEE WHY
              </JurnlButton>
              {mode === 'STALE' ?
                <JurnlButton variant="secondary" trigger="today-refresh" onClick={() => go('F03')}>
                  REFRESH
                </JurnlButton>
              : null}
              {attention ?
                <p className="jrn-home__note" data-jrn-trigger="today-attention">
                  {attention}
                </p>
              : null}
            </div>
          </section>
        </FramePanel>
      : <FramePanel id="intro">
          <div className="jrn-home__intro" data-jrn-zone="intro" data-jrn-state={mode.toLowerCase()} data-jrn-signal="safe-to-spend">
            <h1 className="jrn-home__h">TODAY</h1>
            <p className="jrn-home__sub">WHAT IS TRUE.</p>
          </div>
        </FramePanel>
      }
      {mode === 'LOADING' ?
        <FramePanel id="loading">
          <p className="jrn-home__wait" data-jrn-state="loading">READING TODAY</p>
        </FramePanel>
      : null}
      {mode === 'ERROR' ?
        <FramePanel id="error">
          <JurnlErrorPanel
            block
            testId="today-error"
            title="COULD NOT READ TODAY"
            body="THE HOME IS STILL HERE. TRY THE READING AGAIN."
            action={{ label: 'RETRY', trigger: 'today-retry', onClick: () => go('F03') }}
          />
        </FramePanel>
      : null}
      {mode === 'EMPTY' ?
        <FramePanel id="empty">
          <JurnlPanel role="empty" className="jrn-home__panel" data-jrn-trigger="today-empty">
            <b>NO ACCOUNTS YET</b>
            <p>THIS HOME NEEDS A MONEY SOURCE. NOTHING HERE IS A BALANCE.</p>
            <JurnlButton variant="secondary" trigger="today-empty-setup" onClick={() => go('F02.02')}>
              RETURN TO ACCOUNTS
            </JurnlButton>
          </JurnlPanel>
        </FramePanel>
      : null}
      {mode === 'PARTIAL' ?
        <FramePanel id="partial">
          <JurnlPanel role="editorial" className="jrn-home__panel" data-jrn-trigger="today-partial">
            <b>STILL LEARNING</b>
            <p>{draft.accounts === 'SKIPPED' ? 'ACCOUNTS WERE SKIPPED.' : 'INCOME IS STILL QUIET.'}</p>
            <p>SAFE TO SPEND STAYS UNSTATED UNTIL THOSE FACTS EXIST.</p>
          </JurnlPanel>
        </FramePanel>
      : null}
      {showSignal || mode === 'PARTIAL' ?
        <FramePanel id="coming">
          <JurnlPanel role="editorial" className="jrn-home__panel" data-jrn-zone="content-rail" data-jrn-rhythm={openUpcoming ? 'sequence' : 'rest'}>
            <div className="jrn-home__sec">
              <span>COMING</span>
              <JurnlInlineAction trigger="today-upcoming" expanded={openUpcoming} onClick={() => setOpenUpcoming((v) => !v)}>
                {openUpcoming ? 'LESS' : 'MORE'}
              </JurnlInlineAction>
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
          </JurnlPanel>
        </FramePanel>
      : null}
      {showSignal ?
        <FramePanel id="moved">
          <JurnlPanel role="editorial" className="jrn-home__panel">
            <div className="jrn-home__sec">
              <span>MOVED</span>
              <JurnlInlineAction trigger="today-activity" onClick={() => go('F04')}>
                ACTIVITY
              </JurnlInlineAction>
            </div>
            <ul className="jrn-home__list">
              {recent.map((entry) => (
                <li key={entry.id}>
                  <JurnlTransactionRow entry={entry} onOpen={() => go('F04')} />
                </li>
              ))}
            </ul>
            {draft.priorities[0] ? <p className="jrn-home__goal">{draft.priorities[0]} FIRST</p> : null}
          </JurnlPanel>
        </FramePanel>
      : null}
      {showSignal || mode === 'PARTIAL' ?
        <FramePanel id="more">
          <div className="jrn-home__panel jrn-home__more">
            <FamilyDiscoveryLinks hubFamily="F03" onGo={go} />
          </div>
        </FramePanel>
      : null}
    </JurnlFamilyFrame>
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
    <JurnlDrawer expression="analysis" size="long" testId="see-why" title="SEE WHY" lead="SAFE TO SPEND IS CASH, MINUS WHAT IS COMING, MINUS WHAT YOU PROTECTED. THIS IS A PREVIEW READING." onClose={onClose}>
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
          <p className="jrn-home__sub">WHAT MOVED.</p>
        </div>
        <div className="jrn-act__stage" data-jrn-zone="content-rail">
        <div className="jrn-act__tools">
          <JurnlInput label="SEARCH" value={query} onValue={setQuery} icon="search" trigger="activity-search" />
          <JurnlButton variant="utility" icon={<JurnlIcon name="filter" size={14} />} trigger="activity-filter" onClick={() => openOverlay('filter')}>
            FILTER
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
            {mode !== 'empty' && shown.length > 0 ? <p className="jrn-ledger__count">{shown.length} MOVEMENTS</p> : null}
            {mode === 'empty' ? (
              <div className="jrn-ledger__empty" data-jrn-panel="empty" data-jrn-trigger="activity-empty">
                <b>NO MOVEMENT YET</b>
                <p>THE LEDGER IS QUIET.</p>
              </div>
            ) : null}
            {mode !== 'empty' && shown.length === 0 ? (
              <div className="jrn-ledger__empty" data-jrn-panel="empty" data-jrn-trigger="activity-none">
                <b>NO MATCHES</b>
                <p>NOTHING IN THIS LEDGER FITS.</p>
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
  const editable = entry.source === 'ADDED';
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [merchant, setMerchant] = useState(entry.merchant);
  const [amount, setAmount] = useState(String(entry.amount));
  const [account, setAccount] = useState(entry.account);
  const accountOptions = useMemo(() => accountDisplayOptions(), []);
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

  if (mode === 'delete') {
    return (
      <JurnlDrawer
        expression="confirmation"
        size="long"
        testId="activity-delete"
        title="DELETE MOVEMENT"
        lead="THIS REMOVES YOUR ADDED ENTRY FROM THE REPOSITORY."
        onClose={() => setMode('view')}
        footer={
          <>
            <JurnlButton trigger="activity-delete-confirm" onClick={() => { if (deleteLedgerEntry(entry.id)) onDeleted(); }}>
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
        title="EDIT MOVEMENT"
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
                account,
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
        <JurnlInput label="MERCHANT" value={merchant} onValue={setMerchant} trigger="activity-edit-merchant" />
        <JurnlInput label="AMOUNT USD" value={amount} onValue={setAmount} trigger="activity-edit-amount" inputMode="decimal" />
        <div className="jrn-home__choices" role="radiogroup" aria-label="ACCOUNT">
          {accountOptions.map((item) => (
            <button key={item.id} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={account === item.id} data-active={account === item.id ? 'true' : 'false'} onClick={() => setAccount(item.id)}>
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
      lead="A MOVEMENT. NOT A BILL, UNLESS A RELATED OBLIGATION IS NAMED."
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
        : undefined
      }
    >
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
      {!editable ? <p className="jrn-currency__note">PREVIEW ENTRIES ARE READ ONLY.</p> : null}
    </JurnlDrawer>
  );
}

