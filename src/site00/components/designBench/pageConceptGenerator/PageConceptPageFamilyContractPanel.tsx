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
  const blueprint = props.state.pipelineSet?.pageFamilyBlueprint;
  const handoff = props.state.pipelineSet?.opusPageFamilyHandoff;
  const shellSet = props.state.pipelineSet?.opusRepresentativeShellSet;
  if (!contract) return null;

  const shellsReady = Boolean(shellSet?.readyAt && shellSet.shells.every((s) => s.status === 'READY'));
  const blueprintApproved = Boolean(blueprint?.approvedAt);

  return (
    <section className="s00-pcg__pageFamilyContract" data-testid="page-concept-page-family-system-review">
      <header className="s00-pcg__viewportSectionHead">
        <h3>PAGE FAMILY BLUEPRINT</h3>
        <p>Parent, child, and grandchild roles before Opus twin shells.</p>
      </header>
      {blueprint ?
        <details open data-testid="page-concept-page-family-blueprint">
          <summary>
            PARENT · {blueprint.childCount} CHILD · {blueprint.grandchildCount} GRANDCHILD
          </summary>
          <ul>
            {blueprint.nodes.map((n) => (
              <li key={n.pageId}>
                {n.pageName} · {n.functionRole} · {n.shellArchetype} · {n.divergenceLevel}
              </li>
            ))}
          </ul>
          <p>Archetypes: {blueprint.archetypeShells.map((a) => a.archetype).join(', ')}</p>
        </details>
      : null}
      {handoff ?
        <p data-testid="page-concept-opus-page-family-handoff">OPUS HANDOFF · {handoff.handoffId}</p>
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
          disabled={props.busy}
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
