/**
 * Synthesize guest intake into WorldFormationInput + WorldIntelligenceSnapshot.
 */

import { createHash } from 'node:crypto';
import type {
  GuestIntakeSession,
  IntakeInviteRecord,
  WorldFormationInput,
  WorldIntelligenceSnapshot,
} from './types.js';
import { evaluateWorldFormationReadiness, businessIntelligenceFromAnswers, worldReadinessFromAnswers, expressionContextFromAnswer } from './readiness.js';
import { buildBusinessOfferingMap } from './offeringMap.js';
import {
  WORLD_INTAKE_METHODOLOGY_VERSION,
  WORLD_INTELLIGENCE_SNAPSHOT_VERSION,
  FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION,
} from './constants.js';

function fingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value ?? {})).digest('hex').slice(0, 16);
}

export function assembleWorldFormationInput(
  invite: IntakeInviteRecord,
  session: GuestIntakeSession,
): WorldFormationInput {
  const syn = session.synthesized;
  return {
    methodologyVersion: WORLD_INTAKE_METHODOLOGY_VERSION,
    brandLore: syn.brandLore ?? null,
    brandPersonality: syn.personality ?? null,
    founderCreativeAppetite: syn.creativeAppetite ?? null,
    primaryExpressionContext: syn.expressionContext ?? null,
    businessOfferingMap: syn.offeringMap ?? null,
    worldReadinessProfile: syn.worldReadiness ?? null,
    businessIntelligence: syn.businessIntelligence ?? null,
    functionalRequirements: [],
    founderWorldHypothesis: syn.worldReadiness?.founderWorldHypothesis ?? null,
    referenceEvidence: [],
    antiDirection: syn.worldReadiness?.hardBoundariesVerbatim ? [syn.worldReadiness.hardBoundariesVerbatim] : [],
    existingDigitalAssets: null,
    projectConstraints: syn.businessIntelligence?.operationalConstraints
      ? [syn.businessIntelligence.operationalConstraints]
      : [],
    experienceClass: invite.projectExperienceClass,
    assembledAt: new Date().toISOString(),
  };
}

export function createWorldIntelligenceSnapshot(
  invite: IntakeInviteRecord,
  session: GuestIntakeSession,
): WorldIntelligenceSnapshot {
  const readiness = evaluateWorldFormationReadiness(session);
  const worldFormationInput = assembleWorldFormationInput(invite, session);
  const snapshotId = `wis-${invite.projectSlug}-${Date.now()}`;

  return {
    snapshotId,
    projectId: invite.projectId,
    inviteId: invite.inviteId,
    sessionId: session.sessionId,
    profileVersions: {
      intelligenceSnapshotVersion: WORLD_INTELLIGENCE_SNAPSHOT_VERSION,
      inviteIntelligenceSnapshotVersion: invite.intelligenceSnapshotVersion,
    },
    businessIntelligenceVersion: 1,
    brandLoreFingerprint: fingerprint(session.synthesized.brandLore),
    personalityFingerprint: fingerprint(session.synthesized.personality),
    creativeAppetiteVersion: session.synthesized.creativeAppetite ? 'CREATIVE_APPETITE_V1' : null,
    worldReadinessVersion: session.synthesized.worldReadiness?.version ?? 1,
    offeringMapVersion: session.synthesized.offeringMap?.version ?? 1,
    readiness,
    worldFormationInput,
    sourceInviteId: invite.inviteId,
    createdAt: new Date().toISOString(),
  };
}

export function founderWorldHypothesisIsNotCanon(profile: import('./types.js').WorldReadinessProfile | null | undefined): boolean {
  if (!profile?.founderWorldHypothesis) return true;
  return profile.founderWorldHypothesisClassification === FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION;
}

export function synthesizeSessionIntelligence(session: GuestIntakeSession): GuestIntakeSession['synthesized'] {
  const raw = session.rawAnswers;

  const brandLore: Record<string, unknown> = {};
  const personality: Record<string, unknown> = {};
  const creativeAppetite: Record<string, unknown> = {};

  for (const [qid, rec] of Object.entries(raw)) {
    if (rec.section === 'BRAND_LORE') brandLore[qid] = rec.value;
    if (rec.section === 'PERSONALITY') personality[qid] = rec.value;
    if (rec.section === 'CREATIVE_APPETITE') creativeAppetite[qid] = rec.value;
  }

  return {
    businessIntelligence: businessIntelligenceFromAnswers(raw),
    offeringMap: buildBusinessOfferingMap({
      offeringsText: String(raw['offerings-primary']?.value ?? ''),
      liveServicesText: String(raw['offerings-live']?.value ?? ''),
    }),
    worldReadiness: worldReadinessFromAnswers(raw),
    brandLore: Object.keys(brandLore).length ? brandLore : undefined,
    personality: Object.keys(personality).length ? personality : undefined,
    creativeAppetite: Object.keys(creativeAppetite).length ? creativeAppetite : undefined,
    expressionContext: expressionContextFromAnswer(raw),
  };
}
