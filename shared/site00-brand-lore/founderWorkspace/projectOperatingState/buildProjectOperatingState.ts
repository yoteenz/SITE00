/**
 * B5.7 — Assemble canonical ProjectOperatingState from real stores.
 */

import type { ContentOperationsRun } from '../../contentOperations/types.js';
import type { MarketingCampaignProductionRun } from '../../../site00-studio-world-production/marketingCampaignProduction/types.js';
import { buildContentOpsOperationalPulse } from '../contentOperationsDeskAdapter.js';
import { auditEntry001State } from './entry001StateAudit.js';
import type {
  ProjectApprovalItem,
  ProjectEntryState,
  ProjectLabSystemCard,
  ProjectOperatingState,
  ProjectProductionCard,
} from './types.js';
import { isStaleDemoFixtureLabel } from '../../../site00-campaign-package/assetIngestion/staleDemoFixtures.js';

export type BuildProjectOperatingStateInput = {
  projectId: string;
  projectStateVersion: number;
  contentOpsRun: ContentOperationsRun | null;
  campaignProduction: MarketingCampaignProductionRun | null;
  entry001?: {
    activeArchiveCount: number;
    archivedRemovedCount: number;
    packageDeliverableCount: number;
    carouselSlideCount: number;
    storyFrameCount: number;
    packageIncomplete: boolean;
    needsFounderReview: boolean;
  };
  expressionEngine?: {
    entry002Stage: string;
    entry003NeedsReview: boolean;
  };
  characterContinuity?: {
    systemReady: boolean;
    canonPartial: boolean;
    visualAuthorityNeeded: boolean;
  };
};

function buildNdxbookEntries(input: BuildProjectOperatingStateInput): ProjectEntryState[] {
  const e1 = input.entry001;
  const ee = input.expressionEngine;

  const entry001Stage = e1?.packageIncomplete
    ? 'PACKAGE_ASSEMBLY'
    : e1?.needsFounderReview
      ? 'FOUNDER_REVIEW'
      : e1 && e1.carouselSlideCount >= 4
        ? 'PRODUCTION'
        : 'PACKAGE_ASSEMBLY';

  const entry002Stage: ProjectEntryState['stage'] =
    ee?.entry002Stage === 'STORYBOARD' ? 'STORYBOARD' : ee?.entry002Stage === 'PRODUCTION' ? 'PRODUCTION' : 'STORYBOARD';

  const entry003Stage: ProjectEntryState['stage'] = ee?.entry003NeedsReview ? 'FOUNDER_REVIEW' : 'CREATIVE_DIRECTION';

  return [
    {
      entryId: 'entry-001',
      entryNumber: 1,
      title: 'WHO TF IS WE?',
      subtitle: 'Britney Spears / Media Complicity',
      stage: entry001Stage,
      stageLabel: entry001Stage.replace(/_/g, ' '),
      needsFounderReview: Boolean(e1?.needsFounderReview),
      isCanon: false,
      href: `/projects/${input.projectId}/content-operations/campaign-board/entry/001`,
    },
    {
      entryId: 'entry-002',
      entryNumber: 2,
      title: 'OH, NOW IT WAS FUN?',
      subtitle: '2016 IG Baddie Fashion',
      stage: entry002Stage,
      stageLabel: entry002Stage.replace(/_/g, ' '),
      needsFounderReview: false,
      isCanon: false,
      href: `/projects/${input.projectId}/expression-engine/campaign`,
    },
    {
      entryId: 'entry-003',
      entryNumber: 3,
      title: 'EMPLOYEES ONLY',
      subtitle: 'Clean Girl / effortless beauty / hidden labor',
      stage: entry003Stage,
      stageLabel: entry003Stage.replace(/_/g, ' '),
      needsFounderReview: Boolean(ee?.entry003NeedsReview),
      isCanon: false,
      href: `/projects/${input.projectId}/expression-engine/campaign`,
    },
  ];
}

function entriesToProductionCards(entries: ProjectEntryState[]): ProjectProductionCard[] {
  return entries
    .filter((e) => e.stage !== 'COMPLETE' && e.stage !== 'RESEARCH')
    .slice(0, 5)
    .map((e) => ({
      id: e.entryId,
      title: `ENTRY ${String(e.entryNumber).padStart(3, '0')} — ${e.title}`,
      tag: e.needsFounderReview ? 'NEEDS REVIEW' : e.stage === 'PACKAGE_ASSEMBLY' ? 'PACKAGE' : null,
      tone: e.needsFounderReview ? ('priority' as const) : ('default' as const),
      subtitle: `${e.subtitle} · ${e.stageLabel}`,
      href: e.href,
    }));
}

function buildLabSystems(input: BuildProjectOperatingStateInput): ProjectLabSystemCard[] {
  const cc = input.characterContinuity;
  const charStatus: ProjectLabSystemCard['status'] = cc?.visualAuthorityNeeded
    ? 'VISUAL_AUTHORITY_NEEDED'
    : cc?.canonPartial
      ? 'CANON_PARTIAL'
      : cc?.systemReady
        ? 'READY'
        : 'PARTIAL';

  return [
    {
      systemId: 'creative-intelligence',
      label: 'CREATIVE INTELLIGENCE',
      category: 'CREATIVE_BRAIN',
      status: 'ACTIVE',
      statusLabel: 'C1.9 LIVE',
      href: `/projects/${input.projectId}/expression-engine?phase=C1.9`,
    },
    {
      systemId: 'narrative-synthesis',
      label: 'NARRATIVE SYNTHESIS',
      category: 'CREATIVE_BRAIN',
      status: 'ACTIVE',
      statusLabel: 'C1.0',
    },
    {
      systemId: 'chapter-continuity',
      label: 'CHAPTER CONTINUITY',
      category: 'CONTINUITY',
      status: 'ACTIVE',
      statusLabel: 'CHAPTER 01',
    },
    {
      systemId: 'copy-intelligence',
      label: 'COPY INTELLIGENCE',
      category: 'CAMPAIGN_SYSTEMS',
      status: 'ACTIVE',
      statusLabel: 'C1.7–C1.9',
    },
    {
      systemId: 'brand-language',
      label: 'BRAND LANGUAGE',
      category: 'CAMPAIGN_SYSTEMS',
      status: 'ACTIVE',
      statusLabel: 'SUPABASE',
    },
    {
      systemId: 'campaign-package',
      label: 'CAMPAIGN PACKAGE SYSTEM',
      category: 'CAMPAIGN_SYSTEMS',
      status: input.entry001?.packageIncomplete ? 'PARTIAL' : 'ACTIVE',
      statusLabel: input.entry001?.packageIncomplete ? 'IN PROGRESS' : 'B5.6R1',
      href: `/projects/${input.projectId}/content-operations/campaign-board/entry/001`,
    },
    {
      systemId: 'character-continuity',
      label: 'CHARACTER / NDX CONTINUITY',
      category: 'CHARACTER',
      status: charStatus,
      statusLabel: charStatus.replace(/_/g, ' '),
      href: `/projects/${input.projectId}/character-discovery`,
    },
  ];
}

export function buildProjectOperatingState(input: BuildProjectOperatingStateInput): ProjectOperatingState {
  const pulse = buildContentOpsOperationalPulse(input.contentOpsRun, input.projectId);
  const entries = buildNdxbookEntries(input);
  const inProduction = entriesToProductionCards(entries);

  const currentWork = entries
    .filter((e) => ['PACKAGE_ASSEMBLY', 'PRODUCTION', 'STORYBOARD', 'CREATIVE_DIRECTION'].includes(e.stage))
    .map((e) => `ENTRY ${String(e.entryNumber).padStart(3, '0')} — ${e.stageLabel}`);

  const approvalsNeeded: ProjectApprovalItem[] = entries
    .filter((e) => e.needsFounderReview)
    .map((e) => ({
      id: e.entryId,
      label: `Entry ${String(e.entryNumber).padStart(3, '0')} ${e.stageLabel}`,
      priority: 'HIGH' as const,
      href: e.href,
    }));

  const opportunities =
    input.contentOpsRun?.opportunities
      ?.filter((o) => !isStaleDemoFixtureLabel(o.subject))
      .slice(0, 5)
      .map((o) => ({
        label: o.characterFirst?.spokenPremise ?? o.subject,
        score: o.rank?.compositeScore ? o.rank.compositeScore.toFixed(2) : undefined,
      })) ?? [];

  const signals: Array<{ label: string; strength?: string }> = [];

  const radarItems = opportunities.length
    ? opportunities.map((o) => o.label)
    : [];

  const entry001Audit = auditEntry001State({
    activeArchiveCount: input.entry001?.activeArchiveCount ?? 0,
    archivedRemovedCount: input.entry001?.archivedRemovedCount ?? 0,
    packageDeliverableCount: input.entry001?.packageDeliverableCount ?? 0,
    carouselSlideCount: input.entry001?.carouselSlideCount ?? 0,
    storyFrameCount: input.entry001?.storyFrameCount ?? 0,
  });

  if (entry001Audit.activeArchiveCount === 0 && entry001Audit.carouselSlideCount > 0) {
    pulse.counts.beingMade = Math.max(pulse.counts.beingMade, inProduction.length);
  }

  return {
    projectId: input.projectId,
    projectStateVersion: input.projectStateVersion,
    lastUpdatedAt: new Date().toISOString(),
    chapterId: 'chapter-01',
    chapterTitle: 'WHICH ONE IS IT?',
    pulse,
    entries,
    inProduction,
    currentWork,
    approvalsNeeded,
    opportunities,
    signals: signals.length ? signals : [],
    radarItems,
    labSystems: buildLabSystems(input),
    entry001Audit,
  };
}
