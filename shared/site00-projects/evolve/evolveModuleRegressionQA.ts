/**
 * B5.9R3 — Evolve module regression QA (no domain leakage, no generic flattening).
 */

import { getProjectEvolveAdapter, ndxbookMustNotUseGenericEvolve } from './projectEvolveAdapterRegistry.js';
import type { ProjectEvolveAdapterState } from './types.js';

export type EvolveRegressionFinding = {
  code:
    | 'NDXBOOK_ENTRY_LEAK'
    | 'NDXBOOK_CHAPTER_LEAK'
    | 'FRONTAL_SLAYER_CAMPAIGN_LEAK'
    | 'AIO_MARKETING_STATE_LEAK'
    | 'GENERIC_EVOLVE_FLATTENING'
    | 'SPECIALIZED_EVOLVE_NOT_MOUNTED'
    | 'NDXBOOK_ZERO_CAMPAIGNS'
    | 'NDXBOOK_ENTRIES_MISSING'
    | 'NDXBOOK_CONTENT_OPS_MISSING'
    | 'NDXBOOK_LAB_MISSING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
};

export type EvolveModuleRegressionQAInput = {
  projectId: string;
  adapterMounted: boolean;
  evolveState: ProjectEvolveAdapterState;
  routesPresent: string[];
  subnavIds: string[];
  sourceFiles?: {
    evolveModuleSurface?: string;
    projectOperatingShell?: string;
  };
};

export function runEvolveModuleRegressionQA(input: EvolveModuleRegressionQAInput): EvolveRegressionFinding[] {
  const findings: EvolveRegressionFinding[] = [];
  const adapter = getProjectEvolveAdapter(input.projectId);

  if (input.projectId === 'ndxbook') {
    if (!ndxbookMustNotUseGenericEvolve('ndxbook')) {
      findings.push({
        code: 'GENERIC_EVOLVE_FLATTENING',
        severity: 'CRITICAL',
        message: 'NDXBOOK RESOLVED GENERIC EVOLVE ADAPTER',
      });
    }
    if (!adapter.usesSpecializedSurface) {
      findings.push({
        code: 'SPECIALIZED_EVOLVE_NOT_MOUNTED',
        severity: 'CRITICAL',
        message: 'NDXBOOK EVOLVE SPECIALIZED SURFACE NOT MOUNTED',
      });
    }
    if (!input.adapterMounted) {
      findings.push({
        code: 'SPECIALIZED_EVOLVE_NOT_MOUNTED',
        severity: 'CRITICAL',
        message: 'NDXBOOK EVOLVE ADAPTER SURFACE NOT WIRED IN SHELL',
      });
    }
    if (input.evolveState.entriesAvailable.length < 3) {
      findings.push({
        code: 'NDXBOOK_ENTRIES_MISSING',
        severity: 'CRITICAL',
        message: 'NDXBOOK ENTRIES 001–003 NOT AVAILABLE IN EVOLVE STATE',
      });
    }
    if (
      input.evolveState.activeCampaigns === 0 &&
      input.evolveState.contentInProduction === 0 &&
      input.evolveState.entriesAvailable.length >= 3
    ) {
      findings.push({
        code: 'NDXBOOK_ZERO_CAMPAIGNS',
        severity: 'HIGH',
        message: 'NDXBOOK SHOWS 0 CAMPAIGNS WHILE ENTRIES EXIST',
      });
    }
    if (!input.subnavIds.includes('CONTENT_OPS')) {
      findings.push({
        code: 'NDXBOOK_CONTENT_OPS_MISSING',
        severity: 'HIGH',
        message: 'NDXBOOK EVOLVE SUBNAV MISSING CONTENT OPS',
      });
    }
    if (!input.subnavIds.includes('LAB')) {
      findings.push({
        code: 'NDXBOOK_LAB_MISSING',
        severity: 'HIGH',
        message: 'NDXBOOK EVOLVE SUBNAV MISSING LAB',
      });
    }
    const requiredRoutes = ['entry-001', 'expression-engine', 'lab'];
    for (const routeId of requiredRoutes) {
      if (!input.routesPresent.includes(routeId)) {
        findings.push({
          code: 'SPECIALIZED_EVOLVE_NOT_MOUNTED',
          severity: 'HIGH',
          message: `NDXBOOK EVOLVE ROUTE MISSING: ${routeId}`,
        });
      }
    }
  }

  if (input.projectId === 'frontal-slayer') {
    if (input.evolveState.entriesAvailable.some((e) => e.includes('entry-00'))) {
      findings.push({
        code: 'NDXBOOK_ENTRY_LEAK',
        severity: 'CRITICAL',
        message: 'FRONTAL SLAYER EVOLVE CONTAINS NDXBOOK ENTRY IDS',
      });
    }
    if (input.evolveState.chapterTitle?.includes('WHICH ONE IS IT')) {
      findings.push({
        code: 'NDXBOOK_CHAPTER_LEAK',
        severity: 'CRITICAL',
        message: 'FRONTAL SLAYER EVOLVE CONTAINS NDXBOOK CHAPTER TITLE',
      });
    }
  }

  if (input.projectId === 'all-in-one-enterprises') {
    if (input.evolveState.entriesAvailable.length > 0) {
      findings.push({
        code: 'NDXBOOK_ENTRY_LEAK',
        severity: 'CRITICAL',
        message: 'AIO EVOLVE CONTAINS NDXBOOK ENTRIES',
      });
    }
  }

  if (input.sourceFiles?.evolveModuleSurface && input.projectId === 'ndxbook') {
    if (!input.sourceFiles.evolveModuleSurface.includes('EvolveFounderWorkspaceBoard')) {
      findings.push({
        code: 'SPECIALIZED_EVOLVE_NOT_MOUNTED',
        severity: 'CRITICAL',
        message: 'NDXBOOK EVOLVE MISSING EvolveFounderWorkspaceBoard',
      });
    }
  }

  return findings;
}

export function evolveModuleRegressionPasses(input: EvolveModuleRegressionQAInput): boolean {
  return runEvolveModuleRegressionQA(input).filter((f) => f.severity === 'CRITICAL').length === 0;
}
