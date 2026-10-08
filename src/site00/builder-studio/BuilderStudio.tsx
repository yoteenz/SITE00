/**
 * SITE 00 Builder — Hybrid Spatial Studio.
 *
 * ONE CONTINUOUS ENVIRONMENT. FOUR DISTINCT ROOMS. ONE BLUEPRINT REVEAL.
 * The shell, the stage and the Build Object persist across rooms; each room changes the question, the controls
 * and what the object shows. Rooms are routes (`/bldr/builder/:room`) so device back and forward work.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';
import { compose } from './buildObject/composition';
import { BuildObjectStage } from './buildObject/BuildObjectStage';
import { BlueprintActions, BlueprintPanel, BlueprintStageControls, type BlueprintTab } from './BlueprintRoom';
import { ArrowRightIcon, CloseIcon, MenuIcon } from './icons';
import {
  FeelControls,
  FeelStageArrows,
  PaceControls,
  PlaceControls,
  PlaceStageArrows,
  WorkControls,
  WorkStageToggles,
  useWorkModules,
} from './rooms';
import {
  CONFIG_ROOMS,
  FEEL_BY_ID,
  PATH_OPTIONS,
  STUDIO_ROOMS,
  STUDIO_ROOM_BY_ID,
  WORK_MODULE_BY_ID,
  advanceFurthest,
  canEnterRoom,
  firstOpenRoom,
  roomComplete,
  roomOrder,
} from './studioModel';
import type { StudioDraft, StudioRoomId } from './studioModel';
import { useStudioDraft } from './useStudioDraft';

export function builderRoomPath(room: StudioRoomId): string {
  return `${SITE00_ROUTES.bldrBuilder}/${room}`;
}

function objectDescription(room: StudioRoomId, draft: StudioDraft): string {
  const path = draft.path ? PATH_OPTIONS.find((p) => p.id === draft.path)!.label : 'NO BUILD CHOSEN';
  const feel = draft.feel ? FEEL_BY_ID[draft.feel].label : 'NO DIRECTION CHOSEN';
  const modules = draft.modules.map((id) => WORK_MODULE_BY_ID[id].label).join(', ') || 'CORE FLOORS ONLY';
  switch (room) {
    case 'place':
      return `ARCHITECTURAL MODEL OF A ${path} BUILD: GLASS VOLUMES AND A RED ACRYLIC CORE ON A MARBLE PLINTH.`;
    case 'feel':
      return `MATERIAL STUDY FOR THE ${feel} DIRECTION: STANDING PLATES OF STONE, GLASS AND RED ACRYLIC.`;
    case 'work':
      return `STRUCTURE WITH A FLOOR FOR EACH CAPABILITY. ADDED: ${modules}.`;
    case 'pace':
      return `THE ASSEMBLED STRUCTURE AT ${draft.pace} PACE.`;
    case 'blueprint':
      return `YOUR PROPOSED DIGITAL LOCATION: ${path}, ${feel}, ${modules}, ${draft.pace} PACE.`;
  }
}

function ctaEnabled(room: StudioRoomId, draft: StudioDraft): boolean {
  if (room === 'place') return draft.path !== null;
  if (room === 'feel') return draft.feel !== null;
  return true;
}

export function BuilderStudio({ room: requested }: { room: StudioRoomId | null }) {
  const navigate = useNavigate();
  const { draft, selection, update, saveNow, reset } = useStudioDraft();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<BlueprintTab>('OVERVIEW');
  const [inspecting, setInspecting] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const work = useWorkModules({ draft, selection, update });

  // Resolve the room: an unknown or locked room sends the client to where they can continue.
  const room: StudioRoomId = useMemo(() => {
    const target = requested ?? draft.furthestRoom;
    if (canEnterRoom(draft, target)) return target;
    return firstOpenRoom(draft) ?? 'place';
  }, [requested, draft]);

  useEffect(() => {
    if (requested !== room) navigate(builderRoomPath(room), { replace: true });
  }, [requested, room, navigate]);

  useEffect(() => {
    update((d) => advanceFurthest(d, room));
    setMenuOpen(false);
    setInspecting(false);
    window.scrollTo({ top: 0 });
  }, [room, update]);

  const goToRoom = useCallback(
    (next: StudioRoomId) => {
      if (!canEnterRoom(draft, next)) return;
      navigate(builderRoomPath(next));
    },
    [draft, navigate],
  );

  const spec = useMemo(
    () => ({ path: draft.path, feel: draft.feel, modules: draft.modules, pace: draft.pace }),
    [draft.path, draft.feel, draft.modules, draft.pace],
  );
  const composition = useMemo(() => compose(room, spec), [room, spec]);

  const meta = STUDIO_ROOM_BY_ID[room];
  const configIndex = CONFIG_ROOMS.indexOf(room);
  const nextRoom = STUDIO_ROOMS[roomOrder(room) + 1]?.id ?? null;
  const roomProps = { draft, selection, update };

  return (
    <div className={`bs-root bs-room--${room}`} data-room={room}>
      <header className="bs-header">
        <a className="bs-wordmark" href={SITE00_ROUTES.bldr} aria-label="SITE 00 BUILDER — EXIT TO BLDR">
          <span className="bs-wordmark__site">SITE 00</span>
          <span className="bs-wordmark__product">BUILDER</span>
        </a>
        <button type="button" className="bs-menu-btn" aria-label="OPEN BUILDER MENU" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <MenuIcon size={34} />
        </button>
      </header>

      <section className="bs-intro" aria-labelledby="bs-headline">
        <p className="bs-roomid">
          <span className="bs-roomid__n">{meta.index}</span>
          <span className="bs-roomid__rule" aria-hidden="true" />
          <span className="bs-roomid__label">{meta.label}</span>
        </p>
        <h1 id="bs-headline" className="bs-headline">
          {meta.headline.map((line, i) => (
            <span key={line} className="bs-headline__line">
              {line}
              {i === meta.headline.length - 1 ? <span className="bs-dot">.</span> : null}
            </span>
          ))}
        </h1>
        <p className="bs-lede">{meta.lede}</p>
      </section>

      <div className="bs-stage-wrap" ref={stageWrapRef}>
        <BuildObjectStage
          composition={composition}
          description={objectDescription(room, draft)}
          interactive={room === 'blueprint' && inspecting}
          resetToken={resetToken}
          className={`bs-stage bs-stage--${room}`}
        >
          {room === 'place' ? <PlaceStageArrows {...roomProps} /> : null}
          {room === 'feel' ? <FeelStageArrows {...roomProps} /> : null}
          {room === 'work' ? <WorkStageToggles {...roomProps} toggle={work.toggle} pending={work.pending} /> : null}
          {room === 'blueprint' ? (
            <BlueprintStageControls
              inspecting={inspecting}
              setInspecting={setInspecting}
              onRecenter={() => setResetToken((n) => n + 1)}
              stageRef={stageWrapRef}
              tab={tab}
            />
          ) : null}
        </BuildObjectStage>
      </div>

      <section className="bs-controls" aria-label={`${meta.label} CHOICES`}>
        {room === 'place' ? <PlaceControls {...roomProps} /> : null}
        {room === 'feel' ? <FeelControls {...roomProps} /> : null}
        {room === 'work' ? <WorkControls {...roomProps} pending={work.pending} keep={work.keep} dismiss={work.dismiss} /> : null}
        {room === 'pace' ? <PaceControls {...roomProps} /> : null}
        {room === 'blueprint' ? (
          <BlueprintPanel {...roomProps} goToRoom={goToRoom} openMenu={() => setMenuOpen(true)} saveNow={saveNow} tab={tab} setTab={setTab} />
        ) : null}
      </section>

      <footer className="bs-footer">
        {room === 'blueprint' ? (
          <BlueprintActions {...roomProps} goToRoom={goToRoom} openMenu={() => setMenuOpen(true)} saveNow={saveNow} tab={tab} setTab={setTab} />
        ) : (
          <>
            <button
              type="button"
              className="bs-cta"
              disabled={!ctaEnabled(room, draft)}
              onClick={() => nextRoom && goToRoom(nextRoom)}
            >
              {meta.cta}
              <ArrowRightIcon size={26} />
            </button>
            <nav className="bs-rail" aria-label="BUILDER PROGRESS">
              <span className="bs-rail__tick" aria-hidden="true" />
              <span className="bs-rail__count">
                <strong>{meta.index}</strong> / 04
              </span>
              <span className="bs-rail__label">{meta.label}</span>
              <span className="bs-rail__track">
                {CONFIG_ROOMS.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    className={`bs-rail__seg${i <= configIndex ? ' is-filled' : ''}`}
                    aria-label={`${STUDIO_ROOM_BY_ID[id].index} ${STUDIO_ROOM_BY_ID[id].label}${roomComplete(draft, id) ? ' — DONE' : ''}`}
                    aria-current={id === room ? 'step' : undefined}
                    disabled={!canEnterRoom(draft, id)}
                    onClick={() => goToRoom(id)}
                  />
                ))}
              </span>
            </nav>
          </>
        )}
      </footer>

      {menuOpen ? (
        <StudioMenu
          draft={draft}
          room={room}
          onClose={() => setMenuOpen(false)}
          goToRoom={goToRoom}
          saveNow={saveNow}
          reset={() => {
            reset();
            setMenuOpen(false);
            navigate(builderRoomPath('place'));
          }}
        />
      ) : null}
    </div>
  );
}

function StudioMenu({
  draft,
  room,
  onClose,
  goToRoom,
  saveNow,
  reset,
}: {
  draft: StudioDraft;
  room: StudioRoomId;
  onClose: () => void;
  goToRoom: (room: StudioRoomId) => void;
  saveNow: () => boolean;
  reset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="bs-menu" role="dialog" aria-modal="true" aria-label="BUILDER MENU">
      <div className="bs-menu__head">
        <span className="bs-wordmark">
          <span className="bs-wordmark__site">SITE 00</span>
          <span className="bs-wordmark__product">BUILDER</span>
        </span>
        <button ref={closeRef} type="button" className="bs-menu-btn" onClick={onClose} aria-label="CLOSE MENU">
          <CloseIcon size={24} />
        </button>
      </div>
      <ol className="bs-menu__rooms">
        {STUDIO_ROOMS.map((item) => {
          const enterable = canEnterRoom(draft, item.id);
          const status = item.id === room ? 'YOU ARE HERE' : roomComplete(draft, item.id) ? 'DONE' : enterable ? 'OPEN' : 'LOCKED';
          return (
            <li key={item.id}>
              <button type="button" disabled={!enterable} aria-current={item.id === room ? 'page' : undefined} onClick={() => goToRoom(item.id)}>
                <span className="bs-menu__n">{item.index}</span>
                <span className="bs-menu__label">{item.label}</span>
                <span className="bs-menu__status">{status}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="bs-menu__actions">
        <button
          type="button"
          className="bs-btn bs-btn--outline-dark"
          onClick={() => setSaved(saveNow() ? 'SAVED ON THIS DEVICE.' : 'THIS BROWSER BLOCKED SAVING.')}
        >
          SAVE FOR LATER
        </button>
        {confirmReset ? (
          <span className="bs-menu__confirm">
            CLEAR EVERY CHOICE?
            <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={reset}>
              START OVER
            </button>
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={() => setConfirmReset(false)}>
              KEEP
            </button>
          </span>
        ) : (
          <button type="button" className="bs-btn bs-btn--ghost" onClick={() => setConfirmReset(true)}>
            START OVER
          </button>
        )}
        <a className="bs-btn bs-btn--ghost" href={SITE00_ROUTES.bldr}>
          EXIT BUILDER
        </a>
      </div>
      <p className="bs-status" aria-live="polite">
        {saved ?? (draft.savedAt ? `LAST SAVED ${new Date(draft.savedAt).toLocaleString()}` : 'YOUR CHOICES SAVE ON THIS DEVICE AS YOU GO.')}
      </p>
    </div>
  );
}
