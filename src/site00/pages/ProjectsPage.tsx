import { ProjectViewModeProvider } from '../context/ProjectViewModeContext';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectIndexPage } from '../components/projectIndex/ProjectIndexPage';

export default function ProjectsPage() {
  return (
    <ProjectViewModeProvider role="FOUNDER">
      <EcosystemShell hidePageHeader>
        <ProjectIndexPage />
      </EcosystemShell>
    </ProjectViewModeProvider>
  );
}
