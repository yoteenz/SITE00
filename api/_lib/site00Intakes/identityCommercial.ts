import type { IntakeRecord } from './types.js';
import { getSupabaseAdmin } from '../supabase.js';
import type { IdentityCommercialState } from '../../../shared/site00-identity-commercial/types.js';
import {
  attachIdentityProjectToSnapshot,
  authorizeIdentityCommercial,
  bootstrapIdentityProjectContext,
  hydrateSnapshotFromCommercialState,
  initialIdentityCommercialState,
  seedProductionSnapshot,
} from '../../../shared/site00-identity-commercial/pipeline.js';
import { commercialBlockFromDraftPayload } from '../../../shared/site00-identity-commercial/ctaContext.js';
import { intakeContextFromPackage } from '../../../shared/site00-commercial-canon/contracts.js';
import { getCanonicalPackage } from '../../../shared/site00-commercial-canon/serviceCatalog.js';
import { setIdentityProductionSnapshot } from '../../../shared/site00-identity-commercial/runtimeStore.js';
import { activateIdentityCommercialAfterIntakeSubmit as runIdentityActivation } from '../../../shared/site00-identity-commercial/activation.js';

function parseStored(raw: unknown): IdentityCommercialState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as IdentityCommercialState;
  if (!o.selection?.serviceId || !o.version) return null;
  const bootstrap = o.bootstrap ?? ({} as IdentityCommercialState['bootstrap']);
  return {
    ...o,
    bootstrap: {
      projectId: bootstrap.projectId ?? null,
      projectSlug: bootstrap.projectSlug ?? null,
      projectType: 'IDENTITY',
      fulfillmentAdapterId: 'identity-fulfillment',
      fulfillmentContractId:
        bootstrap.fulfillmentContractId ?? `${o.selection.serviceId}:${o.selection.packageId}`,
      commercialRecordId: bootstrap.commercialRecordId ?? null,
      clientId: bootstrap.clientId ?? null,
      brandId: bootstrap.brandId ?? null,
      blockedByFounderDecisionId: bootstrap.blockedByFounderDecisionId ?? null,
    },
  };
}

export async function loadIdentityCommercialState(intakeId: string): Promise<IdentityCommercialState | null> {
  const { data } = await getSupabaseAdmin()
    .from('site00_idnty_submissions')
    .select('commercial_state')
    .eq('id', intakeId)
    .maybeSingle();
  if (!data) return null;
  return parseStored(data.commercial_state);
}

export async function saveIdentityCommercialState(intakeId: string, state: IdentityCommercialState): Promise<void> {
  await getSupabaseAdmin()
    .from('site00_idnty_submissions')
    .update({ commercial_state: state, updated_at: new Date().toISOString() })
    .eq('id', intakeId);
}

export async function ensureIdentityCommercialFromIntake(intake: IntakeRecord): Promise<IdentityCommercialState> {
  const existing = await loadIdentityCommercialState(intake.id);
  if (existing) {
    hydrateSnapshotFromCommercialState(intake.id, existing, intake.draftPayload);
    return existing;
  }
  const selection =
    commercialBlockFromDraftPayload(intake.draftPayload) ??
    ({
      serviceId: 'services-hub-branding',
      packageId: 'services-hub-branding',
      commercialMode: 'CUSTOM_QUOTE',
    } as const);
  const state = initialIdentityCommercialState(selection, {
    intakeId: intake.id,
    clientId: intake.email ?? intake.userId ?? intake.id,
    brandId: (intake.draftPayload.businessName as string) ?? null,
  });
  await saveIdentityCommercialState(intake.id, state);
  seedProductionSnapshot({
    intakeId: intake.id,
    clientId: intake.email ?? intake.userId ?? intake.id,
    selection,
    draftPayload: intake.draftPayload,
  });
  return state;
}

export async function authorizeIdentityIntakeCommercial(intake: IntakeRecord, authorizationRef: string) {
  let state = (await loadIdentityCommercialState(intake.id)) ?? (await ensureIdentityCommercialFromIntake(intake));
  state = authorizeIdentityCommercial(state, { authorizationRef, method: 'TEST_SIMULATION' });
  await saveIdentityCommercialState(intake.id, state);
  const snap = hydrateSnapshotFromCommercialState(intake.id, state, intake.draftPayload);
  setIdentityProductionSnapshot(intake.id, { ...snap, authorization: state.authorization });
  return state;
}

export async function convertIdentityIntakeToProject(intake: IntakeRecord, actorEmail?: string) {
  if (intake.projectId) {
    return { projectId: intake.projectId, projectSlug: null, created: false };
  }
  const state = await ensureIdentityCommercialFromIntake(intake);
  if (state.authorization.status !== 'AUTHORIZED') {
    throw new Error('Commercial authorization required before Identity project bootstrap');
  }

  const supabase = getSupabaseAdmin();
  const email = intake.email ?? 'identity-client@site00.local';
  const slugBase = (intake.domainLabel ?? 'identity')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `idnty-${slugBase}-${Date.now().toString(36)}`;

  const { data: project, error } = await supabase
    .from('site00_projects')
    .insert({
      slug,
      name: `IDENTITY — ${intake.domainLabel}`.toUpperCase(),
      client_email: email,
      build_class: 'IDENTITY',
      build_type: 'IDENTITY',
      identity_state: intake.domainLabel,
      current_phase: 'DISCOVERY',
      project_health: 'ON_TRACK',
      payment_state: 'AUTHORIZED',
      provisioning_state: 'NOT_STARTED',
      production_readiness_pct: 0,
      environment_readiness_pct: 0,
      status: 'ORIGIN_INGESTED',
      metadata: {
        intakeId: intake.id,
        commercialRecordId: intake.id,
        clientId: email,
        brandId: state.bootstrap.brandId ?? (intake.draftPayload.businessName as string) ?? null,
        serviceId: state.selection.serviceId,
        packageId: state.selection.packageId,
        fulfillmentContractId: state.bootstrap.fulfillmentContractId,
        fulfillmentAdapterId: state.bootstrap.fulfillmentAdapterId,
        projectType: state.bootstrap.projectType,
        intakeHandoff: intake.draftPayload,
        commercialAuthorization: state.authorization,
        bootstrapActor: actorEmail ?? null,
      },
    })
    .select('id, slug')
    .single();
  if (error || !project) throw error ?? new Error('FAILED TO CREATE IDENTITY PROJECT');

  await supabase
    .from('site00_idnty_submissions')
    .update({ project_id: project.id, status: 'CONVERTED', updated_at: new Date().toISOString() })
    .eq('id', intake.id);

  const nextState: IdentityCommercialState = {
    ...state,
    bootstrap: { ...state.bootstrap, projectId: project.id, projectSlug: project.slug },
  };
  await saveIdentityCommercialState(intake.id, nextState);

  const snap = seedProductionSnapshot({
    intakeId: intake.id,
    clientId: email,
    selection: state.selection,
    draftPayload: intake.draftPayload,
  });
  attachIdentityProjectToSnapshot(snap, {
    projectId: project.id,
    projectSlug: project.slug,
    projectStatus: 'ORIGIN_INGESTED',
  });

  const pkg = getCanonicalPackage(state.selection.serviceId, state.selection.packageId);
  const bootstrapCtx = pkg
    ? bootstrapIdentityProjectContext({
        intake: intakeContextFromPackage(pkg),
        commercialRecordId: intake.id,
        clientId: email,
        brandId: (intake.draftPayload.businessName as string) ?? null,
        projectId: project.id,
        projectSlug: project.slug,
      })
    : null;

  return { projectId: project.id, projectSlug: project.slug, created: true, bootstrapCtx };
}

export async function activateIdentityCommercialAfterIntakeSubmit(intake: IntakeRecord) {
  return runIdentityActivation(intake, {
    ensureCommercial: ensureIdentityCommercialFromIntake,
    authorizeCommercial: authorizeIdentityIntakeCommercial,
    convertToProject: async (record, actorEmail) => {
      const result = await convertIdentityIntakeToProject(record, actorEmail);
      return {
        projectId: result.projectId,
        projectSlug: result.projectSlug,
        created: result.created,
      };
    },
    saveState: saveIdentityCommercialState,
  });
}
