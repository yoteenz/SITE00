/**
 * B5.9R2 — Universal project index item model.
 */

import type { Site00ProjectIndexEntry } from './types.js';
import type { ProjectCapabilityManifest } from './projectCapabilityManifest.js';
import type { ProjectModuleId } from './projectModules.js';
import { projectModulePath } from './projectModules.js';
import { getProjectOperatingAdapter } from './adapters/index.js';
import { buildProjectProgressSummary, type ProjectProgressSummary } from './projectProgressSummary.js';
import { resolveProjectIndexVisual } from './projectIndexVisual.js';
import { getProjectRepositoryBinding } from './technical/projectRepositoryRegistry.js';

export type ProjectIndexOwnerType = 'FOUNDER' | 'CLIENT';

export type ProjectIndexStatus =
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'BLOCKED'
  | 'NOT_STARTED'
  | 'PRE_LAUNCH'
  | 'LAUNCHED'
  | 'ARCHIVED'
  | 'CONFIGURATION'
  | 'POST_LAUNCH';

export type ProjectIndexStatusDot = 'green' | 'blue' | 'amber' | 'red' | 'gray';

export type ProjectIndexItem = {
  projectId: string;
  projectName: string;
  projectType: string;
  projectClassification: string;
  projectImage: string | null;
  projectInitials: string;
  projectCapabilityManifest: ProjectCapabilityManifest;
  primaryModule: ProjectModuleId;
  enabledModules: ProjectModuleId[];
  secondaryModuleCount: number;
  ownerType: ProjectIndexOwnerType;
  clientName: string | null;
  currentPhase: string;
  status: ProjectIndexStatus;
  statusDot: ProjectIndexStatusDot;
  progress: ProjectProgressSummary;
  currentFocus: string | null;
  lastUpdatedAt: string | null;
  lastUpdatedLabel: string;
  needsReviewCount: number;
  activeTaskCount: number;
  isArchived: boolean;
  isOnHold: boolean;
  clientFacing: boolean;
  internalProject: boolean;
  openRoute: string;
  descriptor: string | null;
  repositorySlug: string | null;
  repositoryStatus: string | null;
  commitsAhead: number | null;
  openPullRequests: number | null;
};

export function projectInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? 'PR').toUpperCase();
}

export function formatProjectLastUpdated(iso: string | null): string {
  if (!iso) return 'UPDATED RECENTLY';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'UPDATED RECENTLY';
  const diffMs = Date.now() - then;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'UPDATED JUST NOW';
  if (hours < 24) return `UPDATED ${hours}H AGO`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'UPDATED YESTERDAY';
  if (days < 14) return `UPDATED ${days}D AGO`;
  return `UPDATED ${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
}

function derivePrimaryModule(
  manifest: ProjectCapabilityManifest,
  currentFocus: string | null,
  currentPhase: string,
): ProjectModuleId {
  const focus = (currentFocus ?? '').toUpperCase();
  if (focus.includes('IDENTITY')) return 'IDENTITY';
  if (focus.includes('BUILD') || focus.includes('PAGE') || focus.includes('QA')) return 'BUILDER';
  if (focus.includes('EVOLVE') || focus.includes('CAMPAIGN') || focus.includes('CONTENT')) return 'EVOLVE';
  if (focus.includes('PRODUCTION') || focus.includes('LAUNCH') || focus.includes('DEPLOY')) {
    return 'PRODUCTION';
  }

  const phase = currentPhase.toUpperCase();
  if (phase.includes('IDENTITY')) return 'IDENTITY';
  if (phase.includes('BUILD') || phase.includes('BLUEPRINT')) return 'BUILDER';
  if (phase.includes('EVOLVE') || phase.includes('MARKETING') || phase.includes('CONTENT')) return 'EVOLVE';
  if (phase.includes('PRODUCTION') || phase.includes('LAUNCH') || phase.includes('PRE')) {
    if (manifest.enabledModules.includes('PRODUCTION')) return 'PRODUCTION';
  }

  const primary = manifest.primaryModules.find((m) => m !== 'OVERVIEW' && m !== 'MORE');
  return primary ?? 'OVERVIEW';
}

function deriveStatus(
  entry: Site00ProjectIndexEntry,
  blockers: string[],
): { status: ProjectIndexStatus; dot: ProjectIndexStatusDot } {
  const phase = (entry.currentPhase ?? '').toUpperCase();
  if (blockers.length) return { status: 'BLOCKED', dot: 'red' };
  if (phase.includes('ARCHIV')) return { status: 'ARCHIVED', dot: 'gray' };
  if (phase.includes('ON HOLD') || phase.includes('ON_HOLD')) return { status: 'ON_HOLD', dot: 'amber' };
  if (phase.includes('PRE') && phase.includes('LAUNCH')) return { status: 'PRE_LAUNCH', dot: 'blue' };
  if (phase.includes('POST') && phase.includes('LAUNCH')) return { status: 'POST_LAUNCH', dot: 'green' };
  if (phase.includes('LIVE') || phase.includes('LAUNCHED')) return { status: 'LAUNCHED', dot: 'green' };
  if (phase.includes('CONFIG')) return { status: 'CONFIGURATION', dot: 'blue' };
  if (phase.includes('IDENTITY') || phase.includes('BUILD') || phase.includes('EXPLOR')) {
    return { status: 'IN_PROGRESS', dot: 'blue' };
  }
  if (phase.includes('NOT START')) return { status: 'NOT_STARTED', dot: 'gray' };
  return { status: 'ACTIVE', dot: 'green' };
}

export function buildProjectIndexItem(
  entry: Site00ProjectIndexEntry,
  options?: { ownerType?: ProjectIndexOwnerType; clientName?: string | null; openRoute?: string },
): ProjectIndexItem {
  const adapter = getProjectOperatingAdapter(entry.slug);
  const ctx = {
    projectDetail: {
      slug: entry.slug,
      displayName: entry.displayName,
      organizationUuid: entry.organizationUuid,
      classification: entry.classification,
      currentPhase: entry.currentPhase,
      focusNow: entry.focusNow,
      overview: { lifecycleStage: null, description: entry.name },
      command: { needsYou: [], blocked: [], focusNow: [], upcoming: [], deferred: [] },
      activity: entry.lastActivity ? [{ id: '1', summary: 'ACTIVITY', timestamp: entry.lastActivity }] : [],
    } as unknown as import('./types.js').Site00ProjectDetail,
  };

  const manifest = adapter.buildManifest(ctx);
  const operatingState = adapter.buildOperatingState(ctx);
  if (entry.focusNow) {
    operatingState.currentFocus = entry.focusNow.toUpperCase();
  }

  const progress = buildProjectProgressSummary(operatingState);
  const primaryModule = derivePrimaryModule(manifest, operatingState.currentFocus, entry.currentPhase);
  const enabledModules = manifest.enabledModules.filter((m) => m !== 'MORE') as ProjectModuleId[];
  const secondaryModuleCount = Math.max(0, enabledModules.length - 2);
  const { status, dot } = deriveStatus(entry, operatingState.blockers);
  const needsReviewCount = operatingState.needsYourEye.filter((n) => n.priority === 'HIGH').length;
  const isOnHold = status === 'ON_HOLD';
  const isArchived = status === 'ARCHIVED';
  const ownerType = options?.ownerType ?? (entry.classification.includes('CLIENT') ? 'CLIENT' : 'FOUNDER');
  const visual = resolveProjectIndexVisual(entry.slug, entry.displayName);
  const repoBinding = getProjectRepositoryBinding(entry.slug);

  return {
    projectId: entry.slug,
    projectName: entry.displayName.toUpperCase(),
    projectType: manifest.projectType,
    projectClassification: entry.classification.replace(/_/g, ' '),
    projectImage: visual.imageUrl,
    projectInitials: visual.initials,
    projectCapabilityManifest: manifest,
    primaryModule,
    enabledModules,
    secondaryModuleCount,
    ownerType,
    clientName: options?.clientName ?? null,
    currentPhase: entry.currentPhase.toUpperCase(),
    status,
    statusDot: dot,
    progress,
    currentFocus: operatingState.currentFocus ?? (entry.focusNow?.toUpperCase() ?? null),
    lastUpdatedAt: entry.lastActivity,
    lastUpdatedLabel: formatProjectLastUpdated(entry.lastActivity),
    needsReviewCount,
    activeTaskCount: needsReviewCount,
    isArchived,
    isOnHold,
    clientFacing: manifest.clientFacing,
    internalProject: manifest.internalProject,
    openRoute: options?.openRoute ?? projectModulePath(entry.slug, 'OVERVIEW'),
    descriptor: adapter.getTagline(ctx) ?? entry.currentSystem?.toUpperCase() ?? null,
    repositorySlug:
      repoBinding.repositoryOwner && repoBinding.repositoryName
        ? `${repoBinding.repositoryOwner}/${repoBinding.repositoryName}`
        : null,
    repositoryStatus: repoBinding.status === 'BOUND' ? 'CONNECTED' : repoBinding.status,
    commitsAhead: null,
    openPullRequests: null,
  };
}
