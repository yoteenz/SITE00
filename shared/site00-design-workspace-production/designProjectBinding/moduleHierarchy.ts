/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — PRODUCT hierarchy: PROJECTS → DESIGN → ACTIVE PROJECT.
 */

import type { DesignModuleHierarchySegment } from './types.js';

export function buildDesignModuleHierarchy(input: {
  projectsHref?: string;
  designHref?: string;
  activeProjectId: string | null;
  activeProjectLabel?: string | null;
  activePageName?: string | null;
  pagesSection?: boolean;
}): DesignModuleHierarchySegment[] {
  const projectLabel = (input.activeProjectLabel ?? input.activeProjectId ?? 'SELECT PROJECT').toUpperCase();
  const segments: DesignModuleHierarchySegment[] = [
    { id: 'projects', label: 'PROJECTS', href: input.projectsHref ?? '/projects' },
    { id: 'design', label: 'DESIGN', href: input.designHref ?? '/projects/design' },
  ];
  if (input.activeProjectId) {
    segments.push({
      id: 'active-project',
      label: projectLabel,
      href: input.designHref ?? null,
    });
  }
  if (input.pagesSection) {
    segments.push({ id: 'pages', label: 'PAGES', href: null });
  }
  if (input.activePageName) {
    segments.push({ id: 'page', label: input.activePageName.toUpperCase(), href: null });
  }
  return segments;
}

export function formatDesignModuleBreadcrumb(segments: DesignModuleHierarchySegment[]): string {
  return segments.map((s) => s.label).join(' > ');
}

/** Header crumbs for twin-opus shell (three visible slots). */
export function designHeaderCrumbLabels(segments: DesignModuleHierarchySegment[]): {
  brand: string;
  module: string;
  activeProject: string;
} {
  const projects = segments.find((s) => s.id === 'projects')?.label ?? 'PROJECTS';
  const design = segments.find((s) => s.id === 'design')?.label ?? 'DESIGN';
  const active =
    segments.find((s) => s.id === 'page')?.label ??
    segments.find((s) => s.id === 'active-project')?.label ??
    'SELECT PROJECT';
  return {
    brand: projects,
    module: design,
    activeProject: active,
  };
}
