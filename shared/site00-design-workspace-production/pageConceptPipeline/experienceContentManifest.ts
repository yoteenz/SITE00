/**
 * P0.VR.EXPERIENCE-CONTENT-PROVENANCE-AND-CANONICAL-CONTENT-LOCK1
 */

import type { ExpressionPromptType } from './pageConceptExperienceExpressionPromptOrchestration.js';
import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import type { PageFunctionContract } from './types.js';
import {
  buildNdxbookOverviewExperienceContentManifests,
  auditNdxbookLegacyPromptInventedLabels,
  NDXBOOK_INVENTED_PROJECT_ACCESS_LABELS,
  NDXBOOK_INVENTED_ENTRY_DETAIL_LABELS,
  NDXBOOK_INVENTED_SIMPLIFIED_NAV_LABELS,
} from './ndxbookExperienceContentManifest.js';
import { isNdxbookOverviewExperiencePage } from './ndxbookOverviewExperienceExpressionContentSpec.js';

export type ContentProvenanceClass =
  | 'CANONICAL_STATIC'
  | 'CANONICAL_DYNAMIC'
  | 'CANONICAL_DERIVED'
  | 'FOUNDER_APPROVED_PREVIEW'
  | 'UNDEFINED';

export type ContentManifestItem = {
  id: string;
  label: string;
  provenance: ContentProvenanceClass;
  source: string;
};

export type ExperienceContentManifest = {
  manifestId: string;
  expressionType: ExpressionPromptType;
  stateId: string;
  pageId: string;
  interactionId: string;
  visibleRegions: readonly string[];
  canonicalFields: readonly ContentManifestItem[];
  canonicalActions: readonly ContentManifestItem[];
  canonicalDestinations: readonly ContentManifestItem[];
  dynamicFields: readonly ContentManifestItem[];
  preservedBaseContent: readonly string[];
  hiddenBaseContent: readonly string[];
  contentSources: readonly string[];
  undefinedRequirements: readonly string[];
  provenanceStatus: 'READY' | 'UNDEFINED_BLOCKED';
  contentCoveragePercent: number;
};

export type ExperienceContentAuditItem = {
  label: string;
  classification: 'CANONICAL' | 'DERIVED' | 'INVENTED' | 'UNKNOWN';
  source: string | null;
};

export type ExperienceContentStateAudit = {
  stateId: string;
  label: string;
  items: readonly ExperienceContentAuditItem[];
  inventedCount: number;
  unknownCount: number;
  missingRequiredCount: number;
  contentCoveragePercent: number;
  outputAction: 'PRESERVE' | 'REGENERATE' | 'REVIEW';
  reviewStatus: 'VERIFIED' | 'REVIEW_REQUIRED' | 'BLOCKED';
};

export type ExperienceContentAudit = {
  states: readonly ExperienceContentStateAudit[];
  inventedProductContent: number;
  undefinedRequiredContent: number;
  requiredContentMissing: number;
};

export type ExperienceContentContinuityReceipt = {
  ok: boolean;
  code: string | null;
  audit: ExperienceContentAudit;
  manifests: readonly ExperienceContentManifest[];
};

export const CANONICAL_CONTENT_PROMPT_HEADER = 'CANONICAL CONTENT — USE EXACTLY';

export const CANONICAL_CONTENT_PROMPT_FOOTER = [
  'DO NOT ADD PRODUCT CONTENT NOT PRESENT IN THIS MANIFEST.',
  'DO NOT REMOVE REQUIRED CONTENT.',
  'YOU MAY CHANGE PRESENTATION, NOT SEMANTIC PRODUCT STRUCTURE.',
  'FAL IS AUTHORIZED TO DESIGN HOW AN INTERACTION STATE LOOKS.',
  'FAL IS NOT AUTHORIZED TO INVENT WHAT THE PRODUCT CONTAINS.',
].join('\n');

export function canonicalContentPromptBlock(manifest: ExperienceContentManifest): string {
  const destinations =
    manifest.canonicalDestinations.length ?
      manifest.canonicalDestinations.map((d) => `- ${d.label} (${d.provenance})`).join('\n')
    : '- (none required in this state)';
  const fields =
    manifest.canonicalFields.length ?
      manifest.canonicalFields.map((f) => `- ${f.label} (${f.provenance})`).join('\n')
    : '- (none)';
  const actions =
    manifest.canonicalActions.length ?
      manifest.canonicalActions.map((a) => `- ${a.label} (${a.provenance})`).join('\n')
    : '- (none)';
  const dynamic =
    manifest.dynamicFields.length ?
      manifest.dynamicFields.map((d) => `- ${d.label}: use structurally neutral system placeholder if value unknown`).join('\n')
    : '- (none)';
  return [
    CANONICAL_CONTENT_PROMPT_HEADER,
    `STATE: ${manifest.stateId} · ${manifest.expressionType}`,
    `CONTENT SOURCES: ${manifest.contentSources.join(' · ')}`,
    '',
    'CANONICAL DESTINATIONS (navigation — exact labels):',
    destinations,
    '',
    'CANONICAL FIELDS:',
    fields,
    '',
    'CANONICAL ACTIONS:',
    actions,
    '',
    'DYNAMIC FIELDS (no creative fake data):',
    dynamic,
    '',
    'PRESERVE BASE PAGE CONTENT:',
    ...manifest.preservedBaseContent.map((l) => `- ${l}`),
    '',
    CANONICAL_CONTENT_PROMPT_FOOTER,
  ].join('\n');
}

export function buildExperienceContentManifestsForPage(input: {
  projectId: string;
  pageId: string;
  route: string;
  screenId?: string;
  functionContract: PageFunctionContract;
  interactionMapPresent?: boolean;
}): readonly ExperienceContentManifest[] {
  if (
    isNdxbookOverviewExperiencePage({
      projectId: input.projectId,
      route: input.route,
      pageId: input.pageId,
      screenId: input.screenId,
    })
  ) {
    return buildNdxbookOverviewExperienceContentManifests({
      projectId: input.projectId,
      pageId: input.pageId,
      functionContract: input.functionContract,
    });
  }
  return [];
}

export function manifestForState(
  manifests: readonly ExperienceContentManifest[] | undefined,
  stateId: string,
): ExperienceContentManifest | null {
  return manifests?.find((m) => m.stateId === stateId) ?? null;
}

function auditPromptTextAgainstManifest(
  promptText: string | undefined,
  manifest: ExperienceContentManifest | null,
): ExperienceContentStateAudit {
  const inventedFromLegacy = auditNdxbookLegacyPromptInventedLabels(promptText ?? '');
  const items: ExperienceContentAuditItem[] = [...inventedFromLegacy];

  let missingRequiredCount = 0;
  if (manifest) {
    for (const dest of manifest.canonicalDestinations) {
      if (!promptText?.toUpperCase().includes(dest.label.toUpperCase())) {
        missingRequiredCount += 1;
        items.push({
          label: dest.label,
          classification: 'UNKNOWN',
          source: 'manifest-required-destination-not-in-prompt',
        });
      }
    }
  }

  const inventedCount = items.filter((i) => i.classification === 'INVENTED').length;
  const unknownCount = items.filter((i) => i.classification === 'UNKNOWN').length;
  const requiredTotal =
    (manifest?.canonicalDestinations.length ?? 0) +
    (manifest?.canonicalFields.length ?? 0) +
    (manifest?.canonicalActions.length ?? 0);
  const represented = Math.max(0, requiredTotal - missingRequiredCount);
  const contentCoveragePercent =
    requiredTotal === 0 ? 100 : Math.round((represented / requiredTotal) * 100);

  let outputAction: ExperienceContentStateAudit['outputAction'] = 'PRESERVE';
  if (inventedCount > 0) outputAction = 'REGENERATE';
  else if (unknownCount > 0 || missingRequiredCount > 0) outputAction = 'REVIEW';

  let reviewStatus: ExperienceContentStateAudit['reviewStatus'] = 'VERIFIED';
  if (inventedCount > 0 || (manifest?.undefinedRequirements.length ?? 0) > 0) reviewStatus = 'BLOCKED';
  else if (outputAction === 'REVIEW') reviewStatus = 'REVIEW_REQUIRED';

  return {
    stateId: manifest?.stateId ?? 'unknown',
    label: manifest?.expressionType ?? 'UNKNOWN',
    items,
    inventedCount,
    unknownCount,
    missingRequiredCount,
    contentCoveragePercent,
    outputAction,
    reviewStatus,
  };
}

export function auditExperienceContentForAuthority(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperienceContentAudit {
  if (!authority) {
    return {
      states: [],
      inventedProductContent: 0,
      undefinedRequiredContent: 0,
      requiredContentMissing: 0,
    };
  }
  const manifests =
    authority.experienceContentManifests ??
    buildExperienceContentManifestsForPage({
      projectId: authority.projectId,
      pageId: authority.pageId,
      route: authority.expressionPrompts?.[0]?.route ?? '',
      functionContract: {
        contractId: 'synthetic',
        projectId: authority.projectId,
        pageId: authority.pageId,
        version: 'v1',
        route: authority.expressionPrompts?.[0]?.route ?? '',
        regions: [],
        interactions: [],
        immutableBehaviors: [],
        responsiveRequirements: [],
        createdAt: '',
      },
    });

  const states: ExperienceContentStateAudit[] = authority.visualStates
    .filter((v) => v.stateId !== 'base')
    .map((state) => {
      const manifest = manifestForState(manifests, state.stateId);
      const prompt = authority.expressionPrompts?.find(
        (p) => p.stateId === state.stateId || p.expressionType === state.sourceExpressionTypes?.[0],
      );
      return auditPromptTextAgainstManifest(prompt?.promptText, manifest);
    });

  return {
    states,
    inventedProductContent: states.reduce((n, s) => n + s.inventedCount, 0),
    undefinedRequiredContent: manifests.reduce((n, m) => n + m.undefinedRequirements.length, 0),
    requiredContentMissing: states.reduce((n, s) => n + s.missingRequiredCount, 0),
  };
}

export function validateExperienceContentContinuity(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperienceContentContinuityReceipt {
  const manifests =
    authority?.experienceContentManifests ??
    (authority ?
      buildExperienceContentManifestsForPage({
        projectId: authority.projectId,
        pageId: authority.pageId,
        route: authority.expressionPrompts?.[0]?.route ?? '',
        functionContract: {
          contractId: 'synthetic',
          projectId: authority.projectId,
          pageId: authority.pageId,
          version: 'v1',
          route: authority.expressionPrompts?.[0]?.route ?? '',
          regions: [],
          interactions: [],
          immutableBehaviors: [],
          responsiveRequirements: [],
          createdAt: '',
        },
      })
    : []);

  const undefinedBlocked = manifests.some((m) => m.provenanceStatus === 'UNDEFINED_BLOCKED');
  const audit = auditExperienceContentForAuthority(
    authority ?
      { ...authority, experienceContentManifests: manifests }
    : null,
  );

  const blockedByInvented = audit.inventedProductContent > 0;
  const blockedByMissing =
    audit.requiredContentMissing > 0 &&
    audit.states.some((s) => s.missingRequiredCount > 0 && s.inventedCount === 0);
  const blockedByUndefined = undefinedBlocked || audit.undefinedRequiredContent > 0;

  const ok = !blockedByInvented && !blockedByMissing && !blockedByUndefined;

  let code: string | null = null;
  if (blockedByUndefined) code = 'EXPERIENCE_CONTENT_UNDEFINED';
  else if (blockedByInvented) code = 'EXPERIENCE_CONTENT_INVENTED';
  else if (blockedByMissing) code = 'EXPERIENCE_CONTENT_INCOMPLETE';

  return { ok, code, audit, manifests };
}

export function experienceContentBlocksApproval(
  authority: ExperienceExpressionAuthority | null | undefined,
): { blocked: boolean; code: string | null; receipt: ExperienceContentContinuityReceipt } {
  const receipt = validateExperienceContentContinuity(authority);
  return { blocked: !receipt.ok, code: receipt.code, receipt };
}

export function attachContentManifestFieldsToVisualStates(
  authority: ExperienceExpressionAuthority,
  manifests: readonly ExperienceContentManifest[],
): ExperienceExpressionVisualState[] {
  const audit = auditExperienceContentForAuthority({ ...authority, experienceContentManifests: manifests });
  return authority.visualStates.map((state) => {
    const row = audit.states.find((s) => s.stateId === state.stateId);
    const manifest = manifestForState(manifests, state.stateId);
    if (!row && !manifest) return state;
    return {
      ...state,
      contentCoveragePercent: row?.contentCoveragePercent ?? manifest?.contentCoveragePercent ?? 100,
      contentProvenanceStatus: row?.reviewStatus ?? 'VERIFIED',
      contentManifestId: manifest?.manifestId ?? null,
    };
  });
}

export function buildExperienceContentHandoffLines(authority: ExperienceExpressionAuthority): string[] {
  const receipt = validateExperienceContentContinuity(authority);
  const lines = [
    'CONTENT AUTHORITY: MANIFEST WINS FOR CONTENT/FUNCTION · IMAGE WINS FOR VISUAL EXPRESSION',
    `INVENTED_PRODUCT_CONTENT: ${receipt.audit.inventedProductContent}`,
    `UNDEFINED_REQUIRED_CONTENT: ${receipt.audit.undefinedRequiredContent}`,
    `REQUIRED_CONTENT_MISSING: ${receipt.audit.requiredContentMissing}`,
  ];
  for (const m of receipt.manifests) {
    if (m.stateId === 'base') continue;
    lines.push(`CONTENT MANIFEST · ${m.stateId}: destinations=${m.canonicalDestinations.length} fields=${m.canonicalFields.length}`);
  }
  return lines;
}

/** Composer guard — never infer product schema from pixels alone. */
export const COMPOSER_EXPERIENCE_CONTENT_GUARD =
  'Composer must use ExperienceContentManifest + interaction map for product semantics; do not scrape Experience FAL images for labels, actions, or navigation taxonomy.';

export {
  NDXBOOK_INVENTED_PROJECT_ACCESS_LABELS,
  NDXBOOK_INVENTED_ENTRY_DETAIL_LABELS,
  NDXBOOK_INVENTED_SIMPLIFIED_NAV_LABELS,
};
