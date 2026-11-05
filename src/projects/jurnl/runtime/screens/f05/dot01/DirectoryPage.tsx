/**
 * F05 DOT 01 — ALL ACCOUNTS (authority 06), its empty state (22) and REORDER ACCOUNTS (32).
 * Any number of places, in the user's order (settings.accountOrder). Reordering changes only that preference: no
 * balance, id or ledger record moves. Drag with the grip, or use the up / down buttons (keyboard and screen readers).
 */
import { Fragment, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { listActiveAccounts, type JurnlAccountRecord } from '../../../../data/foundation/accounts';
import { getTodayKey } from '../../../../data/foundation/dates';
import { formatMoney, useCurrency, useRepoTick } from '../../../../data/home/money';
import { nameLines } from '../../../../data/f05/moneyParentReading';
import { f05BoardType } from '../CarouselPanelPaper';
import { CELL_H, DIRECTORY_ACTION, DIRECTORY_MAX_CROP, DIRECTORY_PAPER, EMPTY_SCENE, PAPER_TYPE, directoryAbsorb, directoryLayout, figureSize, nameSize, type DirectoryCell } from './directoryScene';
import type { LongPressBind } from './PocketManager';
import { computeMoneyPicture } from '../../../../data/ledger/moneyPicture';
import { getRepository } from '../../../../data/repository/deviceRepository';
import { moveInOrder, orderAccounts, setAccountOrder } from '../../../../data/f05/dot01/accountOrder';
import { kindOf } from '../../../../data/f05/dot01/accountView';
import { reviewIssues } from '../../../../data/f05/dot01/reconciliation';
import { useLongPress, usePocketManager } from './PocketManager';
import { useJurnl } from '../../../state/store';
import { Dot01Frame, Dot01Overlay, OVERLAY_CONTENT, type Dot01Chip, type Dot01Layout } from './Dot01Frame';
import { Icon } from './icons';
import { Alert, Button, CARD_SRC, Paper, money } from './kit';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';

export function DirectoryPage() {
  const { go, back } = useJurnl();
  const manager = usePocketManager('directory');
  const hold = useLongPress((el, key) => manager.open(key, el));
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [reorder, setReorder] = useState(false);
  const [learn, setLearn] = useState(false);
  const today = getTodayKey();
  const accounts = orderAccounts(listActiveAccounts());
  const snap = getRepository().getSnapshot();
  const pic = computeMoneyPicture(snap.accounts, snap.creditAttributes, snap.transactions, today);
  const pos = (id: string) => pic.positions.find((p) => p.account_id === id);
  const empty = accounts.length === 0;
  // chips and dock as each authority draws them: 06 back + dock · 22 back · 32 search + add
  const chips: Dot01Chip[] = reorder
    ? [
        { id: 'd01-search', label: 'SEARCH TRANSACTIONS', icon: 'search', onClick: () => go('money/transactions') },
        { id: 'd01-add', label: 'ADD ACCOUNT', icon: 'plus', onClick: () => setSheet({ kind: 'add-account' }) },
      ]
    : [{ id: 'd01-back', label: 'BACK TO MONEY', icon: 'back', onClick: () => back() || go('money') }];
  const nav = !empty && !reorder;
  const summary = `${accounts.length} ${accounts.length === 1 ? 'POCKET' : 'POCKETS'} · ${money(pic.summary.ownedAssets)} HELD${pic.summary.owed > 0 ? ` · ${money(pic.summary.owed)} OWED` : ''}`;
  const addKind = (kind?: 'bank' | 'payout' | 'cash' | 'credit') => setSheet({ kind: 'add-account', preset: kind });
  const content = empty ? undefined : reorder ? (
    <ReorderList ids={accounts.map((a) => a.account_id)} onDone={() => setReorder(false)} />
  ) : undefined;
  // authority 06: the papers, the action row and the dock are seated in board px on SK01's scene (directoryScene.ts);
  // the number of pockets changes only where the papers sit inside the card zone, never the rest of the composition
  const board = nav
    ? (L: Dot01Layout) => {
        const D = directoryLayout(accounts.length, L.extra);
        const cards = accounts.map((a, i) => {
          const p = pos(a.account_id);
          const issues = reviewIssues(a.account_id, today);
          const liability = p?.nature === 'LIABILITY';
          return (
            <DirectoryPaper
              key={a.account_id}
              i={i}
              cell={D.cells[i]!}
              account={a}
              amount={liability ? p!.owed : (p?.held ?? 0)}
              liability={liability}
              badge={issues.length ? 'NEEDS REVIEW' : undefined}
              hold={hold.bind(a.account_id)}
              onOpen={() => go(issues.length ? `money/places/${a.account_id}/attention` : `money/places/${a.account_id}`)}
            />
          );
        });
        return (
          <section className="d01-dir" aria-label="ALL ACCOUNTS" data-count={accounts.length}>
            {D.scroll ? (
              <div className="d01-dir__scroller" role="list" aria-label="YOUR POCKETS" data-scroll="true" style={{ left: D.region.x, top: D.region.y, width: D.region.w, height: D.region.h }}>
                <div className="d01-dir__track" style={{ height: D.cells[D.cells.length - 1]!.y + CELL_H + 24 }}>{cards}</div>
              </div>
            ) : (
              <div className="d01-dir__grid" role="list" aria-label="YOUR POCKETS">{cards}</div>
            )}
            <DirectoryAction which="add" dy={D.actionsDy} trigger="d01-add-account" lines={['ADD', 'ACCOUNT']} onClick={() => setSheet({ kind: 'add-account' })} />
            <DirectoryAction which="reorder" dy={D.actionsDy} trigger="d01-reorder" lines={['REORDER', 'ACCOUNTS']} disabled={accounts.length < 2} onClick={() => setReorder(true)} />
            {/* the authority draws no summary line here: it stays for screen readers only */}
            <p className="d01-sr" data-testid="d01-directory-summary">{summary}</p>
          </section>
        );
      }
    : empty
      ? (L: Dot01Layout) => <EmptyBoard L={L} onAdd={addKind} onLearn={() => setLearn(true)} />
      : undefined;
  return (
    <Dot01Frame
      screenId="F05.ACCOUNTS"
      env={nav ? 'SK01_FIELD' : 'SK02_FIELD'}
      title={reorder ? ['ACCOUNTS'] : empty ? ['ALL ACCOUNTS'] : ['ALL', 'ACCOUNTS']}
      subtitle={reorder ? 'reorder accounts' : empty ? 'nothing added yet' : undefined}
      testId="d01-directory"
      chipTone="amber"
      label={reorder ? 'REORDER ACCOUNTS' : 'ALL ACCOUNTS'}
      chips={chips}
      nav={nav}
      board={board}
      absorb={nav ? directoryAbsorb(accounts.length) : empty ? EMPTY_SCENE.absorb : undefined}
      // 06 draws its papers out to x 28 … 915: a phone crops at most 24 board px a side so no paper edge is cut
      maxCrop={nav ? DIRECTORY_MAX_CROP : undefined}
      contentRect={content ? { x: 30, y: 600, w: 881, h: 940 } : undefined}
      contentScroll
      content={content}
      overlays={<>
        <Dot01Sheets state={sheet} onClose={() => setSheet(null)} />
        {learn ? <AccountTypesOverlay onClose={() => setLearn(false)} onAdd={(k) => { setLearn(false); addKind(k); }} /> : null}
        {manager.node}
      </>}
    />
  );
}

/** One pocket on its kind's 06 paper: the whole paper is the control; name and figure are live type in board px. */
function DirectoryPaper({ i, cell, account, amount, liability, badge, hold, onOpen }: { i: number; cell: DirectoryCell; account: JurnlAccountRecord; amount: number; liability: boolean; badge?: string; hold: LongPressBind; onOpen: () => void }) {
  const art = DIRECTORY_PAPER[kindOf(account)];
  const lines = nameLines(account.display_name);
  const figure = formatMoney(amount);
  const nSize = nameSize(lines);
  const T = PAPER_TYPE;
  return (
    <div role="listitem" className="d01-dir__cell" style={{ left: cell.x, top: cell.y, width: art.box.w, height: art.box.h, ['--i' as string]: i } as CSSProperties}>
      <button
        type="button"
        className="d01-dir__paper"
        data-jrn-trigger={`d01-place-${account.account_id}`}
        data-account-id={account.account_id}
        data-kind={kindOf(account)}
        aria-label={`${account.display_name}. ${figure} ${liability ? 'OWED' : 'HELD'}${badge ? `. ${badge}` : ''}. OPEN.`}
        aria-keyshortcuts="Shift+F10"
        aria-description="PRESS AND HOLD, OR SHIFT F10, TO MANAGE THIS POCKET."
        onClick={onOpen}
        {...hold}
      >
        <img className="d01-dir__art" src={art.src} alt="" draggable={false} width={art.box.w} height={art.box.h} />
        {badge ? <span className="d01-dir__badge" style={{ left: T.badge.x, top: T.badge.y, fontSize: T.badge.size }}>{badge}</span> : null}
        <span className="d01-dir__name" aria-hidden style={{ left: T.name.x, top: T.name.y, width: T.name.w, fontSize: f05BoardType(`${nSize}px`), lineHeight: T.name.leading, letterSpacing: `${T.name.track}em` }}>
          {/* a real space between the lines (a whitespace-only node is not a grid item, so layout is unchanged) */}
          {lines.map((l, j) => (
            <Fragment key={`${j}-${l}`}>
              {j ? ' ' : null}
              <span>{l}</span>
            </Fragment>
          ))}
        </span>
        <b className="d01-dir__figure" aria-hidden data-jrn-amount-cents={Math.round(amount * 100)} style={{ left: T.value.x, top: T.value.y, width: T.value.w, fontSize: f05BoardType(`${figureSize(figure)}px`) }}>
          {figure}
        </b>
        {liability ? <i className="d01-dir__owed" aria-hidden style={{ left: T.caption.x, top: T.caption.y, fontSize: T.caption.size }}>OWED</i> : null}
      </button>
    </div>
  );
}

/** One of 06's two action surfaces (lifted with its own torn edge), its 06 glyph and a live two-line label. */
function DirectoryAction({ which, dy, trigger, lines, onClick, disabled }: { which: 'add' | 'reorder'; dy: number; trigger: string; lines: [string, string]; onClick: () => void; disabled?: boolean }) {
  const A = DIRECTORY_ACTION[which];
  const rel = (b: { x: number; y: number; w: number; h: number }) => ({ left: b.x - A.box.x, top: b.y - A.box.y, width: b.w, height: b.h });
  return (
    <button type="button" className="d01-dir__action" data-action={which} data-jrn-trigger={trigger} disabled={disabled} aria-label={lines.join(' ')} onClick={onClick} style={{ left: A.box.x, top: A.box.y + dy, width: A.box.w, height: A.box.h }}>
      <img className="d01-dir__action-art" src={A.src} alt="" draggable={false} width={A.box.w} height={A.box.h} />
      <img className="d01-dir__glyph" src={A.glyph} alt="" draggable={false} style={rel(A.glyphBox)} />
      <span className="d01-dir__label" aria-hidden style={rel(A.labelBox)}>
        <span>{lines[0]}</span> <span>{lines[1]}</span>
      </span>
    </button>
  );
}

/**
 * Authority 22: the page's own scene band (wallet, temple card, coins, coastal print, the sheet with its rule, the four
 * account-type papers, the ADD FIRST ACCOUNT and LEARN ACCOUNT TYPES strips) lifted text-free from 22, with every label
 * set live. A tall phone grows the sheet under the copy (a tile of the same plain sheet), so the type papers and the
 * strips move down together; the env's own landscape follows below. Each type paper starts ADD ACCOUNT with that type chosen; nothing is invented.
 */
function EmptyBoard({ L, onAdd, onLearn }: { L: Dot01Layout; onAdd: (kind?: 'bank' | 'payout' | 'cash' | 'credit') => void; onLearn: () => void }) {
  const E = EMPTY_SCENE;
  // a tall phone's extra height: 40 % opens the olive ground above the wallet, 60 % grows the sheet under the copy
  const lift = Math.max(0, L.extra) * 0.4;
  const grow = L.extra - lift;
  const dy = L.extra;
  const [bx0, by0, , by1] = E.band;
  const seam = E.seam;
  const kinds = [
    ['bank', ['BANK', 'ACCOUNT'], E.papers[0]!],
    ['payout', ['RIDESHARE', 'CARD'], E.papers[1]!],
    ['cash', ['CASH', 'ON HAND'], E.papers[2]!],
    ['credit', ['CREDIT', 'CARD'], E.papers[3]!],
  ] as const;
  return (
    <section className="d01-empty" aria-label="NO ACCOUNTS YET" data-testid="d01-empty-accounts">
      <div className="d01-empty__band" aria-hidden style={{ left: bx0, top: by0 + lift, width: 941, height: seam - by0 }}>
        <img src={E.src} alt="" draggable={false} style={{ top: 0 }} />
      </div>
      {grow > 0 ? <div className="d01-empty__tile" aria-hidden style={{ left: 0, top: seam + lift, width: 941, height: grow, backgroundImage: `url("${E.tile}")` }} /> : null}
      <div className="d01-empty__band" aria-hidden data-overlap={dy < 0 ? 'true' : undefined} style={{ left: bx0, top: seam + dy, width: 941, height: by1 - seam }}>
        <img src={E.src} alt="" draggable={false} style={{ top: by0 - seam }} />
      </div>
      <img className="jrn-d01__layer" data-layer="L1" data-layer-id="seal_22" src={E.seal} alt="" aria-hidden draggable={false} style={{ left: E.sealBox.x, top: E.sealBox.y, width: E.sealBox.w, height: E.sealBox.h }} />
      <h2 className="d01-empty__h" style={{ top: E.heading.y + lift, fontSize: f05BoardType(E.heading.size) }}>NO ACCOUNTS YET</h2>
      <p className="d01-empty__copy" style={{ top: E.copy.y + lift, fontSize: f05BoardType(E.copy.size) }}>
        <span>ADD YOUR FIRST ACCOUNT TO</span> <span>START TRACKING MONEY</span>
      </p>
      <div className="d01-empty__types" role="group" aria-label="ACCOUNT TYPES">
        {kinds.map(([k, lines, b]) => (
          <button key={k} type="button" className="d01-empty__type" data-jrn-trigger={`d01-empty-${k}`} aria-label={`ADD A ${lines.join(' ')}`} onClick={() => onAdd(k)} style={{ left: b[0], top: b[1] + dy, width: b[2] - b[0], height: b[3] - b[1] }}>
            <span className="d01-empty__type-name" style={{ fontSize: f05BoardType(E.typeSize) }}>
              <span>{lines[0]}</span> <span>{lines[1]}</span>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="d01-empty__strip" data-tone="dark" data-jrn-trigger="d01-add-first" onClick={() => onAdd()} style={{ left: E.add[0], top: E.add[1] + dy, width: E.add[2] - E.add[0], height: E.add[3] - E.add[1] }}>
        <span style={{ fontSize: f05BoardType(E.addSize) }}>ADD FIRST ACCOUNT</span>
      </button>
      <button type="button" className="d01-empty__strip" data-tone="paper" data-jrn-trigger="d01-learn-types" aria-haspopup="dialog" onClick={onLearn} style={{ left: E.learn[0], top: E.learn[1] + dy, width: E.learn[2] - E.learn[0], height: E.learn[3] - E.learn[1] }}>
        <span style={{ fontSize: f05BoardType(E.learnSize) }}>LEARN ACCOUNT TYPES</span>
      </button>
    </section>
  );
}

/** LEARN ACCOUNT TYPES: what each type is in JURNL, in the words the app already uses (no new product claims). */
export function AccountTypesOverlay({ onClose, onAdd }: { onClose: () => void; onAdd: (kind: 'bank' | 'payout' | 'cash' | 'credit') => void }) {
  const rows = [
    ['bank', 'BANK ACCOUNT', 'A CHECKING OR SAVINGS ACCOUNT. YOU ENTER THE BALANCE; NO BANK CONNECTION IS NEEDED.'],
    ['payout', 'RIDESHARE CARD', 'THE DEBIT CARD YOUR DRIVING PAYOUTS LAND ON. ITS MONEY COUNTS AS YOURS.'],
    ['cash', 'CASH ON HAND', 'NOTES AND COINS YOU KEEP. ADD CASH AND RECORD WHAT YOU SPEND.'],
    ['credit', 'CREDIT CARD', 'MONEY YOU OWE, NOT MONEY YOU HAVE. ITS BALANCE, LIMIT AND DUE DATE STAY APART FROM YOUR CASH.'],
  ] as const;
  return (
    <Dot01Overlay
      testId="d01-account-types"
      title={['ACCOUNT', 'TYPES']}
      subtitle="what each one is"
      onClose={onClose}
      contentRect={OVERLAY_CONTENT}
      contentScroll
      content={
        <Paper kind="sheet">
          <ul className="d01-list" aria-label="ACCOUNT TYPES">
            {rows.map(([k, name, note]) => (
              <li key={k} className="d01-row">
                <img src={CARD_SRC[k]} alt="" style={{ width: 64, height: 'auto', borderRadius: 6 }} />
                <span>
                  <b style={{ display: 'block' }}>{name}</b>
                  <small style={{ display: 'block', letterSpacing: '0.06em', opacity: 0.85 }}>{note}</small>
                </span>
                <button type="button" className="d01-btn d01-btn--quiet" data-jrn-trigger={`d01-types-add-${k}`} aria-label={`ADD A ${name}`} onClick={() => onAdd(k)}>
                  ADD
                </button>
              </li>
            ))}
          </ul>
        </Paper>
      }
    />
  );
}

function ReorderList({ ids, onDone }: { ids: string[]; onDone: () => void }) {
  const [order, setOrder] = useState(ids);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; y0: number; dy: number } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [announce, setAnnounce] = useState('');
  const byId = new Map(listActiveAccounts().map((a) => [a.account_id, a]));
  const move = (id: string, d: -1 | 1) => {
    const next = moveInOrder(order, id, d);
    setOrder(next);
    setAnnounce(`${byId.get(id)?.display_name ?? ''} MOVED TO POSITION ${next.indexOf(id) + 1} OF ${next.length}.`);
  };
  const rowH = () => (listRef.current?.firstElementChild as HTMLElement | null)?.getBoundingClientRect().height ?? 56;
  const onDown = (e: ReactPointerEvent, id: string) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ id, y0: e.clientY, dy: 0 });
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag) return;
    const dy = e.clientY - drag.y0;
    const step = rowH() + 6;
    if (Math.abs(dy) > step * 0.6) {
      const d = dy > 0 ? 1 : -1;
      const next = moveInOrder(order, drag.id, d as 1 | -1);
      if (next !== order) {
        setOrder(next);
        setDrag({ id: drag.id, y0: drag.y0 + d * step, dy: dy - d * step });
        return;
      }
    }
    setDrag({ ...drag, dy });
  };
  const onUp = () => setDrag(null);
  return (
    <>
      <Paper kind="sheet">
        <p className="d01-h">ALL ACCOUNTS</p>
        <ol className="d01-list" ref={listRef} aria-label="ACCOUNT ORDER" data-testid="d01-reorder" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {order.map((id, i) => {
            const a = byId.get(id);
            if (!a) return null;
            return (
              <li key={id} className="d01-reorder" data-dragging={drag?.id === id ? 'true' : 'false'} data-account-id={id} style={drag?.id === id ? { transform: `translateY(${drag.dy}px) scale(1.02)` } : undefined}>
                <img src={CARD_SRC[kindOf(a)]} alt="" />
                <span>{a.display_name}</span>
                <span className="d01-reorder__btns">
                  <button type="button" data-jrn-trigger={`d01-up-${id}`} aria-label={`MOVE ${a.display_name} UP`} disabled={i === 0} onClick={() => move(id, -1)}>
                    <Icon name="up" />
                  </button>
                  <button type="button" data-jrn-trigger={`d01-down-${id}`} aria-label={`MOVE ${a.display_name} DOWN`} disabled={i === order.length - 1} onClick={() => move(id, 1)}>
                    <Icon name="down" />
                  </button>
                </span>
                <span className="d01-reorder__grip" aria-hidden data-jrn-trigger={`d01-grip-${id}`} onPointerDown={(e) => onDown(e, id)}>
                  <Icon name="grip" />
                </span>
              </li>
            );
          })}
        </ol>
      </Paper>
      <p className="d01-sr" aria-live="polite">{announce}</p>
      {error ? <Alert role="alert">{error}</Alert> : null}
      <div className="d01-actions d01-actions--2">
        <Button
          trigger="d01-save-order"
          onClick={() => {
            const r = setAccountOrder(order);
            if (!r.ok) return setError(r.error);
            onDone();
          }}
        >
          SAVE ORDER
        </Button>
        <Button trigger="d01-cancel-order" quiet onClick={onDone}>
          CANCEL
        </Button>
      </div>
    </>
  );
}
