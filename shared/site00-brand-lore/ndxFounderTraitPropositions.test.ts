/**
 * P0.5E.4A — Founder trait proposition tests.
 */

import { describe, expect, it } from 'vitest';
import {
  buildNdxFounderTraitForensicReport,
  groupFounderTraitsBySection,
  migrateFounderTraitPropositions,
  NDX_FOUNDER_TRAIT_PROPOSITIONS,
} from './ndxEmbodiedCharacterFounderDiscovery/ndxFounderTraitPropositions.js';
import { buildNdxFounderCharacterDiscoveryRun } from './ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';

describe('ndxFounderTraitPropositions', () => {
  it('uses fluent founder prompts instead of jargon fragments', () => {
    const report = buildNdxFounderTraitForensicReport();
    expect(report.traits.length).toBe(NDX_FOUNDER_TRAIT_PROPOSITIONS.length);
    const first = report.traits.find((t) => t.traitId === 'psych-notice-0')!;
    expect(first.founderPrompt).toContain('contradicts what they said');
    expect(first.statement).not.toMatch(/^CONTRADICTIONS BETWEEN/i);
    expect(first.category).toBe('HOW SHE PAYS ATTENTION');
    expect(first.confidence).toBe('HYPOTHESIS');
  });

  it('groups traits into readable sections', () => {
    const report = buildNdxFounderTraitForensicReport();
    const groups = groupFounderTraitsBySection(report.traits);
    expect(groups.length).toBeGreaterThanOrEqual(5);
    expect(groups[0]!.traits.length).toBeGreaterThan(0);
  });

  it('migrates legacy forensic traits to v2 propositions', () => {
    const legacy = buildNdxFounderCharacterDiscoveryRun();
    legacy.traitPropositionVersion = null;
    legacy.forensicReport = {
      ...legacy.forensicReport,
      traits: [
        {
          traitId: 'psych-notice-0',
          category: 'PSYCHOLOGY',
          statement: 'CONTRADICTIONS BETWEEN WHAT SOMEONE SAID NOW VS SIX MONTHS AGO',
          authority: 'SYSTEM_SEEDED',
          confidence: 'HYPOTHESIS',
        },
      ],
    };
    const migrated = migrateFounderTraitPropositions({
      forensicReport: legacy.forensicReport,
      traitPropositionVersion: legacy.traitPropositionVersion,
    });
    expect(migrated.migrated).toBe(true);
    expect(migrated.forensicReport.traits.length).toBe(NDX_FOUNDER_TRAIT_PROPOSITIONS.length);
  });

  it('new runs ship with proposition version', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    expect(run.traitPropositionVersion).toBeTruthy();
    expect(run.forensicReport.traits.every((t) => t.founderPrompt?.length)).toBe(true);
  });
});
