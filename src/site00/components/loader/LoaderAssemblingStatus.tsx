import { useEffect, useState } from 'react';

const DOT_CYCLE = ['', '.', '..', '...'] as const;

type LoaderAssemblingStatusProps = {
  active: boolean;
  /** Static label when not animating (complete / error). */
  label: string;
};

/** ASSEMBLING + cycling ellipsis — `.` → `..` → `...` → clear → repeat. */
export function LoaderAssemblingStatus({ active, label }: LoaderAssemblingStatusProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setStep((prev) => (prev + 1) % DOT_CYCLE.length);
    }, 420);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) {
    return <p className="site00-loader-copy__status">{label}</p>;
  }

  return (
    <p className="site00-loader-copy__status site00-loader-copy__status--animating" aria-label="Assembling">
      <span className="site00-loader-copy__status-label">ASSEMBLING</span>
      <span className="site00-loader-copy__status-dots" aria-hidden="true">
        {DOT_CYCLE[step]}
      </span>
    </p>
  );
}
