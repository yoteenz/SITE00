/** Room controls for 01 PLACE · 02 FEEL · 03 WORK · 04 PACE. */
import { useMemo, useState } from 'react';
import { BsBody } from './bldrBody';
import { builderEstimateView } from '../builder-experience';
import type { BuilderSelection } from '../builder-experience';
import { compose } from './buildObject/composition';
import { BuildThumbnail } from './buildObject/BuildObjectStage';
import {
  CartIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronSmallRightIcon,
  ExpeditedIcon,
  FlexibleIcon,
  HomeIcon,
  LayersIcon,
  MobileIcon,
  PeopleIcon,
  PersonIcon,
  PlusIcon,
  StandardIcon,
  WebsiteIcon,
} from './icons';
import { coreIncludedView } from './blueprintTabsModel';
import type { PageGroupKey } from './blueprintTabsModel';
import { FEEL_BY_ID, FEEL_OPTIONS, PACE_OPTIONS, PATH_OPTIONS, WORK_MODULES, moduleLevelCheck } from './studioModel';
import type { PacePreferenceId, PlacePathId, SpatialBuilderState, WorkModuleId } from './studioModel';

export type RoomProps = {
  state: SpatialBuilderState;
  selection: BuilderSelection;
  update: (patch: Partial<SpatialBuilderState> | ((s: SpatialBuilderState) => SpatialBuilderState)) => void;
};

function cycle<T>(list: readonly T[], current: T | null, step: 1 | -1): T {
  const index = current === null ? (step === 1 ? -1 : 0) : list.indexOf(current);
  return list[(index + step + list.length) % list.length];
}

/** Carousel arrows on the stage. They move the selection, so the stage and the cards never disagree. */
export function StageArrows({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" className="bs-arrow bs-arrow--prev" onClick={onPrev} aria-label={`PREVIOUS ${label}`}>
        <ChevronLeftIcon size={22} />
      </button>
      <button type="button" className="bs-arrow bs-arrow--next" onClick={onNext} aria-label={`NEXT ${label}`}>
        <ChevronRightIcon size={22} />
      </button>
    </>
  );
}

/* ─────────────────────────────── 01 PLACE ─────────────────────────────── */

export function PlaceStageArrows({ state, update }: RoomProps) {
  const ids = PATH_OPTIONS.map((p) => p.id);
  return (
    <StageArrows
      label="BUILD"
      onPrev={() => update({ placePath: cycle<PlacePathId>(ids, state.placePath, -1) })}
      onNext={() => update({ placePath: cycle<PlacePathId>(ids, state.placePath, 1) })}
    />
  );
}

export function PlaceControls({ state, update }: RoomProps) {
  return (
    <div className="bs-cards" role="radiogroup" aria-label="WHAT ARE WE CREATING">
      {PATH_OPTIONS.map((option) => {
        const selected = state.placePath === option.id;
        const thumb = compose('place', { path: option.id, feel: state.feelVibe, modules: [], pace: state.pace });
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`bs-card${selected ? ' is-selected' : ''}`}
            onClick={() => update({ placePath: option.id })}
            title={option.plain}
          >
            <BuildThumbnail composition={thumb} width={176} height={88} alt="" />
            <span className="bs-card__label">{option.label}</span>
            <span className="bs-card__sub">
              <BsBody>{option.descriptor}</BsBody>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────── 02 FEEL ─────────────────────────────── */

export function FeelStageArrows({ state, update }: RoomProps) {
  const ids = FEEL_OPTIONS.map((f) => f.id);
  return (
    <StageArrows
      label="DIRECTION"
      onPrev={() => update({ feelVibe: cycle(ids, state.feelVibe, -1) })}
      onNext={() => update({ feelVibe: cycle(ids, state.feelVibe, 1) })}
    />
  );
}

export function FeelControls({ state, update }: RoomProps) {
  const focused = state.feelVibe ? FEEL_BY_ID[state.feelVibe] : null;
  return (
    <>
      <div className="bs-feel-caption" aria-live="polite">
        <p className="bs-feel-caption__label">{focused ? focused.label : 'YOUR DIRECTION'}</p>
        <p className="bs-feel-caption__sub">
          <BsBody>{focused ? focused.descriptor : 'CHOOSE ONE BELOW'}</BsBody>
        </p>
        {state.placePath === 'CUSTOM' && state.feelVibe ? (
          <p className="bs-feel-caption__note">A STARTING REFERENCE FOR YOUR CUSTOM DIRECTION</p>
        ) : null}
      </div>
      <div className="bs-strip" role="radiogroup" aria-label="VISUAL DIRECTION">
        {FEEL_OPTIONS.map((option) => {
          const selected = state.feelVibe === option.id;
          const thumb = compose('feel', { path: state.placePath, feel: option.id, modules: [], pace: state.pace });
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`bs-strip__item${selected ? ' is-selected' : ''}`}
              onClick={() => update({ feelVibe: option.id })}
              title={`${option.label} · ${option.systemLabel}`}
            >
              <BuildThumbnail composition={thumb} width={160} height={126} alt="" />
              <span className="bs-strip__label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─────────────────────────────── 03 WORK ─────────────────────────────── */

type PendingRaise = { module: WorkModuleId; reason: string } | null;

export function useWorkModules({ state, update }: RoomProps) {
  const [pending, setPending] = useState<PendingRaise>(null);
  const toggle = (id: WorkModuleId) => {
    if (state.workModules.includes(id)) {
      update((s) => ({ ...s, workModules: s.workModules.filter((m) => m !== id) }));
      setPending(null);
      return;
    }
    const check = moduleLevelCheck(state, id);
    if (check.raises) {
      setPending({ module: id, reason: check.reason });
      return;
    }
    update((s) => ({ ...s, workModules: [...s.workModules, id] }));
  };
  // The contract resolves "part of an advanced build" by moving the build to the ADVANCED path.
  const keep = () => {
    if (!pending) return;
    const id = pending.module;
    update((s) => ({ ...s, placePath: 'ADVANCED', workModules: [...s.workModules, id] }));
    setPending(null);
  };
  return { pending, toggle, keep, dismiss: () => setPending(null) };
}

export function WorkStageToggles({ state, toggle, pending }: RoomProps & { toggle: (id: WorkModuleId) => void; pending: PendingRaise }) {
  return (
    <div className="bs-modules" role="group" aria-label="CAPABILITIES">
      {WORK_MODULES.map((module) => {
        const on = state.workModules.includes(module.id);
        const asking = pending?.module === module.id;
        return (
          <div key={module.id} className={`bs-module bs-module--${module.side} bs-module--row${module.row}`}>
            <span className="bs-module__label" id={`bs-module-${module.id}`}>
              {module.label}
            </span>
            <button
              type="button"
              className={`bs-module__toggle${on ? ' is-on' : ''}${asking ? ' is-asking' : ''}`}
              aria-pressed={on}
              aria-labelledby={`bs-module-${module.id}`}
              title={module.plain}
              onClick={() => toggle(module.id)}
            >
              {on ? <CheckIcon size={16} /> : <PlusIcon size={18} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

const GROUP_ICONS: Record<PageGroupKey, typeof WebsiteIcon> = {
  FRONT_DOOR: HomeIcon,
  STORY_OFFER: CartIcon,
  CLIENT_SPACE: PersonIcon,
  TEAM_ACCESS: PeopleIcon,
};

export function WorkControls(props: RoomProps & { pending: PendingRaise; keep: () => void; dismiss: () => void }) {
  const { state, selection, pending, keep, dismiss } = props;
  // Opening the panel or a group is local view state only: it never writes to the session.
  const [open, setOpen] = useState(true);
  const world = state.placePath === 'WORLD';
  const view = useMemo(() => coreIncludedView(selection), [selection]);
  const { pages } = view;
  return (
    <>
      {pending ? (
        <div className="bs-decision" role="alertdialog" aria-label="DECISION">
          <p className="bs-decision__text">
            <BsBody>{pending.reason}</BsBody>
          </p>
          <div className="bs-decision__actions">
            <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={keep}>
              ADD IT · MOVE TO ADVANCED
            </button>
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={dismiss}>
              NOT NOW
            </button>
          </div>
        </div>
      ) : null}
      <section className={`bs-core${open ? ' is-open' : ''}`} aria-label={world ? 'CORE INCLUDED' : 'CORE PAGES INCLUDED'}>
        <button type="button" className="bs-core__head" aria-expanded={open} aria-controls="bs-core-body" onClick={() => setOpen((v) => !v)}>
          <span className="bs-core__title">{world ? 'CORE INCLUDED' : 'CORE PAGES INCLUDED'}</span>
          {!open ? <span className="bs-core__summary">{world ? 'PLACES SHAPED AT BLUEPRINT REVIEW' : view.summary}</span> : null}
          <ChevronDownIcon size={12} className={open ? 'is-open' : undefined} />
        </button>
        {open ? (
          <div className="bs-core__body" id="bs-core-body">
            <ul className="bs-core__metrics">
              {world ? (
                <li className="bs-core__metric bs-core__metric--wide">
                  <span className="bs-core__metric-value">AT REVIEW</span>
                  <span className="bs-core__metric-label">PLACES</span>
                </li>
              ) : (
                <>
                  <li className="bs-core__metric">
                    <span className="bs-core__metric-value">{pages.total}</span>
                    <span className="bs-core__metric-label">{pages.total === 1 ? 'PAGE' : 'PAGES'}</span>
                  </li>
                  <li className="bs-core__metric">
                    <span className="bs-core__metric-value">{pages.coreGroups}</span>
                    <span className="bs-core__metric-label">{pages.coreGroups === 1 ? 'GROUP' : 'GROUPS'}</span>
                  </li>
                  <li className="bs-core__metric">
                    <span className="bs-core__metric-value">{pages.privatePages}</span>
                    <span className="bs-core__metric-label">PRIVATE</span>
                  </li>
                </>
              )}
              <li className="bs-core__metric bs-core__metric--delivery" title={view.delivery.viewportPlain}>
                <WebsiteIcon size={26} />
                <span className="bs-core__metric-label bs-core__metric-label--ink">{view.delivery.build}</span>
              </li>
              <li className="bs-core__metric bs-core__metric--delivery" title={view.delivery.viewportPlain}>
                <MobileIcon size={26} />
                <span className="bs-core__metric-label bs-core__metric-label--ink">{view.delivery.viewport}</span>
              </li>
            </ul>
            {pages.groups.length ? (
              <>
                <h3 className="bs-core__section">PAGE GROUPS</h3>
                <ul className="bs-core__groups">
                  {pages.groups.map((group) => {
                    const GroupIcon = GROUP_ICONS[group.key];
                    return (
                      <li key={group.key}>
                        <details className="bs-core__group">
                          <summary aria-label={`${group.title}: ${group.pages.length} ${group.pages.length === 1 ? 'PAGE' : 'PAGES'}${group.private ? ', PRIVATE' : ''}`}>
                            <span className="bs-core__group-icon">
                              <GroupIcon size={20} />
                            </span>
                            <span className="bs-core__group-title">{group.title}</span>
                            <span className="bs-core__group-pages">{group.pages.map((p) => p.label).join(', ')}</span>
                            <ChevronSmallRightIcon size={9} />
                          </summary>
                          <ul className="bs-core__group-list">
                            {group.pages.map((page) => (
                              <li key={page.id}>
                                <span className="bs-core__page-name">{page.label}</span>
                                <span className="bs-core__page-purpose">
                                  <BsBody>{page.plain}</BsBody>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
            {view.features.length ? (
              <>
                <h3 className="bs-core__section">INCLUDED WITH THIS SELECTION</h3>
                <ul className="bs-core__features">
                  {view.features.map((f) => (
                    <li
                      key={f.id}
                      className={`bs-core__feature${f.chosen ? '' : ' is-included'}`}
                      title={f.includedWith ?? undefined}
                      aria-label={f.includedWith ? `${f.verb}, ${f.includedWith}` : f.verb}
                    >
                      {f.verb}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
      </section>
      {state.workModules.length ? (
        <aside className="bs-core__footer" aria-live="polite">
          <LayersIcon size={22} />
          <p>
            <BsBody>{view.footer}</BsBody>
          </p>
        </aside>
      ) : (
        <p className="bs-note">CHOOSE AT LEAST ONE CAPABILITY TO CONTINUE.</p>
      )}
    </>
  );
}

/* ─────────────────────────────── 04 PACE ─────────────────────────────── */

const PACE_ICONS: Record<PacePreferenceId, typeof StandardIcon> = {
  STANDARD: StandardIcon,
  EXPEDITED: ExpeditedIcon,
  FLEXIBLE: FlexibleIcon,
};

/** Whether priority production would shorten this scope. Asks the estimator; no figure is shown here. */
export function usePriorityAvailability(selection: BuilderSelection): { available: boolean; reason: string | null } {
  return useMemo(() => {
    try {
      const view = builderEstimateView({ ...selection, delivery: 'PRIORITY' });
      return view.delivery.priority.available ? { available: true, reason: null } : { available: false, reason: view.delivery.priority.reason };
    } catch {
      return { available: false, reason: null };
    }
  }, [selection]);
}

export function PaceControls({ state, selection, update }: RoomProps) {
  const priority = usePriorityAvailability(selection);
  const expeditedBlocked = !priority.available;
  return (
    <>
      <div className="bs-pace" role="radiogroup" aria-label="HOW SHOULD WE BUILD IT">
        {PACE_OPTIONS.map((option) => {
          const IconCmp = PACE_ICONS[option.id];
          const selected = state.pace === option.id;
          const disabled = option.id === 'EXPEDITED' && expeditedBlocked;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={disabled || undefined}
              className={`bs-pace__row${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}
              onClick={() => {
                if (!disabled) update({ pace: option.id });
              }}
              title={option.plain}
            >
              <IconCmp size={26} className="bs-pace__icon" />
              <span className="bs-pace__text">
                <span className="bs-pace__label">{option.label}</span>
                <span className="bs-pace__sub">
                  <BsBody>{disabled ? 'NOT AVAILABLE FOR THIS SCOPE' : option.sub}</BsBody>
                </span>
              </span>
              <span className="bs-check" aria-hidden="true">{selected ? <CheckIcon size={16} /> : null}</span>
            </button>
          );
        })}
      </div>
      {state.pace === 'EXPEDITED' && expeditedBlocked ? (
        <p className="bs-note">
          <BsBody>{(priority.reason ?? 'PRIORITY DOES NOT SHORTEN THIS SCOPE.').toUpperCase()}</BsBody>
        </p>
      ) : null}
      <label className="bs-notes">
        <span className="bs-visually-hidden">{state.placePath === 'CUSTOM' ? 'YOUR CUSTOM DIRECTION (OPTIONAL)' : 'PROJECT NOTES (OPTIONAL)'}</span>
        <textarea
          rows={1}
          maxLength={2000}
          value={state.paceNotes}
          placeholder={state.placePath === 'CUSTOM' ? 'DESCRIBE YOUR CUSTOM DIRECTION (OPTIONAL)' : 'ADD A NOTE FOR SITE 00 (OPTIONAL)'}
          onChange={(event) => update({ paceNotes: event.target.value })}
        />
      </label>
    </>
  );
}

