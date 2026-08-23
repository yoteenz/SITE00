import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { SITE00_ROUTES } from '../config/routes';

type ModuleRow = {
  moduleId: string;
  requirement: string;
  lifecycle: string;
  label?: string;
};

type ManifestResponse = {
  manifest: {
    manifestId: string;
    fingerprint: string;
    experienceClass: string;
    modules: ModuleRow[];
  };
  readiness: string;
  formationGate: { allowed: boolean; reason: string | null };
};

export default function ProjectSetupPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [state, setState] = useState<ManifestResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await site00ProjectsApi.projectIntelligenceManifestGet(projectSlug);
    setState(res as unknown as ManifestResponse);
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const compile = async () => {
    setBusy(true);
    try {
      await site00ProjectsApi.projectIntelligenceManifestCompile(projectSlug);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  if (!state?.manifest) {
    return (
      <div className="site00-project-setup">
        <h1>PROJECT SETUP</h1>
        <p>Compile intelligence intake manifest for {projectSlug}.</p>
        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void compile()}>
          COMPILE MANIFEST
        </button>
      </div>
    );
  }

  const required = state.manifest.modules.filter((m) => m.requirement === 'REQUIRED');
  const complete = required.filter((m) => m.lifecycle === 'COMPLETE' || m.lifecycle === 'READY');

  return (
    <div className="site00-project-setup">
      <p className="site00-label-red">PROJECT SETUP</p>
      <h1 className="site00-project-setup__title">INTELLIGENCE INTAKE</h1>
      <p className="site00-project-setup__sub">
        YOUR PROJECT IS OPEN. WE KNOW WHAT YOU PURCHASED. NOW WE NEED THE INTELLIGENCE REQUIRED TO BEGIN.
      </p>
      <p>
        {complete.length} OF {required.length} REQUIRED MODULES COMPLETE · READINESS: {state.readiness.replace(/_/g, ' ')}
      </p>

      <ul className="site00-project-setup__modules">
        {state.manifest.modules.map((mod) => (
          <li key={mod.moduleId} className="site00-project-setup__module">
            <strong>{mod.moduleId.replace(/_/g, ' ')}</strong>
            <span>{mod.requirement}</span>
            <span>{mod.lifecycle}</span>
          </li>
        ))}
      </ul>

      <div className="site00-project-setup__actions">
        <Link to={SITE00_ROUTES.projectDetail.replace(':projectSlug', projectSlug)} className="site00-btn">
          BACK TO PROJECT
        </Link>
        <button type="button" className="site00-btn" disabled={busy} onClick={() => void compile()}>
          REFRESH MANIFEST
        </button>
      </div>
    </div>
  );
}
