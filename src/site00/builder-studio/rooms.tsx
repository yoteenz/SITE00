/** Room controls for 01 PLACE · 02 FEEL · 03 WORK · 04 PACE. */
import { useMemo, useState } from 'react';
import { CAPABILITY_BY_ID, EXPERIENCE_BY_ID, builderEstimateView, builderNotices, chosenExperiences, deriveBuildLevel } from '../builder-experience';
import type { BuilderSelection } from '../builder-experience';
import { compose } from './buildObject/composition';
import { BuildThumbnail } from './buildObject/BuildObjectStage';
import {
  AnalyticsIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpeditedIcon,
  FlexibleIcon,
  MobileIcon,
  PlusIcon,
  SeoIcon,
  StandardIcon,
  WebsiteIcon,
} from './icons';
import {
  CORE_INCLUDED,
  FEEL_BY_ID,
  FEEL_OPTIONS,
  PACE_OPTIONS,
  PATH_OPTIONS,
  WORK_MODULES,
  isWorldPath,
  moduleLevelCheck,
  moduleUnavailableReason,
} from './studioModel';
import type { CoreIncludedId, StudioDraft, StudioPace, StudioPath, WorkModuleId } from './studioModel';

type RoomProps = {
  draft: StudioDraft;
  selection: BuilderSelection;
  update: (patch: Partial<StudioDraft> | ((d: StudioDraft) => StudioDraft)) => void;
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

export function choosePath(path: StudioPath): (d: StudioDraft) => StudioDraft {
  // A new path resets the SIMPLE-path decision; a WORLD has no site grammar.
  return (d) => ({ ...d, path, acceptedLevelRaise: false, structure: path === 'WORLD' ? null : d.structure });
}

export function PlaceStageArrows({ draft, update }: RoomProps) {
  const ids = PATH_OPTIONS.map((p) => p.id);
  return (
    <StageArrows
      label="BUILD"
      onPrev={() => update(choosePath(cycle(ids, draft.path, -1)))}
      onNext={() => update(choosePath(cycle(ids, draft.path, 1)))}
    />
  );
}

export function PlaceControls({ draft, update }: RoomProps) {
  return (
    <div className="bs-cards" role="radiogroup" aria-label="WHAT ARE WE CREATING">
      {PATH_OPTIONS.map((option) => {
        const selected = draft.path === option.id;
        const thumb = compose('place', { path: option.id, feel: draft.feel, modules: [], pace: draft.pace });
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`bs-card${selected ? ' is-selected' : ''}`}
            onClick={() => update(choosePath(option.id))}
            title={option.plain}
          >
            <BuildThumbnail composition={thumb} width={176} height={88} alt="" />
            <span className="bs-card__label">{option.label}</span>
            <span className="bs-card__sub">{option.descriptor}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────── 02 FEEL ─────────────────────────────── */

export function FeelStageArrows({ draft, update }: RoomProps) {
  const ids = FEEL_OPTIONS.map((f) => f.id);
  return (
    <StageArrows
      label="DIRECTION"
      onPrev={() => update({ feel: cycle(ids, draft.feel, -1) })}
      onNext={() => update({ feel: cycle(ids, draft.feel, 1) })}
    />
  );
}

export function FeelControls({ draft, update }: RoomProps) {
  const focused = draft.feel ? FEEL_BY_ID[draft.feel] : null;
  return (
    <>
      <div className="bs-feel-caption" aria-live="polite">
        <p className="bs-feel-caption__label">{focused ? focused.label : 'YOUR DIRECTION'}</p>
        <p className="bs-feel-caption__sub">{focused ? focused.descriptor : 'CHOOSE ONE BELOW'}</p>
        {draft.path === 'CUSTOM' && draft.feel ? (
          <p className="bs-feel-caption__note">YOUR STARTING INFLUENCE FOR A CUSTOM DIRECTION</p>
        ) : null}
      </div>
      <div className="bs-strip" role="radiogroup" aria-label="VISUAL DIRECTION">
        {FEEL_OPTIONS.map((option) => {
          const selected = draft.feel === option.id;
          const thumb = compose('feel', { path: draft.path, feel: option.id, modules: [], pace: draft.pace });
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`bs-strip__item${selected ? ' is-selected' : ''}`}
              onClick={() => update({ feel: option.id })}
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

export function useWorkModules(props: RoomProps) {
  const { draft, update } = props;
  const [pending, setPending] = useState<PendingRaise>(null);
  const toggle = (id: WorkModuleId) => {
    if (moduleUnavailableReason(draft, id)) return;
    if (draft.modules.includes(id)) {
      update((d) => ({ ...d, modules: d.modules.filter((m) => m !== id) }));
      setPending(null);
      return;
    }
    const check = moduleLevelCheck(draft, id);
    if (check.raises) {
      setPending({ module: id, reason: check.reason });
      return;
    }
    update((d) => ({ ...d, modules: [...d.modules, id] }));
  };
  const keep = () => {
    if (!pending) return;
    const id = pending.module;
    update((d) => ({ ...d, modules: [...d.modules, id], acceptedLevelRaise: true }));
    setPending(null);
  };
  return { pending, toggle, keep, dismiss: () => setPending(null) };
}

export function WorkStageToggles({ draft, toggle, pending }: RoomProps & { toggle: (id: WorkModuleId) => void; pending: PendingRaise }) {
  return (
    <div className="bs-modules" role="group" aria-label="CAPABILITIES">
      {WORK_MODULES.map((module) => {
        const on = draft.modules.includes(module.id);
        const unavailable = moduleUnavailableReason(draft, module.id);
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
              aria-disabled={unavailable ? true : undefined}
              title={unavailable ?? module.plain}
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

const CORE_ICONS: Record<CoreIncludedId, typeof WebsiteIcon> = {
  WEBSITE: WebsiteIcon,
  MOBILE: MobileIcon,
  SEO: SeoIcon,
  ANALYTICS: AnalyticsIcon,
};

export function WorkControls(props: RoomProps & { pending: PendingRaise; keep: () => void; dismiss: () => void }) {
  const { draft, selection, pending, keep, dismiss } = props;
  const [open, setOpen] = useState(false);
  const world = isWorldPath(draft);
  const { level } = deriveBuildLevel(selection);
  const pages = useMemo(() => (world ? [] : chosenExperiences(selection, level).map((c) => EXPERIENCE_BY_ID[c.id].label)), [selection, level, world]);
  const comesWith = builderNotices(selection).filter((n) => n.kind === 'COMES_WITH');
  const added = draft.modules.filter((id) => !moduleUnavailableReason(draft, id));
  return (
    <>
      {pending ? (
        <div className="bs-decision" role="alertdialog" aria-label="DECISION">
          <p className="bs-decision__text">{pending.reason}</p>
          <div className="bs-decision__actions">
            <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={keep}>
              ADD IT · ADVANCED BUILD
            </button>
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={dismiss}>
              NOT NOW
            </button>
          </div>
        </div>
      ) : null}
      <div className="bs-core">
        <button type="button" className="bs-core__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span>{world ? 'CORE INCLUDED' : 'CORE PAGES INCLUDED'}</span>
          <ChevronDownIcon size={11} className={open ? 'is-open' : undefined} />
        </button>
        <ul className="bs-core__tiles">
          {CORE_INCLUDED.map((item) => {
            const IconCmp = CORE_ICONS[item.id];
            return (
              <li key={item.id} className="bs-core__tile" title={item.plain}>
                <IconCmp size={24} />
                <span>{world ? item.worldLabel : item.label}</span>
              </li>
            );
          })}
        </ul>
        {open ? (
          <div className="bs-core__detail">
            {pages.length ? <p><strong>PAGES</strong> {pages.join(' · ').toUpperCase()}</p> : <p><strong>PLACES</strong> SHAPED WITH YOU AT BLUEPRINT REVIEW</p>}
            <p>
              <strong>ADDED</strong>{' '}
              {added.length ? added.map((id) => WORK_MODULES.find((m) => m.id === id)!.label).join(' · ') : 'NOTHING YET'}
            </p>
          </div>
        ) : null}
      </div>
      {comesWith.length ? (
        <p className="bs-note" aria-live="polite">
          {comesWith.map((n) => `+ ${n.message.split(':')[0].toUpperCase()}`).join('  ·  ')}
        </p>
      ) : null}
      {world ? <p className="bs-note">PAGES AND BLOG ARE NOT PART OF A WORLD BUILD.</p> : null}
    </>
  );
}

/* ─────────────────────────────── 04 PACE ─────────────────────────────── */

const PACE_ICONS: Record<StudioPace, typeof StandardIcon> = {
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

export function PaceControls({ draft, selection, update }: RoomProps) {
  const priority = usePriorityAvailability(selection);
  const expeditedBlocked = !priority.available;
  return (
    <>
      <div className="bs-pace" role="radiogroup" aria-label="HOW SHOULD WE BUILD IT">
        {PACE_OPTIONS.map((option) => {
          const IconCmp = PACE_ICONS[option.id];
          const selected = draft.pace === option.id;
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
                <span className="bs-pace__sub">{disabled ? 'NOT AVAILABLE FOR THIS SCOPE' : option.sub}</span>
              </span>
              <span className="bs-check" aria-hidden="true">{selected ? <CheckIcon size={16} /> : null}</span>
            </button>
          );
        })}
      </div>
      {draft.pace === 'EXPEDITED' && expeditedBlocked ? (
        <p className="bs-note">{(priority.reason ?? 'PRIORITY DOES NOT SHORTEN THIS SCOPE.').toUpperCase()}</p>
      ) : null}
      <label className="bs-notes">
        <span className="bs-visually-hidden">PROJECT NOTES (OPTIONAL)</span>
        <textarea
          rows={1}
          maxLength={2000}
          value={draft.notes}
          placeholder="ADD A NOTE FOR SITE 00 (OPTIONAL)"
          onChange={(event) => update({ notes: event.target.value })}
        />
      </label>
    </>
  );
}

export function capabilityPlain(verb: string): string {
  const match = Object.values(CAPABILITY_BY_ID).find((c) => c.verb === verb);
  return match?.plain ?? '';
}
