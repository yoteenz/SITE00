/**
 * P0.PCI.3 — Hierarchical page family selector + jump to.
 */

import type { PageFamily, PageFamilyNode } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  family: PageFamily;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;
  jumpValue: string;
  onJumpChange: (value: string) => void;
};

function selectorGlyph(node: PageFamilyNode): string {
  if (node.designStatus === 'APPROVED') return '✓';
  if (node.linkageStatus === 'WIRED') return '●';
  if (node.statusLabel === 'PROPOSED') return '+';
  if (node.statusLabel.includes('NEEDS') || node.statusLabel.includes('REVIEW')) return '!';
  return '○';
}

function renderTree(nodes: PageFamilyNode[], parentId: string | null, depth: number, selectedNodeId: string, onSelect: (id: string) => void) {
  return nodes
    .filter((n) => n.parentNodeId === parentId)
    .map((node) => (
      <div key={node.nodeId} className="site00-pfw-selector__branch" style={{ paddingLeft: depth * 12 }}>
        <button
          type="button"
          className={`site00-pfw-selector__item${selectedNodeId === node.nodeId ? ' is-active' : ''}`}
          onClick={() => onSelect(node.nodeId)}
        >
          <span aria-hidden>{selectorGlyph(node)}</span>
          <span>{node.label}</span>
        </button>
        {renderTree(nodes, node.nodeId, depth + 1, selectedNodeId, onSelect)}
      </div>
    ));
}

export function PageFamilySelector({ family, selectedNodeId, onSelect, jumpValue, onJumpChange }: Props) {
  const jumpOptions = family.nodes.filter((n) => n.level > 0);

  return (
    <div className="site00-pfw-selector">
      <label className="site00-pfw-selector__jump">
        <span>JUMP TO</span>
        <select value={jumpValue} onChange={(e) => onJumpChange(e.target.value)}>
          <option value="">Select a page…</option>
          {jumpOptions.map((n) => (
            <option key={n.nodeId} value={n.nodeId}>
              {`${'  '.repeat(Math.max(0, n.level - 1))}${n.label}`}
            </option>
          ))}
        </select>
      </label>
      <details className="site00-pfw-selector__tree">
        <summary>PAGE FAMILY · {family.familyName}</summary>
        <div className="site00-pfw-selector__tree-body">{renderTree(family.nodes, null, 0, selectedNodeId, onSelect)}</div>
      </details>
    </div>
  );
}
