export function ProjectIndexSkeletonGrid({ includeDesign = true }: { includeDesign?: boolean }) {
  return (
    <div className="site00-pidx-skeleton" aria-busy="true" aria-label="LOADING PROJECTS">
      {includeDesign ? <div className="site00-pidx-skeleton__design" /> : null}
      <div className="site00-pidx-skeleton__grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="site00-pidx-skeleton__card" />
        ))}
      </div>
    </div>
  );
}
