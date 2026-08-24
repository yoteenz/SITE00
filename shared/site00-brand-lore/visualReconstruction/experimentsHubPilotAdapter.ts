/**
 * Experiments Hub pilot adapter — route, inventory, frozen pilot state.
 */

export const EXPERIMENTS_HUB_PILOT_ROUTE = '/projects/ndxbook/experiments' as const;

export const EXPERIMENTS_HUB_PILOT_REFERENCE_FIXTURE =
  'tests/fixtures/visual-reconstruction/experiments-hub-mobile-reference.png' as const;

export const EXPERIMENTS_HUB_RENDER_SELECTOR = '.site00-vr-experiments-hub' as const;

export type ExperimentsHubPilotEntry = {
  id: string;
  order: number;
  letter?: string;
  title: string;
  path: string;
  statusNote?: string;
};

export type ExperimentsHubPilotPresentation = {
  recentExperiments: Array<{
    id: string;
    label: string;
    title: string;
    version: string;
    status: string;
    path: string;
  }>;
  quickActions: Array<{ id: string; label: string; path: string }>;
};

const STAGE_KEYWORDS: Record<string, string[]> = {
  UNDERSTAND: ['Lore', 'Appetite', 'Personality'],
  DISCOVER: ['Territory', 'Character', 'Formation'],
  EXPRESS: ['Expression', 'Art-board', 'Authority'],
  EMBODY: ['Language', 'Voice', 'Casting'],
  PUBLISH: ['Content Ops', 'Campaign', 'Daily Plan'],
  LEARN: ['Cultural Intel', 'Performance', 'Library'],
};

export function stageKeywordsFor(stage: string): string[] {
  return STAGE_KEYWORDS[stage] ?? [];
}

export function mapExperimentsHubPilotPresentation(
  entries: ExperimentsHubPilotEntry[],
  quickActionPaths: Record<string, string>,
): ExperimentsHubPilotPresentation {
  const recent = entries.slice(0, 5).map((e) => ({
    id: e.id,
    label: e.letter ? `EXPERIMENT ${e.letter}` : `0${e.order}`,
    title: e.title,
    version: e.statusNote?.split(' ')[0] ?? 'ACTIVE',
    status: e.statusNote ?? 'IN PROGRESS',
    path: e.path,
  }));

  return {
    recentExperiments: recent,
    quickActions: [
      { id: 'create', label: 'Create New Experiment', path: quickActionPaths.create ?? entries[0]?.path ?? '#' },
      { id: 'campaign', label: 'Open Campaign Board', path: quickActionPaths.campaign ?? '#' },
      { id: 'cultural', label: 'View Cultural Intelligence', path: quickActionPaths.cultural ?? '#' },
      { id: 'character', label: 'Character Calibration', path: quickActionPaths.character ?? '#' },
      { id: 'inspect', label: 'Inspect System', path: quickActionPaths.inspect ?? '#' },
    ],
  };
}

/** Deterministic pilot fixture — freeze dynamic timestamps for comparison. */
export function freezeExperimentsHubPilotState<T extends Record<string, unknown>>(state: T): T {
  return { ...state, pilotFrozenAt: '2026-08-24T00:00:00.000Z' };
}
