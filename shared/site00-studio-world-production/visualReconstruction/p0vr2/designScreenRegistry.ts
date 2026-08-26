import type { Site00FounderProjectSlug } from '../../../site00-projects/types.js';
import type { DesignScreenDefinition } from './types.js';

const GENERIC_SCREENS: DesignScreenDefinition[] = [];

const PROJECT_SCREENS: Partial<Record<Site00FounderProjectSlug, DesignScreenDefinition[]>> = {};

export function registerProjectDesignScreens(
  projectId: Site00FounderProjectSlug,
  screens: DesignScreenDefinition[],
): void {
  PROJECT_SCREENS[projectId] = screens;
}

export function listDesignScreensForProject(projectId: string): DesignScreenDefinition[] {
  const projectScreens = PROJECT_SCREENS[projectId as Site00FounderProjectSlug] ?? [];
  return [...GENERIC_SCREENS, ...projectScreens];
}

export function resolveDesignScreenRoute(screen: DesignScreenDefinition, projectSlug: string): string {
  return screen.routePattern.replace(':projectSlug', projectSlug);
}

export function findDesignScreen(projectId: string, screenId: string): DesignScreenDefinition | null {
  return listDesignScreensForProject(projectId).find((s) => s.screenId === screenId) ?? null;
}

export function resolveDesignScreenByRoute(projectId: string, route: string): DesignScreenDefinition | null {
  const screens = listDesignScreensForProject(projectId);
  return (
    screens.find((s) => {
      const pattern = s.routePattern.replace(':projectSlug', projectId);
      return route === pattern || route.startsWith(pattern.replace(/\/$/, ''));
    }) ?? null
  );
}
