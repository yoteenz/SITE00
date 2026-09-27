/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1
 */

import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { resolvePageFamilySkinStatus } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';

export type PageConceptPageFamilyContractPanelProps = {
  state: PageConceptGenerationState;
  onApprovePageFamily: () => void;
  onMarkOpusShellsReady: () => void;
  busy?: boolean;
};

export function PageConceptPageFamilyContractPanel(props: PageConceptPageFamilyContractPanelProps) {
  const contract = props.state.pipelineSet?.pageFamilySkinBehaviorContract;
  const blueprint = props.state.pipelineSet?.pageFamilyBlueprint;
  const handoff = props.state.pipelineSet?.opusPageFamilyHandoff;
  const shellSet = props.state.pipelineSet?.opusRepresentativeShellSet;
  if (!contract) return null;

  const shellsReady = Boolean(shellSet?.readyAt && shellSet.shells.every((s) => s.status === 'READY'));
  const blueprintApproved = Boolean(blueprint?.approvedAt);
  const skinStatus = resolvePageFamilySkinStatus({
    skinContractApprovedAt: contract.approvedAt,
    blueprintApprovedAt: blueprint?.approvedAt,
  });
  const undefinedPages = blueprint?.coverageSummary.undefinedPageCount ?? 0;
  const preview = blueprint?.handoffPreview;

  return (
    <section className="s00-pcg__pageFamilyContract" data-testid="page-concept-page-family-system-review">
      <header className="s00-pcg__viewportSectionHead">
        <h3>PAGE FAMILY BLUEPRINT</h3>
        <p>Parent, child, and grandchild roles before Opus twin shells.</p>
      </header>
      {blueprint ?
        <>
          <p data-testid="page-family-coverage-totals">
            TOTAL {blueprint.coverageSummary.totalPageCount} · COVERED{' '}
            {blueprint.coverageSummary.coveredByUniqueShell + blueprint.coverageSummary.coveredByApprovedArchetype} ·
            UNDEFINED {undefinedPages}
          </p>
          <p data-testid="page-family-skin-status">SKIN · {skinStatus}</p>
          <details open data-testid="page-concept-page-family-blueprint">
            <summary>
              PAGE TREE · {blueprint.coverageSummary.parentPageCount} PARENT ·{' '}
              {blueprint.coverageSummary.childPageCount} CHILD ·{' '}
              {blueprint.coverageSummary.grandchildPageCount} GRANDCHILD
            </summary>
            <ul>
              {blueprint.coverageMatrix.rows.map((row) => (
                <li key={row.pageId} data-testid={`page-family-row-${row.pageId}`}>
                  {row.pageName} · {row.functionRole} · {row.assignedArchetype} · {row.coverageStatus} ·
                  MOBILE {blueprint.archetypeShells.find((a) => a.archetype === row.assignedArchetype)?.mobile[0] ?? '—'}
                </li>
              ))}
            </ul>
          </details>
          {preview ?
            <details data-testid="page-concept-opus-handoff-preview">
              <summary>OPUS HANDOFF PREVIEW · {preview.totalOpusShellsToCreate} SHELLS</summary>
              <p>Parent: {preview.parentShellArchetypes.join(', ') || '—'}</p>
              <p>Child archetypes: {preview.childShellArchetypes.join(', ') || '—'}</p>
              <p>Grandchild archetypes: {preview.grandchildShellArchetypes.join(', ') || '—'}</p>
              <p>Unique shells: {preview.uniqueShellCount} · Shared archetypes: {preview.sharedArchetypeCount}</p>
            </details>
          : null}
        </>
      : null}
      {handoff ?
        <p data-testid="page-concept-opus-page-family-handoff">
          OPUS HANDOFF · {handoff.handoffId} · {handoff.pageCoveragePercent}% coverage
        </p>
      : null}
      <details open>
        <summary>VISUAL DNA</summary>
        <ul>
          {contract.visualDna.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>PARENT · CHILD · GRANDCHILD</summary>
        <p>PARENT: {contract.inheritanceRules.parent.designDivergenceLevel}</p>
        <p>CHILD: {contract.inheritanceRules.child.designDivergenceLevel}</p>
        <p>GRANDCHILD: {contract.inheritanceRules.grandchild.designDivergenceLevel}</p>
      </details>
      <details>
        <summary>NAVIGATION · COMPONENTS · OVERLAYS · RESPONSIVE · DIVERGENCE</summary>
        <p>Children: {contract.pageSystemReviewSnapshot.directChildCount}</p>
        <p>Grandchildren: {contract.pageSystemReviewSnapshot.grandchildCount}</p>
        <p>Component map: {contract.componentExpressionMapId}</p>
      </details>
      {!blueprintApproved ?
        <button
          type="button"
          disabled={props.busy || undefinedPages > 0}
          data-testid="page-concept-approve-page-family-blueprint"
          onClick={props.onApprovePageFamily}
        >
          APPROVE PAGE FAMILY BLUEPRINT
        </button>
      : null}
      {blueprintApproved && !contract.approvedAt ?
        <button
          type="button"
          disabled={props.busy}
          data-testid="page-concept-approve-page-family"
          onClick={props.onApprovePageFamily}
        >
          CONFIRM PAGE FAMILY SKIN
        </button>
      : null}
      {contract.approvedAt && !shellsReady ?
        <button
          type="button"
          disabled={props.busy}
          data-testid="page-concept-mark-opus-shells-ready"
          onClick={props.onMarkOpusShellsReady}
        >
          CREATE OPUS REPRESENTATIVE SHELL SET (TWIN)
        </button>
      : null}
      {shellsReady ?
        <p data-testid="page-concept-opus-shells-ready">OPUS REPRESENTATIVE SHELLS READY · {shellSet!.setId}</p>
      : null}
    </section>
  );
}
