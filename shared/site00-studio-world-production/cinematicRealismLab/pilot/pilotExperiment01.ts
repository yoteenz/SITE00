/**
 * Pilot experiment — LUXURY CREATOR REALISM TEST 01
 */

import { PILOT_CANONICAL_BRIEF, PILOT_EXPERIMENT_NAME } from '../constants.js';
import { createExperiment, createShotBrief } from '../experimentOrchestrator/orchestrator.js';
import { createReferenceItem, createReferencePack } from '../referencePacks/referencePack.js';
import type { RealismExperiment } from '../types.js';

export function buildPilotLuxuryCreatorRealismTest01(projectId: string): RealismExperiment {
  const brief = createShotBrief({
    shotType: 'LUXURY_CAR_SEATED',
    sceneDescription: PILOT_CANONICAL_BRIEF,
    wardrobe: 'Tailored neutral luxury — cashmere, subtle jewelry, natural makeup',
    environment: 'Luxury vehicle rear seat — golden-hour city transit, plausible reflections',
    cameraBehavior: 'Medium close 9:16 — subtle handheld, premium social reel',
    performanceBehavior: 'Calm confident speech — phone and tablet interaction grounded',
    voiceMode: 'ON_CAMERA_DIALOGUE',
    props: ['phone', 'tablet', 'designer bag'],
  });

  const referencePack = createReferencePack('Pilot benchmark references', [
    createReferenceItem({
      type: 'COMPOSITION',
      label: 'Luxury car seated composition reference',
      source: 'founder-benchmark-optional',
      role: 'composition authority',
      authorityLevel: 'HIGH',
    }),
    createReferenceItem({
      type: 'COLOR_LIGHTING',
      label: 'Golden hour interior lighting',
      source: 'realism-canon',
      role: 'lighting anchor',
      authorityLevel: 'MEDIUM',
    }),
    createReferenceItem({
      type: 'WARDROBE',
      label: 'Editorial founder wardrobe direction',
      source: 'project-adapter',
      role: 'styling continuity',
      authorityLevel: 'CONTINUITY_CRITICAL',
      continuityCritical: true,
    }),
  ]);

  return createExperiment({
    projectId,
    name: PILOT_EXPERIMENT_NAME,
    brief,
    referencePack,
    testType: 'MULTI_PROVIDER_SAME_BRIEF',
    selectedLanes: [
      'LANE_A_HIGGSFIELD',
      'LANE_B_MINIMAX',
      'LANE_C_KLING',
      'LANE_F_HYBRID_STILL_VIDEO',
    ],
  });
}
