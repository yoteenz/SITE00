/**
 * CHARACTER FABRICATION state machine. Pure: time and ids arrive on actions, side effects leave through `outbox`.
 */
import { APPEARANCE_LAYERS, MOTION_LIBRARY, SIM_TEST_DEFS, WARDROBE_LIBRARY } from './library.js';
import { FABRICATION_DEFAULTS, findFabricationActor } from './actors.js';
import { buildFabricationSubjectSnapshot } from './fabricationSubjectResolver.js';
import { invalidateDownstream, isDone, openRevisions, stationBlockers } from './dependency.js';
import { buildResult, motionById, requiredMotionFor } from './simulation.js';
import { SKIN_BY_ID } from './lookups.js';
import {
  BODY_CHECK_IDS,
  MOTION_LIFECYCLE,
  STATION_LABEL,
  STATION_ORDER,
  type AppearanceLayerId,
  type BehaviorRole,
  type FabricationState,
  type FabricationSurface,
  type LookCandidateId,
  type MotionRequestDraft,
  type OutboxEvent,
  type RevisionRequest,
  type SimConfig,
  type SimTestId,
  type StationId,
  type WardrobeCategory,
} from './types.js';

const all = <T,>(v: T): Record<StationId, T> => Object.fromEntries(STATION_ORDER.map((s) => [s, v])) as Record<StationId, T>;

export const EMPTY_MOTION_DRAFT: MotionRequestDraft = {
  name: '',
  description: '',
  referenceNotes: '',
  priority: 'HIGH',
  deliverableFormat: 'FBX + USD + PREVIEW MP4',
  targetResolution: '4K',
  notes: '',
  attachments: [],
};

export const DEFAULT_SIM_CONFIG: SimConfig = {
  durationSec: 30,
  intensity: 'MEDIUM',
  environment: 'NEUTRAL',
  distractions: 'MINIMAL',
  cameraAngles: 3,
  capture: { video: true, audio: true, telemetry: true, biometrics: false },
};

export function initialFabricationState(): FabricationState {
  return {
    schema: 1,
    selectedProjectId: FABRICATION_DEFAULTS.projectId,
    selectedEntryId: FABRICATION_DEFAULTS.entryId,
    selectedActorId: FABRICATION_DEFAULTS.actorId,
    selectedCharacterId: FABRICATION_DEFAULTS.characterId,
    activeStation: 'identity',
    surface: 'STATION',
    authority: all('NONE'),
    stale: all(false),
    touched: all(false),

    selectedActorCandidateId: FABRICATION_DEFAULTS.actorId,
    actorCatalogueOpen: true,
    actorQuery: '',
    actorSort: 'RECENT',
    actorLayout: 'GRID',
    actorFilter: 'ALL',
    fabricationSubject: null,

    bodyVersions: [
      { versionId: 'V1.3', label: 'BODY VERSION V1.3', status: 'SUPERSEDED', lockedAt: null, note: 'SUPERSEDED' },
      { versionId: 'V2.0', label: 'BODY VERSION V2.0', status: 'SUPERSEDED', lockedAt: null, note: 'SUPERSEDED' },
      { versionId: 'V2.1', label: 'BODY VERSION V2.1', status: 'DRAFT', lockedAt: null, note: 'CALIBRATION PENDING' },
    ],
    selectedBodyVersionId: 'V2.1',
    bodyView: 'FRONT',
    bodyChecks: {},
    bodyCalibrated: false,
    scaleLock: true,
    bodyGateOpen: false,

    wardrobeTab: 'TOPS',
    wardrobeQuery: '',
    wardrobeFilters: { availability: 'ALL', material: 'ALL', color: 'ALL' },
    selectedGarmentId: WARDROBE_LIBRARY[0]!.garmentId,
    fitting: { L1: null, L2: null, L3: null, L4: null },
    fittingHidden: [],
    fittingSubmitted: false,
    selectedLookCandidateId: 'A',
    comparedCandidates: [],
    lookDecision: 'PENDING',

    selectedHairRefId: 'REF-H-02',
    selectedMakeupRefId: 'MU-02',
    selectedAppearanceSetId: 'SET-02',
    appearanceLayers: APPEARANCE_LAYERS.map((l, i) => ({ layerId: l.layerId, visible: true, opacity: 100, order: i })),
    selectedAppearanceLayerId: 'hairStyle',
    appearanceCandidateId: 'C-01',
    appearanceDecision: 'PENDING',
    appearanceOverlayPct: 50,
    appearanceAppliedToFitting: false,

    behaviorLayers: [
      { skinId: 'bs-observant', role: 'PRIMARY', weight: 76 },
      { skinId: 'bs-self-conscious', role: 'SECONDARY', weight: 42 },
      { skinId: 'bs-defiant', role: 'ACCENT', weight: 28 },
      { skinId: 'bs-vulnerable', role: 'FOUNDATIONAL', weight: 14 },
    ],
    behaviorQuery: '',
    behaviorCategory: 'ALL',
    behaviorPendingSkinId: null,
    savedCompositions: [],
    selectedBehaviorCompositionId: null,

    selectedMotionId: 'SIT_V01',
    motionPlaying: false,
    motionRate: 1,
    motionUsedIds: [],
    motionRequestDraft: EMPTY_MOTION_DRAFT,
    motionRequests: [],
    publishedMotions: [],
    requiredMotion: { motionType: 'COMBAT REACTION', action: 'EVASIVE ROLL LEFT', intensity: 'HIGH', durationSec: 2.4, fps: 60, qualityTarget: 'FILM / HERO', usage: 'SIMULATION + FINAL' },

    selectedTestId: 'SIT',
    simConfig: DEFAULT_SIM_CONFIG,
    motionSentToTestingGround: null,
    run: null,
    selectedSimulationId: null,
    results: [],
    resolvedDefects: [],

    revisionRequests: [],
    revisionDraft: { station: 'identity', note: '' },
    finalSignedOff: false,

    history: [],
    notice: null,
    outbox: [],
  };
}

export type FabricationAction =
  | { type: 'HYDRATE'; state: FabricationState }
  | { type: 'RESET' }
  | { type: 'GOTO_STATION'; station: StationId }
  | { type: 'SET_SURFACE'; surface: FabricationSurface }
  | { type: 'DISMISS_NOTICE' }
  | { type: 'DRAIN_OUTBOX'; count: number }
  // identity
  | { type: 'SELECT_ACTOR'; actorId: string }
  | { type: 'ACTOR_QUERY'; query: string }
  | { type: 'ACTOR_SORT'; sort: FabricationState['actorSort'] }
  | { type: 'ACTOR_LAYOUT'; layout: FabricationState['actorLayout'] }
  | { type: 'ACTOR_FILTER'; filter: FabricationState['actorFilter'] }
  | { type: 'CATALOGUE_OPEN'; open: boolean }
  | { type: 'CONFIRM_ACTOR'; at: string }
  | {
      type: 'RESTORE_AFTER_LIBRARY';
      selectedActorCandidateId: string;
      selectedActorId: string;
      activeStation: StationId;
      actorCatalogueOpen: boolean;
    }
  | { type: 'CHANGE_ACTOR'; at: string }
  // body
  | { type: 'BODY_VIEW'; view: FabricationState['bodyView'] }
  | { type: 'RUN_CALIBRATION'; at: string }
  | { type: 'TOGGLE_SCALE_LOCK' }
  | { type: 'BODY_GATE'; open: boolean }
  | { type: 'LOCK_BODY'; at: string }
  | { type: 'NEW_BODY_VERSION'; at: string }
  // look
  | { type: 'WARDROBE_TAB'; tab: WardrobeCategory }
  | { type: 'WARDROBE_QUERY'; query: string }
  | { type: 'WARDROBE_FILTER'; patch: Partial<FabricationState['wardrobeFilters']> }
  | { type: 'SELECT_GARMENT'; garmentId: string }
  | { type: 'FIT_GARMENT'; garmentId: string }
  | { type: 'CLEAR_FITTING' }
  | { type: 'TOGGLE_FITTING_LAYER'; layer: 'L1' | 'L2' | 'L3' | 'L4' }
  | { type: 'ADD_TO_FITTING'; at: string }
  | { type: 'SELECT_LOOK_CANDIDATE'; candidateId: LookCandidateId }
  | { type: 'OPEN_LOOK_COMPARE' }
  | { type: 'LOOK_DECISION'; decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'; at: string }
  // appearance
  | { type: 'SELECT_HAIR_REF'; refId: string }
  | { type: 'SELECT_MAKEUP_REF'; refId: string }
  | { type: 'SELECT_APPEARANCE_SET'; setId: string }
  | { type: 'SELECT_APPEARANCE_LAYER'; layerId: AppearanceLayerId }
  | { type: 'TOGGLE_APPEARANCE_LAYER'; layerId: AppearanceLayerId }
  | { type: 'MOVE_APPEARANCE_LAYER'; layerId: AppearanceLayerId; dir: -1 | 1 }
  | { type: 'LAYER_OPACITY'; opacity: number }
  | { type: 'APPEARANCE_OVERLAY'; pct: number }
  | { type: 'APPLY_APPEARANCE_TO_FITTING'; at: string }
  | { type: 'RESET_APPEARANCE' }
  | { type: 'APPEARANCE_DECISION'; decision: 'SELECT_CANDIDATE' | 'KEEP_CURRENT' | 'REQUEST_REVISION' | 'LOCK'; at: string }
  // character
  | { type: 'BEHAVIOR_WEIGHT'; skinId: string; weight: number }
  | { type: 'BEHAVIOR_QUERY'; query: string }
  | { type: 'BEHAVIOR_CATEGORY'; category: FabricationState['behaviorCategory'] }
  | { type: 'BEHAVIOR_PENDING'; skinId: string | null }
  | { type: 'ADD_BEHAVIOR_LAYER' }
  | { type: 'REMOVE_BEHAVIOR_LAYER'; skinId: string }
  | { type: 'SAVE_COMPOSITION'; at: string }
  | { type: 'LOCK_CHARACTER'; at: string }
  // performance
  | { type: 'SELECT_MOTION'; motionId: string }
  | { type: 'MOTION_PLAY'; playing: boolean }
  | { type: 'MOTION_RATE'; rate: FabricationState['motionRate'] }
  | { type: 'USE_MOTION'; at: string }
  | { type: 'SEND_TO_TESTING_GROUND'; at: string }
  | { type: 'OPEN_MOTION_REQUEST'; name?: string }
  | { type: 'MOTION_DRAFT'; patch: Partial<MotionRequestDraft> }
  | { type: 'ADD_MOTION_ATTACHMENT'; name: string }
  | { type: 'CREATE_MOTION_REQUEST'; at: string; requestId: string }
  | { type: 'ADVANCE_MOTION_REQUEST'; requestId: string; at: string }
  // simulation
  | { type: 'SELECT_TEST'; testId: SimTestId }
  | { type: 'SIM_CONFIG'; patch: Partial<Omit<SimConfig, 'capture'>> }
  | { type: 'SIM_CAPTURE'; key: keyof SimConfig['capture'] }
  | { type: 'RUN_TEST'; at: string; simulationId: string }
  | { type: 'SIM_TICK'; deltaMs: number; at: string }
  | { type: 'SIM_PAUSE' }
  | { type: 'SIM_RESUME' }
  | { type: 'SIM_ABORT'; at: string }
  | { type: 'SIM_NEW' }
  | { type: 'SIM_VIEW_RESULT'; simulationId: string }
  | { type: 'ROUTE_VARIANCE'; station: StationId; at: string }
  | { type: 'ACCEPT_VARIANCE'; at: string }
  | { type: 'APPROVE_SIMULATION'; at: string }
  // authority
  | { type: 'REVISION_LAYER'; station: StationId }
  | { type: 'REVISION_NOTE'; note: string }
  | { type: 'SEND_REVISION'; at: string; revisionId: string }
  | { type: 'CANCEL_REVISION' }
  | { type: 'FINAL_SIGNOFF'; at: string }
  | { type: 'REVALIDATE_STATION'; station: StationId; at: string };

/* ── helpers ─────────────────────────────────────────────────────────────── */

const err = (s: FabricationState, text: string): FabricationState => ({ ...s, notice: { kind: 'ERROR', text } });
const info = (s: FabricationState, text: string): FabricationState => ({ ...s, notice: { kind: 'INFO', text } });
const emit = (s: FabricationState, ...e: OutboxEvent[]): FabricationState => ({ ...s, outbox: [...s.outbox, ...e] });
const log = (s: FabricationState, at: string, station: StationId | null, message: string): FabricationState => ({
  ...s,
  history: [{ at, station, message }, ...s.history].slice(0, 100),
});
const touch = (s: FabricationState, st: StationId): FabricationState => ({ ...s, touched: { ...s.touched, [st]: true } });

/** Editing an approved station withdraws its approval and invalidates everything built on it. */
function editing(s: FabricationState, st: StationId): FabricationState {
  let n = touch(s, st);
  if (isDone(n.authority[st])) {
    n = { ...n, authority: { ...n.authority, [st]: 'NONE' } };
    n = invalidateDownstream(n, st);
  }
  return n;
}

/** Grant authority to a station: clear its staleness, resolve its open revision requests + the defects they carried. */
function grant(s: FabricationState, st: StationId, level: 'APPROVED' | 'LOCKED', at: string): FabricationState {
  const open = openRevisions(s, st);
  const revisionRequests = s.revisionRequests.map((r) => (r.station === st && r.status === 'OPEN' ? { ...r, status: 'RESOLVED' as const, resolvedAt: at } : r));
  const resolvedDefects = Array.from(new Set([...s.resolvedDefects, ...open.flatMap((r) => r.defectIds)]));
  let n: FabricationState = {
    ...s,
    authority: { ...s.authority, [st]: level },
    stale: { ...s.stale, [st]: false },
    touched: { ...s.touched, [st]: true },
    revisionRequests,
    resolvedDefects,
  };
  n = log(n, at, st, `${STATION_LABEL[st]} ${level}`);
  return emit(n, { kind: 'ACTIVITY', category: 'APPROVAL', title: `${STATION_LABEL[st]} ${level}`, detail: `SW-017 · SUBJECT WOMAN · NDXBOOK / ENTRY 002` });
}

const gateFail = (s: FabricationState, st: StationId): FabricationState | null => {
  const b = stationBlockers(s, st);
  return b.length ? err(s, `BLOCKED — ${b.map((x) => x.message).join(' · ')}`) : null;
};

export function nextBehaviorRole(layers: FabricationState['behaviorLayers']): BehaviorRole | null {
  const used = new Set(layers.map((l) => l.role));
  return (['PRIMARY', 'SECONDARY', 'ACCENT', 'FOUNDATIONAL'] as const).find((r) => !used.has(r)) ?? null;
}

const slotForCategory = (c: WardrobeCategory): 'L1' | 'L2' | 'L3' | 'L4' => (c === 'TOPS' ? 'L1' : c === 'BOTTOMS' ? 'L2' : c === 'OUTERWEAR' ? 'L3' : 'L4');

export function testForMotion(motionId: string): SimTestId | null {
  const e = (Object.entries(SIM_TEST_DEFS) as [SimTestId, { motionId: string | null }][]).find(([, d]) => d.motionId === motionId);
  return e ? e[0] : null;
}

/* ── reducer ─────────────────────────────────────────────────────────────── */

export function fabricationReducer(state: FabricationState, a: FabricationAction): FabricationState {
  switch (a.type) {
    case 'HYDRATE':
      return { ...a.state, outbox: [], notice: null };
    case 'RESET':
      return initialFabricationState();
    case 'GOTO_STATION':
      return { ...state, activeStation: a.station, surface: 'STATION', notice: null };
    case 'SET_SURFACE':
      return { ...state, surface: a.surface, notice: null };
    case 'RESTORE_AFTER_LIBRARY':
      return {
        ...state,
        surface: 'STATION',
        selectedActorId: a.selectedActorId,
        selectedActorCandidateId: a.selectedActorCandidateId,
        activeStation: a.activeStation,
        actorCatalogueOpen: a.actorCatalogueOpen,
        notice: null,
      };
    case 'DISMISS_NOTICE':
      return { ...state, notice: null };
    case 'DRAIN_OUTBOX':
      return { ...state, outbox: state.outbox.slice(a.count) };

    /* 01 IDENTITY */
    case 'SELECT_ACTOR':
      return findFabricationActor(a.actorId) ? { ...state, selectedActorCandidateId: a.actorId, notice: null } : state;
    case 'ACTOR_QUERY':
      return { ...state, actorQuery: a.query };
    case 'ACTOR_SORT':
      return { ...state, actorSort: a.sort };
    case 'ACTOR_LAYOUT':
      return { ...state, actorLayout: a.layout };
    case 'ACTOR_FILTER':
      return { ...state, actorFilter: a.filter };
    case 'CATALOGUE_OPEN':
      return { ...state, actorCatalogueOpen: a.open, selectedActorCandidateId: a.open ? state.selectedActorCandidateId : state.selectedActorId };
    case 'CONFIRM_ACTOR': {
      const actor = findFabricationActor(state.selectedActorCandidateId);
      if (!actor) return err(state, 'NO ACTOR SELECTED');
      const changed = actor.actorId !== state.selectedActorId;
      let n: FabricationState = touch({ ...state, selectedActorId: actor.actorId, actorCatalogueOpen: false, surface: 'STATION' }, 'identity');
      if (changed) {
        // a different actor is a different identity authority: everything built on the old one is invalid
        n = invalidateDownstream({ ...n, authority: { ...n.authority, identity: 'NONE' } }, 'identity');
      }
      n = grant(n, 'identity', 'LOCKED', a.at);
      n = {
        ...n,
        fabricationSubject: buildFabricationSubjectSnapshot(actor, a.at),
      };
      return info(n, `ACTOR ${actor.catalogueNumber} CONFIRMED`);
    }
    case 'CHANGE_ACTOR': {
      let n: FabricationState = {
        ...state,
        actorCatalogueOpen: true,
        activeStation: 'identity',
        surface: 'STATION',
        selectedActorCandidateId: state.selectedActorId,
        fabricationSubject: state.fabricationSubject,
      };
      n = editing(n, 'identity');
      return log(n, a.at, 'identity', 'CHANGE ACTOR OPENED');
    }

    /* 02 BODY */
    case 'BODY_VIEW':
      return { ...state, bodyView: a.view };
    case 'RUN_CALIBRATION': {
      if (state.bodyCalibrated) return info(state, 'CALIBRATION ALREADY CURRENT');
      let n = editing(state, 'body');
      n = { ...n, bodyCalibrated: true, bodyChecks: Object.fromEntries(BODY_CHECK_IDS.map((c) => [c, true])) };
      n = log(n, a.at, 'body', 'CONTINUITY CALIBRATION RUN — FIXTURE READOUT');
      return info(n, 'CALIBRATION COMPLETE · 7 / 7 CHECKS VERIFIED (PREVIEW FIXTURE)');
    }
    case 'TOGGLE_SCALE_LOCK':
      return { ...state, scaleLock: !state.scaleLock };
    case 'BODY_GATE':
      return { ...state, bodyGateOpen: a.open, notice: null };
    case 'LOCK_BODY': {
      const f = gateFail(state, 'body');
      if (f) return f;
      if (!state.bodyCalibrated) return err(state, 'RUN CONTINUITY CALIBRATION BEFORE LOCKING');
      const versions = state.bodyVersions.map((v) => (v.versionId === state.selectedBodyVersionId ? { ...v, status: 'LOCKED' as const, lockedAt: a.at, note: 'LOCKED BY FOUNDER' } : v));
      let n: FabricationState = { ...state, bodyVersions: versions, bodyGateOpen: false };
      n = grant(n, 'body', 'LOCKED', a.at);
      return info(n, `BODY BASELINE ${state.selectedBodyVersionId} LOCKED — IMMUTABLE`);
    }
    case 'NEW_BODY_VERSION': {
      const cur = state.bodyVersions.find((v) => v.versionId === state.selectedBodyVersionId);
      const [maj, min] = state.selectedBodyVersionId.replace('V', '').split('.').map(Number);
      const id = `V${maj}.${(min ?? 0) + 1}`;
      const versions = [
        ...state.bodyVersions.map((v) => (v.versionId === cur?.versionId ? { ...v, status: 'SUPERSEDED' as const, note: 'SUPERSEDED' } : v)),
        { versionId: id, label: `BODY VERSION ${id}`, status: 'DRAFT' as const, lockedAt: null, note: 'CALIBRATION PENDING' },
      ];
      let n: FabricationState = { ...state, bodyVersions: versions, selectedBodyVersionId: id, bodyCalibrated: false, bodyChecks: {} };
      n = editing(n, 'body');
      n = invalidateDownstream(n, 'body');
      return log(n, a.at, 'body', `NEW BODY BASE VERSION ${id}`);
    }

    /* 03 LOOK */
    case 'WARDROBE_TAB':
      return { ...state, wardrobeTab: a.tab };
    case 'WARDROBE_QUERY':
      return { ...state, wardrobeQuery: a.query };
    case 'WARDROBE_FILTER':
      return { ...state, wardrobeFilters: { ...state.wardrobeFilters, ...a.patch } };
    case 'SELECT_GARMENT':
      return { ...state, selectedGarmentId: a.garmentId };
    case 'FIT_GARMENT': {
      const g = WARDROBE_LIBRARY.find((x) => x.garmentId === a.garmentId);
      if (!g) return state;
      if (g.availability === 'OUT_OF_STOCK') return err(state, `${g.name} UNAVAILABLE`);
      const slot = slotForCategory(g.category);
      const n = editing(state, 'look');
      return { ...n, selectedGarmentId: g.garmentId, fitting: { ...n.fitting, [slot]: g.garmentId }, fittingHidden: n.fittingHidden.filter((x) => x !== slot), fittingSubmitted: false, notice: null };
    }
    case 'CLEAR_FITTING':
      return { ...editing(state, 'look'), fitting: { L1: null, L2: null, L3: null, L4: null }, fittingHidden: [], fittingSubmitted: false };
    case 'TOGGLE_FITTING_LAYER':
      return { ...state, fittingHidden: state.fittingHidden.includes(a.layer) ? state.fittingHidden.filter((x) => x !== a.layer) : [...state.fittingHidden, a.layer] };
    case 'ADD_TO_FITTING': {
      if (!Object.values(state.fitting).some(Boolean)) return err(state, 'SELECT LIBRARY ITEMS FIRST');
      let n = log({ ...touch(state, 'look'), fittingSubmitted: true }, a.at, 'look', 'ITEMS ADDED TO FITTING STATION');
      n = emit(n, { kind: 'ACTIVITY', category: 'ASSET', title: 'LOOK ADDED TO FITTING', detail: 'SW-017 · SLOT 01 · LIBRARY ASSETS (NO NEW VERSION GENERATED)' });
      return info(n, 'ADDED TO FITTING STATION — LIBRARY ASSETS, NO NEW VERSION GENERATED');
    }
    case 'SELECT_LOOK_CANDIDATE':
      return { ...touch(state, 'look'), selectedLookCandidateId: a.candidateId, comparedCandidates: Array.from(new Set([...state.comparedCandidates, a.candidateId])) };
    case 'OPEN_LOOK_COMPARE':
      return { ...touch(state, 'look'), surface: 'LOOK_COMPARE', comparedCandidates: ['A', 'B', 'C'], notice: null };
    case 'LOOK_DECISION': {
      if (a.decision === 'APPROVED') {
        const f = gateFail(state, 'look');
        if (f) return f;
        let n: FabricationState = { ...state, lookDecision: 'APPROVED', surface: 'STATION' };
        n = grant(n, 'look', 'APPROVED', a.at);
        return info({ ...n, activeStation: 'appearance' }, `LOOK CANDIDATE ${state.selectedLookCandidateId} APPROVED`);
      }
      if (a.decision === 'REJECTED') {
        let n = editing({ ...state, lookDecision: 'REJECTED' }, 'look');
        n = log(n, a.at, 'look', `CANDIDATE ${state.selectedLookCandidateId} REJECTED`);
        return info(n, `CANDIDATE ${state.selectedLookCandidateId} REJECTED — SELECT ANOTHER`);
      }
      let n = editing({ ...state, lookDecision: 'REVISION_REQUESTED', surface: 'STATION' }, 'look');
      const rev: RevisionRequest = { revisionId: `rev-look-${a.at}`, station: 'look', note: `CANDIDATE ${state.selectedLookCandidateId} — REVISION REQUESTED`, source: 'STATION', status: 'OPEN', createdAt: a.at, resolvedAt: null, defectIds: [] };
      n = { ...n, revisionRequests: [rev, ...n.revisionRequests] };
      n = emit(log(n, a.at, 'look', 'REVISION REQUESTED'), { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_REVISION', note: `LOOK · ${rev.note}` });
      return info(n, 'REVISION REQUESTED FOR LOOK');
    }

    /* 04 APPEARANCE */
    case 'SELECT_HAIR_REF':
      return { ...editing(state, 'appearance'), selectedHairRefId: a.refId };
    case 'SELECT_MAKEUP_REF':
      return { ...editing(state, 'appearance'), selectedMakeupRefId: a.refId };
    case 'SELECT_APPEARANCE_SET':
      return { ...editing(state, 'appearance'), selectedAppearanceSetId: a.setId };
    case 'SELECT_APPEARANCE_LAYER':
      return { ...state, selectedAppearanceLayerId: a.layerId };
    case 'TOGGLE_APPEARANCE_LAYER':
      return { ...editing(state, 'appearance'), appearanceLayers: state.appearanceLayers.map((l) => (l.layerId === a.layerId ? { ...l, visible: !l.visible } : l)) };
    case 'MOVE_APPEARANCE_LAYER': {
      const sorted = [...state.appearanceLayers].sort((x, y) => x.order - y.order);
      const i = sorted.findIndex((l) => l.layerId === a.layerId);
      const j = i + a.dir;
      if (i < 0 || j < 0 || j >= sorted.length) return state;
      [sorted[i], sorted[j]] = [sorted[j]!, sorted[i]!];
      return { ...editing(state, 'appearance'), appearanceLayers: sorted.map((l, k) => ({ ...l, order: k })) };
    }
    case 'LAYER_OPACITY':
      return { ...editing(state, 'appearance'), appearanceLayers: state.appearanceLayers.map((l) => (l.layerId === state.selectedAppearanceLayerId ? { ...l, opacity: Math.max(0, Math.min(100, Math.round(a.opacity))) } : l)) };
    case 'APPEARANCE_OVERLAY':
      return { ...state, appearanceOverlayPct: Math.max(0, Math.min(100, a.pct)) };
    case 'APPLY_APPEARANCE_TO_FITTING': {
      let n = log({ ...touch(state, 'appearance'), appearanceAppliedToFitting: true }, a.at, 'appearance', 'APPEARANCE LAYERS APPLIED TO FITTING');
      n = emit(n, { kind: 'ACTIVITY', category: 'ASSET', title: 'APPEARANCE APPLIED TO FITTING', detail: `${state.selectedAppearanceSetId} · ${state.selectedHairRefId} · ${state.selectedMakeupRefId}` });
      return info(n, 'APPEARANCE APPLIED TO FITTING');
    }
    case 'RESET_APPEARANCE':
      return { ...editing(state, 'appearance'), appearanceLayers: APPEARANCE_LAYERS.map((l, i) => ({ layerId: l.layerId, visible: true, opacity: 100, order: i })), appearanceAppliedToFitting: false, appearanceDecision: 'PENDING' };
    case 'APPEARANCE_DECISION': {
      if (a.decision === 'SELECT_CANDIDATE') return info({ ...touch(state, 'appearance'), appearanceDecision: 'CANDIDATE_SELECTED' }, 'CANDIDATE C-01 SELECTED — LOCK TO MAKE IT AUTHORITY');
      if (a.decision === 'KEEP_CURRENT') return info({ ...touch(state, 'appearance'), appearanceDecision: 'KEEP_CURRENT' }, 'KEEPING CURRENT AUTHORITY — LOCK TO CONFIRM');
      if (a.decision === 'REQUEST_REVISION') {
        let n = editing({ ...state, appearanceDecision: 'REVISION_REQUESTED', surface: 'STATION' }, 'appearance');
        const rev: RevisionRequest = { revisionId: `rev-app-${a.at}`, station: 'appearance', note: 'CANDIDATE TREATMENT C-01 — REVISION REQUESTED', source: 'STATION', status: 'OPEN', createdAt: a.at, resolvedAt: null, defectIds: [] };
        n = emit(log({ ...n, revisionRequests: [rev, ...n.revisionRequests] }, a.at, 'appearance', 'REVISION REQUESTED'), { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_REVISION', note: `HAIR + MAKEUP · ${rev.note}` });
        return info(n, 'REVISION REQUESTED FOR HAIR + MAKEUP');
      }
      const f = gateFail(state, 'appearance');
      if (f) return f;
      if (state.appearanceDecision !== 'CANDIDATE_SELECTED' && state.appearanceDecision !== 'KEEP_CURRENT' && state.appearanceDecision !== 'LOCKED') return err(state, 'SELECT A CANDIDATE OR KEEP CURRENT BEFORE LOCKING');
      let n: FabricationState = { ...state, appearanceDecision: 'LOCKED', surface: 'STATION' };
      n = grant(n, 'appearance', 'LOCKED', a.at);
      return info({ ...n, activeStation: 'character' }, 'APPEARANCE LOCKED');
    }

    /* 05 CHARACTER */
    case 'BEHAVIOR_WEIGHT':
      return { ...editing(state, 'character'), selectedBehaviorCompositionId: null, behaviorLayers: state.behaviorLayers.map((l) => (l.skinId === a.skinId ? { ...l, weight: Math.max(0, Math.min(100, Math.round(a.weight))) } : l)) };
    case 'BEHAVIOR_QUERY':
      return { ...state, behaviorQuery: a.query };
    case 'BEHAVIOR_CATEGORY':
      return { ...state, behaviorCategory: a.category };
    case 'BEHAVIOR_PENDING':
      return { ...state, behaviorPendingSkinId: a.skinId };
    case 'ADD_BEHAVIOR_LAYER': {
      const id = state.behaviorPendingSkinId;
      if (!id || !SKIN_BY_ID[id]) return err(state, 'SELECT A BEHAVIOR FIRST');
      if (state.behaviorLayers.some((l) => l.skinId === id)) return err(state, 'LAYER ALREADY IN COMPOSITION');
      const role = nextBehaviorRole(state.behaviorLayers);
      if (!role) return err(state, 'COMPOSITION FULL — REMOVE A LAYER FIRST');
      return { ...editing(state, 'character'), selectedBehaviorCompositionId: null, behaviorLayers: [...state.behaviorLayers, { skinId: id, role, weight: 30 }], behaviorPendingSkinId: null, surface: 'STATION', notice: { kind: 'INFO', text: `${SKIN_BY_ID[id]!.name} ADDED AS ${role}` } };
    }
    case 'REMOVE_BEHAVIOR_LAYER':
      return { ...editing(state, 'character'), selectedBehaviorCompositionId: null, behaviorLayers: state.behaviorLayers.filter((l) => l.skinId !== a.skinId) };
    case 'SAVE_COMPOSITION': {
      if (!state.behaviorLayers.length) return err(state, 'COMPOSITION IS EMPTY');
      const id = `COMP-${String(state.savedCompositions.length + 1).padStart(2, '0')}`;
      let n: FabricationState = { ...touch(state, 'character'), savedCompositions: [{ compositionId: id, layers: state.behaviorLayers, savedAt: a.at }, ...state.savedCompositions], selectedBehaviorCompositionId: id };
      n = log(n, a.at, 'character', `COMPOSITION ${id} SAVED`);
      n = emit(n, { kind: 'ACTIVITY', category: 'ASSET', title: 'BEHAVIORAL COMPOSITION SAVED', detail: `${id} · ${state.behaviorLayers.length} LAYERS · SUBJECT WOMAN` });
      return info(n, `COMPOSITION ${id} SAVED`);
    }
    case 'LOCK_CHARACTER': {
      const f = gateFail(state, 'character');
      if (f) return f;
      if (!state.selectedBehaviorCompositionId) return err(state, 'SAVE THE COMPOSITION BEFORE LOCKING');
      return info(grant(state, 'character', 'LOCKED', a.at), 'CHARACTER LOCKED');
    }

    /* 06 PERFORMANCE */
    case 'SELECT_MOTION':
      return { ...state, selectedMotionId: a.motionId, motionPlaying: false };
    case 'MOTION_PLAY':
      return { ...state, motionPlaying: a.playing };
    case 'MOTION_RATE':
      return { ...state, motionRate: a.rate };
    case 'USE_MOTION': {
      const f = gateFail(state, 'performance');
      if (f) return f;
      if (!motionById(state, state.selectedMotionId)) return err(state, 'MOTION ASSET NOT PUBLISHED');
      let n: FabricationState = { ...state, motionUsedIds: Array.from(new Set([state.selectedMotionId, ...state.motionUsedIds])) };
      n = grant(n, 'performance', 'APPROVED', a.at);
      return info(n, `${state.selectedMotionId} ATTACHED TO CHARACTER`);
    }
    case 'SEND_TO_TESTING_GROUND': {
      const t = testForMotion(state.selectedMotionId);
      let n: FabricationState = { ...touch(state, 'performance'), motionSentToTestingGround: state.selectedMotionId, selectedTestId: t ?? state.selectedTestId, activeStation: 'simulation', surface: 'STATION' };
      n = log(n, a.at, 'performance', `${state.selectedMotionId} SENT TO TESTING GROUND`);
      return info(n, `${state.selectedMotionId} SENT TO TESTING GROUND`);
    }
    case 'OPEN_MOTION_REQUEST': {
      const name = (a.name ?? '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      return { ...state, surface: 'MOTION_REQUEST', motionRequestDraft: { ...state.motionRequestDraft, name: name || state.motionRequestDraft.name || 'COMBAT_EVASIVE_ROLL_LEFT_HI', description: state.motionRequestDraft.description || 'High intensity evasive roll to the left with quick recovery to fighting stance.', referenceNotes: state.motionRequestDraft.referenceNotes || 'Maintain athletic realism. Preserve character weight and balance. Natural hair and cloth motion.' }, notice: null };
    }
    case 'MOTION_DRAFT':
      return { ...state, motionRequestDraft: { ...state.motionRequestDraft, ...a.patch } };
    case 'ADD_MOTION_ATTACHMENT':
      return { ...state, motionRequestDraft: { ...state.motionRequestDraft, attachments: [...state.motionRequestDraft.attachments, a.name] } };
    case 'CREATE_MOTION_REQUEST': {
      const d = state.motionRequestDraft;
      if (!d.name.trim() || !d.description.trim()) return err(state, 'REQUEST NAME AND DESCRIPTION ARE REQUIRED');
      if (state.motionRequests.some((r) => r.name === d.name && r.stage !== 'PUBLISH_ASSET')) return err(state, 'AN OPEN REQUEST WITH THIS NAME ALREADY EXISTS');
      const req = {
        ...d,
        requestId: a.requestId,
        stage: 'REQUEST_SUBMISSION' as const,
        createdAt: a.at,
        blocksSimulation: true,
        dependencies: [
          { k: 'CHARACTER', v: 'SW-017' },
          { k: 'LOOK VERSION', v: state.authority.look === 'NONE' ? 'PENDING' : `CANDIDATE ${state.selectedLookCandidateId}` },
          { k: 'BODY VERSION', v: state.selectedBodyVersionId },
          { k: 'BEHAVIOR PROFILE', v: state.behaviorLayers.map((l) => SKIN_BY_ID[l.skinId]?.name).filter(Boolean).slice(0, 2).join(' / ') },
          { k: 'ENVIRONMENT', v: 'N/A' },
        ],
      };
      let n: FabricationState = { ...touch(state, 'performance'), motionRequests: [req, ...state.motionRequests], surface: 'STATION' };
      n = log(n, a.at, 'performance', `MOTION REQUEST ${d.name} SUBMITTED`);
      n = emit(n, { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_MOTION_ASSET', note: `${d.name} · ${d.priority} · ${d.deliverableFormat} · ${d.targetResolution}` }, { kind: 'ACTIVITY', category: 'REQUEST', title: 'MOTION ASSET REQUESTED', detail: `${d.name} · BLOCKS SIMULATION` });
      return info(n, `GENERATION REQUEST ${d.name} CREATED — SIMULATION BLOCKED UNTIL PUBLISHED`);
    }
    case 'ADVANCE_MOTION_REQUEST': {
      const r = state.motionRequests.find((x) => x.requestId === a.requestId);
      if (!r) return state;
      const i = MOTION_LIFECYCLE.indexOf(r.stage);
      if (i >= MOTION_LIFECYCLE.length - 1) return state;
      const stage = MOTION_LIFECYCLE[i + 1]!;
      const requests = state.motionRequests.map((x) => (x.requestId === r.requestId ? { ...x, stage } : x));
      let n: FabricationState = { ...state, motionRequests: requests };
      if (stage === 'PUBLISH_ASSET') {
        const base = MOTION_LIBRARY[0]!;
        n = {
          ...n,
          publishedMotions: [
            { ...base, motionId: r.name, label: r.description.slice(0, 32).toUpperCase(), durationSec: state.requiredMotion.durationSec, fps: state.requiredMotion.fps, keyBeatFrame: 72, slotId: `motion.sw017.${r.name.toLowerCase().replace(/_/g, '-')}.preview` },
            ...n.publishedMotions,
          ],
        };
        n = emit(n, { kind: 'ACTIVITY', category: 'ASSET', title: 'MOTION ASSET PUBLISHED', detail: `${r.name} · READY FOR SIMULATION` });
      }
      return info(log(n, a.at, 'performance', `MOTION REQUEST ${r.name} → ${stage}`), `${r.name} → ${stage.replace(/_/g, ' ')}`);
    }

    /* 07 SIMULATION */
    case 'SELECT_TEST':
      return state.run && (state.run.status === 'RUNNING' || state.run.status === 'PAUSED') ? state : { ...state, selectedTestId: a.testId };
    case 'SIM_CONFIG':
      return { ...state, simConfig: { ...state.simConfig, ...a.patch } };
    case 'SIM_CAPTURE':
      return { ...state, simConfig: { ...state.simConfig, capture: { ...state.simConfig.capture, [a.key]: !state.simConfig.capture[a.key] } } };
    case 'RUN_TEST': {
      const f = gateFail(state, 'simulation');
      if (f) return f;
      const need = requiredMotionFor(state);
      if (need && !need.available) return err(state, `REQUIRED MOTION ${need.motionId} DOES NOT EXIST — CREATE A GENERATION REQUEST`);
      let n: FabricationState = {
        ...touch(state, 'simulation'),
        run: { simulationId: a.simulationId, testId: state.selectedTestId, config: state.simConfig, status: 'RUNNING', elapsedMs: 0, startedAt: a.at, fidelity: 'SIMULATION_PREVIEW_CACHED' },
        selectedSimulationId: a.simulationId,
        notice: null,
      };
      n = log(n, a.at, 'simulation', `TEST ${state.selectedTestId} STARTED (${a.simulationId})`);
      return n;
    }
    case 'SIM_TICK': {
      const r = state.run;
      if (!r || r.status !== 'RUNNING') return state;
      const elapsed = r.elapsedMs + a.deltaMs;
      if (elapsed < r.config.durationSec * 1000) return { ...state, run: { ...r, elapsedMs: elapsed } };
      const done = { ...state, run: { ...r, elapsedMs: r.config.durationSec * 1000, status: 'COMPLETE' as const } };
      const result = buildResult(done, r.simulationId, a.at);
      let n: FabricationState = { ...done, results: [result, ...state.results], selectedSimulationId: r.simulationId };
      n = log(n, a.at, 'simulation', `TEST ${r.testId} COMPLETE — ${result.failed} OF ${result.checks.length} CHECKS FAILED`);
      n = emit(n, { kind: 'ACTIVITY', category: 'RENDER', title: result.failed ? 'SIMULATION VARIANCE' : 'SIMULATION PASSED', detail: `${r.simulationId} · ${r.testId} · ${result.failed} OF ${result.checks.length} CHECKS FAILED` });
      if (result.failed) n = emit(n, { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_VARIANCE', note: `${r.simulationId} · ${result.checks.filter((c) => c.result === 'FAIL').map((c) => c.label).join(', ')}` });
      return n;
    }
    case 'SIM_PAUSE':
      return state.run?.status === 'RUNNING' ? { ...state, run: { ...state.run, status: 'PAUSED' } } : state;
    case 'SIM_RESUME':
      return state.run?.status === 'PAUSED' ? { ...state, run: { ...state.run, status: 'RUNNING' } } : state;
    case 'SIM_ABORT': {
      if (!state.run || (state.run.status !== 'RUNNING' && state.run.status !== 'PAUSED')) return state;
      return info(log({ ...state, run: { ...state.run, status: 'ABORTED' } }, a.at, 'simulation', `TEST ${state.run.testId} ABORTED`), 'TEST ABORTED — NO RESULT RECORDED');
    }
    case 'SIM_NEW':
      return { ...state, run: null, notice: null };
    case 'SIM_VIEW_RESULT': {
      const r = state.results.find((x) => x.simulationId === a.simulationId);
      if (!r) return state;
      return { ...state, selectedSimulationId: r.simulationId, run: { simulationId: r.simulationId, testId: r.testId, config: state.simConfig, status: 'COMPLETE', elapsedMs: r.durationSec * 1000, startedAt: null, fidelity: 'SIMULATION_PREVIEW_CACHED' } };
    }
    case 'ROUTE_VARIANCE': {
      const res = state.results.find((r) => r.simulationId === state.selectedSimulationId);
      if (!res) return state;
      const defects = res.checks.filter((c) => c.result === 'FAIL' && c.owner === a.station).map((c) => c.checkId);
      if (!defects.length && a.station !== 'simulation') return err(state, `NO FAILED CHECK IS OWNED BY ${STATION_LABEL[a.station]}`);
      const rev: RevisionRequest = {
        revisionId: `rev-sim-${a.station}-${a.at}`,
        station: a.station,
        note: `SIMULATION ${res.simulationId}: ${res.checks.filter((c) => defects.includes(c.checkId)).map((c) => `${c.label} ${c.delta}`).join('; ')}`,
        source: 'SIMULATION',
        status: 'OPEN',
        createdAt: a.at,
        resolvedAt: null,
        defectIds: defects,
      };
      let n: FabricationState = { ...state, revisionRequests: [rev, ...state.revisionRequests], results: state.results.map((r) => (r.simulationId === res.simulationId ? { ...r, routedTo: Array.from(new Set([...r.routedTo, a.station])) } : r)) };
      // the responsible station's authority is withdrawn; everything built on it is stale
      n = { ...n, authority: { ...n.authority, [a.station]: 'NONE' } };
      n = invalidateDownstream(n, a.station);
      n = { ...n, activeStation: a.station, surface: 'STATION' };
      if (a.station === 'look') n = { ...n, lookDecision: 'REVISION_REQUESTED' };
      n = emit(log(n, a.at, a.station, `VARIANCE ROUTED FROM ${res.simulationId}`), { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_REVISION', note: `${STATION_LABEL[a.station]} · ${rev.note}` });
      return info(n, `VARIANCE ROUTED TO ${STATION_LABEL[a.station]} STATION`);
    }
    case 'ACCEPT_VARIANCE': {
      const res = state.results.find((r) => r.simulationId === state.selectedSimulationId);
      if (!res) return state;
      const f = gateFail(state, 'simulation');
      if (f) return f;
      let n: FabricationState = { ...state, results: state.results.map((r) => (r.simulationId === res.simulationId ? { ...r, accepted: true } : r)) };
      n = grant(n, 'simulation', 'APPROVED', a.at);
      return info(n, `VARIANCE ACCEPTED (${res.failed} CHECKS) — SIMULATION APPROVED`);
    }
    case 'APPROVE_SIMULATION': {
      const res = state.results.find((r) => r.simulationId === state.selectedSimulationId);
      if (!res || res.failed > 0) return err(state, 'SIMULATION HAS FAILED CHECKS — ROUTE, RETEST OR ACCEPT VARIANCE');
      const f = gateFail(state, 'simulation');
      if (f) return f;
      return info(grant(state, 'simulation', 'APPROVED', a.at), 'SIMULATION APPROVED');
    }

    case 'REVALIDATE_STATION': {
      if (!state.stale[a.station]) return state;
      const f = gateFail(state, a.station);
      if (f) return f;
      if (openRevisions(state, a.station).length) return err(state, 'OPEN REVISION MUST BE RESOLVED FIRST');
      if (!isDone(state.authority[a.station])) return err(state, `${STATION_LABEL[a.station]} HAS NO AUTHORITY TO REVALIDATE`);
      const n: FabricationState = { ...state, stale: { ...state.stale, [a.station]: false } };
      return info(emit(log(n, a.at, a.station, `${STATION_LABEL[a.station]} REVALIDATED`), { kind: 'ACTIVITY', category: 'APPROVAL', title: `${STATION_LABEL[a.station]} REVALIDATED`, detail: 'UPSTREAM CHANGE REVIEWED — AUTHORITY RETAINED' }), `${STATION_LABEL[a.station]} REVALIDATED`);
    }

    /* 08 AUTHORITY */
    case 'REVISION_LAYER':
      return { ...state, revisionDraft: { ...state.revisionDraft, station: a.station } };
    case 'REVISION_NOTE':
      return { ...state, revisionDraft: { ...state.revisionDraft, note: a.note.slice(0, 300) } };
    case 'CANCEL_REVISION':
      return { ...state, revisionDraft: { station: 'identity', note: '' }, notice: null };
    case 'SEND_REVISION': {
      const d = state.revisionDraft;
      if (!d.note.trim()) return err(state, 'ADD A REVISION NOTE');
      if (d.station === 'authority') return err(state, 'SELECT A LAYER TO REVISE');
      const rev: RevisionRequest = { revisionId: a.revisionId, station: d.station, note: d.note.trim(), source: 'AUTHORITY', status: 'OPEN', createdAt: a.at, resolvedAt: null, defectIds: [] };
      let n: FabricationState = { ...state, revisionRequests: [rev, ...state.revisionRequests], authority: { ...state.authority, [d.station]: 'NONE', authority: 'NONE' }, finalSignedOff: false, revisionDraft: { station: 'identity', note: '' } };
      n = invalidateDownstream(n, d.station);
      n = { ...n, stale: { ...n.stale, authority: true }, activeStation: d.station, surface: 'STATION' };
      n = emit(log(n, a.at, d.station, `REVISION SENT TO ${STATION_LABEL[d.station]}`), { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_REVISION', note: `${STATION_LABEL[d.station]} · ${rev.note}` }, { kind: 'ACTIVITY', category: 'REQUEST', title: `${STATION_LABEL[d.station]} REVISION REQUESTED`, detail: rev.note.slice(0, 80) });
      return info(n, `REVISION ROUTED TO ${STATION_LABEL[d.station]} STATION`);
    }
    case 'FINAL_SIGNOFF': {
      const f = gateFail(state, 'authority');
      if (f) return f;
      let n: FabricationState = { ...state, finalSignedOff: true };
      n = grant(n, 'authority', 'LOCKED', a.at);
      n = emit(n, { kind: 'REQUEST', requestKind: 'CHARACTER_FABRICATION_SIGNOFF', note: 'SUBJECT WOMAN · FINAL CHARACTER AUTHORITY SIGNED OFF' });
      return info(n, 'FINAL CHARACTER AUTHORITY SIGNED OFF');
    }
  }
  return state;
}
