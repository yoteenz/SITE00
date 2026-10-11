/**
 * SITE 00 Builder — Hybrid Spatial Studio.
 *
 * ONE CONTINUOUS ENVIRONMENT. FOUR DISTINCT ROOMS. ONE BLUEPRINT REVEAL.
 * The shell, the stage and the Build Object persist across rooms; each room changes the question, the controls
 * and what the object shows. Rooms are routes (`/bldr/studio/:room`) so device back and forward work. The
 * configuration itself lives in Composer's server-backed session (`useBuilderSpatialIntakeSession`).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';
import { compose } from './buildObject/composition';
import { BuildObjectStage, usePrefersReducedMotion } from './buildObject/BuildObjectStage';
import { blueprintAnatomy, inspectionFor } from './buildObject/anatomy';
import {
  BlueprintActions,
  BlueprintPanel,
  BlueprintStageAnnotations,
  BlueprintStageCaption,
  BlueprintStageControls,
  createAnchorBus,
  sectionAnchors,
  sectionMarkers,
  type BlueprintInspectState,
  type BlueprintTab,
} from './BlueprintRoom';
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
  PACE_OPTIONS,
  PATH_OPTIONS,
  STUDIO_ROOMS,
  STUDIO_ROOM_BY_ID,
  WORK_MODULE_BY_ID,
  buildSpec,
  canEnterStudioRoom,
  furthestOpenRoom,
  roomAnswered,
  roomCanContinue,
  roomOrder,
  spatialRoom,
  studioRoomFromSpatial,
} from './studioModel';
import type { SpatialBuilderState, StudioRoomId } from './studioModel';
import { useStudioSession, type SaveIndicator, type StudioSession } from './useStudioSession';

/** How long the Blueprint timeline holds each stage while it plays (visual pacing only; never a duration). */
const TIMELINE_STAGE_MS = 1900;

export function studioRoomPath(room: StudioRoomId, search = ''): string {
  return `${SITE00_ROUTES.bldrSpatialStudio}/${room}${search}`;
}

function objectDescription(room: StudioRoomId, state: SpatialBuilderState): string {
  const path = state.placePath ? PATH_OPTIONS.find((p) => p.id === state.placePath)!.label : 'NO BUILD CHOSEN';
  const feel = state.feelVibe ? FEEL_BY_ID[state.feelVibe].label : 'NO DIRECTION CHOSEN';
  const modules = state.workModules.map((id) => WORK_MODULE_BY_ID[id].label).join(', ') || 'CORE FLOORS ONLY';
  const pace = state.pace ? PACE_OPTIONS.find((p) => p.id === state.pace)!.label : 'AN UNCHOSEN';
  switch (room) {
    case 'place':
      return `ARCHITECTURAL MODEL OF A ${path} BUILD: GLASS VOLUMES AND A RED ACRYLIC CORE ON A MARBLE PLINTH.`;
    case 'feel':
      return `MATERIAL STUDY FOR THE ${feel} DIRECTION: STANDING PLATES OF STONE, GLASS AND RED ACRYLIC.`;
    case 'work':
      return `STRUCTURE WITH A FLOOR FOR EACH CAPABILITY. ADDED: ${modules}.`;
    case 'pace':
      return `THE ASSEMBLED STRUCTURE AT ${pace} PACE.`;
    case 'blueprint':
      return `YOUR PROPOSED DIGITAL LOCATION: ${path}, ${feel}, ${modules}, ${pace} PACE.`;
  }
}

export function SaveStatusChip({ indicator, onRetry }: { indicator: SaveIndicator; onRetry?: () => void }) {
  if (!indicator.label) return null;
  return (
    <p className={`bs-save bs-save--${indicator.tone}`} role="status" title={indicator.detail ?? undefined} data-sync={indicator.status}>
      <span className="bs-save__dot" aria-hidden="true" />
      <span className="bs-save__label">{indicator.label}</span>
      {indicator.retry && onRetry ? (
        <button type="button" className="bs-save__retry" onClick={onRetry}>
          RETRY
        </button>
      ) : null}
    </p>
  );
}

export function BuilderStudio({ room: requested, sample = null }: { room: StudioRoomId | null; sample?: SpatialBuilderState | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useStudioSession(sample);
  const { state, locked, submitted, syncStatus, update } = session;
  const hydrated = syncStatus !== 'restoring';
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTabState] = useState<BlueprintTab>('OVERVIEW');
  // Blueprint inspection: the selection inside the open section, and the timeline's stage. Changing section clears
  // the selection (a new section starts from its own default view); TIMELINE starts its assembly from stage 01.
  const [pick, setPick] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const setTab = useCallback(
    (next: BlueprintTab) => {
      setTabState(next);
      setPick(null);
      // Reduced motion: the timeline opens complete and is stepped by hand; otherwise it plays once from stage 01.
      setStage(next === 'TIMELINE' && !reducedMotion ? 0 : null);
      setPlaying(next === 'TIMELINE' && !reducedMotion);
    },
    [reducedMotion],
  );
  const [inspecting, setInspecting] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const roomProps = { state, selection: session.selection, update };
  const work = useWorkModules(roomProps);

  // Resolve the room. A submitted, locked Blueprint opens on the Blueprint; a room the contract does not let the
  // client enter yet sends them to the furthest one they can.
  const room: StudioRoomId = useMemo(() => {
    if (locked && submitted) return 'blueprint';
    const target = requested ?? studioRoomFromSpatial(state.room);
    if (canEnterStudioRoom(state, target)) return target;
    return furthestOpenRoom(state);
  }, [requested, state, locked, submitted]);

  useEffect(() => {
    if (!hydrated) return;
    if (requested !== room) navigate(studioRoomPath(room, location.search), { replace: true });
  }, [hydrated, requested, room, navigate, location.search]);

  // Keep the session's room in step with the route (the contract only accepts a submission from BLUEPRINT).
  useEffect(() => {
    if (!hydrated || locked) return;
    if (spatialRoom(room) !== state.room) session.goRoom(spatialRoom(room));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goRoom identity changes with state
  }, [hydrated, locked, room, state.room]);

  useEffect(() => {
    setMenuOpen(false);
    setInspecting(false);
    setPick(null);
    setPlaying(false);
    window.scrollTo({ top: 0 });
  }, [room]);

  const goToRoom = useCallback(
    (next: StudioRoomId) => {
      if (locked && next !== 'blueprint') return;
      if (!canEnterStudioRoom(state, next)) return;
      navigate(studioRoomPath(next, location.search));
    },
    [locked, state, navigate, location.search],
  );

  const shown = session.view.state;
  const spec = useMemo(() => buildSpec(shown), [shown]);
  // On the Blueprint the object follows the open section and its selection (see buildObject/anatomy.ts).
  const anatomy = useMemo(() => (room === 'blueprint' ? blueprintAnatomy(spec, session.view.snapshot) : null), [room, spec, session.view.snapshot]);
  const inspect = useMemo(() => (anatomy ? inspectionFor(anatomy, tab, pick, stage) : undefined), [anatomy, tab, pick, stage]);
  const composition = useMemo(
    () => compose(room, spec, { focus: room === 'blueprint' ? tab : undefined, inspect }),
    [room, spec, tab, inspect],
  );
  const markers = useMemo(() => (room === 'blueprint' ? sectionMarkers(tab, anatomy, stage) : []), [room, tab, anatomy, stage]);
  const anchors = useMemo(() => sectionAnchors(markers), [markers]);
  const [anchorBus] = useState(createAnchorBus);
  const stages = anatomy?.stages.length ?? 0;
  // The timeline assembles one stage at a time while playing, then rests on the complete place.
  useEffect(() => {
    if (!playing || stage === null) return;
    const id = window.setTimeout(() => {
      if (stage + 1 >= stages) {
        setStage(null);
        setPlaying(false);
      } else {
        setStage(stage + 1);
      }
    }, TIMELINE_STAGE_MS);
    return () => window.clearTimeout(id);
  }, [playing, stage, stages]);
  // The sticky Blueprint stage gets its own ground once it is pinned at the top (and not before: it runs under the lede).
  useEffect(() => {
    const wrap = stageWrapRef.current;
    if (room !== 'blueprint' || tab === 'OVERVIEW' || !wrap) return;
    const root = document.documentElement;
    const onScroll = () => {
      wrap.classList.toggle('is-stuck', wrap.getBoundingClientRect().top <= 0.5 && window.scrollY > 0);
      // Whatever scrolls into view (a focused or chosen item) lands below the pinned stage, never under it.
      root.style.scrollPaddingTop = getComputedStyle(wrap).position === 'sticky' ? `${wrap.offsetHeight + 12}px` : '';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      wrap.classList.remove('is-stuck');
      root.style.scrollPaddingTop = '';
    };
  }, [room, tab]);
  const inspectState: BlueprintInspectState = useMemo(() => ({ anatomy, pick, setPick, stage, setStage, playing, setPlaying }), [anatomy, pick, stage, playing]);

  const meta = STUDIO_ROOM_BY_ID[room];
  const configIndex = CONFIG_ROOMS.indexOf(room);
  const nextRoom = STUDIO_ROOMS[roomOrder(room) + 1]?.id ?? null;
  const retry = () => void session.retrySave();

  return (
    <div
      className={`bs-root bs-room--${room}${locked ? ' is-locked' : ''}`}
      data-room={room}
      data-sync={session.indicator.status}
      data-stage={session.review.stage}
      data-inspect={room === 'blueprint' ? tab : undefined}
    >
      <header className="bs-header">
        <a className="bs-wordmark" href={SITE00_ROUTES.bldr} aria-label="SITE 00 BUILDER — EXIT TO BLDR">
          <span className="bs-wordmark__site">SITE 00</span>
          <span className="bs-wordmark__product">BUILDER</span>
        </a>
        <SaveStatusChip indicator={session.indicator} onRetry={retry} />
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
          description={objectDescription(room, shown)}
          interactive={room === 'blueprint' && inspecting}
          resetToken={resetToken}
          anchors={anchors}
          onAnchors={anchorBus.emit}
          className={`bs-stage bs-stage--${room}`}
        >
          {room === 'place' ? <PlaceStageArrows {...roomProps} /> : null}
          {room === 'feel' ? <FeelStageArrows {...roomProps} /> : null}
          {room === 'work' ? <WorkStageToggles {...roomProps} toggle={work.toggle} pending={work.pending} /> : null}
          {room === 'blueprint' ? <BlueprintStageAnnotations tab={tab} inspect={inspectState} bus={anchorBus} anchors={markers} /> : null}
          {room === 'blueprint' ? <BlueprintStageCaption tab={tab} inspect={inspectState} /> : null}
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
          <BlueprintPanel session={session} goToRoom={goToRoom} openMenu={() => setMenuOpen(true)} tab={tab} setTab={setTab} inspect={inspectState} />
        ) : null}
      </section>

      <footer className="bs-footer">
        {room === 'blueprint' ? (
          <BlueprintActions session={session} goToRoom={goToRoom} openMenu={() => setMenuOpen(true)} tab={tab} setTab={setTab} />
        ) : (
          <>
            <button type="button" className="bs-cta" disabled={!roomCanContinue(state, room)} onClick={() => nextRoom && goToRoom(nextRoom)}>
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
                    aria-label={`${STUDIO_ROOM_BY_ID[id].index} ${STUDIO_ROOM_BY_ID[id].label}${roomAnswered(state, id) ? ' — ANSWERED' : ''}`}
                    aria-current={id === room ? 'step' : undefined}
                    disabled={!canEnterStudioRoom(state, id)}
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
          session={session}
          room={room}
          onClose={() => setMenuOpen(false)}
          goToRoom={goToRoom}
          startOver={() => {
            setMenuOpen(false);
            navigate(studioRoomPath('place'));
            session.resetSession();
          }}
        />
      ) : null}
    </div>
  );
}

function StudioMenu({
  session,
  room,
  onClose,
  goToRoom,
  startOver,
}: {
  session: StudioSession;
  room: StudioRoomId;
  onClose: () => void;
  goToRoom: (room: StudioRoomId) => void;
  startOver: () => void;
}) {
  const { state, locked } = session;
  const [confirmReset, setConfirmReset] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const save = async () => {
    setSaveNote('SAVING…');
    const ok = await session.retrySave();
    setSaveNote(ok ? 'SAVED WITH SITE 00.' : 'SITE 00 DID NOT CONFIRM THE SAVE. YOUR CHOICES ARE ON THIS DEVICE ONLY.');
  };
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
          const enterable = (!locked || item.id === 'blueprint') && canEnterStudioRoom(state, item.id);
          const status =
            item.id === room ? 'YOU ARE HERE' : locked && item.id !== 'blueprint' ? 'LOCKED FOR REVIEW' : roomAnswered(state, item.id) ? 'ANSWERED' : enterable ? 'OPEN' : 'LOCKED';
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
        {!locked ? (
          <button type="button" className="bs-btn bs-btn--outline-dark" onClick={() => void save()}>
            SAVE FOR LATER
          </button>
        ) : null}
        {confirmReset ? (
          <span className="bs-menu__confirm">
            {session.submitted ? 'START A NEW BLUEPRINT? THE SUBMITTED ONE STAYS WITH SITE 00.' : 'CLEAR EVERY CHOICE?'}
            <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={startOver}>
              START OVER
            </button>
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={() => setConfirmReset(false)}>
              KEEP
            </button>
          </span>
        ) : (
          <button type="button" className="bs-btn bs-btn--ghost" onClick={() => setConfirmReset(true)}>
            {session.submitted ? 'START A NEW BLUEPRINT' : 'START OVER'}
          </button>
        )}
        <a className="bs-btn bs-btn--ghost" href={SITE00_ROUTES.bldr}>
          EXIT BUILDER
        </a>
      </div>
      <SaveStatusChip indicator={session.indicator} />
      <p className="bs-status" aria-live="polite">
        {saveNote ?? session.indicator.detail ?? (session.serverIntake ? `${session.serverIntake.publicReference} · SAVES AS YOU GO.` : '')}
      </p>
    </div>
  );
}
