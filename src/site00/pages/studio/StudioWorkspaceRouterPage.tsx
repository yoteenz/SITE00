import { useLocation, useParams } from 'react-router-dom';
import { StudioWorkspacePage } from './StudioWorkspacePages';

const SECTION_BY_SUFFIX: Record<string, { title: string; section: 'input' | 'operations' | 'blueprint' | 'assets' | 'reviews' | 'milestones' | 'activity' }> = {
  input: { title: 'CLIENT INPUT', section: 'input' },
  operations: { title: 'STUDIO OPERATIONS', section: 'operations' },
  blueprint: { title: 'BLUEPRINT', section: 'blueprint' },
  assets: { title: 'ASSETS', section: 'assets' },
  reviews: { title: 'REVIEWS', section: 'reviews' },
  milestones: { title: 'MILESTONES', section: 'milestones' },
  activity: { title: 'ACTIVITY', section: 'activity' },
};

export default function StudioWorkspaceRouterPage() {
  const { projectSlug = '' } = useParams();
  const { pathname } = useLocation();
  const suffix = pathname.split('/').pop() ?? '';
  const config = SECTION_BY_SUFFIX[suffix] ?? SECTION_BY_SUFFIX.input;

  return <StudioWorkspacePage projectSlug={projectSlug} title={config.title} section={config.section} />;
}
