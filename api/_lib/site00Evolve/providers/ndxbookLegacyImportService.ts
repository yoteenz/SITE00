/** NDXbook legacy intelligence import — Studio World handoff → EVOLVE canon */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import {
  getProfileByOrgId,
  getObjectivesByOrgId,
  getChannelsByOrgId,
  getContentBrainByOrgId,
  insertContentBrainEntry,
  insertObjective,
} from '../storeAdapter.js';
import { getEvolveStore } from '../memoryStore.js';
import * as dbStore from '../supabaseStore.js';
import { useMemoryStore } from '../storeAdapter.js';
import { runMarketingAssessment } from '../assessment.js';
import { generateNdxbookManifest, evaluateBrandReadiness } from './ndxbookService.js';
import { getExpandedPilotReadiness } from './pilotReadinessSprint04.js';
import { listSafeConnections } from './connectionService.js';
import { upsertPage001Candidate, getPage001Candidate } from './page001CandidateService.js';
import { ensurePilotConfig } from './connectionService.js';

export type ImportState =
  | 'DISCOVERED'
  | 'REVIEWED'
  | 'OWNER_CONFIRMED'
  | 'IMPORT_APPROVED'
  | 'IMPORTED';

export type NdxbookHandoff = Record<string, unknown>;

const NDXBOOK_UUID = '7681ab75-bddc-43e5-b594-79fcf8168205';
const SOURCE_REPO = 'yoteenz/fsbw';
const SOURCE_PATH = 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json';

let memImportState: {
  state: ImportState;
  importedAt: string | null;
  audit: Array<Record<string, unknown>>;
  runCount: number;
} = {
  state: 'DISCOVERED',
  importedAt: null,
  audit: [],
  runCount: 0,
};

export function resetNdxbookImportMemory(): void {
  memImportState = { state: 'DISCOVERED', importedAt: null, audit: [], runCount: 0 };
}

export function getNdxbookImportState() {
  return { ...memImportState };
}

export function loadNdxbookHandoff(): NdxbookHandoff {
  try {
    const path = join(process.cwd(), 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json');
    return JSON.parse(readFileSync(path, 'utf8')) as NdxbookHandoff;
  } catch {
    return {};
  }
}

function assertNdxbookOrg(): string {
  const orgId = orgIdFromSlug('ndxbook');
  if (!orgId) throw new Error('NDXbook organization not registered');
  if (!useMemoryStore() && orgId !== NDXBOOK_UUID) {
    throw new Error('NDXbook UUID mismatch — refusing import');
  }
  return orgId;
}

function audit(entry: Record<string, unknown>) {
  memImportState.audit.push({ ...entry, at: new Date().toISOString() });
}

async function upsertContentBrainIdempotent(
  orgId: string,
  importKey: string,
  entry: Record<string, unknown>,
): Promise<'created' | 'skipped'> {
  const existing = await getContentBrainByOrgId(orgId);
  if (existing.some((e) => (e.metadata as Record<string, unknown>)?.import_key === importKey)) {
    return 'skipped';
  }
  await insertContentBrainEntry({
    id: randomUUID(),
    organization_id: orgId,
    approval_state: entry.approval_state ?? 'APPROVED',
    ...entry,
    metadata: {
      ...(entry.metadata as object),
      import_key: importKey,
      source_repository: SOURCE_REPO,
      source_path: SOURCE_PATH,
      imported_at: new Date().toISOString(),
    },
  });
  return 'created';
}

async function reconcileProfile(handoff: NdxbookHandoff, orgId: string) {
  const brand = handoff.brand as Record<string, string>;
  const fc = handoff.founderConfirmed as Record<string, unknown>;
  const launch = handoff.launchState as Record<string, unknown>;
  const pilot = handoff.pilotPolicy as Record<string, unknown>;
  const existing = await getProfileByOrgId(orgId);

  const reconciled = {
    id: existing?.id ?? randomUUID(),
    organization_id: orgId,
    lifecycle_stage: String(launch?.state ?? 'PRE_LAUNCH_PILOT'),
    primary_objective: String(fc?.primaryObjective ?? ''),
    secondary_objectives: (fc?.secondaryObjectives as string[]) ?? [],
    audience_summary: String(fc?.targetAudience ?? ''),
    offer_summary: String(brand?.description ?? ''),
    positioning_summary: String(brand?.positioning ?? ''),
    marketing_maturity: 'ASSESSMENT_COMPLETE',
    monthly_budget_range: null,
    production_budget_range: null,
    approval_mode: 'OWNER_APPROVAL_REQUIRED',
    strategy_status: 'IN_PROGRESS',
    metadata: {
      ...(existing?.metadata as object),
      seed: 'ndxbook_legacy_import',
      assessment_status: 'ASSESSMENT_COMPLETE',
      public_name: brand?.publicName,
      display_name: brand?.displayName,
      internal_name: brand?.internalName,
      brand_promise: brand?.promise,
      name_styling_rule: brand?.nameStylingRule,
      monetization_state: String(fc?.monetization ?? 'DEFERRED'),
      visual_dna_status: 'INCOMPLETE_REFERENCE_ONLY',
      cta_strategy: 'TO_BE_DEVELOPED',
      measurement_state: 'UNMEASURED',
      launch_state: launch?.state,
      canonical_published_pages: launch?.canonicalPublishedPages ?? 0,
      starting_page: launch?.startingPage ?? 'PAGE_001',
      talent_strategy: 'UNDECIDED',
      brand_voice_available: true,
      visual_identity_available: false,
      logo_available: false,
      legacy_import: {
        state: memImportState.state,
        source_repository: SOURCE_REPO,
        source_path: SOURCE_PATH,
        imported_at: memImportState.importedAt,
      },
      instagram_reconciliation: handoff.instagramReconciliation,
      automation_mode: pilot?.automationMode,
      human_approval_required: pilot?.humanApprovalRequired,
    },
  };

  if (existing?.primary_objective && existing.primary_objective !== reconciled.primary_objective) {
    audit({
      field: 'primary_objective',
      previous: existing.primary_objective,
      imported: reconciled.primary_objective,
      precedence: 'FOUNDER_CONFIRMED',
    });
  }

  if (useMemoryStore()) {
    const store = getEvolveStore();
    const idx = store.profiles.findIndex((p) => p.organization_id === orgId);
    if (idx >= 0) store.profiles[idx] = reconciled as never;
    else store.profiles.push(reconciled as never);
  } else {
    await dbStore.upsertProfile(reconciled as never);
  }
  return reconciled;
}

async function reconcileObjectives(handoff: NdxbookHandoff, orgId: string) {
  const fc = handoff.founderConfirmed as Record<string, unknown>;
  const primary = String(fc?.primaryObjective ?? '');
  const secondary = (fc?.secondaryObjectives as string[]) ?? [];
  const existing = await getObjectivesByOrgId(orgId);
  const results: Array<{ key: string; action: string }> = [];

  const primaryRow = {
    id: existing.find((o) => o.objective_key === 'ndx-primary')?.id ?? randomUUID(),
    organization_id: orgId,
    objective_key: 'ndx-primary',
    title: primary,
    objective_type: 'PIPELINE_VALIDATION',
    status: 'ACTIVE',
    priority: 1,
    metadata: {
      provenance: 'FOUNDER_CONFIRMED',
      source: 'LEGACY_IMPORT',
      measurement_state: 'UNMEASURED',
      demo_metrics_rejected: true,
    },
  };
  results.push({ key: 'ndx-primary', action: 'upserted' });

  if (useMemoryStore()) {
    const store = getEvolveStore();
    store.objectives = store.objectives.filter(
      (o) => !(o.organization_id === orgId && String(o.objective_key ?? '').startsWith('ndx-')),
    );
    store.objectives.push(primaryRow as never);
    secondary.forEach((title, i) => {
      const key = `ndx-secondary-${i + 1}`;
      store.objectives.push({
        id: randomUUID(),
        organization_id: orgId,
        objective_key: key,
        title,
        objective_type: 'AWARENESS',
        status: 'ACTIVE',
        priority: i + 2,
        metadata: { provenance: 'FOUNDER_CONFIRMED', source: 'LEGACY_IMPORT' },
      } as never);
      results.push({ key, action: 'upserted' });
    });
  } else {
    await insertObjective(primaryRow as never);
    for (let i = 0; i < secondary.length; i++) {
      await insertObjective({
        id: randomUUID(),
        organization_id: orgId,
        objective_key: `ndx-secondary-${i + 1}`,
        title: secondary[i],
        objective_type: 'AWARENESS',
        status: 'ACTIVE',
        priority: i + 2,
        metadata: { provenance: 'FOUNDER_CONFIRMED', source: 'LEGACY_IMPORT' },
      } as never);
    }
  }

  audit({ action: 'objectives_reconciled', demo_reader_metrics_rejected: true, results });
  return results;
}

async function reconcileChannels(handoff: NdxbookHandoff, orgId: string) {
  const platforms = (handoff.platformRegistry as string[]) ?? [];
  const pilot = handoff.pilotPolicy as Record<string, string>;
  const existing = await getChannelsByOrgId(orgId);
  const channelMap: Record<string, string> = {
    Instagram: 'INSTAGRAM',
    TikTok: 'TIKTOK',
    'YouTube Shorts': 'YOUTUBE',
    Facebook: 'FACEBOOK',
    Threads: 'THREADS',
    X: 'X',
    Pinterest: 'PINTEREST',
  };

  const rows = platforms.map((p) => {
    const key = channelMap[p] ?? p.toUpperCase().replace(/\s+/g, '_');
    const isInstagram = key === 'INSTAGRAM';
    const ex = existing.find((c) => c.channel_key === key);
    return {
      id: ex?.id ?? randomUUID(),
      organization_id: orgId,
      channel_key: key,
      channel_state: isInstagram ? 'ACTIVE' : 'LOCKED',
      is_required: isInstagram,
      owner_decision: isInstagram ? null : 'LOCKED_DURING_INITIAL_PILOT',
      notes: isInstagram ? 'ACTIVE_PILOT_CHANNEL' : 'LOCKED_DURING_INITIAL_PILOT',
      metadata: {
        marketing_state: isInstagram ? 'ACTIVE_PILOT_CHANNEL' : 'LOCKED',
        connection_state: 'NOT_CONNECTED',
        pilot: true,
        cross_posting: false,
      },
    };
  });

  if (useMemoryStore()) {
    const store = getEvolveStore();
    const other = store.channels.filter((c) => c.organization_id !== orgId);
    store.channels = [...other, ...(rows as never)];
  } else {
    await dbStore.upsertChannels(rows as never);
  }

  audit({ action: 'channels_reconciled', instagram: pilot?.instagramChannel, automation: pilot?.automationMode });
  return rows.length;
}

async function importContentBrain(handoff: NdxbookHandoff, orgId: string) {
  const brand = handoff.brand as Record<string, string>;
  const fc = handoff.founderConfirmed as Record<string, unknown>;
  const voice = handoff.voice as Record<string, unknown>;
  const taxonomy = handoff.taxonomy as Record<string, string>;
  const business = handoff.businessModel as Record<string, string>;
  const rejected = handoff.rejectedDemoData as Record<string, unknown>;
  const reference = handoff.referenceOnly as Record<string, unknown>;

  const canonEntries: Array<{ key: string; entry: Record<string, unknown> }> = [
    { key: 'brand.positioning', entry: { entry_type: 'brand_positioning', title: 'Positioning', content: { text: brand.positioning }, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON', classification: 'OWNER_CONFIRMED' } } },
    { key: 'brand.promise', entry: { entry_type: 'brand_promise', title: 'Promise', content: { text: brand.promise }, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'brand.description', entry: { entry_type: 'brand_description', title: 'Description', content: { text: brand.description }, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'brand.public_name', entry: { entry_type: 'brand_identity', title: 'Public Name', content: { name: brand.publicName, display: brand.displayName, rule: brand.nameStylingRule }, metadata: { entry_class: 'CANONICAL', provenance: 'FOUNDER_CONFIRMED' } } },
    { key: 'audience', entry: { entry_type: 'audience', title: 'Target Audience', content: { text: fc.targetAudience, ageRange: fc.ageRange }, metadata: { entry_class: 'CANONICAL', provenance: 'FOUNDER_CONFIRMED', demo_age_rejected: true } } },
    { key: 'voice', entry: { entry_type: 'brand_voice', title: 'Brand Voice', content: voice, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'taxonomy', entry: { entry_type: 'content_taxonomy', title: 'Content Taxonomy', content: taxonomy, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'volumes', entry: { entry_type: 'content_structure', title: 'Five Launch Volumes', content: handoff.contentStructure, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'programming', entry: { entry_type: 'programming_cadence', title: 'Programming Cadence', content: { schedule: handoff.programmingCadence }, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'business', entry: { entry_type: 'business_model', title: 'Business Model', content: business, metadata: { entry_class: 'CANONICAL', provenance: 'RECOVERED_CANON' } } },
    { key: 'objectives.primary', entry: { entry_type: 'objective', title: 'Primary Objective', content: { text: fc.primaryObjective }, metadata: { entry_class: 'CANONICAL', provenance: 'FOUNDER_CONFIRMED' } } },
    { key: 'launch.state', entry: { entry_type: 'launch_state', title: 'Launch State', content: handoff.launchState, metadata: { entry_class: 'CANONICAL', provenance: 'FOUNDER_CONFIRMED', zero_history: true } } },
  ];

  const referenceEntries: Array<{ key: string; entry: Record<string, unknown> }> = [
    { key: 'ref.visual_dna', entry: { entry_type: 'visual_direction', title: 'Placeholder Visual DNA', content: reference.visualDnaPlaceholder, metadata: { entry_class: 'REFERENCE', provenance: 'REFERENCE_ONLY', not_canon: true } } },
    { key: 'ref.monetization', entry: { entry_type: 'monetization_hypothesis', title: 'Future Monetization Hypotheses', content: { hypotheses: reference.monetizationHypotheses, state: 'DEFERRED' }, metadata: { entry_class: 'REFERENCE', provenance: 'REFERENCE_ONLY' } } },
    { key: 'ref.page001_legacy', entry: { entry_type: 'content_specimen', title: 'Page 001 Legacy Reference', content: reference.page001LegacyAssets, metadata: { entry_class: 'REFERENCE', provenance: 'REFERENCE_CONTENT' } } },
    { key: 'archive.demo_pages', entry: { entry_type: 'archive', title: 'Legacy Demo Pages 019–042', content: { range: rejected.legacyPages, items: rejected.publicationHistory, classification: 'REFERENCE_ARCHIVE_NON_CANONICAL' }, metadata: { entry_class: 'REFERENCE', provenance: 'REJECTED_DEMO', never_published: true } } },
  ];

  const rejectedEntries: Array<{ key: string; entry: Record<string, unknown> }> = [
    { key: 'rejected.demo_metrics', entry: { entry_type: 'rejected_data', title: 'Rejected Demo Metrics', content: rejected.metrics, metadata: { entry_class: 'REJECTED', provenance: 'DEMO_OBSOLETE', not_imported_as_truth: true } } },
    { key: 'rejected.lace_mastery', entry: { entry_type: 'misattributed', title: 'Lace Mastery Misattribution', content: rejected.laceMasteryRoute, metadata: { entry_class: 'MISATTRIBUTED', provenance: 'REJECTED', not_ndxbook_canon: true } } },
  ];

  let created = 0;
  let skipped = 0;
  for (const batch of [canonEntries, referenceEntries, rejectedEntries]) {
    for (const { key, entry } of batch) {
      const result = await upsertContentBrainIdempotent(orgId, key, entry);
      if (result === 'created') created++;
      else skipped++;
    }
  }

  return { created, skipped, canonical: canonEntries.length, reference: referenceEntries.length, rejected: rejectedEntries.length };
}

async function reconcileProvider(handoff: NdxbookHandoff) {
  const ig = handoff.instagramReconciliation as Record<string, string>;
  const connections = await listSafeConnections('ndxbook');
  const social = connections.find((c) => c.providerCategory === 'SOCIAL');

  if (!social || social.status === 'NOT_CONNECTED' || social.status === 'AUTHORIZATION_REQUIRED') {
    return {
      connectionState: social?.status ?? 'NOT_CONNECTED',
      accountIdentityMatch: null,
      message: 'EVOLVE connection remains NOT_CONNECTED — recovered IDs stored for reconciliation only',
    };
  }

  const extId = social.externalAccountName ?? '';
  const match =
    extId.includes('Ndxbook') ||
    extId.includes('ndxbook') ||
    (social as { external_account_id?: string }).external_account_id === ig.instagramBusinessAccountId;

  return {
    connectionState: social.status,
    accountIdentityMatch: match,
    recoveredPageId: ig.pageId,
    recoveredIgBusinessId: ig.instagramBusinessAccountId,
    message: match ? 'Safe identifier match' : 'NEEDS_YOU — account identity mismatch',
  };
}

export async function runNdxbookLegacyImport(opts?: { approvedBy?: string }) {
  const orgId = assertNdxbookOrg();
  const handoff = loadNdxbookHandoff();
  if (!handoff.targetOrganization) throw new Error('Handoff package invalid');

  const target = handoff.targetOrganization as { slug: string; uuid: string };
  if (target.slug !== 'ndxbook') throw new Error('Handoff target is not ndxbook');
  if (!useMemoryStore() && target.uuid !== NDXBOOK_UUID) throw new Error('UUID mismatch — duplicate org refused');

  memImportState.state = 'IMPORT_APPROVED';
  memImportState.runCount += 1;

  const profile = await reconcileProfile(handoff, orgId);
  const objectives = await reconcileObjectives(handoff, orgId);
  const channelCount = await reconcileChannels(handoff, orgId);
  const contentBrain = await importContentBrain(handoff, orgId);

  await runMarketingAssessment(
    {
      orgSlug: 'ndxbook',
      orgClassification: 'MANAGED_BRAND',
      orgName: 'NDXBOOK',
      externalConnections: [],
    },
    opts?.approvedBy ?? 'legacy-import',
  );

  const page001 = handoff.page001 as Record<string, string>;
  const page001Candidate = upsertPage001Candidate('ndxbook', {
    topic: page001.topic,
    volume: page001.volume,
    channel: page001.destination ?? 'INSTAGRAM',
    metadata: {
      programming_day_note: page001.programmingDayNote,
      publication_approval: page001.publicationApproval,
      visual_approval: page001.visualApproval,
      script_approval: page001.scriptApproval,
    },
  });

  const manifest = await generateNdxbookManifest();
  const provider = await reconcileProvider(handoff);
  const pilot = await ensurePilotConfig('ndxbook');
  const readiness = await getExpandedPilotReadiness('ndxbook');
  const brand = await evaluateBrandReadiness('ndxbook');

  memImportState.state = 'IMPORTED';
  memImportState.importedAt = new Date().toISOString();

  audit({
    action: 'import_complete',
    approvedBy: opts?.approvedBy,
    idempotentRun: memImportState.runCount,
    secretsImported: false,
  });

  return {
    status: 'IMPORTED',
    organization: { slug: 'ndxbook', uuid: orgId, duplicateCreated: false },
    importState: memImportState.state,
    runCount: memImportState.runCount,
    profile: { id: profile.id, maturity: profile.marketing_maturity },
    objectives,
    channelCount,
    contentBrain,
    page001Candidate,
    manifest: manifest.ok !== false ? 'generated' : manifest,
    provider,
    pilot: {
      automation: pilot.automation_mode,
      publishing: pilot.publishing_status,
      humanApproval: pilot.human_approval_required,
    },
    readiness: readiness.currentState,
    brandReadiness: brand.overall,
    visualDna: 'INCOMPLETE_REFERENCE_ONLY',
    audit: memImportState.audit,
    secretsImported: false,
    providerWrites: 0,
  };
}

export async function getNdxbookImportReport() {
  const orgId = assertNdxbookOrg();
  const handoff = loadNdxbookHandoff();
  return {
    importState: getNdxbookImportState(),
    handoffLoaded: Boolean(handoff.targetOrganization),
    organization: { slug: 'ndxbook', uuid: orgId },
    page001: getPage001Candidate('ndxbook'),
    contentBrainCount: (await getContentBrainByOrgId(orgId)).length,
  };
}
