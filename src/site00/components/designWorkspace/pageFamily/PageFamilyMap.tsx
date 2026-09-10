/**
 * P0.PCI.3 — Interactive visual family map.
 */

import type { PageFamily, PageFamilyNode } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  family: PageFamily;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
};

function NodeChip({
  node,
  selected,
  onSelect,
  size = 'md',
}: {
  node: PageFamilyNode;
  selected: boolean;
  onSelect: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      type="button"
      className={`site00-pfw-map__node is-${node.statusVisual}${selected ? ' is-selected' : ''} is-${size}`}
      onClick={onSelect}
    >
      <span className="site00-pfw-map__node-dot" aria-hidden />
      <strong>{node.label}</strong>
      <em>{node.route.replace(/^\/projects\/[^/]+/, '').toUpperCase() || '/ROOT'}</em>
      <span className="site00-pfw-map__node-status">{node.statusLabel}</span>
    </button>
  );
}

export function PageFamilyMap({ family, selectedNodeId, onSelectNode, expanded, onToggleExpand }: Props) {
  const parent = family.nodes.find((n) => n.level === 0);
  const children = family.nodes.filter((n) => n.level === 1);
  const grandchildrenByParent = new Map<string, PageFamilyNode[]>();
  for (const gc of family.nodes.filter((n) => n.level === 2)) {
    if (!gc.parentNodeId) continue;
    const list = grandchildrenByParent.get(gc.parentNodeId) ?? [];
    list.push(gc);
    grandchildrenByParent.set(gc.parentNodeId, list);
  }

  return (
    <section className="site00-pfw-map" aria-label="Page family map">
      <header className="site00-pfw-map__head">
        <h3>PAGE FAMILY MAP</h3>
        <button type="button" className="site00-pfw-map__expand" onClick={onToggleExpand}>
          {expanded ? 'COLLAPSE' : 'EXPAND ALL'}
        </button>
      </header>
      <div className={`site00-pfw-map__canvas${expanded ? ' is-expanded' : ''}`}>
        {parent ? (
          <div className="site00-pfw-map__row site00-pfw-map__row--parent">
            <NodeChip node={parent} selected={selectedNodeId === parent.nodeId} onSelect={() => onSelectNode(parent.nodeId)} />
          </div>
        ) : null}
        <div className="site00-pfw-map__row site00-pfw-map__row--children">
          {children.map((child) => (
            <div key={child.nodeId} className="site00-pfw-map__branch">
              <NodeChip
                node={child}
                selected={selectedNodeId === child.nodeId}
                onSelect={() => onSelectNode(child.nodeId)}
              />
              {expanded && (grandchildrenByParent.get(child.nodeId)?.length ?? 0) > 0 ? (
                <div className="site00-pfw-map__row site00-pfw-map__row--grandchildren">
                  {grandchildrenByParent.get(child.nodeId)!.map((gc) => (
                    <NodeChip
                      key={gc.nodeId}
                      node={gc}
                      selected={selectedNodeId === gc.nodeId}
                      onSelect={() => onSelectNode(gc.nodeId)}
                      size="sm"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
