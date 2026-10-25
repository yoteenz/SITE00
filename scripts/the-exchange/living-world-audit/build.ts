import { beforeAfterDoc, priorityDoc } from './briefDocs.js';
import { founderReviewDoc } from './founderReview.js';
import { approvalMatrixJson, dependencyGraphJson, futureReserveDoc, runtimeImpactDoc } from './impactDocs.js';
import { matrixCsv } from './matrix.js';
import { loadCtx } from './md.js';
import { revelationContinuityDoc, sensoryAuditDoc, transitionGrammarDoc } from './memoryDocs.js';
import { sourceAuditDoc } from './sourceDocs.js';
import { inventionRegisterJson, revelationGuideDoc, technologyAuditDoc } from './techDocs.js';
import { validationDoc } from './validationDoc.js';
import { livingWorldDoc, s101EggsDoc, socialWorldDoc } from './worldDocs.js';

/** Deliverables 00 to 18 of the living-world audit, keyed by file name, from committed data. Deliverable 19 is written by hand after the build and tests run. Deterministic. */
export function buildLivingWorldAuditDocs(root: string): Record<string, string> {
  const c = loadCtx(root);
  const files: Record<string, string> = {
    '00_FOUNDER_REVIEW_LIVING_WORLD_AUDIT.md': founderReviewDoc(c),
    '01_SOURCE_AND_CANON_AUDIT.md': sourceAuditDoc(c),
    '02_SEASON1_86_RELEASE_ENHANCEMENT_MATRIX.csv': matrixCsv(c),
    '03_TECHNOLOGY_EXISTING_CAPABILITY_AUDIT.md': technologyAuditDoc(c),
    '04_NEW_INVENTION_OPPORTUNITY_REGISTER.json': inventionRegisterJson(),
    '05_BEHAVIORAL_TECHNOLOGY_REVELATION_GUIDE.md': revelationGuideDoc(c),
    '06_SENSORY_FLASHBACK_AND_MEMORY_AUDIT.md': sensoryAuditDoc(c),
    '07_AUDIO_VISUAL_TRANSITION_GRAMMAR.md': transitionGrammarDoc(c),
    '08_MEMORY_AND_REVELATION_CONTINUITY_REPORT.md': revelationContinuityDoc(c),
    '09_LIVING_WORLD_AND_BACKGROUND_CAST_AUDIT.md': livingWorldDoc(c),
    '10_S1-01_EASTER_EGG_RETURN_OPPORTUNITIES.md': s101EggsDoc(c),
    '11_SOCIAL_WORLD_DENSITY_AND_EXCHANGE_NIGHTS_AUDIT.md': socialWorldDoc(c),
    '12_PROPOSAL_DEPENDENCY_AND_CANON_RISK_GRAPH.json': dependencyGraphJson(c),
    '13_RUNTIME_AND_PRODUCTION_IMPACT_REPORT.md': runtimeImpactDoc(c),
    '14_PRIORITY_RECOMMENDATIONS.md': priorityDoc(c),
    '15_FUTURE_SEASON_RESERVE.md': futureReserveDoc(c),
    '16_FOUNDER_APPROVAL_MATRIX.json': approvalMatrixJson(c),
    '17_BEFORE_AND_AFTER_CREATIVE_COMPARISONS.md': beforeAfterDoc(c),
    '18_VALIDATION_REPORT.md': validationDoc(c),
  };
  for (const [name, body] of Object.entries(files)) if (!body.endsWith('\n')) files[name] = `${body}\n`;
  return files;
}
