import { getSupabaseAdmin } from '../supabase.js';
import { isAdminEmail } from '../adminAuth.js';
import { canAccessProjectAsOwner } from '../site00Access/accessModel.js';
import { clientOwnsProject, loadProjectForClient } from '../site00Production/clientStudio.js';
import {
  buildManifestFromScope,
  resolveServiceScope,
  buildPreviewClientManifest,
  CLIENT_PROJECT_ROOM_PREVIEW_SLUG,
} from '../../../shared/site00-client-project-room/manifestTemplates.js';
import {
  capabilitiesForRole,
  stripAdminCapabilities,
} from '../../../shared/site00-client-project-room/capabilities.js';
import { buildClientProjectRoomViewModel } from '../../../shared/site00-client-project-room/viewModel.js';
import {
  stripInternalFields,
  translateProjectEventForClient,
} from '../../../shared/site00-client-project-room/translators.js';
import type {
  ClientAttentionState,
  ClientProjectManifest,
  ClientProjectRole,
  ClientProjectRoomViewModel,
} from '../../../shared/site00-client-project-room/types.js';

const PREVIEW_SLUG = 'preview-client-room';

function formatProjectNumber(project: { id: string; metadata?: Record<string, unknown> | null }): string {
  const meta = project.metadata ?? {};
  if (typeof meta.project_number === 'string' && meta.project_number.trim()) {
    return meta.project_number.trim().toUpperCase();
  }
  return `PROJECT ${project.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

function resolveClientRole(
  project: { metadata?: Record<string, unknown> | null },
  email: string,
): ClientProjectRole {
  const meta = project.metadata ?? {};
  const role = typeof meta.client_role === 'string' ? meta.client_role.toUpperCase() : 'CLIENT_OWNER';
  if (role === 'CLIENT_COLLABORATOR' || role === 'CLIENT_VIEWER') return role;
  return 'CLIENT_OWNER';
}

function resolveAttentionState(project: {
  metadata?: Record<string, unknown> | null;
  status?: string | null;
}): ClientAttentionState {
  const meta = project.metadata ?? {};
  const fromMeta = typeof meta.client_attention_state === 'string' ? meta.client_attention_state.toUpperCase() : '';
  if (fromMeta === 'WATCHING' || fromMeta === 'YOUR_TURN' || fromMeta === 'LOCKED') return fromMeta;
  const status = (project.status ?? '').toUpperCase();
  if (status.includes('REVIEW') || status.includes('AWAITING')) return 'YOUR_TURN';
  if (status.includes('APPROVED') || status.includes('LOCKED')) return 'LOCKED';
  return 'WATCHING';
}

function resolveCurrentPhaseId(project: { current_phase?: string | null; metadata?: Record<string, unknown> | null }): string {
  const meta = project.metadata ?? {};
  if (typeof meta.client_current_phase === 'string' && meta.client_current_phase.trim()) {
    return meta.client_current_phase.trim().toLowerCase();
  }
  const phase = (project.current_phase ?? 'identity').toLowerCase();
  if (phase.includes('blueprint')) return 'blueprint';
  if (phase.includes('website')) return 'website';
  if (phase.includes('build')) return 'build';
  if (phase.includes('launch')) return 'launch';
  if (phase.includes('discovery')) return 'discovery';
  return 'identity';
}

async function loadActivityEvents(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_project_events')
    .select('id, event_type, summary, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(12);
  return data ?? [];
}

export async function buildClientProjectManifestFromProject(
  project: Record<string, unknown>,
  email: string,
): Promise<ClientProjectManifest> {
  const meta = (project.metadata as Record<string, unknown> | null) ?? {};
  const scope = resolveServiceScope({
    buildType: typeof project.build_type === 'string' ? project.build_type : null,
    buildClass: typeof project.build_class === 'string' ? project.build_class : null,
    metadataScope: typeof meta.client_service_scope === 'string' ? meta.client_service_scope : null,
  });
  const role = resolveClientRole(project as { metadata?: Record<string, unknown> | null }, email);
  const permissions = stripAdminCapabilities(capabilitiesForRole(role));
  const attentionState = resolveAttentionState(project as { metadata?: Record<string, unknown> | null; status?: string | null });
  const accentColor = typeof meta.client_accent_color === 'string' ? meta.client_accent_color : null;
  const colorProfileState =
    meta.client_color_profile_state === 'ESTABLISHED' || accentColor ? 'ESTABLISHED' : 'UNESTABLISHED';

  const manifest = buildManifestFromScope({
    projectId: String(project.id),
    projectSlug: String(project.slug),
    displayName: String(project.name ?? project.slug),
    projectNumber: formatProjectNumber(project as { id: string; metadata?: Record<string, unknown> | null }),
    scope,
    currentPhaseId: resolveCurrentPhaseId(project as { current_phase?: string | null; metadata?: Record<string, unknown> | null }),
    attentionState,
    startDate: String(project.created_at ?? new Date().toISOString()),
    accentColor,
    colorProfileState,
    role,
    permissions,
  });

  try {
    const events = await loadActivityEvents(String(project.id));
    const translated = events
      .map((e) =>
        translateProjectEventForClient({
          id: e.id,
          eventType: e.event_type,
          summary: e.summary ?? undefined,
          timestamp: e.created_at,
        }),
      )
      .filter((e) => e !== 'HIDDEN');
    if (translated.length > 0) {
      manifest.activityFeed = translated as ClientProjectManifest['activityFeed'];
    }
  } catch {
    /* keep default feed */
  }

  return manifest;
}

export async function getClientProjectRoomPayload(input: {
  projectSlug: string;
  email: string;
  userId?: string;
  previewScope?: string;
}): Promise<ClientProjectRoomViewModel> {
  const { projectSlug, email, userId, previewScope } = input;

  if (projectSlug === CLIENT_PROJECT_ROOM_PREVIEW_SLUG) {
    const manifest = buildPreviewClientManifest(previewScope);
    return buildClientProjectRoomViewModel(manifest);
  }

  const supabase = getSupabaseAdmin();
  const { data: project, error } = await supabase.from('site00_projects').select('*').eq('slug', projectSlug).maybeSingle();
  if (error || !project) throw new Error('PROJECT NOT FOUND');

  const allowed = canAccessProjectAsOwner(email, projectSlug, userId, project);
  if (!allowed) throw new Error('FORBIDDEN');

  if (isAdminEmail(email) && !clientOwnsProject(project, email, userId)) {
    /* founder QA on non-owned slug — still require explicit preview slug for synthetic data */
    throw new Error('FORBIDDEN');
  }

  const manifest = await buildClientProjectManifestFromProject(project, email);
  return stripInternalFields(buildClientProjectRoomViewModel(manifest)) as ClientProjectRoomViewModel;
}

export async function assertClientProjectAccess(projectSlug: string, email: string, userId?: string): Promise<void> {
  if (projectSlug === CLIENT_PROJECT_ROOM_PREVIEW_SLUG) return;
  await loadProjectForClient(projectSlug, email, userId);
}
