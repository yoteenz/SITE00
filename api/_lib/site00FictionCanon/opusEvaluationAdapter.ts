import crypto from 'node:crypto';
import type {
  FictionEvaluationRecommendation,
  FictionPremiseEvaluationRecord,
} from '../../../shared/site00-fiction-canon/types.js';
import { FICTION_EVALUATION_OUTPUT_SECTIONS } from '../../../shared/site00-fiction-canon/types.js';
import {
  isFictionOpusExecutionAuthorized,
  resolveFictionOpusModelId,
} from '../../../shared/site00-fiction-canon/opusModel.js';
import { isAnthropicConfigured } from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import {
  assembleFictionEvaluationContext,
  buildStructuredContextPayload,
} from './contextAssembly.js';
import { getFictionPropertyBySlug, saveFictionEvaluation } from './fictionCanonStore.js';

export type EvaluateFictionPremiseInput = {
  propertySlug: string;
  approvedBibleVersion?: string | null;
  /** When true, may call provider if authorized. Sprint default: false. */
  execute?: boolean;
};

const FICTION_EVALUATION_PROMPT_ANCHOR =
  'Evaluate THE EXCHANGE as serialized speculative fiction — not NDXBOOK marketing, not Entry 002.';

export async function evaluateFictionPremise(
  input: EvaluateFictionPremiseInput,
): Promise<FictionPremiseEvaluationRecord> {
  const slug = input.propertySlug.trim().toLowerCase();
  const property = await getFictionPropertyBySlug(slug);
  if (!property) {
    throw new Error(`Property not registered: ${slug}`);
  }

  const assembly = await assembleFictionEvaluationContext(property.id);
  const fingerprint = input.approvedBibleVersion?.trim() || assembly.approvedBibleVersionFingerprint;

  if (assembly.missingRequiredTypes.length > 0) {
    const blocked: FictionPremiseEvaluationRecord = {
      evaluationId: `feval_${crypto.randomBytes(10).toString('hex')}`,
      propertyId: property.id,
      propertySlug: property.slug,
      approvedBibleVersionFingerprint: fingerprint,
      modelRequested: resolveFictionOpusModelId(),
      modelResolved: resolveFictionOpusModelId(),
      dryRun: true,
      executed: false,
      status: 'BLOCKED_MISSING_SOURCE',
      contextAssembly: {
        documentCount: assembly.documents.length,
        missingRequiredTypes: assembly.missingRequiredTypes,
        retrievalOmissions: assembly.retrievalOmissions,
        incompleteContext: true,
      },
      output: null,
      recommendations: [],
      createdAt: new Date().toISOString(),
    };
    await saveFictionEvaluation(blocked);
    return blocked;
  }

  const executeRequested = input.execute === true;
  const authorized = isFictionOpusExecutionAuthorized() && isAnthropicConfigured();
  const dryRun = !executeRequested || !authorized;

  const contextPayload = buildStructuredContextPayload(assembly);

  if (dryRun) {
    const plan: FictionPremiseEvaluationRecord = {
      evaluationId: `feval_${crypto.randomBytes(10).toString('hex')}`,
      propertyId: property.id,
      propertySlug: property.slug,
      approvedBibleVersionFingerprint: fingerprint,
      modelRequested: resolveFictionOpusModelId(),
      modelResolved: resolveFictionOpusModelId(),
      dryRun: true,
      executed: false,
      status: authorized ? 'DRY_RUN_PLAN' : 'BLOCKED_UNAUTHORIZED',
      contextAssembly: {
        documentCount: assembly.documents.length,
        missingRequiredTypes: [],
        retrievalOmissions: assembly.retrievalOmissions,
        incompleteContext: assembly.incompleteContext,
      },
      output: Object.fromEntries(
        FICTION_EVALUATION_OUTPUT_SECTIONS.map((s) => [s, '']),
      ) as FictionPremiseEvaluationRecord['output'],
      recommendations: [],
      createdAt: new Date().toISOString(),
    };
    plan.output!.EXECUTIVE_ASSESSMENT =
      `Dry-run plan only. Context assembled (${assembly.documents.length} documents). ` +
      `${FICTION_EVALUATION_PROMPT_ANCHOR} ` +
      (authorized
        ? 'Set execute=true with SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED=1 to run paid Opus.'
        : 'Paid Opus not authorized this sprint.');
    await saveFictionEvaluation(plan);
    return plan;
  }

  // Paid path intentionally not implemented in this sprint — would call Anthropic here.
  throw new Error('PAID_OPUS_EXECUTION_NOT_IMPLEMENTED_IN_SPRINT');
}

export function validateEvaluationOutputStructure(
  output: FictionPremiseEvaluationRecord['output'],
): { ok: boolean; missingSections: string[] } {
  if (!output) return { ok: false, missingSections: [...FICTION_EVALUATION_OUTPUT_SECTIONS] };
  const missing = FICTION_EVALUATION_OUTPUT_SECTIONS.filter((s) => !(s in output));
  return { ok: missing.length === 0, missingSections: missing };
}

export async function reviewFictionEvaluationRecommendation(input: {
  evaluationId: string;
  recommendationId: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION' | 'DEFER';
  note?: string;
}): Promise<FictionEvaluationRecommendation | null> {
  const { getFictionEvaluation, saveFictionEvaluation } = await import('./fictionCanonStore.js');
  const evaluation = await getFictionEvaluation(input.evaluationId);
  if (!evaluation) return null;
  const rec = evaluation.recommendations.find((r) => r.recommendationId === input.recommendationId);
  if (!rec) return null;
  rec.reviewDecision = input.decision;
  await saveFictionEvaluation({ ...evaluation });
  return rec;
}
