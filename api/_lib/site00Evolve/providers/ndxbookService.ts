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
  insertContentBrainEntry,
} from '../storeAdapter.js';
import * as dbStore from '../supabaseStore.js';
import { getEvolveStore } from '../memoryStore.js';
import * as db from './connectionStore.js';
import { useMemoryStore } from '../storeAdapter.js';

export type NdxbookAssessmentAnswers = {
  organizationPurpose?: string;
  brandDescription?: string;
  whatItOffers?: string;
  targetAudience?: string;
  primaryObjective?: string;
  secondaryObjectives?: string[];
  initialChannelPriority?: string;
  contentGoals?: string[];
  conversionTarget?: string;
  brandVoice?: string;
  visualIdentityStatus?: string;
  publishingCadence?: string;
  approvalPreference?: string;
  websiteDestination?: string;
  brandAssetsAvailable?: string;
  contentCategories?: string[];
  brandVoiceAvailable?: boolean;
  visualIdentityAvailable?: boolean;
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
  if (existing && !answers?.primaryObjective) {
    return { skipped: true, reason: 'no answers to update profile' };
  }

  const prov = { ...DEFAULT_PROVENANCE, ...answers?.provenance };
  const profile = {
    id: existing?.id ?? randomUUID(),
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
    strategy_status: answers?.primaryObjective ? 'IN_PROGRESS' : 'NOT_STARTED',
    metadata: {
      seed: 'evolve_sprint05a_ndxbook',
      assessment_status: answers?.primaryObjective ? 'ASSESSMENT_COMPLETE' : 'ASSESSMENT_REQUIRED',
      organization_purpose: answers?.organizationPurpose ?? null,
      what_it_offers: answers?.whatItOffers ?? answers?.brandDescription ?? null,
      brand_voice: answers?.brandVoice ?? null,
      visual_identity_status: answers?.visualIdentityStatus ?? null,
      brand_assets_available: answers?.brandAssetsAvailable ?? null,
      content_goals: answers?.contentGoals ?? [],
      initial_channel_priority: answers?.initialChannelPriority ?? 'INSTAGRAM',
      provenance: prov,
      measurement_state: 'UNMEASURED',
      website_destination: answers?.websiteDestination ?? null,
      conversion_target: answers?.conversionTarget ?? null,
      publishing_cadence: answers?.publishingCadence ?? null,
      brand_voice_available: answers?.brandVoiceAvailable ?? Boolean(answers?.brandVoice),
      visual_identity_available: answers?.visualIdentityAvailable ?? false,
      logo_available: false,
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

export async function bootstrapNdxbookContentBrain(answers: NdxbookAssessmentAnswers) {
  const orgId = orgIdFromSlug('ndxbook')!;
  const existing = await evaluateContentBrainReadiness('ndxbook');
  if (existing.canonCount > 0) return { skipped: true };

  const entries: Array<Record<string, unknown>> = [];
  const pc = (field: string): 'OWNER_CONFIRMED' | 'UNKNOWN' =>
    answers.provenance?.[field] === 'OWNER_CONFIRMED' || answers[field as keyof NdxbookAssessmentAnswers]
      ? 'OWNER_CONFIRMED'
      : 'UNKNOWN';

  if (answers.organizationPurpose && pc('organizationPurpose') === 'OWNER_CONFIRMED') {
    entries.push({
      id: randomUUID(),
      organization_id: orgId,
      entry_type: 'brand_purpose',
      title: 'Organization Purpose',
      content: { text: answers.organizationPurpose },
      approval_state: 'APPROVED',
      metadata: { entry_class: 'CANONICAL', provenance: 'OWNER_CONFIRMED', source: 'NDXBOOK_ASSESSMENT' },
    });
  }
  if (answers.brandVoice && pc('brandVoice') === 'OWNER_CONFIRMED') {
    entries.push({
      id: randomUUID(),
      organization_id: orgId,
      entry_type: 'brand_voice',
      title: 'Brand Voice',
      content: { text: answers.brandVoice },
      approval_state: 'APPROVED',
      metadata: { entry_class: 'CANONICAL', provenance: 'OWNER_CONFIRMED', source: 'NDXBOOK_ASSESSMENT' },
    });
  }
  if (answers.targetAudience && pc('targetAudience') === 'OWNER_CONFIRMED') {
    entries.push({
      id: randomUUID(),
      organization_id: orgId,
      entry_type: 'audience',
      title: 'Target Audience',
      content: { text: answers.targetAudience },
      approval_state: 'APPROVED',
      metadata: { entry_class: 'CANONICAL', provenance: 'OWNER_CONFIRMED', source: 'NDXBOOK_ASSESSMENT' },
    });
  }
  if (answers.contentGoals?.length) {
    entries.push({
      id: randomUUID(),
      organization_id: orgId,
      entry_type: 'content_goals',
      title: 'Content Goals',
      content: { goals: answers.contentGoals },
      approval_state: 'DRAFT',
      metadata: { entry_class: 'REFERENCE', provenance: 'OWNER_CONFIRMED', source: 'NDXBOOK_ASSESSMENT' },
    });
  }

  for (const e of entries) await insertContentBrainEntry(e);
  return { ok: true, count: entries.length };
}

export async function runNdxbookAssessment(answers: NdxbookAssessmentAnswers, assessedBy?: string) {
  const provenance: NdxbookAssessmentAnswers['provenance'] = {};
  for (const key of Object.keys(answers) as Array<keyof NdxbookAssessmentAnswers>) {
    if (answers[key] !== undefined && answers[key] !== null && answers[key] !== '') {
      (provenance as Record<string, string>)[key as string] = 'OWNER_CONFIRMED';
    }
  }
  answers.provenance = { ...provenance, ...answers.provenance };

  await bootstrapNdxbookMarketingProfile(answers);
  await bootstrapNdxbookChannels();
  await bootstrapNdxbookObjectives(answers);
  await bootstrapNdxbookContentBrain(answers);

  await runMarketingAssessment(
    {
      orgSlug: 'ndxbook',
      orgClassification: 'MANAGED_BRAND',
      orgName: 'NDXBOOK',
      externalConnections: [],
    },
    assessedBy,
  );

  const manifest = await generateNdxbookManifest();

  if (!useMemoryStore()) {
    await db.upsertPilotConfig({
      organization_id: orgIdFromSlug('ndxbook')!,
      readiness_state: 'ASSESSMENT_COMPLETE',
    });
  }

  return { assessment: await getLatestAssessment(orgIdFromSlug('ndxbook')!), manifest };
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
  const checks: Record<string, { state: string; gap?: string }> = {
    LOGO: { state: meta.logo_available ? 'READY' : 'INSUFFICIENT', gap: meta.logo_available ? undefined : 'Logo not confirmed' },
    COLORS: { state: meta.visual_identity_available ? 'PARTIAL' : 'INSUFFICIENT', gap: 'Brand colors not documented' },
    TYPOGRAPHY: { state: 'INSUFFICIENT', gap: 'Typography not documented' },
    VOICE: { state: meta.brand_voice_available ? 'READY' : 'INSUFFICIENT', gap: meta.brand_voice_available ? undefined : 'Brand voice not confirmed' },
    AUDIENCE: { state: profile?.audience_summary ? 'READY' : 'INSUFFICIENT', gap: profile?.audience_summary ? undefined : 'Audience not defined' },
    OFFER: { state: profile?.offer_summary ? 'READY' : 'INSUFFICIENT', gap: profile?.offer_summary ? undefined : 'Offer/purpose not defined' },
    CTA: { state: meta.conversion_target ? 'READY' : 'PARTIAL', gap: meta.conversion_target ? undefined : 'CTA not specified' },
    DESTINATION: { state: meta.website_destination ? 'READY' : 'PARTIAL', gap: meta.website_destination ? undefined : 'Destination URL not set' },
    APPROVED_VISUAL_ASSETS: { state: meta.brand_assets_available ? 'PARTIAL' : 'INSUFFICIENT', gap: 'Approved visual assets not uploaded' },
    SOCIAL_ACCOUNT_IDENTITY: { state: 'PENDING_CONNECTION', gap: 'Awaiting verified Instagram connection' },
  };
  const insufficient = Object.values(checks).filter((c) => c.state === 'INSUFFICIENT').length;
  const ready = Object.values(checks).filter((c) => c.state === 'READY').length;
  let overall: 'READY' | 'PARTIAL' | 'INSUFFICIENT' = 'INSUFFICIENT';
  if (ready >= 6) overall = 'READY';
  else if (insufficient <= 4) overall = 'PARTIAL';
  return { overall, checks, gaps: Object.entries(checks).filter(([, v]) => v.gap).map(([k, v]) => `${k}: ${v.gap}`) };
}

export async function evaluateContentBrainReadiness(orgSlug: string) {
  const { getContentBrainByOrgId } = await import('../storeAdapter.js');
  const entries = await getContentBrainByOrgId(orgIdFromSlug(orgSlug)!);
  if (entries.length === 0) return { state: 'CONTENT_BRAIN_INCOMPLETE', canonCount: 0, sufficient: false };
  const canon = entries.filter((e) => (e.metadata as Record<string, unknown>)?.entry_class === 'CANONICAL' || e.entry_class === 'CANONICAL');
  return {
    state: canon.length >= 2 ? 'SUFFICIENT' : canon.length > 0 ? 'PARTIAL' : 'CONTENT_BRAIN_INCOMPLETE',
    canonCount: canon.length,
    suggestedCount: entries.filter((e) => (e.metadata as Record<string, unknown>)?.entry_class === 'IDEA').length,
    sufficient: canon.length >= 2,
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
