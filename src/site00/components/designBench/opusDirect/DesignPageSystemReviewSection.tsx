/**
 * P0.VR.DESIGN-PAGE-SYSTEM-REVIEW1 + P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION1
 */

import { useCallback, useMemo, useState } from 'react';

import {
  listSimilarDescendantPageIds,
  type PageSystemReviewModel,
} from '../../../../../shared/site00-design-workspace-production/designPageSystemReview.js';
import type { PageFamilyBlueprint } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import type { OpusPageFamilyHandoff } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import {
  buildPageFamilyReviewPresentation,
  findPageFamilyReviewRow,
  type PageFamilyReviewPageRow,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyReviewPresentation.js';
import { buildPageFamilyInteractionReviewPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyInteractionReviewPresentation.js';
import type { PageFamilyInteractionMap } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyInteractionMap.js';
import type { PageFunctionalExpansionIntelligence } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageFunctionalExpansionIntelligence.js';
import { DesignPageFamilyInspector } from './DesignPageFamilyInspector.js';
import type { TwinOpusDirectWorkspaceActions } from './twinOpusDirectWorkspace';

type Props = {
  projectSlug: string;
  model: PageSystemReviewModel;
  viewportNote: string | null;
  actions: TwinOpusDirectWorkspaceActions;
  pageFamilyBlueprint?: PageFamilyBlueprint | null;
  pageFamilyInteractionMap?: PageFamilyInteractionMap | null;
  opusPageFamilyHandoff?: OpusPageFamilyHandoff | null;
  skinContractApprovedAt?: string | null;
  functionalExpansionIntelligence?: PageFunctionalExpansionIntelligence | null;
};

function FamilyDrillRow({
  row,
  onInspect,
}: {
  row: PageFamilyReviewPageRow;
  onInspect: () => void;
}) {
  return (
    <button
      type="button"
      className="tod-psr-card tod-psr-card--family"
      onClick={onInspect}
      data-testid={`page-family-drill-row-${row.pageId}`}
      data-interaction-id="page-family-inspect-page"
    >
      <span className="tod-psr-card__name">{row.pageName}</span>
      <span className="tod-psr-card__meta">
        {row.functionRole} · {row.shellArchetype} · {row.coverageStatus}
      </span>
      <span className="tod-psr-card__meta">
        {row.route ? `ROUTE ${row.route}` : row.inheritanceSummary} · DIVERGENCE {row.divergenceLevel} ·
        RESPONSIVE {row.responsiveStatus}
      </span>
    </button>
  );
}

export function DesignPageSystemReviewSection({
  projectSlug,
  model,
  viewportNote,
  actions,
  pageFamilyBlueprint,
  pageFamilyInteractionMap,
  opusPageFamilyHandoff,
  skinContractApprovedAt,
  functionalExpansionIntelligence,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [batchScope, setBatchScope] = useState('DESIGN FRAMEWORK');
  const [drill, setDrill] = useState<'none' | 'children' | 'grandchildren' | 'coverage'>('none');
  const [inspectorPageId, setInspectorPageId] = useState<string | null>(null);

  const presentation = useMemo(
    () =>
      buildPageFamilyReviewPresentation({
        model,
        blueprint: pageFamilyBlueprint ?? null,
        handoff: opusPageFamilyHandoff ?? null,
        interactionMap: pageFamilyInteractionMap ?? null,
        skinContractApprovedAt,
      }),
    [model, opusPageFamilyHandoff, pageFamilyBlueprint, pageFamilyInteractionMap, skinContractApprovedAt],
  );

  const interactionPresentation = useMemo(
    () =>
      buildPageFamilyInteractionReviewPresentation({
        blueprint: pageFamilyBlueprint ?? null,
        interactionMap: pageFamilyInteractionMap ?? null,
      }),
    [pageFamilyBlueprint, pageFamilyInteractionMap],
  );

  const { counts } = presentation;
  const inspectorRow = inspectorPageId ? findPageFamilyReviewRow(presentation, inspectorPageId) : null;

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

  const openInspect = useCallback((pageId: string) => {
    setInspectorPageId(pageId);
  }, []);

  return (
    <section className="tod-out tod-psr" aria-label={model.title}>
      <header className="tod-out__head">
        <h2 className="tod-out__title">{model.title}</h2>
        <p className="tod-psr__counts" data-testid="page-system-review-family-counts">
          CHILDREN {counts.childPageCount} · GRANDCHILDREN {counts.grandchildPageCount} · TOTAL{' '}
          {counts.totalPageCount} · COVERAGE {counts.coveredPages}/{counts.totalPageCount} · UNDEFINED{' '}
          <span
            className={counts.undefinedPages > 0 ? 'tod-psr__undefinedWarn' : undefined}
            data-testid="page-system-review-undefined-count"
          >
            {counts.undefinedPages}
          </span>
          {counts.countsSource === 'PAGE_FAMILY_BLUEPRINT' ?
            <span className="tod-psr__countsSource"> · BLUEPRINT</span>
          : <span className="tod-psr__countsSource"> · REVIEW ONLY (BLUEPRINT PENDING)</span>}
        </p>
        {presentation.familyStatus === 'READY_FOR_APPROVAL' ?
          <p className="tod-psr__familyStatus" data-testid="page-family-status-ready">
            FAMILY STATUS · READY FOR APPROVAL · SKIN · {presentation.skinStatus}
          </p>
        : null}
        {pageFamilyBlueprint?.hierarchyReceipt ?
          <p className="tod-psr__hierarchyDiag" data-testid="page-family-hierarchy-sources">
            HIERARCHY · {pageFamilyBlueprint.hierarchyReceipt.hierarchyDiscoveryStatus} · ROUTE{' '}
            {pageFamilyBlueprint.hierarchyReceipt.diagnostics.routeRegistryPageCount} · NAV{' '}
            {pageFamilyBlueprint.hierarchyReceipt.diagnostics.projectNavPageCount} · CANONICAL{' '}
            {pageFamilyBlueprint.hierarchyReceipt.diagnostics.canonicalResolvedPageCount}
          </p>
        : null}
        {presentation.opusHandoffReady ?
          <p className="tod-psr__familyStatus" data-testid="page-family-opus-handoff-ready">
            PAGE FAMILY HANDOFF · READY FOR OPUS · {presentation.pageCoveragePercent ?? 100}% PAGE ·{' '}
            {interactionPresentation?.summary.mapped ?? 0}/{interactionPresentation?.summary.total ?? 0} INTERACTIONS
          </p>
        : null}
        {viewportNote ?
          <p className="tod-out__viewportNote">{viewportNote}</p>
        : null}
      </header>

      <div className="tod-out__cols tod-psr__cols tod-psr__cols--compact">
        <button
          type="button"
          className="tod-psr__metricCell"
          data-testid="page-system-review-children-cell"
          onClick={() => setDrill((d) => (d === 'children' ? 'none' : 'children'))}
        >
          <span className="tod-out__label">CHILDREN</span>
          <span className="tod-psr__metricValue">{counts.childPageCount}</span>
          <span className="tod-psr__metricHint">TAP TO INSPECT</span>
        </button>

        <button
          type="button"
          className="tod-psr__metricCell"
          data-testid="page-system-review-grandchildren-cell"
          onClick={() => setDrill((d) => (d === 'grandchildren' ? 'none' : 'grandchildren'))}
        >
          <span className="tod-out__label">GRANDCHILDREN</span>
          <span className="tod-psr__metricValue">{counts.grandchildPageCount}</span>
          <span className="tod-psr__metricHint">TAP TO INSPECT</span>
        </button>

        <button
          type="button"
          className="tod-psr__metricCell"
          data-testid="page-system-review-family-coverage-cell"
          onClick={() => setDrill((d) => (d === 'coverage' ? 'none' : 'coverage'))}
        >
          <span className="tod-out__label">FAMILY COVERAGE</span>
          <span className="tod-psr__metricValue">
            {counts.coveredPages}/{counts.totalPageCount}
          </span>
          <span className="tod-psr__metricHint">UNDEFINED {counts.undefinedPages}</span>
        </button>

        <div className="tod-out__col tod-psr__col tod-psr__col--batch">
          <span className="tod-out__label">BATCH / INHERITANCE</span>
          <p className="tod-psr__batchSummary">
            {eligibleIds.length} SIMILAR · {selected.size} SELECTED · {counts.coveredPages} COVERED
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
            {model.batchGroups.slice(0, 2).map((g) => (
              <li key={g.groupKey}>
                {g.members.slice(0, 4).map((m) => (
                  <label key={m.pageId} className="tod-psr__checkRow">
                    <input type="checkbox" checked={selected.has(m.pageId)} onChange={() => togglePage(m.pageId)} />
                    <span>{m.pageName}</span>
                  </label>
                ))}
              </li>
            ))}
          </ul>
          <label className="tod-psr__scope">
            CHANGE TYPE
            <select value={batchScope} onChange={(e) => setBatchScope(e.target.value)}>
              <option value="DESIGN FRAMEWORK">DESIGN FRAMEWORK</option>
              <option value="NAVIGATION">NAVIGATION</option>
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

        <div className="tod-out__col tod-psr__col tod-psr__col--assets">
          <button
            type="button"
            className="tod-out__label tod-psr__assetsOpen"
            onClick={() => actions.openPageAssetsPanel()}
            data-interaction-id="page-system-open-assets"
          >
            ASSETS
          </button>
          <p className="tod-psr__ixSummary">{model.assets.length} IN MANIFEST</p>
        </div>

        <button
          type="button"
          className="tod-psr__metricCell tod-psr__metricCell--interactions"
          data-testid="page-system-review-interactions-cell"
          data-interaction-id="page-system-interactions"
          onClick={() => actions.openPageInteractionMapReview()}
        >
          <span className="tod-out__label">INTERACTIONS</span>
          <span
            className="tod-psr__metricValue"
            data-testid="page-system-interaction-counts"
            data-interaction-map-source={
              interactionPresentation ? 'PAGE_FAMILY_INTERACTION_MAP' : 'PAGE_SYSTEM_REVIEW_LEGACY'
            }
          >
            {interactionPresentation ?
              `${interactionPresentation.summary.mapped}/${interactionPresentation.summary.total}`
            : `${model.interactionSummary.covered}/${model.interactionSummary.total}`}
          </span>
          <span className="tod-psr__metricHint">
            {interactionPresentation ?
              `${interactionPresentation.summary.inherited} INHERITED · ${interactionPresentation.summary.pageSpecific} PAGE · ${interactionPresentation.summary.unmapped} UNMAPPED`
            : 'TAP FOR MAP'}
          </span>
        </button>
      </div>

      {functionalExpansionIntelligence ?
        <div className="tod-psr__drill" data-testid="functional-expansions-panel">
          <h3 className="tod-psr__drillTitle">FUNCTIONAL EXPANSIONS</h3>
          <p className="tod-psr__batchSummary">
            PROPOSED{' '}
            {functionalExpansionIntelligence.proposals.filter((p) => p.status === 'PROPOSED').length} · APPROVED{' '}
            {functionalExpansionIntelligence.proposals.filter((p) => p.status === 'FOUNDER_APPROVED').length}
          </p>
          {functionalExpansionIntelligence.proposals.map((p) => (
            <article key={p.expansionId} className="tod-psr-card tod-psr-card--family" data-testid={`functional-expansion-${p.expansionId}`}>
              <span className="tod-psr-card__name">{p.title}</span>
              <span className="tod-psr-card__meta">
                SOURCE {p.sourcePageId} · {p.origin} · {p.status}
              </span>
              <span className="tod-psr-card__meta">GAP · {p.problemObserved}</span>
              <span className="tod-psr-card__meta">PROPOSED · {p.proposedBehavior}</span>
              <span className="tod-psr-card__meta">WHY · {p.whyItFitsProduct}</span>
              <span className="tod-psr-card__meta">
                AFFECTED · {p.affectedPages.slice(0, 4).join(', ')}
                {p.affectedChildren.length ? ` · CHILDREN ${p.affectedChildren.length}` : ''}
                {p.affectedGrandchildren.length ? ` · GRANDCHILDREN ${p.affectedGrandchildren.length}` : ''}
              </span>
              <span className="tod-psr-card__meta">
                RESPONSIVE · M:{p.responsiveImpact.mobile} · T:{p.responsiveImpact.tablet} · D:
                {p.responsiveImpact.desktop}
              </span>
              <span className="tod-psr-card__meta">SCOPE · {p.implementationComplexity}</span>
              {p.status === 'PROPOSED' || p.status === 'DEFERRED' ?
                <div className="tod-psr__batchActions">
                  <button
                    type="button"
                    className="tod-psr__linkBtn"
                    data-interaction-id="functional-expansion-approve"
                    onClick={() => actions.decideFunctionalExpansion(p.expansionId, 'APPROVE')}
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    className="tod-psr__linkBtn"
                    onClick={() => actions.decideFunctionalExpansion(p.expansionId, 'REJECT')}
                  >
                    REJECT
                  </button>
                  <button
                    type="button"
                    className="tod-psr__linkBtn"
                    onClick={() => actions.decideFunctionalExpansion(p.expansionId, 'DEFER')}
                  >
                    DEFER
                  </button>
                </div>
              : null}
            </article>
          ))}
        </div>
      : null}

      {presentation.familyStatus === 'READY_FOR_APPROVAL' ?
        <button
          type="button"
          className="tod-psr__primary tod-psr__reviewFamily"
          data-testid="page-system-review-page-family"
          onClick={() => actions.reviewPageFamilyBlueprint()}
        >
          REVIEW PAGE FAMILY
        </button>
      : null}

      {drill === 'children' ?
        <div className="tod-psr__drill" data-testid="page-system-review-children-panel">
          <h3 className="tod-psr__drillTitle">DIRECT CHILDREN</h3>
          {presentation.children.length === 0 ?
            <p className="tod-psr__empty">NO DIRECT CHILD PAGES IN RESOLVED FAMILY</p>
          : presentation.children.map((row) => (
              <FamilyDrillRow key={row.pageId} row={row} onInspect={() => openInspect(row.pageId)} />
            ))
          }
        </div>
      : null}

      {drill === 'grandchildren' ?
        <div className="tod-psr__drill" data-testid="page-system-review-grandchildren-panel">
          <h3 className="tod-psr__drillTitle">GRANDCHILDREN</h3>
          {presentation.children.length === 0 && presentation.grandchildren.length === 0 ?
            <p className="tod-psr__empty">NO GRANDCHILD PAGES IN RESOLVED FAMILY</p>
          : presentation.children.map((parent) => (
              <div key={parent.pageId} className="tod-psr__grandchildGroup">
                <p className="tod-psr__groupLabel">{parent.pageName}</p>
                {(presentation.grandchildrenByParent[parent.pageId] ?? []).length === 0 ?
                  <p className="tod-psr__empty">—</p>
                : (presentation.grandchildrenByParent[parent.pageId] ?? []).map((row) => (
                    <FamilyDrillRow key={row.pageId} row={row} onInspect={() => openInspect(row.pageId)} />
                  ))
                }
              </div>
            ))
          }
          {presentation.grandchildren
            .filter((g) => !presentation.children.some((c) => c.pageId === g.parentPageId))
            .map((row) => (
              <FamilyDrillRow key={row.pageId} row={row} onInspect={() => openInspect(row.pageId)} />
            ))}
        </div>
      : null}

      {drill === 'coverage' && pageFamilyBlueprint ?
        <div className="tod-psr__drill" data-testid="page-system-review-coverage-panel">
          <h3 className="tod-psr__drillTitle">FAMILY COVERAGE</h3>
          {pageFamilyBlueprint.coverageMatrix.rows.map((row) => (
            <button
              key={row.pageId}
              type="button"
              className="tod-psr-card tod-psr-card--family"
              onClick={() => openInspect(row.pageId)}
            >
              {row.pageName} · {row.coverageStatus} · {row.assignedArchetype}
            </button>
          ))}
          {presentation.opusHandoffPreview ?
            <p data-testid="page-family-opus-shell-preview">
              OPUS SHELLS · {presentation.opusHandoffPreview.totalOpusShellsToCreate} · UNIQUE{' '}
              {presentation.opusHandoffPreview.uniqueShellCount} · SHARED{' '}
              {presentation.opusHandoffPreview.sharedArchetypeCount}
            </p>
          : null}
        </div>
      : null}

      {inspectorRow ?
        <DesignPageFamilyInspector
          row={inspectorRow}
          blueprint={pageFamilyBlueprint ?? null}
          onClose={() => setInspectorPageId(null)}
        />
      : null}
    </section>
  );
}
