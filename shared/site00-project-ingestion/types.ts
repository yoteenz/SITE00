/**
 * SITE 00 PROJECT INGESTION — project ontology for ingested product projects
 * (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * SITE 00 = HOST. An ingested project = PROJECT. The host owns the workspace shell, project selection, viewport
 * machinery, review controls and routing. The project owns brand, typography, colour, imagery, components,
 * screens, interaction language and copy. These records are how the host learns about a project without ever
 * borrowing its visual language.
 *
 * Project-agnostic: JURNL is the first proof case, not a special case.
 */

/** Who the project belongs to. */
export type ProjectOwnership = 'SITE00' | 'FOUNDER' | 'CLIENT';

/**
 * Relationship to the founder's practice.
 * PERSONAL = founder-owned product built through SITE 00 (not a client engagement, not host infrastructure).
 */
export type ProjectRelationship = 'PLATFORM' | 'PERSONAL' | 'CLIENT' | 'MANAGED_BRAND' | 'INFRASTRUCTURE';

export type ProjectLifecycleStatus = 'ACTIVE_PRODUCTION' | 'PAUSED' | 'LAUNCHED' | 'ARCHIVED';

export type ProjectPlatform = 'MOBILE_APP' | 'WEB_APP' | 'WEBSITE' | 'EXPERIENCE';

export type ProjectViewportPresetId = 'MOBILE' | 'MOBILE XL' | 'TABLET' | 'DESKTOP';

export type ProjectViewportSize = { w: number; h: number };

export type ProjectSafeInsets = { top: number; right: number; bottom: number; left: number };

export type ProjectLayoutGrid = { columns: number; margin: number; gutter: number };

/** The project's own device targets. The host's viewport machinery renders them; it never invents them. */
export type ProjectViewportProfile = {
  authority: { preset: ProjectViewportPresetId } & ProjectViewportSize;
  /** Logical sizes per preset (override host defaults where the project's authority differs). */
  presets: Partial<Record<ProjectViewportPresetId, ProjectViewportSize>>;
  defaultPreset: ProjectViewportPresetId;
  /** Device safe-area insets (CSS px) per device kind. */
  safeInsets: Record<'phone' | 'tablet' | 'desktop', ProjectSafeInsets>;
  /** Layout grid per device kind (drives the GRID overlay). */
  grid: Record<'phone' | 'tablet' | 'desktop', ProjectLayoutGrid>;
};

export type ProjectPaletteToken = { id: string; label: string; hex: string; role: string };

export type ProjectTypographyRole = {
  id: 'DISPLAY' | 'FUNCTIONAL' | string;
  description: string;
  family: string;
  /** Font files are project-scoped (never the host's font registry). */
  files: string[];
  license: string;
};

/** Brand data the host may INSPECT. Rendering it as the project is the runtime's job, not the host's. */
export type ProjectBrandProfile = {
  logo: { authorityFile: string; runtimeFile: string; rule: string };
  /** Square cover the HOST shows in project selectors (derived from the project's own canonical mark). */
  coverFile: string | null;
  /** Master visual authority (reference only — host inspection, never runtime UI). */
  masterAuthorityFile: string | null;
  palette: ProjectPaletteToken[];
  typography: ProjectTypographyRole[];
  rules: { id: string; rule: string; hard: boolean }[];
  visualLanguage: string[];
  voice: string;
  tagline: string;
};

export type ProjectFamilyRef = {
  familyId: string;
  familyName: string;
  status: 'NOT_STARTED' | 'AUTHORITY' | 'IMPLEMENTATION_PROOF' | 'IMPLEMENTED' | 'FOUNDER_APPROVED';
  /** Runtime route segment for the family's entry screen. */
  entryRoute: string | null;
};

export type ProjectRuntimeProfile = {
  /** Host route that mounts the project runtime full-bleed: `/production/:slug/runtime/*`. */
  kind: 'PROJECT_RUNTIME';
  defaultRoute: string;
  /** Auth adapter the runtime uses when mounted by the host workspace. */
  authAdapter: 'DESIGN_PREVIEW' | 'UNCONFIGURED' | 'PROVIDER';
  authNote: string;
  /** Host-side QA scenarios (runtime query switches / simulated external events like an email link). */
  scenarios: { id: string; label: string; route?: string; query: Record<string, string> }[];
  /** Preview credentials the HOST may show next to the device (never rendered inside the project body). */
  previewNote?: string;
};

export type IngestedProjectRecord = {
  projectId: string;
  slug: string;
  displayName: string;
  projectType: 'PERSONAL' | 'CLIENT' | 'INTERNAL';
  ownership: ProjectOwnership;
  relationship: ProjectRelationship;
  productClass: string;
  status: ProjectLifecycleStatus;
  currentFamily: string;
  currentProductionStage: string;
  tagline: string;
  voice: string;
  primaryPlatform: ProjectPlatform;
  viewport: ProjectViewportProfile;
  brand: ProjectBrandProfile;
  families: ProjectFamilyRef[];
  runtime: ProjectRuntimeProfile;
  /** Where the project's authority package lives in the repo. */
  authorityRoot: string;
};
