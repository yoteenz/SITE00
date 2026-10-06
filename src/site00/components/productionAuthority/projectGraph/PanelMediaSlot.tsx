/**
 * Renders a panel media slot from a PanelMediaContract — image or truthful designed placeholder.
 */
import { Link } from 'react-router-dom';
import type { PanelMediaContract, ProductionNode } from '../../../../../shared/site00-production-graph/index.js';
import { placeholderLabel } from '../../../../../shared/site00-production-graph/panelMedia.js';
import { artifactMediaRole } from './GraphPrimitives';

type Props = {
  contract: PanelMediaContract;
  node?: ProductionNode | null;
  geometry?: 'THUMBNAIL' | 'PREVIEW' | 'TILE' | 'HERO_PREVIEW';
  className?: string;
  testId?: string;
};

export function PanelMediaSlot({ contract, node = null, geometry = 'THUMBNAIL', className = 'pgx-row__thumb', testId = 'panel-media-slot' }: Props) {
  const a = contract.artifact;
  const state = contract.media_status;
  const inner =
    a?.url ?
      <span
        className={className}
        data-media-fit="THUMBNAIL_CONTAIN"
        data-media-role={artifactMediaRole(a)}
        data-media-scale={geometry}
        data-media-status="MOUNTED"
        data-project={contract.project_id}
        data-artifact={a.artifact_id}
        data-node={contract.node_id ?? undefined}
        data-testid={testId}
      >
        <img src={a.url} alt="" loading="lazy" data-media-role={artifactMediaRole(a)} />
      </span>
    : <span
        className={`${className} pgx-media-ph`}
        data-media-status={state}
        data-project={contract.project_id}
        data-node={contract.node_id ?? undefined}
        data-artifact={contract.artifact_id ?? undefined}
        data-testid={testId}
      >
        <em>{node?.family_id ?? node?.node_id.split('.').pop()?.toUpperCase() ?? contract.project_id.slice(0, 4).toUpperCase()}</em>
        <small>{placeholderLabel(state, node)}</small>
        {node ?
          <strong>{node.current_stage.replace(/_/g, ' ')}</strong>
        : null}
      </span>;

  if (contract.click_target) {
    return (
      <Link to={contract.click_target} className="pgx-media-link" aria-label={node?.label ?? 'Open'}>
        {inner}
      </Link>
    );
  }
  return inner;
}
