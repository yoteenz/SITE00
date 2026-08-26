import { useLocation } from 'react-router-dom';
import { isAstralDebugMode } from '../../../../shared/site00-astral-world/referenceAssets.js';
import { useAstralAssets } from '../hooks/useAstralAssets';

export function AstralGenerationDebugPanel() {
  const { search } = useLocation();
  const show = isAstralDebugMode(search);
  const { assets, loaded, refresh } = useAstralAssets();

  if (!show) return null;

  const count = Object.keys(assets).length;

  const generateMissing = async () => {
    await fetch('/api/admin/site00-astral-world-generation?action=generate-missing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-missing' }),
    });
    void refresh();
  };

  return (
    <section className="aw-card aw-card--gold" style={{ margin: '0.75rem', fontSize: '0.72rem' }}>
      <h2 className="aw-display aw-display--section">Generation Factory (debug)</h2>
      <p className="aw-muted">{loaded ? `${count} generated slot(s) active` : 'Loading asset map…'}</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="aw-btn-secondary" onClick={() => void refresh()}>Refresh slots</button>
        <button type="button" className="aw-btn-primary" onClick={() => void generateMissing()}>Generate missing P0</button>
      </div>
    </section>
  );
}
