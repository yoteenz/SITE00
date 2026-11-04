import { loadCtx } from './md.js';
import { holdsDoc, runtimeDoc, s101PlanDoc } from './productionDocs.js';
import { livingWorldDoc, sensoryDoc, technologyDoc } from './phaseDocs.js';
import { canonDiffDoc, decisionRecordDoc, pendingJson, reconciliationJson, registryCopy, remainingDecisionsDoc } from './recordDocs.js';
import { continuityDoc, validationDoc } from './validationDocs.js';

/** Deliverables 01 to 14 of the living-world promotion, keyed by file name, from committed data. Deliverable 15 is written by hand after the build and tests run. Deterministic. */
export function buildLivingWorldPromotionDocs(root: string): Record<string, string> {
  const c = loadCtx(root);
  const files: Record<string, string> = {
    '01_FOUNDER_DECISION_RECORD.md': decisionRecordDoc(),
    '02_PROPOSAL_APPROVAL_RECONCILIATION.json': reconciliationJson(),
    '03_CANON_PROMOTION_DIFF.md': canonDiffDoc(c),
    '04_TECHNOLOGY_RULE_PROMOTION.md': technologyDoc(),
    '05_SENSORY_MEMORY_PROMOTION.md': sensoryDoc(),
    '06_LIVING_WORLD_PROMOTION.md': livingWorldDoc(c),
    '07_RECURRING_BACKGROUND_IDENTITY_REGISTER.json': registryCopy(c),
    '08_S1-01_DEPENDENCY_AND_SCENE_PATCH_PLAN.md': s101PlanDoc(c),
    '09_CROSS_RELEASE_CONTINUITY_VALIDATION.md': continuityDoc(c),
    '10_RUNTIME_RECONCILIATION.md': runtimeDoc(c),
    '11_PENDING_53_PROPOSALS_REGISTER.json': pendingJson(),
    '12_ASSET_AND_PRODUCTION_HOLDS.md': holdsDoc(),
    '13_REMAINING_FOUNDER_DECISIONS.md': remainingDecisionsDoc(c),
    '14_VALIDATION_REPORT.md': validationDoc(c),
  };
  for (const [name, body] of Object.entries(files)) if (!body.endsWith('\n')) files[name] = `${body}\n`;
  return files;
}
