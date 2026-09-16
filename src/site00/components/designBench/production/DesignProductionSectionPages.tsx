import { useMemo, useState } from 'react';

import { DesignProductionChildShell } from './DesignProductionChildShell';
import {
  DEFAULT_DESIGN_PAGE_TARGET,
  readDesignPageTarget,
  writeDesignPageTarget,
  type DesignProductionPageTarget,
} from './designProductionPageTarget';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';

const PAGE_TREE: readonly {
  id: string;
  label: string;
  surface: string;
  status: string;
  authority: string;
  readiness: string;
  build: string;
  children?: readonly { id: string; label: string; surface: string }[];
}[] = [
  {
    id: 'ENTRY-001',
    label: 'ENTRY COVER',
    surface: 'HOMEPAGE HERO',
    status: 'AUTHORITY ACTIVE',
    authority: 'PAIR V1.3',
    readiness: 'IN REVIEW',
    build: 'DESIGN',
    children: [
      { id: 'ENTRY-001-A', label: 'CULTURAL RECEIPT', surface: 'HERO PLATE' },
      { id: 'ENTRY-001-B', label: 'INDEX SIGNAL', surface: 'FOOTER STRIP' },
    ],
  },
  {
    id: 'ENTRY-002',
    label: 'ENTRY THEORY',
    surface: 'INNER SPREAD',
    status: 'DRAFT',
    authority: 'UNLOCKED',
    readiness: 'PARTIAL',
    build: 'NOT READY',
  },
];

export function DesignProductionSectionPages() {
  const { projectSlug } = useDesignProductionNavigation();
  const [target, setTarget] = useState<DesignProductionPageTarget>(() =>
    readDesignPageTarget(projectSlug),
  );

  const currentId = useMemo(() => target.entryId, [target]);

  const select = (entry: DesignProductionPageTarget) => {
    writeDesignPageTarget(projectSlug, entry);
    setTarget(entry);
  };

  return (
    <DesignProductionChildShell
      title="PAGES"
      subtitle="Switch design target — the TARGET band on the workspace stays readonly."
    >
      <ul className="tod-child__list" data-testid="design-pages-list">
        {PAGE_TREE.map((page) => (
          <li key={page.id} className="tod-child__card">
            <button
              type="button"
              className={`tod-child__row${currentId === page.id ? ' is-active' : ''}`}
              onClick={() =>
                select({
                  entryId: page.id,
                  pageLabel: page.label,
                  surfaceLabel: page.surface,
                })
              }
            >
              <span className="tod-child__rowTitle">{page.id.replace(/-/g, ' ')}</span>
              <span>{page.label}</span>
              <span className="tod-child__muted">{page.surface}</span>
              <span className="tod-child__meta">
                {page.status} · {page.authority} · {page.readiness} · {page.build}
              </span>
            </button>
            {page.children?.map((child) => (
              <button
                key={child.id}
                type="button"
                className={`tod-child__row tod-child__row--indent${currentId === child.id ? ' is-active' : ''}`}
                onClick={() =>
                  select({
                    entryId: child.id,
                    pageLabel: child.label,
                    surfaceLabel: child.surface,
                  })
                }
              >
                <span className="tod-child__rowTitle">{child.label}</span>
                <span className="tod-child__muted">{child.surface}</span>
              </button>
            ))}
          </li>
        ))}
      </ul>
      <p className="tod-child__note">
        Current target: {target.entryId} · {target.pageLabel} · {target.surfaceLabel}
        {currentId === DEFAULT_DESIGN_PAGE_TARGET.entryId ? '' : ' (saved for this session)'}
      </p>
    </DesignProductionChildShell>
  );
}
