/** 05 BLUEPRINT — the reveal, its five inspection sections, the review status, and submission. */
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { normalizeIntakeStatus } from '../../../shared/site00-intakes/types';
import { IntakeGuestAccessCapture } from '../components/intake/IntakeGuestAccessCapture';
import type { BlueprintSessionSnapshot } from '../builder-experience/spatialStudio';
import { compose } from './buildObject/composition';
import { BuildThumbnail } from './buildObject/BuildObjectStage';
import type { BlueprintAnatomy, FeatureEntry, PageEntry, StructureLayer } from './buildObject/anatomy';
import type { AnchorPoint, StageAnchor } from './buildObject/engine';
import {
  BuildTypeIcon,
  ChevronSmallRightIcon,
  ClockIcon,
  CloseIcon,
  CubeIcon,
  FullscreenIcon,
  InvestmentIcon,
  RecenterIcon,
  SlidersIcon,
} from './icons';
import {
  CORE_INCLUDED,
  FEEL_BY_ID,
  PACE_OPTIONS,
  WORK_MODULE_BY_ID,
  blockerCopy,
  buildSpec,
  buildTypeSummary,
  expandInvestment,
  featureCount,
  spacedRange,
} from './studioModel';
import type { SpatialBuilderState, StudioRoomId } from './studioModel';
import { reviewTrack, spatialSubmission, versionFacts, type TrackStep } from './reviewModel';
import type { StudioSession } from './useStudioSession';

export type BlueprintTab = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';
export const BLUEPRINT_TABS: BlueprintTab[] = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];

/**
 * Each section is an inspection mode of the same proposal, and the object answers it (see `anatomy.ts`): OVERVIEW
 * shows the whole place, STRUCTURE opens it into layers, PAGES lights where each page lives, FEATURES finds each
 * capability's module, TIMELINE assembles it stage by stage.
 */
const MODE_PURPOSE: Record<BlueprintTab, string> = {
  OVERVIEW: 'SEE THE WHOLE PLACE',
  STRUCTURE: 'UNDERSTAND HOW IT IS BUILT',
  PAGES: 'EXPLORE WHERE EVERYTHING LIVES',
  FEATURES: 'DISCOVER WHAT THE PLACE CAN DO',
  TIMELINE: 'WATCH HOW IT COMES TO LIFE',
};

/** The inspection state of the open section: what is selected, and the timeline's stage. */
export type BlueprintInspectState = {
  anatomy: BlueprintAnatomy | null;
  pick: string | null;
  setPick: (pick: string | null) => void;
  /** TIMELINE: the current stage (null = complete). */
  stage: number | null;
  setStage: (stage: number | null) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Submitted → founder review → decision, from the record's stage only. */
export function StatusTrack({ steps, compact = false }: { steps: TrackStep[]; compact?: boolean }) {
  return (
    <ol className={`bs-track${compact ? ' bs-track--compact' : ''}`} aria-label="WHERE YOUR BLUEPRINT STANDS">
      {steps.map((step, i) => (
        <li key={step.key} className={`bs-track__step is-${step.state}`} aria-current={step.state === 'current' || step.state === 'attention' ? 'step' : undefined}>
          <span className="bs-track__node" aria-hidden="true">
            {step.state === 'done' ? '✓' : pad(i + 1)}
          </span>
          <span className="bs-track__label">{step.label}</span>
          <span className="bs-track__sub">{step.sub}</span>
        </li>
      ))}
    </ol>
  );
}

type Props = {
  session: StudioSession;
  goToRoom: (room: StudioRoomId) => void;
  openMenu: () => void;
  tab: BlueprintTab;
  setTab: (tab: BlueprintTab) => void;
};

/* ─────────────────────────────── stage overlay ─────────────────────────────── */

export function BlueprintStageControls({
  inspecting,
  setInspecting,
  onRecenter,
  stageRef,
  tab,
}: {
  inspecting: boolean;
  setInspecting: (v: boolean) => void;
  onRecenter: () => void;
  stageRef: RefObject<HTMLElement | null>;
  tab: BlueprintTab;
}) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const onChange = () => setExpanded(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen().catch(() => el.classList.toggle('is-expanded'));
    } else {
      el.classList.toggle('is-expanded');
    }
    setInspecting(true);
  };
  return (
    <>
      <div className="bs-inspect" role="toolbar" aria-label="INSPECT BLUEPRINT">
        <button type="button" className={`bs-inspect__btn${inspecting ? ' is-on' : ''}`} aria-pressed={inspecting} onClick={() => setInspecting(!inspecting)} aria-label="TURN THE STRUCTURE IN 3D">
          <CubeIcon size={18} />
        </button>
        {inspecting ? (
          <button type="button" className="bs-inspect__btn" onClick={onRecenter} aria-label="RESET VIEW">
            <RecenterIcon size={17} />
          </button>
        ) : null}
        <button type="button" className={`bs-inspect__btn${expanded ? ' is-on' : ''}`} onClick={() => void toggleFullscreen()} aria-label={expanded ? 'EXIT FULL SCREEN' : 'VIEW FULL SCREEN'}>
          <FullscreenIcon size={17} />
        </button>
      </div>
      {inspecting ? <p className="bs-inspect__hint">DRAG TO TURN</p> : null}
      <div className="bs-indicator" aria-hidden="true">
        {BLUEPRINT_TABS.map((t) => (
          <span key={t} className={t === tab ? 'is-on' : undefined} />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────── review status ─────────────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/** Where this Blueprint stands with SITE 00. Rendered only for states the intake record supports. */
export function ReviewStatus({ session }: { session: StudioSession }) {
  const { review, submitted, serverIntake } = session;
  const [showSubmitted, setShowSubmitted] = useState(false);
  if (review.stage === 'DRAFT' || !serverIntake) return null;
  const facts = submitted ? versionFacts(submitted.current) : null;
  return (
    <section className={`bs-review bs-review--${review.stage.toLowerCase()}`} aria-label="REVIEW STATUS" aria-live="polite">
      <p className="bs-review__eyebrow">
        {serverIntake.publicReference}
        {review.version ? ` · VERSION ${review.version}` : ''}
        {review.submittedAt ? ` · SUBMITTED ${formatDate(review.submittedAt)}` : ''}
      </p>
      <p className="bs-review__label">
        <span className="bs-review__dot" aria-hidden="true" />
        {review.label}
      </p>
      <p className="bs-review__sub">{review.sub}</p>
      <StatusTrack steps={reviewTrack(review.stage, review.version)} compact />
      {review.stage === 'REVISION_REQUESTED' ? (
        <div className="bs-review__request">
          <p className="bs-review__request-label">FROM SITE 00{review.request ? ` · ${formatDate(review.request.requestedAt)}` : ''}</p>
          <p className="bs-review__request-text">{review.request?.message ?? 'SITE 00 REOPENED YOUR BLUEPRINT FOR CHANGES.'}</p>
          <p className="bs-review__hint">
            EDIT YOUR CHOICES, THEN RESUBMIT. VERSION {review.version} STAYS ON RECORD EXACTLY AS YOU SENT IT.
          </p>
        </div>
      ) : null}
      {review.stage === 'ACCEPTED' && review.projectId ? (
        <a className="bs-btn bs-btn--outline-dark" href={`/projects/${review.projectId}`}>
          OPEN YOUR PROJECT
        </a>
      ) : null}
      {facts && review.stage === 'REVISION_REQUESTED' ? (
        <>
          <button type="button" className="bs-link" aria-expanded={showSubmitted} onClick={() => setShowSubmitted((v) => !v)}>
            {showSubmitted ? 'HIDE' : 'VIEW'} SUBMITTED VERSION {facts.version}
          </button>
          {showSubmitted ? (
            <dl className="bs-lines bs-lines--compact">
              {[
                ['PLACE', facts.place],
                ['FEEL', facts.feel],
                ['WORK', facts.modules],
                ['PACE', facts.pace],
                ['NOTE', facts.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bs-line">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

/* ─────────────────────────────── stage annotations ─────────────────────────────── */

/** Where the object's annotated points are on the stage; the stage publishes, the annotations listen. */
export type AnchorBus = { emit: (points: Record<string, AnchorPoint>) => void; subscribe: (fn: (points: Record<string, AnchorPoint>) => void) => () => void; last: () => Record<string, AnchorPoint> };

export function createAnchorBus(): AnchorBus {
  let last: Record<string, AnchorPoint> = {};
  const listeners = new Set<(points: Record<string, AnchorPoint>) => void>();
  return {
    emit(points) {
      last = points;
      listeners.forEach((fn) => fn(points));
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(last);
      return () => listeners.delete(fn);
    },
    last: () => last,
  };
}

type Marker = { id: string; elements: readonly string[]; tag: string; label: string; pick: string | null };

/** The points a section annotates on the model, each with the selection it stands for. */
export function sectionMarkers(tab: BlueprintTab, anatomy: BlueprintAnatomy | null, stage: number | null): Marker[] {
  if (!anatomy) return [];
  switch (tab) {
    case 'STRUCTURE':
      return anatomy.layers.filter((l) => l.elements.length).map((l) => ({ id: l.id, elements: l.elements, tag: l.n, label: `${l.n} · ${l.label}`, pick: l.id }));
    case 'PAGES':
      return (anatomy.pages?.homes ?? []).map((h) => {
        const first = anatomy.pages!.groups.flatMap((g) => g.pages).find((p) => p.home?.key === h.key);
        return { id: h.key, elements: h.elements, tag: pad(h.count), label: `${h.label.replace(/^THE /, '')} · ${pad(h.count)} ${h.count === 1 ? 'PAGE' : 'PAGES'}`, pick: first ? `P${first.n}` : null };
      });
    case 'FEATURES': {
      const seen = new Map<string, Marker>();
      if (anatomy.core.home.elements.length) seen.set('CORE', { id: 'CORE', elements: anatomy.core.home.elements, tag: 'CORE', label: `CORE · ${anatomy.core.label}`, pick: 'CORE' });
      for (const f of anatomy.features) {
        if (!f.home || seen.has(f.home.key) || !f.module) continue;
        const lead = anatomy.features.find((g) => g.module === f.module && g.source === 'MODULE') ?? f;
        seen.set(f.home.key, { id: f.home.key, elements: f.home.elements, tag: f.home.label.replace(/^THE | MODULE$/g, ''), label: f.home.label.replace(/^THE /, ''), pick: `F${lead.n}` });
      }
      return [...seen.values()];
    }
    case 'TIMELINE':
      return stage === null || !anatomy.stages[stage]
        ? []
        : [{ id: `S${stage}`, elements: anatomy.stages[stage].elements, tag: anatomy.stages[stage].n, label: `${anatomy.stages[stage].n} · ${anatomy.stages[stage].label}`, pick: null }];
    default:
      return [];
  }
}

/** The marker a selection lights (a page or group lights its volume's marker; a feature its module's). */
function activeMarker(tab: BlueprintTab, anatomy: BlueprintAnatomy | null, pick: string | null, stage: number | null): string | null {
  if (!anatomy) return null;
  if (tab === 'TIMELINE') return stage === null ? null : `S${stage}`;
  if (!pick) return null;
  if (tab === 'STRUCTURE') return anatomy.layers.find((l) => l.id === pick && l.elements.length)?.id ?? null;
  if (tab === 'PAGES') {
    const page = anatomy.pages?.groups.flatMap((g) => g.pages).find((p) => `P${p.n}` === pick);
    return page?.home?.key ?? null;
  }
  if (tab === 'FEATURES') return pick === 'CORE' ? 'CORE' : (anatomy.features.find((f) => `F${f.n}` === pick)?.home?.key ?? null);
  return null;
}

/** The caption a selection pins on the model. */
function calloutText(tab: BlueprintTab, anatomy: BlueprintAnatomy, pick: string | null, marker: Marker): string {
  if (tab === 'PAGES' && pick?.startsWith('P')) {
    const page = anatomy.pages?.groups.flatMap((g) => g.pages).find((p) => `P${p.n}` === pick);
    if (page) return `P${pad(page.n)} · ${page.label.toUpperCase()}`;
  }
  if (tab === 'FEATURES' && pick?.startsWith('F')) {
    const feature = anatomy.features.find((f) => `F${f.n}` === pick);
    if (feature) return `F${pad(feature.n)} · ${feature.verb}`;
  }
  return marker.label;
}

/**
 * Markers pinned to the live model: indexed layers, page counts per volume, feature modules, the assembling stage.
 * They follow the object as it turns (positions come from the engine every frame it moves), and the selected one
 * opens into a callout with a red leader. The panel holds the same choices for keyboard and screen readers, so the
 * markers are a pointer convenience and stay out of the tab order.
 */
export function BlueprintStageAnnotations({ tab, inspect, bus, anchors }: { tab: BlueprintTab; inspect: BlueprintInspectState; bus: AnchorBus; anchors: Marker[] }) {
  const { anatomy, pick, setPick, stage } = inspect;
  const refs = useRef(new Map<string, HTMLDivElement>());
  const active = activeMarker(tab, anatomy, pick, stage);
  const place = useCallback((points: Record<string, AnchorPoint>) => {
    const placed: { x: number; top: number }[] = [];
    const entries = [...refs.current].filter(([id]) => points[id]?.visible).sort(([a], [b]) => points[b].y - points[a].y);
    for (const [id, el] of refs.current) if (!points[id]?.visible) el.style.visibility = 'hidden';
    for (const [id, el] of entries) {
      const p = points[id];
      const host = el.parentElement;
      // Tags stand on stems above their point, kept below the lede the stage runs under, and lifted clear of a tag
      // already standing in the same place (lowest point first).
      const floor = host ? parseFloat(getComputedStyle(host).getPropertyValue('--bs-marks-min')) || 0 : 0;
      let top = Math.max(p.y - 27, floor - 27);
      for (const other of placed) if (Math.abs(other.x - p.x) < 34 && Math.abs(other.top - top) < 23) top = other.top - 23;
      placed.push({ x: p.x, top });
      el.style.visibility = '';
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      const lift = p.y - 27 - top;
      el.style.setProperty('--lift', `${lift}px`);
      el.classList.toggle('is-clamped', lift < 0);
      el.classList.toggle('is-left', Boolean(host && p.x > host.clientWidth * 0.56));
    }
  }, []);
  useLayoutEffect(() => bus.subscribe(place), [bus, place, anchors]);
  if (!anatomy || !anchors.length) return null;
  return (
    <div className={`bs-marks bs-marks--${tab.toLowerCase()}`} aria-hidden="true">
      {anchors.map((m) => {
        const on = m.id === active;
        return (
          <div
            key={m.id}
            ref={(el) => {
              if (el) refs.current.set(m.id, el);
              else refs.current.delete(m.id);
            }}
            className={`bs-mark${on ? ' is-on' : ''}${active && !on ? ' is-quiet' : ''}`}
            data-mark={m.id}
            style={{ visibility: 'hidden' }}
          >
            <button
              type="button"
              tabIndex={-1}
              className="bs-mark__tag"
              onClick={() => (m.pick ? setPick(on && pick === m.pick ? null : m.pick) : undefined)}
              disabled={!m.pick}
            >
              {m.tag}
            </button>
            {on ? (
              <span className="bs-mark__callout">
                <span className="bs-mark__leader" />
                <span className="bs-mark__text">{calloutText(tab, anatomy, pick, m)}</span>
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The selection's context on the stage itself — shown beside the model on desktop and whenever the stage is full
 * screen (where the panel is out of view), so an inspection never loses its explanation.
 */
function stageCaption(tab: BlueprintTab, inspect: BlueprintInspectState): { title: string; body: string } | null {
  const { anatomy, pick, stage } = inspect;
  if (!anatomy || tab === 'OVERVIEW') return null;
  switch (tab) {
    case 'STRUCTURE': {
      const layer = anatomy.layers.find((l) => l.id === pick);
      return layer ? { title: `${layer.n} · ${layer.label}`, body: layer.elements.length ? layer.caption : 'NOT DRAWN IN THE MODEL.' } : { title: 'THE LAYERS OF THE PLACE', body: anatomy.layers.map((l) => `${l.n} ${l.label}`).join(' · ') };
    }
    case 'PAGES': {
      if (!anatomy.pages) return null;
      const page = anatomy.pages.groups.flatMap((g) => g.pages).find((p) => `P${p.n}` === pick);
      if (page) return { title: `P${pad(page.n)} · ${page.label.toUpperCase()}`, body: [page.home ? `LIVES IN ${page.home.label}` : 'NOT PLACED IN THE MODEL', page.via ? `BROUGHT BY ${page.via}` : ''].filter(Boolean).join(' · ') };
      if (pick?.startsWith('G:')) return { title: pick.slice(2), body: 'LIT: WHERE THESE PAGES LIVE.' };
      return { title: `${pad(anatomy.pages.total)} PAGES`, body: anatomy.pages.homes.map((h) => `${pad(h.count)} IN ${h.label}`).join(' · ') };
    }
    case 'FEATURES': {
      if (pick === 'CORE') return { title: `CORE · ${anatomy.core.label}`, body: 'INCLUDED IN EVERY BUILD · IN THE RED CORE' };
      const feature = anatomy.features.find((f) => `F${f.n}` === pick);
      if (feature) return { title: `F${pad(feature.n)} · ${feature.verb}`, body: [feature.plain.toUpperCase(), feature.home ? `IN ${feature.home.label}` : ''].filter(Boolean).join(' · ') };
      return { title: `${anatomy.features.length} FEATURES ON ONE CORE`, body: 'LIT: THE CORE AND EVERY MODULE.' };
    }
    case 'TIMELINE': {
      const current = stage === null ? null : anatomy.stages[stage];
      return current
        ? { title: `${current.n} · ${current.label}`, body: `${current.caption} ILLUSTRATIVE ORDER · NOT A SCHEDULE.` }
        : { title: 'THE COMPLETE PLACE', body: 'ILLUSTRATIVE ORDER · NOT A SCHEDULE.' };
    }
    default:
      return null;
  }
}

export function BlueprintStageCaption({ tab, inspect }: { tab: BlueprintTab; inspect: BlueprintInspectState }) {
  const caption = stageCaption(tab, inspect);
  if (!caption) return null;
  return (
    <div className="bs-stagecap" aria-hidden="true">
      <p className="bs-stagecap__mode">
        <span>{pad(BLUEPRINT_TABS.indexOf(tab) + 1)}</span> {MODE_PURPOSE[tab]}
      </p>
      <p className="bs-stagecap__title">{caption.title}</p>
      <p className="bs-stagecap__body">{caption.body}</p>
    </div>
  );
}

/* ─────────────────────────────── panel ─────────────────────────────── */

type PanelProps = Props & { inspect: BlueprintInspectState };

/** The editorial tab index: 01 OVERVIEW … 05 TIMELINE, with a red index that slides to the open section. */
function SectionTabs({ tab, setTab }: { tab: BlueprintTab; setTab: (tab: BlueprintTab) => void }) {
  const ids = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<{ x: number; w: number } | null>(null);
  const index = BLUEPRINT_TABS.indexOf(tab);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const on = list.querySelector<HTMLElement>('.bs-tab.is-on .bs-tab__label');
      if (!on) return;
      const a = on.getBoundingClientRect();
      const b = list.getBoundingClientRect();
      setInk({ x: a.left - b.left, w: a.width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [tab]);
  const onKey = (event: React.KeyboardEvent) => {
    const n = BLUEPRINT_TABS.length;
    const to: Record<string, number> = { ArrowRight: (index + 1) % n, ArrowLeft: (index + n - 1) % n, Home: 0, End: n - 1 };
    if (!(event.key in to)) return;
    event.preventDefault();
    const next = BLUEPRINT_TABS[to[event.key]];
    setTab(next);
    document.getElementById(`${ids}-tab-${next}`)?.focus();
  };
  return (
    <div className="bs-tabs" role="tablist" aria-label="BLUEPRINT SECTIONS" onKeyDown={onKey} ref={listRef}>
      {BLUEPRINT_TABS.map((t, i) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={`${ids}-tab-${t}`}
          aria-selected={tab === t}
          aria-controls="bs-blueprint-panel"
          tabIndex={tab === t ? 0 : -1}
          className={`bs-tab${tab === t ? ' is-on' : ''}`}
          onClick={() => setTab(t)}
        >
          <span className="bs-tab__n" aria-hidden="true">
            {pad(i + 1)}
          </span>
          <span className="bs-tab__label">{t}</span>
        </button>
      ))}
      <span className="bs-tabs__ink" aria-hidden="true" style={ink ? { transform: `translateX(${ink.x}px)`, width: ink.w } : { opacity: 0 }} />
    </div>
  );
}

/** What the section is for, and what the current selection shows (announced). */
function modeHint(tab: BlueprintTab, inspect: BlueprintInspectState): string {
  const { anatomy, pick, stage, playing } = inspect;
  if (!anatomy) return '';
  switch (tab) {
    case 'STRUCTURE': {
      const layer = anatomy.layers.find((l) => l.id === pick);
      if (!layer) return 'THE MODEL OPENS INTO ITS LAYERS. SELECT ONE.';
      return layer.elements.length ? `${layer.n} ${layer.label} · LIT ON THE MODEL` : `${layer.n} ${layer.label} · NOT DRAWN IN THE MODEL`;
    }
    case 'PAGES': {
      if (!anatomy.pages) return 'A WORLD IS SHAPED AS PLACES AT BLUEPRINT REVIEW.';
      if (pick?.startsWith('G:')) return `${pick.slice(2)} · LIT ON THE MODEL`;
      const page = anatomy.pages.groups.flatMap((g) => g.pages).find((p) => `P${p.n}` === pick);
      if (page) return page.home ? `P${pad(page.n)} ${page.label.toUpperCase()} · IN ${page.home.label}` : `P${pad(page.n)} ${page.label.toUpperCase()} · NOT PLACED IN THE MODEL`;
      return 'LIT: THE VOLUMES THAT HOLD YOUR PAGES. SELECT A PAGE.';
    }
    case 'FEATURES': {
      if (pick === 'CORE') return `CORE · ${anatomy.core.label} · IN THE RED CORE`;
      const feature = anatomy.features.find((f) => `F${f.n}` === pick);
      if (feature) return feature.home ? `F${pad(feature.n)} ${feature.verb} · IN ${feature.home.label}` : `F${pad(feature.n)} ${feature.verb}`;
      return 'LIT: THE CORE AND EVERY MODULE. SELECT A FEATURE.';
    }
    case 'TIMELINE':
      if (stage === null) return 'COMPLETE · ILLUSTRATIVE ORDER, NOT A SCHEDULE';
      return `${anatomy.stages[stage]?.n ?? ''} ${anatomy.stages[stage]?.label ?? ''}${playing ? ' · ASSEMBLING' : ''}`;
    default:
      return '';
  }
}

export function BlueprintPanel(props: PanelProps) {
  const { tab, setTab, inspect } = props;
  const index = BLUEPRINT_TABS.indexOf(tab);
  // Escape returns a selection to the whole section (dialogs handle their own Escape first).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !inspect.pick || document.querySelector('.bs-dialog, .bs-menu')) return;
      inspect.setPick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspect]);
  return (
    <div className="bs-blueprint">
      <ReviewStatus session={props.session} />
      <SectionTabs tab={tab} setTab={setTab} />
      {/* The overview is drawn without a mode line; it stays for screen readers so every section change is announced. */}
      <div className={`bs-mode${tab === 'OVERVIEW' ? ' bs-visually-hidden' : ''}`} aria-live="polite">
        <p className="bs-mode__purpose">
          <span className="bs-mode__n">{pad(index + 1)}</span>
          <span className="bs-mode__rule" aria-hidden="true" />
          <span className="bs-mode__label">{MODE_PURPOSE[tab]}</span>
        </p>
        {tab !== 'OVERVIEW' ? <p className="bs-mode__hint">{modeHint(tab, inspect)}</p> : null}
      </div>
      <div key={tab} className={`bs-tabpanel bs-tabpanel--${tab.toLowerCase()}`} role="tabpanel" id="bs-blueprint-panel" aria-label={`${pad(index + 1)} ${tab}`}>
        {tab === 'OVERVIEW' ? <OverviewTab {...props} /> : null}
        {tab === 'STRUCTURE' ? <StructureMode {...props} /> : null}
        {tab === 'PAGES' ? <PagesMode {...props} /> : null}
        {tab === 'FEATURES' ? <FeaturesMode {...props} /> : null}
        {tab === 'TIMELINE' ? <TimelineMode {...props} /> : null}
      </div>
    </div>
  );
}

/** "Initial range. Based on your current selections and requirements." — the canonical confidence label stays visible. */
function rangeNote(snapshot: BlueprintSessionSnapshot, preview: boolean): string {
  if (!preview) return 'Shared at Blueprint review.';
  const label = snapshot.estimate?.confidence.label ?? 'INITIAL RANGE';
  return `${label.charAt(0)}${label.slice(1).toLowerCase()}. Based on your current selections and requirements.`;
}

function EstimateFigure({
  value,
  preview,
  quoteStatus,
  clientMessage,
}: {
  value: string | null;
  preview: boolean;
  quoteStatus?: 'ESTIMATED' | 'REQUIRES_REVIEW' | 'INCOMPLETE' | 'ERROR' | null;
  clientMessage?: string | null;
}) {
  if (!preview) return <span className="bs-figure bs-figure--muted">AT REVIEW</span>;
  if (quoteStatus === 'INCOMPLETE' || quoteStatus === 'ERROR') {
    return <span className="bs-figure bs-figure--muted">{clientMessage ?? 'COMPLETE YOUR SELECTIONS TO SEE A RANGE.'}</span>;
  }
  if (quoteStatus === 'REQUIRES_REVIEW' && value) {
    return (
      <span className="bs-figure">
        {value}
        {clientMessage ? <span className="bs-figure__note"> · {clientMessage.toUpperCase()}</span> : null}
      </span>
    );
  }
  if (value) return <span className="bs-figure">{value}</span>;
  return <span className="bs-figure bs-figure--muted">{clientMessage ?? 'UNABLE TO ESTIMATE THIS CONFIGURATION.'}</span>;
}

function ChangeLink({ session, room, goToRoom }: { session: StudioSession; room: StudioRoomId; goToRoom: (room: StudioRoomId) => void }) {
  if (session.locked) return null;
  const label = { place: '01 · PLACE', feel: '02 · FEEL', work: '03 · WORK', pace: '04 · PACE', blueprint: '' }[room];
  return (
    <button type="button" className="bs-link" onClick={() => goToRoom(room)}>
      CHANGE IN ROOM {label}
    </button>
  );
}

function OverviewTab({ session, setTab, goToRoom, openMenu }: Props) {
  const { state, snapshot } = session.view;
  const preview = session.preview;
  const selection = snapshot.selection;
  const estimate = snapshot.estimate;
  const scopeEstimate = snapshot.scope_estimate;
  const build = buildTypeSummary(state.placePath, selection);
  const feel = state.feelVibe ? FEEL_BY_ID[state.feelVibe] : null;
  const pages = snapshot.blueprint.experiences.reduce((n, g) => n + g.items.length, 0);
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const spec = buildSpec(state);
  const features = featureCount(selection);
  const world = state.placePath === 'WORLD';
  const cards: { key: string; label: string; value: string; thumb: ReturnType<typeof compose>; onOpen: () => void; hint: string }[] = [
    {
      key: 'feel',
      label: 'VISUAL DIRECTION',
      value: feel?.label ?? 'NOT CHOSEN',
      thumb: compose('feel', spec),
      onOpen: () => (session.locked ? setTab('STRUCTURE') : goToRoom('feel')),
      hint: session.locked ? 'OPEN STRUCTURE' : 'CHANGE IN ROOM 02',
    },
    {
      key: 'pages',
      label: world ? 'PLACES' : 'PAGES',
      value: world ? 'AT REVIEW' : `${pages} ${pages === 1 ? 'PAGE' : 'PAGES'}`,
      thumb: compose('work', { ...spec, modules: spec.modules.filter((m) => m === 'PAGES' || m === 'BLOG') }),
      onOpen: () => setTab('PAGES'),
      hint: 'OPEN PAGES',
    },
    { key: 'features', label: 'FEATURES', value: `${features} ${features === 1 ? 'FEATURE' : 'FEATURES'}`, thumb: compose('work', spec), onOpen: () => setTab('FEATURES'), hint: 'OPEN FEATURES' },
    { key: 'pace', label: 'PRIORITY', value: pace?.label ?? 'NOT CHOSEN', thumb: compose('pace', spec), onOpen: () => setTab('TIMELINE'), hint: 'OPEN TIMELINE' },
  ];
  return (
    <>
      <div className="bs-facts">
        <div className="bs-fact">
          <BuildTypeIcon size={22} />
          <span className="bs-fact__label">BUILD TYPE</span>
          <span className="bs-fact__value">{build.label}</span>
          <span className="bs-fact__sub">{build.descriptor}</span>
        </div>
        <div className="bs-fact">
          <ClockIcon size={22} />
          <span className="bs-fact__label">ESTIMATED TIMELINE</span>
          <EstimateFigure
            value={estimate ? spacedRange(estimate.productionWindow) : null}
            preview={preview}
            quoteStatus={scopeEstimate?.quoteStatus ?? null}
            clientMessage={scopeEstimate?.clientMessage}
          />
          <span className="bs-fact__sub">{rangeNote(snapshot, preview)}</span>
        </div>
        <div className="bs-fact">
          <InvestmentIcon size={22} />
          <span className="bs-fact__label">ESTIMATED INVESTMENT</span>
          <EstimateFigure
            value={estimate ? expandInvestment(estimate.investment) : null}
            preview={preview}
            quoteStatus={scopeEstimate?.quoteStatus ?? null}
            clientMessage={scopeEstimate?.clientMessage}
          />
          <span className="bs-fact__sub">{rangeNote(snapshot, preview)}</span>
        </div>
      </div>
      <div className="bs-config-head">
        <h2>{session.view.fromSubmission ? `VERSION ${session.review.version ?? ''} AS SUBMITTED` : 'YOUR CONFIGURATION'}</h2>
        {session.locked ? (
          <span className="bs-config-head__locked">LOCKED FOR REVIEW</span>
        ) : (
          <button type="button" className="bs-btn bs-btn--outline-dark" onClick={openMenu}>
            <SlidersIcon size={15} /> EDIT SELECTIONS
          </button>
        )}
      </div>
      <ul className="bs-config">
        {cards.map((card) => (
          <li key={card.key}>
            <button type="button" className="bs-config__card" onClick={card.onOpen} aria-label={`${card.label}: ${card.value}. ${card.hint}`}>
              <BuildThumbnail composition={card.thumb} width={168} height={120} alt="" />
              <span className="bs-config__label">{card.label}</span>
              <span className="bs-config__value">
                {card.value} <ChevronSmallRightIcon size={9} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}


/** A "show the whole" control that returns a section to its default view (the selection is reversible). */
function ShowAll({ inspect, label }: { inspect: BlueprintInspectState; label: string }) {
  if (!inspect.pick) return null;
  return (
    <button type="button" className="bs-showall" onClick={() => inspect.setPick(null)}>
      {label}
    </button>
  );
}

/* ── 02 STRUCTURE — an exploded axonometric: each layer of the model, with the Blueprint lines it carries ── */

function layerValue(layer: StructureLayer, custom: boolean): string {
  const first = layer.lines[0] ?? layer.notDrawn[0];
  if (layer.items.length) return layer.items.join(' · ');
  if (!first) return '—';
  return first.value ? first.value.toUpperCase() : custom ? 'IN YOUR CUSTOM DIRECTION' : 'NOT CHOSEN';
}

function StructureMode({ session, goToRoom, inspect }: PanelProps) {
  const { state, snapshot } = session.view;
  const anatomy = inspect.anatomy;
  const custom = state.placePath === 'CUSTOM';
  const build = buildTypeSummary(state.placePath, snapshot.selection);
  if (!anatomy) return null;
  const lineValue = (value: string | null) => (value ? value.toUpperCase() : custom ? 'DEFINED IN YOUR CUSTOM DIRECTION' : 'NOT CHOSEN');
  return (
    <div className="bs-inspector bs-inspector--structure">
      <ol className="bs-layers" aria-label="LAYERS OF THE STRUCTURE, FROM THE GROUND UP">
        {anatomy.layers.map((layer) => {
          const on = inspect.pick === layer.id;
          const drawn = layer.elements.length > 0;
          return (
            <li key={layer.id} className={`bs-layer${on ? ' is-on' : ''}${drawn ? '' : ' is-undrawn'}`}>
              <button type="button" className="bs-layer__head" aria-pressed={on} aria-expanded={on} onClick={() => inspect.setPick(on ? null : layer.id)}>
                <span className="bs-layer__n">{layer.n}</span>
                <span className="bs-layer__label">{layer.label}</span>
                <span className="bs-layer__value">{layerValue(layer, custom)}</span>
              </button>
              {on ? (
                <div className="bs-layer__sheet">
                  <p className="bs-layer__caption">{layer.caption}</p>
                  {layer.id === 'CORE' ? (
                    <p className="bs-layer__why">
                      <strong>{build.label}</strong> {build.reasons.length ? build.reasons.join(' ').toUpperCase() : 'EVERY CHOICE FITS A SIMPLE BUILD.'}
                    </p>
                  ) : null}
                  {layer.lines.length ? (
                    <dl className="bs-layer__lines">
                      {layer.lines.map((line) => (
                        <div key={line.key} className={line.open ? 'is-open' : undefined}>
                          <dt>{line.label}</dt>
                          <dd>
                            {lineValue(line.value)}
                            {line.fromSystem && line.value ? <em>FROM SYSTEM</em> : null}
                            {line.open ? <em className="is-red">OPEN</em> : null}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {layer.notDrawn.length ? (
                    <div className="bs-layer__undrawn">
                      <p className="bs-layer__flag">NOT DRAWN IN THE MODEL</p>
                      <dl className="bs-layer__lines">
                        {layer.notDrawn.map((line) => (
                          <div key={line.key} className={line.open ? 'is-open' : undefined}>
                            <dt>{line.label}</dt>
                            <dd>
                              {lineValue(line.value)}
                              {line.fromSystem && line.value ? <em>FROM SYSTEM</em> : null}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="bs-inspector__foot">
        <ShowAll inspect={inspect} label="SHOW THE WHOLE STRUCTURE" />
        <ChangeLink session={session} room="place" goToRoom={goToRoom} />
      </div>
      <p className="bs-sheet__hint">SITE 00 CONFIRMS THE STRUCTURE AT BLUEPRINT REVIEW.</p>
    </div>
  );
}

/* ── 03 PAGES — a spatial index: every page, the volume it lives in, and what brings it ── */

function PageDetail({ page }: { page: PageEntry }) {
  return (
    <div className="bs-detail" role="note">
      <p className="bs-detail__title">
        P{pad(page.n)} · {page.label.toUpperCase()} <span>{page.depth.toUpperCase()}</span>
      </p>
      <dl className="bs-detail__rows">
        <div>
          <dt>LIVES IN</dt>
          <dd>{page.home ? page.home.label : 'NOT PLACED IN THE MODEL'}</dd>
        </div>
        {page.via ? (
          <div>
            <dt>BROUGHT BY</dt>
            <dd>{page.via}</dd>
          </div>
        ) : null}
        <div>
          <dt>PART OF</dt>
          <dd>{page.group}</dd>
        </div>
      </dl>
    </div>
  );
}

function PagesMode({ session, goToRoom, inspect }: PanelProps) {
  const atlas = inspect.anatomy?.pages ?? null;
  if (!atlas) {
    return (
      <div className="bs-inspector">
        <p className="bs-sheet__lead">A WORLD IS DESIGNED AS PLACES, NOT PAGES. ITS PLACES, MOMENTS AND THINGS TO DO ARE SHAPED WITH YOU AT BLUEPRINT REVIEW.</p>
        <ChangeLink session={session} room="work" goToRoom={goToRoom} />
      </div>
    );
  }
  return (
    <div className="bs-inspector bs-inspector--pages">
      <div className="bs-atlas">
        <p className="bs-count">
          <span className="bs-count__value">{pad(atlas.total)}</span>
          <span className="bs-count__label">
            {atlas.total === 1 ? 'PAGE' : 'PAGES'}, IN {atlas.homes.length} {atlas.homes.length === 1 ? 'VOLUME' : 'VOLUMES'} OF THE MODEL
          </span>
        </p>
        <ul className="bs-atlas__homes" aria-label="WHERE THE PAGES LIVE">
          {atlas.homes.map((home) => (
            <li key={home.key}>
              <span className="bs-atlas__count">{pad(home.count)}</span> {home.label.replace(/^THE /, '')}
            </li>
          ))}
        </ul>
      </div>
      {atlas.groups.map((group) => {
        const groupPick = `G:${group.group}`;
        const groupOn = inspect.pick === groupPick;
        const open = group.pages.find((p) => `P${p.n}` === inspect.pick);
        return (
          <section key={group.group} className={`bs-pagegroup${groupOn ? ' is-on' : ''}`}>
            <h3 className="bs-pagegroup__title">
              <button type="button" aria-pressed={groupOn} onClick={() => inspect.setPick(groupOn ? null : groupPick)}>
                {group.group}
                <span>{pad(group.pages.length)}</span>
              </button>
            </h3>
            <ul className="bs-plates">
              {group.pages.map((page) => {
                const on = inspect.pick === `P${page.n}`;
                return (
                  <li key={page.n} className={`bs-plate${on ? ' is-on' : ''}${groupOn ? ' is-grouped' : ''}`}>
                    <button type="button" aria-pressed={on} onClick={() => inspect.setPick(on ? null : `P${page.n}`)}>
                      <span className="bs-plate__n">P{pad(page.n)}</span>
                      <span className="bs-plate__label">{page.label.toUpperCase()}</span>
                      <span className="bs-plate__depth">{page.depth.toUpperCase()}</span>
                    </button>
                  </li>
                );
              })}
              {open ? (
                <li className="bs-plates__detail">
                  <PageDetail page={open} />
                </li>
              ) : null}
            </ul>
          </section>
        );
      })}
      <div className="bs-inspector__foot">
        <ShowAll inspect={inspect} label="SHOW EVERY PAGE" />
        <ChangeLink session={session} room="work" goToRoom={goToRoom} />
      </div>
    </div>
  );
}

/* ── 04 FEATURES — each capability on its module, with the relationships the registry records ── */

function FeatureDetail({ feature, inspect }: { feature: FeatureEntry; inspect: BlueprintInspectState }) {
  const features = inspect.anatomy?.features ?? [];
  const link = (verb: string) => {
    const target = features.find((f) => f.verb === verb);
    return target ? (
      <button key={verb} type="button" className="bs-chip" onClick={() => inspect.setPick(`F${target.n}`)}>
        {verb}
      </button>
    ) : (
      <span key={verb} className="bs-chip bs-chip--static">
        {verb}
      </span>
    );
  };
  return (
    <div className="bs-detail" role="note">
      <p className="bs-detail__plain">{feature.plain}</p>
      <dl className="bs-detail__rows">
        <div>
          <dt>LIVES IN</dt>
          <dd>{feature.home ? feature.home.label : 'NOT DRAWN IN THE MODEL'}</dd>
        </div>
        <div>
          <dt>{feature.source === 'COMES_WITH' ? 'COMES WITH' : 'FROM'}</dt>
          <dd>
            {feature.source === 'MODULE' && feature.module ? `${WORK_MODULE_BY_ID[feature.module].label} · ROOM 03` : null}
            {feature.source === 'COMES_WITH' && feature.parent ? link(feature.parent) : null}
            {feature.source === 'STRUCTURE' ? 'YOUR STRUCTURE' : null}
            {!feature.source ? '—' : null}
          </dd>
        </div>
        {feature.bringsAlong.length ? (
          <div>
            <dt>BRINGS ALONG</dt>
            <dd className="bs-chips">{feature.bringsAlong.map(link)}</dd>
          </div>
        ) : null}
        {feature.addsPages.length ? (
          <div>
            <dt>ADDS PAGES</dt>
            <dd>{feature.addsPages.map((p) => p.toUpperCase()).join(' · ')}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function FeaturesMode({ session, goToRoom, inspect }: PanelProps) {
  const { state, snapshot } = session.view;
  const estimate = snapshot.estimate;
  const anatomy = inspect.anatomy;
  if (!anatomy) return null;
  const coreOn = inspect.pick === 'CORE';
  return (
    <div className="bs-inspector bs-inspector--features">
      <button type="button" className={`bs-tree__root${coreOn ? ' is-on' : ''}`} aria-pressed={coreOn} onClick={() => inspect.setPick(coreOn ? null : 'CORE')}>
        <span className="bs-tree__root-label">CORE</span>
        <span className="bs-tree__root-value">{CORE_INCLUDED.map((c) => (state.placePath === 'WORLD' ? c.worldLabel : c.label)).join(' · ')}</span>
      </button>
      {coreOn ? (
        <div className="bs-detail" role="note">
          <p className="bs-detail__plain">{CORE_INCLUDED.map((c) => c.plain).join(' ')}</p>
          <dl className="bs-detail__rows">
            <div>
              <dt>LIVES IN</dt>
              <dd>THE RED CORE · INCLUDED IN EVERY BUILD</dd>
            </div>
          </dl>
        </div>
      ) : null}
      <ul className="bs-tree" aria-label="CAPABILITIES CONNECTED TO THE CORE">
        {anatomy.features.map((feature) => {
          const on = inspect.pick === `F${feature.n}`;
          return (
            <li key={feature.verb} className={`bs-tree__branch${feature.comesWith ? ' is-linked' : ''}${on ? ' is-on' : ''}`}>
              <button type="button" aria-pressed={on} aria-expanded={on} onClick={() => inspect.setPick(on ? null : `F${feature.n}`)}>
                <span className="bs-tree__n" aria-hidden="true">
                  F{pad(feature.n)}
                </span>
                <span className="bs-tree__verb">{feature.verb}</span>
                <span className="bs-tree__where">{feature.module ? WORK_MODULE_BY_ID[feature.module].label : 'CORE'}</span>
                {feature.comesWith ? <em>COMES WITH YOUR CHOICES</em> : null}
              </button>
              {on ? <FeatureDetail feature={feature} inspect={inspect} /> : null}
            </li>
          );
        })}
      </ul>
      {estimate?.platformUsage.applicable ? (
        <p className="bs-sheet__hint">
          <strong>{estimate.platformUsage.label}</strong> {estimate.platformUsage.summary}
        </p>
      ) : null}
      <div className="bs-inspector__foot">
        <ShowAll inspect={inspect} label="SHOW EVERY FEATURE" />
        <ChangeLink session={session} room="work" goToRoom={goToRoom} />
      </div>
    </div>
  );
}

/* ── 05 TIMELINE — the structure assembles stage by stage; the canonical window and roadmap stay beside it ── */

function PlayGlyph({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
      <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 1.6v8.8L10.2 6z" fill="currentColor" />
    </svg>
  );
}

function StepGlyph({ back = false }: { back?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={back ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimelineMode({ session, goToRoom, inspect }: PanelProps) {
  const { state, snapshot } = session.view;
  const estimate = snapshot.estimate;
  const anatomy = inspect.anatomy;
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const note = state.paceNotes.trim();
  if (!anatomy) return null;
  const stages = anatomy.stages;
  const { stage, setStage, playing, setPlaying } = inspect;
  const current = stage === null ? null : stages[stage];
  const go = (next: number | null) => {
    setPlaying(false);
    setStage(next);
  };
  const play = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (stage === null) setStage(0);
    setPlaying(true);
  };
  const chosen = state.pace === 'EXPEDITED' && estimate?.delivery.priority.available ? estimate.delivery.priority : estimate?.delivery.standard;
  return (
    <div className="bs-inspector bs-inspector--timeline">
      <ol className="bs-stagerail" aria-label="HOW IT COMES TOGETHER">
        {stages.map((s, i) => {
          const phase = stage === null || i < stage ? 'done' : i === stage ? 'current' : 'future';
          return (
            <li key={s.n} className={`bs-stagerail__step is-${phase}`}>
              <button type="button" aria-current={phase === 'current' ? 'step' : undefined} onClick={() => go(i)} aria-label={`STAGE ${s.n} ${s.label}`}>
                <span className="bs-stagerail__n">{s.n}</span>
                <span className="bs-stagerail__label">{s.label}</span>
              </button>
            </li>
          );
        })}
        <li className={`bs-stagerail__step bs-stagerail__step--end is-${stage === null ? 'current' : 'future'}`}>
          <button type="button" aria-current={stage === null ? 'step' : undefined} onClick={() => go(null)} aria-label="THE COMPLETE PLACE">
            <span className="bs-stagerail__n">✓</span>
            <span className="bs-stagerail__label">COMPLETE</span>
          </button>
        </li>
      </ol>
      <div className="bs-stagecard" aria-live="polite">
        <div className="bs-stagecard__head">
          <p className="bs-stagecard__title">
            {current ? (
              <>
                <span>{current.n}</span> {current.label}
              </>
            ) : (
              <>
                <span>✓</span> THE COMPLETE PLACE
              </>
            )}
          </p>
          <div className="bs-stagecard__controls" role="group" aria-label="ASSEMBLY CONTROLS">
            <button type="button" className="bs-sq" onClick={() => go(stage === null ? stages.length - 1 : Math.max(0, stage - 1))} disabled={stage === 0} aria-label="PREVIOUS STAGE">
              <StepGlyph back />
            </button>
            <button type="button" className="bs-sq bs-sq--play" onClick={play} aria-pressed={playing} aria-label={playing ? 'PAUSE THE ASSEMBLY' : 'PLAY THE ASSEMBLY'}>
              <PlayGlyph playing={playing} />
            </button>
            <button type="button" className="bs-sq" onClick={() => go(stage === null ? null : stage + 1 >= stages.length ? null : stage + 1)} disabled={stage === null} aria-label="NEXT STAGE">
              <StepGlyph />
            </button>
          </div>
        </div>
        <p className="bs-stagecard__caption">
          {current
            ? current.caption
            : estimate && session.preview
              ? `INITIAL RANGE FOR THE WHOLE PLACE: ${spacedRange(estimate.productionWindow)}.`
              : 'YOUR TIMELINE IS SHARED AT BLUEPRINT REVIEW.'}
        </p>
        {current && current.items.length ? (
          <p className="bs-chips">
            {current.items.map((item) => (
              <span key={item} className="bs-chip bs-chip--static">
                {item}
              </span>
            ))}
          </p>
        ) : null}
        <p className="bs-stagecard__notice">ILLUSTRATIVE ORDER · NOT A SCHEDULE. NO STAGE HAS A DURATION OF ITS OWN.</p>
      </div>
      <p className="bs-sheet__lead">
        <strong>{pace?.label ?? 'NO PACE CHOSEN'}</strong> {pace ? pace.plain.toUpperCase() : ''}
      </p>
      {estimate ? (
        <>
          <div className="bs-lanes" role="list" aria-label="PRODUCTION WINDOWS">
            <div role="listitem" className={`bs-lane${state.pace !== 'EXPEDITED' ? ' is-chosen' : ''}`}>
              <span className="bs-lane__label">STANDARD{state.pace !== 'EXPEDITED' ? <em>YOUR PACE</em> : null}</span>
              <span className="bs-lane__window">{spacedRange(estimate.delivery.standard.window)}</span>
              <span className="bs-lane__sub">{expandInvestment(estimate.delivery.standard.investment)}</span>
            </div>
            <div role="listitem" className={`bs-lane${state.pace === 'EXPEDITED' ? ' is-chosen' : ''}${estimate.delivery.priority.available ? '' : ' is-unavailable'}`}>
              <span className="bs-lane__label">EXPEDITED{state.pace === 'EXPEDITED' ? <em>YOUR PACE</em> : null}</span>
              <span className="bs-lane__window">{estimate.delivery.priority.available ? spacedRange(estimate.delivery.priority.window) : 'NOT AVAILABLE'}</span>
              <span className="bs-lane__sub">
                {estimate.delivery.priority.available
                  ? `${expandInvestment(estimate.delivery.priority.investment)} · ${estimate.delivery.priority.sooner}`
                  : 'FOR THIS SCOPE'}
              </span>
            </div>
          </div>
          <p className="bs-sheet__hint">
            <strong>{estimate.confidence.label}</strong> {chosen ? spacedRange(chosen.window) : ''}
          </p>
          <details className="bs-more">
            <summary>HOW THE WINDOW WORKS</summary>
            <p className="bs-sheet__hint">
              {(estimate.delivery.priority.available ? estimate.delivery.priority.whyNotHalf : estimate.delivery.priority.reason).toUpperCase()}
            </p>
            <p className="bs-sheet__hint">{estimate.timelineNote.toUpperCase()}</p>
            <h3 className="bs-sheet__title">WHAT COMES FIRST</h3>
            <ul className="bs-steps bs-steps--deps">
              {estimate.dependencies.map((d) => (
                <li key={d}>
                  <span className="bs-steps__n" aria-hidden="true" />
                  <span>{d.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </details>
          <details className="bs-more">
            <summary>WHAT HAPPENS NEXT</summary>
            <ol className="bs-steps">
              {estimate.whatHappensNext.map((step, i) => (
                <li key={step}>
                  <span className="bs-steps__n" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>{step.toUpperCase()}</span>
                </li>
              ))}
            </ol>
          </details>
          <p className="bs-fineprint">
            {estimate.notAQuote} {estimate.reference}
          </p>
        </>
      ) : (
        <p className="bs-sheet__hint">YOUR TIMELINE AND INVESTMENT RANGE ARE SHARED AT BLUEPRINT REVIEW.</p>
      )}
      {note ? (
        <>
          <h3 className="bs-sheet__title">{state.placePath === 'CUSTOM' ? 'YOUR CUSTOM DIRECTION' : 'YOUR NOTE'}</h3>
          <p className="bs-sheet__hint">{note}</p>
        </>
      ) : null}
      <ChangeLink session={session} room="pace" goToRoom={goToRoom} />
    </div>
  );
}

/** Points on the model for the open section (memoised by the shell). */
export function sectionAnchors(markers: Marker[]): StageAnchor[] {
  return markers.map((m) => ({ id: m.id, elements: m.elements }));
}

/* ─────────────────────────────── actions ─────────────────────────────── */

function ArrowGlyph() {
  return (
    <svg width="24" height="10" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 6h25M21 1.5 26 6l-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** CTA wording for each stage. Never claims a state the record does not hold. */
function ctaFor(session: StudioSession): { label: string; arrow: boolean } {
  const { review, submitted, syncStatus } = session;
  if (syncStatus === 'submitting') return { label: 'SUBMITTING…', arrow: false };
  switch (review.stage) {
    case 'SUBMISSION_RECEIVED':
    case 'REVISION_SUBMITTED':
      return { label: `VERSION ${review.version ?? ''} SUBMITTED`.replace('  ', ' '), arrow: false };
    case 'UNDER_REVIEW':
      return { label: 'UNDER REVIEW', arrow: false };
    case 'ACCEPTED':
      return { label: 'ACCEPTED', arrow: false };
    case 'CLOSED':
      return { label: 'CLOSED', arrow: false };
    case 'REVISION_REQUESTED':
      return { label: `RESUBMIT AS VERSION ${(submitted?.current.version ?? 0) + 1}`, arrow: true };
    default:
      return { label: 'CONFIRM & SUBMIT FOR REVIEW', arrow: true };
  }
}

/** Why SUBMIT is unavailable right now, in the client's words. Empty when it is available. */
export function submitBlockers(session: StudioSession): { text: string; room: StudioRoomId | null }[] {
  const out: { text: string; room: StudioRoomId | null }[] = [];
  const { snapshot, state } = session;
  const open = snapshot.blueprint.lines.filter((line) => line.open).map((line) => line.label);
  for (const code of snapshot.submission_blockers) {
    if (code === 'BLUEPRINT_INCOMPLETE') {
      if (snapshot.blueprint.decisions.length) continue; // shown as a decision with its own actions
      if (state.placePath === 'CUSTOM' && open.length) {
        out.push({
          text: `A CUSTOM DIRECTION CANNOT BE SUBMITTED FROM THE STUDIO YET: ${open.join(', ')} ARE DEFINED WITH SITE 00. YOUR BLUEPRINT STAYS SAVED.`,
          room: null,
        });
        continue;
      }
    }
    out.push(blockerCopy(code));
  }
  if (!session.isSample && !session.serverIntakeId && session.syncStatus !== 'restoring') {
    out.push({ text: 'SITE 00 IS NOT REACHABLE, SO NOTHING CAN BE SUBMITTED YET. YOUR CHOICES ARE SAVED ON THIS DEVICE.', room: null });
  }
  return out;
}

export function BlueprintActions({ session, goToRoom }: Props) {
  const { snapshot, state, review, locked, update } = session;
  const [sheet, setSheet] = useState<'submit' | 'save' | null>(null);
  const decisions = locked ? [] : snapshot.blueprint.decisions;
  const blockers = locked ? [] : submitBlockers(session);
  const cta = ctaFor(session);
  const canSubmit = !locked && snapshot.submission_ready && Boolean(session.serverIntakeId) && session.syncStatus !== 'submitting';

  return (
    <>
      {decisions.length ? (
        <div className="bs-decision" role="alert">
          {decisions.map((d) => (
            <p key={d.id} className="bs-decision__text">
              {d.message.toUpperCase()}
            </p>
          ))}
          <div className="bs-decision__actions">
            {state.placePath === 'SIMPLE' ? (
              <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={() => update({ placePath: 'ADVANCED' })}>
                KEEP IT · MOVE TO ADVANCED
              </button>
            ) : null}
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={() => goToRoom('work')}>
              CHANGE MY CHOICES
            </button>
          </div>
        </div>
      ) : null}
      {blockers.length ? (
        <ul className="bs-blockers" aria-live="polite">
          {blockers.map((b) => (
            <li key={b.text}>
              {b.text}
              {b.room ? (
                <button type="button" className="bs-link" onClick={() => goToRoom(b.room!)}>
                  GO TO {b.room.toUpperCase()}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" className="bs-cta" disabled={!canSubmit} onClick={() => setSheet('submit')}>
        {cta.label}
        {cta.arrow ? <ArrowGlyph /> : null}
      </button>
      {!locked ? (
        <button type="button" className="bs-cta bs-cta--outline" onClick={() => setSheet('save')}>
          SAVE FOR LATER
        </button>
      ) : null}
      <p className="bs-status" aria-live="polite">
        {review.stage === 'DRAFT' || review.stage === 'REVISION_REQUESTED'
          ? session.indicator.detail ?? ''
          : 'SITE 00 REPLIES BY EMAIL. YOUR BLUEPRINT STAYS HERE, EXACTLY AS SUBMITTED.'}
      </p>
      {sheet === 'submit' ? <SubmitSheet session={session} onClose={() => setSheet(null)} /> : null}
      {sheet === 'save' ? <SaveSheet session={session} onClose={() => setSheet(null)} /> : null}
    </>
  );
}

/* ─────────────────────────────── sheets ─────────────────────────────── */

function useDialog(onClose: () => void) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return closeRef;
}

/** A guest needs an email on the intake so SITE 00 can reply and they can come back from any device. */
function needsEmail(session: StudioSession): boolean {
  const intake = session.serverIntake;
  if (!intake) return true;
  return intake.ownerKind !== 'AUTHENTICATED' && !intake.email;
}

function Summary({ state, snapshot, preview }: { state: SpatialBuilderState; snapshot: BlueprintSessionSnapshot; preview: boolean }) {
  // The estimator's level label already reads "… BUILD"; only name the path separately when it differs (WORLD).
  const level = snapshot.scope.buildLevel;
  const place = !state.placePath ? '—' : level.startsWith(state.placePath) ? level : `${state.placePath} · ${level}`;
  const rows: [string, string, string][] = [
    ['01', 'PLACE', place],
    ['02', 'FEEL', state.feelVibe ? FEEL_BY_ID[state.feelVibe].label : '—'],
    ['03', 'WORK', state.workModules.join(' · ').replace(/_/g, ' ') || '—'],
    ['04', 'PACE', state.pace ?? '—'],
  ];
  return (
    <>
      <dl className="bs-proposal">
        {rows.map(([n, k, v]) => (
          <div key={k} className="bs-proposal__row">
            <dt>
              <span className="bs-proposal__n">{n}</span>
              {k}
            </dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {preview && snapshot.estimate ? (
        <p className="bs-proposal__range">
          <span className="bs-proposal__range-label">{snapshot.estimate.confidence.label}</span>
          <span className="bs-proposal__range-value">{expandInvestment(snapshot.estimate.investment)}</span>
          <span className="bs-proposal__range-sub">{spacedRange(snapshot.estimate.productionWindow)}</span>
        </p>
      ) : null}
    </>
  );
}

function SubmitSheet({ session, onClose }: { session: StudioSession; onClose: () => void }) {
  const closeRef = useDialog(onClose);
  const titleId = useId();
  const [phase, setPhase] = useState<'confirm' | 'submitting' | 'received' | 'failed'>('confirm');
  const [received, setReceived] = useState<{ version: number; reference: string } | null>(null);
  const nextVersion = (session.submitted?.current.version ?? 0) + 1;
  const email = needsEmail(session);

  const submit = async () => {
    if (phase === 'submitting') return;
    setPhase('submitting');
    const result = await session.submitForReview();
    const confirmed = result && normalizeIntakeStatus(result.status) === 'SUBMITTED' ? spatialSubmission(result) : null;
    if (result && confirmed) {
      setReceived({ version: confirmed.current.version, reference: result.publicReference });
      setPhase('received');
    } else {
      setPhase('failed');
    }
  };

  return (
    <div className="bs-sheet-backdrop" role="presentation" onClick={phase === 'submitting' ? undefined : onClose}>
      <div className="bs-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="bs-dialog__close" onClick={onClose} aria-label="CLOSE" disabled={phase === 'submitting'}>
          <CloseIcon size={18} />
        </button>
        {phase === 'received' && received ? (
          <>
            <p className="bs-dialog__eyebrow">
              <span>05</span> BLUEPRINT PROPOSAL
            </p>
            <span className="bs-dialog__seal" aria-hidden="true">
              ✓
            </span>
            <h2 id={titleId} className="bs-dialog__title">
              SUBMISSION RECEIVED<span className="bs-dot">.</span>
            </h2>
            <p className="bs-dialog__ref">
              {received.reference} · VERSION {received.version}
            </p>
            <StatusTrack steps={reviewTrack('SUBMISSION_RECEIVED', received.version)} />
            <p className="bs-dialog__text">
              AWAITING FOUNDER REVIEW. SITE 00 REVIEWS YOUR BLUEPRINT AND REPLIES BY EMAIL. NOTHING IS CHARGED AND THE RANGE IS NOT A QUOTE.
            </p>
            <button type="button" className="bs-cta" onClick={onClose}>
              VIEW MY BLUEPRINT
            </button>
          </>
        ) : (
          <>
            <p className="bs-dialog__eyebrow">
              <span>05</span> BLUEPRINT PROPOSAL{nextVersion > 1 ? ` · VERSION ${nextVersion}` : ''}
            </p>
            <h2 id={titleId} className="bs-dialog__title">
              {nextVersion > 1 ? `RESUBMIT AS VERSION ${nextVersion}` : 'SUBMIT YOUR BLUEPRINT'}
              <span className="bs-dot">.</span>
            </h2>
            <div className="bs-dialog__plate">
              <BuildThumbnail composition={compose('blueprint', buildSpec(session.state))} width={320} height={150} alt="" />
            </div>
            <Summary state={session.state} snapshot={session.snapshot} preview={session.preview} />
            {nextVersion > 1 ? (
              <p className="bs-dialog__text">VERSION {nextVersion - 1} STAYS ON RECORD. SITE 00 SEES WHAT CHANGED.</p>
            ) : (
              <p className="bs-dialog__text">SITE 00 RECEIVES THIS EXACT VERSION WITH ITS INITIAL RANGE. THIS IS NOT A QUOTE.</p>
            )}
            {email ? (
              <div className="bs-dialog__email">
                <IntakeGuestAccessCapture intakeType="BUILDER" onRequestAccess={session.intakeSync.requestGuestAccess} alreadyIssued={false} />
              </div>
            ) : null}
            {phase === 'failed' ? (
              <p className="bs-dialog__error" role="alert">
                NOT SUBMITTED — {(session.intakeSync.errorMessage ?? 'SITE 00 DID NOT CONFIRM THE SUBMISSION').toUpperCase().replace(/\.$/, '')}.{' '}
                {session.serverHasChoices ? 'YOUR CHOICES ARE SAVED WITH SITE 00. TRY AGAIN.' : 'YOUR LATEST CHOICES ARE ON THIS DEVICE. TRY AGAIN.'}
              </p>
            ) : null}
            <button type="button" className="bs-cta" disabled={email || phase === 'submitting'} onClick={() => void submit()}>
              {phase === 'submitting' ? 'SUBMITTING…' : phase === 'failed' ? 'TRY AGAIN' : nextVersion > 1 ? `SUBMIT VERSION ${nextVersion}` : 'SUBMIT FOR REVIEW'}
              {phase === 'submitting' ? null : <ArrowGlyph />}
            </button>
            {email ? <p className="bs-dialog__text bs-dialog__text--small">ADD YOUR EMAIL ABOVE SO SITE 00 CAN REPLY.</p> : null}
          </>
        )}
      </div>
    </div>
  );
}

function SaveSheet({ session, onClose }: { session: StudioSession; onClose: () => void }) {
  const closeRef = useDialog(onClose);
  const titleId = useId();
  const [result, setResult] = useState<'saving' | 'saved' | 'local' | null>(null);
  useEffect(() => {
    let cancelled = false;
    setResult('saving');
    void session.retrySave().then((ok) => {
      if (!cancelled) setResult(ok ? 'saved' : 'local');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one save per opening
  }, []);
  const time = session.intakeSync.lastSavedAt ? new Date(session.intakeSync.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="bs-sheet-backdrop" role="presentation" onClick={onClose}>
      <div className="bs-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="bs-dialog__close" onClick={onClose} aria-label="CLOSE">
          <CloseIcon size={18} />
        </button>
        <h2 id={titleId} className="bs-dialog__title">
          {result === 'saved' ? 'SAVED' : result === 'local' ? 'LOCAL ONLY' : 'SAVING'}
          <span className="bs-dot">.</span>
        </h2>
        <p className="bs-dialog__text" aria-live="polite">
          {result === 'saved'
            ? `YOUR BLUEPRINT IS SAVED WITH SITE 00${time ? ` AT ${time}` : ''}. ${session.serverIntake?.publicReference ?? ''}`
            : result === 'local'
              ? `SITE 00 DID NOT CONFIRM THE SAVE. YOUR CHOICES ARE ON THIS DEVICE ONLY.${session.intakeSync.errorMessage ? ` ${session.intakeSync.errorMessage.toUpperCase()}` : ''}`
              : 'SAVING YOUR BLUEPRINT WITH SITE 00…'}
        </p>
        {result === 'saved' && needsEmail(session) ? (
          <div className="bs-dialog__email">
            <IntakeGuestAccessCapture intakeType="BUILDER" onRequestAccess={session.intakeSync.requestGuestAccess} alreadyIssued={false} />
          </div>
        ) : null}
        <button type="button" className="bs-cta" onClick={onClose}>
          DONE
        </button>
      </div>
    </div>
  );
}
