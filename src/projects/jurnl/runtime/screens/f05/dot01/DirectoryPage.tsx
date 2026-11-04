/**
 * F05 DOT 01 — ALL ACCOUNTS (authority 06), its empty state (22) and REORDER ACCOUNTS (32).
 * Any number of places, in the user's order (settings.accountOrder). Reordering changes only that preference: no
 * balance, id or ledger record moves. Drag with the grip, or use the up / down buttons (keyboard and screen readers).
 */
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { listActiveAccounts } from '../../../../data/foundation/accounts';
import { getTodayKey } from '../../../../data/foundation/dates';
import { useCurrency, useRepoTick } from '../../../../data/home/money';
import { computeMoneyPicture } from '../../../../data/ledger/moneyPicture';
import { getRepository } from '../../../../data/repository/deviceRepository';
import { moveInOrder, orderAccounts, setAccountOrder } from '../../../../data/f05/dot01/accountOrder';
import { kindOf } from '../../../../data/f05/dot01/accountView';
import { reviewIssues } from '../../../../data/f05/dot01/reconciliation';
import { useJurnl } from '../../../state/store';
import { Dot01Frame } from './Dot01Frame';
import { Icon } from './icons';
import { AccountCard, Alert, Button, CARD_SRC, Paper, money } from './kit';
import { Dot01Sheets, type Dot01SheetState } from './sheets/Dot01Sheets';

export function DirectoryPage() {
  const { go, back } = useJurnl();
  useCurrency();
  useRepoTick();
  const [sheet, setSheet] = useState<Dot01SheetState>(null);
  const [reorder, setReorder] = useState(false);
  const today = getTodayKey();
  const accounts = orderAccounts(listActiveAccounts());
  const snap = getRepository().getSnapshot();
  const pic = computeMoneyPicture(snap.accounts, snap.creditAttributes, snap.transactions, today);
  const pos = (id: string) => pic.positions.find((p) => p.account_id === id);
  const empty = accounts.length === 0;
  const chips = [{ id: 'd01-back', label: 'BACK TO MONEY', icon: 'back' as const, onClick: () => back() || go('money') }];
  const content = empty ? (
    <EmptyAccounts onAdd={(kind) => setSheet({ kind: 'add-account', preset: kind })} />
  ) : reorder ? (
    <ReorderList ids={accounts.map((a) => a.account_id)} onDone={() => setReorder(false)} />
  ) : (
    <>
      <div className="d01-grid" role="list" aria-label="YOUR PLACES">
        {accounts.map((a, i) => {
          const p = pos(a.account_id);
          const issues = reviewIssues(a.account_id, today);
          return (
            <div role="listitem" key={a.account_id} style={{ ['--i' as string]: i } as CSSProperties} className="d01-slip">
              <AccountCard account={a} amount={p?.nature === 'LIABILITY' ? p.owed : (p?.held ?? 0)} liability={p?.nature === 'LIABILITY'} trigger={`d01-place-${a.account_id}`} badge={issues.length ? 'NEEDS REVIEW' : undefined} onOpen={() => go(issues.length ? `money/places/${a.account_id}/attention` : `money/places/${a.account_id}`)} />
            </div>
          );
        })}
      </div>
      <div className="d01-actions d01-actions--2">
        <Button trigger="d01-add-account" icon="plus" onClick={() => setSheet({ kind: 'add-account' })}>
          ADD ACCOUNT
        </Button>
        <Button trigger="d01-reorder" quiet icon="arrows" disabled={accounts.length < 2} onClick={() => setReorder(true)}>
          REORDER
        </Button>
      </div>
      <p className="d01-note" data-testid="d01-directory-summary" style={{ textAlign: 'center', color: '#efe3cb' }}>
        {`${accounts.length} ${accounts.length === 1 ? 'PLACE' : 'PLACES'} · ${money(pic.summary.ownedAssets)} HELD${pic.summary.owed > 0 ? ` · ${money(pic.summary.owed)} OWED` : ''}`}
      </p>
    </>
  );
  return (
    <Dot01Frame
      screenId="F05.ACCOUNTS"
      env="SK02_FIELD"
      title={reorder ? ['ACCOUNTS'] : ['ALL', 'ACCOUNTS']}
      subtitle={reorder ? 'reorder accounts' : empty ? 'nothing added yet' : undefined}
      testId="d01-directory"
      label={reorder ? 'REORDER ACCOUNTS' : 'ALL ACCOUNTS'}
      chips={chips}
      contentRect={{ x: 30, y: 600, w: 881, h: 1066 }}
      contentScroll
      content={content}
      overlays={<Dot01Sheets state={sheet} onClose={() => setSheet(null)} />}
    />
  );
}

function EmptyAccounts({ onAdd }: { onAdd: (kind?: 'bank' | 'payout' | 'cash' | 'credit') => void }) {
  const kinds = [
    ['bank', 'BANK ACCOUNT'],
    ['payout', 'RIDESHARE CARD'],
    ['cash', 'CASH ON HAND'],
    ['credit', 'CREDIT CARD'],
  ] as const;
  return (
    <>
      <Paper kind="panel" testId="d01-empty-accounts">
        <p className="d01-h">NO ACCOUNTS YET</p>
        <p className="d01-note" style={{ textAlign: 'center' }}>
          ADD YOUR FIRST ACCOUNT TO START TRACKING MONEY. YOU ENTER THE BALANCE; NO BANK CONNECTION IS NEEDED.
        </p>
      </Paper>
      <div className="d01-grid">
        {kinds.map(([k, label]) => (
          <button key={k} type="button" className="d01-card d01-card--compact" data-jrn-trigger={`d01-empty-${k}`} aria-label={`ADD A ${label}`} onClick={() => onAdd(k)}>
            <img className="d01-card__art" src={CARD_SRC[k]} alt="" draggable={false} />
            <span className="d01-card__name">
              {label.split(' ').length > 2 ? [label.split(' ').slice(0, 1).join(' '), label.split(' ').slice(1).join(' ')].map((l) => <span key={l}>{l}</span>) : label.split(' ').map((l) => <span key={l}>{l}</span>)}
            </span>
          </button>
        ))}
      </div>
      <div className="d01-actions">
        <Button trigger="d01-add-first" icon="bank" onClick={() => onAdd()}>
          ADD FIRST ACCOUNT
        </Button>
      </div>
    </>
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
        <ol className="d01-list" ref={listRef} aria-label="ACCOUNT ORDER" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
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
