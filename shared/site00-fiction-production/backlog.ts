import { toCsv } from './csv.js';
import type { RuntimeEstimate } from './screenplay.js';
import type { SeasonMaster } from './types.js';

export const SCREENPLAY_GATE = 'Founder accepts the writing quality and conventions of S1-01 to S1-05.';
export const BATCH_SIZE = 5;

export type BacklogRow = {
  releaseId: string;
  order: number;
  batch: number;
  title: string;
  arc: string;
  runtimeTarget: string;
  fictionalDay: string;
  layers: string;
  exchangeNight: boolean;
  principals: string;
  setting: string;
  productionComplexity: string;
  screenplayStatus: 'DRAFT — FOUNDER REVIEW REQUIRED' | 'NOT STARTED — GATED';
  estimatedRuntimeSec: number | null;
  pacingBand: string | null;
  blockedBy: string;
  openQuestions: string;
  dependsOn: string;
  paysOffIn: string;
  approvedAmendments: string;
};

export function buildBacklog(master: SeasonMaster, drafted: Map<string, RuntimeEstimate>): BacklogRow[] {
  return master.releases.map((r) => {
    const est = drafted.get(r.id) ?? null;
    return {
      releaseId: r.id,
      order: r.order,
      batch: Math.ceil(r.order / BATCH_SIZE),
      title: r.title,
      arc: `${r.arc.number} — ${r.arc.name}`,
      runtimeTarget: r.runtimeTarget,
      fictionalDay: r.fictionalDay,
      layers: r.layers.join(''),
      exchangeNight: r.exchangeNight,
      principals: r.principalCharacters.join('; '),
      setting: r.setting,
      productionComplexity: r.productionComplexity.rating,
      screenplayStatus: est ? 'DRAFT — FOUNDER REVIEW REQUIRED' : 'NOT STARTED — GATED',
      estimatedRuntimeSec: est?.estimatedSec ?? null,
      pacingBand: est?.band ?? null,
      blockedBy: est ? 'Founder screenplay review' : SCREENPLAY_GATE,
      openQuestions: r.unresolvedQuestions.join('; '),
      dependsOn: r.dependsOn.join('; '),
      paysOffIn: r.paysOffIn.join('; '),
      approvedAmendments: r.approvedAmendments.map((a) => a.amendmentId).join('; '),
    };
  });
}

export function backlogCsv(rows: BacklogRow[]): string {
  const header = Object.keys(rows[0]) as Array<keyof BacklogRow>;
  return toCsv(
    header.map((h) => h.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()),
    rows.map((r) => header.map((h) => r[h] as string | number | boolean | null)),
  );
}
