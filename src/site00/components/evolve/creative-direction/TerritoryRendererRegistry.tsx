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

export type SpecimenImageAsset = {
  url: string;
  approvalState: string;
  model: string;
  volume?: string;
};

export type TerritoryViewProps = {
  specimens: Array<{
    id: string;
    specimenType: string;
    title: string;
    status: string;
    imageAsset?: SpecimenImageAsset | null;
  }>;
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
