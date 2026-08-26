/**
 * P0.VR.2B — Contextual quick actions for selected project/screen.
 */

import type { DesignWorkspaceQuickAction } from './types.js';

export function buildDesignWorkspaceQuickActions(input: {
  projectId: string;
  screenId: string;
  route: string;
}): DesignWorkspaceQuickAction[] {
  const base = `/projects/${input.projectId}`;
  return [
    {
      id: 'ingest',
      title: 'INGEST FOUNDER CREATIVE',
      subtitle: 'Upload references & notes',
      href: `${base}/founder-creative-ingestion`,
    },
    {
      id: 'film',
      title: 'FILM PRODUCTION',
      subtitle: 'Production pipeline',
      href: `${base}/film-production`,
    },
    {
      id: 'lock',
      title: 'LOCK ROUND 01',
      subtitle: 'Slide 01 canon lock',
      href: `${base}/content-operations/campaign-board`,
    },
    {
      id: 'generate',
      title: 'GENERATE SLIDE 01',
      subtitle: 'Campaign asset dispatch',
      href: input.route,
    },
  ];
}
