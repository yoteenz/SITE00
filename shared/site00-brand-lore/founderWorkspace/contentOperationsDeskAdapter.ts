/**
 * Content Operations → Editorial Desk presentation adapter.
 */

import type {
  CreativeAssetPresentation,
  EditorialLeadPresentation,
  OperationalPulse,
} from '../../site00-studio-world-production/founderWorkspace/types.js';
import {
  opportunityLeadLine,
  packageAttentionLevel,
  packageStatusLabel,
} from '../../site00-studio-world-production/founderWorkspace/attentionHierarchy.js';
import type { ContentOperationsRun } from '../contentOperations/types.js';

export function buildContentOpsOperationalPulse(
  run: ContentOperationsRun | null,
  _projectSlug: string,
): OperationalPulse {
  const packages = run?.contentPackages ?? [];
  const needEye = packages.filter(
    (p) => p.status === 'FOUNDER_REVIEW' || p.status === 'FORMULATED',
  ).length;
  const beingMade = packages.filter(
    (p) => p.status === 'GENERATING' || p.status === 'DRAFT',
  ).length;
  const fromAudience = (run?.opportunities ?? []).filter(
    (o) =>
      o.summary?.toLowerCase().includes('audience') ||
      o.whyPotentiallyInteresting?.toLowerCase().includes('audience asked'),
  ).length;

  const slatePending = run?.activeSlate?.status === 'PROPOSED';

  let primaryAction: OperationalPulse['primaryAction'] = null;
  if (slatePending) {
    primaryAction = {
      label: 'APPROVE SLATE →',
      href: `#approve-slate`,
    };
  } else if (needEye > 0) {
    primaryAction = {
      label: 'REVIEW NEEDS ME →',
      href: `#in-production`,
    };
  }

  return {
    counts: {
      beingMade: beingMade || (run?.status === 'IN_PRODUCTION' ? packages.length : 0),
      needYourEye: needEye + (slatePending ? 1 : 0),
      developing: beingMade,
      fromAudience,
    },
    primaryAction,
    attentionLevel: needEye > 0 || slatePending ? 'NEEDS_YOUR_DECISION' : 'MOVING_WITHOUT_YOU',
  };
}

export function contentPackageToAssetPresentation(
  pkg: ContentOperationsRun['contentPackages'][number],
): CreativeAssetPresentation {
  return {
    id: pkg.id,
    title: pkg.altText ?? pkg.opportunityId,
    previewUrl: null,
    formatLabel: pkg.format.replace(/_/g, ' '),
    channelLabel: pkg.channel.replace(/_/g, ' '),
    attention: packageAttentionLevel(pkg.status),
    statusLabel: packageStatusLabel(pkg.status),
    internalStatus: pkg.status,
    subtitle: pkg.caption?.text?.slice(0, 80),
  };
}

export function opportunityToEditorialLead(
  opp: ContentOperationsRun['opportunities'][number],
): EditorialLeadPresentation {
  const cf = opp.characterFirst;
  const audienceAsk =
    opp.summary?.toLowerCase().includes('audience') ||
    opp.whyPotentiallyInteresting?.toLowerCase().includes('audience') ||
    cf?.firstPersonPremise.experienceMode === 'AUDIENCE_TRIGGERED';
  const headline = cf?.spokenPremise ?? opp.subject;
  const meta =
    cf?.firstPersonPremise.topicMetadata.join(' · ') ??
    opp.domains.join(' · ');
  return {
    id: opp.id,
    headline,
    leadLine: `${meta} — ${cf?.formulation.thoughtArcSummary ?? opportunityLeadLine({
      subject: opp.subject,
      whyHighPriority: opp.rank?.whyHighPriority,
      liveLineage: Boolean(opp.liveLineage),
      audienceAsk,
    })}`,
    attention: opp.status === 'SELECTED' ? 'READY_TO_REVIEW' : 'INFORMATIONAL',
    sourceHint: cf
      ? `${cf.characterBeat.replace(/_/g, ' ')} · ${cf.formulation.surfaceRecommendation.join(' + ')}`
      : opp.liveLineage
        ? 'Live intelligence'
        : (opp.sourceType?.replace(/_/g, ' ') ?? 'Editorial'),
    inspectScore: opp.rank?.compositeScore,
  };
}

export function getOpportunitySpokenPremise(opp: ContentOperationsRun['opportunities'][number]): string {
  return opp.characterFirst?.spokenPremise ?? opp.subject;
}

export function getOpportunityTopicMetadata(opp: ContentOperationsRun['opportunities'][number]): string {
  const cf = opp.characterFirst;
  if (cf) {
    return [...cf.firstPersonPremise.topicMetadata, ...cf.firstPersonPremise.categoryMetadata].join(' · ');
  }
  return opp.domains.join(' · ');
}

export function buildWeeklyRangeSummary(run: ContentOperationsRun | null): {
  topics: string[];
  formats: string[];
  candidateCount: number;
} | null {
  const slate = run?.activeSlate;
  if (!slate) return null;
  return {
    topics: Object.keys(slate.topicBalance),
    formats: Object.keys(slate.formatBalance),
    candidateCount: slate.contentCandidates.length,
  };
}
