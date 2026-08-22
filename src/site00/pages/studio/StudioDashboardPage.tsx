import { useParams } from 'react-router-dom';
import { site00StudioPath } from '../../config/routes';
import { useStudioData } from '../../hooks/useStudioData';
import {
  ActivityStream,
  ClientInputSummary,
  ClientOperationsPanel,
  CurrentProductionState,
  MilestoneCard,
  NextReviewPanel,
  ProductionSpine,
  ProjectSignal,
  StudioErrorState,
  StudioLoadingState,
  StudioOperationsPanel,
  StudioProjectHeader,
  StudioShell,
} from '../../components/studio';

export default function StudioDashboardPage() {
  const { projectSlug = '' } = useParams();
  const { data, state, error, reload } = useStudioData(projectSlug);

  if (state === 'loading') {
    return (
      <StudioShell>
        <StudioLoadingState />
      </StudioShell>
    );
  }

  if (state === 'error' || !data) {
    return (
      <StudioShell>
        <StudioErrorState message={error ?? 'WE COULDN\'T LOAD THIS OPERATION. TRY AGAIN.'} onRetry={() => void reload()} />
      </StudioShell>
    );
  }

  const slug = data.project.slug;
  const op = data.currentOperation;

  return (
    <StudioShell>
      <div className="site00-studio-dashboard">
        <StudioProjectHeader
          projectNumber={data.project.projectNumber}
          projectName={data.project.name.toUpperCase()}
          studioStatus={data.studioStatus}
        />

        <ProductionSpine stages={data.stages} />

        <div className="site00-studio-dashboard__grid">
          {op ? (
            <CurrentProductionState
              title={op.title}
              description={op.description}
              resolved={op.resolved}
              total={op.total}
              route={op.route}
            />
          ) : null}

          <ClientInputSummary requiredCount={data.clientInput.requiredCount} route={data.clientInput.route} />

          <ProjectSignal metrics={data.signalMetrics} />

          <div className="site00-studio-dashboard__dual">
            <ClientOperationsPanel operations={data.clientOperations} viewAllRoute={site00StudioPath(slug, 'input')} />
            <StudioOperationsPanel
              operations={data.studioOperations}
              viewAllRoute={site00StudioPath(slug, 'operations')}
              activeCount={data.studioOperations.length}
            />
          </div>

          <MilestoneCard milestone={data.latestMilestone} viewAllRoute={site00StudioPath(slug, 'milestones')} />

          <ActivityStream events={data.activity} viewAllRoute={site00StudioPath(slug, 'activity')} />

          <NextReviewPanel review={data.nextReview} />
        </div>
      </div>
    </StudioShell>
  );
}
