/**
 * JURNL MOBILE COMPOSITION FRAME + PAGINATED PANEL STACK.
 *
 * The frame is finite: chrome → content rect → composition edge → nav reserve. Nothing renders under the nav and the
 * page body never scrolls. Panels are atomic: when the next panel does not fit the content rect it moves whole to a
 * continuation screen. Continuation is presentation state (no route, no history entry). Back walks screens first,
 * then the route. Each family keeps its own composition inside the frame; the frame only owns geometry.
 */

import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { clampScreen, paginatePanels, type PaginationResult } from '../layout/paginate';
import { JurnlScreen, type FamilyPlate } from '../screens/JurnlScreen';
import { JurnlIcon } from './icons';

/** Composition archetypes (see docs/jurnl/refinements/mobile-creative-composition2/JURNL_COMPOSITION_ARCHETYPE_LIBRARY.json). */
export type JurnlArchetype =
  | 'CONTAINER_CABINET'
  | 'TENSION_THRESHOLD'
  | 'OBJECT_FOCUS'
  | 'MAP_ROUTE'
  | 'SEQUENTIAL_STEPS'
  | 'HORIZON_PATH'
  | 'ARCHIVE_INDEX'
  | 'LEDGER_GRID'
  | 'TIMELINE'
  | 'ROOM_ZONE'
  | 'EDITORIAL_SPREAD'
  | 'SCENARIO_FORK'
  | 'FOCUS_REVEAL'
  | 'DETAIL';

type FrameState = {
  label: string;
  screenIndex: number;
  screenCount: number;
  setScreen: (index: number, reason: 'next' | 'back') => void;
  setCount: (count: number) => void;
};

const FrameContext = createContext<FrameState | null>(null);

/** Context-aware back for frame chrome: returns true when it stepped back a continuation screen. */
export function useFrameBack(): { back: () => boolean; screenIndex: number; label: string } {
  const frame = useContext(FrameContext);
  const back = useCallback(() => {
    if (!frame || frame.screenIndex === 0) return false;
    frame.setScreen(frame.screenIndex - 1, 'back');
    return true;
  }, [frame]);
  return { back, screenIndex: frame?.screenIndex ?? 0, label: frame?.label ?? '' };
}

/** One atomic panel. Never split across screens. */
export function FramePanel({ children }: { id: string; children: ReactNode }) {
  return <>{children}</>;
}

const isTyping = (el: Element | null) => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);

export function JurnlPanelStack({ children }: { children: ReactNode }) {
  const frame = useContext(FrameContext)!;
  const panels = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((child, i) => {
          const el = child as ReactElement<{ id?: string; children?: ReactNode }>;
          const id = el.type === FramePanel && el.props.id ? el.props.id : `panel-${i}`;
          return { id, node: el.type === FramePanel ? el.props.children : el };
        }),
    [children],
  );
  const idsKey = panels.map((p) => p.id).join('|');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef(new Map<string, HTMLDivElement>());
  const [layout, setLayout] = useState<PaginationResult | null>(null);
  const layoutRef = useRef<PaginationResult | null>(null);
  const indexRef = useRef(frame.screenIndex);
  indexRef.current = frame.screenIndex;
  const frozenRef = useRef(false);

  const measure = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const available = content.clientHeight;
    if (!available) return; // no layout (server render / jsdom): every panel stays on screen 1
    const prev = layoutRef.current;
    // A software keyboard shrinks the viewport: keep the screen the focused field lives on until it blurs.
    if (prev && available < prev.firstAvailable && isTyping(document.activeElement) && content.contains(document.activeElement)) {
      frozenRef.current = true;
      return;
    }
    frozenRef.current = false;
    const style = getComputedStyle(content);
    const gap = parseFloat(style.rowGap) || 0;
    const caption = parseFloat(style.getPropertyValue('--jrn-frame-caption-h')) || 0;
    // An oversize slot is clamped to the rect and scrolls; its natural height is its scroll height, not its box.
    const measured = panels.map((p) => {
      const el = slotRefs.current.get(p.id);
      if (!el) return { id: p.id, height: 0 };
      return { id: p.id, height: el.dataset.jrnOversize === 'true' ? el.scrollHeight : el.getBoundingClientRect().height };
    });
    // The content rect height is fixed by the frame; continuation screens also carry the caption at its top.
    const next = paginatePanels(measured, available, gap, available - caption - gap);
    if (prev && JSON.stringify(prev.screens) === JSON.stringify(next.screens)) return;
    const index = clampScreen(prev, next, indexRef.current);
    layoutRef.current = next;
    setLayout(next);
    frame.setCount(next.screens.length);
    if (index !== indexRef.current) frame.setScreen(index, 'back');
  }, [panels, frame]);

  useLayoutEffect(() => {
    measure();
  }, [measure, idsKey]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(content);
    slotRefs.current.forEach((el) => ro.observe(el));
    const onFocusOut = () => frozenRef.current && schedule();
    content.addEventListener('focusout', onFocusOut);
    void document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      content.removeEventListener('focusout', onFocusOut);
    };
  }, [measure, idsKey]);

  const screens = layout?.screens ?? [{ panelIds: panels.map((p) => p.id), oversize: [] }];
  const count = screens.length;
  const index = Math.min(frame.screenIndex, count - 1);
  const screenOf = new Map<string, number>();
  screens.forEach((s, i) => s.panelIds.forEach((id) => screenOf.set(id, i)));
  const oversize = new Set(screens.flatMap((s) => s.oversize));
  const multi = count > 1;
  const regionLabel = multi ? `${frame.label} — SCREEN ${index + 1} OF ${count}` : frame.label;

  return (
    <>
      <div
        ref={contentRef}
        className="jrn-frame__content"
        data-jrn-zone="content-rect"
        data-jrn-stack
        data-jrn-screen-index={index}
        data-jrn-screen-count={count}
        role="region"
        aria-label={regionLabel}
        tabIndex={-1}
      >
        {index > 0 ?
          <p className="jrn-frame__caption" data-jrn-zone="continuation-caption">
            {frame.label} · CONTINUED
          </p>
        : null}
        {panels.map((p) => {
          const shown = (screenOf.get(p.id) ?? 0) === index;
          return (
            <div
              key={p.id}
              ref={(el) => {
                if (el) slotRefs.current.set(p.id, el);
                else slotRefs.current.delete(p.id);
              }}
              className="jrn-frame__slot"
              data-jrn-panel-slot={p.id}
              data-jrn-screen={screenOf.get(p.id) ?? 0}
              data-jrn-shown={shown ? 'true' : 'false'}
              data-jrn-stage={shown ? 'onscreen' : 'offscreen'}
              data-jrn-oversize={oversize.has(p.id) ? 'true' : undefined}
              aria-hidden={shown ? undefined : true}
              {...(shown ? {} : ({ inert: true } as Record<string, unknown>))}
            >
              {p.node}
            </div>
          );
        })}
      </div>
      <div className="jrn-frame__edge" data-jrn-zone="composition-edge" data-jrn-multi={multi ? 'true' : 'false'}>
        <span className="jrn-frame__rule" aria-hidden />
        {multi ?
          <span className="jrn-frame__marks" aria-hidden>
            {screens.map((_, i) => (
              <i key={i} data-current={i === index ? 'true' : 'false'} />
            ))}
          </span>
        : null}
        {multi && index < count - 1 ?
          <button
            type="button"
            className="jrn-btn jrn-frame__next"
            data-jrn-trigger="frame-next"
            aria-label={`NEXT — ${frame.label}, SCREEN ${index + 2} OF ${count}`}
            onClick={() => frame.setScreen(index + 1, 'next')}
          >
            <span>NEXT</span>
            <JurnlIcon name="chevron" size={14} />
          </button>
        : null}
        <span className="jrn-frame__live" aria-live="polite">
          {multi ? `SCREEN ${index + 1} OF ${count}` : ''}
        </span>
      </div>
      <div className="jrn-frame__navspace" aria-hidden />
    </>
  );
}

function FrameProvider({ label, children }: { label: string; children: ReactNode }) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [screenCount, setScreenCount] = useState(1);
  const moved = useRef(false);
  const setScreen = useCallback((index: number, _reason: 'next' | 'back') => {
    moved.current = true;
    setScreenIndex(Math.max(0, index));
  }, []);
  const value = useMemo<FrameState>(() => ({ label, screenIndex, screenCount, setScreen, setCount: setScreenCount }), [label, screenIndex, screenCount, setScreen]);
  // Screen transition focus: move to the new screen's region so assistive tech reads it; never on first render.
  useEffect(() => {
    if (!moved.current) return;
    const region = document.querySelector<HTMLElement>('[data-jrn-stack]');
    region?.focus({ preventScroll: true });
  }, [screenIndex]);
  return <FrameContext.Provider value={value}>{children}</FrameContext.Provider>;
}

/**
 * The family surface. `chrome` sits above the content rect, `children` are the atomic panels, `nav` and `overlays`
 * render outside the column (the nav docks to the viewport).
 */
export function JurnlFamilyFrame({
  screenId,
  familyId,
  familyPlate,
  label,
  archetype,
  chrome,
  nav,
  overlays,
  children,
}: {
  screenId: string;
  familyId: string;
  familyPlate: FamilyPlate;
  label: string;
  archetype: JurnlArchetype;
  chrome: ReactNode;
  nav: ReactNode;
  overlays?: ReactNode;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <JurnlScreen screenId={screenId} familyPlate={familyPlate} family frame>
      <FrameProvider key={pathname} label={label}>
        <div className="jrn-frame" data-jrn-archetype={archetype} data-jrn-family-frame={familyId}>
          {chrome}
          <JurnlPanelStack>{children}</JurnlPanelStack>
        </div>
      </FrameProvider>
      {nav}
      {overlays}
    </JurnlScreen>
  );
}

const FAMILY_LABEL: Record<string, string> = {
  F05: 'MONEY',
  F06: 'INCOME',
  F07: 'UPCOMING',
  F08: 'PLAN',
  F09: 'SAFE TO SPEND',
  F10: 'PURCHASES',
  F11: 'TRIPS',
  F12: 'CREDIT',
  F13: 'PAYDOWN',
  F14: 'GOALS',
  F15: 'AHEAD',
  F16: 'RECORDS',
};

/**
 * Frame adapter for family detail screens written against the old rail shell: the family chrome becomes the frame
 * chrome, the rail is flattened so each of its children is one atomic panel, every other child is a panel.
 * Sheets and drawers render into the overlay host, so their slots are empty and take no space.
 */
export function JurnlFamilyShell({
  screenId,
  familyId,
  familyPlate,
  nav,
  overlays,
  children,
}: {
  screenId: string;
  familyId: string;
  familyPlate: FamilyPlate;
  nav: ReactNode;
  overlays?: ReactNode;
  children: ReactNode;
}) {
  let chrome: ReactNode = null;
  const panels: ReactNode[] = [];
  const take = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      if (!isValidElement(child)) return;
      const props = child.props as { className?: string; backLabel?: string; onBack?: unknown; children?: ReactNode };
      if (child.type === Fragment) take(props.children);
      else if (props.backLabel !== undefined && props.onBack !== undefined && !chrome) chrome = child;
      else if (typeof props.className === 'string' && props.className.split(' ').includes('jrn-parent__rail')) take(props.children);
      else panels.push(child);
    });
  };
  take(children);
  return (
    <JurnlFamilyFrame screenId={screenId} familyId={familyId} familyPlate={familyPlate} label={FAMILY_LABEL[familyId] ?? familyId} archetype="DETAIL" chrome={chrome} nav={nav} overlays={overlays}>
      {panels}
    </JurnlFamilyFrame>
  );
}
