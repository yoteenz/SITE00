import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import { DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1, DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1 } from './featureDefinitionsV1.js';
import type { DesignWorkspaceFeatureManifest } from './types.js';

export const DESIGN_WORKSPACE_FEATURE_MANIFEST_V1_ID = 'design-workspace-feature-manifest-v1' as const;

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeFeatureManifestChecksum(manifest: Pick<DesignWorkspaceFeatureManifest, 'requiredFeatureIds' | 'version'>): string {
  return fnv1aHex(`${manifest.version}|${manifest.requiredFeatureIds.join(',')}`);
}

export function buildDesignWorkspaceFeatureManifestV1(now = new Date().toISOString()): DesignWorkspaceFeatureManifest {
  const requiredFeatureIds = [...DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1];
  const featureIds = DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1.map((f) => f.featureId);
  const version = DESIGN_WORKSPACE_FEATURE_MANIFEST_V1_ID;
  const manifest: DesignWorkspaceFeatureManifest = {
    id: `dwfm-${version}`,
    workspaceType: 'DESIGN_PAGE_V3',
    version,
    projectScope: DESIGN_PAGE_V3_PILOT_PROJECT_ID,
    featureIds,
    requiredFeatureIds,
    optionalFeatureIds: [],
    experimentalFeatureIds: [],
    deprecatedFeatureIds: [],
    removedFeatureIds: [],
    replacementMap: {},
    createdAt: now,
    updatedAt: now,
    parentManifestVersion: null,
    changeSetIds: ['wcs-r5f1-authority-selection-v1'],
    checksum: '',
    status: 'ACTIVE',
  };
  manifest.checksum = computeFeatureManifestChecksum(manifest);
  return manifest;
}

let cachedActive: DesignWorkspaceFeatureManifest | null = null;

export function loadActiveDesignWorkspaceFeatureManifest(): DesignWorkspaceFeatureManifest {
  if (!cachedActive) cachedActive = buildDesignWorkspaceFeatureManifestV1();
  return cachedActive;
}

export function getWorkspaceFeatureDefinition(featureId: string) {
  return DESIGN_WORKSPACE_FEATURE_DEFINITIONS_V1.find((f) => f.featureId === featureId) ?? null;
}
