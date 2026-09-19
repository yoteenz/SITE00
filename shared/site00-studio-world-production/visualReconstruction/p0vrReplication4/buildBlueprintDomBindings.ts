import type { ForensicBlueprintObject } from './types.js';
import type { BlueprintDomBinding } from './types.js';

const COMPONENT = 'ForensicBlueprintNdxOverviewTwin';

function selectorFor(objectId: string): string {
  return `[data-forensic-object-id="${objectId}"]`;
}

function strategyFor(obj: ForensicBlueprintObject): BlueprintDomBinding['renderStrategy'] {
  if (obj.objectType === 'image') return 'IMG';
  if (obj.objectType === 'icon' || obj.objectType === 'graphic') return 'SVG';
  if (obj.objectType === 'line' || obj.objectType === 'bar' || obj.objectType === 'divider') return 'CSS_SHAPE';
  if (obj.objectType === 'nav-item' && obj.parentSection === 'bottom-host-nav') return 'HOST_COMPONENT';
  return 'DOM_TEXT';
}

export function buildBlueprintDomBindings(objects: ForensicBlueprintObject[]): BlueprintDomBinding[] {
  return objects.map((obj) => {
    const excluded = obj.parentSection === 'device-chrome';
    return {
      objectId: obj.objectId,
      domSelector: selectorFor(obj.objectId),
      component: COMPONENT,
      sourceFile: 'src/site00/components/reconstruction/ForensicBlueprintNdxOverviewTwin.tsx',
      renderStrategy: strategyFor(obj),
      dynamicBinding: obj.objectType === 'text' && obj.label.includes('Metric'),
      status: excluded ? 'UNRESOLVED' : 'BOUND',
    };
  });
}
