/**
 * F05 DOT 01 — expanded account pages (authorities 02 BANK ACCOUNT · 03 RIDESHARE CARD · 04 CASH ON HAND · 05 CREDIT CARD).
 *
 * This page owns what every account page shares: the canonical figures (data/f05/dot01/accountView.ts; nothing here
 * computes a balance), the actions, the chips, the Pocket hold and the accessible names. WHERE each of those sits, and
 * the art under them, is the page's own composition (accountScenes.ts): 02 is the SK02 SIDEKICK; 03 / 04 / 05 set their
 * own authority scene (the keychain, the amphora, the bronze coin on red fabric, their own summary parchment and
 * landscape) with the live figures at the authority's own coordinates.
 */
import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { accountView, daysFrom, type AccountView } from '../../../../data/f05/dot01/accountView';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { getTodayKey } from '../../../../data/foundation/dates';
import { formatMoney, useCurrency, useRepoTick } from '../../../../data/home/money';
import { TransferSheet } from '../../../finance/FinanceSheets';
import { useJurnl } from '../../../state/store';
import { amountSize } from '../CarouselPanelPaper';
import { Dot01Frame, type Dot01Layout, by } from './Dot01Frame';
import { ACCOUNT_COMPOSITIONS, STRIP_SRC, TIGHT_ROW_PITCH, seatActionRows, type TextSlot } from './accountScenes';
import { Chevron, Icon } from './icons';
import { MicroIcon } from '../MicroIcon';
import type { MicroAssetId } from '../microAssets';
import { accountReservationHealth } from '../../../../data/f07/reservations';
import { getRepository } from '../../../../data/repository/deviceRepository';
import { shortDate } from './HistoryPage';
import { NotFoundPage } from './NotFoundPage';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';
import { useLongPress, usePocketManager } from './PocketManager';

/** A slot's box on the board: it moves with the art it is set on (TextSlot.on); `minPx` keeps it legible on a phone. */
function slotStyle(L: Dot01Layout, s: TextSlot, minPx: number): CSSProperties {
  return { left: s.x, top: by(L, s.on) + s.y - s.on, width: s.w, textAlign: s.align, fontSize: `max(${s.size}px, calc(${minPx}px / var(--f05m-u, 1)))`, letterSpacing: s.track != null ? `${s.track}em` : undefined, lineHeight: s.leading };
}
const toneOf = (s: TextSlot) => (s.tone === 'ink' ? undefined : 'dark');

/** `asset`: the founder's art for this slot, where the authority draws an engraved / ink object (02–04). */
type Strip = { id: string; icon: string; asset?: MicroAssetId; label: string; aria?: string; onClick: () => void };

export function AccountPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [move, setMove] = useState(false);
  const today = getTodayKey();
  const manager = usePocketManager('detail');
  const hold = useLongPress((el, key) => manager.open(key, el));
  const v = placeId ? accountView(placeId, today) : null;
  // an archived (deleted) Pocket is no longer a page: its history stays in ACTIVITY
  if (!v || v.archived) return <NotFoundPage />;
  const id = v.account.account_id;
  const toHistory = () => go(`money/places/${id}/history`);
  const toDetails = () => go(`money/places/${id}/settings`);
  const strips: Strip[] =
    v.kind === 'bank' ? [
      { id: 'history', icon: 'book', label: 'ACCOUNT HISTORY', onClick: toHistory },
      { id: 'move', icon: 'coins', asset: 'F05.D01.ICON.COINS.STACK', label: 'MOVE MONEY', onClick: () => setMove(true) },
      { id: 'details', icon: 'column', asset: 'F05.D01.ICON.BANK.COLUMN', label: 'ACCOUNT DETAILS', onClick: toDetails },
    ]
    : v.kind === 'payout' ? [
      { id: 'history', icon: 'receipt', asset: 'F05.D01.ICON.HISTORY.LEDGER', label: 'TRANSACTION HISTORY', onClick: toHistory },
      { id: 'manage', icon: 'card', asset: 'F05.D01.ICON.CREDIT.CARD', label: 'MANAGE CARD', onClick: () => setSheet({ kind: 'edit', accountId: id }) },
      { id: 'details', icon: 'info', label: 'CARD DETAILS', onClick: toDetails },
    ]
    : v.kind === 'cash' ? [
      { id: 'add-cash', icon: 'coins', asset: 'F05.D01.ICON.COINS.STACK', label: 'ADD CASH', onClick: () => setSheet({ kind: 'add-cash', accountId: id }) },
      { id: 'spend', icon: 'receipt', asset: 'F05.D01.ICON.RECEIPT.INK', label: 'RECORD CASH SPENDING', onClick: () => setSheet({ kind: 'spend', accountId: id }) },
      { id: 'history', icon: 'chart', label: 'USAGE HISTORY', onClick: toHistory },
      { id: 'details', icon: 'info', label: 'CASH DETAILS', onClick: toDetails },
    ]
    : [
      { id: 'pay', icon: 'bank', label: 'MAKE A PAYMENT', aria: 'RECORD A CARD PAYMENT (JURNL DOES NOT SEND MONEY)', onClick: () => setSheet({ kind: 'card-payment', accountId: id }) },
      { id: 'purchase', icon: 'merchant', label: 'RECORD PURCHASE', onClick: () => setSheet({ kind: 'spend', accountId: id }) },
      { id: 'history', icon: 'receipt', label: 'TRANSACTION HISTORY', onClick: toHistory },
      { id: 'details', icon: 'card', label: 'CARD DETAILS', onClick: toDetails },
    ];
  // this page's own composition (02 SK02 · 03 / 04 / 05 their authority scene): where the figures, rows and art sit
  const C = ACCOUNT_COMPOSITIONS[v.kind];
  const rows = C.strips.slice(0, strips.length);
  // labels as each authority sets them (02 CURRENT BALANCE · 03 AVAILABLE BALANCE · 04 TOTAL ON HAND · 05 CURRENT BALANCE)
  const balanceLabel = v.kind === 'payout' ? ['AVAILABLE', 'BALANCE'] : v.kind === 'cash' ? ['TOTAL', 'ON HAND'] : ['CURRENT', 'BALANCE'];
  const twoLines = (C.label.lines ?? 2) > 1;
  const amount = v.liability ? v.owed : v.held;
  const amountText = formatMoney(amount);
  const due = daysFrom(today, v.dueDate);
  // not set aside = held − active reservations (F07's canonical accountReservationHealth; nothing recomputed here)
  const health = v.position ? accountReservationHealth([v.position], getRepository().getSnapshot().reservations ?? [])[0] : null;
  const spendable = health?.notSetAside ?? 0;
  // the summary rows as each authority sets them; every value is a canonical figure (or record field) for this Pocket
  const stats: [string, string, string][] =
    v.kind === 'credit' ? [
      ['CREDIT LIMIT', v.creditLimit != null ? formatMoney(v.creditLimit) : 'NOT SET', 'credit-limit'],
      ['AVAILABLE CREDIT', v.availableCredit != null ? formatMoney(v.availableCredit) : '—', 'available-credit'],
      ['DUE DATE', v.dueDate ? (due != null && due < 0 ? 'PAST DUE' : shortDate(v.dueDate)) : 'NOT SET', 'due'],
    ]
    : v.kind === 'cash' ? [
      ['BILLS SET ASIDE', formatMoney(v.setAside), 'set-aside'],
      ['SPENDING CASH', formatMoney(spendable), 'spendable'],
      ['LAST UPDATED', !v.updatedOn || v.daysSinceUpdate == null ? 'NOT YET' : v.daysSinceUpdate <= 0 ? 'TODAY' : v.daysSinceUpdate === 1 ? 'YESTERDAY' : shortDate(v.updatedOn), 'updated'],
    ]
    : v.kind === 'payout' ? [
      ['SPENDABLE', formatMoney(spendable), 'spendable'],
      ['PENDING', formatMoney(v.waitingToLeave), 'waiting'],
      // a page exists only for a live Pocket (an archived one is NotFound above), so this reads the record's ACTIVE
      ['CARD STATUS', v.account.status, 'status'],
    ]
    : [
      ['AVAILABLE', formatMoney(spendable), 'spendable'],
      ['HELD', formatMoney(v.setAside), 'set-aside'],
      ['PENDING', formatMoney(v.waitingToLeave), 'waiting'],
    ];
  const scene = C.source === 'AUTHORITY_SCENE_BAND' ? 'true' : undefined;
  const title = nameLines(v.account.display_name);
  const board = (L: Dot01Layout): ReactNode => {
    // the action rows for this viewport (tall: they take their share of the extra height; short: they close up)
    const tops = seatActionRows(rows, C.rowsOnTall, L);
    const tight = tops.some((t, i) => i > 0 && t - tops[i - 1]! < TIGHT_ROW_PITCH) ? 'true' : undefined;
    const at = (on: number, y: number) => by(L, on) + y - on;
    return (
      <>
        {/* the balance: on 02's CURRENT BALANCE paper, on the olive ground of 03 / 04 / 05 */}
        <div className="jrn-d01__on jrn-d01__on--label" data-on={toneOf(C.label)} style={slotStyle(L, C.label, 12)}>
          {balanceLabel.map((l, i) => (
            <Fragment key={`${i}-${l}`}>
              {i ? ' ' : null}
              <span style={{ display: twoLines ? 'block' : 'inline' }}>{l}</span>
            </Fragment>
          ))}
        </div>
        <b className="jrn-d01__on jrn-d01__on--amount" data-on={toneOf(C.value)} data-tone={C.value.tone === 'gold' ? 'gold' : undefined} data-testid="d01-balance" data-jrn-amount-cents={Math.round(amount * 100)} style={{ ...slotStyle(L, C.value, 0), fontSize: amountSize(amountText, C.value.size) } as CSSProperties}>
          {amountText}
        </b>
        {v.liability && C.caption ? <i className="jrn-d01__on jrn-d01__on--caption" data-on={toneOf(C.caption)} data-scene={scene} style={slotStyle(L, C.caption, 8)}>OWED</i> : null}
        {/* hold the balance to manage the Pocket (the MANAGE POCKET chip does the same for keyboard / readers) */}
        <div className="jrn-d01__hold" aria-hidden data-jrn-trigger="d01-pocket-hold" style={{ left: C.hold.x, top: at(C.hold.on, C.hold.y), width: C.hold.w, height: C.hold.h }} {...hold.bind(id)} />
        {/* the summary rows: on 02's stats paper, or on the page's own summary parchment */}
        {stats.map(([label, value, key], i) => (
          <p key={key} className="jrn-d01__stat" data-stat={key} data-scene={scene} style={{ left: C.stats.x, width: C.stats.w, top: at(C.stats.on, C.stats.rows[i]!), fontSize: `max(${C.stats.size}px, calc(10px / var(--f05m-u, 1)))`, lineHeight: C.stats.leading, letterSpacing: C.stats.track != null ? `${C.stats.track}em` : undefined, ['--d01-stat-b' as string]: C.stats.valueEm ? `${C.stats.valueEm}em` : undefined } as CSSProperties}>
            <span>{label}</span>
            <b>{value}</b>
          </p>
        ))}
        {(C.stats.rules ?? []).map((y, i) => (
          <span key={i} className="jrn-d01__rule" aria-hidden style={{ position: 'absolute', left: C.stats.x, width: C.stats.w, top: at(C.stats.on, y), height: 2, background: 'rgba(31,24,16,0.3)' }} />
        ))}
        {/* the strip papers, seated with their rows, then the real buttons over them */}
        {tops.map((t, i) => {
          const p = C.stripPapers[i]!;
          return <img key={`paper-${i}`} className="jrn-d01__layer" data-layer="L1" data-layer-id={`strip-${i + 1}`} src={STRIP_SRC[i % 3]} alt="" aria-hidden draggable={false} style={{ left: p.x, top: t + p.y - rows[i]!.y, width: p.w, height: p.h, ['--i' as string]: 3 + i } as CSSProperties} />;
        })}
        {strips.map((s, i) => {
          const r = rows[i]!;
          return (
            <button key={s.id} type="button" className="jrn-d01__strip" data-jrn-trigger={`d01-strip-${s.id}`} data-tight={tight} aria-label={s.aria ?? s.label} style={{ left: r.x + 8, top: tops[i]! + 10, width: r.w - 16, height: r.h - 22, ['--i' as string]: i, ['--d01-strip-fs' as string]: C.stripLabel ? `${C.stripLabel}px` : undefined } as CSSProperties} onClick={s.onClick}>
              <span className="jrn-d01__strip-icon" data-art={s.asset ? 'true' : undefined} data-tile={v.kind === 'credit' ? (i % 2 ? 'terracotta' : 'moss') : undefined}>
                <MicroIcon id={s.asset} fallback={<Icon name={s.icon} />} />
              </span>
              <span className="jrn-d01__strip-rule" aria-hidden />
              <span className="jrn-d01__strip-label">{s.label}</span>
              <Chevron className="jrn-d01__strip-chev" />
            </button>
          );
        })}
      </>
    );
  };
  return (
    <Dot01Frame
      screenId="F05.ACCOUNT"
      env="SK02_FIELD"
      title={title}
      layers={C.layers}
      board={board}
      testId="d01-account"
      chips={[
        { id: 'd01-manage', label: 'MANAGE POCKET', icon: 'more', menu: { open: manager.openFor === id }, onClick: (e) => manager.open(id, e?.currentTarget ?? null) },
        { id: 'd01-back', label: 'BACK TO MONEY', icon: 'back', onClick: () => back() || go('money') },
      ]}
      overlays={
        <>
          {move ? <TransferSheet fromId={id} onClose={() => setMove(false)} /> : null}
          <Dot01Sheets state={sheet} onClose={() => setSheet(null)} />
          {manager.node}
        </>
      }
    />
  );
}

export type { AccountView };
