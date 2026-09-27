/**
 * Project-scoped visual authority — promoted from an explicit founder action (not gallery tap alone).
 */

import type { PageConceptCgptCreativeBrief } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { WebExpressionTerritory } from './pageConceptWebExpressionTerritories.js';
import type { NdxBrandFamiliarityBrief } from './pageConceptNdxBrandFamiliarityBrief.js';
import { normalizeConceptArtifact } from './pageConceptConceptArtifactNormalization.js';

export const PROJECT_VISUAL_AUTHORITY_STORAGE_KEY = 'site00:project-visual-authority:v1';

export type ProjectVisualAuthorityStatus = 'PROMOTED' | 'SUPERSEDED';

export type ProjectVisualInheritanceLevel = 'LOCKED' | 'INHERITED' | 'ADAPTABLE' | 'PAGE_SPECIFIC';

export type ProjectVisualAuthorityRecord = {
  authorityId: string;
  projectId: string;
  version: number;
  status: ProjectVisualAuthorityStatus;
  sourcePageId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  sourceArtifactId: string;
  sourceViewport: 'MOBILE' | 'DESKTOP' | 'TABLET';
  promotedAt: string;
};

export type ProjectVisualAuthorityContract = {
  authorityId: string;
  projectId: string;
  version: number;
  sourcePageId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  sourceArtifactId: string;
  typographySystem: string;
  colorSystem: string;
  graphicLanguage: string;
  imageLanguage: string;
  materialSystem: string;
  compositionSystem: string;
  interactionCharacter: string;
  shellExpression: string;
  inheritanceRules: readonly { field: string; level: ProjectVisualInheritanceLevel }[];
  grammarOnlyNotice: string;
};

export type CrossProjectDesignFamilyReference = {
  sourceProjectId: string;
  targetProjectId: string;
  authorityVersion: number;
  explicitFounderActionId: string;
  createdAt: string;
};

export function compileProjectVisualAuthorityContract(input: {
  record: ProjectVisualAuthorityRecord;
  cgptBrief?: PageConceptCgptCreativeBrief | null;
  skinContract?: ProjectSkinContract | null;
  webTerritory?: WebExpressionTerritory | null;
  ndxBrief?: NdxBrandFamiliarityBrief | null;
}): ProjectVisualAuthorityContract {
  const brief = input.cgptBrief;
  const skin = input.skinContract;
  const territory = input.webTerritory;
  const ndx = input.ndxBrief;
  return {
    authorityId: input.record.authorityId,
    projectId: input.record.projectId,
    version: input.record.version,
    sourcePageId: input.record.sourcePageId,
    sourceConceptId: input.record.sourceConceptId,
    sourceTerritoryId: input.record.sourceTerritoryId,
    sourceArtifactId: input.record.sourceArtifactId,
    typographySystem: [
      brief?.mobileDirection?.slice(0, 120) ?? 'Display/body/mono hierarchy from promoted concept',
      skin ? `Display ${skin.typography.displayFont}; body ${skin.typography.bodyFont}` : '',
      'Capitalization + scale relationships LOCKED at project level',
    ]
      .filter(Boolean)
      .join(' · '),
    colorSystem: [
      skin?.palette.slice(0, 4).join(' / ') ?? 'Dominant/signal/neutral from promoted concept',
      territory?.colorExpressionSystem ?? 'Dynamic color-range behavior from territory',
    ].join(' · '),
    graphicLanguage: [
      ndx?.graphicDeviceLibrary?.deviceCategories?.slice(0, 3).join(' / ') ?? 'Signature devices from promoted concept',
      'Indexing + evidence treatment INHERITED',
    ].join(' · '),
    imageLanguage:
      ndx?.imageBehavior?.rules?.slice(0, 2).join(' ') ?? skin?.imagery.slice(0, 3).join(' / ') ?? 'Documentary integration',
    materialSystem: skin?.material.slice(0, 4).join(' / ') ?? 'Paper/ink/archival surfaces',
    compositionSystem: [
      brief?.distinctiveMove?.slice(0, 100) ?? 'Density + spacing rhythm from promoted concept',
      'Section transitions ADAPTABLE per page',
    ].join(' · '),
    interactionCharacter: 'Button/nav/active states from promoted shell — LOCKED',
    shellExpression: 'Project header, navigation, bottom nav visual treatment — INHERITED',
    inheritanceRules: [
      { field: 'DISPLAY_FONT', level: 'LOCKED' },
      { field: 'GRAPHIC_DEVICE_FAMILY', level: 'INHERITED' },
      { field: 'COMPOSITION', level: 'ADAPTABLE' },
      { field: 'CONTENT_LAYOUT', level: 'PAGE_SPECIFIC' },
    ],
    grammarOnlyNotice:
      'Inherit HOW this project designs — not Overview layout, content order, modules, copy, or imagery positions.',
  };
}

export function compileProjectVisualAuthorityPromptBlock(contract: ProjectVisualAuthorityContract): string {
  return [
    `PROJECT VISUAL AUTHORITY v${contract.version} (${contract.projectId.toUpperCase()})`,
    `Source: ${contract.sourcePageId} / concept ${contract.sourceConceptId}`,
    contract.grammarOnlyNotice,
    `TYPOGRAPHY: ${contract.typographySystem}`,
    `COLOR: ${contract.colorSystem}`,
    `GRAPHICS: ${contract.graphicLanguage}`,
    `IMAGERY: ${contract.imageLanguage}`,
    `MATERIALS: ${contract.materialSystem}`,
    `COMPOSITION: ${contract.compositionSystem}`,
    `INTERACTION: ${contract.interactionCharacter}`,
    `SHELL: ${contract.shellExpression}`,
    'Do NOT clone source page layout or content — apply grammar to this page function only.',
  ].join('\n');
}

export function compileOpusProjectVisualAuthorityBlock(contract: ProjectVisualAuthorityContract | null): string {
  if (!contract) return '';
  return [
    'OPUS PROJECT VISUAL AUTHORITY (design grammar — not page clone):',
    compileProjectVisualAuthorityPromptBlock(contract),
  ].join('\n');
}

export type ProjectVisualAuthorityRegistry = {
  byProject: Record<string, readonly ProjectVisualAuthorityRecord[]>;
  contracts: Record<string, ProjectVisualAuthorityContract>;
  crossProjectReferences: readonly CrossProjectDesignFamilyReference[];
};

export function emptyProjectVisualAuthorityRegistry(): ProjectVisualAuthorityRegistry {
  return { byProject: {}, contracts: {}, crossProjectReferences: [] };
}

export function getActiveProjectVisualAuthority(
  registry: ProjectVisualAuthorityRegistry,
  projectId: string,
): { record: ProjectVisualAuthorityRecord; contract: ProjectVisualAuthorityContract } | null {
  const rows = registry.byProject[projectId] ?? [];
  const active = [...rows].filter((r) => r.status === 'PROMOTED').sort((a, b) => b.version - a.version)[0];
  if (!active) return null;
  const contract = registry.contracts[active.authorityId];
  if (!contract) return null;
  return { record: active, contract };
}

export function resolveProjectVisualAuthorityForPage(input: {
  registry: ProjectVisualAuthorityRegistry;
  projectId: string;
  pageId: string;
  crossProjectRef?: CrossProjectDesignFamilyReference | null;
}): ProjectVisualAuthorityContract | null {
  if (input.crossProjectRef && input.crossProjectRef.targetProjectId === input.projectId) {
    const source = getActiveProjectVisualAuthority(input.registry, input.crossProjectRef.sourceProjectId);
    return source?.contract ?? null;
  }
  const active = getActiveProjectVisualAuthority(input.registry, input.projectId);
  if (!active) return null;
  if (active.record.sourcePageId === input.pageId) return active.contract;
  return active.contract;
}

export function promoteProjectVisualAuthority(input: {
  registry: ProjectVisualAuthorityRegistry;
  projectId: string;
  sourcePageId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  sourceArtifactId: string;
  sourceViewport: 'MOBILE' | 'DESKTOP' | 'TABLET';
  artifactWidth: number;
  artifactHeight: number;
  artifactStatus: string;
  compile: Omit<Parameters<typeof compileProjectVisualAuthorityContract>[0], 'record'>;
}): { registry: ProjectVisualAuthorityRegistry; record: ProjectVisualAuthorityRecord; contract: ProjectVisualAuthorityContract } {
  const normalized = normalizeConceptArtifact({
    width: input.artifactWidth,
    height: input.artifactHeight,
    artifactStatus: input.artifactStatus,
    sanitationApplied: true,
  });
  if (!normalized.ok) {
    throw new Error(normalized.reason ?? 'CONCEPT_CANVAS_INVALID');
  }

  const prior = input.registry.byProject[input.projectId] ?? [];
  const nextVersion = prior.reduce((max, r) => Math.max(max, r.version), 0) + 1;
  const authorityId = `${input.projectId}:pva-v${nextVersion}`;
  const superseded = prior.map((r) =>
    r.status === 'PROMOTED' ? { ...r, status: 'SUPERSEDED' as const } : r,
  );
  const record: ProjectVisualAuthorityRecord = {
    authorityId,
    projectId: input.projectId,
    version: nextVersion,
    status: 'PROMOTED',
    sourcePageId: input.sourcePageId,
    sourceConceptId: input.sourceConceptId,
    sourceTerritoryId: input.sourceTerritoryId,
    sourceArtifactId: input.sourceArtifactId,
    sourceViewport: input.sourceViewport,
    promotedAt: new Date().toISOString(),
  };
  const contract = compileProjectVisualAuthorityContract({ record, ...input.compile });
  return {
    registry: {
      ...input.registry,
      byProject: { ...input.registry.byProject, [input.projectId]: [...superseded, record] },
      contracts: { ...input.registry.contracts, [authorityId]: contract },
    },
    record,
    contract,
  };
}

export function loadProjectVisualAuthorityRegistry(): ProjectVisualAuthorityRegistry {
  if (typeof localStorage === 'undefined') return emptyProjectVisualAuthorityRegistry();
  try {
    const raw = localStorage.getItem(PROJECT_VISUAL_AUTHORITY_STORAGE_KEY);
    if (!raw) return emptyProjectVisualAuthorityRegistry();
    const parsed = JSON.parse(raw) as ProjectVisualAuthorityRegistry;
    return {
      byProject: parsed.byProject ?? {},
      contracts: parsed.contracts ?? {},
      crossProjectReferences: parsed.crossProjectReferences ?? [],
    };
  } catch {
    return emptyProjectVisualAuthorityRegistry();
  }
}

export function saveProjectVisualAuthorityRegistry(registry: ProjectVisualAuthorityRegistry): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROJECT_VISUAL_AUTHORITY_STORAGE_KEY, JSON.stringify(registry));
}

export function createExplicitCrossProjectDesignFamilyReference(input: {
  registry: ProjectVisualAuthorityRegistry;
  sourceProjectId: string;
  targetProjectId: string;
  founderActionId: string;
}): ProjectVisualAuthorityRegistry {
  const source = getActiveProjectVisualAuthority(input.registry, input.sourceProjectId);
  if (!source) throw new Error('NO_SOURCE_PROJECT_VISUAL_AUTHORITY');
  const ref: CrossProjectDesignFamilyReference = {
    sourceProjectId: input.sourceProjectId,
    targetProjectId: input.targetProjectId,
    authorityVersion: source.record.version,
    explicitFounderActionId: input.founderActionId,
    createdAt: new Date().toISOString(),
  };
  return {
    ...input.registry,
    crossProjectReferences: [...input.registry.crossProjectReferences, ref],
  };
}
