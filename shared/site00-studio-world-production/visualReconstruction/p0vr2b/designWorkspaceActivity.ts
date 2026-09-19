/**
 * P0.VR.2B — Recent activity feed for Design workspace.
 */

import type { DesignWorkspaceActivityEntry } from './types.js';

export function buildDesignWorkspaceActivity(input: {
  projectId: string;
  screenId: string;
  screenName: string;
  statusLabel: string;
  lastRunId?: string | null;
  assetEvents?: string[];
}): DesignWorkspaceActivityEntry[] {
  const now = Date.now();
  const entries: DesignWorkspaceActivityEntry[] = [
    {
      id: 'act-reference',
      label: 'Reference uploaded',
      timestamp: new Date(now - 3600_000 * 4).toISOString(),
      actor: 'Founder',
      status: 'ACTIVE',
    },
    {
      id: 'act-screen',
      label: `${input.screenName} matched`,
      timestamp: new Date(now - 3600_000 * 2).toISOString(),
      actor: 'System',
      status: input.statusLabel === 'MATCHED' ? 'MATCHED' : 'READY',
    },
  ];

  if (input.lastRunId) {
    entries.unshift({
      id: 'act-run',
      label: `Reconstruction run ${input.lastRunId.slice(-8)}`,
      timestamp: new Date(now - 1800_000).toISOString(),
      actor: 'Composer',
      status: 'READY',
    });
  }

  for (const [i, evt] of (input.assetEvents ?? []).entries()) {
    entries.unshift({
      id: `act-asset-${i}`,
      label: evt,
      timestamp: new Date(now - 600_000 * (i + 1)).toISOString(),
      actor: 'FAL',
      status: 'READY',
    });
  }

  return entries.slice(0, 6);
}
