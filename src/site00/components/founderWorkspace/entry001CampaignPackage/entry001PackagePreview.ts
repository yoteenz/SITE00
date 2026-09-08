/**
 * B5.5 — Entry 001 package preview composition (derived from deliverable records).
 */

import type {
  Entry001DeliverableRecord,
  Entry001FormatFamily,
  Entry001FormatWorkspaceStatus,
  Entry001PackagePreviewComposition,
  Entry001PackagePreviewReadiness,
  Entry001PackageReadiness,
  Entry001SocialPackageMapNode,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  ENTRY001_PACKAGE_FORMAT_FAMILIES,
  getActivePackageDeliverables,
} from './entry001DeliverableStore.js';
import { buildFormatPreview, buildFormatWorkspaceSummaries } from './entry001FormatWorkspaces.js';

export function buildPackagePreviewReadiness(
  deliverables: Entry001DeliverableRecord[],
  packageReadiness: Entry001PackageReadiness,
): Entry001PackagePreviewReadiness {
  const summaries = buildFormatWorkspaceSummaries(deliverables);
  const incompleteFormats = summaries.filter((s) => !s.complete).map((s) => s.formatFamily);
  const completeFormats = summaries.filter((s) => s.complete).map((s) => s.formatFamily);

  return {
    previewReadiness: 'AVAILABLE',
    campaignBoardEligibility: packageReadiness.campaignBoardEligible,
    incompleteFormats,
    completeFormats,
  };
}

export function buildSocialPackageMap(
  deliverables: Entry001DeliverableRecord[],
): Entry001SocialPackageMapNode[] {
  const summaries = buildFormatWorkspaceSummaries(deliverables);
  const statusOf = (f: Entry001FormatFamily): Entry001FormatWorkspaceStatus =>
    summaries.find((s) => s.formatFamily === f)?.status ?? 'NOT_STARTED';

  const reelNode: Entry001SocialPackageMapNode = {
    id: 'map-reel',
    label: 'FINAL REEL',
    formatFamily: 'REEL',
    status: statusOf('REEL'),
    children: [
      { id: 'map-carousel', label: 'CAROUSEL', formatFamily: 'CAROUSEL', status: statusOf('CAROUSEL'), children: [] },
      { id: 'map-story', label: 'STORY', formatFamily: 'STORY', status: statusOf('STORY'), children: [] },
      { id: 'map-tiktok', label: 'TIKTOK', formatFamily: 'TIKTOK', status: statusOf('TIKTOK'), children: [] },
    ],
  };

  const xNode: Entry001SocialPackageMapNode = {
    id: 'map-x',
    label: 'X / TWITTER',
    formatFamily: 'X',
    status: statusOf('X'),
    children: [],
  };

  const highlightNode: Entry001SocialPackageMapNode = {
    id: 'map-highlight',
    label: 'HIGHLIGHT / COVER',
    formatFamily: 'HIGHLIGHT',
    status: statusOf('HIGHLIGHT'),
    children: [],
  };

  return [reelNode, xNode, highlightNode];
}

export function buildPackagePreviewComposition(
  deliverables: Entry001DeliverableRecord[],
  packageReadiness: Entry001PackageReadiness,
): Entry001PackagePreviewComposition {
  const previewReadiness = buildPackagePreviewReadiness(deliverables, packageReadiness);

  return {
    entryId: 'entry-001',
    previewReadiness: previewReadiness.previewReadiness,
    campaignBoardEligibility: previewReadiness.campaignBoardEligibility,
    formats: ENTRY001_PACKAGE_FORMAT_FAMILIES.map((f) => buildFormatPreview(f, deliverables)),
    packageMap: buildSocialPackageMap(deliverables),
  };
}

export function buildArchiveIntelligencePreviewSnapshot(
  deliverables: Entry001DeliverableRecord[],
): {
  formatFamilies: Entry001FormatFamily[];
  activeDeliverableCount: number;
  previewStructureExposed: boolean;
} {
  const active = getActivePackageDeliverables(deliverables);
  return {
    formatFamilies: [...new Set(active.map((d) => d.formatFamily))],
    activeDeliverableCount: active.length,
    previewStructureExposed: true,
  };
}
