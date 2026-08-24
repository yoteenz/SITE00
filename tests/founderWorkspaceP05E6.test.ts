import { describe, expect, it } from 'vitest';
import {
  attentionRequiresFounder,
  mapPackageStatusToAttention,
} from '../shared/site00-studio-world-production/founderWorkspace/attentionHierarchy.js';
import {
  buildDefaultExperimentJourneyStages,
  resolveExperimentStage,
} from '../shared/site00-studio-world-production/founderWorkspace/experimentJourney.js';
import {
  ndxExperimentJourneyStages,
  ndxFounderWorkspaceEnabled,
  ndxFounderWorkspaceNav,
  NDX_VERSION_LINEAGE,
} from '../src/site00/config/ndxFounderWorkspace';

describe('founder workspace P0.5E.6', () => {
  it('enables workspace only for ndxbook', () => {
    expect(ndxFounderWorkspaceEnabled('ndxbook')).toBe(true);
    expect(ndxFounderWorkspaceEnabled('other')).toBe(false);
  });

  it('maps founder review to attention hierarchy', () => {
    expect(mapPackageStatusToAttention('FOUNDER_REVIEW')).toBe('NEEDS_YOUR_DECISION');
    expect(attentionRequiresFounder('READY_TO_REVIEW')).toBe(true);
    expect(attentionRequiresFounder('ARCHIVED')).toBe(false);
  });

  it('provides seven workspace nav destinations for ndxbook', () => {
    const nav = ndxFounderWorkspaceNav('ndxbook');
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
    expect(nav.find((n) => n.id === 'ARCHIVE')?.href).toBe('/projects/ndxbook/archive');
  });

  it('maps experiment 01 into EXPRESS journey stage', () => {
    const stages = ndxExperimentJourneyStages();
    const stage = resolveExperimentStage('marketing-expression-experiment-01', stages);
    expect(stage?.stage).toBe('EXPRESS');
  });

  it('preserves version lineage for inspect layer (methodology not deleted)', () => {
    expect(NDX_VERSION_LINEAGE.length).toBeGreaterThanOrEqual(5);
    expect(NDX_VERSION_LINEAGE.some((v) => v.versionId === 'c6a' && v.isCurrent)).toBe(true);
  });

  it('builds six methodology journey stages', () => {
    expect(buildDefaultExperimentJourneyStages()).toHaveLength(6);
  });
});
