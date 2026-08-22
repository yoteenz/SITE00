import type { PreviewTunnelPayload } from '../../types/control';

type PreviewTunnelPanelProps = {
  preview: PreviewTunnelPayload;
};

export function PreviewTunnelPanel({ preview }: PreviewTunnelPanelProps) {
  const unavailable = !preview.url;

  return (
    <section className="site00-preview-tunnel" aria-labelledby="preview-tunnel-title">
      <header className="site00-preview-tunnel__head">
        <p className="site00-preview-tunnel__kicker">DEVELOPMENT</p>
        <h2 id="preview-tunnel-title" className="site00-preview-tunnel__title">{preview.label}</h2>
        <p className="site00-preview-tunnel__detail">
          {unavailable
            ? 'Tunnel URL unavailable — start site00-preview-tunnel on the cloud agent or set SITE00_CLOUDFLARE_TUNNEL_HOSTNAME.'
            : 'Live Vite preview on port 5174 via Cloudflare tunnel.'}
        </p>
      </header>
      {preview.url ? (
        <div className="site00-preview-tunnel__actions">
          <a href={preview.url} target="_blank" rel="noopener noreferrer" className="site00-preview-tunnel__link">
            OPEN PREVIEW →
          </a>
          <code className="site00-preview-tunnel__hostname">{preview.hostname ?? preview.url}</code>
          <span className="site00-preview-tunnel__source">SOURCE · {preview.source.toUpperCase()}</span>
        </div>
      ) : null}
    </section>
  );
}
