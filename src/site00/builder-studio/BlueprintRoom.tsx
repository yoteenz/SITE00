/** 05 BLUEPRINT — the reveal, its five inspection sections, and submission. */
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react';
import { clientEstimatePreviewEnabled } from '../../studioos/estimation/flags';
import { saveEstimateLocally } from '../../studioos/estimation/persistence';
import { STRUCTURES, WORLD_FORMS, builderBlueprint, builderEstimateView, CAPABILITY_BY_ID } from '../builder-experience';
import type { BuilderSelection, BuilderEstimateView } from '../builder-experience';
import type { StructuralArchetypeId, WorldArchetypeId } from '../../studioos/estimation/types';
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
  STUDIO_ESTIMATE_RECORD_KEY,
  buildTypeSummary,
  expandInvestment,
  featureCount,
  spacedRange,
  studioReadiness,
  suggestedStructure,
} from './studioModel';
import type { StudioDraft, StudioRoomId } from './studioModel';
import { blueprintEstimateRecord, useBlueprintSubmission } from './submitBlueprint';

export type BlueprintTab = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';
export const BLUEPRINT_TABS: BlueprintTab[] = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];

type Props = {
  draft: StudioDraft;
  selection: BuilderSelection;
  update: (patch: Partial<StudioDraft> | ((d: StudioDraft) => StudioDraft)) => void;
  goToRoom: (room: StudioRoomId) => void;
  openMenu: () => void;
  saveNow: () => boolean;
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

/* ─────────────────────────────── panel ─────────────────────────────── */

function useEstimate(selection: BuilderSelection): BuilderEstimateView | null {
  return useMemo(() => {
    try {
      return builderEstimateView(selection);
    } catch {
      return null;
    }
  }, [selection]);
}

export function BlueprintPanel(props: Props) {
  const { selection, tab, setTab } = props;
  const estimate = useEstimate(selection);
  const blueprint = useMemo(() => builderBlueprint(selection), [selection]);
  const preview = clientEstimatePreviewEnabled();
  const ids = useId();
  return (
    <div className="bs-blueprint">
      <div className="bs-tabs" role="tablist" aria-label="BLUEPRINT SECTIONS">
        {BLUEPRINT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${ids}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${ids}-panel`}
            className={`bs-tab${tab === t ? ' is-on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bs-tabpanel" role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-tab-${tab}`}>
        {tab === 'OVERVIEW' ? <OverviewTab {...props} estimate={estimate} preview={preview} /> : null}
        {tab === 'STRUCTURE' ? <StructureTab {...props} blueprint={blueprint} /> : null}
        {tab === 'PAGES' ? <PagesTab {...props} blueprint={blueprint} /> : null}
        {tab === 'FEATURES' ? <FeaturesTab {...props} blueprint={blueprint} estimate={estimate} /> : null}
        {tab === 'TIMELINE' ? <TimelineTab {...props} estimate={estimate} preview={preview} /> : null}
      </div>
    </div>
  );
}

/** "Initial range. Based on your current selections and requirements." — the canonical confidence label stays visible. */
function rangeNote(estimate: BuilderEstimateView | null, preview: boolean): string {
  if (!preview) return 'Shared at Blueprint review.';
  const label = estimate?.confidence.label ?? 'INITIAL RANGE';
  return `${label.charAt(0)}${label.slice(1).toLowerCase()}. Based on your current selections and requirements.`;
}

function EstimateFigure({ value, preview }: { value: string | null; preview: boolean }) {
  if (!preview) return <span className="bs-figure bs-figure--muted">AT REVIEW</span>;
  return <span className="bs-figure">{value ?? '—'}</span>;
}

function OverviewTab({ draft, selection, setTab, goToRoom, openMenu, estimate, preview }: Props & { estimate: BuilderEstimateView | null; preview: boolean }) {
  const build = buildTypeSummary(draft, selection);
  const feel = draft.feel ? FEEL_BY_ID[draft.feel] : null;
  const pages = estimate?.included.experiences.length ?? 0;
  const pace = PACE_OPTIONS.find((p) => p.id === draft.pace)!;
  const spec = { path: draft.path, feel: draft.feel, modules: draft.modules, pace: draft.pace };
  const cards: { key: string; label: string; value: string; thumb: ReturnType<typeof compose>; onOpen: () => void; hint: string }[] = [
    { key: 'feel', label: 'VISUAL DIRECTION', value: feel?.label ?? 'NOT CHOSEN', thumb: compose('feel', spec), onOpen: () => goToRoom('feel'), hint: 'CHANGE IN ROOM 02' },
    { key: 'pages', label: draft.path === 'WORLD' ? 'PLACES' : 'PAGES', value: draft.path === 'WORLD' ? 'AT REVIEW' : `${pages} PAGES`, thumb: compose('work', { ...spec, modules: draft.modules.filter((m) => m === 'PAGES' || m === 'BLOG') }), onOpen: () => setTab('PAGES'), hint: 'OPEN PAGES' },
    { key: 'features', label: 'FEATURES', value: `${featureCount(selection)} ${featureCount(selection) === 1 ? 'FEATURE' : 'FEATURES'}`, thumb: compose('work', spec), onOpen: () => setTab('FEATURES'), hint: 'OPEN FEATURES' },
    { key: 'pace', label: 'PRIORITY', value: pace.label, thumb: compose('pace', spec), onOpen: () => setTab('TIMELINE'), hint: 'OPEN TIMELINE' },
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
          <span className="bs-fact__sub">{rangeNote(estimate, preview)}</span>
        </div>
        <div className="bs-fact">
          <InvestmentIcon size={22} />
          <span className="bs-fact__label">ESTIMATED INVESTMENT</span>
          <EstimateFigure value={estimate ? expandInvestment(estimate.investment) : null} preview={preview} />
          <span className="bs-fact__sub">{rangeNote(estimate, preview)}</span>
        </div>
      </div>
      <div className="bs-config-head">
        <h2>YOUR CONFIGURATION</h2>
        <button type="button" className="bs-btn bs-btn--outline-dark" onClick={openMenu}>
          <SlidersIcon size={15} /> EDIT SELECTIONS
        </button>
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

function StructureTab({ draft, selection, update, blueprint }: Props & { blueprint: ReturnType<typeof builderBlueprint> }) {
  const build = buildTypeSummary(draft, selection);
  const world = draft.path === 'WORLD';
  const currentStructure = selection.structure;
  const currentWorld = selection.world?.form ?? null;
  return (
    <div className="bs-sheet">
      <p className="bs-sheet__lead">
        <strong>{build.label} BUILD</strong> {build.reasons.length ? build.reasons.join(' ').toUpperCase() : 'EVERY CHOICE FITS A SIMPLE BUILD.'}
      </p>
      <dl className="bs-lines">
        {blueprint.lines
          .filter((line) => !['COMMERCE', 'PLATFORM', 'PLATFORM_USAGE', 'PAYMENT_PROCESSING', 'ONGOING_SUPPORT'].includes(line.key))
          .map((line) => (
            <div key={line.key} className="bs-line">
              <dt>{line.label}</dt>
              <dd>
                {line.value ? line.value.toUpperCase() : draft.path === 'CUSTOM' ? 'DEVELOPED IN CREATIVE DIRECTION' : 'NOT CHOSEN'}
                {line.fromSystem && line.value ? <em> FROM SYSTEM</em> : null}
              </dd>
            </div>
          ))}
      </dl>
      <h3 className="bs-sheet__title">{world ? 'WORLD FORM' : 'STRUCTURE'}</h3>
      {!world && !draft.structure ? <p className="bs-sheet__hint">SUGGESTED FROM YOUR CHOICES. CHOOSE ANOTHER IF IT FITS BETTER.</p> : null}
      <div className="bs-options" role="radiogroup" aria-label={world ? 'WORLD FORM' : 'STRUCTURE'}>
        {world
          ? WORLD_FORMS.filter((f) => f.id !== 'HYBRID_WORLD').map((form) => (
              <button
                key={form.id}
                type="button"
                role="radio"
                aria-checked={currentWorld === form.id}
                className={`bs-option${currentWorld === form.id ? ' is-selected' : ''}`}
                onClick={() => update({ worldForm: form.id as WorldArchetypeId })}
              >
                <span className="bs-option__label">{form.label.toUpperCase()}</span>
                <span className="bs-option__sub">{form.movement}</span>
              </button>
            ))
          : STRUCTURES.filter((s) => s.id !== 'HYBRID').map((structure) => (
              <button
                key={structure.id}
                type="button"
                role="radio"
                aria-checked={currentStructure === structure.id}
                className={`bs-option${currentStructure === structure.id ? ' is-selected' : ''}`}
                onClick={() =>
                  update({ structure: structure.id === suggestedStructure(draft.modules) ? null : (structure.id as StructuralArchetypeId) })
                }
              >
                <span className="bs-option__label">{structure.label.toUpperCase()}</span>
                <span className="bs-option__sub">{structure.compositionLogic}</span>
              </button>
            ))}
      </div>
    </div>
  );
}

function PagesTab({ draft, goToRoom, blueprint }: Props & { blueprint: ReturnType<typeof builderBlueprint> }) {
  if (draft.path === 'WORLD') {
    return (
      <div className="bs-sheet">
        <p className="bs-sheet__lead">A WORLD IS DESIGNED AS PLACES, NOT PAGES. ITS PLACES, MOMENTS AND THINGS TO DO ARE SHAPED WITH YOU AT BLUEPRINT REVIEW.</p>
      </div>
    );
  }
  const total = blueprint.experiences.reduce((n, g) => n + g.items.length, 0);
  return (
    <div className="bs-sheet">
      <p className="bs-sheet__lead">
        <strong>{total} PAGES</strong>
        {draft.modules.includes('PAGES') ? ' EACH DESIGNED IN MORE DEPTH.' : ' ASSEMBLED FROM YOUR STRUCTURE AND FEATURES.'}
      </p>
      {blueprint.experiences.map((group) => (
        <div key={group.group} className="bs-group">
          <h3 className="bs-group__title">{group.group}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.label}>
                <span>{item.label.toUpperCase()}</span>
                <em>{item.depth.toUpperCase()}</em>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button type="button" className="bs-link" onClick={() => goToRoom('work')}>
        CHANGE IN ROOM 03 · WORK
      </button>
    </div>
  );
}

function FeaturesTab({ draft, goToRoom, blueprint, estimate }: Props & { blueprint: ReturnType<typeof builderBlueprint>; estimate: BuilderEstimateView | null }) {
  return (
    <div className="bs-sheet">
      <ul className="bs-features">
        {blueprint.capabilities.map((cap) => {
          const plain = Object.values(CAPABILITY_BY_ID).find((c) => c.verb === cap.verb)?.plain ?? '';
          return (
            <li key={cap.verb}>
              <span className="bs-features__verb">{cap.verb}</span>
              <span className="bs-features__plain">{plain}</span>
              {cap.comesWith ? <em>COMES WITH YOUR CHOICES</em> : null}
            </li>
          );
        })}
      </ul>
      <h3 className="bs-sheet__title">CORE INCLUDED</h3>
      <p className="bs-sheet__hint">{CORE_INCLUDED.map((c) => (draft.path === 'WORLD' ? c.worldLabel : c.label)).join(' · ')}</p>
      {estimate?.platformUsage.applicable ? (
        <p className="bs-sheet__hint">
          <strong>{estimate.platformUsage.label}</strong> {estimate.platformUsage.summary}
        </p>
      ) : null}
      <button type="button" className="bs-link" onClick={() => goToRoom('work')}>
        CHANGE IN ROOM 03 · WORK
      </button>
    </div>
  );
}

function TimelineTab({ draft, goToRoom, estimate, preview }: Props & { estimate: BuilderEstimateView | null; preview: boolean }) {
  const pace = PACE_OPTIONS.find((p) => p.id === draft.pace)!;
  if (!estimate) return <p className="bs-sheet__lead">THE ESTIMATE IS UNAVAILABLE FOR THIS CONFIGURATION.</p>;
  const priority = estimate.delivery.priority;
  return (
    <div className="bs-sheet">
      <p className="bs-sheet__lead">
        <strong>{pace.label}</strong> {pace.plain.toUpperCase()}
      </p>
      {preview ? (
        <dl className="bs-lines">
          <div className="bs-line">
            <dt>STANDARD</dt>
            <dd>
              {spacedRange(estimate.delivery.standard.window)} · {expandInvestment(estimate.delivery.standard.investment)}
            </dd>
          </div>
          <div className="bs-line">
            <dt>EXPEDITED</dt>
            <dd>
              {priority.available
                ? `${spacedRange(priority.window)} · ${expandInvestment(priority.investment)} · ${priority.sooner}`
                : 'NOT AVAILABLE FOR THIS SCOPE'}
            </dd>
          </div>
          <div className="bs-line">
            <dt>RANGE</dt>
            <dd>{estimate.confidence.label}</dd>
          </div>
        </dl>
      ) : (
        <p className="bs-sheet__hint">YOUR TIMELINE AND INVESTMENT RANGE ARE SHARED AT BLUEPRINT REVIEW.</p>
      )}
      {priority.available ? <p className="bs-sheet__hint">{priority.whyNotHalf.toUpperCase()}</p> : <p className="bs-sheet__hint">{priority.reason.toUpperCase()}</p>}
      <p className="bs-sheet__hint">{estimate.timelineNote.toUpperCase()}</p>
      <h3 className="bs-sheet__title">WHAT COMES FIRST</h3>
      <ul className="bs-bullets">
        {estimate.dependencies.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <h3 className="bs-sheet__title">ASSUMPTIONS</h3>
      <ul className="bs-bullets">
        {estimate.assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h3 className="bs-sheet__title">WHAT HAPPENS NEXT</h3>
      <ol className="bs-bullets">
        {estimate.whatHappensNext.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {draft.notes.trim() ? (
        <>
          <h3 className="bs-sheet__title">YOUR NOTE</h3>
          <p className="bs-sheet__hint">{draft.notes}</p>
        </>
      ) : null}
      <p className="bs-fineprint">
        {estimate.notAQuote} {estimate.reference}
      </p>
      <button type="button" className="bs-link" onClick={() => goToRoom('pace')}>
        CHANGE IN ROOM 04 · PACE
      </button>
    </div>
  );
}

/* ─────────────────────────────── actions + submission ─────────────────────────────── */

export function BlueprintActions({ draft, selection, update, saveNow, goToRoom }: Props) {
  const readiness = studioReadiness(draft, selection);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const submitted = draft.submission !== null;

  const save = () => {
    const ok = saveNow();
    try {
      saveEstimateLocally(STUDIO_ESTIMATE_RECORD_KEY, blueprintEstimateRecord(selection));
    } catch {
      /* the draft itself is saved; the record is a convenience */
    }
    setSavedNote(ok ? `SAVED ON THIS DEVICE · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'THIS BROWSER BLOCKED SAVING. KEEP THIS TAB OPEN.');
  };

  return (
    <>
      {readiness.decisions.length ? (
        <div className="bs-decision" role="alert">
          {readiness.decisions.map((d) => (
            <p key={d.id} className="bs-decision__text">
              {d.message.toUpperCase()}
            </p>
          ))}
          <div className="bs-decision__actions">
            {draft.path === 'SIMPLE' ? (
              <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={() => update({ acceptedLevelRaise: true })}>
                KEEP IT · ADVANCED BUILD
              </button>
            ) : null}
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={() => goToRoom('work')}>
              CHANGE MY CHOICES
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className="bs-cta"
        disabled={!readiness.ready || submitted}
        onClick={() => setSheetOpen(true)}
      >
        {submitted ? 'SUBMITTED FOR REVIEW' : 'CONFIRM & SUBMIT FOR REVIEW'}
        {!submitted ? <ArrowGlyph /> : null}
      </button>
      <button type="button" className="bs-cta bs-cta--outline" onClick={save}>
        SAVE FOR LATER
      </button>
      <p className="bs-status" aria-live="polite">
        {submitted
          ? `SENT ${new Date(draft.submission!.submittedAt).toLocaleDateString()} · REFERENCE ${draft.submission!.intakeId.slice(0, 8).toUpperCase()}`
          : savedNote ?? ''}
      </p>
      {sheetOpen ? (
        <SubmitSheet
          draft={draft}
          selection={selection}
          onClose={() => setSheetOpen(false)}
          onSubmitted={(intakeId) => update({ submission: { intakeId, submittedAt: new Date().toISOString() } })}
        />
      ) : null}
    </>
  );
}

function ArrowGlyph() {
  return (
    <svg width="24" height="10" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 6h25M21 1.5 26 6l-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubmitSheet({ draft, selection, onClose, onSubmitted }: { draft: StudioDraft; selection: BuilderSelection; onClose: () => void; onSubmitted: (intakeId: string) => void }) {
  const { state, submit } = useBlueprintSubmission();
  const [email, setEmail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const send = async () => {
    const id = await submit({ email, draft, selection });
    if (id) onSubmitted(id);
  };
  return (
    <div className="bs-sheet-backdrop" role="presentation" onClick={onClose}>
      <div className="bs-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bs-dialog__close" onClick={onClose} aria-label="CLOSE">
          <CloseIcon size={18} />
        </button>
        {state.status === 'sent' ? (
          <>
            <h2 id={titleId} className="bs-dialog__title">
              SENT FOR REVIEW<span className="bs-dot">.</span>
            </h2>
            <p className="bs-dialog__text">SITE 00 REVIEWS YOUR BLUEPRINT WITH YOU AND REPLIES WITH A REFINED RANGE. NOTHING IS CHARGED AND THIS IS NOT A QUOTE.</p>
            <p className="bs-dialog__ref">REFERENCE {state.intakeId.slice(0, 8).toUpperCase()}</p>
            <button type="button" className="bs-cta" onClick={onClose}>
              DONE
            </button>
          </>
        ) : (
          <>
            <h2 id={titleId} className="bs-dialog__title">
              SEND YOUR BLUEPRINT<span className="bs-dot">.</span>
            </h2>
            <p className="bs-dialog__text">WHERE SHOULD SITE 00 REPLY? YOUR SELECTIONS AND INITIAL RANGE TRAVEL WITH IT. THIS IS NOT A QUOTE.</p>
            <label className="bs-field">
              <span>EMAIL</span>
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOU@YOURBUSINESS.COM"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void send();
                }}
              />
            </label>
            {state.status === 'error' ? (
              <p className="bs-dialog__error" role="alert">
                {state.message} YOUR BLUEPRINT IS STILL SAVED ON THIS DEVICE.
              </p>
            ) : null}
            <button type="button" className="bs-cta" disabled={state.status === 'sending'} onClick={() => void send()}>
              {state.status === 'sending' ? 'SENDING…' : 'SEND FOR REVIEW'}
              {state.status === 'sending' ? null : <ArrowGlyph />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
