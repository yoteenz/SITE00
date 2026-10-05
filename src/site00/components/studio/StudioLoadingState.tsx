export function StudioLoadingState() {
  return (
    <div className="site00-studio-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="site00-studio-loading__spine">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="site00-studio-loading__node" />
        ))}
      </div>
      <p className="site00-studio-loading__label">ACQUIRING STUDIO STATE…</p>
    </div>
  );
}
