/**
 * Overlay continuity (OPUS4). One observer on the runtime's overlay host:
 *   · counts the open overlays (the director pauses obscured ambience while any is open);
 *   · when an overlay closes and nothing replaces it, a short reverse of its entrance plays on an inert copy of its last
 *     frame — the overlay itself is already gone from React and from the accessibility tree, focus has already returned,
 *     and the copy carries no ids, test ids, triggers or roles, takes no pointer and is removed when it ends.
 * When one overlay replaces another (a menu destination), no copy is made: the two never compete.
 */
import { motionDirector } from './director';

export const GHOST_MS = 220;
const GHOST_CLASS = 'jm-ghost';
/** Identity, behaviour and record attributes: a copy never answers a query for the real overlay, its art or its figures. */
const STRIP = [
  'id', 'data-testid', 'data-jrn-trigger', 'data-jrn-overlay', 'data-overlay-asset', 'data-asset-id', 'data-layer-id', 'data-account-id',
  'data-jrn-value', 'data-jrn-amount-cents', 'data-link', 'data-usd', 'data-jrn-zone', 'data-jrn-surface-host',
  'role', 'aria-modal', 'aria-labelledby', 'aria-describedby', 'aria-label', 'aria-live', 'aria-controls', 'tabindex', 'href', 'for', 'name', 'autofocus',
];

function live(host: Element): number {
  let n = 0;
  for (const c of host.children) if (!c.classList.contains(GHOST_CLASS)) n += 1;
  return n;
}

/** An inert, attribute-free copy of a closing overlay's last frame. */
export function ghostOf(node: Element): HTMLElement {
  const g = node.cloneNode(true) as HTMLElement;
  for (const el of [g, ...g.querySelectorAll('*')]) for (const a of STRIP) el.removeAttribute(a);
  for (const el of g.querySelectorAll('input, textarea, select, button')) (el as HTMLInputElement).disabled = true;
  g.classList.add(GHOST_CLASS);
  g.setAttribute('aria-hidden', 'true');
  g.setAttribute('inert', '');
  return g;
}

function fade(g: HTMLElement, timers?: Set<ReturnType<typeof setTimeout>>) {
  const anim = typeof g.animate === 'function' ? g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px) scale(0.994)' }], { duration: GHOST_MS, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }) : null;
  const drop = () => g.remove();
  anim?.addEventListener('finish', drop);
  anim?.addEventListener('cancel', drop);
  const t = setTimeout(drop, GHOST_MS + 120); // never leave a copy behind
  timers?.add(t);
}

/**
 * The same short exit for an anchored surface that lives outside the overlay host (the MANAGE POCKET note). Call it while
 * the node is still attached (its ref detaching): the copy is taken at once and shown one task later, and only if no
 * overlay replaced the surface in the meantime (a menu destination opens its own overlay: the two never compete).
 */
export function ghostAfterClose(node: HTMLElement | null) {
  const parent = node?.parentElement;
  const snap = motionDirector.snapshot();
  if (!node || !parent || snap.reduced || snap.hidden) return;
  const before = snap.overlays;
  const g = ghostOf(node);
  setTimeout(() => {
    if (!parent.isConnected || motionDirector.snapshot().overlays >= before) return; // replaced, or the page itself left
    parent.appendChild(g);
    fade(g);
  }, 0);
}

export function observeOverlayHost(host: HTMLElement): () => void {
  motionDirector.setOverlays(live(host));
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const mo = new MutationObserver((records) => {
    const added = records.some((r) => [...r.addedNodes].some((n) => n instanceof Element && !n.classList.contains(GHOST_CLASS)));
    const removed = records.flatMap((r) => [...r.removedNodes].filter((n): n is Element => n instanceof Element && !n.classList.contains(GHOST_CLASS)));
    motionDirector.setOverlays(live(host));
    const snap = motionDirector.snapshot();
    if (added || !removed.length || snap.reduced || snap.hidden) return;
    for (const node of removed) {
      const g = ghostOf(node);
      host.appendChild(g);
      fade(g, timers);
    }
  });
  mo.observe(host, { childList: true });
  return () => {
    mo.disconnect();
    for (const t of timers) clearTimeout(t);
    for (const g of [...host.querySelectorAll(`:scope > .${GHOST_CLASS}`)]) g.remove();
  };
}
