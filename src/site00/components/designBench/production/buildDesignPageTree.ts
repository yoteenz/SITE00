import type { DesignBoundPageRecord } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';

export type DesignPageTreeNode = {
  page: DesignBoundPageRecord;
  children: DesignPageTreeNode[];
};

export function buildDesignPageTree(registry: readonly DesignBoundPageRecord[]): DesignPageTreeNode[] {
  const byId = new Map(registry.map((p) => [p.pageId, p]));
  const childrenOf = new Map<string, DesignBoundPageRecord[]>();

  for (const page of registry) {
    if (page.parentPageId && byId.has(page.parentPageId)) {
      const list = childrenOf.get(page.parentPageId) ?? [];
      list.push(page);
      childrenOf.set(page.parentPageId, list);
    }
  }

  const build = (page: DesignBoundPageRecord): DesignPageTreeNode => {
    const kids = (childrenOf.get(page.pageId) ?? []).slice().sort((a, b) => a.pageName.localeCompare(b.pageName));
    return { page, children: kids.map(build) };
  };

  const roots = registry
    .filter((p) => !p.parentPageId || !byId.has(p.parentPageId))
    .slice()
    .sort((a, b) => a.pageName.localeCompare(b.pageName));

  return roots.map(build);
}
