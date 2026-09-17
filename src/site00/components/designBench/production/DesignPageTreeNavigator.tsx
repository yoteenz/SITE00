/**
 * P0.VR.DESIGN-PAGE-NAV1 — active page / page-tree navigator (context bar).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildProjectDesignPageRegistry } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { TodIconCaretDown } from '../opusDirect/TwinOpusDirectIcons';
import { buildDesignPageTree, type DesignPageTreeNode } from './buildDesignPageTree';
import { designProductionPageTargetFromRecord } from './designPageTargetFromRecord';
import {
  readDesignPageTarget,
  resolveDesignPageTargetForShell,
  writeDesignPageTarget,
} from './designProductionPageTarget';
import { writeDesignWorkspaceSurface } from './designProductionWorkspaceMode';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';

function compactStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

function TreeRows({
  nodes,
  depth,
  activePageId,
  expanded,
  onToggleExpand,
  onSelect,
}: {
  nodes: DesignPageTreeNode[];
  depth: number;
  activePageId: string | null;
  expanded: ReadonlySet<string>;
  onToggleExpand: (pageId: string) => void;
  onSelect: (node: DesignPageTreeNode) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded.has(node.page.pageId);
        const isActive = activePageId === node.page.pageId;
        return (
          <li key={node.page.pageId} className="tod-pagetree__item" role="none">
            <div
              className={`tod-pagetree__row${isActive ? ' is-active' : ''}`}
              style={{ paddingLeft: `${8 + depth * 14}px` }}
            >
              {hasChildren ?
                <button
                  type="button"
                  className="tod-pagetree__expand"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  onClick={() => onToggleExpand(node.page.pageId)}
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              : <span className="tod-pagetree__expand tod-pagetree__expand--spacer" aria-hidden />}
              <button
                type="button"
                role="menuitem"
                className="tod-pagetree__select"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(node)}
              >
                <span className="tod-pagetree__name">{node.page.pageName.toUpperCase()}</span>
                <span className="tod-pagetree__meta">
                  {compactStatus(node.page.designStatus)}
                  {node.page.authorityStatus ? ` · ${node.page.authorityStatus}` : ''}
                </span>
              </button>
            </div>
            {hasChildren && isExpanded ?
              <ul className="tod-pagetree__branch" role="group">
                <TreeRows
                  nodes={node.children}
                  depth={depth + 1}
                  activePageId={activePageId}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelect}
                />
              </ul>
            : null}
          </li>
        );
      })}
    </>
  );
}

export function DesignPageTreeNavigator({ projectSlug }: { projectSlug: string }) {
  const { goWorkspace } = useDesignProductionNavigation();
  const slug = projectSlug.toLowerCase();
  const registry = useMemo(() => buildProjectDesignPageRegistry(slug), [slug]);
  const tree = useMemo(() => buildDesignPageTree(registry), [registry]);
  const [open, setOpen] = useState(false);
  const [pageTarget, setPageTarget] = useState(() => resolveDesignPageTargetForShell(slug));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(registry.map((p) => p.pageId)));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setPageTarget(resolveDesignPageTargetForShell(slug));
    window.addEventListener('site00:design-page-target', refresh);
    return () => window.removeEventListener('site00:design-page-target', refresh);
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const toggleExpand = useCallback((pageId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }, []);

  const selectNode = useCallback(
    (node: DesignPageTreeNode) => {
      const target = designProductionPageTargetFromRecord(node.page);
      writeDesignPageTarget(slug, target);
      writeDesignWorkspaceSurface(slug, 'page-workspace');
      setPageTarget(target);
      setOpen(false);
      goWorkspace();
    },
    [goWorkspace, slug],
  );

  const label = pageTarget.pageLabel.toUpperCase();

  return (
    <div className="tod-pagetree" ref={rootRef} data-testid="design-page-tree-nav">
      <button
        type="button"
        className={`tod-context__right tod-context__rightBtn tod-pagetree__trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="design-page-tree-menu"
        data-interaction-id="context-page-tree"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <TodIconCaretDown className="tod-ico tod-pagetree__caret" />
        <span className="tod-dot tod-dot--lime" aria-hidden="true" />
      </button>
      {open ?
        <div className="tod-pagetree__menu" id="design-page-tree-menu" role="menu">
          <p className="tod-pagetree__menuTitle">{slug.toUpperCase()} · PAGE TREE</p>
          <ul className="tod-pagetree__list" role="none">
            <TreeRows
              nodes={tree}
              depth={0}
              activePageId={readDesignPageTarget(slug)?.pageId ?? pageTarget.pageId}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onSelect={selectNode}
            />
          </ul>
        </div>
      : null}
    </div>
  );
}
