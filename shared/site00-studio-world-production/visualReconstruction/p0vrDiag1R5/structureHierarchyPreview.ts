/**
 * P0.VR.DIAG.1R5 — Founder-facing anchor hierarchy (not raw DOM).
 */

import type { RegionInternalStructure } from './types.js';

export function buildStructureHierarchyPreview(structure: RegionInternalStructure): string[] {
  const lines: string[] = [];
  const root = structure.container?.label ?? structure.regionType.replace(/_/g, ' ');
  lines.push(root.toUpperCase());

  const navGroup = structure.groups.find((g) => g.groupType === 'NAV_ITEMS');
  const cellGroup = structure.groups.find((g) => g.groupType === 'METRIC_CELLS');
  const cardGroup = structure.groups.find((g) => g.groupType === 'CARDS');

  if (navGroup) {
    lines.push(`├ ITEM ×${navGroup.count}`);
    if (structure.childAnchors.some((a) => a.anchorType === 'ACTIVE_ITEM')) lines.push('├ ACTIVE ITEM');
    if (structure.childAnchors.some((a) => a.anchorType === 'ACTIVE_INDICATOR')) lines.push('└ ACTIVE INDICATOR');
    return lines;
  }

  if (cellGroup) {
    lines.push(`├ CELL ×${cellGroup.count}`);
    const divCount = structure.childAnchors.filter((a) => a.anchorType === 'DIVIDER').length;
    if (divCount) lines.push(`├ DIVIDER ×${divCount}`);
    const values = structure.childAnchors.filter((a) => a.anchorType === 'VALUE').length;
    const labels = structure.childAnchors.filter((a) => a.anchorType === 'LABEL').length;
    if (values) lines.push(`├ VALUE ×${values}`);
    if (labels) lines.push(`└ LABEL ×${labels}`);
    if (!values && !labels) lines.push('└ CELL GEOMETRY');
    return lines;
  }

  if (structure.regionType === 'STATUS') {
    if (structure.childAnchors.some((a) => a.anchorType === 'TRACK')) lines.push('├ TRACK');
    if (structure.childAnchors.some((a) => a.anchorType === 'FILL')) lines.push('├ FILL');
    if (structure.childAnchors.some((a) => a.anchorType === 'DIVIDER')) lines.push('├ DIVIDER');
    if (structure.childAnchors.some((a) => a.anchorType === 'LABEL')) lines.push('└ PHASE BLOCK');
    return lines;
  }

  if (cardGroup) {
    lines.push(`├ CARD ×${cardGroup.count}`);
    lines.push('└ RAIL');
    return lines;
  }

  if (structure.subtype === 'MILESTONE') {
    for (const t of ['ICON', 'LABEL', 'TITLE', 'DATE', 'CTA'] as const) {
      if (structure.childAnchors.some((a) => a.anchorType === t || a.label.includes(t))) {
        lines.push(`├ ${t}`);
      }
    }
    return lines;
  }

  const childTypes = structure.childAnchors.filter((a) => a.anchorType !== 'CONTAINER').slice(0, 6);
  childTypes.forEach((a, i) => {
    const prefix = i === childTypes.length - 1 ? '└' : '├';
    lines.push(`${prefix} ${a.anchorType}${a.label ? ` (${a.label})` : ''}`);
  });
  return lines;
}
