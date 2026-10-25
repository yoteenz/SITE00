import type { SceneGateResult } from '../gate.js';
import type { GenerationJobRecord, ProviderExecution, ProviderRef, ShotRecord } from '../types.js';
import type { ProjectSpineRefs } from '../workspace.js';
import { EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, exchangeProviderRefs, exchangeRefs, exchangeSceneGate } from './theExchange.js';

/** Projects whose production runs on the record spine, with where their pilot records live (repository-relative). */
export type SpineProject = {
  projectId: string;
  recordsDir: string;
  refs(root: string, providers: ProviderRef[]): ProjectSpineRefs;
  sceneGate(root: string): (job: GenerationJobRecord, shot: ShotRecord) => SceneGateResult;
  routeIds: readonly string[];
  providers(execution: (routeId: string) => { execution: ProviderExecution; reason: string; transportId: string }): ProviderRef[];
};

export const SPINE_PROJECTS: Readonly<Record<string, SpineProject>> = {
  [EXCHANGE_PROJECT_ID]: { projectId: EXCHANGE_PROJECT_ID, recordsDir: EXCHANGE_RECORDS_DIR, refs: exchangeRefs, sceneGate: exchangeSceneGate, routeIds: ['OA-NBP-I2I-2K-REF', 'OA-K3O-I2V-PRO'], providers: exchangeProviderRefs },
};

export const spineProject = (projectId: string): SpineProject | null => SPINE_PROJECTS[projectId.toLowerCase()] ?? null;
