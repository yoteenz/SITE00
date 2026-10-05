/**
 * NDXBOOK — existing truth, capability analysis, FAL discovery audit, expansion proposals.
 */

import type { CanonicalPageFamilyLayout } from './projectPageFamilyHierarchyDiscovery.js';
import type { PageFunctionContract } from './types.js';
import type {
  ExistingPageTruth,
  FalDiscoveryAuditRow,
  FalDiscoveryClassification,
  FunctionalGapType,
  PageCapabilityAnalysis,
  ProposedFunctionalExpansion,
} from './pageFunctionalExpansionIntelligence.js';
import { compilePageFunctionContract } from './functionContract.js';

const FAL_DISCOVERY_LABELS = [
  'ALL ENTRIES',
  'EVIDENCE',
  'ACTIVE PRODUCTION',
  'RECENT ACTIVITY',
  'PROJECT RECORDS',
  'PROJECT ARCHIVE',
  'EXPORT PROJECT LOG',
  'SUMMARY',
  'KEY SIGNALS',
  'RELATED EVIDENCE',
  'OVERVIEW',
  'ENTRIES',
  'PRODUCTION',
] as const;

function classifyFalDiscoveryLabel(label: string): {
  classification: FalDiscoveryClassification;
  rationale: string;
} {
  const u = label.toUpperCase();
  if (u === 'OVERVIEW' || u === 'SUMMARY') {
    return {
      classification: 'NEEDS_FOUNDER_REVIEW',
      rationale: 'Ambiguous — may be canonical page name or invented summary field.',
    };
  }
  if (u === 'ALL ENTRIES') {
    return {
      classification: 'REDUNDANT',
      rationale: 'Overview already exposes entry index navigation — not a separate product bucket.',
    };
  }
  if (u === 'ENTRIES' || u === 'EVIDENCE' || u === 'PRODUCTION') {
    return {
      classification: 'CONFLICTS_WITH_EXISTING_MODEL',
      rationale: 'Simplified nav taxonomy conflicts with canonical 7-page family destinations.',
    };
  }
  if (u === 'RECENT ACTIVITY' || u === 'PROJECT ARCHIVE' || u === 'EXPORT PROJECT LOG') {
    return {
      classification: 'USEFUL_EXPANSION_CANDIDATE',
      rationale:
        'Overview already exposes project state, entries, evidence, and production — this could connect existing systems for temporal/project audit awareness.',
    };
  }
  if (u === 'KEY SIGNALS' || u === 'RELATED EVIDENCE') {
    return {
      classification: 'USEFUL_EXPANSION_CANDIDATE',
      rationale: 'Could extend entry detail if grounded in entry/evidence relationships — not yet canonical fields.',
    };
  }
  if (u === 'PROJECT RECORDS' || u === 'ACTIVE PRODUCTION') {
    return {
      classification: 'NEEDS_FOUNDER_REVIEW',
      rationale: 'May overlap existing production/evidence regions — requires Founder product model decision.',
    };
  }
  return { classification: 'NOT_USEFUL', rationale: 'No grounded NDXBOOK extension identified.' };
}

export function buildNdxbookFalDiscoveryAudit(): readonly FalDiscoveryAuditRow[] {
  return FAL_DISCOVERY_LABELS.map((label) => {
    const { classification, rationale } = classifyFalDiscoveryLabel(label);
    return {
      label,
      classification,
      rationale,
      linkedExpansionId:
        classification === 'USEFUL_EXPANSION_CANDIDATE' ?
          `pfe-${label.toLowerCase().replace(/\s+/g, '-')}`
        : null,
    };
  });
}

export function buildNdxbookExistingPageTruths(
  layout: CanonicalPageFamilyLayout,
  functionContract: PageFunctionContract,
): ExistingPageTruth[] {
  const fcByPage = new Map<string, PageFunctionContract>();
  for (const row of layout.inventory) {
    fcByPage.set(row.pageId, compilePageFunctionContract('ndxbook', row.pageId) ?? functionContract);
  }
  return layout.inventory.map((row) => {
    const fc = fcByPage.get(row.pageId) ?? functionContract;
    const depth = layout.familyDepthByPageId[row.pageId] ?? 0;
    return {
      pageId: row.pageId,
      pageName: row.pageName,
      depth: depth as 0 | 1 | 2,
      currentPageFunction: row.functionRole,
      contentRegions: [...fc.regions],
      navigation: [row.route],
      controls: [...fc.interactions],
      interactions: [...fc.interactions],
      dataModel: [`${row.screenId} page record`],
      relationships: row.parentPageId ? [`parent:${row.parentPageId}`] : [],
      actions: fc.interactions.map((i) => i.toUpperCase()),
      states: ['DEFAULT', 'LOADING', 'ERROR'],
      responsiveBehavior: fc.responsiveRequirements.map((v) => `${v} layout from family shell`),
      knownLimitations: depth > 0 ? ['Inherits overview authority — divergence tracked in blueprint'] : [],
      sources: ['designPageRegistry', 'pageFunctionContract', 'pageFamilyHierarchyDiscovery'],
    };
  });
}

export function buildNdxbookPageCapabilityAnalyses(
  truths: readonly ExistingPageTruth[],
  layout: CanonicalPageFamilyLayout,
): PageCapabilityAnalysis[] {
  return truths.map((t) => {
    const isOverview = t.depth === 0;
    const gapTypes: FunctionalGapType[] = [];
    if (isOverview) {
      gapTypes.push('ACTIVITY_GAP', 'HISTORY_GAP', 'CROSS_PAGE_CONTINUITY_GAP', 'EXPORT_GAP');
    }
    if (t.pageName.toLowerCase().includes('entry') || t.currentPageFunction.toUpperCase().includes('INDEX')) {
      gapTypes.push('DETAIL_ACCESS_GAP', 'RELATED_CONTENT_GAP', 'EVIDENCE_GAP');
    }
    return {
      pageId: t.pageId,
      pageName: t.pageName,
      currentlyDoes: isOverview ?
        'Orients founder to NDXBOOK project state, entries, evidence, and production inside SITE 00 Projects.'
      : `Delivers ${t.currentPageFunction} for ${t.pageName} within the ${layout.anchorPageName} family.`,
      doesWell: 'Preserves family shell, navigation cohort, and editorial NDXBOOK identity.',
      underdeveloped: isOverview ? 'Temporal continuity across family pages (activity/history feed).' : 'Cross-page deep links back to overview context.',
      impliedMissing: isOverview ?
        'Unified activity/history surfacing across Content Ops, Campaign Board, entries, and lab surfaces.'
      : 'Explicit relationship to sibling/grandchild pages in interaction map.',
      usefulInformation: 'Which child systems changed recently and what entry/evidence state is active.',
      naturalActions: 'Navigate family pages, open entry detail, inspect evidence, continue production workflows.',
      clarityImprovements: 'Connect overview modules to canonical routes instead of invented taxonomies.',
      exposedMissingFunctionality: isOverview ?
        'No canonical Recent Activity stream — FAL outputs surfaced the opportunity.'
      : 'Page-specific inspectors may need proposed interaction records.',
      gapTypes,
    };
  });
}

function groundedWhyItFits(title: string, anchorName: string): string {
  return `Overview already exposes project state, entries, evidence, and production for ${anchorName}. ${title} could connect those existing systems and improve temporal awareness — not generic SaaS feature creep.`;
}

export function buildNdxbookFunctionalExpansionProposals(input: {
  anchorPageId: string;
  layout: CanonicalPageFamilyLayout;
  analyses: readonly PageCapabilityAnalysis[];
  falDiscoveryAudit: readonly FalDiscoveryAuditRow[];
}): ProposedFunctionalExpansion[] {
  const overview = input.analyses.find((a) => a.pageId === input.anchorPageId);
  const childIds = input.layout.children.map((c) => c.pageId);
  const grandchildIds = input.layout.grandchildren.map((c) => c.pageId);

  const fromAudit = input.falDiscoveryAudit
    .filter((r) => r.classification === 'USEFUL_EXPANSION_CANDIDATE' && r.linkedExpansionId)
    .map((r) => proposalFromDiscovery(r, input.anchorPageId, overview, childIds, grandchildIds, input.layout.anchorPageName));

  const fromAnalysis: ProposedFunctionalExpansion[] = [];
  if (overview?.gapTypes.includes('ACTIVITY_GAP')) {
    fromAnalysis.push({
      expansionId: 'pfe-recent-activity',
      sourcePageId: input.anchorPageId,
      title: 'RECENT ACTIVITY',
      problemObserved: 'Overview shows state snapshots but not temporal continuity across family systems.',
      currentBehavior: overview.currentlyDoes,
      proposedBehavior: 'Compact activity feed linking entry updates, Content Ops, Campaign Board, and lab events.',
      userBenefit: 'Founder sees what changed recently without drilling each child page.',
      whyItFitsProduct: groundedWhyItFits('Recent Activity', input.layout.anchorPageName),
      requiredContent: ['Activity event row', 'Timestamp', 'Source system label'],
      requiredData: ['ActivityEvent[]', 'pageId', 'entryId?'],
      requiredInteractions: ['VIEW ALL ACTIVITY → NAVIGATE / OPEN_ACTIVITY_INDEX'],
      requiredRoutes: ['/projects/ndxbook/activity'],
      requiredStates: ['ACTIVITY_FEED', 'ACTIVITY_DETAIL'],
      affectedPages: [input.anchorPageId, ...childIds.slice(0, 3)],
      affectedChildren: childIds,
      affectedGrandchildren: grandchildIds,
      affectedExperiencePatterns: ['project-access', 'menu'],
      responsiveImpact: {
        mobile: 'Compact feed module or drawer',
        tablet: 'Expanded activity module beside overview bands',
        desktop: 'Persistent activity rail when space allows',
      },
      implementationComplexity: 'HIGH',
      confidence: 'MEDIUM',
      status: 'PROPOSED',
      origin: 'SYSTEM_ANALYSIS',
      gapTypes: ['ACTIVITY_GAP', 'HISTORY_GAP', 'CROSS_PAGE_CONTINUITY_GAP'],
    });
  }

  const merged = new Map<string, ProposedFunctionalExpansion>();
  for (const p of [...fromAudit, ...fromAnalysis]) merged.set(p.expansionId, p);
  return [...merged.values()];
}

function proposalFromDiscovery(
  row: FalDiscoveryAuditRow,
  anchorPageId: string,
  overview: PageCapabilityAnalysis | undefined,
  childIds: readonly string[],
  grandchildIds: readonly string[],
  anchorName: string,
): ProposedFunctionalExpansion {
  const id = row.linkedExpansionId!;
  const title = row.label;
  return {
    expansionId: id,
    sourcePageId: anchorPageId,
    title,
    problemObserved: row.rationale,
    currentBehavior: overview?.currentlyDoes ?? 'Canonical overview behavior.',
    proposedBehavior: `Structured ${title} surfaced from approved expansion — not FAL-invented labels.`,
    userBenefit: 'Improves continuity across existing NDXBOOK systems.',
    whyItFitsProduct: groundedWhyItFits(title, anchorName),
    requiredContent: [title],
    requiredData: [`${title.replace(/\s+/g, '_')}_MODEL`],
    requiredInteractions: [`${title} → OPEN_${title.replace(/\s+/g, '_')}`],
    requiredRoutes: [],
    requiredStates: [`${title.replace(/\s+/g, '_')}_VISIBLE`],
    affectedPages: [anchorPageId],
    affectedChildren: childIds,
    affectedGrandchildren: grandchildIds,
    affectedExperiencePatterns:
      title.includes('EVIDENCE') || title.includes('SIGNAL') ?
        ['entry-detail']
      : ['project-access'],
    responsiveImpact: {
      mobile: 'Drawer or inline module',
      tablet: 'Wider module',
      desktop: 'Inspector column or rail',
    },
    implementationComplexity: 'MEDIUM',
    confidence: 'MEDIUM',
    status: 'PROPOSED',
    origin: 'EXPERIENCE_GENERATION_DISCOVERY',
    gapTypes: title.includes('EVIDENCE') ? ['EVIDENCE_GAP', 'RELATED_CONTENT_GAP'] : ['ACTIVITY_GAP', 'AUDITABILITY_GAP'],
  };
}

/** Reject generic SaaS proposals without product grounding. */
export function isGenericFeatureCreep(proposal: ProposedFunctionalExpansion): boolean {
  const blob = `${proposal.whyItFitsProduct} ${proposal.problemObserved}`.toLowerCase();
  if (/social sharing|because apps often|every app has/.test(blob)) return true;
  if (/generic saas feature creep/.test(blob) && !/not generic saas/.test(blob)) return true;
  const grounded =
    blob.includes('overview already') ||
    blob.includes('ndxbook') ||
    blob.includes('existing systems') ||
    blob.includes('canonical');
  return !grounded;
}
