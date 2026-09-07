/**
 * Expression Engine V0 — orchestrates brand → entry → format → production → QA → lineage.
 */

import { compileAllFormatExpressions, compileFormatExpression } from '../../../shared/site00-expression-engine/formatContracts.js';
import type {
  ConceptCollapseGateResult,
  CreativeEntry,
  CreativeObjective,
  ExpressionEngineBrandContext,
  ExpressionProductionPlan,
  FormatNativeQAResult,
  FounderJudgmentRecord,
  GenerationReceipt,
  RouteProductionToolResult,
} from '../../../shared/site00-expression-engine/types.js';
import type { CreativeConceptTerritoryV2 } from '../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import { conceptCollapseBlocksDispatch, runConceptCollapseGate } from './conceptCollapseGate.js';
import { closeEntry001Phase1 } from './entry001Close.js';
import { reconstructEntry001, resolveEntry001Objective } from './entry001Forensic.js';
import { compileEntry002Handoff, resolveEntry002Objective } from './entry002Handoff.js';
import {
  compileEntry002TerritoryBrief,
  prepareEntry002ForTerritoryJudgment,
} from './entry002Territories.js';
import {
  compileEntry002LockedEntry,
  compileEntry002ProductionBlueprint,
} from './entry002Blueprint.js';
import { evaluateEntryReadiness } from './entryReadiness.js';
import { getEntry, listEntriesForProject, recordFounderJudgment, saveEntry } from './entryStore.js';
import { runFormatNativeQA } from './formatNativeQA.js';
import { registerGeneration, listGenerationReceiptsForEntry } from './lineageRegistration.js';
import { resolveBrandContext, resolveNdxbookProofContext } from './projectScope.js';
import { routeProductionTool } from './productionRouting.js';
import { runBlockingSequenceQA } from './sequenceQAGate.js';

export type ResolveEntryInput = {
  brandId: string;
  projectId: string;
  entryNumber: number;
};

export async function resolveBrandContextForEngine(
  input: Parameters<typeof resolveBrandContext>[0],
): Promise<ExpressionEngineBrandContext> {
  return resolveBrandContext(input);
}

export function resolveCreativeObjective(entry: CreativeEntry): CreativeObjective | null {
  if (entry.entryNumber === 1) return resolveEntry001Objective();
  if (entry.entryNumber === 2) return resolveEntry002Objective();
  return null;
}

export async function resolveEntry(input: ResolveEntryInput): Promise<CreativeEntry | null> {
  await resolveBrandContext({ brandId: input.brandId, projectId: input.projectId });

  const entryId = `entry-${String(input.entryNumber).padStart(3, '0')}`;
  const existing = getEntry(entryId);
  if (existing) return existing;

  if (input.brandId === 'ndxbook' && input.entryNumber === 1) {
    const entry = reconstructEntry001();
    return saveEntry(entry);
  }

  if (input.brandId === 'ndxbook' && input.entryNumber === 2) {
    const entry = compileEntry002LockedEntry();
    return saveEntry(entry);
  }

  return null;
}

export function resolveConceptTerritory(entry: CreativeEntry): { territoryId: string | null; locked: boolean } {
  return {
    territoryId: entry.territoryId,
    locked: Boolean(entry.territoryId),
  };
}

export function compileWorldExpression(entry: CreativeEntry): { worldId: string | null; thesis: string } {
  const objective = resolveCreativeObjective(entry);
  return {
    worldId: entry.worldExpressionId,
    thesis: objective?.thesis ?? entry.title,
  };
}

export function compileFormatPlan(entry: CreativeEntry) {
  return entry.formatExpressions.length ? entry.formatExpressions : compileAllFormatExpressions();
}

export function compileProductionPlan(entry: CreativeEntry): ExpressionProductionPlan | null {
  return entry.productionPlan;
}

export function runFormatNativeQAForAdaptation(
  sourceFormat: Parameters<typeof runFormatNativeQA>[0]['sourceFormat'],
  targetFormat: Parameters<typeof runFormatNativeQA>[0]['targetFormat'],
  adaptationKind: Parameters<typeof runFormatNativeQA>[0]['adaptationKind'],
): FormatNativeQAResult {
  return runFormatNativeQA({ sourceFormat, targetFormat, adaptationKind });
}

export function runConceptCollapseGateForTerritories(
  concepts: CreativeConceptTerritoryV2[],
): ConceptCollapseGateResult {
  return runConceptCollapseGate(concepts);
}

export function dispatchBlockedByConceptCollapse(concepts: CreativeConceptTerritoryV2[]): boolean {
  return conceptCollapseBlocksDispatch(runConceptCollapseGate(concepts));
}

export function routeProductionToolForEntry(
  entry: CreativeEntry,
  taskClass: Parameters<typeof routeProductionTool>[0]['taskClass'],
  format: Parameters<typeof routeProductionTool>[0]['format'],
): RouteProductionToolResult {
  return routeProductionTool({
    taskClass,
    format,
    brandId: entry.brandId,
    entryId: entry.id,
  });
}

export function registerEntryGeneration(
  entry: CreativeEntry,
  params: Omit<Parameters<typeof registerGeneration>[0], 'projectId' | 'brandId' | 'entryId'>,
): { receipt: GenerationReceipt; entry: CreativeEntry } {
  const receipt = registerGeneration({
    projectId: entry.projectId,
    brandId: entry.brandId,
    entryId: entry.id,
    ...params,
  });

  const updated: CreativeEntry = {
    ...entry,
    generationReceipts: [...entry.generationReceipts, receipt],
    assetIds: [...entry.assetIds, receipt.assetId],
  };

  return { receipt, entry: saveEntry(updated) };
}

export function recordEntryFounderJudgment(
  entry: CreativeEntry,
  params: Omit<Parameters<typeof recordFounderJudgment>[0], 'entry'>,
): CreativeEntry {
  return recordFounderJudgment({ entry, ...params });
}

export function evaluateEntryProductionReadiness(entry: CreativeEntry) {
  return evaluateEntryReadiness(entry);
}

export async function bootstrapB1Phase2(): Promise<{
  entry002: CreativeEntry;
  blueprint: ReturnType<typeof compileEntry002ProductionBlueprint>;
  entry002Readiness: ReturnType<typeof evaluateEntryReadiness>;
  brandContext: ExpressionEngineBrandContext;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  const brandContext = await resolveNdxbookProofContext();
  const blueprint = compileEntry002ProductionBlueprint();
  const entry002 = saveEntry(compileEntry002LockedEntry());

  return {
    entry002,
    blueprint,
    entry002Readiness: evaluateEntryReadiness(entry002),
    brandContext,
  };
}

export async function bootstrapB1Phase1(): Promise<{
  entry001: CreativeEntry;
  entry002: CreativeEntry;
  tiktokPlan: ReturnType<typeof closeEntry001Phase1>['tiktokPlan'];
  xExpression: ReturnType<typeof closeEntry001Phase1>['xExpression'];
  founderJudgmentReadiness: ReturnType<typeof closeEntry001Phase1>['founderJudgmentReadiness'];
  entry001Readiness: ReturnType<typeof evaluateEntryReadiness>;
  entry002TerritoryBrief: ReturnType<typeof compileEntry002TerritoryBrief>;
  brandContext: ExpressionEngineBrandContext;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  const brandContext = await resolveNdxbookProofContext();
  const closed = closeEntry001Phase1();
  const entry001 = saveEntry(closed.entry);
  const entry002 = saveEntry(prepareEntry002ForTerritoryJudgment());

  return {
    entry001,
    entry002,
    tiktokPlan: closed.tiktokPlan,
    xExpression: closed.xExpression,
    founderJudgmentReadiness: closed.founderJudgmentReadiness,
    entry001Readiness: evaluateEntryReadiness(entry001),
    entry002TerritoryBrief: compileEntry002TerritoryBrief(),
    brandContext,
  };
}

export async function bootstrapNdxbookExpressionProof(): Promise<{
  entry001: CreativeEntry;
  entry002: CreativeEntry;
  brandContext: ExpressionEngineBrandContext;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  const brandContext = await resolveNdxbookProofContext();
  const entry001 = (await resolveEntry({
    brandId: brandContext.brandId,
    projectId: brandContext.projectId,
    entryNumber: 1,
  }))!;

  const entry002 = (await resolveEntry({
    brandId: brandContext.brandId,
    projectId: brandContext.projectId,
    entryNumber: 2,
  }))!;

  return { entry001, entry002, brandContext };
}

export function oneEntryOwnsMultipleFormats(entry: CreativeEntry): boolean {
  return entry.formatExpressions.length > 1;
}

export { runBlockingSequenceQA, compileFormatExpression, listEntriesForProject, listGenerationReceiptsForEntry };
export { bootstrapB2ChapterSystem, getChapter01Snapshot } from './chapterBootstrap.js';
export { validateEntryByNumber, validateEntryAgainstChapterGrammar } from './chapterGrammarValidation.js';
export { runChapterRepetitionQA, entryPairRepetitionSummary } from './chapterRepetitionQA.js';
export { listEntriesForChapter, getChapterByNumber, getChapterGrammarForChapter } from './chapterStore.js';
