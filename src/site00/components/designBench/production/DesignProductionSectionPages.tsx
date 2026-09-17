import { useMemo } from 'react';

import { buildProjectDesignPageRegistry } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { DesignProductionChildShell } from './DesignProductionChildShell';
import {
  readDesignPageTarget,
  writeDesignPageTarget,
  type DesignProductionPageTarget,
} from './designProductionPageTarget';
import { writeDesignWorkspaceSurface } from './designProductionWorkspaceMode';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';

export function DesignProductionSectionPages() {
  const { projectSlug, goWorkspace } = useDesignProductionNavigation();
  const registry = useMemo(() => buildProjectDesignPageRegistry(projectSlug), [projectSlug]);
  const current = readDesignPageTarget(projectSlug);

  const select = (target: DesignProductionPageTarget) => {
    writeDesignPageTarget(projectSlug, target);
    writeDesignWorkspaceSurface(projectSlug, 'page-workspace');
    goWorkspace();
  };

  const roots = registry.filter((p) => !p.parentPageId);

  return (
    <DesignProductionChildShell
      title="PAGES"
      subtitle="Active project page hierarchy — select a page to enter page design workspace."
    >
      <ul className="tod-child__list" data-testid="design-pages-list">
        {roots.map((page) => (
          <li key={page.pageId} className="tod-child__card">
            <PageRow page={page} current={current} onSelect={select} />
            {registry
              .filter((child) => child.parentPageId === page.pageId)
              .map((child) => (
                <PageRow key={child.pageId} page={child} current={current} onSelect={select} indent />
              ))}
          </li>
        ))}
      </ul>
    </DesignProductionChildShell>
  );
}

function PageRow({
  page,
  current,
  onSelect,
  indent,
}: {
  page: ReturnType<typeof buildProjectDesignPageRegistry>[number];
  current: DesignProductionPageTarget | null;
  onSelect: (target: DesignProductionPageTarget) => void;
  indent?: boolean;
}) {
  const active = current?.pageId === page.pageId;
  return (
    <button
      type="button"
      className={`tod-child__row${indent ? ' tod-child__row--indent' : ''}${active ? ' is-active' : ''}`}
      onClick={() =>
        onSelect({
          pageId: page.pageId,
          screenId: page.screenId,
          entryId: page.screenId,
          pageLabel: page.pageName,
          surfaceLabel: page.pageRole.replace(/_/g, ' '),
          route: page.route,
          pageRole: page.pageRole,
          designStatus: page.designStatus,
        })
      }
    >
      <span className="tod-child__rowTitle">{page.pageName.toUpperCase()}</span>
      <span className="tod-child__muted">{page.route}</span>
      <span className="tod-child__meta">
        {page.pageRole.replace(/_/g, ' ')} · {page.designStatus.replace(/_/g, ' ')} · {page.authorityStatus} ·{' '}
        {page.buildStatus.replace(/_/g, ' ')}
      </span>
      {page.isConceptOrphan ?
        <span className="tod-child__muted">CONCEPT — not a live site page</span>
      : null}
    </button>
  );
}
