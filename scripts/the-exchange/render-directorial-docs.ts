import fs from 'node:fs';
import * as X from '../../shared/site00-fiction-production/index.js';
import { assetReconciliationDoc, futureDependenciesDoc } from './directorial-docs/assetDocs.js';
import { musicDoc, soundDoc, syncDoc } from './directorial-docs/audioDocs.js';
import { budgetDoc, routingDoc } from './directorial-docs/costDocs.js';
import { engineDoc, motionDoc, reviewWorkflowDoc } from './directorial-docs/engineDocs.js';
import { COPIED_DELIVERABLES, writeDoc } from './directorial-docs/md.js';
import { packetDoc, type Packet } from './directorial-docs/packetDoc.js';
import { founderReviewDoc } from './directorial-docs/reviewPackage.js';
import { screenplayPlanDoc } from './directorial-docs/seasonDocs.js';

/** Renders the directorial production engine V2 deliverables from committed data. Deterministic; run after build-directorial-production.ts. */
const root = process.cwd();
const P = X.EXCHANGE_PATHS;
const D = X.Directorial;
const read = (rel: string) => fs.readFileSync(X.repoPath(rel, root), 'utf8');
const json = <T>(rel: string) => JSON.parse(read(rel)) as T;
const UNIT = 'S1-01';
const scene = (f: keyof typeof X.SCENE_FILES) => X.scenePath(UNIT, X.SCENE_FILES[f]);

const plan = X.S1_01_PLAN;
const packet = json<Packet>(scene('packet'));
const index = json<X.SceneIndex>(`${P.season}/SEASON1_SCENE_INDEX_V1.json`);
const cast = json<X.CastRegistry & { findings: X.CastFinding[] }>(X.CAST_REGISTRY_PATH);

for (const [name, from] of Object.entries(COPIED_DELIVERABLES)) writeDoc(root, name, read(from));

writeDoc(root, '10_SECOND_BY_SECOND_TIMELINE_SCHEMA.json', X.serializeJson(D.TIMELINE_EVENT_SCHEMA));
writeDoc(root, '11_MULTITRACK_EDITING_SCHEMA.json', X.serializeJson(D.MULTITRACK_SCHEMA));
writeDoc(root, '12_CAMERA_AND_KEYFRAME_DIRECTION_SCHEMA.json', X.serializeJson(D.CAMERA_KEYFRAME_SCHEMA));
writeDoc(root, '13_CHARACTER_PERFORMANCE_DIRECTION_SCHEMA.json', X.serializeJson({ ...D.PERFORMANCE_SCHEMA, baselines: D.PERFORMANCE_BASELINES, globalAvoid: D.PERFORMANCE_GLOBAL_AVOID }));
writeDoc(
  root,
  '20_S1-01_DUSK_TIMECODED_TIMELINE.json',
  X.serializeJson({ sources: [scene('timeline'), scene('multitrack')], timeline: json(scene('timeline')), multitrack: json(scene('multitrack')) }),
);

writeDoc(root, '00_FOUNDER_REVIEW_S1-01_DUSK.md', founderReviewDoc(packet, index));
writeDoc(root, '03_VISUAL_ASSET_RECONCILIATION.md', assetReconciliationDoc(cast, X.loadAssetRegistry(root), plan));
writeDoc(root, '07_SCREENPLAY_DEVELOPMENT_AND_CONTINUITY_PLAN.md', screenplayPlanDoc(index, json(P.continuityReport)));
writeDoc(root, '08_DIRECTORIAL_INTELLIGENCE_ENGINE.md', engineDoc(X.S1_01_DIRECTION));
writeDoc(root, '09_MOTION_WEIGHTED_SHOT_PLANNER.md', motionDoc(plan));
writeDoc(root, '14_MUSIC_SUPERVISION_SYSTEM.md', musicDoc(plan));
writeDoc(root, '15_SONIC_ATMOSPHERE_AND_SOUND_DESIGN_SYSTEM.md', soundDoc(plan));
writeDoc(root, '16_AUDIO_VISUAL_SYNCHRONIZATION_SYSTEM.md', syncDoc(plan));
writeDoc(root, '17_PROVIDER_ROUTING_AND_COST_SYSTEM.md', routingDoc(json(D.QUOTES_V2_PATH)));
writeDoc(root, '18_FOUNDER_SCENE_REVIEW_WORKFLOW.md', reviewWorkflowDoc(plan, json(scene('review')), X.S1_01_REVIEW_EXTRAS, json(`${P.season}/ACTIVE_PRODUCTION_V1.json`)));
writeDoc(root, '19_S1-01_DUSK_COMPLETE_DIRECTORIAL_PACKET.md', packetDoc(packet));
writeDoc(root, '24_S1-01_DUSK_PRODUCTION_BUDGET.md', budgetDoc(json(scene('budget')), plan));
writeDoc(root, '25_SEASON1_FUTURE_PRODUCTION_DEPENDENCIES.md', futureDependenciesDoc(json(`${P.season}/FUTURE_PRODUCTION_DEPENDENCIES_V1.json`)));
