/**
 * P0.VR.DESIGN-INHERITANCE1 — child surface presentation + inheritance defaults.
 */

export type ChildSurfacePresentationMode =
  | 'DRAWER'
  | 'MODAL'
  | 'SHEET'
  | 'WORKSPACE'
  | 'INSPECTOR';

export type ChildSurfaceInheritance = {
  parentSurface: 'design-production-workspace';
  presentationMode: ChildSurfacePresentationMode;
  inheritsShell: boolean;
  inheritsTypography: boolean;
  inheritsSpacing: boolean;
  inheritsControls: boolean;
  inheritsProjectContext: boolean;
  inheritsTarget: boolean;
  inheritsViewportState: boolean;
  inheritsViewMode: boolean;
};

export const DEFAULT_CHILD_SURFACE_INHERITANCE: Omit<ChildSurfaceInheritance, 'presentationMode'> = {
  parentSurface: 'design-production-workspace',
  inheritsShell: true,
  inheritsTypography: true,
  inheritsSpacing: true,
  inheritsControls: true,
  inheritsProjectContext: true,
  inheritsTarget: true,
  inheritsViewportState: true,
  inheritsViewMode: true,
};

export function childSurfaceInheritance(
  presentationMode: ChildSurfacePresentationMode,
): ChildSurfaceInheritance {
  return { ...DEFAULT_CHILD_SURFACE_INHERITANCE, presentationMode };
}

/** Sprint audit — overlay placement defaults. */
export const DESIGN_CHILD_SURFACE_PLACEMENT: Record<
  string,
  { mode: ChildSurfacePresentationMode; kind: string }
> = {
  'OV-READINESS-RECEIPT': { mode: 'DRAWER', kind: 'contextual inspection' },
  'OV-PAIR-REVIEW': { mode: 'WORKSPACE', kind: 'visual comparison' },
  'OV-PROVENANCE': { mode: 'DRAWER', kind: 'contextual metadata' },
  'OV-CREATIVE-CONTEXT': { mode: 'DRAWER', kind: 'contextual intelligence' },
  'OV-SPEND-CONFIRM': { mode: 'MODAL', kind: 'spend gate' },
  'OV-CONTRACT-VERSIONS': { mode: 'DRAWER', kind: 'contract inspection' },
  'OV-OVERFLOW-MENU': { mode: 'SHEET', kind: 'utility menu' },
  'OV-HOST-MODULE-NAV': { mode: 'SHEET', kind: 'host navigation' },
  'OV-REVIEW-AUTHORITY': { mode: 'MODAL', kind: 'authority decision' },
  references: { mode: 'WORKSPACE', kind: 'durable child workspace' },
  assets: { mode: 'WORKSPACE', kind: 'durable child workspace' },
  pages: { mode: 'WORKSPACE', kind: 'durable child workspace' },
  skins: { mode: 'WORKSPACE', kind: 'durable child workspace' },
  history: { mode: 'WORKSPACE', kind: 'durable child workspace' },
  more: { mode: 'WORKSPACE', kind: 'durable child workspace' },
};
