import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildContentOpsOperationalPulse,
  contentPackageToAssetPresentation,
  opportunityToEditorialLead,
} from './contentOperationsDeskAdapter.js';
import { buildCampaignFeedAssets, campaignBoardInspectPayload } from './campaignWallAdapter.js';
import { ndxExperimentJourney, ndxWorkspaceNav } from './ndxFounderWorkspaceConfig.js';
import {
  packageAttentionLevel,
  packageStatusLabel,
} from '../../site00-studio-world-production/founderWorkspace/attentionHierarchy.js';
import type { ContentOperationsRun } from '../contentOperations/types.js';

const ROOT = join(process.cwd());

describe('Founder Workspace P0 — architecture', () => {
  it('generic attention hierarchy maps package statuses without mutating enums', () => {
    expect(packageAttentionLevel('FOUNDER_REVIEW')).toBe('NEEDS_DECISION');
    expect(packageStatusLabel('FORMULATED')).toBe('IN PRODUCTION');
  });

  it('NDX workspace nav exposes seven founder destinations', () => {
    const nav = ndxWorkspaceNav('ndxbook');
    expect(nav).toHaveLength(7);
    expect(nav.map((n) => n.id)).toEqual([
      'OVERVIEW',
      'CREATE',
      'REVIEW',
      'LEARN',
      'INTELLIGENCE',
      'CHARACTER',
      'ARCHIVE',
    ]);
  });

  it('methodology journey has six stages', () => {
    const stages = ndxExperimentJourney('ndxbook');
    expect(stages).toHaveLength(6);
    expect(stages[0]!.stageId).toBe('UNDERSTAND');
    expect(stages[4]!.stageId).toBe('PUBLISH');
  });

  it('content ops desk derives pulse from canonical run — no fake counts', () => {
    const run = {
      status: 'SLATE_PROPOSED',
      opportunities: [{ id: 'o1', subject: 'TEST', rank: { compositeScore: 0.5, whyHighPriority: [] } }],
      contentPackages: [],
      activeSlate: { status: 'PROPOSED', contentCandidates: [{}], productionCostEstimate: 0, topicBalance: {}, formatBalance: {} },
    } as unknown as ContentOperationsRun;
    const pulse = buildContentOpsOperationalPulse(run, 'ndxbook');
    expect(pulse.counts.needYourEye).toBeGreaterThan(0);
    expect(pulse.primaryAction?.label).toContain('APPROVE SLATE');
  });

  it('editorial leads hide raw score as primary — score only for inspect', () => {
    const lead = opportunityToEditorialLead({
      id: 'x',
      subject: 'CORPORATE LAYOFF MEMO LANGUAGE',
      rank: { compositeScore: 0.59, whyHighPriority: ['Pattern forming in memo language'] },
    } as ContentOperationsRun['opportunities'][number]);
    expect(lead.headline).toBe('CORPORATE LAYOFF MEMO LANGUAGE');
    expect(lead.leadLine).not.toContain('0.59');
    expect(lead.inspectScore).toBe(0.59);
  });

  it('remodeled pages use FounderWorkspaceShell', () => {
    const contentOps = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsPage.tsx'), 'utf8');
    const campaign = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsCampaignBoardPage.tsx'), 'utf8');
    const exp01 = readFileSync(join(ROOT, 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'), 'utf8');
    const ci = readFileSync(join(ROOT, 'src/site00/pages/ProjectCulturalIntelligencePage.tsx'), 'utf8');
    const perf = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsPerformancePage.tsx'), 'utf8');
    const character = readFileSync(join(ROOT, 'src/site00/pages/ProjectEmbodiedCharacterDiscoveryPage.tsx'), 'utf8');
    expect(contentOps).toContain('FounderWorkspaceShell');
    expect(contentOps).toContain('OperationalPulsePanel');
    expect(campaign).toContain('CampaignProductionWall');
    expect(exp01).toContain('FounderWorkspaceShell');
    expect(exp01).toContain('VersionTimeline');
    expect(ci).toContain('CulturalRadarRoom');
    expect(perf).toContain('PerformanceLearningRoom');
    expect(character).toContain('CharacterLabRoom');
  });

  it('methodology information moved to inspect — supersession in details', () => {
    const exp01 = readFileSync(join(ROOT, 'src/site00/pages/ProjectBrandMarketingExpressionExperiment01Page.tsx'), 'utf8');
    expect(exp01).toContain('GENERATION SUPERSEDED');
    expect(exp01).toContain('site00-fws-review__inspect');
  });

  it('generic components exist under founderWorkspace', () => {
    expect(readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/InspectorDrawer.tsx'), 'utf8')).toContain(
      'LAYER 3',
    );
    expect(readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/AssetReviewWorkspace.tsx'), 'utf8')).toContain(
      'UNDERSTAND',
    );
  });

  it('campaign inspect payload derives from run', () => {
    expect(campaignBoardInspectPayload(null)).toEqual({ status: undefined });
    expect(buildCampaignFeedAssets(null)).toEqual([]);
  });

  it('package presentation preserves internal status', () => {
    const p = contentPackageToAssetPresentation({
      id: 'p1',
      altText: 'TEST TOPIC',
      channel: 'INSTAGRAM_FEED',
      format: 'SINGLE_IMAGE',
      status: 'FORMULATED',
    } as ContentOperationsRun['contentPackages'][number]);
    expect(p.internalStatus).toBe('FORMULATED');
    expect(p.statusLabel).toBe('IN PRODUCTION');
  });
});
