/** Reusable immersive loader configuration for Site 00 production experiences. */

import {
  site00LoaderBackgroundUrl,
  resolveSite00LoaderEnvironmentAnimationUrl,
} from './site00LoaderMedia';

/** Resolve public live-preview asset at runtime (non-loader production assets). */
export function resolveSite00PublicAsset(path: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${base}/storage/v1/object/public/live-preview/site00/${path}`;
}

export type Site00LoaderState =
  | 'BOOTSTRAP'
  | 'PREPARING'
  | 'CONNECTING'
  | 'RESOLVING'
  | 'ASSEMBLING'
  | 'READY'
  | 'EXITING';

export type Site00LoaderStage = {
  id: string;
  state: Site00LoaderState;
  label: string;
  /** Target progress 0–100 when this stage completes (monotonic). */
  progress: number;
};

export type Site00ImmersiveLoaderConfig = {
  id: string;
  siteLabel: string;
  experienceTitle: string;
  experienceSubtitle: string;
  assemblingLabel: string;
  tagline: string;
  footerMark: string;
  footerLabel: string;
  completionMessage: string;
  backgroundUrl: string;
  environmentAnimationUrl: string;
  desktopEnvironmentAnimationUrl: string;
  stages: Site00LoaderStage[];
};

/** Shared SITE 00 world loader — Origin, Enter, IDNTY, BLDR, and route suspense. */
export const SITE00_WORLD_IMMERSIVE_LOADER_CONFIG: Site00ImmersiveLoaderConfig = {
  id: 'site00',
  siteLabel: 'SITE 00',
  experienceTitle: 'ASSEMBLING SITE 00',
  experienceSubtitle: 'PREPARING YOUR DESTINATION',
  assemblingLabel: 'ASSEMBLING...',
  tagline: 'EVERYTHING STARTS AT 00.',
  footerMark: '00',
  footerLabel: 'SITE 00',
  completionMessage: 'SITE 00 READY',
  backgroundUrl: site00LoaderBackgroundUrl(),
  environmentAnimationUrl: resolveSite00LoaderEnvironmentAnimationUrl('mobile'),
  desktopEnvironmentAnimationUrl: resolveSite00LoaderEnvironmentAnimationUrl('desktop'),
  stages: [
    { id: 'bootstrap', state: 'BOOTSTRAP', label: 'INITIALIZING SITE 00', progress: 10 },
    { id: 'preparing', state: 'PREPARING', label: 'ASSEMBLING SITE 00', progress: 35 },
    { id: 'connect', state: 'CONNECTING', label: 'PREPARING YOUR DESTINATION', progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', label: 'ASSEMBLING ENVIRONMENT', progress: 82 },
    { id: 'ready', state: 'READY', label: 'SITE 00 READY', progress: 100 },
  ],
};

/** Production Asset Vault loader — boot-critical assets on same-origin /public. */
export const ASSTS_IMMERSIVE_LOADER_CONFIG: Site00ImmersiveLoaderConfig = {
  id: 'assts',
  siteLabel: 'SITE 00',
  experienceTitle: 'PREPARING THE ASSET VAULT',
  experienceSubtitle: 'RESOLVING PRODUCTION ASSETS',
  assemblingLabel: 'ASSEMBLING...',
  tagline: 'EVERYTHING WE BUILD LIVES HERE.',
  footerMark: '00',
  footerLabel: 'SITE 00',
  completionMessage: 'ASSET VAULT READY',
  backgroundUrl: site00LoaderBackgroundUrl(),
  environmentAnimationUrl: resolveSite00LoaderEnvironmentAnimationUrl('mobile'),
  desktopEnvironmentAnimationUrl: resolveSite00LoaderEnvironmentAnimationUrl('desktop'),
  stages: [
    { id: 'bootstrap', state: 'BOOTSTRAP', label: 'INITIALIZING SITE 00', progress: 8 },
    { id: 'preparing', state: 'PREPARING', label: 'PREPARING THE ASSET VAULT', progress: 22 },
    { id: 'connect', state: 'CONNECTING', label: 'CONNECTING TO ASSET VAULT', progress: 38 },
    { id: 'resolve', state: 'RESOLVING', label: 'RESOLVING PRODUCTION ASSETS', progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', label: 'ASSEMBLING INTERFACE', progress: 82 },
    { id: 'ready', state: 'READY', label: 'ASSET VAULT READY', progress: 100 },
  ],
};

const CONFIG_BY_ID: Record<string, Site00ImmersiveLoaderConfig> = {
  site00: SITE00_WORLD_IMMERSIVE_LOADER_CONFIG,
  assts: ASSTS_IMMERSIVE_LOADER_CONFIG,
};

export function resolveSite00ImmersiveLoaderConfig(pathname: string): Site00ImmersiveLoaderConfig {
  if (pathname.startsWith('/assts')) return ASSTS_IMMERSIVE_LOADER_CONFIG;
  return SITE00_WORLD_IMMERSIVE_LOADER_CONFIG;
}

export function getSite00ImmersiveLoaderConfig(id: string): Site00ImmersiveLoaderConfig | null {
  return CONFIG_BY_ID[id] ?? null;
}
