/**
 * Founder Creative Appetite synthesis — deterministic tolerance bands from answers.
 */

import type { BrandLoreField } from '../types.js';
import type { ToleranceBand } from './constants.js';
import { FOUNDER_CREATIVE_APPETITE_PROFILE_VERSION } from './constants.js';
import { getAppetiteQuestion, FOUNDER_CREATIVE_APPETITE_QUESTIONS } from './questions.js';
import type { CreativeAppetiteTolerance, FounderCreativeAppetiteProfile } from './types.js';
import { buildNdxbookConceptExperimentExclusion } from './experimentExclusion.js';
import { normalizeFreeText } from '../loreAnswerTypes.js';
import { isSkippedAnswer } from '../adaptivity.js';

function nowIso(): string {
  return new Date().toISOString();
}

function field<T>(
  value: T,
  sourceAnswerIds: string[],
  classification: BrandLoreField<T>['classification'] = 'RAW_FOUNDER_INPUT',
): BrandLoreField<T> {
  const hasContent =
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && !value.trim()) &&
    !(Array.isArray(value) && value.length === 0);

  return {
    value,
    classification,
    confidence: hasContent ? 'HIGH' : 'NONE',
    sourceAnswerIds,
    sourceType: 'IDENTITY_LORE',
    founderConfirmationState: 'PENDING',
    updatedAt: nowIso(),
  };
}

function resolveBand(questionId: string, answers: Record<string, string | string[]>): ToleranceBand | null {
  const step = getAppetiteQuestion(questionId);
  if (!step?.options) return null;
  const raw = answers[questionId];
  if (isSkippedAnswer(raw) || typeof raw !== 'string') return null;
  const opt = step.options.find((o) => o.id === raw);
  return opt?.band ?? null;
}

export function synthesizeFounderCreativeAppetiteProfile(params: {
  organizationId?: string | null;
  projectId?: string | null;
  appetiteAnswers: Record<string, string | string[]>;
  existing?: FounderCreativeAppetiteProfile | null;
}): FounderCreativeAppetiteProfile {
  const { appetiteAnswers, organizationId = null, projectId = null, existing } = params;
  const ts = nowIso();

  const domainTolerances: CreativeAppetiteTolerance[] = FOUNDER_CREATIVE_APPETITE_QUESTIONS.filter(
    (q) => q.type === 'single',
  ).map((q) => {
    const band = resolveBand(q.id, appetiteAnswers);
    return {
      domain: q.id as CreativeAppetiteTolerance['domain'],
      band: band ?? 'CONTROLLED',
      rationale: `Derived from founder answer on ${q.title}`,
      sourceAnswerIds: [q.id],
    };
  });

  const hardBoundaries = normalizeFreeText(appetiteAnswers['hard-boundaries'] ?? '');

  return {
    id: existing?.id ?? `appetite-${organizationId ?? projectId ?? 'unknown'}`,
    organizationId,
    projectId,
    profileVersion: FOUNDER_CREATIVE_APPETITE_PROFILE_VERSION,
    creativeRiskTolerance: field(resolveBand('creative-risk', appetiteAnswers), ['creative-risk']),
    abstractionTolerance: field(resolveBand('abstraction', appetiteAnswers), ['abstraction']),
    visualExperimentationTolerance: field(resolveBand('visual-experimentation', appetiteAnswers), [
      'visual-experimentation',
    ]),
    culturalSpecificityTolerance: field(resolveBand('cultural-specificity', appetiteAnswers), ['cultural-specificity']),
    witRiskTolerance: field(resolveBand('wit-risk', appetiteAnswers), ['wit-risk']),
    polarizationTolerance: field(resolveBand('polarization', appetiteAnswers), ['polarization']),
    rawnessTolerance: field(resolveBand('polish-vs-rawness', appetiteAnswers), ['polish-vs-rawness']),
    densityTolerance: field(resolveBand('density-vs-restraint', appetiteAnswers), ['density-vs-restraint']),
    formatExperimentationTolerance: field(resolveBand('format-experimentation', appetiteAnswers), [
      'format-experimentation',
    ]),
    surprisePreference: field(resolveBand('creative-surprise', appetiteAnswers), ['creative-surprise']),
    creativeDirectorLatitude: field(resolveBand('founder-control', appetiteAnswers), ['founder-control']),
    hardCreativeBoundaries: field(hardBoundaries, ['hard-boundaries']),
    domainTolerances,
    rawAnswers: appetiteAnswers,
    founderConfirmationState: existing?.founderConfirmationState ?? 'PENDING',
    experimentExclusions: existing?.experimentExclusions?.length
      ? existing.experimentExclusions
      : [buildNdxbookConceptExperimentExclusion(ts)],
    capturedAt: existing?.capturedAt ?? ts,
    updatedAt: ts,
  };
}

export function summarizeCreativeAppetiteForFormation(profile: FounderCreativeAppetiteProfile): string {
  const lines = profile.domainTolerances.map((d) => `${d.domain}: ${d.band}`);
  if (profile.hardCreativeBoundaries.value) {
    lines.push(`hard boundaries: ${profile.hardCreativeBoundaries.value}`);
  }
  return lines.join('; ');
}
