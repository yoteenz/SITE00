/**
 * P0.5E.2 — NDX Motion Character integration / run builder.
 */

import { NDXBOOK_MOTION_CHARACTER_RUN_ID } from '../ndxBookCulturalLanguage/constants.js';
import { buildNdxAudienceBookBehaviors } from '../ndxBookCulturalLanguage/audienceBookBehavior.js';
import { buildNdxBookCulturalLanguageSystem } from '../ndxBookCulturalLanguage/culturalLanguageSystem.js';
import { buildNdxContentOntology } from '../ndxBookCulturalLanguage/contentOntology.js';
import { buildCrossSurfaceBookProgression } from '../ndxBookCulturalLanguage/crossSurfaceBookProgression.js';
import { getTerminologyForensic } from '../ndxBookCulturalLanguage/terminologyForensic.js';
import type { NdxMotionCharacterBookLanguageRun } from '../ndxBookCulturalLanguage/types.js';
import { buildHumanMotionTraceSystem } from '../../site00-studio-world-production/motionCharacter/humanMotionTrace.js';
import { evaluatePhysicalBookPresence } from '../../site00-studio-world-production/motionCharacter/physicalBookBehavior.js';
import { buildEmbodiedBrandCharacterFoundation } from './embodiedBrandCharacterFoundation.js';
import { buildEmbodiedCharacterDiscoveryReadiness } from './embodiedCharacterDiscoveryReadiness.js';
import {
  buildNdxMotionBehaviorLibrary,
  buildNdxMotionCharacterSystem,
  buildNdxMotionThesis,
} from './motionThesisAndBehaviors.js';
import { getNdxPlatformMotionBehaviors } from './platformMotionBehavior.js';

function nowIso(): string {
  return new Date().toISOString();
}

export function buildNdxMotionCharacterBookLanguageRun(projectId: string): NdxMotionCharacterBookLanguageRun {
  const motionSystem = buildNdxMotionCharacterSystem(projectId);
  const humanTraces = buildHumanMotionTraceSystem();
  const physicalBookSample = evaluatePhysicalBookPresence({
    motionMode: 'PAGE_IN_PROGRESS',
    platform: 'REEL',
  });

  return {
    runId: NDXBOOK_MOTION_CHARACTER_RUN_ID,
    projectId,
    culturalLanguage: buildNdxBookCulturalLanguageSystem(projectId),
    terminologyForensic: getTerminologyForensic(),
    contentOntology: buildNdxContentOntology(projectId),
    audienceBehaviors: buildNdxAudienceBookBehaviors(),
    crossSurfaceProgression: buildCrossSurfaceBookProgression(),
    motionThesis: buildNdxMotionThesis(),
    motionBehaviors: buildNdxMotionBehaviorLibrary(),
    platformBehaviors: getNdxPlatformMotionBehaviors(),
    embodiedCharacterFoundation: {
      ...buildEmbodiedBrandCharacterFoundation(projectId),
      motionSystemId: motionSystem.systemId,
      humanMotionTraceCount: humanTraces.traces.length,
      physicalBookPresenceSample: physicalBookSample,
      brandCharacterNotEqualEmbodiedCharacter: true,
      visualExpressionNotEqualMotionBehavior: true,
    },
    embodiedCharacterDiscoveryReadiness: buildEmbodiedCharacterDiscoveryReadiness(),
    updatedAt: nowIso(),
  };
}

export { buildNdxMotionCharacterSystem, buildNdxMotionThesis, buildNdxMotionBehaviorLibrary };
export { getNdxPlatformMotionBehaviors };
export { buildEmbodiedBrandCharacterFoundation, buildEmbodiedCharacterDiscoveryReadiness };
export { buildHumanMotionTraceSystem };
