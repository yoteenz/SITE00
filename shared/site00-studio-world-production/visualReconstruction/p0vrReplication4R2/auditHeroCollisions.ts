import type { HeroCollisionAudit, HeroObjectContract } from './types.js';

function overlap(a: HeroObjectContract, b: HeroObjectContract): boolean {
  if (a.objectId === 'H14' || b.objectId === 'H14' || a.objectId === 'H13' || b.objectId === 'H13') return false;
  if (a.objectId === 'H07' || b.objectId === 'H07') return false;
  const ax2 = a.authorityBounds.x + a.authorityBounds.width;
  const ay2 = a.authorityBounds.y + a.authorityBounds.height;
  const bx2 = b.authorityBounds.x + b.authorityBounds.width;
  const by2 = b.authorityBounds.y + b.authorityBounds.height;
  return a.authorityBounds.x < bx2 && ax2 > b.authorityBounds.x && a.authorityBounds.y < by2 && ay2 > b.authorityBounds.y;
}

const ALLOWED_OVERLAP: [string, string][] = [
  ['H06', 'H08'],
  ['H06', 'H12'],
  ['H09', 'H10'],
  ['H09', 'H11'],
  ['H09', 'H12'],
  ['H02', 'H03'],
  ['H04', 'H05'],
  ['H01', 'H06'],
  ['H02', 'H06'],
  ['H03', 'H06'],
  ['H04', 'H06'],
  ['H05', 'H06'],
  ['H01', 'H02'],
  ['H02', 'H04'],
  ['H03', 'H04'],
  ['H04', 'H05'],
  ['H06', 'H09'],
  ['H08', 'H09'],
  ['H08', 'H12'],
];

function allowed(a: string, b: string): boolean {
  return ALLOWED_OVERLAP.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function auditHeroCollisions(contracts: HeroObjectContract[]): HeroCollisionAudit {
  const collisions: HeroCollisionAudit['collisions'] = [];
  for (let i = 0; i < contracts.length; i += 1) {
    for (let j = i + 1; j < contracts.length; j += 1) {
      const a = contracts[i]!;
      const b = contracts[j]!;
      if (!overlap(a, b)) continue;
      if (allowed(a.objectId, b.objectId)) continue;
      if (a.renderStrategy === 'DOM_TEXT' && b.renderStrategy === 'DOM_TEXT') {
        collisions.push({
          objectA: a.objectId,
          objectB: b.objectId,
          failureCode: 'HERO_TEXT_COLLISION',
          notes: 'Text regions overlap — check fixed widths',
        });
      } else {
        collisions.push({
          objectA: a.objectId,
          objectB: b.objectId,
          failureCode: 'HERO_UNEXPECTED_OVERLAP',
          notes: 'Unexpected bounding overlap',
        });
      }
    }
  }
  return {
    pairsChecked: (contracts.length * (contracts.length - 1)) / 2,
    collisions,
    passed: collisions.length === 0,
  };
}
