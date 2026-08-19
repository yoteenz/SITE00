type LoaderAssemblingStatusProps = {
  active: boolean;
  /** Static label when not animating (complete / error). */
  label: string;
};

/** ASSEMBLING + cycling ellipsis — `.` → `..` → `...` → clear → repeat (CSS-driven). */
export function LoaderAssemblingStatus({ active, label }: LoaderAssemblingStatusProps) {
  if (!active) {
    return <p className="site00-loader-copy__status">{label}</p>;
  }

  return (
    <p className="site00-loader-copy__status site00-loader-copy__status--animating" aria-label="Assembling">
      <span className="site00-loader-copy__status-label">ASSEMBLING</span>
      <span className="site00-loader-copy__status-dots" aria-hidden="true">
        <span className="site00-loader-copy__status-dot site00-loader-copy__status-dot--1">.</span>
        <span className="site00-loader-copy__status-dot site00-loader-copy__status-dot--2">.</span>
        <span className="site00-loader-copy__status-dot site00-loader-copy__status-dot--3">.</span>
      </span>
    </p>
  );
}
