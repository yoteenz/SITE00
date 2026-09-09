/**
 * P0.VR.6R1 — DOM text collision and overflow QA (browser-safe types + node helpers).
 */

import type { ReferenceDeltaSeverity, TextCollisionFinding } from './types.js';

export type DomRectLike = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type DomTextNodeLike = {
  selector: string;
  rect: DomRectLike;
  scrollWidth: number;
  clientWidth: number;
  text: string;
};

function rectsCollide(a: DomRectLike, b: DomRectLike, padding = 0): boolean {
  return !(
    a.right + padding < b.left ||
    a.left - padding > b.right ||
    a.bottom + padding < b.top ||
    a.top - padding > b.bottom
  );
}

export function detectTextCollisions(nodes: DomTextNodeLike[]): TextCollisionFinding[] {
  const findings: TextCollisionFinding[] = [];

  for (const node of nodes) {
    if (node.scrollWidth > node.clientWidth + 1) {
      findings.push({
        selector: node.selector,
        issue: 'TEXT_OVERFLOW',
        severity: node.scrollWidth - node.clientWidth > 12 ? 'HIGH' : 'MEDIUM',
        description: `TEXT OVERFLOW ${node.scrollWidth - node.clientWidth}PX IN ${node.selector}`,
      });
    }
    if (node.rect.width <= 0 || node.rect.height <= 0) {
      findings.push({
        selector: node.selector,
        issue: 'CLIPPED_LABEL',
        severity: 'HIGH',
        description: `CLIPPED LABEL ${node.selector}`,
      });
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.selector.startsWith(b.selector) || b.selector.startsWith(a.selector)) continue;
      if (rectsCollide(a.rect, b.rect, 1)) {
        findings.push({
          selector: `${a.selector} × ${b.selector}`,
          issue: 'BOUNDING_COLLISION',
          severity: 'HIGH',
          description: `TEXT COLLISION BETWEEN ${a.selector} AND ${b.selector}`,
        });
      }
    }
  }

  return findings;
}

export function detectHorizontalOverflow(containerWidth: number, childRight: number): TextCollisionFinding | null {
  if (childRight <= containerWidth + 1) return null;
  return {
    selector: 'container',
    issue: 'HORIZONTAL_OVERFLOW',
    severity: childRight - containerWidth > 16 ? 'HIGH' : 'MEDIUM',
    description: `HORIZONTAL OVERFLOW ${Math.round(childRight - containerWidth)}PX`,
  };
}

export function textCollisionPasses(findings: TextCollisionFinding[]): boolean {
  return !findings.some((f) => f.severity === 'HIGH');
}

export function maxSeverity(findings: TextCollisionFinding[]): ReferenceDeltaSeverity | null {
  if (!findings.length) return null;
  if (findings.some((f) => f.severity === 'HIGH')) return 'HIGH';
  if (findings.some((f) => f.severity === 'MEDIUM')) return 'MEDIUM';
  return 'LOW';
}
