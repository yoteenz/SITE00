/**
 * Hub overlays. They float above an intact Hub (dimmed, no reflow). Closing restores the exact
 * prior Hub state because overlays never mutate it.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DecisionResult, HubProjectEntry } from './useProductionHubData';
import { HubImage } from './HubImage';
import type { HubAttentionItem, HubScene, HubStoryboardFrame } from '../../../../shared/site00-production-hub/types.js';
import {
  IcArrowL,
  IcArrowR,
  IcChevR,
  IcClose,
  IcCompare,
  IcCube,
  IcFit,
  IcInfo,
  IcRefresh,
  IcSearch,
  IcCheck,
  IcZoomIn,
  IcFilter,
} from './icons';

const pad = (n: number) => String(n).padStart(2, '0');

/** Shared overlay shell: dim scrim, dialog semantics, focus on open, Esc + scrim close. */
export function OverlayShell({
  label,
  onClose,
  variant,
  children,
  testId,
}: {
  label: string;
  onClose: () => void;
  variant: 'sheet' | 'modal' | 'popover' | 'dark' | 'drawer';
  children: ReactNode;
  testId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className={`ph-ov ph-ov--${variant}`} data-testid={testId}>
      <button type="button" className="ph-ov__scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div ref={ref} className="ph-ov__panel" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}

/* ── 01 SCENE SELECTOR ────────────────────────────────────────────────── */

export function SceneSelector({
  productionLabel,
  scenes,
  selectedId,
  urlFor,
  slotFor,
  onSelect,
  onClose,
}: {
  productionLabel: string;
  scenes: readonly HubScene[];
  selectedId: string | null;
  urlFor: (slotId: string) => string | null;
  slotFor: (sceneId: string) => string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [pending, setPending] = useState<string | null>(selectedId);
  const cur = scenes.find((s) => s.sceneId === pending) ?? null;
  return (
    <OverlayShell label="Scene selector" onClose={onClose} variant="sheet" testId="hub-scene-selector">
      <header className="ph-ov__head">
        <span>
          <h2>SCENE SELECTOR</h2>
          <small>{productionLabel}</small>
        </span>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close" data-testid="overlay-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      {scenes.length === 0 ? (
        <div className="ph-empty" data-testid="scene-empty">
          <b>NO SCENES AVAILABLE</b>
          <span>This production has no canonical scene list.</span>
        </div>
      ) : (
        <ul className="ph-scenes" data-testid="scene-list">
          {scenes.map((s) => (
            <li key={s.sceneId}>
              <button type="button" className={`ph-scene${pending === s.sceneId ? ' is-active' : ''}`} onClick={() => setPending(s.sceneId)} aria-pressed={pending === s.sceneId} data-testid={`scene-row-${s.order}`}>
                <HubImage slotId={slotFor(s.sceneId)} url={urlFor(slotFor(s.sceneId))} label="SCENE PLATE" className="ph-scene__img" />
                <span className="ph-scene__text">
                  <b>
                    <i>{pad(s.order)}</i> {s.label}
                  </b>
                  <small>TENSION: {s.tensionStage ?? '–'}</small>
                  <small>DURATION: {s.durationRange ?? '–'}</small>
                </span>
                <span className="ph-scene__go" aria-hidden>
                  <IcChevR width={14} height={14} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ph-btn ph-btn--ink ph-btn--full" disabled={!cur} onClick={() => cur && onSelect(cur.sceneId)} data-testid="scene-confirm">
        {cur ? `OPEN / SELECT SCENE ${pad(cur.order)}` : 'SELECT A SCENE'} <IcArrowR width={16} height={16} />
      </button>
    </OverlayShell>
  );
}

/* ── 08 FRAME LIGHTBOX ────────────────────────────────────────────────── */

export function FrameLightbox({
  scene,
  frames,
  frame,
  urlFor,
  slotFor,
  onSelect,
  onStep,
  onClose,
  onCompare,
  onOpenExpression,
}: {
  scene: HubScene | null;
  frames: readonly HubStoryboardFrame[];
  frame: HubStoryboardFrame | null;
  urlFor: (f: HubStoryboardFrame) => string | null;
  slotFor: (n: number) => string;
  onSelect: (id: string) => void;
  onStep: (d: 1 | -1) => void;
  onClose: () => void;
  onCompare: () => void;
  onOpenExpression: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [info, setInfo] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onStep(-1);
      if (e.key === 'ArrowRight') onStep(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStep]);
  return (
    <OverlayShell label="Frame lightbox" onClose={onClose} variant="dark" testId="hub-lightbox">
      <header className="ph-lb__head">
        <button type="button" className="ph-x ph-x--dark" onClick={() => setZoom(false)} aria-label="Reset zoom">
          <IcFit width={18} height={18} />
        </button>
        <h2>FRAME LIGHTBOX</h2>
        <button type="button" className="ph-x ph-x--dark" onClick={onClose} aria-label="Close lightbox" data-testid="overlay-close">
          <IcClose width={20} height={20} />
        </button>
      </header>
      <p className="ph-lb__id">
        <b>{scene ? `SCENE ${pad(scene.order)}` : 'SCENE'}</b> / FRAME {frame ? pad(frame.number) : '–'} OF {frames.length ? pad(frames.length) : '–'}
      </p>
      <div className={`ph-lb__stage${zoom ? ' is-zoom' : ''}`}>
        <HubImage slotId={frame ? slotFor(frame.number) : null} url={frame ? urlFor(frame) : null} label="STORYBOARD FRAME" className="ph-lb__img" />
        <button type="button" className="ph-round ph-round--night ph-lb__prev" onClick={() => onStep(-1)} aria-label="Previous frame" data-testid="lightbox-prev">
          <IcArrowL width={18} height={18} />
        </button>
        <button type="button" className="ph-round ph-round--night ph-lb__next" onClick={() => onStep(1)} aria-label="Next frame" data-testid="lightbox-next">
          <IcArrowR width={18} height={18} />
        </button>
      </div>
      {info ? (
        <dl className="ph-lb__info" data-testid="lightbox-info">
          <div><dt>SCENE</dt><dd>{scene ? `${pad(scene.order)} ${scene.label}` : '–'}</dd></div>
          <div><dt>FRAME</dt><dd>{frame ? `${frame.number} / ${frames.length}` : '–'}</dd></div>
          <div><dt>DURATION</dt><dd>{scene?.durationRange ?? 'NOT AVAILABLE'}</dd></div>
          <div><dt>FORMAT</dt><dd>REEL (9:16)</dd></div>
        </dl>
      ) : null}
      <div className="ph-lb__strip" role="group" aria-label="Frames">
        {frames.map((f) => (
          <button key={f.frameId} type="button" className={f.frameId === frame?.frameId ? 'is-active' : ''} onClick={() => onSelect(f.frameId)} aria-label={`Frame ${f.number}`} aria-pressed={f.frameId === frame?.frameId}>
            <HubImage slotId={slotFor(f.number)} url={urlFor(f)} label="" className="ph-lb__timg" />
            <i>{pad(f.number)}</i>
          </button>
        ))}
        {frames.length === 0 ? <span className="ph-lb__none">NO STORYBOARD FRAMES YET</span> : null}
      </div>
      <div className="ph-lb__tools">
        <button type="button" onClick={() => setZoom(false)} aria-pressed={!zoom} data-testid="lightbox-zoom-fit"><IcFit width={22} height={22} />ZOOM FIT</button>
        <button type="button" onClick={() => setZoom(true)} aria-pressed={zoom} data-testid="lightbox-zoom-in"><IcZoomIn width={22} height={22} />ZOOM IN</button>
        <button type="button" onClick={() => setInfo((v) => !v)} aria-pressed={info} data-testid="lightbox-info-toggle"><IcInfo width={22} height={22} />INFO</button>
        <button type="button" onClick={onCompare} data-testid="lightbox-compare"><IcCompare width={22} height={22} />COMPARE</button>
        <button type="button" onClick={onOpenExpression} data-testid="lightbox-open-expression"><IcCube width={22} height={22} />OPEN IN EXPRESSION</button>
      </div>
    </OverlayShell>
  );
}

/* ── 10 FOUNDER DECISION ──────────────────────────────────────────────── */

export function FounderDecisionDialog({
  scene,
  frame,
  frameCount,
  frameUrl,
  frameSlotId,
  nextStageLabel,
  initial,
  deciding,
  onDecide,
  onClose,
  onFullscreen,
  onOpenExpression,
}: {
  scene: HubScene | null;
  frame: HubStoryboardFrame | null;
  frameCount: number;
  frameUrl: string | null;
  frameSlotId: string | null;
  nextStageLabel: string;
  initial: 'APPROVE' | 'REVISE' | null;
  deciding: boolean;
  onDecide: (d: 'APPROVE' | 'REVISE', note: string) => Promise<DecisionResult>;
  onClose: () => void;
  onFullscreen: () => void;
  onOpenExpression: () => void;
}) {
  const [choice, setChoice] = useState<'APPROVE' | 'REVISE' | null>(initial);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);
  const done = result?.ok === true;
  const submit = async () => {
    if (!choice) return;
    setResult(await onDecide(choice, note.trim()));
  };
  return (
    <OverlayShell label="Founder decision" onClose={onClose} variant="sheet" testId="hub-decision">
      <header className="ph-ov__head ph-ov__head--center">
        <span>
          <h2>FOUNDER DECISION</h2>
          <small>STORYBOARD AUTHORITY / {scene ? `SCENE ${pad(scene.order)}` : 'SCENE'}</small>
        </span>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close" data-testid="overlay-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      <div className="ph-dec__view">
        <HubImage slotId={frameSlotId} url={frameUrl} label="STORYBOARD FRAME" className="ph-dec__img" />
        <span>
          <small>{scene ? `SCENE ${pad(scene.order)}` : ''}</small>
          <b>{scene?.label}</b>
          {scene ? <p>{scene.purpose}</p> : null}
          <button type="button" className="ph-btn ph-btn--line" onClick={onFullscreen} disabled={!frameCount}>
            OPEN FULLSCREEN <IcFit width={14} height={14} />
          </button>
          <em>{frame && frameCount ? `${pad(frame.number)} / ${pad(frameCount)}` : 'NO FRAMES'}</em>
        </span>
      </div>

      {done ? (
        <div className="ph-dec__done" role="status" data-testid="decision-done">
          <IcCheck width={22} height={22} />
          <span>
            <b>{choice === 'APPROVE' ? 'STORYBOARD AUTHORITY APPROVED' : 'REVISION REQUESTED'}</b>
            <small>Recorded in production activity.</small>
          </span>
          {choice === 'REVISE' ? (
            <button type="button" className="ph-btn ph-btn--line" onClick={onOpenExpression}>
              RETURN TO EXPRESSION <IcArrowR width={14} height={14} />
            </button>
          ) : null}
          <button type="button" className="ph-btn ph-btn--ink" onClick={onClose} data-testid="decision-close">
            DONE
          </button>
        </div>
      ) : (
        <>
          <p className="ph-dec__lead">MAKE YOUR DECISION</p>
          <div className="ph-dec__choices">
            <button type="button" className={`ph-choice ph-choice--approve${choice === 'APPROVE' ? ' is-on' : ''}`} onClick={() => setChoice('APPROVE')} aria-pressed={choice === 'APPROVE'} data-testid="decision-approve">
              <b>
                <IcCheck width={18} height={18} /> APPROVE AUTHORITY
              </b>
              <span>Lock storyboard authority and activate {nextStageLabel.toLowerCase()}.</span>
              <em>NEXT: {nextStageLabel} UNLOCKED</em>
            </button>
            <span className="ph-dec__or">OR</span>
            <button type="button" className={`ph-choice${choice === 'REVISE' ? ' is-on' : ''}`} onClick={() => setChoice('REVISE')} aria-pressed={choice === 'REVISE'} data-testid="decision-revise">
              <b>
                <IcRefresh width={18} height={18} /> REQUEST REVISION
              </b>
              <span>Return to Expression with founder notes. History is preserved.</span>
              <em>NEXT: RETURN TO EXPRESSION</em>
            </button>
          </div>
          {choice === 'REVISE' ? (
            <label className="ph-dec__note">
              <span>FOUNDER NOTES</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What needs to change?" data-testid="decision-note" />
            </label>
          ) : null}
          {result && !result.ok ? (
            <p className="ph-dec__err" role="alert" data-testid="decision-error">
              NOT RECORDED — {result.error.slice(0, 160)}
            </p>
          ) : null}
          <button type="button" className="ph-btn ph-btn--ink ph-btn--full" disabled={!choice || deciding} onClick={() => void submit()} data-testid="decision-confirm">
            {deciding ? 'RECORDING…' : choice === 'APPROVE' ? 'CONFIRM: APPROVE AUTHORITY' : choice === 'REVISE' ? 'CONFIRM: SEND REVISION REQUEST' : 'CHOOSE A DECISION'}
          </button>
          <p className="ph-dec__foot">YOUR DECISION WILL BE RECORDED IN PRODUCTION ACTIVITY.</p>
        </>
      )}
    </OverlayShell>
  );
}

/* ── 13 PROJECT / PRODUCTION SELECTOR ─────────────────────────────────── */

export function ProjectProductionSelector({
  projects,
  activeProjectId,
  urlFor,
  onSelect,
  onClose,
}: {
  projects: readonly HubProjectEntry[];
  activeProjectId: string;
  urlFor: (slotId: string) => string | null;
  onSelect: (projectId: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const active = projects.find((p) => p.projectId === activeProjectId) ?? null;
  const others = projects.filter((p) => p.projectId !== activeProjectId && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  const prod = active?.productions[0] ?? null;
  return (
    <OverlayShell label="Project and production selector" onClose={onClose} variant="modal" testId="hub-project-selector">
      <header className="ph-ov__head">
        <span>
          <h2>PROJECT / PRODUCTION SELECTOR</h2>
          <small>SWITCH BETWEEN YOUR CREATIVE PROJECTS AND ACTIVE PRODUCTIONS.</small>
        </span>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close" data-testid="overlay-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      <div className="ph-search">
        <IcSearch width={18} height={18} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH" aria-label="Search projects" data-testid="selector-search" />
        <IcFilter width={18} height={18} />
      </div>
      {active ? (
        <>
          <p className="ph-ov__group">ACTIVE PRODUCTION</p>
          <div className="ph-proj ph-proj--active" data-testid="selector-active">
            <HubImage slotId={active.slotId} url={urlFor(active.slotId)} label="PROJECT COVER" className="ph-proj__img" />
            <span>
              <b>{prod ? prod.label : active.name}</b>
              <small>{prod ? prod.subtitle : 'NO ACTIVE PRODUCTION'}</small>
              <em>{prod ? 'CURRENTLY ACTIVE' : active.name}</em>
            </span>
            {prod ? <IcCheck width={22} height={22} /> : null}
          </div>
        </>
      ) : null}
      <p className="ph-ov__group">{active ? 'OTHER PROJECTS' : 'PROJECTS'}</p>
      {others.length === 0 ? (
        <div className="ph-empty">
          <b>NO OTHER PROJECTS</b>
          <span>{q ? 'Nothing matches that search.' : 'Only one project is available.'}</span>
        </div>
      ) : (
        <ul className="ph-projs" data-testid="selector-list">
          {others.map((p) => (
            <li key={p.projectId}>
              <button type="button" className="ph-proj" onClick={() => onSelect(p.projectId)} data-testid={`selector-project-${p.projectId}`}>
                <HubImage slotId={p.slotId} url={urlFor(p.slotId)} label="PROJECT COVER" className="ph-proj__img" />
                <span>
                  <b>{p.name}</b>
                  <small>PROJECT</small>
                  <small>{p.productions.length ? `${p.productions.length} ACTIVE ${p.productions.length === 1 ? 'ENTRY' : 'ENTRIES'}` : 'NO ACTIVE PRODUCTIONS'}</small>
                </span>
                <IcChevR width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ph-btn ph-btn--ink ph-btn--full" onClick={onClose} data-testid="selector-done">
        {prod ? `OPEN ${prod.label}` : 'DONE'} <IcArrowR width={16} height={16} />
      </button>
    </OverlayShell>
  );
}

/* ── 14 ATTENTION / INBOX QUICK VIEW ──────────────────────────────────── */

export function AttentionQuickView({
  items,
  urlFor,
  onAct,
  onInbox,
  onClose,
}: {
  items: readonly HubAttentionItem[];
  urlFor: (slotId: string | null) => string | null;
  onAct: (i: HubAttentionItem) => void;
  onInbox: () => void;
  onClose: () => void;
}) {
  return (
    <OverlayShell label="Attention quick view" onClose={onClose} variant="popover" testId="hub-attention-quick">
      <header className="ph-ov__head ph-ov__head--tight ph-aq__head">
        <button type="button" className="ph-link ph-link--ink" onClick={onClose} data-testid="overlay-close">
          CLOSE <IcClose width={14} height={14} />
        </button>
      </header>
      {items.length === 0 ? (
        <div className="ph-empty" data-testid="attention-empty">
          <b>NOTHING NEEDS YOU</b>
          <span>You are clear.</span>
        </div>
      ) : (
        <ul className="ph-aq" data-testid="attention-list">
          {items.slice(0, 4).map((i) => (
            <li key={i.id}>
              <HubImage slotId={i.assetSlotId} url={urlFor(i.assetSlotId)} label="" className="ph-aq__img" />
              <span>
                <b>{i.title}</b>
                <small>{i.subtitle}</small>
                <em>{i.stateLabel}</em>
              </span>
              <button type="button" className="ph-btn ph-btn--outline ph-aq__act" onClick={() => onAct(i)}>
                {i.actionLabel} <IcArrowR width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="ph-aq__all" onClick={onInbox} data-testid="attention-view-all">
        VIEW ALL IN INBOX <IcArrowR width={14} height={14} />
      </button>
    </OverlayShell>
  );
}

/* ── Menu ─────────────────────────────────────────────────────────────── */

export function HubMenu({ entries, onGo, onClose }: { entries: readonly { id: string; label: string; sub: string }[]; onGo: (id: string) => void; onClose: () => void }) {
  return (
    <OverlayShell label="Production menu" onClose={onClose} variant="drawer" testId="hub-menu">
      <header className="ph-ov__head">
        <h2>PRODUCTION</h2>
        <button type="button" className="ph-x" onClick={onClose} aria-label="Close" data-testid="overlay-close">
          <IcClose width={18} height={18} />
        </button>
      </header>
      <ul className="ph-menu">
        {entries.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => onGo(e.id)} data-testid={`menu-${e.id}`}>
              <span>
                <b>{e.label}</b>
                <small>{e.sub}</small>
              </span>
              <IcChevR width={14} height={14} />
            </button>
          </li>
        ))}
      </ul>
    </OverlayShell>
  );
}
