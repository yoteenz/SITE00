/**
 * P0.EXPERIENCE.MODULE-WIRING1 — route parsing + workspace path helpers.
 */

import { EXPERIENCE_WORKSPACE_TABS, type ExperienceWorkspaceTab } from './types.js';
import { getFixtureExperienceBySlug, listAllFixtureExperienceSlugs } from './fixtures.js';

/** Client runtime prefix (Astral World play mode). */
export const ASTRAL_WORLD_CLIENT_PLAY_PREFIX = 'play';

const WORKSPACE_TAB_SET = new Set<string>(EXPERIENCE_WORKSPACE_TABS);

export function isExperienceWorkspaceTab(segment: string): segment is ExperienceWorkspaceTab {
  return WORKSPACE_TAB_SET.has(segment.toLowerCase());
}

export function experienceModuleBasePath(projectSlug: string): string {
  return `/projects/${projectSlug.toLowerCase()}/experience`;
}

export function experienceWorkspacePath(
  projectSlug: string,
  experienceSlug: string,
  tab: ExperienceWorkspaceTab = 'overview',
): string {
  const base = `${experienceModuleBasePath(projectSlug)}/${experienceSlug.toLowerCase()}`;
  return tab === 'overview' ? base : `${base}/${tab}`;
}

export function experienceProjectsModuleLandingPath(): string {
  return '/projects';
}

export type ParsedExperienceSplat = {
  segments: string[];
  first: string | null;
  second: string | null;
  rest: string[];
};

export function parseExperienceSplat(splat: string | undefined): ParsedExperienceSplat {
  const trimmed = (splat ?? '').replace(/^\/+|\/+$/g, '');
  if (!trimmed) {
    return { segments: [], first: null, second: null, rest: [] };
  }
  const segments = trimmed.split('/').filter(Boolean);
  return {
    segments,
    first: segments[0] ?? null,
    second: segments[1] ?? null,
    rest: segments.slice(2),
  };
}

/**
 * True when splat should render the production Experience workspace (not Astral client runtime).
 */
export function shouldRenderExperienceWorkspace(
  projectSlug: string,
  splat: string | undefined,
): boolean {
  const { first, second, segments } = parseExperienceSplat(splat);
  if (!first) return true;

  const registeredSlugs = listAllFixtureExperienceSlugs();
  const projectExperiences = registeredSlugs.filter((slug) =>
    Boolean(getFixtureExperienceBySlug(projectSlug, slug)),
  );

  if (projectSlug === 'astral-world' && first === ASTRAL_WORLD_CLIENT_PLAY_PREFIX) {
    return false;
  }

  if (projectExperiences.includes(first)) {
    if (!second) return true;
    if (isExperienceWorkspaceTab(second)) return true;
    return true;
  }

  if (segments.length === 0) return true;
  return false;
}

export function resolveWorkspaceTabFromSplat(splat: string | undefined): ExperienceWorkspaceTab {
  const { first, second } = parseExperienceSplat(splat);
  if (!first) return 'overview';
  if (second && isExperienceWorkspaceTab(second)) return second;
  if (second && !isExperienceWorkspaceTab(second)) return 'overview';
  return 'overview';
}

export function resolveExperienceSlugFromSplat(
  projectSlug: string,
  splat: string | undefined,
  fallbackSlug: string | null,
): string | null {
  const { first } = parseExperienceSplat(splat);
  if (first && getFixtureExperienceBySlug(projectSlug, first)) return first.toLowerCase();
  return fallbackSlug;
}
