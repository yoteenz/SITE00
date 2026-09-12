/**
 * P0.VR.REPLICATION.3D boundary — SHOW RENDER ROOTS debug overlay (?renderRootsDebug=1).
 */

import { useSearchParams } from 'react-router-dom';
import '../../styles/site00-render-roots-overlay.css';

export function RenderRootsDebugOverlay() {
  const [params] = useSearchParams();
  if (params.get('renderRootsDebug') !== '1') return null;

  return (
    <div className="site00-render-roots-overlay" aria-hidden="true">
      <p className="site00-render-roots-overlay__legend">SHOW RENDER ROOTS · shell · content · hero · mount</p>
      <div className="site00-render-roots-overlay__shell" data-overlay="shell" />
      <div className="site00-render-roots-overlay__content" data-overlay="content-root" />
      <div className="site00-render-roots-overlay__hero" data-overlay="hero-media" />
      <div className="site00-render-roots-overlay__mount" data-overlay="twin-mount" />
    </div>
  );
}
