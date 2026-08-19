type LoaderAssemblingStatusProps = {
  active: boolean;
  /** Static label when not animating (complete / error). */
  label: string;
};

/** ASSEMBLING + cycling ellipsis — `.` → `..` → `...` → clear → repeat (CSS width clip). */
export function LoaderAssemblingStatus({ active, label }: LoaderAssemblingStatusProps) {
  if (!active) {
    return <p className="site00-loader-copy__status">{label}</p>;
  }

  return (
    <p className="site00-loader-copy__status site00-loader-copy__status--animating" aria-label="Assembling">
      <span className="site00-loader-copy__status-label">ASSEMBLING</span>
      <span className="site00-loader-copy__status-dots" aria-hidden="true">
        <span className="site00-loader-copy__status-dots-track">...</span>
      </span>
    </p>
  );
}
