import { getSupabaseAdmin } from '../supabase.js';
import type { IngestionInput } from './types.js';

export async function recordOrchestrationEvent(input: {
  organizationId?: string;
  manifestId?: string;
  requirementId?: string;
  eventType: string;
  actorType?: string;
  actorEmail?: string;
  summary: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('site00_orchestration_events').insert({
    organization_id: input.organizationId ?? null,
    manifest_id: input.manifestId ?? null,
    requirement_id: input.requirementId ?? null,
    event_type: input.eventType,
    actor_type: input.actorType ?? 'SYSTEM',
    actor_email: input.actorEmail ?? null,
    summary: input.summary,
    before_state: input.beforeState ?? null,
    after_state: input.afterState ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function getOrchestrationHistory(organizationId: string, limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_orchestration_events')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function ingestExistingProject(input: IngestionInput, actorEmail?: string) {
  const supabase = getSupabaseAdmin();

  let projectId: string | null = null;
  if (input.projectSlug) {
    const { resolveProjectDbId } = await import('../site00Projects/canonicalProject.js');
    projectId = await resolveProjectDbId({ slug: input.projectSlug });
  }

  const { data: ingestion, error } = await supabase
    .from('site00_project_ingestions')
    .insert({
      project_name: input.projectName,
      organization_name: input.organizationName ?? null,
      project_classification: input.projectClassification ?? null,
      project_type: input.projectType ?? null,
      project_id: projectId,
      existing_or_new: input.existingOrNew ?? 'EXISTING',
      current_state: input.currentState ?? null,
      repository_reference: input.repositoryReference ?? null,
      production_engine: input.productionEngine ?? null,
      known_database: input.knownDatabase ?? null,
      known_deployment: input.knownDeployment ?? null,
      current_objective: input.currentObjective ?? null,
      current_launch_target: input.currentLaunchTarget ?? null,
      ingestion_state: projectId ? 'LINKED' : 'RECONCILIATION_REQUIRED',
      reconciliation_note: projectId ? null : 'No project_id resolved at ingestion time',
      metadata: { source: 'orchestration_ingestion', demo: false },
    })
    .select('*')
    .single();

  if (error) throw error;

  await recordOrchestrationEvent({
    eventType: 'PROJECT_INGESTED',
    actorType: 'ADMIN',
    actorEmail,
    summary: `Existing project "${input.projectName}" registered for reconciliation`,
    afterState: { ingestionId: ingestion.id, state: 'RECONCILIATION_REQUIRED' },
    metadata: input as unknown as Record<string, unknown>,
  });

  return ingestion;
}

export async function addEvidenceRecord(input: {
  organizationId: string;
  requirementId?: string;
  workstreamId?: string;
  signalId?: string;
  evidenceType: string;
  title: string;
  description?: string;
  source: string;
  externalRef?: string;
  recordedBy?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_evidence_records')
    .insert({
      organization_id: input.organizationId,
      requirement_id: input.requirementId ?? null,
      workstream_id: input.workstreamId ?? null,
      signal_id: input.signalId ?? null,
      evidence_type: input.evidenceType,
      title: input.title,
      description: input.description ?? null,
      source: input.source,
      external_ref: input.externalRef ?? null,
      does_not_imply_completion: true,
      recorded_by: input.recordedBy ?? 'SYSTEM',
    })
    .select('*')
    .single();

  if (error) throw error;

  await recordOrchestrationEvent({
    organizationId: input.organizationId,
    requirementId: input.requirementId,
    eventType: 'EVIDENCE_RECORDED',
    summary: `Evidence recorded: ${input.title} (does not imply completion)`,
    afterState: { evidenceId: data.id },
  });

  return data;
}
