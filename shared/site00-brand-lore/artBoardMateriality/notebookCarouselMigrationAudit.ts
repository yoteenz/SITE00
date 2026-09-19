/**
 * P0.5C.7 — V2.3 carousel path migration audit.
 */

import { compileArtBoardMaterialityFalPrompt } from './falPromptCompilerV23.js';
import { V23_FAL_COMPILER_VERSION } from './v23GenerationAuthorityConstants.js';
import { NOTEBOOK_CAROUSEL_GRAMMAR_VERSION } from './notebookCarouselGrammarP05C7.js';

export type CarouselPathAuditEntry = {
  path: string;
  category: 'PROMPT_COMPILER' | 'EXPERIMENT' | 'APPROVAL_GATE' | 'FOUNDER_REVISION' | 'CAMPAIGN_ADAPTER' | 'INGESTION';
  status: 'MIGRATED' | 'NEEDS_MIGRATION' | 'COMPATIBLE';
  issues: string[];
  migrationAction: string;
};

export type NotebookCarouselMigrationAudit = {
  auditedAt: string;
  compilerVersion: string;
  grammarVersion: string;
  entries: CarouselPathAuditEntry[];
  templateDrivers: string[];
  lowercaseViolations: string[];
  photoIntegrationIssues: string[];
  physicalPageGaps: string[];
  migrationPlan: string[];
};

export function auditV23CarouselPaths(): NotebookCarouselMigrationAudit {
  const entries: CarouselPathAuditEntry[] = [
    {
      path: 'artBoardMateriality/falPromptCompilerV23.ts',
      category: 'PROMPT_COMPILER',
      status: 'MIGRATED',
      issues: [],
      migrationAction: 'P0.5C.7 notebook sections integrated',
    },
    {
      path: 'artBoardMateriality/approvalGate.ts',
      category: 'APPROVAL_GATE',
      status: 'MIGRATED',
      issues: [],
      migrationAction: 'Notebook carousel gates wired',
    },
    {
      path: 'founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.ts',
      category: 'INGESTION',
      status: 'COMPATIBLE',
      issues: [],
      migrationAction: 'Registered as north star evidence',
    },
    {
      path: 'artBoardMateriality/experiment01V23.ts',
      category: 'EXPERIMENT',
      status: 'COMPATIBLE',
      issues: [],
      migrationAction: 'Inherits updated compiler on regeneration',
    },
    {
      path: 'marketingCampaignProduction/ndxbookExperiment01Adapter.ts',
      category: 'CAMPAIGN_ADAPTER',
      status: 'COMPATIBLE',
      issues: [],
      migrationAction: 'Inherits updated compiler on regeneration',
    },
  ];

  return {
    auditedAt: new Date().toISOString(),
    compilerVersion: V23_FAL_COMPILER_VERSION,
    grammarVersion: NOTEBOOK_CAROUSEL_GRAMMAR_VERSION,
    entries,
    templateDrivers: [
      'Legacy prompts without PHYSICAL PAGE OBJECT section',
      'Vague scrapbook-like instruction',
      'Header/body/footer defaults',
      'Clean digital photo rectangle',
    ],
    lowercaseViolations: ['Typography may contain mixed case before gate — authentic source exempt'],
    photoIntegrationIssues: ['Some topics FULL_BLEED without torn/taped interaction'],
    physicalPageGaps: ['Pre-C.7 artifacts lack physicalLineageSignals — immutable historical assets'],
    migrationPlan: [
      'P0.5C.7 compiler sections active for regenerations',
      'Notebook QA gates enforce physical page + uppercase + construction history',
      'North star registered — founder review before pilot',
      'Historical assets preserved — REPLAY HISTORICAL for old snapshots',
      'Pilot: subscription receipt topic 1',
      'Founder triggers regeneration — no auto provider spend',
    ],
  };
}

export function auditPromptForNotebookGrammar(params: {
  artifact: { topic: string; subject: string; supportingLanguage: string[]; headline: string; subhead: string };
  contract: Parameters<typeof compileArtBoardMaterialityFalPrompt>[0]['contract'];
}): { passes: boolean; missingSections: string[] } {
  const compiled = compileArtBoardMaterialityFalPrompt({
    artifact: params.artifact as never,
    contract: params.contract,
  });
  const required = [
    'PHYSICAL PAGE OBJECT',
    'PAGE MATERIAL',
    'BINDING / EDGE',
    'CONSTRUCTION HISTORY',
    'PHOTO INTEGRATION',
    'UPPERCASE AUTHORSHIP',
    'HAND MARKS',
    'LIME INTERRUPTION',
    'NEGATIVE TEMPLATE CONSTRAINTS',
    'VISUAL AUTHORITY CHAIN (P0.5C.7)',
  ];
  const missingSections = required.filter((s) => !compiled.prompt.includes(s));
  return { passes: missingSections.length === 0, missingSections };
}
