/**
 * Experience Engine V0 persistence — Supabase with in-memory fallback for tests.
 */

import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '../supabase.js';
import type {
  Site00FidelityIterationRecord,
  Site00RouteReferenceRecord,
} from '../../../shared/site00-experience-engine/types.js';
import { SITE00_HOST_PROJECT_KEY } from '../../../shared/site00-experience-engine/constants.js';

const ROUTE_REFERENCES = 'site00_route_references';
const FIDELITY_ITERATIONS = 'site00_fidelity_iterations';

const memoryReferences = new Map<string, Site00RouteReferenceRecord>();
const memoryIterations = new Map<string, Site00FidelityIterationRecord>();

function useMemoryStore(): boolean {
  return process.env.EXPERIENCE_ENGINE_MEMORY_STORE === '1' || process.env.VITEST === 'true';
}

let memoryStoreForced = false;

function forceMemoryStore(): void {
  memoryStoreForced = true;
}

function shouldUseMemoryStore(): boolean {
  return useMemoryStore() || memoryStoreForced;
}

function rowToReference(row: Record<string, unknown>): Site00RouteReferenceRecord {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    projectKey: row.project_key as string,
    routeId: row.route_id as string,
    viewportClass: row.viewport_class as Site00RouteReferenceRecord['viewportClass'],
    referenceStoragePath: row.reference_storage_path as string,
    authorityLevel: row.authority_level as Site00RouteReferenceRecord['authorityLevel'],
    referenceKind: row.reference_kind as Site00RouteReferenceRecord['referenceKind'],
    status: row.status as Site00RouteReferenceRecord['status'],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToIteration(row: Record<string, unknown>): Site00FidelityIterationRecord {
  return {
    id: row.id as string,
    routeReferenceId: row.route_reference_id as string,
    iterationNumber: row.iteration_number as number,
    renderStoragePath: row.render_storage_path as string,
    heatmapStoragePath: (row.heatmap_storage_path as string) ?? null,
    pixelScore: Number(row.pixel_score),
    structuralScore: row.structural_score != null ? Number(row.structural_score) : null,
    status: row.status as Site00FidelityIterationRecord['status'],
    comparisonMetadata: row.comparison_metadata as Site00FidelityIterationRecord['comparisonMetadata'],
    createdAt: row.created_at as string,
  };
}

export async function listRouteReferences(params: {
  projectKey?: string;
  routeId: string;
  viewportClass?: Site00RouteReferenceRecord['viewportClass'];
}): Promise<Site00RouteReferenceRecord[]> {
  if (shouldUseMemoryStore()) {
    return [...memoryReferences.values()].filter((r) => {
      if (r.routeId !== params.routeId) return false;
      if (params.projectKey && r.projectKey !== params.projectKey) return false;
      if (params.viewportClass && r.viewportClass !== params.viewportClass) return false;
      return true;
    });
  }

  try {
    let query = getSupabaseAdmin()
      .from(ROUTE_REFERENCES)
      .select('*')
      .eq('route_id', params.routeId);
    if (params.projectKey) query = query.eq('project_key', params.projectKey);
    if (params.viewportClass) query = query.eq('viewport_class', params.viewportClass);
    const { data, error } = await query;
    if (error) {
      if (error.message.includes('site00_route_references')) {
        forceMemoryStore();
        return listRouteReferences(params);
      }
      throw new Error(error.message);
    }
    return (data ?? []).map(rowToReference);
  } catch (error) {
    if (!shouldUseMemoryStore()) {
      forceMemoryStore();
      return listRouteReferences(params);
    }
    throw error;
  }
}

export async function upsertRouteReference(
  input: Omit<Site00RouteReferenceRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<Site00RouteReferenceRecord> {
  const now = new Date().toISOString();
  const record: Site00RouteReferenceRecord = {
    id: input.id ?? randomUUID(),
    projectId: input.projectId,
    projectKey: input.projectKey,
    routeId: input.routeId,
    viewportClass: input.viewportClass,
    referenceStoragePath: input.referenceStoragePath,
    authorityLevel: input.authorityLevel,
    referenceKind: input.referenceKind,
    status: input.status,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  if (shouldUseMemoryStore()) {
    memoryReferences.set(record.id, record);
    return record;
  }

  const { data, error } = await getSupabaseAdmin()
    .from(ROUTE_REFERENCES)
    .upsert(
      {
        id: record.id,
        project_id: record.projectId,
        project_key: record.projectKey,
        route_id: record.routeId,
        viewport_class: record.viewportClass,
        reference_storage_path: record.referenceStoragePath,
        authority_level: record.authorityLevel,
        reference_kind: record.referenceKind,
        status: record.status,
        metadata: record.metadata,
        updated_at: now,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();
  if (error) {
    if (error.message.includes('site00_route_references') || error.message.includes('schema cache')) {
      forceMemoryStore();
      memoryReferences.set(record.id, record);
      return record;
    }
    throw new Error(error.message);
  }
  return rowToReference(data);
}

export async function saveFidelityIteration(
  input: Omit<Site00FidelityIterationRecord, 'id' | 'createdAt'> & { id?: string },
): Promise<Site00FidelityIterationRecord> {
  const record: Site00FidelityIterationRecord = {
    id: input.id ?? randomUUID(),
    routeReferenceId: input.routeReferenceId,
    iterationNumber: input.iterationNumber,
    renderStoragePath: input.renderStoragePath,
    heatmapStoragePath: input.heatmapStoragePath,
    pixelScore: input.pixelScore,
    structuralScore: input.structuralScore,
    status: input.status,
    comparisonMetadata: input.comparisonMetadata,
    createdAt: new Date().toISOString(),
  };

  if (shouldUseMemoryStore()) {
    memoryIterations.set(record.id, record);
    return record;
  }

  const { data, error } = await getSupabaseAdmin()
    .from(FIDELITY_ITERATIONS)
    .upsert(
      {
        id: record.id,
        route_reference_id: record.routeReferenceId,
        iteration_number: record.iterationNumber,
        render_storage_path: record.renderStoragePath,
        heatmap_storage_path: record.heatmapStoragePath,
        pixel_score: record.pixelScore,
        structural_score: record.structuralScore,
        status: record.status,
        comparison_metadata: record.comparisonMetadata,
      },
      { onConflict: 'route_reference_id,iteration_number' },
    )
    .select('*')
    .single();
  if (error) {
    if (error.message.includes('site00_fidelity_iterations') || error.message.includes('schema cache')) {
      forceMemoryStore();
      memoryIterations.set(record.id, record);
      return record;
    }
    throw new Error(error.message);
  }
  return rowToIteration(data);
}

export async function listFidelityIterations(routeReferenceId: string): Promise<Site00FidelityIterationRecord[]> {
  if (shouldUseMemoryStore()) {
    return [...memoryIterations.values()]
      .filter((i) => i.routeReferenceId === routeReferenceId)
      .sort((a, b) => a.iterationNumber - b.iterationNumber);
  }
  const { data, error } = await getSupabaseAdmin()
    .from(FIDELITY_ITERATIONS)
    .select('*')
    .eq('route_reference_id', routeReferenceId)
    .order('iteration_number', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToIteration);
}

export function resetExperienceEngineMemoryStore(): void {
  memoryReferences.clear();
  memoryIterations.clear();
}

export function seedEnterDesktopReference(projectId: string): Site00RouteReferenceRecord {
  const record: Site00RouteReferenceRecord = {
    id: randomUUID(),
    projectId,
    projectKey: SITE00_HOST_PROJECT_KEY,
    routeId: '/enter',
    viewportClass: 'DESKTOP',
    referenceStoragePath: 'live-preview/site00/89319E70-D080-4798-9BCA-E53B137F2387.png',
    authorityLevel: 'DESIGN_AUTHORITY',
    referenceKind: 'ENVIRONMENT_ASSET',
    status: 'ACTIVE',
      metadata: { environmentId: 'ENTER_00_WAITING_ROOM', focal: 'center 75%', blockedRegionIds: ['status-strip'] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryReferences.set(record.id, record);
  return record;
}

export function seedEnterMobileBlockedReference(projectId: string): Site00RouteReferenceRecord {
  const record: Site00RouteReferenceRecord = {
    id: randomUUID(),
    projectId,
    projectKey: SITE00_HOST_PROJECT_KEY,
    routeId: '/enter',
    viewportClass: 'MOBILE',
    referenceStoragePath: '',
    authorityLevel: 'UNAPPROVED',
    referenceKind: 'FULL_VIEWPORT',
    status: 'BLOCKED_PENDING_REFERENCE_AUTHORITY',
    metadata: { reason: 'NO_FOUNDER_APPROVED_MOBILE_REFERENCE' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryReferences.set(record.id, record);
  return record;
}
