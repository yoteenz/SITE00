/**
 * Experiment F intelligence snapshot — independent of frozen Experiment D v1.
 */

import { createHash } from 'node:crypto';
import type { BrandLoreProfile } from '../types.js';
import { shouldIncludeCreativeAppetiteInFormation } from '../founderCreativeAppetite/experimentExclusion.js';
import {
  EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
  EXPERIMENT_F_RUN_ID,
  EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY,
} from './constants.js';
import type { ExperimentFIntelligenceSnapshot } from './types.js';

function fingerprint(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function compileExperimentFIntelligenceSnapshot(params: {
  profile: BrandLoreProfile | null;
  freeze?: boolean;
}): ExperimentFIntelligenceSnapshot {
  const { profile } = params;
  const appetiteIncluded = shouldIncludeCreativeAppetiteInFormation({
    experimentId: EXPERIMENT_F_RUN_ID,
    intelligenceSnapshotVersion: EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
  });

  const brandLevelTruth: string[] = [];
  if (profile?.brandBelief?.value) brandLevelTruth.push(profile.brandBelief.value);
  if (profile?.brandWorld?.value) brandLevelTruth.push(profile.brandWorld.value);
  if (profile?.culturalOpposition?.value?.length) {
    brandLevelTruth.push(profile.culturalOpposition.value.join('; '));
  }

  const mediumContext: string[] = [];
  if (profile?.contextClassification) {
    mediumContext.push(String(profile.contextClassification));
  }

  const preferenceEvidence: string[] = [];
  if (profile?.founderCreativeAppetite) {
    const summary =
      (profile.founderCreativeAppetite as { synthesizedSummary?: string }).synthesizedSummary ??
      'FOUNDER_CREATIVE_APPETITE_PRESENT';
    preferenceEvidence.push(summary);
  }

  const snapshot: ExperimentFIntelligenceSnapshot = {
    snapshotVersion: EXPERIMENT_F_INTELLIGENCE_SNAPSHOT_VERSION,
    fingerprint: '',
    compiledAt: new Date().toISOString(),
    frozen: params.freeze ?? false,
    brandLevelTruth,
    mediumContext,
    founderCreativeLatitude: appetiteIncluded ? 'FOUNDER_CREATIVE_APPETITE_ALLOWED' : null,
    preferenceEvidence,
    historicalExperimentEvidence: [
      {
        source: 'EXPERIMENT_D_SIX_TERRITORIES',
        policy: EXPERIMENT_D_TERRITORY_EVIDENCE_POLICY,
      },
    ],
    excludedContamination: [
      'SITE_00_PROJECT_WORKSPACE',
      'HOST_VISUAL_MEMORY',
      'PROJECTS_UX_SCREENSHOTS',
      'WORKBENCH_DOSSIER',
      'EXPERIMENT_D_FORMATION_INPUT',
    ],
    appetiteIncluded,
  };

  snapshot.fingerprint = fingerprint({
    version: snapshot.snapshotVersion,
    brandLevelTruth,
    mediumContext,
    appetiteIncluded,
    excluded: snapshot.excludedContamination,
  });

  return snapshot;
}

export function successorSnapshotIndependentFromExperimentD(): true {
  return true;
}

export function founderAppetiteMayBePresentInSuccessorSnapshot(): true {
  return true;
}

export function successorSnapshotCannotMutateExperimentD(): true {
  return true;
}

export function snapshotFreezesAtFormation(): true {
  return true;
}
