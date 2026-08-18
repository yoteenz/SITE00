import { Site00LoaderAnimation } from '../loader/Site00LoaderAnimation';

type Site00OrbitalMarkProps = {
  className?: string;
  reducedMotion?: boolean;
};

/** Approved red technical/orbital graphic — reuses loader geometry asset. */
export function Site00OrbitalMark({ className = '', reducedMotion = false }: Site00OrbitalMarkProps) {
  return (
    <div className={`site00-orbital-mark ${className}`.trim()} aria-hidden="true">
      <Site00LoaderAnimation reducedMotion={reducedMotion} />
    </div>
  );
}
