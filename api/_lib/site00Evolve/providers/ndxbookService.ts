/** NDXbook marketing bootstrap — assessment-driven, no invented strategy */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import { runMarketingAssessment } from '../assessment.js';
import { generateManifestForOrg } from '../evolveService.js';
import {
  getProfileByOrgId,
  getObjectivesByOrgId,
  getChannelsByOrgId,
  getLatestAssessment,
  insertObjective,
} from '../storeAdapter.js';
import * as dbStore from '../supabaseStore.js';
import { getEvolveStore } from '../memoryStore.js';
import * as db from './connectionStore.js';
import { useMemoryStore } from '../storeAdapter.js';

export type NdxbookAssessmentAnswers = {
  organizationPurpose?: string;
  brandDescription?: string;
  targetAudience?: string;
  primaryObjective?: string;
  secondaryObjectives?: string[];
  plannedChannels?: string[];
  contentCategories?: string[];
  brandVoiceAvailable?: boolean;
  visualIdentityAvailable?: boolean;
  websiteDestination?: string;
  conversionTarget?: string;
  publishingCadence?: string;
  approvalPreference?: string;
  /** Provenance per field */
  provenance?: Record<string, 'KNOWN' | 'OWNER_CONFIRMED' | 'INFERRED' | 'UNKNOWN'>;
};

const DEFAULT_PROVENANCE: Record<string, 'UNKNOWN'> = {
  organizationPurpose: 'UNKNOWN',
  brandDescription: 'UNKNOWN',
  targetAudience: 'UNKNOWN',
  primaryObjective: 'UNKNOWN',
};

export async function bootstrapNdxbookMarketingProfile(answers?: NdxbookAssessmentAnswers) {
  const orgId = orgIdFromSlug('ndxbook')!;
  const existing = await getProfileByOrgId(orgId);
  if (existing && existing.marketing_maturity !== 'ASSESSMENT_REQUIRED') {
    return { skipped: true, reason: 'profile already established' };
  }

  const prov = { ...DEFAULT_PROVENANCE, ...answers?.provenance };
  const profile = {
    id: randomUUID(),
    organization_id: orgId,
    lifecycle_stage: 'PRE_LAUNCH',
    primary_objective: answers?.primaryObjective ?? null,
    secondary_objectives: answers?.secondaryObjectives ?? [],
    audience_summary: answers?.targetAudience ?? null,
    offer_summary: answers?.brandDescription ?? null,
    positioning_summary: null,
    marketing_maturity: answers?.primaryObjective ? 'PARTIAL' : 'ASSESSMENT_REQUIRED',
    monthly_budget_range: null,
    production_budget_range: null,
    approval_mode: answers?.approvalPreference ?? 'OWNER_APPROVAL_REQUIRED',
    strategy_status: 'NOT_STARTED',
    metadata: {
      seed: 'evolve_sprint04_ndxbook',
      organization_purpose: answers?.organizationPurpose ?? null,
      provenance: prov,
      measurement_state: 'UNMEASURED',
      website_destination: answers?.websiteDestination ?? null,
      conversion_target: answers?.conversionTarget ?? null,
      publishing_cadence: answers?.publishingCadence ?? null,
    },
  };

  if (useMemoryStore()) {
    const store = getEvolveStore();
    const idx = store.profiles.findIndex((p) => p.organization_id === orgId);
    if (idx >= 0) store.profiles[idx] = profile as never;
    else store.profiles.push(profile as never);
  } else {
    await dbStore.upsertProfile(profile as never);
  }

  return { ok: true, profileId: profile.id };
}

export async function bootstrapNdxbookChannels() {
  const orgId = orgIdFromSlug('ndxbook')!;
  const existing = await getChannelsByOrgId(orgId);
  if (existing.length > 0) return { skipped: true };

  const channels = [
    {
      id: randomUUID(),
      organization_id: orgId,
      channel_key: 'INSTAGRAM',
      channel_state: 'ACTIVE',
      is_required: true,
      owner_decision: null,
      notes: 'Initial publishing channel for distribution pilot',
      metadata: { marketing_state: 'ACTIVE', connection_state: 'NOT_CONNECTED', pilot: true },
    },
    {
      id: randomUUID(),
      organization_id: orgId,
      channel_key: 'TIKTOK',
      channel_state: 'PLANNED',
      is_required: false,
      metadata: { marketing_state: 'PLANNED', connection_state: 'NOT_CONNECTED' },
    },
    {
      id: randomUUID(),
      organization_id: orgId,
      channel_key: 'WEBSITE',
      channel_state: 'PLANNED',
      is_required: false,
      metadata: { marketing_state: 'PLANNED' },
    },
  ];

  if (useMemoryStore()) {
    const store = getEvolveStore();
    store.channels.push(...(channels as never));
  } else {
    await dbStore.upsertChannels(channels as never);
  }
  return { ok: true, count: channels.length };
}

export async function bootstrapNdxbookObjectives(answers?: NdxbookAssessmentAnswers) {
  const orgId = orgIdFromSlug('ndxbook')!;
  const existing = await getObjectivesByOrgId(orgId);
  if (existing.length > 0 || !answers?.primaryObjective) return { skipped: true };

  const objective = {
    id: randomUUID(),
    organization_id: orgId,
    objective_key: 'ndx-primary',
    title: answers.primaryObjective,
    objective_type: 'AWARENESS',
    status: 'ACTIVE',
    priority: 1,
    metadata: {
      provenance: answers.provenance?.primaryObjective ?? 'OWNER_CONFIRMED',
      source: 'NDXBOOK_ASSESSMENT',
    },
  };

  if (useMemoryStore()) {
    const store = getEvolveStore();
    store.objectives.push(objective as never);
  } else {
    await insertObjective(objective as never);
  }
  return { ok: true };
}

export async function runNdxbookAssessment(answers: NdxbookAssessmentAnswers, assessedBy?: string) {
  await bootstrapNdxbookMarketingProfile(answers);
  await bootstrapNdxbookChannels();
  await bootstrapNdxbookObjectives(answers);

  const assessment = await runMarketingAssessment(
    {
      orgSlug: 'ndxbook',
      orgClassification: 'MANAGED_BRAND',
      orgName: 'NDXBOOK',
      externalConnections: [],
    },
    assessedBy,
  );

  if (!useMemoryStore()) {
    await db.upsertPilotConfig({
      organization_id: orgIdFromSlug('ndxbook')!,
      readiness_state: 'ASSESSMENT_COMPLETE',
    });
  }

  return assessment;
}

export async function generateNdxbookManifest() {
  const orgId = orgIdFromSlug('ndxbook')!;
  const profile = await getProfileByOrgId(orgId);
  if (!profile || profile.marketing_maturity === 'ASSESSMENT_REQUIRED') {
    return { ok: false, error: 'ASSESSMENT_REQUIRED before manifest generation' };
  }
  return generateManifestForOrg('ndxbook');
}

export async function evaluateBrandReadiness(orgSlug: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const profile = await getProfileByOrgId(orgId);
  const meta = (profile?.metadata ?? {}) as Record<string, unknown>;
  const checks = {
    logo: meta.logo_available ? 'READY' : 'UNKNOWN',
    visualIdentity: meta.visual_identity_available ? 'READY' : 'INSUFFICIENT',
    brandVoice: meta.brand_voice_available ? 'READY' : 'INSUFFICIENT',
    contentDestination: meta.website_destination ? 'READY' : 'PARTIAL',
    socialHandle: 'PENDING_CONNECTION',
  };
  const insufficient = Object.values(checks).filter((v) => v === 'INSUFFICIENT').length;
  const overall = insufficient > 2 ? 'INSUFFICIENT' : insufficient > 0 ? 'PARTIAL' : 'PARTIAL';
  return { overall, checks };
}

export async function evaluateContentBrainReadiness(orgSlug: string) {
  const { getContentBrainByOrgId } = await import('../storeAdapter.js');
  const entries = await getContentBrainByOrgId(orgIdFromSlug(orgSlug)!);
  if (entries.length === 0) return { state: 'CONTENT_BRAIN_INCOMPLETE', canonCount: 0 };
  const canon = entries.filter((e) => e.classification === 'CANONICAL');
  return {
    state: canon.length > 0 ? 'PARTIAL' : 'CONTENT_BRAIN_INCOMPLETE',
    canonCount: canon.length,
    suggestedCount: entries.filter((e) => e.classification === 'IDEA').length,
  };
}

export async function getNdxbookMarketingState() {
  const orgId = orgIdFromSlug('ndxbook')!;
  return {
    profile: await getProfileByOrgId(orgId),
    assessment: await getLatestAssessment(orgId),
    objectives: await getObjectivesByOrgId(orgId),
    channels: await getChannelsByOrgId(orgId),
    brandReadiness: await evaluateBrandReadiness('ndxbook'),
    contentBrain: await evaluateContentBrainReadiness('ndxbook'),
  };
}
