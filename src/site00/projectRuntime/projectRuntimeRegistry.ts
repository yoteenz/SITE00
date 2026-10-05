/**
 * Project runtime registry (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * The canonical way an ingested project's OWN product UI enters SITE 00: slug → lazily loaded runtime root,
 * mounted full-bleed at `/production/:projectSlug/runtime/*` with no host chrome around it. The Design
 * workspace's VIEWPORT renders that route in an isolated iframe at exact device sizes.
 *
 * Host code imports this registry only — never a project's runtime module directly.
 */

import type { ComponentType } from 'react';

export type ProjectRuntimeMode = 'design-preview' | 'production';

export type ProjectRuntimeProps = {
  /** Absolute base path of the runtime, e.g. `/production/jurnl/runtime`. */
  basePath: string;
  mode: ProjectRuntimeMode;
};

export type ProjectRuntimeEntry = {
  slug: string;
  load: () => Promise<{ default: ComponentType<ProjectRuntimeProps> }>;
};

const RUNTIMES: Record<string, ProjectRuntimeEntry> = {
  jurnl: { slug: 'jurnl', load: () => import('../../projects/jurnl/runtime/JurnlRuntimeRoot') },
};

export function getProjectRuntime(slug: string | null | undefined): ProjectRuntimeEntry | null {
  if (!slug) return null;
  return RUNTIMES[slug.toLowerCase()] ?? null;
}

export function hasProjectRuntime(slug: string | null | undefined): boolean {
  return !!getProjectRuntime(slug);
}

export const projectRuntimeBasePath = (slug: string) => `/production/${slug.toLowerCase()}/runtime`;

export function projectRuntimeUrl(slug: string, route: string, query?: Record<string, string | null | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v) q.set(k, v);
  const qs = q.toString();
  return `${projectRuntimeBasePath(slug)}/${route.replace(/^\/+/, '')}${qs ? `?${qs}` : ''}`;
}

/** Runtime → host messages (same-origin iframe). Host machinery listens; the project never reads host state. */
export const PROJECT_RUNTIME_MESSAGE_SOURCE = 'site00-project-runtime' as const;

export type ProjectRuntimeMessage =
  | { source: typeof PROJECT_RUNTIME_MESSAGE_SOURCE; projectId: string; type: 'route'; screenId: string | null; path: string }
  | { source: typeof PROJECT_RUNTIME_MESSAGE_SOURCE; projectId: string; type: 'handoff'; target: string; boundary: 'EXTERNAL_APP' | 'NATIVE_OS' | 'SOCIAL_AUTH' }
  | { source: typeof PROJECT_RUNTIME_MESSAGE_SOURCE; projectId: string; type: 'family-boundary'; from: string; to: string };

export function isProjectRuntimeMessage(data: unknown): data is ProjectRuntimeMessage {
  return !!data && typeof data === 'object' && (data as { source?: unknown }).source === PROJECT_RUNTIME_MESSAGE_SOURCE;
}
