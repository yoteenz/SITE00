import type { ProductionSubWorkspaceId, ProductionWorkspaceType } from './types.js';

export type ProductionSubWorkspaceDef = {
  id: ProductionSubWorkspaceId;
  label: string;
  description: string;
};

export const PRODUCTION_TOP_LEVEL_WORKSPACES: readonly ProductionWorkspaceType[] = [
  'DESIGN',
  'EXPERIENCE',
  'EXPRESSION',
] as const;

export const PRODUCTION_SUB_WORKSPACE_REGISTRY: Record<
  ProductionWorkspaceType,
  readonly ProductionSubWorkspaceDef[]
> = {
  DESIGN: [
    { id: 'work', label: 'WORK', description: 'Primary design workspace surface' },
    { id: 'authorities', label: 'AUTHORITIES', description: 'Viewport / page authority' },
    { id: 'family', label: 'FAMILY', description: 'Page family system' },
    { id: 'interactions', label: 'INTERACTIONS', description: 'Interaction map' },
    { id: 'responsive', label: 'RESPONSIVE', description: 'Responsive derivation' },
    { id: 'framework', label: 'FRAMEWORK', description: 'Twin / framework controls' },
    { id: 'assets', label: 'ASSETS', description: 'Asset generation' },
    { id: 'history', label: 'HISTORY', description: 'Run history' },
  ],
  EXPERIENCE: [
    { id: 'world', label: 'WORLD', description: 'World architecture' },
    { id: 'environments', label: 'ENVIRONMENTS', description: 'Environment systems' },
    { id: 'modules', label: 'MODULES', description: 'Destinations / modules' },
    { id: 'simulations', label: 'SIMULATIONS', description: 'Simulations / configurators' },
    { id: 'zones', label: 'ZONES', description: 'Zones / navigation' },
    { id: 'assets', label: 'ASSETS', description: 'World assets' },
    { id: 'review', label: 'REVIEW', description: 'Experience review' },
  ],
  EXPRESSION: [
    { id: 'narrative', label: 'NARRATIVE', description: 'Campaign narrative' },
    { id: 'casting', label: 'CASTING', description: 'Actor catalogue / casting' },
    { id: 'character-fabrication', label: 'CHARACTER FABRICATION', description: 'Actor → Identity → Body → Look → Hair + Makeup → Character → Performance → Simulation → Authority' },
    { id: 'wardrobe', label: 'WARDROBE', description: 'Wardrobe + hair/makeup' },
    { id: 'performance', label: 'PERFORMANCE', description: 'Performance skins' },
    { id: 'sets', label: 'SETS', description: 'Sets / scene' },
    { id: 'storyboard', label: 'STORYBOARD', description: 'Storyboard / keyframes' },
    { id: 'review', label: 'REVIEW', description: 'Campaign review / handoff' },
  ],
};

export function productionTopLevelWorkspaceCount(): number {
  return PRODUCTION_TOP_LEVEL_WORKSPACES.length;
}

export function subWorkspacesFor(type: ProductionWorkspaceType): readonly ProductionSubWorkspaceDef[] {
  return PRODUCTION_SUB_WORKSPACE_REGISTRY[type];
}

export function isSubWorkspaceUnderExpression(subId: ProductionSubWorkspaceId): boolean {
  return PRODUCTION_SUB_WORKSPACE_REGISTRY.EXPRESSION.some((s) => s.id === subId);
}
