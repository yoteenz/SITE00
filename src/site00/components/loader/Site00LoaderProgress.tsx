type Site00LoaderProgressProps = {
  progress: number;
  assemblingLabel?: string;
  completionLabel?: string;
  isComplete?: boolean;
};

export function Site00LoaderProgress({
  progress,
  assemblingLabel = 'ASSEMBLING INTERFACE',
  completionLabel = 'ASSET VAULT READY',
  isComplete = false,
}: Site00LoaderProgressProps) {
  const value = Math.min(100, Math.max(0, Math.round(progress)));
  const label = isComplete || value >= 100 ? completionLabel : assemblingLabel;

  return (
    <div className="site00-loader-progress-block">
      <p className="site00-loader-progress-block__label">{label}</p>
      <div className="site00-loader-progress-block__row">
        <div
          className="site00-loader-progress-block__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-label={`${value}% complete`}
        >
          <div className="site00-loader-progress-block__fill" style={{ width: `${value}%` }} />
        </div>
        <span className="site00-loader-progress-block__pct">{value}%</span>
      </div>
    </div>
  );
}
