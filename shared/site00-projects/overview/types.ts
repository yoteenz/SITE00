/**
 * B5.9R7 — Project overview adapter contract.
 * Shared structure; project-specific intelligence via adapters.
 */

import type { GeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import type { ProjectOperatingState } from '../../site00-brand-lore/founderWorkspace/projectOperatingState/types.js';
import type { ProjectCodebaseIntelligence } from '../technical/types.js';
import type { ProjectProgressSummary } from '../projectProgressSummary.js';

export type ProjectOverviewSignalTone = 'green' | 'blue' | 'amber' | 'red' | 'neutral';

export type ProjectOverviewSignal = {
  id: string;
  title: string;
  value: string;
  status: string;
  tone: ProjectOverviewSignalTone;
  meta?: string;
};

export type ProjectOverviewActionCard = {
  label: string;
  sublabel?: string;
  href?: string;
};

export type ProjectOverviewVisual = {
  imageUrl: string | null;
  initials: string;
  visualClass: string;
  accent: string;
  accentBg: string;
};

export type ProjectOverviewViewModel = {
  projectId: string;
  displayName: string;
  descriptor: string;
  phase: string;
  lifecycleBadge?: string | null;
  visual: ProjectOverviewVisual;
  moduleChips: string[];
  progress: ProjectProgressSummary;
  needsYourEyeCount: number;
  blockerCount: number;
  primarySignals: ProjectOverviewSignal[];
  currentFocus: ProjectOverviewActionCard | null;
  nextMilestone: ProjectOverviewActionCard | null;
  recentActivity: Array<{ id: string; summary: string; timestamp: string | null }>;
  primaryAction: ProjectOverviewActionCard;
  partialState: boolean;
  partialMessage: string | null;
  adapterId: string;
};

export type ProjectOverviewAdapterContext = {
  generalized: GeneralizedProjectOperatingState;
  ndxOperatingState?: ProjectOperatingState | null;
  technicalIntelligence?: ProjectCodebaseIntelligence | null;
  viewMode: 'FOUNDER' | 'CLIENT';
};

export type ProjectOverviewAdapter = {
  adapterId: string;
  projectId: string;
  usesSpecializedOverview: boolean;
  stateSource: 'GENERALIZED' | 'PROJECT_OPERATING_STATE';
  buildFounderOverview(ctx: ProjectOverviewAdapterContext): ProjectOverviewViewModel;
  buildClientOverview(ctx: ProjectOverviewAdapterContext): ProjectOverviewViewModel;
};
