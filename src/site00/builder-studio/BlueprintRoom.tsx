/** 05 BLUEPRINT — the reveal, its five inspection sections, the review status, and submission. */
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { normalizeIntakeStatus } from '../../../shared/site00-intakes/types';
import { IntakeGuestAccessCapture } from '../components/intake/IntakeGuestAccessCapture';
import type { BlueprintSessionSnapshot } from '../builder-experience/spatialStudio';
import { compose } from './buildObject/composition';
import { BuildThumbnail } from './buildObject/BuildObjectStage';
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
  blockerCopy,
  buildSpec,
  buildTypeSummary,
  capabilityPlain,
  expandInvestment,
  featureCount,
  spacedRange,
} from './studioModel';
import type { SpatialBuilderState, StudioRoomId } from './studioModel';
import { reviewTrack, spatialSubmission, versionFacts, type TrackStep } from './reviewModel';
import type { StudioSession } from './useStudioSession';

export type BlueprintTab = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';
export const BLUEPRINT_TABS: BlueprintTab[] = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];

/** Each section is an inspection mode of the same proposal; the object follows it (see composition `focus`). */
const TAB_MODE: Record<BlueprintTab, string> = {
  OVERVIEW: 'THE PROPOSED LOCATION',
  STRUCTURE: 'ARCHITECTURAL BREAKDOWN',
  PAGES: 'PAGE ORGANIZATION',
  FEATURES: 'CAPABILITY RELATIONSHIPS',
  TIMELINE: 'PRODUCTION EXPECTATIONS',
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

/* ─────────────────────────────── panel ─────────────────────────────── */

export function BlueprintPanel(props: Props) {
  const { tab, setTab } = props;
  const ids = useId();
  const index = BLUEPRINT_TABS.indexOf(tab);
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
    <div className="bs-blueprint">
      <ReviewStatus session={props.session} />
      <div className="bs-tabs" role="tablist" aria-label="BLUEPRINT SECTIONS" onKeyDown={onKey} style={{ '--bs-tab-i': index } as React.CSSProperties}>
        {BLUEPRINT_TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${ids}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${ids}-panel`}
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
        <span className="bs-tabs__ink" aria-hidden="true" />
      </div>
      <p className="bs-mode" aria-live="polite">
        <span className="bs-mode__n">{pad(index + 1)}</span>
        <span className="bs-mode__rule" aria-hidden="true" />
        <span className="bs-mode__label">{TAB_MODE[tab]}</span>
      </p>
      <div key={tab} className="bs-tabpanel" role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-tab-${tab}`}>
        {tab === 'OVERVIEW' ? <OverviewTab {...props} /> : null}
        {tab === 'STRUCTURE' ? <StructureTab {...props} /> : null}
        {tab === 'PAGES' ? <PagesTab {...props} /> : null}
        {tab === 'FEATURES' ? <FeaturesTab {...props} /> : null}
        {tab === 'TIMELINE' ? <TimelineTab {...props} /> : null}
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

function EstimateFigure({ value, preview }: { value: string | null; preview: boolean }) {
  if (!preview) return <span className="bs-figure bs-figure--muted">AT REVIEW</span>;
  return <span className="bs-figure">{value ?? '—'}</span>;
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
          <EstimateFigure value={estimate ? spacedRange(estimate.productionWindow) : null} preview={preview} />
          <span className="bs-fact__sub">{rangeNote(snapshot, preview)}</span>
        </div>
        <div className="bs-fact">
          <InvestmentIcon size={22} />
          <span className="bs-fact__label">ESTIMATED INVESTMENT</span>
          <EstimateFigure value={estimate ? expandInvestment(estimate.investment) : null} preview={preview} />
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

const COMMERCIAL_LINES = ['COMMERCE', 'PLATFORM', 'PLATFORM_USAGE', 'PAYMENT_PROCESSING', 'ONGOING_SUPPORT'];

function StructureTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const build = buildTypeSummary(state.placePath, snapshot.selection);
  const custom = state.placePath === 'CUSTOM';
  const strata = snapshot.blueprint.lines.filter((line) => !COMMERCIAL_LINES.includes(line.key));
  return (
    <div className="bs-sheet bs-sheet--structure">
      <div className="bs-keystone">
        <span className="bs-keystone__label">BUILD TYPE</span>
        <span className="bs-keystone__value">{build.label}</span>
        <span className="bs-keystone__sub">{build.reasons.length ? build.reasons.join(' ').toUpperCase() : 'EVERY CHOICE FITS A SIMPLE BUILD.'}</span>
      </div>
      <ol className="bs-strata" aria-label="STRUCTURE, FROM FOUNDATION UP">
        {strata.map((line, i) => (
          <li key={line.key} className={`bs-stratum${line.open ? ' is-open' : ''}`}>
            <span className="bs-stratum__n" aria-hidden="true">
              L{i + 1}
            </span>
            <span className="bs-stratum__label">{line.label}</span>
            <span className="bs-stratum__value">
              {line.value ? line.value.toUpperCase() : custom ? 'DEFINED IN YOUR CUSTOM DIRECTION' : 'NOT CHOSEN'}
              {line.fromSystem && line.value ? <em>FROM SYSTEM</em> : null}
              {line.open ? <em className="is-red">OPEN</em> : null}
            </span>
          </li>
        ))}
      </ol>
      <p className="bs-sheet__hint">THE STRUCTURE FOLLOWS FROM WHAT YOU ARE CREATING. SITE 00 CONFIRMS IT AT BLUEPRINT REVIEW.</p>
      <ChangeLink session={session} room="place" goToRoom={goToRoom} />
    </div>
  );
}

function PagesTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  if (state.placePath === 'WORLD') {
    return (
      <div className="bs-sheet">
        <p className="bs-sheet__lead">A WORLD IS DESIGNED AS PLACES, NOT PAGES. ITS PLACES, MOMENTS AND THINGS TO DO ARE SHAPED WITH YOU AT BLUEPRINT REVIEW.</p>
        <ChangeLink session={session} room="work" goToRoom={goToRoom} />
      </div>
    );
  }
  const total = snapshot.blueprint.experiences.reduce((n, g) => n + g.items.length, 0);
  let n = 0;
  return (
    <div className="bs-sheet bs-sheet--pages">
      <p className="bs-count">
        <span className="bs-count__value">{pad(total)}</span>
        <span className="bs-count__label">PAGES ASSEMBLED FROM YOUR STRUCTURE AND FEATURES</span>
      </p>
      {snapshot.blueprint.experiences.map((group) => (
        <section key={group.group} className="bs-pagegroup">
          <h3 className="bs-pagegroup__title">
            {group.group}
            <span>{pad(group.items.length)}</span>
          </h3>
          <ul className="bs-plates">
            {group.items.map((item) => {
              n += 1;
              return (
                <li key={item.label} className="bs-plate">
                  <span className="bs-plate__n">P{pad(n)}</span>
                  <span className="bs-plate__label">{item.label.toUpperCase()}</span>
                  <span className="bs-plate__depth">{item.depth.toUpperCase()}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <ChangeLink session={session} room="work" goToRoom={goToRoom} />
    </div>
  );
}

function FeaturesTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const estimate = snapshot.estimate;
  return (
    <div className="bs-sheet bs-sheet--features">
      <p className="bs-tree__root">
        <span className="bs-tree__root-label">CORE</span>
        <span className="bs-tree__root-value">{CORE_INCLUDED.map((c) => (state.placePath === 'WORLD' ? c.worldLabel : c.label)).join(' · ')}</span>
      </p>
      <ul className="bs-tree" aria-label="CAPABILITIES CONNECTED TO THE CORE">
        {snapshot.blueprint.capabilities.map((cap, i) => (
          <li key={cap.verb} className={`bs-tree__branch${cap.comesWith ? ' is-linked' : ''}`}>
            <span className="bs-tree__n" aria-hidden="true">
              F{pad(i + 1)}
            </span>
            <span className="bs-tree__verb">{cap.verb}</span>
            <span className="bs-tree__plain">{capabilityPlain(cap.verb)}</span>
            {cap.comesWith ? <em>COMES WITH YOUR CHOICES</em> : null}
          </li>
        ))}
      </ul>
      {estimate?.platformUsage.applicable ? (
        <p className="bs-sheet__hint">
          <strong>{estimate.platformUsage.label}</strong> {estimate.platformUsage.summary}
        </p>
      ) : null}
      <ChangeLink session={session} room="work" goToRoom={goToRoom} />
    </div>
  );
}

function TimelineTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const estimate = snapshot.estimate;
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const note = state.paceNotes.trim();
  return (
    <div className="bs-sheet">
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
            <strong>{estimate.confidence.label}</strong>
          </p>
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
          <h3 className="bs-sheet__title">WHAT HAPPENS NEXT</h3>
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
  if (!session.serverIntakeId && session.syncStatus !== 'restoring') {
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
