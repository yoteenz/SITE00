import type { HeroZLayerMap } from './types.js';

export function buildHeroZLayerMap(): HeroZLayerMap {
  return {
    layers: [
      { layer: 0, label: 'background', objectIds: ['H14'] },
      { layer: 10, label: 'base-image-regions', objectIds: ['H06', 'H07', 'H12'] },
      { layer: 20, label: 'grid-dividers', objectIds: ['H13', 'H09'] },
      { layer: 30, label: 'copy', objectIds: ['H01', 'H02', 'H03', 'H04'] },
      { layer: 40, label: 'graphics', objectIds: ['H10', 'H11'] },
      { layer: 50, label: 'ndx-overlay', objectIds: ['H08'] },
      { layer: 60, label: 'cta-controls', objectIds: ['H05'] },
    ],
  };
}
