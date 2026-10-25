import fs from 'node:fs';
import { toCsv } from '../csv.js';
import { shotListRows, cueSheetRows, type SceneDirection } from '../directorial/packet.js';
import { newReviewState, reconcileReviewState, type ElementType, type SceneReviewState } from '../directorial/review.js';
import { buildBudget, loadQuotesV2 } from '../directorial/routing.js';
import { DIRECTORIAL_SCHEMA_VERSION } from '../directorial/types.js';
import { EXCHANGE_PATHS, repoPath } from '../paths.js';
import { S1_01_CAST_RULE, S1_01_DIRECTION, S1_01_OVERVIEW, S1_01_REVIEW_EXTRAS } from './s1-01/index.js';

export * from './s1-01/index.js';

export type DirectedScene = {
  direction: SceneDirection;
  overview: { where: string; what: string; why: string; emotionalObjective: string };
  reviewExtras: Array<{ elementId: string; type: ElementType }>;
  /** Registry records the packet shows in its characters-and-assets section. */
  assetRefs: { sets: string[]; props: string[] };
  /** How the packet's cast section treats the unit's unregistered people. */
  castRule: string;
};

/** Units planned to the frame by the directorial engine. Their auto-planned shot lists stay in SHOT_LISTS for history only. */
export const DIRECTED_SCENES: Record<string, DirectedScene> = {
  'S1-01': { direction: S1_01_DIRECTION, overview: S1_01_OVERVIEW, reviewExtras: S1_01_REVIEW_EXTRAS, assetRefs: { sets: ['SET-CITY-DUSK', 'SET-HALCYON-HOUSE'], props: ['PR-NEIGHBOUR-PHONE'] }, castRule: S1_01_CAST_RULE },
};

export const PRODUCTION_SCENES_DIR = `${EXCHANGE_PATHS.season}/PRODUCTION_SCENES`;
export const SCENE_FILES = {
  packet: 'DIRECTORIAL_PACKET_V1.json',
  timeline: 'TIMELINE_EVENTS_V1.json',
  multitrack: 'MULTITRACK_V1.json',
  shotList: 'SHOT_LIST_V1.json',
  shotListCsv: 'SHOT_LIST_V1.csv',
  keyframes: 'KEYFRAME_MANIFEST_V1.json',
  cueSheet: 'CUE_SHEET_V1.csv',
  budget: 'PRODUCTION_BUDGET_V1.json',
  review: 'REVIEW_STATE_V1.json',
} as const;
export const scenePath = (unitId: string, file: string) => `${PRODUCTION_SCENES_DIR}/${unitId}/${file}`;
export const serializeJson = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

const directed = (unitId: string): DirectedScene => {
  const d = DIRECTED_SCENES[unitId];
  if (!d) throw new Error(`${unitId} has no directorial plan`);
  return d;
};

/** The saved review state carries founder decisions; a rebuild reconciles onto it and never resets it. */
export function loadSceneReviewState(unitId: string, root = process.cwd()): SceneReviewState {
  const d = directed(unitId);
  const fresh = newReviewState(d.direction.plan, d.reviewExtras);
  const p = repoPath(scenePath(unitId, SCENE_FILES.review), root);
  return fs.existsSync(p) ? reconcileReviewState(JSON.parse(fs.readFileSync(p, 'utf8')) as SceneReviewState, fresh) : fresh;
}

/** Budget, review state and shot list for one directed unit. Both build scripts call this, so the pipeline lineage hash and the written file agree. */
export function directedSceneBundle(unitId: string, root = process.cwd()) {
  const d = directed(unitId);
  const { plan } = d.direction;
  const budget = buildBudget(plan, loadQuotesV2(root));
  const review = loadSceneReviewState(unitId, root);
  const rows = shotListRows(plan, budget, review);
  const shotList = {
    schemaVersion: DIRECTORIAL_SCHEMA_VERSION,
    unitId: plan.unitId,
    releaseId: plan.releaseId,
    status: 'FOUNDER_REVIEW_REQUIRED',
    note: 'Frame-accurate production shot list. No shot has been generated.',
    fps: plan.fps,
    durationFrames: plan.durationFrames,
    screenplay: plan.screenplay,
    estimated: budget.estimated,
    shots: rows,
  };
  const shotListCsv = rows.length ? toCsv(Object.keys(rows[0]), rows.map((r) => Object.values(r).map((v) => String(v)))) : '';
  const cues = cueSheetRows(plan);
  const cueSheetCsv = cues.length ? toCsv(Object.keys(cues[0]), cues.map((r) => Object.values(r).map((v) => String(v)))) : '';
  return { ...d, budget, review, shotList, shotListCsv, cueSheetCsv };
}
export type DirectedSceneBundle = ReturnType<typeof directedSceneBundle>;
