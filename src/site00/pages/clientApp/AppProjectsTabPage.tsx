import { useOutletContext } from 'react-router-dom';
import { SelfDirectedProjectsView } from '../../components/selfDirected/SelfDirectedViews';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppProjectsTabPage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  return <SelfDirectedProjectsView manifest={manifest} />;
}
