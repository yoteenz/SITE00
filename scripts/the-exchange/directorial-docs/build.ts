import fs from 'node:fs';
import * as X from '../../../shared/site00-fiction-production/index.js';
import { assetReconciliationDoc, futureDependenciesDoc } from './assetDocs.js';
import { musicDoc, soundDoc, syncDoc } from './audioDocs.js';
import { budgetDoc, routingDoc } from './costDocs.js';
import { engineDoc, motionDoc, reviewWorkflowDoc } from './engineDocs.js';
import { COPIED_DELIVERABLES } from './md.js';
import { packetDoc, type Packet } from './packetDoc.js';
import { founderReviewDoc } from './reviewPackage.js';
import { screenplayPlanDoc } from './seasonDocs.js';

const UNIT = 'S1-01';

/** Every generated directorial engine V2 deliverable, keyed by file name, from committed data. Deterministic. */
export function buildDirectorialDocs(root: string): Record<string, string> {
  const P = X.EXCHANGE_PATHS;
  const D = X.Directorial;
  const read = (rel: string) => fs.readFileSync(X.repoPath(rel, root), 'utf8');
  const json = <T>(rel: string) => JSON.parse(read(rel)) as T;
  const scene = (f: keyof typeof X.SCENE_FILES) => X.scenePath(UNIT, X.SCENE_FILES[f]);
  const plan = X.S1_01_PLAN;
  const packet = json<Packet>(scene('packet'));
  const index = json<X.SceneIndex>(`${P.season}/SEASON1_SCENE_INDEX_V1.json`);
  const cast = json<X.CastRegistry & { findings: X.CastFinding[] }>(X.CAST_REGISTRY_PATH);

  const files: Record<string, string> = {};
  for (const [name, from] of Object.entries(COPIED_DELIVERABLES)) files[name] = read(from);
  Object.assign(files, {
    '10_SECOND_BY_SECOND_TIMELINE_SCHEMA.json': X.serializeJson(D.TIMELINE_EVENT_SCHEMA),
    '11_MULTITRACK_EDITING_SCHEMA.json': X.serializeJson(D.MULTITRACK_SCHEMA),
    '12_CAMERA_AND_KEYFRAME_DIRECTION_SCHEMA.json': X.serializeJson(D.CAMERA_KEYFRAME_SCHEMA),
    '13_CHARACTER_PERFORMANCE_DIRECTION_SCHEMA.json': X.serializeJson({ ...D.PERFORMANCE_SCHEMA, baselines: D.PERFORMANCE_BASELINES, globalAvoid: D.PERFORMANCE_GLOBAL_AVOID }),
    '20_S1-01_DUSK_TIMECODED_TIMELINE.json': X.serializeJson({ sources: [scene('timeline'), scene('multitrack')], timeline: json(scene('timeline')), multitrack: json(scene('multitrack')) }),
    '00_FOUNDER_REVIEW_S1-01_DUSK.md': founderReviewDoc(packet, index),
    '03_VISUAL_ASSET_RECONCILIATION.md': assetReconciliationDoc(cast, X.loadAssetRegistry(root), plan),
    '07_SCREENPLAY_DEVELOPMENT_AND_CONTINUITY_PLAN.md': screenplayPlanDoc(index, json(P.continuityReport)),
    '08_DIRECTORIAL_INTELLIGENCE_ENGINE.md': engineDoc(X.S1_01_DIRECTION),
    '09_MOTION_WEIGHTED_SHOT_PLANNER.md': motionDoc(plan),
    '14_MUSIC_SUPERVISION_SYSTEM.md': musicDoc(plan),
    '15_SONIC_ATMOSPHERE_AND_SOUND_DESIGN_SYSTEM.md': soundDoc(plan),
    '16_AUDIO_VISUAL_SYNCHRONIZATION_SYSTEM.md': syncDoc(plan),
    '17_PROVIDER_ROUTING_AND_COST_SYSTEM.md': routingDoc(json(D.QUOTES_V2_PATH)),
    '18_FOUNDER_SCENE_REVIEW_WORKFLOW.md': reviewWorkflowDoc(plan, json(scene('review')), X.S1_01_REVIEW_EXTRAS, json(`${P.season}/ACTIVE_PRODUCTION_V1.json`)),
    '19_S1-01_DUSK_COMPLETE_DIRECTORIAL_PACKET.md': packetDoc(packet),
    '24_S1-01_DUSK_PRODUCTION_BUDGET.md': budgetDoc(json(scene('budget')), plan),
    '25_SEASON1_FUTURE_PRODUCTION_DEPENDENCIES.md': futureDependenciesDoc(json(`${P.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`)),
  });
  for (const [name, body] of Object.entries(files)) if (!body.endsWith('\n')) files[name] = `${body}\n`;
  return files;
}
