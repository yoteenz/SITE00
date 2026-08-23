/**
 * NDX BOOK — reconcile pre-existing Content Brain / handoff intelligence into a real
 * BrandLoreProfile, WITHOUT fabricating any founder answer that was never actually given (XXV/XXVI).
 *
 * Rules enforced here:
 *  - Only genuinely known, non-creative business facts are mapped (brand.positioning/promise for
 *    PURPOSE, voice.avoid for ANTI_DIRECTION). These are recorded under the "brand"/"voice" keys of
 *    the handoff — business/voice facts, not a Creative Direction proposal.
 *  - `mustFeelLike` / `mustNotFeelLike` / `visualTensions` from intelligenceBrief.ts are PROPOSED
 *    creative output and are deliberately NOT used here (XXVII — prior Creative Direction must
 *    never backfill upstream Brand Lore).
 *  - Every other required readiness domain (AUDIENCE_RELATIONSHIP, WORLDVIEW, EMOTIONAL_PROMISE,
 *    CULTURAL_TENSION, REFERENCE_CONTEXT) is left UNKNOWN/empty on purpose, so readiness honestly
 *    reports CONTEXT_INCOMPLETE and targeted calibration asks only for what's missing.
 *  - classification is always SYNTHESIZED (never FOUNDER_CONFIRMED) — a founder must explicitly
 *    confirm these via the same CONFIRM CANON flow as any other synthesized field.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { BrandLoreField, BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';
import { classifyBrandExpressionContext } from '../../../shared/site00-brand-lore/contextClassification.js';
import { evaluateCreativeDirectionReadiness } from '../../../shared/site00-brand-lore/readiness.js';
import { reconcileNdxbookPersonality } from '../../../shared/site00-brand-lore/ndxbookPersonalityReconciliation.js';

const HANDOFF_PATH = 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json';

type NdxbookHandoff = {
  brand?: { positioning?: string; promise?: string };
  voice?: { avoid?: string[] };
};

function loadHandoff(): NdxbookHandoff {
  try {
    const path = join(process.cwd(), HANDOFF_PATH);
    return JSON.parse(readFileSync(path, 'utf8')) as NdxbookHandoff;
  } catch {
    return {};
  }
}

function unknownField<T>(empty: T): BrandLoreField<T> {
  return {
    value: empty,
    classification: 'UNKNOWN',
    confidence: 'NONE',
    sourceAnswerIds: [],
    sourceType: 'UNKNOWN',
    founderConfirmationState: 'NOT_APPLICABLE',
    updatedAt: new Date().toISOString(),
  };
}

function contentBrainField<T>(value: T, sourceAnswerIds: string[]): BrandLoreField<T> {
  return {
    value,
    classification: 'SYNTHESIZED',
    confidence: 'MEDIUM',
    sourceAnswerIds,
    sourceType: 'CONTENT_BRAIN',
    founderConfirmationState: 'PENDING',
    updatedAt: new Date().toISOString(),
  };
}

/** Deterministic per-org id — one reconciled profile per org, upserted, never duplicated. */
export function contentBrainSourceIntakeId(orgId: string): string {
  return `content-brain:${orgId}`;
}

/**
 * Builds (but does not persist) a reconciled BrandLoreProfile for NDX BOOK from existing
 * Content Brain / handoff intelligence. Caller is responsible for checking whether a real
 * IDENTITY/BUILDER-sourced profile already exists for this org first — reconciliation must never
 * run over real founder lore (XXVII).
 */
export function buildNdxbookReconciledProfile(orgId: string): BrandLoreProfile {
  const handoff = loadHandoff();
  const now = new Date().toISOString();

  const profile: BrandLoreProfile = {
    id: randomUUID(),
    organizationId: orgId,
    projectId: null,
    sourceIntakeId: contentBrainSourceIntakeId(orgId),
    sourceIntakeType: 'CONTENT_BRAIN',

    brandWorld: unknownField<string | null>(null),
    audienceRelationship: unknownField<string | null>(null),
    brandBelief: unknownField<string | null>(null),
    culturalOpposition: unknownField<string[]>([]),
    coreObsessions: unknownField<string | null>(null),
    emotionalPromise: unknownField<string[]>([]),
    creativeTensions: unknownField<string[]>([]),
    worldMetaphor: unknownField<string | null>(null),
    materialVocabulary: unknownField<string[]>([]),
    symbolicVocabulary: unknownField<string[]>([]),
    referenceLineage: unknownField<string | null>(null),
    currentReferenceSignals: unknownField<string | null>(null),
    authenticLanguageSamples: unknownField<string[]>([]),
    antiLanguage: unknownField<string[]>([]),
    socialSignal: unknownField<string | null>(null),
    audienceRitual: unknownField<string[]>([]),
    memoryGoal: unknownField<string | null>(null),
    desiredMythology: unknownField<string | null>(null),
    futureWorld: unknownField<string | null>(null),
    creativeAntiPatterns: unknownField<string[]>([]),
    signatureDeviceSeeds: unknownField<string | null>(null),

    rawLoreAnswers: {},
    referenceEvidence: [],
    contextClassification: classifyBrandExpressionContext({ orgSlug: 'ndxbook' }),
    readinessState: 'CONTEXT_INCOMPLETE',
    readinessMissingDomains: [],
    profileVersion: 1,

    createdAt: now,
    updatedAt: now,
  };

  // PURPOSE — genuinely known business positioning/promise, not an invented belief statement.
  const purposeParts = [handoff.brand?.positioning, handoff.brand?.promise].filter(
    (v): v is string => Boolean(v && v.trim()),
  );
  if (purposeParts.length > 0) {
    profile.coreObsessions = contentBrainField(purposeParts.join(' — '), [
      'content_brain:brand.positioning',
      'content_brain:brand.promise',
    ]);
  }

  // ANTI_DIRECTION — genuinely known voice constraints ("avoid"), not a Creative Direction output.
  if (handoff.voice?.avoid?.length) {
    profile.antiLanguage = contentBrainField([...handoff.voice.avoid], ['content_brain:voice.avoid']);
  }

  const readiness = evaluateCreativeDirectionReadiness(profile);
  profile.readinessState = readiness.state;
  profile.readinessMissingDomains = readiness.missingDomains;

  const { personality } = reconcileNdxbookPersonality({
    orgId,
    loreProfile: profile,
    existingPersonality: null,
  });
  profile.brandPersonality = personality;

  return profile;
}
