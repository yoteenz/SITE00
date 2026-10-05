/**
 * P0.EXPERIENCE.MODULE-WIRING1 — fixture bundles (isolated from production Supabase).
 */

import { buildDefaultPipelineRows } from './pipelineModel.js';
import type {
  ExperienceActivityEvent,
  ExperienceAsset,
  ExperienceBuild,
  ExperienceCharacter,
  ExperienceMechanic,
  ExperienceRecord,
  ExperienceScene,
  ExperienceToolPlan,
  ExperienceTask,
  ExperienceWorkspaceBundle,
} from './types.js';

const NOW = '2026-05-18T12:00:00.000Z';

export const BUILD_A_WIG_EXPERIENCE_ID = 'exp-baw-frontal-slayer';
export const ASTREA_EXPERIENCE_ID = 'exp-astrea-astral-world';

const buildAWigExperience: ExperienceRecord = {
  experienceId: BUILD_A_WIG_EXPERIENCE_ID,
  projectId: 'frontal-slayer',
  slug: 'build-a-wig',
  name: 'BUILD-A-WIG',
  description: 'Hair configurator vertical slice (NOIR)',
  type: 'CONFIGURATOR',
  status: 'ACTIVE',
  primaryRuntime: 'Unreal Engine 5',
  currentBuildId: 'build-baw-v01',
  primarySceneId: 'scene-fs-atelier',
  primaryCharacterId: 'char-fs-mannequin',
  currentMilestone: 'NOIR vertical slice',
  createdAt: NOW,
  updatedAt: NOW,
  createdBy: 'founder',
};

const astreaExperience: ExperienceRecord = {
  experienceId: ASTREA_EXPERIENCE_ID,
  projectId: 'astral-world',
  slug: 'astrea',
  name: 'ASTRÉA',
  description: 'Astral World social destination hub',
  type: 'WORLD',
  status: 'PLANNING',
  primaryRuntime: 'Unreal Engine 5',
  currentBuildId: null,
  primarySceneId: 'scene-threshold',
  primaryCharacterId: null,
  currentMilestone: 'Threshold blockout',
  createdAt: NOW,
  updatedAt: NOW,
  createdBy: 'founder',
};

const FIXTURE_EXPERIENCES: ExperienceRecord[] = [buildAWigExperience, astreaExperience];

const FIXTURE_SCENES: ExperienceScene[] = [
  {
    sceneId: 'scene-fs-atelier',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    parentSceneId: null,
    name: 'FS ATELIER',
    slug: 'fs-atelier',
    description: 'Primary configurator stage',
    sceneType: 'STUDIO',
    runtimePath: '/Game/FS/Atelier/FS_Atelier',
    thumbnailAssetId: null,
    currentCaptureId: 'asset-baw-capture-current',
    targetReferenceId: 'asset-baw-ref-noir',
    status: 'IN_PRODUCTION',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    sceneId: 'scene-threshold',
    experienceId: ASTREA_EXPERIENCE_ID,
    parentSceneId: null,
    name: 'THRESHOLD',
    slug: 'threshold',
    description: 'Entry portal space',
    sceneType: 'HUB',
    runtimePath: null,
    thumbnailAssetId: null,
    currentCaptureId: null,
    targetReferenceId: null,
    status: 'PLANNING',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    sceneId: 'scene-tarot-suite',
    experienceId: ASTREA_EXPERIENCE_ID,
    parentSceneId: 'scene-threshold',
    name: 'TAROT SUITE',
    slug: 'tarot-suite',
    description: 'Tarot reading rooms',
    sceneType: 'DESTINATION',
    runtimePath: null,
    thumbnailAssetId: null,
    currentCaptureId: null,
    targetReferenceId: null,
    status: 'IDEA',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    sceneId: 'scene-coffee-shop',
    experienceId: ASTREA_EXPERIENCE_ID,
    parentSceneId: 'scene-threshold',
    name: 'COFFEE SHOP',
    slug: 'coffee-shop',
    description: 'Social lounge',
    sceneType: 'DESTINATION',
    runtimePath: null,
    thumbnailAssetId: null,
    currentCaptureId: null,
    targetReferenceId: null,
    status: 'IDEA',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    sceneId: 'scene-astral-mall',
    experienceId: ASTREA_EXPERIENCE_ID,
    parentSceneId: 'scene-threshold',
    name: 'ASTRAL MALL',
    slug: 'astral-mall',
    description: 'Commerce corridor',
    sceneType: 'DESTINATION',
    runtimePath: null,
    thumbnailAssetId: null,
    currentCaptureId: null,
    targetReferenceId: null,
    status: 'IDEA',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_CHARACTERS: ExperienceCharacter[] = [
  {
    characterId: 'char-fs-mannequin',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    name: 'FS MANNEQUIN',
    characterType: 'MANNEQUIN',
    sourceAssetId: null,
    primaryDccTool: 'maya',
    runtimeAssetPath: '/Game/FS/Characters/FS_Mannequin',
    thumbnailAssetId: null,
    status: 'IN_PRODUCTION',
    metadata: { mesh: true, rig: true, groom: true, scalp: true },
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_ASSETS: ExperienceAsset[] = [
  {
    assetId: 'asset-baw-capture-current',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    sceneId: 'scene-fs-atelier',
    characterId: 'char-fs-mannequin',
    name: 'Current build v0.1 capture',
    assetType: 'BUILD_CAPTURE',
    sourceTool: 'unreal',
    sourcePath: null,
    runtimePath: null,
    status: 'STAGED',
    version: '0.1.0',
    parentVersionId: null,
    thumbnail: null,
    metadata: { label: 'CURRENT BUILD' },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    assetId: 'asset-baw-ref-noir',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    sceneId: 'scene-fs-atelier',
    characterId: 'char-fs-mannequin',
    name: 'NOIR STRAIGHT v1.0 reference',
    assetType: 'REFERENCE',
    sourceTool: 'arnold',
    sourcePath: null,
    runtimePath: null,
    status: 'REVIEW',
    version: '1.0.0',
    parentVersionId: null,
    thumbnail: null,
    metadata: { label: 'TARGET REFERENCE' },
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_MECHANICS: ExperienceMechanic[] = [
  {
    mechanicId: 'mech-baw-rotate',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    category: 'CAMERA',
    name: 'Rotate mannequin',
    description: 'Orbit camera around mannequin',
    status: 'READY',
    runtimeBinding: null,
    dependencies: [],
    testState: 'UNTESTED',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    mechanicId: 'mech-baw-zoom',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    category: 'CAMERA',
    name: 'Zoom',
    description: 'Zoom camera',
    status: 'READY',
    runtimeBinding: null,
    dependencies: [],
    testState: 'UNTESTED',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    mechanicId: 'mech-baw-color',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    category: 'HAIR',
    name: 'Change color / material',
    description: 'NOIR material variant',
    status: 'IN_PROGRESS',
    runtimeBinding: null,
    dependencies: ['mech-baw-texture'],
    testState: 'BLOCKED',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    mechanicId: 'mech-astrea-nav',
    experienceId: ASTREA_EXPERIENCE_ID,
    category: 'NAVIGATION',
    name: 'Portal navigation',
    description: 'Move between destinations',
    status: 'NOT_STARTED',
    runtimeBinding: null,
    dependencies: [],
    testState: 'UNTESTED',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_BUILDS: ExperienceBuild[] = [
  {
    buildId: 'build-baw-v01',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    version: 'v0.1 PROTOTYPE',
    runtime: 'Unreal Engine 5',
    runtimeVersion: '5.4',
    sourceRevision: null,
    targetPlatform: 'DESKTOP',
    status: 'READY',
    buildPath: null,
    captureAssetId: 'asset-baw-capture-current',
    notes: 'Vertical slice prototype — not release candidate',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_ACTIVITY: ExperienceActivityEvent[] = [
  {
    eventId: 'evt-1',
    projectId: 'frontal-slayer',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    kind: 'experience_build_ready',
    summary: 'Build v0.1 deployed',
    at: '2026-05-18T10:00:00.000Z',
  },
  {
    eventId: 'evt-2',
    projectId: 'frontal-slayer',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    kind: 'experience_asset_added',
    summary: 'Material updated',
    at: '2026-05-17T15:00:00.000Z',
  },
  {
    eventId: 'evt-3',
    projectId: 'frontal-slayer',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    kind: 'experience_scene_updated',
    summary: 'Scene lighting updated',
    at: '2026-05-16T09:00:00.000Z',
  },
];

const FIXTURE_TOOL_PLANS: ExperienceToolPlan[] = [
  {
    toolPlanId: 'tp-baw-groom',
    experienceId: BUILD_A_WIG_EXPERIENCE_ID,
    taskType: 'CREATE NOIR STRAIGHT GROOM',
    inputAssets: [],
    approvedReferences: ['asset-baw-ref-noir'],
    selectedTools: ['maya', 'xgen', 'substance_painter', 'photoshop', 'unreal', 'arnold'],
    expectedOutputs: ['GROOM', 'MATERIAL'],
    writeLocations: [],
    status: 'DRAFT',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const FIXTURE_TASKS: ExperienceTask[] = [];

function pipelineForExperience(experienceId: string) {
  const exp = FIXTURE_EXPERIENCES.find((e) => e.experienceId === experienceId);
  if (!exp) return buildDefaultPipelineRows('APP');
  if (experienceId === BUILD_A_WIG_EXPERIENCE_ID) {
    return buildDefaultPipelineRows(exp.type, {
      source: 'COMPLETE',
      scene_assembly: 'COMPLETE',
      asset_production: 'IN_PROGRESS',
      mechanics: 'NOT_STARTED',
      runtime: 'NOT_STARTED',
      experience_review: 'NOT_STARTED',
      release: 'NOT_STARTED',
    });
  }
  return buildDefaultPipelineRows(exp.type);
}

export function listFixtureExperiencesForProject(projectId: string): ExperienceRecord[] {
  const slug = projectId.toLowerCase();
  return FIXTURE_EXPERIENCES.filter((e) => e.projectId === slug);
}

export function getFixtureExperienceBySlug(
  projectId: string,
  experienceSlug: string,
): ExperienceRecord | null {
  const slug = experienceSlug.toLowerCase();
  return (
    FIXTURE_EXPERIENCES.find((e) => e.projectId === projectId.toLowerCase() && e.slug === slug) ??
    null
  );
}

export function getFixtureExperienceBundle(
  projectId: string,
  experienceSlug: string,
): ExperienceWorkspaceBundle | null {
  const experience = getFixtureExperienceBySlug(projectId, experienceSlug);
  if (!experience) return null;
  const { experienceId } = experience;
  return {
    projectId: projectId.toLowerCase(),
    experiences: listFixtureExperiencesForProject(projectId),
    scenes: FIXTURE_SCENES.filter((s) => s.experienceId === experienceId),
    characters: FIXTURE_CHARACTERS.filter((c) => c.experienceId === experienceId),
    assets: FIXTURE_ASSETS.filter((a) => a.experienceId === experienceId),
    mechanics: FIXTURE_MECHANICS.filter((m) => m.experienceId === experienceId),
    builds: FIXTURE_BUILDS.filter((b) => b.experienceId === experienceId),
    toolPlans: FIXTURE_TOOL_PLANS.filter((t) => t.experienceId === experienceId),
    tasks: FIXTURE_TASKS.filter((t) => t.experienceId === experienceId),
    activity: FIXTURE_ACTIVITY.filter((a) => a.experienceId === experienceId),
    pipeline: pipelineForExperience(experienceId),
  };
}

export function listAllFixtureExperienceSlugs(): string[] {
  return FIXTURE_EXPERIENCES.map((e) => e.slug);
}
