/**
 * P0.VR.DESIGN-PAGE-SYSTEM-REVIEW1 — CHILDREN · GRANDCHILDREN · BATCH · ASSETS · INTERACTIONS
 */

import { useCallback, useMemo, useState } from 'react';

import {
  listSimilarDescendantPageIds,
  type PageSystemReviewModel,
} from '../../../../../shared/site00-design-workspace-production/designPageSystemReview.js';
import type { TwinOpusDirectWorkspaceActions } from './twinOpusDirectWorkspace';

type Props = {
  projectSlug: string;
  model: PageSystemReviewModel;
  viewportNote: string | null;
  actions: TwinOpusDirectWorkspaceActions;
};

function DescendantThumb({
  card,
  onOpen,
}: {
  card: PageSystemReviewModel['children'][number];
  onOpen: () => void;
}) {
  return (
    <button type="button" className="tod-psr-card" onClick={onOpen} data-interaction-id="page-system-open-descendant">
      <span className={`tod-psr-card__thumb${card.thumbnailSrc ? '' : ' tod-psr-card__thumb--empty'}`}>
        {card.thumbnailSrc ?
          <img src={card.thumbnailSrc} alt="" draggable={false} />
        : <span>{card.thumbnailKind === 'missing' ? 'NO PREVIEW' : 'PREVIEW'}</span>}
      </span>
      <span className="tod-psr-card__name">{card.pageName}</span>
      <span className="tod-psr-card__meta">
        {card.status} · {card.inheritanceStatus}
      </span>
    </button>
  );
}

export function DesignPageSystemReviewSection({ projectSlug, model, viewportNote, actions }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [batchScope, setBatchScope] = useState('DESIGN FRAMEWORK');

  const eligibleIds = useMemo(
    () => model.batchGroups.flatMap((g) => g.members.map((m) => m.pageId)),
    [model.batchGroups],
  );

  const togglePage = useCallback((pageId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }, []);

  const selectAllSimilar = useCallback(() => {
    const ids = listSimilarDescendantPageIds(projectSlug, model, model.activePageId);
    setSelected(new Set(ids.filter((id) => eligibleIds.includes(id))));
  }, [eligibleIds, model, projectSlug]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const openBatchConfirm = useCallback(() => {
    actions.openPageBatchEdit({
      sourcePageId: model.activePageId,
      pageIds: [...selected],
      scope: batchScope,
    });
  }, [actions, batchScope, model.activePageId, selected]);

  return (
    <section className="tod-out tod-psr" aria-label={model.title}>
      <header className="tod-out__head">
        <h2 className="tod-out__title">{model.title}</h2>
        <p className="tod-psr__counts">
          DIRECT CHILDREN: {model.directChildCount} · GRANDCHILDREN: {model.grandchildCount} · TOTAL:{' '}
          {model.totalDescendantCount}
        </p>
        {viewportNote ?
          <p className="tod-out__viewportNote">{viewportNote}</p>
        : null}
      </header>

      <div className="tod-out__cols tod-psr__cols">
        <div className="tod-out__col tod-psr__col">
          <span className="tod-out__label">CHILDREN</span>
          <div className="tod-psr__stack">
            {model.children.length === 0 ?
              <p className="tod-psr__empty">NO DIRECT CHILD PAGES</p>
            : model.children.map((c) => (
                <DescendantThumb key={c.pageId} card={c} onOpen={() => actions.openDesignPage(c.pageId)} />
              ))
            }
          </div>
        </div>

        <div className="tod-out__col tod-psr__col">
          <span className="tod-out__label">GRANDCHILDREN</span>
          <div className="tod-psr__stack">
            {model.grandchildren.length === 0 ?
              <p className="tod-psr__empty">NO GRANDCHILD PAGES</p>
            : model.grandchildren.map((c) => (
                <DescendantThumb key={c.pageId} card={c} onOpen={() => actions.openDesignPage(c.pageId)} />
              ))
            }
          </div>
        </div>

        <div className="tod-out__col tod-psr__col tod-psr__col--batch">
          <span className="tod-out__label">BATCH / INHERITANCE</span>
          <p className="tod-psr__batchSummary">
            {eligibleIds.length} SIMILAR PAGES · {selected.size} SELECTED
          </p>
          <div className="tod-psr__batchActions">
            <button type="button" className="tod-psr__linkBtn" onClick={selectAllSimilar}>
              SELECT ALL SIMILAR
            </button>
            <button type="button" className="tod-psr__linkBtn" onClick={clearSelection}>
              CLEAR
            </button>
          </div>
          <ul className="tod-psr__batchList">
            {model.batchGroups.map((g) => (
              <li key={g.groupKey}>
                <span className="tod-psr__groupLabel">{g.label}</span>
                {g.members.map((m) => (
                  <label key={m.pageId} className="tod-psr__checkRow">
                    <input
                      type="checkbox"
                      checked={selected.has(m.pageId)}
                      onChange={() => togglePage(m.pageId)}
                    />
                    <span>
                      {m.pageName} · {m.safety}
                    </span>
                  </label>
                ))}
              </li>
            ))}
          </ul>
          <label className="tod-psr__scope">
            CHANGE TYPE
            <select value={batchScope} onChange={(e) => setBatchScope(e.target.value)}>
              <option value="DESIGN FRAMEWORK">DESIGN FRAMEWORK</option>
              <option value="TYPOGRAPHY">TYPOGRAPHY</option>
              <option value="SPACING">SPACING</option>
              <option value="ICON SYSTEM">ICON SYSTEM</option>
              <option value="NAVIGATION">NAVIGATION</option>
              <option value="INTERACTION">INTERACTION</option>
              <option value="ASSET SLOT">ASSET SLOT</option>
              <option value="COMPONENT">COMPONENT</option>
              <option value="STYLE TOKEN">STYLE TOKEN</option>
            </select>
          </label>
          <button
            type="button"
            className="tod-psr__primary"
            disabled={selected.size === 0}
            onClick={openBatchConfirm}
            data-interaction-id="page-system-batch-edit"
          >
            BATCH EDIT SELECTED
          </button>
        </div>

        <div className="tod-out__col tod-psr__col">
          <span className="tod-out__label">ASSETS</span>
          <div className="tod-psr__stack">
            {model.assets.length === 0 ?
              <p className="tod-psr__empty">NO PAGE ASSETS IN MANIFEST</p>
            : model.assets.map((a) => (
                <button
                  key={a.assetId}
                  type="button"
                  className="tod-psr-card tod-psr-card--asset"
                  onClick={() => actions.openPageAssetInspect(a.assetId)}
                  data-interaction-id="page-system-inspect-asset"
                >
                  <span className="tod-psr-card__thumb">
                    <img src={a.previewSrc} alt="" draggable={false} />
                  </span>
                  <span className="tod-psr-card__name">{a.slot}</span>
                  <span className="tod-psr-card__meta">
                    {a.origin} · {a.status} · v{a.version}
                  </span>
                </button>
              ))
            }
          </div>
        </div>

        <div className="tod-out__col tod-psr__col">
          <span className="tod-out__label">INTERACTIONS</span>
          <p className="tod-psr__ixSummary">
            {model.interactionSummary.active} ACTIVE · {model.interactionSummary.inherited} INHERITED ·{' '}
            {model.interactionSummary.overridden} OVERRIDDEN · {model.interactionSummary.unmapped} UNMAPPED
          </p>
          <p className="tod-psr__ixCoverage">
            INTERACTION COVERAGE: {model.interactionSummary.covered} / {model.interactionSummary.total}
          </p>
          <button
            type="button"
            className="tod-psr__primary"
            onClick={() => actions.openPageInteractionsInspector()}
            data-interaction-id="page-system-interactions"
          >
            OPEN INTERACTION INSPECTOR
          </button>
        </div>
      </div>
    </section>
  );
}
