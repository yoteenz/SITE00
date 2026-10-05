/**
 * P0.VR.DIAG.1R5 — Match authority ↔ current child anchors by order and role.
 */

import type { RegionInternalStructure, ChildAnchorCorrespondence } from './types.js';

export function buildChildAnchorCorrespondence(
  authority: RegionInternalStructure,
  current: RegionInternalStructure,
): ChildAnchorCorrespondence[] {
  const results: ChildAnchorCorrespondence[] = [];
  const authByType = groupByType(authority.childAnchors);
  const curByType = groupByType(current.childAnchors);

  for (const type of new Set([...authByType.keys(), ...curByType.keys()])) {
    const aList = authByType.get(type) ?? [];
    const cList = curByType.get(type) ?? [];
    const len = Math.min(aList.length, cList.length);
    for (let i = 0; i < len; i++) {
      const a = aList[i]!;
      const c = cList[i]!;
      results.push({
        authorityAnchorId: a.anchorId,
        currentAnchorId: c.anchorId,
        matchConfidence: a.anchorType === c.anchorType ? 'HIGH' : 'MEDIUM',
        matchSignals: ['orderIndex', 'anchorType', 'relativePosition'],
        status: 'MATCHED',
      });
    }
  }

  return results;
}

function groupByType(anchors: RegionInternalStructure['childAnchors']): Map<string, typeof anchors> {
  const map = new Map<string, typeof anchors>();
  for (const a of anchors) {
    const list = map.get(a.anchorType) ?? [];
    list.push(a);
    map.set(a.anchorType, list);
  }
  for (const list of map.values()) {
    list.sort((x, y) => x.orderIndex - y.orderIndex);
  }
  return map;
}
