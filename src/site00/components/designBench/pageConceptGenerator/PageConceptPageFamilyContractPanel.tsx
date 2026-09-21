/**
 * P0.VR.PAGE-FAMILY-SKIN-BEHAVIOR-CONTRACT1
 */

import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export type PageConceptPageFamilyContractPanelProps = {
  state: PageConceptGenerationState;
  onApprovePageFamily: () => void;
  onMarkOpusShellsReady: () => void;
  busy?: boolean;
};

export function PageConceptPageFamilyContractPanel(props: PageConceptPageFamilyContractPanelProps) {
  const contract = props.state.pipelineSet?.pageFamilySkinBehaviorContract;
  const shellSet = props.state.pipelineSet?.opusRepresentativeShellSet;
  if (!contract) return null;

  const shellsReady = Boolean(shellSet?.readyAt && shellSet.shells.every((s) => s.status === 'READY'));

  return (
    <section className="s00-pcg__pageFamilyContract" data-testid="page-concept-page-family-contract-panel">
      <p>PAGE FAMILY DESIGN SYSTEM</p>
      <details open>
        <summary>Visual DNA</summary>
        <ul>
          {contract.visualDna.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Parent / Child / Grandchild rules</summary>
        <p>PARENT: {contract.inheritanceRules.parent.designDivergenceLevel}</p>
        <p>CHILD: {contract.inheritanceRules.child.designDivergenceLevel}</p>
        <p>GRANDCHILD: {contract.inheritanceRules.grandchild.designDivergenceLevel}</p>
      </details>
      <details>
        <summary>Navigation + Components + Overlays</summary>
        <p>Children: {contract.pageSystemReviewSnapshot.directChildCount}</p>
        <p>Grandchildren: {contract.pageSystemReviewSnapshot.grandchildCount}</p>
        <p>Component map: {contract.componentExpressionMapId}</p>
      </details>
      {!contract.approvedAt ?
        <button
          type="button"
          disabled={props.busy}
          data-testid="page-concept-approve-page-family"
          onClick={props.onApprovePageFamily}
        >
          APPROVE PAGE FAMILY SYSTEM
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
