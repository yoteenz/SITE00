/** Public Evolve service page — service mode / offer architecture. */

/** Digital property evolution vs marketing/creative intelligence (future lane). */
export type EvolveServiceMode = 'DIGITAL_EVOLUTION' | 'MARKETING_CREATIVE_INTELLIGENCE';

/** Alias for offer routing — same enum, distinct naming for intake. */
export type EvolveOfferMode = EvolveServiceMode;

export const EVOLVE_SERVICE_MODES: readonly EvolveServiceMode[] = [
  'DIGITAL_EVOLUTION',
  'MARKETING_CREATIVE_INTELLIGENCE',
] as const;

export const EVOLVE_DEFAULT_SERVICE_MODE: EvolveServiceMode = 'DIGITAL_EVOLUTION';

export type EvolveServiceAreaId =
  | 'EXPERIENCE'
  | 'COMMERCE'
  | 'OPERATIONS'
  | 'INTELLIGENCE'
  | 'CONNECTIONS';

export type EvolveServiceArea = {
  id: EvolveServiceAreaId;
  num: string;
  title: string;
  capabilities: readonly string[];
  iconId: EvolveServiceIconId;
};

export type EvolveServiceIconId =
  | 'existing-property'
  | 'assessment'
  | 'evolution-path'
  | 'refine'
  | 'install'
  | 'transform'
  | 'property'
  | 'diagnose'
  | 'system-plan'
  | 'build'
  | 'launch-measure'
  | 'experience'
  | 'commerce'
  | 'operations'
  | 'intelligence'
  | 'connections';

export type EvolveServiceProcessStep = {
  num: string;
  title: string;
  body: string;
  iconId: EvolveServiceIconId;
};

export type EvolveEvolutionPathId = 'refine' | 'install' | 'transform';

export type EvolveEvolutionPath = {
  id: EvolveEvolutionPathId;
  num: string;
  title: string;
  modeLabel: string;
  descriptor: string;
  capabilities: readonly string[];
  cta: string;
  iconId: EvolveServiceIconId;
};

export type EvolveServiceHubSectionId =
  | 'overview'
  | 'paths'
  | 'process'
  | 'systems'
  | 'cases'
  | 'faq'
  | 'start';

export type EvolveStartEvolveRouteInput = {
  isSignedIn: boolean;
  hasEvolveProject: boolean;
  evolveProjectSlug: string | null;
  serviceMode: EvolveServiceMode;
  pathId?: EvolveEvolutionPathId;
  isDesktop: boolean;
};

export type EvolveStartEvolveRouteResult = {
  route: string;
  reason:
    | 'AUTH_REQUIRED'
    | 'NEW_EVOLVE_PROJECT'
    | 'OPEN_EVOLVE_HOME'
    | 'PATH_ASSESSMENT'
    | 'SITE00_DIRECTED_INTAKE';
};
