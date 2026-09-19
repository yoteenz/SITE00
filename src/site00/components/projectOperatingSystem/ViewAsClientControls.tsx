import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';

export function ViewAsClientBanner() {
  const { isSimulatingClient, canToggle, resetToFounderView } = useProjectViewMode();

  if (!canToggle || !isSimulatingClient) return null;

  return (
    <div className="site00-pos-client-banner" role="status">
      <div className="site00-pos-client-banner__inner">
        <span className="site00-pos-client-banner__label">CLIENT VIEW</span>
        <span className="site00-pos-client-banner__message">
          YOU ARE PREVIEWING THIS PROJECT AS THE CLIENT
        </span>
        <button type="button" className="site00-pos-client-banner__return" onClick={resetToFounderView}>
          RETURN TO FOUNDER VIEW
        </button>
      </div>
    </div>
  );
}

export function ViewAsClientToggle() {
  const { viewMode, canToggle, toggleViewAsClient } = useProjectViewMode();

  if (!canToggle) return null;

  return (
    <div className="site00-pos-view-toggle">
      <span className="site00-pos-view-toggle__label">VIEW AS:</span>
      <button
        type="button"
        className={`site00-pos-view-toggle__btn${viewMode === 'FOUNDER' ? ' is-active' : ''}`}
        onClick={() => viewMode !== 'FOUNDER' && toggleViewAsClient()}
      >
        FOUNDER
      </button>
      <button
        type="button"
        className={`site00-pos-view-toggle__btn${viewMode === 'CLIENT' ? ' is-active' : ''}`}
        onClick={() => viewMode !== 'CLIENT' && toggleViewAsClient()}
      >
        CLIENT
      </button>
    </div>
  );
}
