import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import type { LiteralLayoutInstruction } from './types.js';

export function buildHeroLayoutInstructions(spec: LiteralRegionSpec): LiteralLayoutInstruction[] {
  const instructions: LiteralLayoutInstruction[] = [
    {
      elementId: 'hero_grid',
      type: 'subregion',
      parentId: null,
      xRelation: 'fill',
      yRelation: 'fill',
      widthRelation: '100%',
      heightRelation: 'min 200px',
      alignment: 'stretch',
      overlap: null,
      zOrder: 0,
      padding: '0',
      gap: '0',
      surface: '#0a0a0a',
      border: null,
      overflow: 'hidden',
      crop: null,
      positioningMode: 'grid',
    },
  ];

  for (const sub of spec.subregions) {
    instructions.push({
      elementId: sub.id,
      type: 'subregion',
      parentId: 'hero_grid',
      xRelation: sub.id.includes('left') ? 'col 1' : sub.id.includes('center') ? 'col 2' : 'col 3',
      yRelation: 'row 1',
      widthRelation: sub.bounds,
      heightRelation: '100%',
      alignment: sub.id.includes('copy') ? 'flex-end' : 'stretch',
      overlap: sub.id === 'lime_ndx_region' ? 'center_image_region' : null,
      zOrder: sub.id === 'lime_ndx_region' ? 3 : 1,
      padding: sub.id.includes('copy') ? '14px 10px 14px 0' : '8px 0',
      gap: null,
      surface: sub.surface ?? null,
      border: null,
      overflow: 'hidden',
      crop: null,
      positioningMode: sub.id === 'lime_ndx_region' ? 'absolute' : 'grid',
    });
  }

  for (const tb of spec.textBlocks) {
    instructions.push({
      elementId: tb.id,
      type: 'text',
      parentId: 'left_copy_region',
      xRelation: 'start',
      yRelation: 'stack',
      widthRelation: '100%',
      heightRelation: 'auto',
      alignment: 'left',
      overlap: null,
      zOrder: 2,
      padding: null,
      gap: '8px',
      surface: null,
      border: null,
      overflow: null,
      crop: null,
      positioningMode: 'flex',
    });
  }

  for (const ctrl of spec.controls) {
    instructions.push({
      elementId: ctrl.id,
      type: 'control',
      parentId: 'left_copy_region',
      xRelation: 'start',
      yRelation: 'after headline',
      widthRelation: 'auto',
      heightRelation: 'auto',
      alignment: 'left',
      overlap: null,
      zOrder: 2,
      padding: '6px 10px',
      gap: null,
      surface: '#f5f5f2',
      border: null,
      overflow: null,
      crop: null,
      positioningMode: 'flex',
    });
  }

  return instructions;
}
