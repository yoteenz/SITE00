/**
 * F05 MONEY parent — layered motion pilot (P0.JURNL.F05-MONEY.PARENT-ANIMATED-COLLAGE-RECONSTRUCTION-AND-FIDELITY-PILOT).
 *
 * Layers, bottom to top:
 *   L0 environment   text-free SIDEKICK (top slice · elastic panel tile · bottom slice), ambient copy on wide screens
 *   L1 collage       title paper and wax seal: real alpha, independent entrance (scale-only envelopes, verified)
 *   L2 live type     JURNL, MONEY, the lowercase script line, HELD / OWED / COMMITTED / AVAILABLE — DOM text
 *   L3 carousel      four collections of four papers in one region: ACCOUNTS (id-bound places) · TRANSFERS ·
 *                    COMMITMENTS · OUTLOOK. Only this layer moves between collections; four dots name the active one.
 *   L4 chrome        corner chips, the global five-item dock (re-seated on the nav paper), overlays
 * The page is opt-in (?parent=motion) until the founder approves it; the cabinet hub stays the default.
 * The active collection lives in the URL (?c=), so overlays, child routes and back return to it.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { COLLECTIONS, computeMoneyCarousel, type CarouselPanel, type CollectionId } from '../../../data/f05/moneyCarousel';
import { type MoneyParentAccount, type MoneyParentTransfer, type MoneyPaperArt } from '../../../data/f05/moneyParentReading';
import { formatMoney, useCurrency, useRepoTick } from '../../../data/home/money';
import { JurnlButton, JurnlDrawer } from '../../components/primitives';
import { JurnlProductNav } from '../../components/ProductNav';
import { SafeHorizonSheet } from '../../finance/SafeHorizonSheet';
import { TransferDetailSheet, TransferSheet } from '../../finance/FinanceSheets';
import { AskJurnlSheet, QuickAddV2Sheet } from '../../global/GlobalSheets';
import { useJurnl } from '../../state/store';
import { JurnlScreen, type FamilyPlate } from '../JurnlScreen';
import { AddPlaceSheet } from '../MoneyScreens';
import { accountItems, computeF05MotionLayout, PAPERS_PER_COLLECTION, SEAM_A, SEAM_C, SRC_H, SRC_W, toScreen, type Rect } from './f05MotionLayout';
import { F05_COMPOSITION as C } from './f05Composition';
import { amountSize, CarouselPanelPaper, nameFont } from './CarouselPanelPaper';
import { useMoneyCarousel } from './useMoneyCarousel';
import geometry from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_GEOMETRY.json';
import sidekick from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_SIDEKICK.webp';
import panelTile from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_PANEL_TILE.webp';
import paperTile from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_PAPER_TILE.webp';
import tornEdge from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_TORN_EDGE.webp';
import titlePaper from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_TITLE_PAPER.webp';
import waxSeal from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_WAX_SEAL.webp';
import cardBank from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_BANK.webp';
import cardPayout from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_PAYOUT.webp';
import cardCash from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CASH.webp';
import cardCredit from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_CARD_CREDIT.webp';
import './jurnl-f05-motion.css';
import './jurnl-f05-carousel.css';

export const F05_MOTION_PLATE: FamilyPlate = { family: 'F05', scene: 'ENV.MOTION_PILOT', src: sidekick, assetId: 'MONEY.ENVIRONMENT.MOTION_PILOT.SIDEKICK.V1', width: SRC_W, height: SRC_H };
const ART: Record<MoneyPaperArt, string> = { bank: cardBank, payout: cardPayout, cash: cardCash, credit: cardCredit };
const RETURN_KEY = 'jurnl.f05.motion.return';
const box = (r: { box: number[] }): Rect => ({ x: r.box[0]!, y: r.box[1]!, w: r.box[2]! - r.box[0]!, h: r.box[3]! - r.box[1]! });
const at = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });
const TITLE = box(geometry.title_paper);
const SEAL = box(geometry.wax_seal);
/** Approved chip squares (source px). The global menu takes the far-right square; search and add move one left. */
const CHIP = C.chips.size;
const CHIP_GAP = C.chips.gap;
const CHIP_TOP = C.chips.top;
const CHIP_RIGHT = C.chips.right;
/** Approved top, but never under a notch or status bar (board px = screen px / u). */
const CHIP_TOP_SAFE = `max(${CHIP_TOP}px, calc((env(safe-area-inset-top, 0px) + 8px) / var(--f05m-u, 1)))`;
/** Approved metric column centres (source px). */
const METRIC_X = C.band.centers;
const DIVIDERS = C.band.dividers;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

function readReturn(): string | null {
  try {
    const v = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    return v;
  } catch {
    return null;
  }
}

type Pt = { x: number; y: number };
type Thread = { t: MoneyParentTransfer; a: Pt; c: Pt; b: Pt; token: Pt };

const bez = (p: Thread, k: number): Pt => ({
  x: (1 - k) * (1 - k) * p.a.x + 2 * (1 - k) * k * p.c.x + k * k * p.b.x,
  y: (1 - k) * (1 - k) * p.a.y + 2 * (1 - k) * k * p.c.y + k * k * p.b.y,
});

/**
 * Where a transfer's thread runs, from its canonical state only. Not left yet (scheduled, submitted, unconfirmed):
 * the token rests at the source. In transit / returning: the token rests between the papers. Finished: no thread.
 */
/** Lowest board y a resting token's centre may reach: the metric buttons end at labelTop − 12 + 104 (CSS height),
 *  then half the token (24) and a 6 px margin. */
const TOKEN_MIN_Y = C.band.labelTop - 12 + 104 + 24 + 6;

function threadFor(t: MoneyParentTransfer, A: Rect, B: Rect): Thread {
  const sameRow = Math.abs(A.y - B.y) < 20;
  let a: Pt;
  let b: Pt;
  let c: Pt;
  let outward: number; // which side of the source edge a resting token sits on (−1 above, +1 below)
  if (sameRow) {
    a = { x: A.x + A.w / 2, y: A.y };
    b = { x: B.x + B.w / 2, y: B.y };
    // the arc rises up to 74 board px, but a token resting on it stays clear of the summary band
    const top = Math.min(a.y, b.y);
    c = { x: (a.x + b.x) / 2, y: Math.max(top - 74, 2 * TOKEN_MIN_Y - top) };
    outward = -1;
  } else {
    const down = A.y < B.y;
    // right of the transfer slip (bottom-left) and left of the chevron
    a = { x: A.x + A.w * 0.86, y: down ? A.y + A.h : A.y };
    b = { x: B.x + B.w * 0.86, y: down ? B.y : B.y + B.h };
    c = { x: (a.x + b.x) / 2 + (Math.abs(a.x - b.x) < 1 ? 70 : 0), y: (a.y + b.y) / 2 };
    outward = down ? 1 : -1;
  }
  const between = t.state === 'IN_TRANSIT' || t.state === 'RETURNING';
  const th: Thread = { t, a, c, b, token: { x: 0, y: 0 } };
  // Not left yet: the token rests on the source paper's edge. Left, not arrived: it rests between the papers.
  th.token = between ? bez(th, 0.5) : { x: a.x, y: a.y + outward * 26 };
  return th;
}

/** Token words: a display of the canonical state, in the words of its kind (#1706 labels, shortened). */
const SHORT: Record<'TRANSFER' | 'CARD_PAYMENT', Record<string, string>> = {
  TRANSFER: { SCHEDULED: 'PLANNED', PENDING: 'NOT LEFT', IN_TRANSIT: 'IN TRANSIT', RETURNING: 'COMING BACK', NEEDS_RECONCILIATION: 'CONFIRM?' },
  CARD_PAYMENT: { SCHEDULED: 'SCHEDULED', PENDING: 'SUBMITTED', IN_TRANSIT: 'NOT CONFIRMED', RETURNING: 'FAILED', NEEDS_RECONCILIATION: 'CONFIRM?' },
};

type Sheet = null | 'actions' | 'add' | 'move' | 'period';

const COLLECTION_LABEL: Record<CollectionId, string> = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c.label])) as Record<CollectionId, string>;
const slideLabel = (id: CollectionId) => `${COLLECTION_LABEL[id]}, ${COLLECTIONS.findIndex((c) => c.id === id) + 1} OF ${COLLECTIONS.length}`;

export function MoneyMotionParent() {
  const { go, overlay, openOverlay, closeOverlay, showToast } = useJurnl();
  useCurrency();
  useRepoTick();
  const reduced = useReducedMotion();
  const carousel = computeMoneyCarousel(undefined, formatMoney);
  const reading = carousel.reading;
  const stageRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 393, h: 852 });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [returned] = useState(readReturn);
  const [fresh, setFresh] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [ghosts, setGhosts] = useState<(Thread & { outcome: 'resolved' | 'closed' })[]>([]);
  const prevThreads = useRef<Thread[]>([]);
  const navigating = useRef(false);
  const { active, index: activeIndex, transition, surface, step, select, handlers } = useMoneyCarousel(reduced);
  const [moved, setMoved] = useState(false);
  const [announce, setAnnounce] = useState('');
  const firstActive = useRef(active);
  const focusAfter = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => el.clientWidth && el.clientHeight && setVp({ w: el.clientWidth, h: el.clientHeight });
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Every collection is the same 2 x 2 grid in the same places: the shell never moves between collections.
  const L = useMemo(() => computeF05MotionLayout(vp.w, vp.h, PAPERS_PER_COLLECTION), [vp.w, vp.h]);
  // A place just added is shown even when there are more than four (it takes the third paper beside ALL PLACES).
  // A place just added is shown even when it is beyond the first four (it takes the fourth paper until the page changes).
  const baseItems = accountItems(reading.accounts.length);
  const freshIndex = fresh ? reading.accounts.findIndex((a) => a.account_id === fresh) : -1;
  const items = freshIndex >= PAPERS_PER_COLLECTION ? baseItems.map((it, i) => (i === PAPERS_PER_COLLECTION - 1 ? { kind: 'account' as const, index: freshIndex } : it)) : baseItems;

  // Threads for unfinished transfers whose two places both have a paper (canonical state only).
  const slotOf = new Map<string, Rect>();
  items.forEach((it, i) => {
    if (it.kind === 'account' && L.slots[i]) slotOf.set(reading.accounts[it.index]!.account_id, L.slots[i]!);
  });
  const threads: Thread[] = reading.transfers.filter((t) => t.fromId && t.toId && slotOf.has(t.fromId) && slotOf.has(t.toId)).map((t) => threadFor(t, slotOf.get(t.fromId!)!, slotOf.get(t.toId!)!));
  const threadKey = threads.map((t) => `${t.t.linkId}:${t.t.state}`).join('|');
  // A thread that leaves the open set resolves only after the ledger says so: COMPLETED resolves into the
  // destination, anything else (cancelled, failed, reversed) simply closes. The balances have already changed.
  useEffect(() => {
    const gone = prevThreads.current.filter((p) => !threads.some((t) => t.t.linkId === p.t.linkId));
    prevThreads.current = threads;
    if (!gone.length || reduced) return;
    setGhosts(gone.map((g) => ({ ...g, outcome: reading.transferStates[g.t.linkId] === 'COMPLETED' ? 'resolved' : 'closed' })));
    const id = window.setTimeout(() => setGhosts([]), 520);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadKey]);

  // A collection change is announced once, politely; the first collection on arrival is not.
  useEffect(() => {
    if (active === firstActive.current && !moved) return;
    setMoved(true);
    setAnnounce(`${slideLabel(active)}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Keyboard: focus follows the change to the paper in the same place of the new collection.
  const surfaceEl = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const k = focusAfter.current;
    focusAfter.current = null;
    if (k == null) return;
    const papers = surfaceEl.current?.querySelectorAll<HTMLElement>('.jrn-f05m__paper');
    papers?.[Math.min(k, papers.length - 1)]?.focus({ preventScroll: true });
  }, [active]);
  const onCarouselKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const t = e.target as HTMLElement;
    const paper = t.closest('.jrn-f05m__paper');
    if (paper && surfaceEl.current) focusAfter.current = Array.from(surfaceEl.current.querySelectorAll('.jrn-f05m__paper')).indexOf(paper);
    handlers.onKeyDown(e);
  };

  // Chips: the approved two squares, shifted one square left so the global menu sits where the approved "+" was.
  const chipRight = Math.min(CHIP_RIGHT, L.visibleX[1] - 14);
  const plusX = chipRight - CHIP - (CHIP + CHIP_GAP);
  const searchX = plusX - CHIP - CHIP_GAP;
  const menuX = chipRight - CHIP;

  // The dock and the global menu live outside this screen (viewport hosts); place them on the board through CSS vars.
  useLayoutEffect(() => {
    const root = stageRef.current?.closest('.jrn') as HTMLElement | null;
    if (!root) return;
    root.setAttribute('data-jrn-f05-motion', '');
    const nav = toScreen(L, L.navZone);
    const menu = toScreen(L, { x: menuX, y: CHIP_TOP, w: CHIP, h: CHIP });
    const vars: Record<string, string> = {
      '--f05m-nav-x': `${nav.x}px`,
      '--f05m-nav-w': `${nav.w}px`,
      '--f05m-nav-h': `${nav.h}px`,
      '--f05m-nav-b': `${vp.h - (nav.y + nav.h)}px`,
      '--f05m-menu-x': `${menu.x}px`,
      '--f05m-menu-y': `${menu.y}px`,
      '--f05m-chip': `${menu.w}px`,
      '--f05m-u': String(L.u),
      '--f05m-nav-gap': String(C.nav.gap),
      '--f05m-nav-label': String(C.nav.labelSize),
      '--f05m-paper-url': `url("${paperTile}")`,
      '--f05m-edge-url': `url("${tornEdge}")`,
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      root.removeAttribute('data-jrn-f05-motion');
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [L, menuX, vp.h]);

  const openPlace = useCallback(
    (a: MoneyParentAccount, el: HTMLElement) => {
      if (navigating.current) return;
      navigating.current = true;
      try {
        sessionStorage.setItem(RETURN_KEY, a.account_id);
      } catch {
        /* per-viewer convenience only */
      }
      const target = `money/places/${a.account_id}`;
      const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void>; skipTransition: () => void } };
      if (reduced || !doc.startViewTransition) {
        go(target);
        return;
      }
      // The selected paper carries its identity into the account route (shared element); no delay before routing.
      el.style.setProperty('view-transition-name', 'jrn-place');
      el.setAttribute('data-lifted', 'true');
      const t = doc.startViewTransition(() => flushSync(() => go(target)));
      const skip = () => t.skipTransition();
      window.addEventListener('popstate', skip, { once: true });
      t.finished.finally(() => window.removeEventListener('popstate', skip));
    },
    [go, reduced],
  );

  /** A panel opens its owner's page or sheet. Opening never writes. */
  const openPanel = (p: CarouselPanel) => {
    const d = p.dest;
    if (d.kind === 'transfer') setDetail(d.linkId);
    else if (d.kind === 'period') setSheet('period');
    else go(d.route, d.query);
  };

  // With no places of the user's own, Safe to Spend reads the sample preview: say nothing rather than a sample figure.
  const unknown = reading.cashSource === 'MOCK';
  const metrics = [
    { id: 'held', label: 'HELD', value: reading.held, aria: `HELD: ${formatMoney(reading.held)} IN YOUR ACCOUNTS. OPENS PLACES.`, onOpen: () => go('money/places') },
    { id: 'owed', label: 'OWED', value: reading.owed, aria: `OWED: ${formatMoney(reading.owed)} ON CARDS AND LOANS. OPENS CREDIT.`, onOpen: () => go('credit') },
    { id: 'committed', label: 'COMMITTED', value: reading.committed, aria: unknown ? 'COMMITTED: NOT KNOWN UNTIL YOU ADD A PLACE.' : `COMMITTED: ${formatMoney(reading.committed)} HELD BACK FOR BILLS, CARD MINIMUMS AND PLANS IN THE NEXT 30 DAYS. OPENS THE PLANNING PERIOD.`, onOpen: () => setSheet('period') },
    { id: 'available', label: 'AVAILABLE', value: reading.available, aria: unknown ? 'AVAILABLE: NOT KNOWN UNTIL YOU ADD A PLACE.' : `AVAILABLE: ${formatMoney(reading.available)}, SAFE TO SPEND FOR THE NEXT 30 DAYS. OPENS THE PLANNING PERIOD.`, onOpen: () => setSheet('period') },
  ];

  // A summary column never reaches past the visible board (narrow phones crop the sides).
  const metricW = (i: number) => Math.min(C.band.width, 2 * Math.min(METRIC_X[i]! - L.visibleX[0], L.visibleX[1] - METRIC_X[i]!) - 4);
  const S = L.u;
  // Entrance stagger: the last of the four papers starts by 410 ms (ends by 610 ms).
  const stagger = Math.min(45, 70 / (PAPERS_PER_COLLECTION - 1));
  const boardStyle: CSSProperties = {
    width: SRC_W,
    height: L.boardH,
    transform: `translate(${L.ox}px, 0) scale(${S})`,
    ['--f05m-stagger' as string]: `${stagger}ms`,
    // composition (source px) for the stylesheet
    ['--f05m-w' as string]: `${SRC_W}px`,
    ['--f05m-h' as string]: `${SRC_H}px`,
    ['--f05m-label-size' as string]: `${C.band.labelSize}px`,
    ['--f05m-value-size' as string]: `${C.band.valueSize}px`,
    ['--f05m-value-gap' as string]: `${C.band.valueTop - C.band.labelTop - C.band.labelSize}px`,
    ['--f05m-caption-top' as string]: `${C.band.captionTop}px`,
    ['--f05m-name-left' as string]: `${C.card.nameLeft}px`,
    ['--f05m-name-top' as string]: `${C.card.nameTop}px`,
    ['--f05m-name-line' as string]: String(C.card.nameLine),
    ['--f05m-name-size' as string]: `${C.card.nameSize}px`,
    ['--f05m-name-ls' as string]: `${C.card.nameLs}em`,
    ['--f05m-amount-size' as string]: `${C.card.amountSize}px`,
    ['--f05m-amount-top' as string]: `${C.card.amountTop}px`,
    ['--f05m-note-top' as string]: `${C.card.noteTop}px`,
    ['--f05m-chev-right' as string]: `${C.card.chevRight}px`,
    ['--f05m-chev-bottom' as string]: `${C.card.chevBottom}px`,
    ['--f05m-chip-radius' as string]: `${C.chips.radius}px`,
  } as CSSProperties;

  // Carousel geometry (source px): the swipe zone covers the papers and the dots; steps sit at the visible edges.
  const gridTop = L.slots[0]!.y;
  const gridBottom = Math.max(...L.slots.map((r) => r.y + r.h));
  const swipeZone: Rect = { x: L.visibleX[0], y: gridTop - 24, w: L.visibleX[1] - L.visibleX[0], h: L.dots.y + L.dots.h + 12 - (gridTop - 24) };
  const stepTop = (gridTop + gridBottom) / 2;

  const renderAccounts = (): ReactNode => (
    <>
      {items.map((item, i) => {
        if (item.kind === 'empty')
          return (
            <button key="empty" type="button" className="jrn-f05m__paper jrn-f05m__paper--add jrn-f05m__paper--wide" data-jrn-trigger="f05m-add-slot" data-testid="f05m-empty" style={{ ...at(L.wide), backgroundImage: `url("${paperTile}")`, ['--i' as string]: 0 } as CSSProperties} onClick={() => setSheet('add')}>
              <span className="jrn-f05m__paper-name"><span>NO PLACES YET</span></span>
              <span className="jrn-f05m__add-sub">ADD A BANK ACCOUNT, CARD OR CASH. NO BANK CONNECTION NEEDED.</span>
              <span className="jrn-f05m__plus" aria-hidden />
            </button>
          );
        const slot = L.slots[i]!;
        if (item.kind === 'add')
          return (
            <button key="add" type="button" className="jrn-f05m__paper jrn-f05m__paper--add" data-jrn-trigger="f05m-add-slot" style={{ ...at(slot), backgroundImage: `url("${paperTile}")`, ['--i' as string]: i } as CSSProperties} onClick={() => setSheet('add')}>
              <span className="jrn-f05m__paper-name"><span>ADD A PLACE</span></span>
              <span className="jrn-f05m__add-sub">BANK, CARD OR CASH</span>
              <span className="jrn-f05m__plus" aria-hidden />
            </button>
          );
        if (item.kind === 'move')
          return (
            <button key="move" type="button" className="jrn-f05m__paper jrn-f05m__paper--add" data-jrn-trigger="f05m-move" style={{ ...at(slot), backgroundImage: `url("${paperTile}")`, ['--i' as string]: i } as CSSProperties} onClick={() => setSheet('move')}>
              <span className="jrn-f05m__paper-name"><span>MOVE MONEY</span></span>
              <span className="jrn-f05m__add-sub">BETWEEN YOUR PLACES</span>
              <svg className="jrn-f05m__move" viewBox="0 0 40 28" aria-hidden><path d="M3 9h30m-7-6 7 6-7 6M37 19H7m7-6-7 6 7 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          );
        const a = reading.accounts[item.index]!;
        const lines = a.lines;
        const transit = a.transferLine;
        return (
          <button
            key={a.account_id}
            type="button"
            className="jrn-f05m__paper"
            data-jrn-trigger={`f05m-place-${a.account_id}`}
            data-account-id={a.account_id}
            data-art={a.art}
            data-nature={a.nature}
            data-pressed={pressed === a.account_id ? 'true' : undefined}
            data-return={returned === a.account_id ? 'true' : undefined}
            data-fresh={fresh === a.account_id ? 'true' : undefined}
            aria-label={`${a.name}. ${a.nature === 'LIABILITY' ? `${formatMoney(a.amount)} OWED` : `${formatMoney(a.amount)} HELD`}${transit ? `. ${transit}` : ''}. OPEN.`}
            style={{ ...at(slot), ['--i' as string]: i } as CSSProperties}
            onPointerDown={() => setPressed(a.account_id)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            onClick={(e) => openPlace(a, e.currentTarget)}
          >
            <img className="jrn-f05m__paper-art" src={ART[a.art]} alt="" draggable={false} />
            <span className="jrn-f05m__paper-name" style={{ fontSize: nameFont(lines) }}>
              {lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <b className="jrn-f05m__paper-amount" data-jrn-amount-cents={Math.round(a.amount * 100)} style={{ fontSize: amountSize(formatMoney(a.amount), C.card.amountSize), top: C.card.nameTop + lines.length * C.card.namePitch + C.card.amountGap - (a.nature === 'LIABILITY' ? 4 : 0) }}>{formatMoney(a.amount)}</b>
            {a.nature === 'LIABILITY' ? <i className="jrn-f05m__paper-note" style={{ top: C.card.nameTop + lines.length * C.card.namePitch + C.card.amountGap + C.card.amountSize + 4 }}>OWED</i> : null}
            {transit ? <i className="jrn-f05m__paper-note jrn-f05m__paper-note--transit" data-testid="f05m-transit">{transit}</i> : null}
            <svg className="jrn-f05m__chev" viewBox="0 0 14 24" aria-hidden>
              <path d="M2 2l10 10L2 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        );
      })}
      {/* VIEW ALL ACCOUNTS (authority 01): the whole directory, any number of places; part of this collection */}
      <button
        type="button"
        className="jrn-f05m__viewall"
        data-jrn-trigger="f05m-view-all"
        aria-label={`VIEW ALL ACCOUNTS: ${reading.accounts.length} ${reading.accounts.length === 1 ? 'PLACE' : 'PLACES'}. OPENS THE FULL LIST.`}
        style={{ ...at(L.viewAll), backgroundImage: `url("${paperTile}")`, ['--i' as string]: 4 } as CSSProperties}
        onClick={() => go('money/places')}
      >
        <svg className="jrn-f05m__viewall-icon" viewBox="0 0 48 40" aria-hidden>
          <rect x="9" y="4" width="34" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2.6" />
          <rect x="5" y="9" width="34" height="22" rx="4" fill="#efe3cb" stroke="currentColor" strokeWidth="2.6" />
          <rect x="1.5" y="14" width="34" height="22" rx="4" fill="#efe3cb" stroke="currentColor" strokeWidth="2.6" />
          <path d="M1.5 21h34" stroke="currentColor" strokeWidth="2.6" />
        </svg>
        <span className="jrn-f05m__viewall-rule" aria-hidden />
        <span className="jrn-f05m__viewall-label">VIEW ALL ACCOUNTS</span>
        <svg className="jrn-f05m__viewall-arrow" viewBox="0 0 44 28" aria-hidden>
          <path d="M2 14h38M28 3l12 11-12 11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* transfer threads: they show the recorded settlement state and never change it */}
      {threads.length || ghosts.length ?
        <svg className="jrn-f05m__threads" width={SRC_W} height={L.boardH} viewBox={`0 0 ${SRC_W} ${L.boardH}`} aria-hidden>
          {threads.map((th) => {
            const mid = th.t.state === 'IN_TRANSIT' || th.t.state === 'RETURNING';
            const d = `M${th.a.x},${th.a.y} Q${th.c.x},${th.c.y} ${th.b.x},${th.b.y}`;
            return (
              <g key={`${th.t.linkId}:${th.t.state}`} className="jrn-f05m__thread" data-state={th.t.state} data-link={th.t.linkId}>
                <path className="jrn-f05m__thread-planned" d={d} pathLength={100} />
                {mid ? <path className="jrn-f05m__thread-left" d={d} pathLength={100} strokeDasharray="50 100" /> : null}
                <circle cx={th.a.x} cy={th.a.y} r={5} className="jrn-f05m__thread-pin" />
                <circle cx={th.b.x} cy={th.b.y} r={5} className="jrn-f05m__thread-pin" />
              </g>
            );
          })}
          {ghosts.map((g) => (
            <path key={`ghost-${g.t.linkId}`} className={`jrn-f05m__thread-ghost jrn-f05m__thread-ghost--${g.outcome}`} d={`M${g.a.x},${g.a.y} Q${g.c.x},${g.c.y} ${g.b.x},${g.b.y}`} pathLength={100} />
          ))}
        </svg>
      : null}
      {threads.map((th) => (
        <button
          key={`token-${th.t.linkId}:${th.t.state}`}
          type="button"
          className="jrn-f05m__token"
          data-jrn-trigger={`f05m-transfer-${th.t.linkId}`}
          data-state={th.t.state}
          data-kind={th.t.kind}
          aria-label={`${th.t.label}: ${formatMoney(th.t.amount)} FROM ${reading.accounts.find((x) => x.account_id === th.t.fromId)?.name ?? ''} TO ${reading.accounts.find((x) => x.account_id === th.t.toId)?.name ?? ''}. RECORDED BY YOU, NOT CONFIRMED BY A BANK. OPEN TO RECORD WHAT HAPPENED.`}
          style={{ left: th.token.x, top: th.token.y, backgroundImage: `url("${paperTile}")` }}
          onClick={() => setDetail(th.t.linkId)}
        >
          <b>{formatMoney(th.t.amount)}</b>
          <span>{SHORT[th.t.kind][th.t.state] ?? th.t.label}</span>
        </button>
      ))}
      {ghosts.filter((g) => g.outcome === 'resolved').map((g) => {
        const end = g.b;
        return <span key={`gtoken-${g.t.linkId}`} className="jrn-f05m__token jrn-f05m__token--ghost" aria-hidden style={{ left: g.token.x, top: g.token.y, ['--dx' as string]: `${end.x - g.token.x}px`, ['--dy' as string]: `${end.y - g.token.y}px`, backgroundImage: `url("${paperTile}")` } as CSSProperties}><b>{formatMoney(g.t.amount)}</b></span>;
      })}
    </>
  );

  const renderCollection = (id: CollectionId): ReactNode =>
    id === 'accounts' ? renderAccounts() : carousel[id].map((panel, i) => <CarouselPanelPaper key={panel.id} panel={panel} slot={L.slots[i]!} index={i} fmt={formatMoney} collection={id} onOpen={openPanel} />);

  // The exiting collection (during a change) and the active one; keyed so each keeps its element through the change.
  const groups: { id: CollectionId; phase: 'exit' | 'enter' | 'idle' | 'load' }[] = [
    ...(transition ? [{ id: transition.from, phase: 'exit' as const }] : []),
    { id: active, phase: transition ? 'enter' : moved ? 'idle' : 'load' },
  ];

  return (
    <JurnlScreen screenId="F05.00" familyPlate={F05_MOTION_PLATE} family productNav singlePlate>
      <div ref={stageRef} className="jrn-f05m" data-jrn-f05-stage data-reduced={reduced ? 'true' : 'false'} data-sliced={L.sliced ? 'true' : 'false'} data-wide={L.ox > 0.5 ? 'true' : 'false'}>
        <div className="jrn-f05m__board" style={boardStyle} data-jrn-zone="board">
          {/* L0 — environment */}
          <div className="jrn-f05m__env" aria-hidden data-layer="L0">
            {L.sliced ?
              <>
                <div className="jrn-f05m__slice" style={{ top: 0, height: SEAM_C, width: SRC_W }}>
                  <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ width: SRC_W, height: SRC_H }} />
                </div>
                <div className="jrn-f05m__tile" style={{ top: SEAM_C - 48, height: L.extra + 48 + 6, width: SRC_W, backgroundImage: `url("${panelTile}")`, backgroundSize: `${SRC_W}px ${SEAM_C - SEAM_A}px`, backgroundPosition: `0 calc(100% - 6px)` }} />
                <div className="jrn-f05m__slice" style={{ top: SEAM_C + L.extra, height: SRC_H - SEAM_C, width: SRC_W }}>
                  <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ top: -SEAM_C, width: SRC_W, height: SRC_H }} />
                </div>
              </>
            : <div className="jrn-f05m__slice" style={{ top: 0, height: SRC_H, width: SRC_W }}>
                <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ width: SRC_W, height: SRC_H }} />
              </div>}
          </div>

          {/* L1 — collage objects with real alpha */}
          <img className="jrn-f05m__obj jrn-f05m__title-paper" data-layer="L1" src={titlePaper} alt="" draggable={false} style={at(TITLE)} />
          <img className="jrn-f05m__obj jrn-f05m__seal" data-layer="L1" src={waxSeal} alt="" draggable={false} style={at(SEAL)} />

          {/* L2 — live type */}
          <p className="jrn-f05m__mark" aria-label="JURNL" style={{ left: C.mark.left, top: C.mark.top, fontSize: C.mark.size, letterSpacing: `${C.mark.ls}em`, transform: `rotate(${C.mark.rot}deg)` }}>JURNL</p>
          <header className="jrn-f05m__title" data-jrn-zone="intro">
            <h1 className="jrn-f05m__money" style={{ left: C.money.left, top: C.money.top, fontSize: C.money.size, letterSpacing: `${C.money.ls}em` }}>MONEY</h1>
            <p className="jrn-f05m__script" lang="en" style={{ left: C.script.left, top: C.script.top, fontSize: C.script.size, letterSpacing: `${C.script.ls}em` }}>where your money lives</p>
          </header>
          <section className="jrn-f05m__band" aria-label="MONEY SUMMARY" data-jrn-zone="summary">
            {DIVIDERS.map((x) => (
              <span key={x} className="jrn-f05m__divider" aria-hidden style={{ left: x, top: C.band.dividerTop, height: C.band.dividerH }} />
            ))}
            {metrics.map((m, i) => (
              <button key={m.id} type="button" className="jrn-f05m__metric" data-metric={m.id} data-jrn-trigger={`f05m-metric-${m.id}`} aria-label={m.aria} onClick={m.onOpen} style={{ left: METRIC_X[i]! - metricW(i) / 2, width: metricW(i), top: C.band.labelTop - 12 }}>
                <span className="jrn-f05m__metric-label">{m.label}</span>
                {unknown && (m.id === 'committed' || m.id === 'available') ?
                  <b className="jrn-f05m__metric-value" data-jrn-value={`money-${m.id}`} data-jrn-unknown="true">—</b>
                : <b className="jrn-f05m__metric-value" data-jrn-value={`money-${m.id}`} data-jrn-amount-cents={Math.round(m.value * 100)} style={{ fontSize: amountSize(formatMoney(m.value), C.band.valueSize) }}>{formatMoney(m.value)}</b>}
              </button>
            ))}
            {unknown ? <p className="jrn-f05m__basis" data-testid="f05m-unknown">ADD A PLACE TO SEE WHAT IS COMMITTED AND AVAILABLE.</p> : null}
          </section>

          {/* L3 — the carousel: four collections, one region; only the papers move */}
          <section
            className="jrn-f05m__carousel"
            aria-roledescription="carousel"
            aria-label="MONEY COLLECTIONS"
            data-jrn-zone="content-rail"
            data-active={active}
            data-moving={transition ? 'true' : 'false'}
            onPointerDown={handlers.onPointerDown}
            onPointerMove={handlers.onPointerMove}
            onPointerUp={handlers.onPointerUp}
            onPointerCancel={handlers.onPointerCancel}
            onClickCapture={handlers.onClickCapture}
            onWheel={handlers.onWheel}
            onKeyDown={onCarouselKey}
          >
            <div className="jrn-f05m__swipe" aria-hidden style={at(swipeZone)} />
            {groups.map((g) => (
              <div
                key={g.id}
                ref={
                  g.phase === 'exit' ? undefined : (
                    (el) => {
                      surface.current = el;
                      surfaceEl.current = el;
                    }
                  )
                }
                id={`f05m-collection-${g.id}`}
                className="jrn-f05m__collection"
                role="group"
                aria-roledescription="slide"
                aria-label={slideLabel(g.id)}
                aria-hidden={g.phase === 'exit' ? true : undefined}
                {...(g.phase === 'exit' ? ({ inert: true } as Record<string, unknown>) : {})}
                data-collection={g.id}
                data-phase={g.phase}
                data-dir={transition?.dir}
                style={g.phase === 'exit' ? ({ ['--f05m-drag' as string]: `${transition?.drag ?? 0}px` } as CSSProperties) : undefined}
              >
                {renderCollection(g.id)}
              </div>
            ))}
            <button type="button" className="jrn-f05m__step jrn-f05m__step--prev" data-jrn-trigger="f05m-prev" aria-label={activeIndex > 0 ? `PREVIOUS: ${slideLabel(COLLECTIONS[activeIndex - 1]!.id)}` : 'PREVIOUS: THIS IS THE FIRST COLLECTION'} aria-disabled={activeIndex === 0 ? true : undefined} aria-controls={`f05m-collection-${active}`} style={{ left: L.visibleX[0] + 6, top: stepTop }} onClick={() => step(-1)}>
              <svg viewBox="0 0 14 24" aria-hidden><path d="M12 2L2 12l10 10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="jrn-f05m__step jrn-f05m__step--next" data-jrn-trigger="f05m-next" aria-label={activeIndex < COLLECTIONS.length - 1 ? `NEXT: ${slideLabel(COLLECTIONS[activeIndex + 1]!.id)}` : 'NEXT: THIS IS THE LAST COLLECTION'} aria-disabled={activeIndex === COLLECTIONS.length - 1 ? true : undefined} aria-controls={`f05m-collection-${active}`} style={{ right: SRC_W - L.visibleX[1] + 6, top: stepTop }} onClick={() => step(1)}>
              <svg viewBox="0 0 14 24" aria-hidden><path d="M2 2l10 10L2 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="jrn-f05m__dotrow" role="group" aria-label="CHOOSE A COLLECTION" style={{ left: L.dots.x + L.dots.w / 2, top: L.dots.y + L.dots.h / 2 }}>
              {COLLECTIONS.map((c) => (
                <button key={c.id} type="button" className="jrn-f05m__dot" data-jrn-trigger={`f05m-dot-${c.id}`} data-collection={c.id} aria-label={slideLabel(c.id)} aria-current={c.id === active ? 'true' : undefined} aria-controls={`f05m-collection-${active}`} onClick={() => select(c.id)} />
              ))}
            </div>
            <p className="jrn-f05m__sr" aria-live="polite" aria-atomic="true" data-testid="f05m-announce">
              {announce}
            </p>
          </section>

          {/* L4 — corner chips (approved squares; the global menu takes the far-right one) */}
          <button type="button" className="jrn-f05m__chip" data-jrn-trigger="f05m-search" aria-label="SEARCH ACTIVITY" style={{ ...at({ x: searchX, y: CHIP_TOP, w: CHIP, h: CHIP }), top: CHIP_TOP_SAFE }} onClick={() => go('activity')}>
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button type="button" className="jrn-f05m__chip" data-jrn-trigger="f05m-actions" aria-label="ADD A PLACE OR MOVE MONEY" style={{ ...at({ x: plusX, y: CHIP_TOP, w: CHIP, h: CHIP }), top: CHIP_TOP_SAFE }} onClick={() => setSheet('actions')}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      <JurnlProductNav marks="parent" current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId="F05.00" onClose={closeOverlay} /> : null}
      {sheet === 'actions' ?
        <JurnlDrawer size="short" testId="f05m-actions-sheet" title="MONEY" lead="ADD WHERE MONEY LIVES, OR MOVE IT BETWEEN YOUR PLACES." onClose={() => setSheet(null)}>
          <JurnlButton trigger="f05m-actions-add" onClick={() => setSheet('add')}>ADD A PLACE</JurnlButton>
          <JurnlButton variant="secondary" trigger="f05m-actions-move" disabled={reading.accounts.length < 2} onClick={() => setSheet('move')}>
            {reading.accounts.length < 2 ? 'MOVE MONEY · ADD TWO PLACES FIRST' : 'MOVE MONEY'}
          </JurnlButton>
        </JurnlDrawer>
      : null}
      {sheet === 'add' ?
        <AddPlaceSheet
          onClose={() => setSheet(null)}
          onSaved={(id) => {
            setSheet(null);
            // the new place is shown on ACCOUNTS (or counted in ALL PLACES when more than four)
            if (active !== 'accounts') select('accounts');
            setFresh(id);
            showToast({ tone: 'success', title: 'PLACE ADDED', body: 'THE BALANCE IS WHAT YOU ENTERED. NO BANK IS CONNECTED.', testId: 'f05m-added' });
          }}
        />
      : null}
      {sheet === 'move' ? <TransferSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'period' ? <SafeHorizonSheet onClose={() => setSheet(null)} /> : null}
      {detail ? <TransferDetailSheet linkId={detail} onClose={() => setDetail(null)} /> : null}
    </JurnlScreen>
  );
}
