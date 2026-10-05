import { useOutletContext, useParams } from 'react-router-dom';
import {
  ActivityFeedView,
  BehindProjectView,
  BuildProgressView,
  ClientTaskListView,
  DecisionListView,
  MilestoneListView,
  ProjectHubNav,
  ProjectMapView,
} from '../../components/clientApp/ClientAppViews';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppProjectHubPage() {
  const { section = 'map' } = useParams();
  const { manifest } = useOutletContext<AppOutletContext>();

  return (
    <div>
      <ProjectHubNav projectSlug={manifest.projectSlug} active={section} />
      {section === 'map' ? <ProjectMapView manifest={manifest} /> : null}
      {section === 'build' ? <BuildProgressView manifest={manifest} /> : null}
      {section === 'milestones' ? <MilestoneListView manifest={manifest} /> : null}
      {section === 'tasks' ? <ClientTaskListView manifest={manifest} /> : null}
      {section === 'decisions' ? <DecisionListView manifest={manifest} /> : null}
      {section === 'activity' ? <ActivityFeedView manifest={manifest} /> : null}
      {section === 'behind' ? <BehindProjectView manifest={manifest} /> : null}
      {section === 'whats-next' ? (
        <p className="site00-app-home__moment">What happens next will surface here as your project progresses.</p>
      ) : null}
    </div>
  );
}
