/**
 * Expression Engine V0 — entry readiness evaluator (explicit blockers, no MOSTLY_COMPLETE).
 */

import type { CreativeEntry, EntryReadinessResult } from '../../../shared/site00-expression-engine/types.js';
import { entry001TerritoryCollapsePass, runConceptCollapseGate } from './conceptCollapseGate.js';
import { runFormatNativeQA } from './formatNativeQA.js';
import { orphanAssetCannotReachProductionReady } from './lineageRegistration.js';

export function evaluateEntryReadiness(entry: CreativeEntry): EntryReadinessResult {
  const blockers: string[] = [];
  const checks: EntryReadinessResult['checks'] = [];

  const territoryLocked = Boolean(entry.territoryId);
  checks.push({ check: 'territory_locked', passed: territoryLocked, detail: entry.territoryId ?? 'missing' });
  if (!territoryLocked) blockers.push('territory not locked');

  const worldPresent = Boolean(entry.worldExpressionId);
  checks.push({ check: 'world_expression_present', passed: worldPresent });
  if (!worldPresent) blockers.push('world expression missing');

  const formatPlansPresent = entry.formatExpressions.length >= 8;
  checks.push({ check: 'format_plans_present', passed: formatPlansPresent, detail: `${entry.formatExpressions.length}/8` });
  if (!formatPlansPresent) blockers.push('format plans incomplete');

  const productionPlanPresent = Boolean(entry.productionPlan?.tasks.length);
  checks.push({ check: 'production_plan_present', passed: productionPlanPresent });
  if (!productionPlanPresent) blockers.push('production plan missing');

  const collapseResult =
    entry.entryNumber === 1 ? entry001TerritoryCollapsePass() : runConceptCollapseGate([]);
  checks.push({ check: 'concept_collapse_pass', passed: collapseResult.passed });
  if (!collapseResult.passed) blockers.push('concept collapse FAIL');

  const formatQAPass = entry.formatExpressions.every((f) => {
    if (f.status === 'QA_FAIL') return false;
    return true;
  });
  checks.push({ check: 'format_native_qa_pass', passed: formatQAPass });
  if (!formatQAPass) blockers.push('format-native QA FAIL on one or more formats');

  const requiredFormats = entry.formatExpressions.filter((f) =>
    ['REEL', 'CAROUSEL', 'COVER'].includes(f.format),
  );
  const assetsRegistered = entry.generationReceipts.length > 0 || entry.assetIds.length > 0;
  checks.push({ check: 'required_assets_registered', passed: assetsRegistered });
  if (!assetsRegistered) blockers.push('no assets registered');

  const orphanCheck = entry.generationReceipts.every(
    (r) => !orphanAssetCannotReachProductionReady(r),
  );
  checks.push({ check: 'lineage_complete', passed: orphanCheck });
  if (!orphanCheck) blockers.push('orphan asset detected');

  const reelFormat = entry.formatExpressions.find((f) => f.format === 'REEL');
  const audioRequired = reelFormat?.audioRequired ?? false;
  const audioPresent = Boolean(entry.audioPlan?.layers.length);
  checks.push({ check: 'audio_plan_present', passed: !audioRequired || audioPresent });
  if (audioRequired && !audioPresent) blockers.push('audio plan required for REEL');

  const translationsComplete = entry.platformTranslations.every(
    (t) => t.status === 'COMPLETE' || t.status === 'PLANNED',
  );
  const translationsRequired = entry.platformTranslations.length > 0;
  checks.push({
    check: 'platform_translations',
    passed: !translationsRequired || translationsComplete,
  });
  const pendingTranslations = entry.platformTranslations.filter((t) => t.status === 'REQUIRED');
  if (pendingTranslations.length) {
    blockers.push(`platform translations incomplete: ${pendingTranslations.map((t) => t.platform).join(', ')}`);
  }

  const notForMeCanon = entry.generationReceipts.some(
    (r) => r.judgmentState === 'NOT_FOR_ME' && r.canonState !== 'NON_CANON',
  );
  checks.push({ check: 'founder_judgment_canon_integrity', passed: !notForMeCanon });
  if (notForMeCanon) blockers.push('NOT FOR ME asset has invalid canon state');

  const unresolvedJudgment = entry.founderJudgments.some((j) => j.action === 'UNREVIEWED');
  checks.push({ check: 'founder_judgment_resolved', passed: !unresolvedJudgment || entry.founderJudgments.length === 0 });

  const ready = blockers.length === 0;
  return {
    ready,
    status: ready ? 'COMPLETE' : entry.status,
    blockers,
    checks,
  };
}
