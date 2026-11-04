/**
 * F05 DOT 01 — expanded account pages (authorities 02 BANK ACCOUNT · 03 RIDESHARE CARD · 04 CASH ON HAND · 05 CREDIT CARD).
 *
 * BANK is the SK02 SIDEKICK exactly (its own papers lifted with real alpha over the olive field, so at rest the
 * composition is the authority's). The other kinds keep the same paper system; their identity art is the account
 * paper the user tapped on the parent (SK01's own card papers), so the paper carries from parent to child.
 * Every figure is canonical (data/f05/dot01/accountView.ts); nothing here computes a balance.
 */
import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { accountView, daysFrom, type AccountView, type Dot01Kind } from '../../../../data/f05/dot01/accountView';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { getTodayKey } from '../../../../data/foundation/dates';
import { formatMoney, useCurrency, useRepoTick } from '../../../../data/home/money';
import { TransferSheet } from '../../../finance/FinanceSheets';
import { useJurnl } from '../../../state/store';
import { amountSize } from '../CarouselPanelPaper';
import { DOT01, DOT01_GEOMETRY } from './dot01Assets';
import { Dot01Frame, type BoardRect, type Dot01Layer, type Dot01Layout, by } from './Dot01Frame';
import { Chevron, Icon } from './icons';
import { MicroIcon } from '../MicroIcon';
import type { MicroAssetId } from '../microAssets';
import { accountReservationHealth } from '../../../../data/f07/reservations';
import { getRepository } from '../../../../data/repository/deviceRepository';
import { shortDate } from './HistoryPage';
import { NotFoundPage } from './NotFoundPage';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';
import { useLongPress, usePocketManager } from './PocketManager';
import cardPayout from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_PAYOUT.webp';
import cardCash from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CASH.webp';
import cardCredit from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CREDIT.webp';
import cardBank from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_BANK.webp';
import pilotGeo from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_GEOMETRY.json';

const G = DOT01_GEOMETRY.SK02;
const box = (b: number[]): BoardRect => ({ x: b[0]!, y: b[1]!, w: b[2]! - b[0]!, h: b[3]! - b[1]! });
const BAL = box(G.balance.box);
const STATS = box(G.stats.box);
const SCENIC = box(G.scenic.box);
const STRIPS = [box(G.strip_1.box), box(G.strip_2.box), box(G.strip_3.box)];
const STRIP_SRC = [DOT01.SK02_STRIP_1, DOT01.SK02_STRIP_2, DOT01.SK02_STRIP_3];
const CARD_ART: Record<Dot01Kind, { src: string; w: number; h: number }> = {
  bank: { src: cardBank, w: pilotGeo.card_bank.w, h: pilotGeo.card_bank.h },
  payout: { src: cardPayout, w: pilotGeo.card_payout.w, h: pilotGeo.card_payout.h },
  cash: { src: cardCash, w: pilotGeo.card_cash.w, h: pilotGeo.card_cash.h },
  credit: { src: cardCredit, w: pilotGeo.card_credit.w, h: pilotGeo.card_credit.h },
};

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
  const four = strips.length === 4;
  // vertical rhythm: three strips use SK02's own strip papers in place; four share the same height and step
  const stripRects: BoardRect[] = four ? [0, 1, 2, 3].map((i) => ({ x: STRIPS[i % 3]!.x, y: 1062 + i * 118, w: STRIPS[i % 3]!.w, h: 124 })) : STRIPS;
  const band: BoardRect = four ? { x: SCENIC.x, y: 896, w: SCENIC.w, h: 162 } : SCENIC;
  const art = CARD_ART[v.kind];
  const artRect: BoardRect = (() => {
    const h = band.h - 8;
    const w = (art.w / art.h) * h;
    return { x: band.x + (band.w - w) / 2, y: band.y + 4, w, h };
  })();
  const layers: Dot01Layer[] = [
    ...(v.kind === 'bank' ? [{ id: 'scenic', src: DOT01.SK02_SCENIC, box: SCENIC, order: 2 }] : [{ id: 'identity', src: art.src, box: artRect, order: 2, className: 'jrn-d01__identity' }]),
    // the tapped parent paper becomes this paper (shared element: view-transition-name jrn-place)
    { id: 'balance', src: DOT01.SK02_BALANCE, box: BAL, order: 0, vt: 'jrn-place' },
    { id: 'stats', src: DOT01.SK02_STATS, box: STATS, order: 1 },
    ...stripRects.map((r, i) => ({ id: `strip-${i + 1}`, src: STRIP_SRC[i % 3]!, box: r, order: 3 + i })),
  ];
  // labels as each authority sets them (02 CURRENT BALANCE · 03 AVAILABLE BALANCE · 04 TOTAL ON HAND · 05 CURRENT BALANCE)
  const balanceLabel = v.kind === 'payout' ? ['AVAILABLE', 'BALANCE'] : v.kind === 'cash' ? ['TOTAL', 'ON HAND'] : ['CURRENT', 'BALANCE'];
  const amount = v.liability ? v.owed : v.held;
  const amountText = formatMoney(amount);
  const due = daysFrom(today, v.dueDate);
  // not set aside = held − active reservations (F07's canonical accountReservationHealth; nothing recomputed here)
  const health = v.position ? accountReservationHealth([v.position], getRepository().getSnapshot().reservations ?? [])[0] : null;
  const spendable = health?.notSetAside ?? 0;
  // stat words as each authority sets them; every value is a canonical figure for this place
  const stats: [string, string, string][] =
    v.kind === 'credit' ? [
      ['CREDIT LIMIT', v.creditLimit != null ? formatMoney(v.creditLimit) : 'NOT SET', 'credit-limit'],
      ['AVAILABLE CREDIT', v.availableCredit != null ? formatMoney(v.availableCredit) : '—', 'available-credit'],
      ['DUE DATE', v.dueDate ? (due != null && due < 0 ? 'PAST DUE' : shortDate(v.dueDate)) : 'NOT SET', 'due'],
    ]
    : v.kind === 'cash' ? [
      ['BILLS SET ASIDE', formatMoney(v.setAside), 'set-aside'],
      ['SPENDING CASH', formatMoney(spendable), 'spendable'],
      ['NOT LEFT YET', formatMoney(v.waitingToLeave), 'waiting'],
    ]
    : v.kind === 'payout' ? [
      ['SPENDABLE', formatMoney(spendable), 'spendable'],
      ['SET ASIDE', formatMoney(v.setAside), 'set-aside'],
      ['PENDING', formatMoney(v.waitingToLeave), 'waiting'],
    ]
    : [
      ['AVAILABLE', formatMoney(spendable), 'spendable'],
      ['HELD', formatMoney(v.setAside), 'set-aside'],
      ['PENDING', formatMoney(v.waitingToLeave), 'waiting'],
    ];
  const title = nameLines(v.account.display_name);
  const board = (L: Dot01Layout): ReactNode => (
    <>
      {/* balance paper */}
      <div className="jrn-d01__on jrn-d01__on--label" style={{ left: BAL.x + 20, top: by(L, BAL.y) + 40, width: BAL.w - 40 }}>
        {balanceLabel.map((l, i) => (
          <Fragment key={`${i}-${l}`}>
            {i ? ' ' : null}
            <span style={{ display: 'block' }}>{l}</span>
          </Fragment>
        ))}
      </div>
      <b className="jrn-d01__on jrn-d01__on--amount" data-testid="d01-balance" data-jrn-amount-cents={Math.round(amount * 100)} style={{ left: BAL.x + 10, width: BAL.w - 20, top: by(L, BAL.y) + 140, textAlign: 'center', fontSize: amountSize(amountText, 100) } as CSSProperties}>
        {amountText}
      </b>
      {v.liability ? <i className="jrn-d01__on jrn-d01__on--caption" style={{ left: BAL.x, width: BAL.w, top: by(L, BAL.y) + 232, textAlign: 'center' }}>OWED</i> : null}
      {/* hold the balance paper to manage the Pocket (the MANAGE POCKET chip does the same for keyboard / readers) */}
      <div className="jrn-d01__hold" aria-hidden data-jrn-trigger="d01-pocket-hold" style={{ left: BAL.x, top: by(L, BAL.y), width: BAL.w, height: BAL.h }} {...hold.bind(id)} />
      {/* stats paper */}
      {stats.map(([label, value, key], i) => (
        <p key={key} className="jrn-d01__stat" data-stat={key} style={{ left: STATS.x + 36, width: STATS.w - 78, top: by(L, STATS.y) + 46 + i * 78 }}>
          <span>{label}</span>
          <b>{value}</b>
        </p>
      ))}
      {[1, 2].map((i) => (
        <span key={i} className="jrn-d01__rule" aria-hidden style={{ position: 'absolute', left: STATS.x + 36, width: STATS.w - 78, top: by(L, STATS.y) + 46 + i * 78 - 24, height: 2, background: 'rgba(31,24,16,0.3)' }} />
      ))}
      {/* action strips (real buttons over the strip papers) */}
      {strips.map((s, i) => {
        const r = stripRects[i]!;
        return (
          <button key={s.id} type="button" className="jrn-d01__strip" data-jrn-trigger={`d01-strip-${s.id}`} aria-label={s.aria ?? s.label} style={{ left: r.x + 8, top: by(L, r.y) + 10, width: r.w - 16, height: r.h - 22, ['--i' as string]: i } as CSSProperties} onClick={s.onClick}>
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
  return (
    <Dot01Frame
      screenId="F05.ACCOUNT"
      env="SK02_FIELD"
      title={title}
      layers={layers}
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
