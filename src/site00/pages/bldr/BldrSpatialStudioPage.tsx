/** NON-AUTHORITATIVE UI scaffold — Opus replaces presentation; keep spatial intake session boundary. */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { templateSystemEnabled } from '../../../studioos/estimation/flags';
import { blueprintEconomicsForSelection } from '../../builder-experience/spatialStudio/blueprintEconomics';
import { roomIndex } from '../../builder-experience/spatialStudio/mapping';
import { useBuilderSpatialIntakeSession } from '../../builder-experience/spatialStudio/useBuilderSpatialIntakeSession';
import { IntakeSaveStatus } from '../../components/intake/IntakeSaveStatus';
import {
  FEEL_OPTIONS,
  PACE_OPTIONS,
  PLACE_OPTIONS,
  SPATIAL_ROOM_ORDER,
  WORK_OPTIONS,
  type SpatialBuilderState,
  type SpatialRoomId,
  type BlueprintSectionId,
  type WorkModuleId,
} from '../../builder-experience/spatialStudio/types';
import { BuildObjectStage } from '../../components/bldr/spatial-studio/BuildObjectStage';
import { BuilderSpatialShell } from '../../components/bldr/spatial-studio/BuilderSpatialShell';
import { SITE00_ROUTES } from '../../config/routes';
import '../../styles/site00-builder-spatial-studio.css';

const WORK_ORBIT: { id: WorkModuleId; label: string }[] = [
  { id: 'PAGES', label: 'PAGES' },
  { id: 'BLOG', label: 'BLOG' },
  { id: 'SHOP', label: 'SHOP' },
  { id: 'MEMBER_AREA', label: 'MEMBER' },
  { id: 'BOOKING', label: 'BOOKING' },
  { id: 'PORTAL', label: 'PORTAL' },
];

function roomMeta(room: SpatialRoomId) {
  switch (room) {
    case 'PLACE':
      return {
        number: '01',
        name: 'PLACE',
        title: 'WHAT ARE WE CREATING?',
        subtitle:
          'CHOOSE THE KIND OF DIGITAL LOCATION YOU WANT TO BUILD. EACH OPTION OPENS A DIFFERENT POSSIBILITY.',
      };
    case 'FEEL':
      return {
        number: '02',
        name: 'FEEL',
        title: 'HOW SHOULD IT FEEL?',
        subtitle:
          'EXPLORE DIFFERENT VISUAL DIRECTIONS. THESE EXPRESSIONS SET THE TONE FOR YOUR DIGITAL LOCATION.',
      };
    case 'WORK':
      return {
        number: '03',
        name: 'WORK',
        title: 'WHAT MUST IT DO?',
        subtitle:
          'SELECT THE CAPABILITIES YOUR DIGITAL LOCATION NEEDS. EACH FEATURE ADDS A LAYER TO YOUR STRUCTURE.',
      };
    case 'PACE':
      return {
        number: '04',
        name: 'PACE',
        title: 'HOW SHOULD WE BUILD IT?',
        subtitle: "SET YOUR PRIORITIES AND PREFERRED TIMING. WE'LL RECOMMEND THE RIGHT APPROACH BASED ON YOUR GOALS.",
      };
    case 'BLUEPRINT':
      return {
        number: '05',
        name: 'BLUEPRINT',
        title: 'YOUR BLUEPRINT.',
        subtitle: 'A PROPOSED DIGITAL LOCATION BUILT AROUND YOUR GOALS.',
      };
    default:
      return { number: '00', name: 'BUILDER', title: 'BUILDER', subtitle: '' };
  }
}

function toggleModule(list: SpatialBuilderState['workModules'], id: WorkModuleId) {
  if (id === 'PAGES') return list.includes(id) ? list : [...list, id];
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function feelTagline(id: SpatialBuilderState['feelVibe']): string {
  switch (id) {
    case 'MODERN':
      return 'CLEAN · REFINED · TIMELESS';
    case 'BOLD':
      return 'GRAPHIC · HIGH CONTRAST · CONFIDENT';
    case 'EDITORIAL':
      return 'LITERATE · MEASURED · EDITORIAL';
    case 'IMMERSIVE':
      return 'CINEMATIC · SPATIAL · DEPTH';
    default:
      return '';
  }
}

function BldrSpatialStudioExperience() {
  const {
    state,
    persist,
    snapshot,
    resetSession,
    showEstimate,
    goRoom,
    submitForReview,
    canEdit,
    isSubmitted,
    syncStatus,
    intakeSync,
  } = useBuilderSpatialIntakeSession();
  const { blueprint, scope, estimate } = snapshot;
  const pageCount = useMemo(
    () => blueprint.experiences.reduce((n, g) => n + g.items.length, 0),
    [blueprint.experiences],
  );
  const featureCount = state.workModules.length;

  const meta = roomMeta(state.room);
  const progressStep = state.room === 'BLUEPRINT' ? 5 : roomIndex(state.room) + 1;
  const progressTotal = state.room === 'BLUEPRINT' ? 5 : 4;

  const stage = (
    <div className={state.room === 'WORK' ? 'bldr-spatial-work-wrap' : undefined}>
      <BuildObjectStage
        placePath={state.placePath}
        feelVibe={state.feelVibe}
        workModules={state.workModules}
        view={state.buildObjectView}
        onViewChange={state.room === 'BLUEPRINT' ? (v) => persist({ ...state, buildObjectView: v }) : undefined}
        compact={state.room === 'WORK'}
      />
      {state.room === 'WORK' ? (
        <div className="bldr-spatial-work-orbit" aria-label="Capability modules">
          {WORK_ORBIT.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={state.workModules.includes(opt.id) ? 'is-selected' : undefined}
              aria-pressed={state.workModules.includes(opt.id)}
              title={opt.label}
              onClick={() => persist({ ...state, workModules: toggleModule(state.workModules, opt.id) })}
            >
              +
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  let controls: React.ReactNode = null;

  if (state.room === 'PLACE') {
    controls = (
      <div className="bldr-spatial-grid bldr-spatial-grid--place">
        {PLACE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`bldr-spatial-card${state.placePath === opt.id ? ' is-selected' : ''}`}
            onClick={() => persist({ ...state, placePath: opt.id })}
          >
            <span className="bldr-spatial-card__label">{opt.label}</span>
            <span className="bldr-spatial-card__hint">{opt.hint}</span>
          </button>
        ))}
      </div>
    );
  }

  if (state.room === 'FEEL') {
    const active = FEEL_OPTIONS.find((f) => f.id === state.feelVibe);
    controls = (
      <>
        {active ? <p className="bldr-spatial-feel-active">{active.label} — {feelTagline(active.id)}</p> : null}
        <div className="bldr-spatial-feel-rail" role="tablist" aria-label="Visual expressions">
          {FEEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={state.feelVibe === opt.id}
              className={state.feelVibe === opt.id ? 'is-selected' : undefined}
              onClick={() => persist({ ...state, feelVibe: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </>
    );
  }

  if (state.room === 'WORK') {
    controls = (
      <>
        <div className="bldr-spatial-grid bldr-spatial-grid--work">
          {WORK_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`bldr-spatial-chip${state.workModules.includes(opt.id) ? ' is-selected' : ''}`}
              onClick={() => persist({ ...state, workModules: toggleModule(state.workModules, opt.id) })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="bldr-spatial-core-row">
          <p>CORE PAGES INCLUDED</p>
          <div className="bldr-spatial-core-chips">
            {['WEBSITE', 'MOBILE', 'SEO', 'ANALYTICS'].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (state.room === 'PACE') {
    controls = (
      <>
        <div className="bldr-spatial-pace-list">
          {PACE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`bldr-spatial-pace-item${state.pace === opt.id ? ' is-selected' : ''}`}
              onClick={() => persist({ ...state, pace: opt.id })}
            >
              <input type="checkbox" readOnly checked={state.pace === opt.id} tabIndex={-1} aria-hidden />
              <span>
                <strong className="bldr-spatial-card__label">{opt.label}</strong>
                <span className="bldr-spatial-card__hint">{opt.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <label className="bldr-spatial-notes">
          <span>NOTES (OPTIONAL)</span>
          <textarea
            value={state.paceNotes}
            onChange={(e) => persist({ ...state, paceNotes: e.target.value })}
            rows={3}
          />
        </label>
      </>
    );
  }

  if (state.room === 'BLUEPRINT') {
    const sections: { id: BlueprintSectionId; label: string }[] = [
      { id: 'OVERVIEW', label: 'OVERVIEW' },
      { id: 'STRUCTURE', label: 'STRUCTURE' },
      { id: 'PAGES', label: 'PAGES' },
      { id: 'FEATURES', label: 'FEATURES' },
      { id: 'TIMELINE', label: 'TIMELINE' },
    ];
    const economics = blueprintEconomicsForSelection(snapshot.selection, showEstimate && estimate ? estimate.investment : null);
    const buildTypeHint =
      state.placePath === 'SIMPLE'
        ? 'Refine an established system.'
        : state.placePath === 'ADVANCED'
          ? 'Reshape the system around your needs.'
          : state.placePath === 'CUSTOM'
            ? 'Build from zero with custom direction.'
            : state.placePath === 'WORLD'
              ? 'A connected spatial environment.'
              : '';

    controls = (
      <div className="bldr-spatial-blueprint">
        <nav className="bldr-spatial-blueprint__nav" aria-label="Blueprint sections">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={state.blueprintSection === s.id ? 'is-active' : undefined}
              onClick={() => persist({ ...state, blueprintSection: s.id })}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {(state.blueprintSection === 'OVERVIEW' || state.blueprintSection === 'TIMELINE') && (
          <dl className="bldr-spatial-blueprint__metrics">
            <div className="bldr-spatial-blueprint__metric">
              <dt>BUILD TYPE</dt>
              <dd>{state.placePath ?? '—'}</dd>
              <small>{buildTypeHint}</small>
            </div>
            <div className="bldr-spatial-blueprint__metric">
              <dt>ESTIMATED TIMELINE</dt>
              <dd>{showEstimate && estimate ? estimate.productionWindow : '—'}</dd>
              <small>From the SITE 00 estimator — not a guaranteed delivery date.</small>
            </div>
            <div className="bldr-spatial-blueprint__metric">
              <dt>ESTIMATED INVESTMENT</dt>
              <dd>{showEstimate && estimate ? estimate.investment : '—'}</dd>
              <small>Based on current selections. Final estimate after SITE 00 review.</small>
            </div>
          </dl>
        )}

        {state.blueprintSection === 'OVERVIEW' ? (
          <>
            <div className="bldr-spatial-blueprint__economics">
              <p className="bldr-spatial-blueprint__disclaimer">
                <strong>{economics.build.heading}.</strong> {economics.build.amountLabel}
              </p>
              <p className="bldr-spatial-blueprint__disclaimer">
                <strong>{economics.platform.heading}.</strong> {economics.platform.line}
              </p>
              <p className="bldr-spatial-blueprint__disclaimer">
                <strong>{economics.thirdParty.heading}.</strong> {economics.thirdParty.line}
              </p>
              <p className="bldr-spatial-blueprint__disclaimer">
                <strong>{economics.agreement.heading}.</strong> {economics.agreement.line}
              </p>
            </div>
            <div className="bldr-spatial-blueprint__config-head">
              <h3>YOUR CONFIGURATION</h3>
              <button type="button" className="bldr-spatial-shell__btn bldr-spatial-shell__btn--ghost" onClick={() => goRoom('PLACE')}>
                EDIT SELECTIONS
              </button>
            </div>
            <div className="bldr-spatial-blueprint__cards">
              <button type="button" className="bldr-spatial-blueprint__card" onClick={() => goRoom('FEEL')}>
                <div className="bldr-spatial-blueprint__card-thumb" />
                <span>VISUAL DIRECTION</span>
                <strong>{state.feelVibe ?? '—'} ›</strong>
              </button>
              <button type="button" className="bldr-spatial-blueprint__card" onClick={() => goRoom('WORK')}>
                <div className="bldr-spatial-blueprint__card-thumb" />
                <span>PAGES</span>
                <strong>{pageCount} PAGES ›</strong>
              </button>
              <button type="button" className="bldr-spatial-blueprint__card" onClick={() => goRoom('WORK')}>
                <div className="bldr-spatial-blueprint__card-thumb" />
                <span>FEATURES</span>
                <strong>{featureCount} FEATURES ›</strong>
              </button>
              <button type="button" className="bldr-spatial-blueprint__card" onClick={() => goRoom('PACE')}>
                <div className="bldr-spatial-blueprint__card-thumb" />
                <span>PRIORITY</span>
                <strong>{state.pace ?? '—'} ›</strong>
              </button>
            </div>
            <p className="bldr-spatial-blueprint__disclaimer">{scope.plain}</p>
          </>
        ) : null}

        {state.blueprintSection === 'STRUCTURE' ? (
          <ul className="bldr-spatial-blueprint__list">
            {blueprint.lines.map((line) => (
              <li key={line.key}>
                <span>{line.label}</span>
                <strong>{line.value ?? 'NOT CHOSEN'}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {state.blueprintSection === 'PAGES' ? (
          <ul className="bldr-spatial-blueprint__list">
            {blueprint.experiences.map((g) => (
              <li key={g.group}>
                <span>{g.group}</span>
                <strong>{g.items.map((i) => i.label).join(' · ') || '—'}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {state.blueprintSection === 'FEATURES' ? (
          <ul className="bldr-spatial-blueprint__list">
            {blueprint.capabilities.map((c) => (
              <li key={c.verb}>
                <span>{c.verb}</span>
                <strong>{c.comesWith ? 'INCLUDED' : 'SELECTED'}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {state.blueprintSection === 'TIMELINE' && estimate ? (
          <div className="bldr-spatial-blueprint__estimate">
            <p className="bldr-spatial-blueprint__window">{showEstimate ? estimate.productionWindow : '—'}</p>
            <p className="bldr-spatial-blueprint__investment">{showEstimate ? estimate.investment : '—'}</p>
            <p className="bldr-spatial-blueprint__disclaimer">{estimate.notAQuote}</p>
            <p className="bldr-spatial-blueprint__disclaimer">{estimate.timelineNote}</p>
          </div>
        ) : null}
      </div>
    );
  }

  const nextRoom = (): SpatialRoomId | null => {
    const idx = SPATIAL_ROOM_ORDER.indexOf(state.room);
    return SPATIAL_ROOM_ORDER[idx + 1] ?? null;
  };

  const prevRoom = (): SpatialRoomId | null => {
    const idx = SPATIAL_ROOM_ORDER.indexOf(state.room);
    return idx > 0 ? SPATIAL_ROOM_ORDER[idx - 1]! : null;
  };

  const primary =
    state.room === 'PACE'
      ? { label: 'REVIEW MY BLUEPRINT →', disabled: !state.pace, onClick: () => goRoom('BLUEPRINT') }
      : state.room === 'BLUEPRINT'
        ? {
            label: isSubmitted && !canEdit ? 'SUBMITTED FOR REVIEW' : 'CONFIRM & SUBMIT FOR REVIEW →',
            disabled:
              !snapshot.submission_ready || !canEdit || syncStatus === 'submitting' || (isSubmitted && !canEdit),
            onClick: () => void submitForReview(),
          }
        : {
            label: 'CONTINUE →',
            disabled:
              (state.room === 'PLACE' && !state.placePath) ||
              (state.room === 'FEEL' && !state.feelVibe) ||
              (state.room === 'WORK' && state.workModules.length === 0),
            onClick: () => {
              const n = nextRoom();
              if (n) goRoom(n);
            },
          };

  return (
    <div className="bldr-spatial-page">
      <IntakeSaveStatus
        state={intakeSync.saveState}
        lastSavedAt={intakeSync.lastSavedAt}
        errorMessage={intakeSync.errorMessage ?? (syncStatus === 'local_only' ? 'LOCAL ONLY — CONNECTING TO SITE 00…' : null)}
      />
      <BuilderSpatialShell
        room={state.room}
        roomNumber={meta.number}
        roomName={meta.name}
        title={meta.title}
        subtitle={meta.subtitle}
        progressStep={progressStep}
        progressTotal={progressTotal}
        scopeLabel={`SCOPE · ${scope.signal} · ${scope.buildLevel}`}
        onBack={prevRoom() ? () => goRoom(prevRoom()!) : undefined}
        primaryAction={primary}
        secondaryAction={
          state.savedAt
            ? { label: 'RESET', onClick: () => resetSession() }
            : { label: 'SAVE FOR LATER', onClick: () => persist(state) }
        }
        stage={stage}
        controls={controls}
      />
    </div>
  );
}

export default function BldrSpatialStudioPage() {
  if (!templateSystemEnabled()) {
    return (
      <div className="bldr-spatial-disabled">
        <p>Hybrid Spatial Studio requires `VITE_SITE00_TEMPLATE_SYSTEM_V1`.</p>
        <Link to={SITE00_ROUTES.bldr}>← BACK TO BLDR</Link>
      </div>
    );
  }
  return <BldrSpatialStudioExperience />;
}
