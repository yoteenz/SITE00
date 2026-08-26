import { useOutletContext } from 'react-router-dom';
import { ProjectPulseHome } from '../../components/clientApp/ClientAppViews';
import type { AppOutletContext } from './AppProjectLayout';

export default function AppHomePage() {
  const { manifest, reload } = useOutletContext<AppOutletContext>();
  return <ProjectPulseHome manifest={manifest} onReload={() => void reload()} />;
}
