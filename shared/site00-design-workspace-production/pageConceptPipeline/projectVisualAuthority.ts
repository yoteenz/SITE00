/**
 * SITE 00 × project expression authority (Projects environment fusion — not standalone brand website).
 */

import type { PageConceptCgptCreativeBrief } from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import type { WebExpressionTerritory } from './pageConceptWebExpressionTerritories.js';
import type { NdxBrandFamiliarityBrief } from './pageConceptNdxBrandFamiliarityBrief.js';
import { normalizeConceptArtifact } from './pageConceptConceptArtifactNormalization.js';
import {
  SITE00_HOST_PRODUCT,
  SITE00_PROJECTS_CONTEXT,
  type DesignTargetDescriptor,
  type Site00AuthorityScope,
  validateAuthorityScopeForTarget,
  validateProjectExpressionInheritance,
  compileComposerScopeGuardBlock,
  compileOpusScopeHandoffBlock,
  compileSite00HostAuthorityPromptStub,
  classifyDesignTargetForPageConcept,
} from './site00AuthorityScope.js';

/** @deprecated use SITE00_PROJECT_EXPRESSION_AUTHORITY_STORAGE_KEY */
export const PROJECT_VISUAL_AUTHORITY_STORAGE_KEY = 'site00:project-visual-authority:v1';

export const SITE00_PROJECT_EXPRESSION_AUTHORITY_STORAGE_KEY =
  'site00:project-expression-authority:v1';

export type Site00ProjectExpressionAuthorityStatus = 'PROMOTED' | 'SUPERSEDED';

export type ProjectVisualInheritanceLevel = 'LOCKED' | 'INHERITED' | 'ADAPTABLE' | 'PAGE_SPECIFIC';

export type Site00ProjectExpressionAuthorityRecord = {
  authorityId: string;
  projectId: string;
  hostProduct: typeof SITE00_HOST_PRODUCT;
  context: typeof SITE00_PROJECTS_CONTEXT;
  authorityScope: Extract<Site00AuthorityScope, 'SITE00_PROJECT_CONTEXT'>;
  version: number;
  status: Site00ProjectExpressionAuthorityStatus;
  sourcePageId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  sourceArtifactId: string;
  sourceViewport: 'MOBILE' | 'DESKTOP' | 'TABLET';
  sourceViewportFamilyId: string | null;
  promotedAt: string;
};

export type Site00ProjectExpressionAuthorityContract = {
  authorityId: string;
  projectId: string;
  hostProduct: typeof SITE00_HOST_PRODUCT;
  context: typeof SITE00_PROJECTS_CONTEXT;
  authorityScope: Extract<Site00AuthorityScope, 'SITE00_PROJECT_CONTEXT'>;
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
  fusionNotice: string;
};

/** @deprecated alias */
export type ProjectVisualAuthorityStatus = Site00ProjectExpressionAuthorityStatus;
/** @deprecated alias */
export type ProjectVisualAuthorityRecord = Site00ProjectExpressionAuthorityRecord;
/** @deprecated alias */
export type ProjectVisualAuthorityContract = Site00ProjectExpressionAuthorityContract;

export type CrossContextDesignReference = {
  sourceProjectId: string;
  targetProjectId: string;
  targetContext: 'STANDALONE_WEBSITE' | 'STANDALONE_APP' | 'SITE00_PROJECTS' | 'OTHER';
  authorityVersion: number;
  explicitFounderActionId: string;
  deliveryMode: 'CROSS_CONTEXT_REFERENCE';
  createdAt: string;
};

/** @deprecated use CrossContextDesignReference */
export type CrossProjectDesignFamilyReference = CrossContextDesignReference;

export function compileSite00ProjectExpressionAuthorityContract(input: {
  record: Site00ProjectExpressionAuthorityRecord;
  cgptBrief?: PageConceptCgptCreativeBrief | null;
  skinContract?: ProjectSkinContract | null;
  webTerritory?: WebExpressionTerritory | null;
  ndxBrief?: NdxBrandFamiliarityBrief | null;
}): Site00ProjectExpressionAuthorityContract {
  const brief = input.cgptBrief;
  const skin = input.skinContract;
  const territory = input.webTerritory;
  const ndx = input.ndxBrief;
  return {
    authorityId: input.record.authorityId,
    projectId: input.record.projectId,
    hostProduct: input.record.hostProduct,
    context: input.record.context,
    authorityScope: input.record.authorityScope,
    version: input.record.version,
    sourcePageId: input.record.sourcePageId,
    sourceConceptId: input.record.sourceConceptId,
    sourceTerritoryId: input.record.sourceTerritoryId,
    sourceArtifactId: input.record.sourceArtifactId,
    typographySystem: [
      brief?.mobileDirection?.slice(0, 120) ?? 'Expressive typography from promoted SITE 00 × project fusion',
      skin ? `Display ${skin.typography.displayFont}; body ${skin.typography.bodyFont}` : '',
      'Capitalization + scale relationships LOCKED within SITE 00 Projects context',
    ]
      .filter(Boolean)
      .join(' · '),
    colorSystem: [
      skin?.palette.slice(0, 4).join(' / ') ?? 'Project color families inside SITE 00',
      territory?.colorExpressionSystem ?? 'Dynamic color-range behavior from territory',
    ].join(' · '),
    graphicLanguage: [
      ndx?.graphicDeviceLibrary?.deviceCategories?.slice(0, 3).join(' / ') ??
        'Signature devices from promoted fusion concept',
      'Indexing + evidence treatment INHERITED within Projects',
    ].join(' · '),
    imageLanguage:
      ndx?.imageBehavior?.rules?.slice(0, 2).join(' ') ??
      skin?.imagery.slice(0, 3).join(' / ') ??
      'Documentary integration',
    materialSystem: skin?.material.slice(0, 4).join(' / ') ?? 'Paper/ink/archival surfaces',
    compositionSystem: [
      brief?.distinctiveMove?.slice(0, 100) ?? 'Density + spacing rhythm from promoted fusion',
      'Section transitions ADAPTABLE per page function',
    ].join(' · '),
    interactionCharacter: 'Project panel/nav/active states inside SITE 00 — not Safari or host chrome',
    shellExpression: 'Project shell fusion (header/nav/bottom nav styling) inside SITE 00 Projects container',
    inheritanceRules: [
      { field: 'DISPLAY_FONT', level: 'LOCKED' },
      { field: 'GRAPHIC_DEVICE_FAMILY', level: 'INHERITED' },
      { field: 'COMPOSITION', level: 'ADAPTABLE' },
      { field: 'CONTENT_LAYOUT', level: 'PAGE_SPECIFIC' },
    ],
    grammarOnlyNotice:
      'Inherit HOW this brand expresses inside SITE 00 Projects — not Overview layout, modules, copy, or imagery positions.',
    fusionNotice:
      'This is SITE 00 host/product logic fused with project personality — NOT standalone brand website authority.',
  };
}

/** @deprecated alias */
export const compileProjectVisualAuthorityContract = compileSite00ProjectExpressionAuthorityContract;

export function compileSite00ProjectExpressionPromptBlock(
  contract: Site00ProjectExpressionAuthorityContract,
): string {
  return [
    `SITE 00 PROJECT EXPRESSION · ${contract.projectId.toUpperCase()} · V${contract.version}`,
    `Context: ${contract.hostProduct} → ${contract.context} (authorityScope=${contract.authorityScope})`,
    `Source: ${contract.sourcePageId} · concept ${contract.sourceConceptId}`,
    contract.fusionNotice,
    contract.grammarOnlyNotice,
    `TYPOGRAPHY: ${contract.typographySystem}`,
    `COLOR: ${contract.colorSystem}`,
    `GRAPHICS: ${contract.graphicLanguage}`,
    `IMAGERY: ${contract.imageLanguage}`,
    `MATERIALS: ${contract.materialSystem}`,
    `COMPOSITION: ${contract.compositionSystem}`,
    `INTERACTION: ${contract.interactionCharacter}`,
    `SHELL FUSION: ${contract.shellExpression}`,
    'Do NOT clone source page layout — apply expression grammar to this page function only.',
    'Do NOT treat this as global standalone brand website design authority.',
  ].join('\n');
}

/** @deprecated alias */
export const compileProjectVisualAuthorityPromptBlock = compileSite00ProjectExpressionPromptBlock;

export function compileOpusSite00ProjectExpressionBlock(
  contract: Site00ProjectExpressionAuthorityContract | null,
  designTarget: DesignTargetDescriptor,
): string {
  if (!contract) return compileOpusScopeHandoffBlock({ designTarget, includesSite00ProjectExpression: false });
  const guard = validateAuthorityScopeForTarget({
    designTarget,
    authorityScope: 'SITE00_PROJECT_CONTEXT',
    deliveryMode: 'AUTHORITY',
  });
  if (!guard.ok) {
    return [
      compileOpusScopeHandoffBlock({ designTarget, includesSite00ProjectExpression: false }),
      `OPUS PROJECT EXPRESSION BLOCKED: ${guard.reason}`,
    ].join('\n');
  }
  return [
    compileOpusScopeHandoffBlock({ designTarget, includesSite00ProjectExpression: true }),
    compileSite00HostAuthorityPromptStub(),
    'OPUS SITE 00 PROJECT EXPRESSION (fusion grammar — not page clone, not standalone website):',
    compileSite00ProjectExpressionPromptBlock(contract),
  ].join('\n\n');
}

/** @deprecated alias */
export function compileOpusProjectVisualAuthorityBlock(
  contract: Site00ProjectExpressionAuthorityContract | null,
): string {
  const designTarget = contract ?
    classifyDesignTargetForPageConcept({
      pageId: contract.sourcePageId,
      projectId: contract.projectId,
    })
  : { targetProduct: 'SITE00' as const, targetContext: 'PROJECTS' as const, projectId: null };
  return compileOpusSite00ProjectExpressionBlock(contract, designTarget);
}

export type Site00ProjectExpressionAuthorityRegistry = {
  byProject: Record<string, readonly Site00ProjectExpressionAuthorityRecord[]>;
  contracts: Record<string, Site00ProjectExpressionAuthorityContract>;
  crossContextReferences: readonly CrossContextDesignReference[];
};

/** @deprecated alias */
export type ProjectVisualAuthorityRegistry = Site00ProjectExpressionAuthorityRegistry;

export function emptySite00ProjectExpressionAuthorityRegistry(): Site00ProjectExpressionAuthorityRegistry {
  return { byProject: {}, contracts: {}, crossContextReferences: [] };
}

/** @deprecated alias */
export const emptyProjectVisualAuthorityRegistry = emptySite00ProjectExpressionAuthorityRegistry;

function normalizeRegistry(raw: Partial<Site00ProjectExpressionAuthorityRegistry>): Site00ProjectExpressionAuthorityRegistry {
  const cross =
    raw.crossContextReferences ??
    (raw as { crossProjectReferences?: readonly CrossContextDesignReference[] }).crossProjectReferences ??
    [];
  return {
    byProject: raw.byProject ?? {},
    contracts: raw.contracts ?? {},
    crossContextReferences: cross.map((r) => ({
      ...r,
      deliveryMode: 'CROSS_CONTEXT_REFERENCE' as const,
      targetContext: r.targetContext ?? 'SITE00_PROJECTS',
    })),
  };
}

function upgradeLegacyRecord(record: ProjectVisualAuthorityRecord): Site00ProjectExpressionAuthorityRecord {
  return {
    ...record,
    hostProduct: SITE00_HOST_PRODUCT,
    context: SITE00_PROJECTS_CONTEXT,
    authorityScope: 'SITE00_PROJECT_CONTEXT',
    sourceViewportFamilyId: record.sourceViewportFamilyId ?? null,
  };
}

export function getActiveSite00ProjectExpressionAuthority(
  registry: Site00ProjectExpressionAuthorityRegistry,
  projectId: string,
): { record: Site00ProjectExpressionAuthorityRecord; contract: Site00ProjectExpressionAuthorityContract } | null {
  const rows = registry.byProject[projectId] ?? [];
  const active = [...rows].filter((r) => r.status === 'PROMOTED').sort((a, b) => b.version - a.version)[0];
  if (!active) return null;
  const contract = registry.contracts[active.authorityId];
  if (!contract) return null;
  return { record: active, contract };
}

/** @deprecated alias */
export const getActiveProjectVisualAuthority = getActiveSite00ProjectExpressionAuthority;

export function resolveSite00ProjectExpressionForPage(input: {
  registry: Site00ProjectExpressionAuthorityRegistry;
  projectId: string;
  pageId: string;
  designTarget: DesignTargetDescriptor;
  crossContextRef?: CrossContextDesignReference | null;
}): Site00ProjectExpressionAuthorityContract | null {
  const inheritCheck = validateProjectExpressionInheritance({
    designTarget: input.designTarget,
    crossContextReference: Boolean(input.crossContextRef),
  });
  if (!inheritCheck.ok && !input.crossContextRef) return null;

  if (input.crossContextRef && input.crossContextRef.targetProjectId === input.projectId) {
    const source = getActiveSite00ProjectExpressionAuthority(
      input.registry,
      input.crossContextRef.sourceProjectId,
    );
    if (!source) return null;
    const refGuard = validateAuthorityScopeForTarget({
      designTarget: input.designTarget,
      authorityScope: 'CROSS_CONTEXT_REFERENCE',
      deliveryMode: 'CROSS_CONTEXT_REFERENCE',
    });
    if (!refGuard.ok) return null;
    return source.contract;
  }

  const scopeGuard = validateAuthorityScopeForTarget({
    designTarget: input.designTarget,
    authorityScope: 'SITE00_PROJECT_CONTEXT',
    deliveryMode: 'AUTHORITY',
  });
  if (!scopeGuard.ok) return null;

  const active = getActiveSite00ProjectExpressionAuthority(input.registry, input.projectId);
  if (!active) return null;
  return active.contract;
}

/** @deprecated alias — pass designTarget for scope-safe resolution */
export function resolveProjectVisualAuthorityForPage(input: {
  registry: Site00ProjectExpressionAuthorityRegistry;
  projectId: string;
  pageId: string;
  designTarget?: DesignTargetDescriptor;
  crossProjectRef?: CrossContextDesignReference | null;
  crossContextRef?: CrossContextDesignReference | null;
}): Site00ProjectExpressionAuthorityContract | null {
  const designTarget =
    input.designTarget ??
    classifyDesignTargetForPageConcept({ pageId: input.pageId, projectId: input.projectId });
  return resolveSite00ProjectExpressionForPage({
    registry: input.registry,
    projectId: input.projectId,
    pageId: input.pageId,
    designTarget,
    crossContextRef: input.crossContextRef ?? input.crossProjectRef ?? null,
  });
}

export function promoteSite00ProjectExpressionAuthority(input: {
  registry: Site00ProjectExpressionAuthorityRegistry;
  projectId: string;
  sourcePageId: string;
  sourceConceptId: string;
  sourceTerritoryId: string | null;
  sourceArtifactId: string;
  sourceViewport: 'MOBILE' | 'DESKTOP' | 'TABLET';
  sourceViewportFamilyId?: string | null;
  artifactWidth: number;
  artifactHeight: number;
  artifactStatus: string;
  compile: Omit<Parameters<typeof compileSite00ProjectExpressionAuthorityContract>[0], 'record'>;
}): {
  registry: Site00ProjectExpressionAuthorityRegistry;
  record: Site00ProjectExpressionAuthorityRecord;
  contract: Site00ProjectExpressionAuthorityContract;
} {
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
  const authorityId = `${input.projectId}:site00-pea-v${nextVersion}`;
  const superseded = prior.map((r) =>
    r.status === 'PROMOTED' ? { ...r, status: 'SUPERSEDED' as const } : r,
  );
  const record: Site00ProjectExpressionAuthorityRecord = {
    authorityId,
    projectId: input.projectId,
    hostProduct: SITE00_HOST_PRODUCT,
    context: SITE00_PROJECTS_CONTEXT,
    authorityScope: 'SITE00_PROJECT_CONTEXT',
    version: nextVersion,
    status: 'PROMOTED',
    sourcePageId: input.sourcePageId,
    sourceConceptId: input.sourceConceptId,
    sourceTerritoryId: input.sourceTerritoryId,
    sourceArtifactId: input.sourceArtifactId,
    sourceViewport: input.sourceViewport,
    sourceViewportFamilyId: input.sourceViewportFamilyId ?? null,
    promotedAt: new Date().toISOString(),
  };
  const contract = compileSite00ProjectExpressionAuthorityContract({ record, ...input.compile });
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

/** @deprecated alias */
export const promoteProjectVisualAuthority = promoteSite00ProjectExpressionAuthority;

export function loadSite00ProjectExpressionAuthorityRegistry(): Site00ProjectExpressionAuthorityRegistry {
  if (typeof localStorage === 'undefined') return emptySite00ProjectExpressionAuthorityRegistry();
  try {
    const rawV2 = localStorage.getItem(SITE00_PROJECT_EXPRESSION_AUTHORITY_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(PROJECT_VISUAL_AUTHORITY_STORAGE_KEY);
    const raw = rawV2 ?? rawLegacy;
    if (!raw) return emptySite00ProjectExpressionAuthorityRegistry();
    const parsed = JSON.parse(raw) as Site00ProjectExpressionAuthorityRegistry;
    const normalized = normalizeRegistry(parsed);
    const byProject: Record<string, readonly Site00ProjectExpressionAuthorityRecord[]> = {};
    for (const [pid, rows] of Object.entries(normalized.byProject)) {
      byProject[pid] = rows.map((r) => upgradeLegacyRecord(r as Site00ProjectExpressionAuthorityRecord));
    }
    const contracts: Record<string, Site00ProjectExpressionAuthorityContract> = {};
    for (const [id, c] of Object.entries(normalized.contracts)) {
      contracts[id] = {
        ...c,
        hostProduct: SITE00_HOST_PRODUCT,
        context: SITE00_PROJECTS_CONTEXT,
        authorityScope: 'SITE00_PROJECT_CONTEXT',
        fusionNotice:
          c.fusionNotice ??
          'This is SITE 00 host/product logic fused with project personality — NOT standalone brand website authority.',
      };
    }
    return { ...normalized, byProject, contracts };
  } catch {
    return emptySite00ProjectExpressionAuthorityRegistry();
  }
}

/** @deprecated alias */
export const loadProjectVisualAuthorityRegistry = loadSite00ProjectExpressionAuthorityRegistry;

export function saveSite00ProjectExpressionAuthorityRegistry(
  registry: Site00ProjectExpressionAuthorityRegistry,
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SITE00_PROJECT_EXPRESSION_AUTHORITY_STORAGE_KEY, JSON.stringify(registry));
}

/** @deprecated alias */
export const saveProjectVisualAuthorityRegistry = saveSite00ProjectExpressionAuthorityRegistry;

export function createExplicitCrossContextDesignReference(input: {
  registry: Site00ProjectExpressionAuthorityRegistry;
  sourceProjectId: string;
  targetProjectId: string;
  targetContext: CrossContextDesignReference['targetContext'];
  founderActionId: string;
}): Site00ProjectExpressionAuthorityRegistry {
  const source = getActiveSite00ProjectExpressionAuthority(input.registry, input.sourceProjectId);
  if (!source) throw new Error('NO_SOURCE_SITE00_PROJECT_EXPRESSION');
  const ref: CrossContextDesignReference = {
    sourceProjectId: input.sourceProjectId,
    targetProjectId: input.targetProjectId,
    targetContext: input.targetContext,
    authorityVersion: source.record.version,
    explicitFounderActionId: input.founderActionId,
    deliveryMode: 'CROSS_CONTEXT_REFERENCE',
    createdAt: new Date().toISOString(),
  };
  return {
    ...input.registry,
    crossContextReferences: [...input.registry.crossContextReferences, ref],
  };
}

/** @deprecated alias */
export function createExplicitCrossProjectDesignFamilyReference(input: {
  registry: Site00ProjectExpressionAuthorityRegistry;
  sourceProjectId: string;
  targetProjectId: string;
  founderActionId: string;
}): Site00ProjectExpressionAuthorityRegistry {
  return createExplicitCrossContextDesignReference({
    ...input,
    targetContext: 'SITE00_PROJECTS',
  });
}

export function formatSite00ProjectExpressionDockSummary(input: {
  projectId: string;
  version: number;
  sourcePageId: string;
  sourceConceptId: string;
  inherited: boolean;
}): string {
  const sourcePageShort = input.sourcePageId.split(':').slice(-1)[0] ?? input.sourcePageId;
  const conceptLabel = input.sourceConceptId.replace(/^mc-/, 'CONCEPT ').toUpperCase();
  return [
    `${input.projectId.toUpperCase()} · SITE 00 PROJECT CONTEXT · V${input.version}`,
    `SOURCE: ${sourcePageShort.toUpperCase()} · ${conceptLabel}`,
    input.inherited ? 'INHERITED' : 'ACTIVE',
  ].join(' · ');
}

export { compileComposerScopeGuardBlock, classifyDesignTargetForPageConcept };
