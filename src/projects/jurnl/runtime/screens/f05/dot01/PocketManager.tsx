/**
 * F05 DOT 01 — Pocket management: one MANAGE POCKET menu, two ways in.
 *
 *   ENTRY A  press and hold a Pocket (MONEY parent papers, ALL ACCOUNTS cards, the balance paper of a Pocket page);
 *            right-click, the ContextMenu key or Shift + F10 do the same with a mouse or keyboard
 *   ENTRY B  the MANAGE POCKET chip at the top right of a Pocket page
 *
 * Both call `open()` of the same manager, so there is one workflow: MANAGE POCKET → RENAME POCKET (canonical
 * `renameAccount`, by id) or DELETE POCKET (the canonical archive lifecycle of authorities 25 / 36, never a hard delete).
 * Nothing here computes or moves money.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { accountView, kindOf, type Dot01Kind } from '../../../../data/f05/dot01/accountView';
import { getTodayKey } from '../../../../data/foundation/dates';
import { renameAccount } from '../../../../data/ledger/ledgerOps';
import { checkPocketName, POCKET_NAME_MAX } from '../../../../data/f05/dot01/pocketName';
import { useJurnl } from '../../../state/store';
import { OverlayLayer } from '../../../components/primitives';
import { overlayShell } from '../../../global/overlays/eight/registry';
import { slot, useShellPlate } from '../../../surfaces/editorial/Shell';
import { Dot01Overlay, OVERLAY_CONTENT } from './Dot01Frame';
import { Alert, Button, Paper, Row, TextInput } from './kit';
import { ArchiveOverlay } from './sheets/AccountSheets';

/** Hold time and movement slop: long enough not to fire on a tap, short enough to feel direct; any drag cancels. */
export const LONG_PRESS_MS = 520;
export const LONG_PRESS_SLOP = 10;

export type LongPressBind = {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onContextMenu: (e: MouseEvent<HTMLElement>) => void;
  onClickCapture: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
};

/**
 * Long press for many items with one hook: `bind(key)` returns the handlers for one element. The hold is followed on
 * the window (pointermove / up / cancel / scroll / wheel), so a swipe, a scroll or a drag handled by a parent (the carousel)
 * cancels it even when that parent captures the pointer. The click that follows a completed hold is swallowed, so a
 * hold never also opens the Pocket.
 */
export function useLongPress(onLongPress: (el: HTMLElement, key: string) => void, disabled = false) {
  const hold = useRef<{ x: number; y: number; id: number; el: HTMLElement; key: string; timer: number } | null>(null);
  const firedAt = useRef(0);
  const cb = useRef(onLongPress);
  cb.current = onLongPress;
  const stop = useCallback(() => {
    const h = hold.current;
    if (!h) return;
    window.clearTimeout(h.timer);
    h.el.removeAttribute('data-holding');
    hold.current = null;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
    window.removeEventListener('scroll', stop, true);
    window.removeEventListener('wheel', stop, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = useCallback(
    (e: globalThis.PointerEvent) => {
      const h = hold.current;
      if (h && e.pointerId === h.id && Math.hypot(e.clientX - h.x, e.clientY - h.y) > LONG_PRESS_SLOP) stop();
    },
    [stop],
  );
  useEffect(() => stop, [stop]);
  const fire = (el: HTMLElement, key: string, fromPointer: boolean) => {
    if (fromPointer) firedAt.current = Date.now();
    try {
      navigator.vibrate?.(12);
    } catch {
      /* no haptics here */
    }
    cb.current(el, key);
  };
  const bind = (key: string): LongPressBind => ({
    onPointerDown: (e) => {
      if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      stop();
      const el = e.currentTarget;
      el.setAttribute('data-holding', 'true');
      const timer = window.setTimeout(() => {
        stop();
        fire(el, key, true);
      }, LONG_PRESS_MS);
      hold.current = { x: e.clientX, y: e.clientY, id: e.pointerId, el, key, timer };
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
      window.addEventListener('scroll', stop, true);
      // a wheel or trackpad scroll during the press is a scroll, not a hold (even where nothing can scroll)
      window.addEventListener('wheel', stop, { capture: true, passive: true });
    },
    // right-click on a desktop, the platform's own long-press menu on touch: ours instead
    onContextMenu: (e) => {
      if (disabled) return;
      e.preventDefault();
      const recent = Date.now() - firedAt.current < 900;
      stop();
      if (!recent) fire(e.currentTarget, key, true);
    },
    onClickCapture: (e) => {
      if (Date.now() - firedAt.current < 900) {
        e.preventDefault();
        e.stopPropagation();
        firedAt.current = 0;
      }
    },
    onKeyDown: (e) => {
      if (disabled) return;
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
        e.preventDefault();
        fire(e.currentTarget, key, false);
      }
    },
  });
  return { bind };
}

/** MANAGE POCKET: a parchment menu anchored to the Pocket (or its chip). */
function PocketMenu({ anchor, name, kind, onRename, onDelete, onClose }: { anchor: HTMLElement; name: string; kind: Dot01Kind; onRename: () => void; onDelete: () => void; onClose: (refocus: boolean) => void }) {
  const ref = useRef<HTMLElement | null>(anchor);
  ref.current = anchor;
  const box = useRef<HTMLDivElement | null>(null);
  const plate = useShellPlate(0.9);
  const pressedOutside = useRef(false);
  // The card is centred, so the release of the long press that opened it can land on a strip: an item acts only on a
  // press that started on it, or on the keyboard (Enter / Space dispatch a click with detail 0).
  const armed = useRef<string | null>(null);
  const press = (id: string, act: () => void) => ({
    onPointerDown: () => (armed.current = id),
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0 || armed.current === id) act();
      armed.current = null;
    },
  });
  // the popover mounts a frame after the menu (it measures its anchor first): focus the first item when it arrives
  const attach = useCallback((el: HTMLDivElement | null) => {
    box.current = el;
    el?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
  }, []);
  // Escape closes from anywhere while the menu is open (focus may still be on the held Pocket on some platforms)
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      closeRef.current(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(box.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const to = (n: number) => items[(n + items.length) % items.length]?.focus();
    if (e.key === 'ArrowDown') (e.preventDefault(), to(i + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), to(i - 1));
    else if (e.key === 'Home') (e.preventDefault(), to(0));
    else if (e.key === 'End') (e.preventDefault(), to(items.length - 1));
    else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    } else if (e.key === 'Tab') onClose(false);
  };
  return (
    // founder OV04 shell, placed full-frame (never cropped to its card and recentred) at 90 % of the screen width, over a
    // blur of the live page; the paperclip, coast and the salmon delete strip are the shell's. Tap outside the card closes.
    <OverlayLayer>
      <div ref={plate.ref} className="jsh-host" data-jrn-overlay="d01-pocket-menu" data-shell="OV04" data-overlay-asset="OV04">
        {/* outside-tap dismiss: only a press that STARTS on the scrim closes it — the release of the long press that
            opened the menu lands here too, and must not close it (the old popover ignored that release the same way) */}
        <div
          className="jsh-scrim"
          data-blur="true"
          onPointerDown={() => (pressedOutside.current = true)}
          onClick={() => {
            if (pressedOutside.current) onClose(false);
            pressedOutside.current = false;
          }}
          aria-hidden
        />
        <div className="jsh-plate" style={{ width: plate.w, height: plate.h }}>
          <img className="jsh-shell" src={OV04.src} width={OV04.width} height={OV04.height} alt="" aria-hidden draggable={false} data-asset-id="OV04" />
          <div className="jsh-card" data-testid="d01-pocket-menu" style={slot(OV04_BOX.card)}>
            <div ref={attach} role="menu" aria-label={`MANAGE POCKET: ${name}`} onKeyDown={onKey} className="jsh-card__menu">
              <div className="jsh-card__head" aria-hidden style={slot(OV04_BOX.head)}>
                <p className="jsh-card__title">MANAGE POCKET</p>
                <p className="jsh-card__sub">{name}</p>
                {KIND_LABEL[kind] !== name.toUpperCase() ? <p className="jsh-text">{KIND_LABEL[kind]}</p> : null}
              </div>
              <button type="button" role="menuitem" className="jsh-action" data-tone="paper" data-jrn-trigger="d01-pocket-rename" {...press('rename', onRename)} style={slot(OV04_BOX.rename)}>
                <span className="jsh-action__title">RENAME POCKET</span>
              </button>
              <button type="button" role="menuitem" className="jsh-action" data-tone="salmon" data-jrn-trigger="d01-pocket-delete" {...press('delete', onDelete)} style={slot(OV04_BOX.delete)}>
                <span className="jsh-action__title">DELETE POCKET</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </OverlayLayer>
  );
}

/** OV04 regions: the card (the shell's visible alpha bounds) and, relative to it, the head and the two strips. */
const OV04_BOX = {
  card: [0.018, 0.243, 0.963, 0.722],
  head: [0.1, 0.2, 0.56, 0.44],
  rename: [0.109, 0.507, 0.955, 0.67],
  delete: [0.109, 0.711, 0.955, 0.875],
} as const;
const KIND_LABEL: Record<Dot01Kind, string> = { bank: 'BANK ACCOUNT', payout: 'PAYOUT CARD', cash: 'CASH', credit: 'CREDIT CARD' };
const OV04 = overlayShell('OV04');

/** RENAME POCKET: current name, the editable name, CANCEL and SAVE NAME. Rename by id; balances and history untouched. */
export function RenamePocketOverlay({ accountId, onClose, onSaved }: { accountId: string; onClose: () => void; onSaved: (name: string) => void }) {
  const v = accountView(accountId, getTodayKey());
  const [name, setName] = useState(v?.account.display_name ?? '');
  const [error, setError] = useState<string | null>(null);
  if (!v) return null;
  const current = v.account.display_name;
  const save = () => {
    const c = checkPocketName(name, current);
    if (!c.ok) return setError(c.error);
    if (c.unchanged) return onClose();
    const r = renameAccount(accountId, c.name);
    if (!r.ok) return setError(r.error.replace('ANOTHER ACCOUNT IS ALREADY CALLED', 'ANOTHER POCKET IS ALREADY CALLED').replace('ACCOUNT NOT FOUND', 'POCKET NOT FOUND'));
    onSaved(r.value.display_name);
  };
  return (
    <Dot01Overlay
      testId="d01-rename-pocket"
      env="SK03_FIELD"
      title={['RENAME', 'POCKET']}
      subtitle="the name only changes"
      onClose={onClose}
      contentRect={OVERLAY_CONTENT}
      contentScroll
      label="RENAME POCKET"
      content={
        <>
          {/* one sheet, as the DELETE THIS POCKET? surface: the names, the error when there is one, then the actions */}
          <Paper kind="sheet">
            <div className="d01-rows">
              <Row icon="tag" label="CURRENT NAME" value={current} testId="d01-pocket-current-name" />
            </div>
            <TextInput label="POCKET NAME" icon="edit" value={name} onValue={(x) => (setName(x), setError(null))} trigger="d01-pocket-name" maxLength={POCKET_NAME_MAX} hint="BALANCES AND HISTORY STAY AS THEY ARE" stack />
            {error ? <Alert role="alert" testId="d01-pocket-name-error">{error}</Alert> : null}
            <div className="d01-actions d01-actions--2" style={{ marginTop: 10 }}>
              <Button trigger="d01-cancel-rename" quiet onClick={onClose}>CANCEL</Button>
              <Button trigger="d01-save-name" icon="check" onClick={save}>SAVE NAME</Button>
            </div>
          </Paper>
        </>
      }
    />
  );
}

type Step = 'menu' | 'rename' | 'delete';

/**
 * The one manager every entry point uses. `where` decides only what happens after a delete: a Pocket page leaves
 * (back to where the person came from, or ALL ACCOUNTS); the parent and the directory stay and redraw.
 */
export function usePocketManager(where: 'detail' | 'directory' | 'parent') {
  const { go, back, showToast } = useJurnl();
  const [st, setSt] = useState<{ id: string; anchor: HTMLElement | null; step: Step } | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const open = useCallback((id: string, anchor: HTMLElement | null) => {
    setSt((prev) => {
      if (prev?.id === id && prev.step === 'menu') {
        anchorRef.current = anchor ?? prev.anchor;
        window.setTimeout(() => anchorRef.current?.focus({ preventScroll: true }), 0);
        return null;
      }
      anchorRef.current = anchor;
      return { id, anchor, step: 'menu' };
    });
  }, []);
  const close = useCallback((refocus = true) => {
    setSt(null);
    if (refocus) window.setTimeout(() => anchorRef.current?.focus({ preventScroll: true }), 0);
  }, []);
  const v = st ? accountView(st.id, getTodayKey()) : null;
  let node: ReactNode = null;
  if (st && v && !v.archived) {
    if (st.step === 'menu' && st.anchor)
      node = <PocketMenu anchor={st.anchor} name={v.account.display_name} kind={kindOf(v.account)} onClose={close} onRename={() => setSt({ ...st, step: 'rename' })} onDelete={() => setSt({ ...st, step: 'delete' })} />;
    else if (st.step === 'rename')
      node = (
        <RenamePocketOverlay
          accountId={st.id}
          onClose={() => close(true)}
          onSaved={(name) => {
            close(true);
            showToast({ tone: 'success', title: 'POCKET RENAMED', body: `NOW CALLED ${name}. BALANCES AND HISTORY ARE UNCHANGED.`, testId: 'd01-pocket-renamed' });
          }}
        />
      );
    else if (st.step === 'delete')
      node = (
        <ArchiveOverlay
          accountId={st.id}
          mode="delete"
          onClose={() => close(true)}
          onDone={() => {
            setSt(null);
            showToast({ tone: 'success', title: 'POCKET DELETED', body: 'IT LEFT YOUR ACTIVE POCKETS. ITS HISTORY STAYS SAVED.', testId: 'd01-pocket-deleted' });
            if (where === 'detail') {
              if (!back()) go('money/places');
            }
          }}
        />
      );
  }
  return { open, node, openFor: st?.step === 'menu' ? st.id : null };
}
