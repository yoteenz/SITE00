/**
 * `/production/:projectSlug/runtime/*` — mounts a registered project runtime full-bleed.
 * No SITE 00 layout, chrome, fonts or tokens wrap the project body (host / project firewall).
 */

import { Suspense, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectRuntime, projectRuntimeBasePath } from './projectRuntimeRegistry';

export function ProjectRuntimeRoute() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const slug = projectSlug.toLowerCase();
  const entry = getProjectRuntime(slug);
  const Runtime = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);
  if (!Runtime) {
    // Host-side notice: the project has no runtime registered (plain, unbranded — never a project imitation).
    return (
      <div data-testid="project-runtime-missing" style={{ font: '12px/1.5 monospace', padding: 24, letterSpacing: '0.08em' }}>
        NO PROJECT RUNTIME REGISTERED FOR {slug.toUpperCase() || 'THIS PROJECT'}.
      </div>
    );
  }
  return (
    <Suspense fallback={<div data-testid="project-runtime-loading" style={{ position: 'fixed', inset: 0, background: 'transparent' }} />}>
      <Runtime basePath={projectRuntimeBasePath(slug)} mode="design-preview" />
    </Suspense>
  );
}

export default ProjectRuntimeRoute;
