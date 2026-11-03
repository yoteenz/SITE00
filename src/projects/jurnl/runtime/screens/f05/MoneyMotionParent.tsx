/**
 * F05 MONEY parent — layered motion pilot (P0.JURNL.F05-MONEY.PARENT-ANIMATED-COLLAGE-RECONSTRUCTION-AND-FIDELITY-PILOT).
 *
 * Layers, bottom to top:
 *   L0 environment   text-free SIDEKICK (top slice · elastic panel tile · bottom slice), ambient copy on wide screens
 *   L1 collage       title paper and wax seal: real alpha, independent entrance (scale-only envelopes, verified)
 *   L2 live type     JURNL, MONEY, the lowercase script line, HELD / OWED / COMMITTED / AVAILABLE — DOM text
 *   L3 papers        one button per account (id-bound), approved card art by kind of place, live name and amount
 *   L4 chrome        corner chips, the global five-item dock (re-seated on the nav paper), overlays
 * The page is opt-in (?parent=motion) until the founder approves it; the cabinet hub stays the default.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { computeMoneyParentReading, type MoneyParentAccount, type MoneyPaperArt } from '../../../data/f05/moneyParentReading';
import { formatMoney, useCurrency, useRepoTick } from '../../../data/home/money';
import { JurnlButton, JurnlDrawer } from '../../components/primitives';
import { JurnlProductNav } from '../../components/ProductNav';
import { SafeHorizonSheet } from '../../finance/SafeHorizonSheet';
import { TransferSheet } from '../../finance/FinanceSheets';
import { AskJurnlSheet, QuickAddV2Sheet } from '../../global/GlobalSheets';
import { useJurnl } from '../../state/store';
import { JurnlScreen, type FamilyPlate } from '../JurnlScreen';
import { AddPlaceSheet } from '../MoneyScreens';
import { capacityFor, computeF05MotionLayout, pageItems, SEAM_C, SRC_H, SRC_W, toScreen, type Rect } from './f05MotionLayout';
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

export const F05_MOTION_PLATE: FamilyPlate = { family: 'F05', scene: 'ENV.MOTION_PILOT', src: sidekick, assetId: 'MONEY.ENVIRONMENT.MOTION_PILOT.SIDEKICK.V1', width: SRC_W, height: SRC_H };
const ART: Record<MoneyPaperArt, string> = { bank: cardBank, payout: cardPayout, cash: cardCash, credit: cardCredit };
const RETURN_KEY = 'jurnl.f05.motion.return';
const box = (r: { box: number[] }): Rect => ({ x: r.box[0]!, y: r.box[1]!, w: r.box[2]! - r.box[0]!, h: r.box[3]! - r.box[1]! });
const at = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h });
const TITLE = box(geometry.title_paper);
const SEAL = box(geometry.wax_seal);
/** Approved chip squares (source px). The global menu takes the far-right square; search and add move one left. */
const CHIP = 76;
const CHIP_GAP = 23;
const CHIP_TOP = 32;
const CHIP_RIGHT = 979;
/** Approved metric column centres (source px). */
const METRIC_X = [176, 405, 638, 875];
const DIVIDERS = [297, 515, 757];

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

function transitLine(a: MoneyParentAccount): string | null {
  if (a.incoming > 0) return `${formatMoney(a.incoming)} ON ITS WAY IN`;
  if (a.inTransitOut > 0) return `${formatMoney(a.inTransitOut)} SENT, NOT ARRIVED`;
  if (a.waitingToLeave > 0) return `${formatMoney(a.waitingToLeave)} NOT SENT YET`;
  return null;
}

/** Long amounts shrink to stay inside their column; the value itself is never abbreviated. */
function amountSize(text: string, base: number): number {
  const n = text.length;
  return n <= 7 ? base : n <= 9 ? base * 0.84 : n <= 11 ? base * 0.72 : base * 0.62;
}

function nameScale(lines: string[]): number {
  const longest = Math.max(...lines.map((l) => l.length));
  return longest <= 11 ? 1 : longest <= 14 ? 0.84 : longest <= 18 ? 0.7 : 0.6;
}

type Sheet = null | 'actions' | 'add' | 'move' | 'period';

export function MoneyMotionParent() {
  const { go, overlay, openOverlay, closeOverlay, showToast } = useJurnl();
  useCurrency();
  useRepoTick();
  const reduced = useReducedMotion();
  const reading = computeMoneyParentReading();
  const stageRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 393, h: 852 });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [page, setPage] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);
  const [returned] = useState(readReturn);
  const [fresh, setFresh] = useState<string | null>(null);
  const navigating = useRef(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

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

  const total = reading.accounts.length;
  const perPage = capacityFor(vp.w, vp.h);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const pageIndex = Math.min(page, pageCount - 1);
  const items = pageItems(total, perPage, pageIndex);
  const L = useMemo(() => computeF05MotionLayout(vp.w, vp.h, items.length), [vp.w, vp.h, items.length]);
  const pages = Array.from({ length: pageCount }, (_, i) => i);

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

  const nextPage = () => setPage((p) => (pages.length > 1 ? (Math.min(p, pages.length - 1) + 1) % pages.length : 0));
  const prevPage = () => setPage((p) => (pages.length > 1 ? (Math.min(p, pages.length - 1) - 1 + pages.length) % pages.length : 0));
  const onPanelDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPanelUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || pages.length < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) (dx < 0 ? nextPage : prevPage)();
  };
  const onPanelKey = (e: KeyboardEvent) => {
    if (pages.length < 2) return;
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
  };

  // With no places of the user's own, Safe to Spend reads the sample preview: say nothing rather than a sample figure.
  const unknown = reading.cashSource === 'MOCK';
  const metrics = [
    { id: 'held', label: 'HELD', value: reading.held, aria: `HELD: ${formatMoney(reading.held)} IN YOUR ACCOUNTS. OPENS PLACES.`, onOpen: () => go('money/places') },
    { id: 'owed', label: 'OWED', value: reading.owed, aria: `OWED: ${formatMoney(reading.owed)} ON CARDS AND LOANS. OPENS CREDIT.`, onOpen: () => go('credit') },
    { id: 'committed', label: 'COMMITTED', value: reading.committed, aria: unknown ? 'COMMITTED: NOT KNOWN UNTIL YOU ADD A PLACE.' : `COMMITTED: ${formatMoney(reading.committed)} HELD BACK FOR BILLS, CARD MINIMUMS AND PLANS IN THE NEXT 30 DAYS. OPENS THE PLANNING PERIOD.`, onOpen: () => setSheet('period') },
    { id: 'available', label: 'AVAILABLE', value: reading.available, aria: unknown ? 'AVAILABLE: NOT KNOWN UNTIL YOU ADD A PLACE.' : `AVAILABLE: ${formatMoney(reading.available)}, SAFE TO SPEND FOR THE NEXT 30 DAYS. OPENS THE PLANNING PERIOD.`, onOpen: () => setSheet('period') },
  ];

  const S = L.u;
  // Stagger: at most 45 ms, and the last paper starts by 410 ms (ends by 610 ms) however many papers the page holds.
  const stagger = items.length > 1 ? Math.min(45, 70 / (items.length - 1)) : 0;
  const boardStyle: CSSProperties = { width: SRC_W, height: L.boardH, transform: `translate(${L.ox}px, 0) scale(${S})`, ['--f05m-stagger' as string]: `${stagger}ms` } as CSSProperties;
  const visible = L.visibleX;

  return (
    <JurnlScreen screenId="F05.00" familyPlate={F05_MOTION_PLATE} family productNav singlePlate>
      <div ref={stageRef} className="jrn-f05m" data-jrn-f05-stage data-reduced={reduced ? 'true' : 'false'} data-sliced={L.sliced ? 'true' : 'false'} data-wide={L.ox > 0.5 ? 'true' : 'false'}>
        <div className="jrn-f05m__board" style={boardStyle} data-jrn-zone="board">
          {/* L0 — environment */}
          <div className="jrn-f05m__env" aria-hidden data-layer="L0">
            {L.sliced ?
              <>
                <div className="jrn-f05m__slice" style={{ top: 0, height: SEAM_C }}>
                  <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} />
                </div>
                <div className="jrn-f05m__tile" style={{ top: SEAM_C - 48, height: L.extra + 48 + 6, backgroundImage: `url("${panelTile}")`, backgroundPosition: `0 calc(100% - 6px)` }} />
                <div className="jrn-f05m__slice" style={{ top: SEAM_C + L.extra, height: SRC_H - SEAM_C }}>
                  <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ top: -SEAM_C }} />
                </div>
              </>
            : <div className="jrn-f05m__slice" style={{ top: 0, height: SRC_H }}>
                <img src={sidekick} alt="" width={SRC_W} height={SRC_H} draggable={false} />
              </div>}
          </div>

          {/* L1 — collage objects with real alpha */}
          <img className="jrn-f05m__obj jrn-f05m__title-paper" data-layer="L1" src={titlePaper} alt="" draggable={false} style={at(TITLE)} />
          <img className="jrn-f05m__obj jrn-f05m__seal" data-layer="L1" src={waxSeal} alt="" draggable={false} style={at(SEAL)} />

          {/* L2 — live type */}
          <p className="jrn-f05m__mark" aria-label="JURNL" style={{ left: Math.max(64, visible[0] + 30), top: 92 }}>JURNL</p>
          <header className="jrn-f05m__title" data-jrn-zone="intro">
            <h1 className="jrn-f05m__money">MONEY</h1>
            <p className="jrn-f05m__script" lang="en">where your money lives</p>
          </header>
          <section className="jrn-f05m__band" aria-label="MONEY SUMMARY" data-jrn-zone="summary">
            {DIVIDERS.map((x) => (
              <span key={x} className="jrn-f05m__divider" aria-hidden style={{ left: x }} />
            ))}
            {metrics.map((m, i) => (
              <button key={m.id} type="button" className="jrn-f05m__metric" data-metric={m.id} data-jrn-trigger={`f05m-metric-${m.id}`} aria-label={m.aria} onClick={m.onOpen} style={{ left: METRIC_X[i]! - 105 }}>
                <span className="jrn-f05m__metric-label">{m.label}</span>
                {unknown && (m.id === 'committed' || m.id === 'available') ?
                  <b className="jrn-f05m__metric-value" data-jrn-value={`money-${m.id}`} data-jrn-unknown="true">—</b>
                : <b className="jrn-f05m__metric-value" data-jrn-value={`money-${m.id}`} data-jrn-amount-cents={Math.round(m.value * 100)} style={{ fontSize: amountSize(formatMoney(m.value), 52) }}>{formatMoney(m.value)}</b>}
              </button>
            ))}
            {unknown ? <p className="jrn-f05m__basis" data-testid="f05m-unknown">ADD A PLACE TO SEE WHAT IS COMMITTED AND AVAILABLE.</p> : null}
          </section>

          {/* L3 — account papers */}
          <div className="jrn-f05m__papers" role="group" aria-label={`PLACES${pageCount > 1 ? `, PAGE ${pageIndex + 1} OF ${pageCount}` : ''}`} data-jrn-zone="content-rail" tabIndex={-1} onPointerDown={onPanelDown} onPointerUp={onPanelUp} onKeyDown={onPanelKey} key={`page-${pageIndex}`}>
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
              const k = nameScale(lines);
              const transit = transitLine(a);
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
                  <span className="jrn-f05m__paper-name" style={{ fontSize: 29 * k }}>
                    {lines.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </span>
                  <b className="jrn-f05m__paper-amount" data-jrn-amount-cents={Math.round(a.amount * 100)} style={{ fontSize: amountSize(formatMoney(a.amount), 48) }}>{formatMoney(a.amount)}</b>
                  {a.nature === 'LIABILITY' ? <i className="jrn-f05m__paper-note">OWED</i> : transit ? <i className="jrn-f05m__paper-note jrn-f05m__paper-note--transit" data-testid="f05m-transit">{transit}</i> : null}
                  <svg className="jrn-f05m__chev" viewBox="0 0 14 24" aria-hidden>
                    <path d="M2 2l10 10L2 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            })}
          </div>
          {pages.length > 1 ?
            <button type="button" className="jrn-f05m__dots" data-jrn-trigger="f05m-next-page" aria-label={`PLACES PAGE ${pageIndex + 1} OF ${pages.length}. SHOW NEXT.`} style={at(L.dots)} onClick={nextPage}>
              {pages.map((_, i) => (
                <span key={i} data-on={i === pageIndex ? 'true' : 'false'} />
              ))}
            </button>
          : null}

          {/* L4 — corner chips (approved squares; the global menu takes the far-right one) */}
          <button type="button" className="jrn-f05m__chip" data-jrn-trigger="f05m-search" aria-label="SEARCH ACTIVITY" style={at({ x: searchX, y: CHIP_TOP, w: CHIP, h: CHIP })} onClick={() => go('activity')}>
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button type="button" className="jrn-f05m__chip" data-jrn-trigger="f05m-actions" aria-label="ADD A PLACE OR MOVE MONEY" style={at({ x: plusX, y: CHIP_TOP, w: CHIP, h: CHIP })} onClick={() => setSheet('actions')}>
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
            const n = listIndex(id);
            if (n >= 0) setPage(Math.floor(n / perPage));
            setFresh(id);
            showToast({ tone: 'success', title: 'PLACE ADDED', body: 'THE BALANCE IS WHAT YOU ENTERED. NO BANK IS CONNECTED.', testId: 'f05m-added' });
          }}
        />
      : null}
      {sheet === 'move' ? <TransferSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'period' ? <SafeHorizonSheet onClose={() => setSheet(null)} /> : null}
    </JurnlScreen>
  );
}

function listIndex(id: string): number {
  return computeMoneyParentReading().accounts.findIndex((a) => a.account_id === id);
}

