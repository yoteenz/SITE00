import type { DesignWorkspaceArtifactView } from '../../../../../shared/site00-design-workspace-production/types.js';

type Props = {
  artifact: DesignWorkspaceArtifactView;
  onClose: () => void;
};

export function DesignArtifactFullscreenViewer({ artifact, onClose }: Props) {
  return (
    <div className="tod-dcs-fullscreen" data-testid="design-artifact-fullscreen">
      <header className="tod-dcs-fullscreen__head">
        <div>
          <p className="tod-dcs-fullscreen__meta">
            {artifact.role ? `${artifact.role.toUpperCase()} · ` : ''}
            {artifact.viewport ? `${artifact.viewport} · ` : ''}
            {artifact.version ?? ''}
          </p>
          <h2 className="tod-dcs-fullscreen__title">{artifact.title}</h2>
          {artifact.subtitle ? <p className="tod-dcs-fullscreen__sub">{artifact.subtitle}</p> : null}
        </div>
        <button type="button" className="tod-dcs__close" onClick={onClose} aria-label="Close fullscreen">
          CLOSE
        </button>
      </header>
      <div className="tod-dcs-fullscreen__stage">
        {artifact.src ?
          <img src={artifact.src} alt="" className="tod-dcs-fullscreen__img" />
        : <p className="tod-dcs-lead">Artifact preview unavailable in this environment.</p>}
      </div>
    </div>
  );
}
