/**
 * Owns the Character Fabrication state machine for the workspace: reducer + repository persistence +
 * outbox → Production activity/attention, simulation clock and runtime-canonical image URLs.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import {
  buildFabricationCharacter,
  characterAssetUrl,
  fabricationReducer,
  findFabricationActor,
  initialFabricationState,
  listFabricationActors,
  pendingFounderDecisions,
  stationBlockers,
  stationStatus,
  stepsRemaining,
  type ActorRecord,
  type CharacterRecord,
  type FabricationAction,
  type FabricationState,
  type StationId,
} from '../../../../shared/site00-character-fabrication/index.js';
import { deviceLocalFabricationRepository } from '../../state/characterFabricationRepository';
import { recordProductionActivity } from '../../state/productionActivityStore';
import { submitProductionRequest } from '../../state/productionRequestStore';
import { useExpressionEngineEntry002 } from '../founderWorkspace/expressionEngine/useExpressionEngineEntry002';

export type FabricationApi = {
  state: FabricationState;
  dispatch: (a: FabricationAction) => void;
  now: () => string;
  actor: ActorRecord;
  actors: ActorRecord[];
  character: CharacterRecord;
  url: (slotId: string | null) => string | null;
  status: (s: StationId) => ReturnType<typeof stationStatus>;
  blockers: (s: StationId) => ReturnType<typeof stationBlockers>;
  steps: number;
  pending: ReturnType<typeof pendingFounderDecisions>;
  persistence: 'DEVICE_LOCAL' | 'BACKEND';
};

const Ctx = createContext<FabricationApi | null>(null);
export const useFabrication = (): FabricationApi => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFabrication outside provider');
  return v;
};

const ACTOR_FALLBACK = listFabricationActors()[0]!;

export function FabricationProvider({ projectSlug, entryId, initialStation, children }: { projectSlug: string; entryId: string; initialStation?: StationId | null; children: ReactNode }) {
  const repo = deviceLocalFabricationRepository;
  const [state, rawDispatch] = useReducer(fabricationReducer, undefined, () => {
    const loaded = typeof window === 'undefined' ? initialFabricationState() : repo.load(projectSlug, entryId);
    return initialStation ? { ...loaded, activeStation: initialStation, surface: 'STATION' as const } : loaded;
  });
  const engine = useExpressionEngineEntry002();

  const dispatch = useCallback((a: FabricationAction) => rawDispatch(a), []);
  const now = useCallback(() => new Date().toISOString(), []);

  // persist through the repository (without transient fields)
  useEffect(() => {
    repo.save(state);
  }, [repo, state]);

  // drain side effects into the existing Production attention / activity infrastructure
  const draining = useRef(0);
  useEffect(() => {
    if (!state.outbox.length) return;
    const batch = state.outbox;
    if (draining.current === batch.length) return;
    draining.current = batch.length;
    for (const e of batch) {
      if (e.kind === 'ACTIVITY') recordProductionActivity({ category: e.category, title: e.title, detail: e.detail, actor: 'FOUNDER', projectId: projectSlug });
      else submitProductionRequest({ projectSlug, kind: e.requestKind, note: e.note });
    }
    rawDispatch({ type: 'DRAIN_OUTBOX', count: batch.length });
    draining.current = 0;
  }, [state.outbox, projectSlug]);

  // simulation clock: real time drives the cached preview run
  const running = state.run?.status === 'RUNNING';
  useEffect(() => {
    if (!running) return;
    let last = Date.now();
    const id = window.setInterval(() => {
      const t = Date.now();
      rawDispatch({ type: 'SIM_TICK', deltaMs: t - last, at: new Date().toISOString() });
      last = t;
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const actors = useMemo(() => listFabricationActors(), []);
  const actor = useMemo(() => findFabricationActor(state.selectedActorId) ?? ACTOR_FALLBACK, [state.selectedActorId]);
  const character = useMemo(() => buildFabricationCharacter(state.selectedCharacterId)!, [state.selectedCharacterId]);

  // canonical runtime images (existing authority boards) may fill a slot; nothing is invented
  const runtimeUrls = useMemo(() => {
    const boards = engine.b48?.preStoryboardAuthorityPack?.authorities ?? [];
    const dual = boards.find((b) => b.boardTitle === 'SUBJECT WOMAN DUAL-ERA AUTHORITY')?.previewUrl ?? null;
    return { 'actor.sw017.portrait.primary': dual, 'character.subject-woman.portrait.primary': dual } as Record<string, string | null>;
  }, [engine.b48]);
  const url = useCallback((slotId: string | null) => (slotId ? characterAssetUrl(slotId, runtimeUrls) : null), [runtimeUrls]);

  const api: FabricationApi = useMemo(
    () => ({
      state,
      dispatch,
      now,
      actor,
      actors,
      character,
      url,
      status: (s) => stationStatus(state, s),
      blockers: (s) => stationBlockers(state, s),
      steps: stepsRemaining(state),
      pending: pendingFounderDecisions(state),
      persistence: repo.kind,
    }),
    [state, dispatch, now, actor, actors, character, url, repo.kind],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
