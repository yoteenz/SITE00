import type { ClientStudioStage } from '../../services/clientProductionApi';

type ProductionSpineProps = {
  stages: ClientStudioStage[];
};

function stageClass(status: string): string {
  switch (status) {
    case 'complete':
    case 'approved':
      return 'site00-studio-spine__node--complete';
    case 'in_progress':
    case 'in_review':
    case 'awaiting_client':
      return 'site00-studio-spine__node--active';
    case 'blocked':
      return 'site00-studio-spine__node--blocked';
    default:
      return 'site00-studio-spine__node--upcoming';
  }
}

export function ProductionSpine({ stages }: ProductionSpineProps) {
  return (
    <nav className="site00-studio-spine" aria-label="PRODUCTION SPINE">
      <div className="site00-studio-spine__track">
        {stages.map((stage, i) => (
          <div key={stage.id} className={`site00-studio-spine__node ${stageClass(stage.status)}`.trim()}>
            <div className="site00-studio-spine__index">{stage.index}</div>
            <div className="site00-studio-spine__label">{stage.label}</div>
            {stage.status === 'complete' || stage.status === 'approved' ? (
              <span className="site00-studio-spine__check" aria-hidden="true">✓</span>
            ) : stage.status === 'in_progress' || stage.status === 'in_review' || stage.status === 'awaiting_client' ? (
              <span className="site00-studio-spine__target" aria-hidden="true" />
            ) : null}
            {i < stages.length - 1 ? <span className="site00-studio-spine__connector" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </nav>
  );
}
