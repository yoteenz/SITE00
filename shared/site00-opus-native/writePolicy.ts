/**
 * P0.VR.OPUS-NATIVE2 — Phase 5, 6, 7, 9: capability-based write authority.
 *
 * NATIVE1 shipped a binary boundary: a surface was either read-only or it had
 * a hardcoded list of writable files. That was safe and useless. It could not
 * express "you may darken one border on the canonical page", which is the most
 * common thing the founder actually wants, and it could not express page
 * creation at all.
 *
 * The replacement is an ordered capability ladder. A surface declares the mode
 * that applies with no founder involvement (`standingMode`) and the highest
 * mode a founder is allowed to grant for a single run (`maxGrantableMode`). An
 * intent declares the mode it *requires*. Where required exceeds standing, the
 * run stops and asks — it does not quietly proceed at a lower capability and
 * produce half a change, and it does not escalate itself.
 *
 * Two properties are deliberately not negotiable by the model:
 *
 *   - a grant is scoped to one run. There is no persistent escalation, so a
 *     style grant today cannot become standing write access tomorrow;
 *   - approved asset identity is never in scope by default at any mode,
 *     including the create modes. Grok owns generated raster identity and Opus
 *     owning structure does not imply Opus owning the image.
 *
 * This module is shared because the panel has to render the same ladder the
 * server enforces. It contains no node or browser globals.
 */

/** Ordered least to most capable. Index is the comparison. */
export const DESIGN_WRITE_MODES = [
  'READ_ONLY',
  'STYLE_ONLY',
  'COMPONENT_ONLY',
  'PAGE_EDIT',
  'PAGE_CREATE',
  'DERIVATIVE_CREATE',
] as const;
export type DesignWriteMode = (typeof DESIGN_WRITE_MODES)[number];

export function writeModeRank(mode: DesignWriteMode): number {
  return DESIGN_WRITE_MODES.indexOf(mode);
}

export function writeModeAtLeast(mode: DesignWriteMode, floor: DesignWriteMode): boolean {
  return writeModeRank(mode) >= writeModeRank(floor);
}

/**
 * Phase 5 — the founder's intent is declared, never inferred. Whether a
 * request means "adjust the approved page" or "spin a derivative off it" is a
 * product decision with completely different blast radii, and a model guessing
 * between them is the failure this enumeration exists to prevent.
 */
export const DESIGN_AGENT_INTENTS = [
  'INSPECT_ONLY',
  'FIX_VISUAL',
  'REFINE_CURRENT',
  'FIX_INTERACTION',
  'CREATE_PAGE',
  'CREATE_CHILD',
  'CREATE_GRANDCHILD',
] as const;
export type DesignAgentIntent = (typeof DESIGN_AGENT_INTENTS)[number];

export interface DesignAgentIntentSpec {
  intent: DesignAgentIntent;
  label: string;
  description: string;
  /** The least capability that can complete this intent honestly. */
  requiredMode: DesignWriteMode;
  /** Creation intents need a PageCreationContract; edit intents must not have one. */
  requiresCreationContract: boolean;
}

export const DESIGN_AGENT_INTENT_SPECS: Record<DesignAgentIntent, DesignAgentIntentSpec> = {
  INSPECT_ONLY: {
    intent: 'INSPECT_ONLY',
    label: 'Inspect only',
    description: 'Read, measure and render the surface. Produces findings and no patch.',
    requiredMode: 'READ_ONLY',
    requiresCreationContract: false,
  },
  FIX_VISUAL: {
    intent: 'FIX_VISUAL',
    label: 'Fix visual',
    description: 'Correct appearance through the stylesheet only: colour, weight, spacing, geometry.',
    requiredMode: 'STYLE_ONLY',
    requiresCreationContract: false,
  },
  REFINE_CURRENT: {
    intent: 'REFINE_CURRENT',
    label: 'Refine current page',
    description: 'Adjust this page\'s own components and styles. No state, route or asset identity changes.',
    requiredMode: 'COMPONENT_ONLY',
    requiresCreationContract: false,
  },
  FIX_INTERACTION: {
    intent: 'FIX_INTERACTION',
    label: 'Fix interaction',
    description: 'Correct behaviour, which may reach the page state hook as well as its components.',
    requiredMode: 'PAGE_EDIT',
    requiresCreationContract: false,
  },
  CREATE_PAGE: {
    intent: 'CREATE_PAGE',
    label: 'Create page',
    description: 'Create a new page with its own route, components and styles.',
    requiredMode: 'PAGE_CREATE',
    requiresCreationContract: true,
  },
  CREATE_CHILD: {
    intent: 'CREATE_CHILD',
    label: 'Create child page',
    description: 'Create a page that inherits shell, tokens and interaction grammar from this one.',
    requiredMode: 'DERIVATIVE_CREATE',
    requiresCreationContract: true,
  },
  CREATE_GRANDCHILD: {
    intent: 'CREATE_GRANDCHILD',
    label: 'Create grandchild page',
    description: 'Create a page two levels below an approved authority, inheriting through its parent.',
    requiredMode: 'DERIVATIVE_CREATE',
    requiresCreationContract: true,
  },
};

/**
 * Phase 6 — the capability contract itself. `allowedFiles` and
 * `allowedDirectories` are the resolved effective scope for one run; the other
 * flags are separate because they are orthogonal to path. A run can be
 * permitted to write a component file and still be forbidden from changing the
 * asset reference inside it.
 */
export interface DesignSurfaceWritePolicy {
  mode: DesignWriteMode;
  allowedFiles: string[];
  allowedDirectories: string[];
  allowNewFiles: boolean;
  allowAssetReferenceChanges: boolean;
  allowStateChanges: boolean;
  allowRouteCreation: boolean;
  allowSharedComponentChanges: boolean;
}

export const READ_ONLY_POLICY: DesignSurfaceWritePolicy = {
  mode: 'READ_ONLY',
  allowedFiles: [],
  allowedDirectories: [],
  allowNewFiles: false,
  allowAssetReferenceChanges: false,
  allowStateChanges: false,
  allowRouteCreation: false,
  allowSharedComponentChanges: false,
};

/**
 * Phase 7 — what the founder is shown when an intent outruns the standing
 * policy. Every field exists so the prompt can be answered without leaving the
 * panel: which page, which capability, which paths, and why the surface is
 * protected in the first place.
 */
export interface WriteAuthorizationRequest {
  pageId: string;
  route: string;
  intent: DesignAgentIntent;
  requestedMode: DesignWriteMode;
  permittedMode: DesignWriteMode;
  maxGrantableMode: DesignWriteMode;
  /** Files the requested mode would open that the standing mode does not. */
  additionalFiles: string[];
  additionalDirectories: string[];
  reason: string;
  /** False when even a founder grant cannot reach the requested mode here. */
  grantable: boolean;
}

/** A founder's answer. Scoped to one run and never persisted as policy. */
export interface FounderWriteGrant {
  mode: DesignWriteMode;
  /** Opt-in per grant. Defaults false even at DERIVATIVE_CREATE. */
  allowAssetReferenceChanges?: boolean;
  note?: string;
}

export const ASSET_MUTATION_DEFAULT = 'BLOCKED' as const;

/** Human-readable ladder for the panel, so the UI never hardcodes the order. */
export function describeWriteMode(mode: DesignWriteMode): string {
  switch (mode) {
    case 'READ_ONLY':
      return 'Read and render only. No file is writable.';
    case 'STYLE_ONLY':
      return 'This page\'s stylesheets only.';
    case 'COMPONENT_ONLY':
      return 'This page\'s components and stylesheets.';
    case 'PAGE_EDIT':
      return 'This page\'s components, stylesheets, state hook and content module.';
    case 'PAGE_CREATE':
      return 'Everything in PAGE_EDIT, plus new files in the create directories and a new route.';
    case 'DERIVATIVE_CREATE':
      return 'Everything in PAGE_CREATE, plus read-through inheritance from the approved parent.';
    default:
      return 'Unknown write mode.';
  }
}
