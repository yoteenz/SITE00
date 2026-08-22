type StudioErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function StudioErrorState({ message, onRetry }: StudioErrorStateProps) {
  return (
    <div className="site00-studio-error" role="alert">
      <p className="site00-studio-error__title">{message}</p>
      {onRetry ? (
        <button type="button" className="site00-studio-panel__cta site00-studio-error__retry" onClick={onRetry}>
          TRY AGAIN →
        </button>
      ) : null}
    </div>
  );
}
