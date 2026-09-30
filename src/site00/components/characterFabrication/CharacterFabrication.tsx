/**
 * CHARACTER FABRICATION — one live machine, eight stations of the same CharacterAuthority object.
 * Portal-rendered fixed layer (own header + Production bottom nav; no iPhone/browser chrome, no public-site nav).
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { STATION_ORDER, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { ProductionBottomNav } from '../productionHub/nav';
import { useProductionRequests } from '../../state/productionRequestStore';
import { deviceLocalFabricationRepository } from '../../state/characterFabricationRepository';
import { FabricationProvider, useFabrication } from './FabricationContext';
import { ActorAuthorityCard, CharacterAuthorityCard, FabricationHeader, FabricationMachine, FabricationStageRail, StationStatusBar } from './primitives';
import { ActorCatalogue, ActorProfile } from './stationIdentity';
import { BodyStation, ContinuityInspector } from './stationBody';
import { LookCompare, WardrobeLibrary } from './stationLook';
import { AppearanceCompare, AppearanceStation } from './stationAppearance';
import { BehaviorEditor, BehaviorLibrary } from './stationCharacter';
import { MotionRequestPage, PerformanceStation } from './stationPerformance';
import { SimulationStation } from './stationSimulation';
import { AuthorityReview } from './stationAuthority';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-character-fabrication.css';

function Body() {
  const { state, dispatch, actor, blockers } = useFabrication();
  const { activeStation: st, surface } = state;
  const running = st === 'simulation' && !!state.run && state.run.status !== 'IDLE';

  if (surface === 'ACTOR_PROFILE') return <ActorProfile />;
  if (surface === 'BODY_INSPECTOR') return <ContinuityInspector />;
  if (surface === 'LOOK_COMPARE') return <LookCompare />;
  if (surface === 'APPEARANCE_COMPARE')
    return (
      <>
        <FabricationStageRail />
        <AppearanceCompare />
      </>
    );
  if (surface === 'MOTION_REQUEST')
    return (
      <>
        <div className="cf-strip2"><ActorAuthorityCard size="mini" /><CharacterAuthorityCard size="mini" /></div>
        <FabricationStageRail />
        <MotionRequestPage />
      </>
    );

  const heroFull = st === 'identity' || st === 'look' || st === 'authority' || (st === 'simulation' && !running);
  const showMachine = st === 'identity' || st === 'body' || st === 'look' || st === 'character' || st === 'authority' || (st === 'simulation' && !running);

  return (
    <>
      {showMachine ?
        <FabricationMachine tall={heroFull}>
          <div className="cf-machine__cards">
            <ActorAuthorityCard size={heroFull ? 'full' : 'mini'} />
            <CharacterAuthorityCard size={heroFull ? 'full' : 'mini'} />
          </div>
        </FabricationMachine>
      : null}
      {!showMachine && st === 'appearance' ?
        <div className="cf-hero" data-testid="cf-appearance-hero"><ActorAuthorityCard size="mini" /><CharacterAuthorityCard size="mini" /></div>
      : null}
      {!showMachine && st === 'performance' ? <div className="cf-strip2"><ActorAuthorityCard size="mini" /><CharacterAuthorityCard size="mini" /></div> : null}
      <FabricationStageRail />
      <StationStatusBar station={st} />
      {st === 'identity' ?
        state.actorCatalogueOpen ? <ActorCatalogue />
        : (
          <section className="cf-panel cf-confirmed" data-testid="cf-identity-confirmed">
            <h3>ACTOR {actor.catalogueNumber} CONFIRMED</h3>
            <p>IDENTITY AUTHORITY {state.authority.identity === 'LOCKED' ? 'LOCKED' : 'PENDING'} · ACTOR ≠ CHARACTER: {actor.catalogueNumber} IS THE REUSABLE ACTOR, SUBJECT WOMAN IS THE ENTRY 002 CHARACTER.</p>
            <div className="cf-actions">
              <button type="button" className="cf-btn cf-btn--line cf-btn--lg" data-testid="cf-open-catalogue" onClick={() => dispatch({ type: 'CATALOGUE_OPEN', open: true })}>OPEN ACTOR CATALOGUE</button>
              <button type="button" className="cf-btn cf-btn--red cf-btn--lg" data-testid="cf-continue-body" onClick={() => dispatch({ type: 'GOTO_STATION', station: 'body' })} disabled={blockers('body').length > 0}>CONTINUE TO BODY</button>
            </div>
          </section>
        )
      : null}
      {st === 'body' ? <BodyStation /> : null}
      {st === 'look' ? <WardrobeLibrary /> : null}
      {st === 'appearance' ? <AppearanceStation /> : null}
      {st === 'character' ? (
        <>
          <BehaviorEditor />
          {surface === 'BEHAVIOR_LIBRARY' ? <BehaviorLibrary /> : null}
        </>
      ) : null}
      {st === 'performance' ? <PerformanceStation /> : null}
      {st === 'simulation' ? <SimulationStation /> : null}
      {st === 'authority' ? <AuthorityReview /> : null}
    </>
  );
}

function Shell({ projectSlug }: { projectSlug: string }) {
  const { dispatch, persistence } = useFabrication();
  const requests = useProductionRequests();
  const inbox = requests.filter((r) => r.status === 'QUEUED').length;
  useEffect(() => {
    document.body.classList.add('cf-open');
    return () => document.body.classList.remove('cf-open');
  }, []);
  const ui = (
    <div className="ph cf" data-testid="character-fabrication" data-persistence={persistence}>
      <FabricationHeader
        onReset={() => {
          deviceLocalFabricationRepository.clear(projectSlug, '002');
          dispatch({ type: 'RESET' });
        }}
      />
      <main className="cf-scroll" data-testid="cf-scroll">
        <div className="cf-col">
          <Body />
          <p className="cf-persist" data-testid="cf-persistence-note">
            PERSISTENCE: {persistence === 'DEVICE_LOCAL' ? 'DEVICE-LOCAL ONLY — FOUNDER GATES ARE NOT YET CANONICAL BACKEND AUTHORITY' : 'BACKEND'}
          </p>
        </div>
      </main>
      <ProductionBottomNav active="expression" projectId={projectSlug} inboxCount={inbox} />
    </div>
  );
  return createPortal(ui, document.body);
}

export function CharacterFabrication({ projectSlug, entryId }: { projectSlug: string; entryId: string }) {
  const [params] = useSearchParams();
  const s = params.get('station') as StationId | null;
  const initial = s && (STATION_ORDER as readonly string[]).includes(s) ? s : null;
  return (
    <FabricationProvider projectSlug={projectSlug} entryId={entryId} initialStation={initial}>
      <Shell projectSlug={projectSlug} />
    </FabricationProvider>
  );
}
