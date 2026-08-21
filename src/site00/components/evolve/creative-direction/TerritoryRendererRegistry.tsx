import type { ReactNode } from 'react';
import { IndexSignalTerritoryView } from './renderers/IndexSignalTerritoryView';
import { EditorialUtilityTerritoryView } from './renderers/EditorialUtilityTerritoryView';
import { KineticFieldTerritoryView } from './renderers/KineticFieldTerritoryView';

export type TerritoryRendererKey = 'index_signal' | 'editorial_utility' | 'kinetic_field';

export type TerritoryRenderOptions = {
  grayscale?: boolean;
  hideLabels?: boolean;
  structuralDiffMode?: boolean;
};

export type SpecimenCompositePlacement = {
  xPct: number;
  yPct: number;
  widthPct: number;
  rotationDeg?: number;
  anchor: string;
  zIndex: number;
};

export type SpecimenImageAsset = {
  assetId: string;
  url: string;
  classification: string;
  generationMethod: string;
  backgroundTreatment: string;
  fidelityMode: string;
  model: string;
  approvalState: string;
  compositeMap?: {
    assetId: string;
    desktop: SpecimenCompositePlacement;
    mobile: SpecimenCompositePlacement;
    overlapRelationship?: string;
    shadow?: string;
    safeArea?: string;
  };
};

export type TerritoryViewProps = {
  specimens: Array<{ id: string; specimenType: string; title: string; status: string; imageAsset?: SpecimenImageAsset }>;
  options?: TerritoryRenderOptions;
};

const REGISTRY: Record<TerritoryRendererKey, (props: TerritoryViewProps) => ReactNode> = {
  index_signal: IndexSignalTerritoryView,
  editorial_utility: EditorialUtilityTerritoryView,
  kinetic_field: KineticFieldTerritoryView,
};

export function territoryRendererKeyFromIndex(index: number): TerritoryRendererKey {
  if (index === 1) return 'index_signal';
  if (index === 2) return 'editorial_utility';
  return 'kinetic_field';
}

export function resolveTerritoryRenderer(index: number): (props: TerritoryViewProps) => ReactNode {
  return REGISTRY[territoryRendererKeyFromIndex(index)];
}

export function renderTerritoryView(index: number, props: TerritoryViewProps): ReactNode {
  return resolveTerritoryRenderer(index)(props);
}

export const TERRITORY_RENDERER_KEYS = Object.keys(REGISTRY) as TerritoryRendererKey[];
