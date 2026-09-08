/**
 * B5.9R7 — NDXBOOK project overview adapter (creative production intelligence).
 */

import { projectModulePath } from '../../projectModules.js';
import type { ProjectEntryState } from '../../../site00-brand-lore/founderWorkspace/projectOperatingState/types.js';
import type { ProjectProgressSummary } from '../../projectProgressSummary.js';
import type { ProjectOverviewAdapter, ProjectOverviewAdapterContext, ProjectOverviewViewModel } from '../types.js';
import {
  deriveOperatingPhase,
  mapRecentActivity,
  moduleChipLabels,
  resolveOverviewVisual,
} from '../overviewHelpers.js';

function entryProgressWeight(stage: ProjectEntryState['stage']): number {
  switch (stage) {
    case 'COMPLETE':
      return 1;
    case 'FOUNDER_REVIEW':
    case 'PRODUCTION':
      return 0.78;
    case 'STORYBOARD':
    case 'CREATIVE_DIRECTION':
      return 0.55;
    case 'PACKAGE_ASSEMBLY':
      return 0.38;
    default:
      return 0.2;
  }
}

/** NDXBOOK progress: chapter entry state — not arbitrary card counts. */
export function deriveNdxbookProgress(entries: ProjectEntryState[]): ProjectProgressSummary {
  if (!entries.length) {
    return { percent: null, label: 'NOT YET SCORED', confidence: 'LOW' };
  }
  const avg = entries.reduce((sum, e) => sum + entryProgressWeight(e.stage), 0) / entries.length;
  const percent = Math.round(avg * 100);
  if (percent <= 0) {
    return { percent: null, label: 'IN PROGRESS', confidence: 'LOW' };
  }
  return {
    percent,
    label: null,
    confidence: entries.length >= 2 ? 'HIGH' : 'MEDIUM',
  };
}

function deriveNdxPhase(entries: ProjectEntryState[], chapterTitle: string | null): string {
  const review = entries.find((e) => e.needsFounderReview);
  if (review) return `${review.stageLabel} · ENTRY ${String(review.entryNumber).padStart(3, '0')}`;
  const active = entries.find((e) => e.stage !== 'COMPLETE' && e.stage !== 'RESEARCH');
  if (active) return `${active.stageLabel} · ENTRY ${String(active.entryNumber).padStart(3, '0')}`;
  if (chapterTitle) return chapterTitle.toUpperCase();
  return 'CREATIVE PRODUCTION';
}

function buildNdxOverview(ctx: ProjectOverviewAdapterContext, clientSafe: boolean): ProjectOverviewViewModel {
  const { generalized, ndxOperatingState, technicalIntelligence } = ctx;
  const ndx = ndxOperatingState;
  const entries = ndx?.entries ?? [];
  const progress = ndx ? deriveNdxbookProgress(entries) : { percent: null, label: 'SYNC REQUIRED', confidence: 'LOW' as const };
  const needsYourEye = ndx?.approvalsNeeded.length ?? generalized.needsYourEye.length;
  const blockers = generalized.blockers.length;
  const phase = ndx
    ? deriveNdxPhase(entries, ndx.chapterTitle)
    : deriveOperatingPhase(generalized, 'CREATIVE PRODUCTION');

  const reviewEntry = entries.find((e) => e.needsFounderReview);
  const packageEntry = entries.find((e) => e.entryId === 'entry-001');
  const storyboardEntry = entries.find((e) => e.entryId === 'entry-002');

  const packageStatus = packageEntry
    ? packageEntry.stage === 'FOUNDER_REVIEW'
      ? 'NEEDS REVIEW'
      : packageEntry.stage.replace(/_/g, ' ')
    : 'PARTIAL';

  const creativeValue = ndx
    ? String(ndx.inProduction.length).padStart(2, '0')
    : String(generalized.evolveState?.contentInProduction ?? 0).padStart(2, '0');

  const techConnected = technicalIntelligence?.repositoryConnection.connected ?? false;
  const buildStatus = technicalIntelligence?.buildState.status ?? 'UNKNOWN';

  const currentFocus = reviewEntry
    ? {
        label: `REVIEW ENTRY ${String(reviewEntry.entryNumber).padStart(3, '0')} ${reviewEntry.stageLabel}`,
        sublabel: reviewEntry.title.toUpperCase(),
        href: reviewEntry.href,
      }
    : ndx?.currentWork[0]
      ? { label: ndx.currentWork[0]!.toUpperCase(), href: projectModulePath('ndxbook', 'EVOLVE') }
      : generalized.currentFocus
        ? { label: generalized.currentFocus.toUpperCase() }
        : null;

  const nextMilestone = reviewEntry
    ? {
        label: `ENTRY ${String(reviewEntry.entryNumber).padStart(3, '0')} CANON APPROVAL`,
        sublabel: reviewEntry.stageLabel,
      }
    : storyboardEntry && storyboardEntry.stage === 'STORYBOARD'
      ? { label: 'ENTRY 002 KEYFRAME APPROVAL', sublabel: 'STORYBOARD REVIEW' }
      : packageEntry?.stage === 'PACKAGE_ASSEMBLY'
        ? { label: 'ENTRY 001 PACKAGE COMPLETE', sublabel: 'SOCIAL PACKAGE ARCHIVE' }
        : ndx?.chapterTitle
          ? { label: 'CHAPTER 01 NEXT ENTRY', sublabel: ndx.chapterTitle.toUpperCase() }
          : null;

  const primaryAction = reviewEntry
    ? { label: 'REVIEW CURRENT WORK', href: reviewEntry.href }
    : { label: 'OPEN EVOLVE', href: projectModulePath('ndxbook', 'EVOLVE') };

  const chips = moduleChipLabels(generalized.capabilityManifest).filter(
    (c) => !clientSafe || !['EVOLVE'].includes(c),
  );

  return {
    projectId: 'ndxbook',
    displayName: generalized.summary.displayName,
    descriptor: generalized.summary.tagline ?? 'INDEX BOOK FOUNDER PILOT',
    phase,
    lifecycleBadge: 'FOUNDER PILOT',
    visual: resolveOverviewVisual('ndxbook', generalized.summary.displayName),
    moduleChips: chips.length ? chips : ['EVOLVE', 'PRODUCTION', 'REVIEWS', 'LIBRARY'],
    progress,
    needsYourEyeCount: needsYourEye,
    blockerCount: blockers,
    primarySignals: clientSafe
      ? [
          {
            id: 'progress',
            title: 'PROJECT PROGRESS',
            value: progress.percent != null ? `${progress.percent}%` : (progress.label ?? 'IN PROGRESS'),
            status: 'CLIENT VIEW',
            tone: 'blue',
          },
          {
            id: 'reviews',
            title: 'YOUR REVIEWS',
            value: String(Math.min(needsYourEye, 9)).padStart(2, '0'),
            status: needsYourEye > 0 ? 'PENDING' : 'CLEAR',
            tone: needsYourEye > 0 ? 'amber' : 'green',
          },
          {
            id: 'deliverables',
            title: 'DELIVERABLES',
            value: String(ndx?.inProduction.length ?? 0).padStart(2, '0'),
            status: 'IN PRODUCTION',
            tone: 'neutral',
          },
          {
            id: 'phase',
            title: 'CURRENT PHASE',
            value: phase.split('·')[0]?.trim() ?? phase,
            status: 'ACTIVE',
            tone: 'blue',
          },
        ]
      : [
          {
            id: 'creative',
            title: 'CREATIVE PRODUCTION',
            value: creativeValue,
            status: ndx?.inProduction.length ? 'IN PRODUCTION' : 'STAGING',
            tone: ndx?.inProduction.length ? 'green' : 'amber',
            meta: ndx?.chapterTitle?.toUpperCase(),
          },
          {
            id: 'review',
            title: 'FOUNDER REVIEW',
            value: String(needsYourEye).padStart(2, '0'),
            status: needsYourEye > 0 ? 'ACTION NEEDED' : 'CLEAR',
            tone: needsYourEye > 0 ? 'red' : 'green',
          },
          {
            id: 'package',
            title: 'PACKAGE READINESS',
            value: packageEntry ? `E${String(packageEntry.entryNumber).padStart(3, '0')}` : '—',
            status: packageStatus,
            tone: packageEntry?.needsFounderReview ? 'amber' : 'blue',
          },
          {
            id: 'technical',
            title: 'TECHNICAL HEALTH',
            value: techConnected ? 'CONNECTED' : 'PARTIAL',
            status: buildStatus.replace(/_/g, ' '),
            tone: techConnected ? 'green' : 'neutral',
          },
        ],
    currentFocus: clientSafe && currentFocus?.label.includes('REVIEW') ? currentFocus : clientSafe ? null : currentFocus,
    nextMilestone,
    recentActivity: mapRecentActivity(generalized, clientSafe),
    primaryAction,
    partialState: !ndx,
    partialMessage: !ndx ? 'PROJECT DATA PARTIAL — LIVE SYNC IN PROGRESS' : null,
    adapterId: 'ndxbook',
  };
}

export const NdxbookOverviewAdapter: ProjectOverviewAdapter = {
  adapterId: 'ndxbook',
  projectId: 'ndxbook',
  usesSpecializedOverview: true,
  stateSource: 'PROJECT_OPERATING_STATE',
  buildFounderOverview(ctx) {
    return buildNdxOverview(ctx, false);
  },
  buildClientOverview(ctx) {
    return buildNdxOverview(ctx, true);
  },
};
