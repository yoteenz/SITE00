import { useOutletContext } from 'react-router-dom';
import { SelfDirectedHomeView } from '../../components/selfDirected/SelfDirectedViews';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppHomePage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  return <SelfDirectedHomeView manifest={manifest} />;
}
