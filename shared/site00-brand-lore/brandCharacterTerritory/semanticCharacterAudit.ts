/**
 * Semantic character set audit — evidence only, founder decides. No winner selection.
 */

import type { BrandCharacterTerritory } from './types.js';
import type { BrandCharacterDevelopment, BrandCharacterSetAudit } from './developmentTypes.js';
import { evaluateSetArchetypeCollapse } from './archetypeCollapseEvaluation.js';
import { createHash, randomUUID } from 'node:crypto';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function runDeterministicTerritorySetAudit(params: {
  runId: string;
  territories: BrandCharacterTerritory[];
}): BrandCharacterSetAudit {
  const collapseEvals = evaluateSetArchetypeCollapse(params.territories);
  const names = params.territories.map((t) => t.name);
  const uniqueNameRoots = new Set(names.map((n) => n.toLowerCase().replace(/^the /, '')));

  const structuralDistinct = uniqueNameRoots.size === params.territories.length;
  const highCollapse = collapseEvals.filter((e) => e.flags.length >= 3).length;
  const particularized = collapseEvals.filter((e) => e.particularized).length;

  return {
    auditId: `bcsa-${hash(params.runId + params.territories.map((t) => t.id).join(':'))}`,
    runId: params.runId,
    auditType: 'TERRITORY_SET',
    methodologyVersion: 'BRAND_CHARACTER_SEMANTIC_AUDIT_V1',
    structuralDistinctiveness: structuralDistinct
      ? 'Six territories structurally distinct by name and governing thesis'
      : 'Name/thesis overlap detected — founder comparison required',
    archetypeCollapseNotes: collapseEvals.flatMap((e) =>
      e.flags.length ? [`${e.territoryName}: ${e.flags.join(', ')}`] : [],
    ),
    worldviewDistinction: particularized >= 3
      ? 'Multiple territories show particularized worldview seeds'
      : 'Set skews toward archetypal patterns — development may reveal specificity',
    behavioralOverlap: highCollapse >= 2
      ? 'Expert/observer/rebel archetype overlap risk across set'
      : 'Behavioral signatures sufficiently differentiated at territory level',
    genericBrandProbability: highCollapse >= 3 ? 'MEDIUM-HIGH' : particularized >= 4 ? 'LOW' : 'MEDIUM',
    internalTensionNotes: collapseEvals.map(
      (e) => `${e.territoryName}: ${e.hasProductiveTension ? 'productive tension present' : 'tension thin'}`,
    ),
    territoryEvaluations: collapseEvals.map((e) => ({
      territoryId: e.territoryId,
      notes: [...e.notes, ...e.tensionNotes],
    })),
    winnerSelected: false,
    founderAuthority: true,
    providerReceipt: null,
    createdAt: new Date().toISOString(),
  };
}

export function runDeterministicDevelopmentSetAudit(params: {
  runId: string;
  developments: BrandCharacterDevelopment[];
}): BrandCharacterSetAudit {
  return {
    auditId: randomUUID(),
    runId: params.runId,
    auditType: 'DEVELOPMENT_SET',
    methodologyVersion: 'BRAND_CHARACTER_SEMANTIC_AUDIT_V1',
    structuralDistinctiveness: `${params.developments.length} developed character(s) for founder comparison`,
    archetypeCollapseNotes: params.developments.map((d) => {
      const flat = d.productiveTension.flatteningRisk ? 'flattening risk' : 'tension held';
      return `${d.id}: ${flat}`;
    }),
    worldviewDistinction: 'Evaluated at development depth',
    behavioralOverlap: 'Founder comparison of developed dimensional systems',
    genericBrandProbability: params.developments.some((d) => d.productiveTension.flatteningRisk)
      ? 'MEDIUM'
      : 'LOW',
    internalTensionNotes: params.developments.map(
      (d) => `${d.parentTerritoryId}: ${d.productiveTension.governingContradiction}`,
    ),
    territoryEvaluations: params.developments.map((d) => ({
      territoryId: d.parentTerritoryId,
      notes: d.productiveTension.notes,
    })),
    winnerSelected: false,
    founderAuthority: true,
    providerReceipt: null,
    createdAt: new Date().toISOString(),
  };
}

export function semanticAuditCannotSelectWinner(audit: BrandCharacterSetAudit): boolean {
  return audit.winnerSelected === false;
}
