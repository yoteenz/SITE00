import { useEffect, useState } from 'react';

type LoaderAssemblingStatusProps = {
  active: boolean;
  /** Static label when not animating (complete / error). */
  label: string;
};

/** ASSEMBLING + cycling ellipsis — dots appear one-by-one, clear, repeat. */
export function LoaderAssemblingStatus({ active, label }: LoaderAssemblingStatusProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setDotCount(0);
      return;
    }
    const id = window.setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 380);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) {
    return <p className="site00-loader-copy__status">{label}</p>;
  }

  return (
    <p className="site00-loader-copy__status site00-loader-copy__status--animating" aria-label="Assembling">
      ASSEMBLING
      <span className="site00-loader-copy__status-dots" aria-hidden="true">
        {'.'.repeat(dotCount)}
      </span>
    </p>
  );
}
