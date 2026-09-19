import { useOutletContext } from 'react-router-dom';
import { SelfDirectedProfileView } from '../../components/selfDirected/SelfDirectedViews';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppProfilePage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  return <SelfDirectedProfileView manifest={manifest} />;
}
