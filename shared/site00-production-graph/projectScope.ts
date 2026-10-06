/**
 * Project scope of the workspace URL.
 *
 * ACTIVE_PROJECT and ACTIVE_WORKSPACE_TAB are separate dimensions. Every root tab carries the project in its URL:
 *
 *   HUB        /production?project=<p>              (/production/<p> redirects here)
 *   INBOX      /production/queue?project=<p>
 *   LIBRARY    /production/libraries?project=<p>
 *   ACTIVITY   /production/activity?project=<p>
 *   DESIGN     /production/<p>/design
 *   EXPERIENCE /production/<p>/experience
 *   EXPRESSION /production/<p>/expression
 *
 * Resolution: path slug → `?project=` → the last project the founder chose (persisted by the host) → NONE.
 * There is no default project: NONE renders a project picker, never another project's data.
 *
 * A project switch keeps the tab and drops every project-dependent child state (item, notice, milestone, node,
 * scene, entry, inspect, screen, state …) — it never searches for "the nearest populated tab".
 */
import type { WorkspaceDomain } from './types.js';

const GLOBAL_SEGMENTS = new Set(['queue', 'libraries', 'activity']);

export function workspaceTabOf(pathname: string): WorkspaceDomain | null {
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] !== 'production') return null;
  if (seg.length === 1) return 'HUB';
  if (seg[1] === 'queue') return 'INBOX';
  if (seg[1] === 'libraries') return 'LIBRARY';
  if (seg[1] === 'activity') return 'ACTIVITY';
  if (seg.length === 2) return 'HUB';
  if (seg[2] === 'design' || seg[2] === 'runtime') return 'DESIGN';
  if (seg[2] === 'experience') return 'EXPERIENCE';
  if (seg[2] === 'expression') return 'EXPRESSION';
  return null;
}

/** The project a URL names (path slug or `?project=`), or null when the URL names none. */
export function projectFromUrl(pathname: string, search: string): string | null {
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] === 'production' && seg[1] && !GLOBAL_SEGMENTS.has(seg[1])) return seg[1].toLowerCase();
  const q = new URLSearchParams(search).get('project');
  return q ? q.toLowerCase() : null;
}

export function resolveActiveProject(args: { pathname: string; search: string; stored: string | null }): string | null {
  return projectFromUrl(args.pathname, args.search) ?? (args.stored ? args.stored.toLowerCase() : null);
}

/** Lens views that are not project-dependent and survive a project switch. */
const KEEP_VIEW: Partial<Record<WorkspaceDomain, readonly string[]>> = {
  INBOX: ['needs-you', 'watching', 'resolved', 'all'],
  ACTIVITY: ['all', 'approvals', 'updates', 'blockers', 'decisions'],
  /** DESIGN modes are view preferences (`?mode=`); a project without that mode renders its DESIGN overview. */
  DESIGN: ['overview', 'brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'],
};

export function scopedTabHref(tab: WorkspaceDomain, projectId: string, view?: string | null): string {
  const p = encodeURIComponent(projectId.toLowerCase());
  const v = view ? `&view=${encodeURIComponent(view)}` : '';
  const mode = view ? `?mode=${encodeURIComponent(view)}` : '';
  switch (tab) {
    case 'HUB':
      return `/production?project=${p}`;
    case 'INBOX':
      return `/production/queue?project=${p}${v}`;
    case 'LIBRARY':
      return `/production/libraries?project=${p}`;
    case 'ACTIVITY':
      return `/production/activity?project=${p}${v}`;
    case 'DESIGN':
      return `/production/${p}/design${mode}`;
    case 'EXPERIENCE':
      return `/production/${p}/experience`;
    case 'EXPRESSION':
      return `/production/${p}/expression`;
  }
}

/** Same tab, new project, child state dropped. */
export function projectSwitchTarget(pathname: string, search: string, toProject: string): string {
  const tab = workspaceTabOf(pathname) ?? 'HUB';
  const params = new URLSearchParams(search);
  const view = tab === 'DESIGN' ? params.get('mode') : params.get('view');
  const keep = view && KEEP_VIEW[tab]?.includes(view) ? view : null;
  return scopedTabHref(tab, toProject, keep);
}
