import type { DesignScreenDefinition } from './types.js';

const GENERIC_SCREENS: DesignScreenDefinition[] = [];

const PROJECT_SCREENS: Record<string, DesignScreenDefinition[]> = {};

export function registerProjectDesignScreens(projectId: string, screens: DesignScreenDefinition[]): void {
  PROJECT_SCREENS[projectId] = screens;
}

export function listDesignScreensForProject(projectId: string, includeInspect = false): DesignScreenDefinition[] {
  const projectScreens = PROJECT_SCREENS[projectId] ?? [];
  const filtered = includeInspect
    ? projectScreens
    : projectScreens.filter((s) => s.showInDefaultSelector !== false);
  return [...GENERIC_SCREENS, ...filtered];
}

export function resolveDesignScreenRoute(screen: DesignScreenDefinition, projectSlug: string): string {
  if (screen.absoluteRoute) return screen.routePattern;
  return screen.routePattern.replace(':projectSlug', projectSlug);
}

export function findDesignScreen(projectId: string, screenId: string): DesignScreenDefinition | null {
  return (PROJECT_SCREENS[projectId] ?? []).find((s) => s.screenId === screenId) ?? null;
}

export function resolveDesignScreenByRoute(projectId: string, route: string): DesignScreenDefinition | null {
  const screens = PROJECT_SCREENS[projectId] ?? [];
  return (
    screens.find((s) => {
      const pattern = resolveDesignScreenRoute(s, projectId);
      return route === pattern || route.startsWith(pattern.replace(/\/$/, ''));
    }) ?? null
  );
}

export function clearDesignScreenRegistryForTest(): void {
  for (const key of Object.keys(PROJECT_SCREENS)) delete PROJECT_SCREENS[key];
}

export function listRegisteredDesignProjectIds(): string[] {
  return Object.keys(PROJECT_SCREENS);
}
