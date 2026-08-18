/** Composition Studio — extended document model (shared Studio World infrastructure). */

import type {
  CompositionFocalPoint,
  CompositionZone,
  CompositionZoneType,
  EnvironmentCompositionMap,
  NormalizedRect,
  SemanticZoneRole,
} from '../types';

export type CompositionObjectSourceType =
  | 'ui'
  | 'overlay-asset'
  | 'environment-baked'
  | 'environment-layer'
  | 'generated-object';

export type CompositionObjectClass = 'interface' | 'environment';

export type CompositionWorkflowStatus =
  | 'ORIGINAL_ANALYSIS'
  | 'DRAFT'
  | 'COMPOSITION_REVIEW'
  | 'APPROVED'
  | 'COMPOSITION_LOCKED';

export type CompositionVersionLabel =
  | 'ORIGINAL_ANALYSIS'
  | 'EDITED_DRAFT'
  | 'APPROVED_COMPOSITION'
  | 'LOCKED_COMPOSITION';

export type ResponsiveViewport = 'mobile' | 'tablet' | 'desktop';

export type CompositionTextStyle = {
  content: string;
  align: 'left' | 'center' | 'right';
  maxWidth?: number;
  scale?: number;
  letterSpacing?: number;
  lineHeight?: number;
};

export type RecompositionRequest = {
  environmentId: string;
  objectLabel: string;
  sourceBounds: NormalizedRect;
  targetBounds: NormalizedRect;
  preserve: string[];
  status: 'pending' | 'generating' | 'review' | 'approved' | 'rejected';
  createdAt: string;
};

export type CompositionStudioObject = {
  id: string;
  objectClass: CompositionObjectClass;
  sourceType: CompositionObjectSourceType;
  semanticRole: SemanticZoneRole;
  label: string;
  rect: NormalizedRect;
  visible: boolean;
  positionLocked: boolean;
  zIndex: number;
  text?: CompositionTextStyle;
  assetId?: string;
  environmentId?: string;
  layerId?: string;
  zoneId?: string;
  editableProperties: string[];
  responsiveOverrides?: Partial<Record<ResponsiveViewport, NormalizedRect>>;
  recompositionRequest?: RecompositionRequest;
};

export type ArchitecturalGuideKind =
  | 'vanishing-point'
  | 'center-axis'
  | 'horizon'
  | 'platform-bounds'
  | 'archway-bounds'
  | 'floor-plane'
  | 'negative-space'
  | 'focal-object';

export type ArchitecturalGuide = {
  id: string;
  kind: ArchitecturalGuideKind;
  x: number;
  y: number;
  label?: string;
};

export type CompositionValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type CompositionValidationFinding = {
  id: string;
  severity: CompositionValidationSeverity;
  message: string;
  objectId?: string;
  zoneId?: string;
  overridable: boolean;
};

export type CompositionValidationOverride = {
  findingId: string;
  approvedAt: string;
  note?: string;
};

export type CompositionStudioDocument = {
  id: string;
  environmentId: string;
  environmentAssetUrl?: string;
  baseMap: EnvironmentCompositionMap;
  objects: CompositionStudioObject[];
  zones: CompositionZone[];
  focalPoints: CompositionFocalPoint[];
  cropAnchor: CompositionFocalPoint;
  architecturalGuides: ArchitecturalGuide[];
  status: CompositionWorkflowStatus;
  version: string;
  versionLabel: CompositionVersionLabel;
  createdAt: string;
  updatedAt: string;
  validationOverrides: CompositionValidationOverride[];
  parentDocumentId?: string;
};

export type CompositionEditorMode = 'edit' | 'preview' | 'zones' | 'review';

export type StudioViewportPreset = ResponsiveViewport;

export function flattenZonesFromMap(map: EnvironmentCompositionMap): CompositionZone[] {
  return [
    ...map.protectedZones,
    ...map.preferredZones,
    ...map.conditionalZones,
    ...map.navigationZones,
  ];
}

export function documentToEnvironmentMap(doc: CompositionStudioDocument): EnvironmentCompositionMap {
  const protectedZones = doc.zones.filter((z) => z.type === 'protected');
  const preferredZones = doc.zones.filter((z) => z.type === 'preferred');
  const conditionalZones = doc.zones.filter((z) => z.type === 'conditional');
  const navigationZones = doc.zones.filter((z) => z.type === 'navigation');
  return {
    ...doc.baseMap,
    protectedZones,
    preferredZones,
    conditionalZones,
    navigationZones,
    focalPoints: doc.focalPoints,
    cropAnchor: doc.cropAnchor,
    analysisStatus: doc.status === 'COMPOSITION_LOCKED' || doc.status === 'APPROVED' ? 'APPROVED' : 'REVIEW',
    approvalStatus: doc.status === 'COMPOSITION_LOCKED' ? 'APPROVED' : doc.status === 'APPROVED' ? 'APPROVED' : 'REVIEW',
  };
}

export function isCompositionEditable(doc: CompositionStudioDocument): boolean {
  return doc.status !== 'COMPOSITION_LOCKED';
}

export function isImplementationReady(doc: CompositionStudioDocument): boolean {
  return doc.status === 'COMPOSITION_LOCKED';
}

export function newZoneId(): string {
  return `zone-${Date.now().toString(36)}`;
}

export function zoneTypeFromSemantic(type: CompositionZoneType): CompositionZoneType {
  return type;
}
