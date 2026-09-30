/**
 * CHARACTER FABRICATION — one live machine, eight stations of the same CharacterAuthority object.
 *
 * Visual authority: the 16 approved authority screens (432×768 canvas). Each view below is composed to its authority's
 * parent geometry; the workspace root is zoomed so the 432px canvas fills the device width (true portrait fidelity).
 * Functional authority: the FabricationState reducer — nothing here changes state semantics.
 */
import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { STATION_ORDER, type StationId } from '../../../../shared/site00-character-fabrication/index.js';
import { ProductionBottomNav } from '../productionHub/nav';
import { useProductionRequests } from '../../state/productionRequestStore';
import { deviceLocalFabricationRepository } from '../../state/characterFabricationRepository';
import { FabricationProvider, useFabrication } from './FabricationContext';
import { FabricationHeader, FabricationStageRail, NoticeToast, StationStatusBar } from './primitives';
import { ActorProfile, IdentityView } from './stationIdentity';
import { BodyView, ContinuityInspector } from './stationBody';
import { LookCompare, LookView } from './stationLook';
import { AppearanceCompare, AppearanceView } from './stationAppearance';
import { CharacterView } from './stationCharacter';
import { MotionRequestPage, PerformanceView } from './stationPerformance';
import { SimulationStation } from './stationSimulation';
import { AuthorityView } from './stationAuthority';
import '../../styles/site00-production-hub.css';
import '../../styles/site00-character-fabrication.css';
import '../../styles/site00-character-fabrication-authority.css';

export const CANVAS_W = 432;

/** Zoom that maps the 432px authority canvas onto the device width (capped on desktop). */
function useCanvasZoom(): number {
  const read = () => (typeof window === 'undefined' ? 1 : Math.min(window.innerWidth / CANVAS_W, 1.6));
  const [z, setZ] = useState(read);
  useLayoutEffect(() => {
    const on = () => setZ(read());
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return z;
}

function Body() {
  const { state } = useFabrication();
  const { activeStation: st, surface } = state;

  if (surface === 'ACTOR_PROFILE') return <ActorProfile />;
  if (surface === 'BODY_INSPECTOR') return <ContinuityInspector />;
  if (surface === 'LOOK_COMPARE') return <LookCompare />;
  if (surface === 'APPEARANCE_COMPARE') return <AppearanceCompare />;
  if (surface === 'MOTION_REQUEST') return <MotionRequestPage />;

  switch (st) {
    case 'identity':
      return <IdentityView />;
    case 'body':
      return <BodyView />;
    case 'look':
      return <LookView />;
    case 'appearance':
      return <AppearanceView />;
    case 'character':
      return <CharacterView />;
    case 'performance':
      return <PerformanceView />;
    case 'simulation':
      return <SimulationStation />;
    case 'authority':
      return <AuthorityView />;
  }
}

/** Authority frames that show no 01–08 rail (5419, 5422–5424, 5426, 5427) keep it reachable just below the composition. */
function needsTailRail(st: StationId, surface: string, run: string | null): boolean {
  if (surface === 'LOOK_COMPARE') return true;
  if (surface !== 'STATION' && surface !== 'BEHAVIOR_LIBRARY') return false;
  if (st === 'character' || st === 'performance') return true;
  return st === 'simulation' && run !== null && run !== 'IDLE';
}

function Shell({ projectSlug }: { projectSlug: string }) {
  const { dispatch, persistence, state } = useFabrication();
  const requests = useProductionRequests();
  const inbox = requests.filter((r) => r.status === 'QUEUED').length;
  const zoom = useCanvasZoom();
  useEffect(() => {
    document.body.classList.add('cf-open');
    return () => document.body.classList.remove('cf-open');
  }, []);
  const ui = (
    <div className="ph cf" data-testid="character-fabrication" data-persistence={persistence} style={{ zoom }}>
      <div className="cf-frame">
        <FabricationHeader
          onReset={() => {
            deviceLocalFabricationRepository.clear(projectSlug, '002');
            dispatch({ type: 'RESET' });
          }}
        />
        <main className="cf-scroll" data-testid="cf-scroll" data-view={`${state.activeStation}:${state.surface}`}>
          <div className="cf-col">
            <Body />
            {needsTailRail(state.activeStation, state.surface, state.run?.status ?? null) ? (
              <div className="cf-tailrail" data-testid="cf-tail-rail"><FabricationStageRail /></div>
            ) : null}
            <StationStatusBar station={state.activeStation} />
            <p className="cf-persist" data-testid="cf-persistence-note">
              PERSISTENCE: {persistence === 'DEVICE_LOCAL' ? 'DEVICE-LOCAL ONLY — FOUNDER GATES ARE NOT YET CANONICAL BACKEND AUTHORITY' : 'BACKEND'}
            </p>
          </div>
        </main>
        <NoticeToast />
        <ProductionBottomNav active="expression" projectId={projectSlug} inboxCount={inbox} />
      </div>
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
